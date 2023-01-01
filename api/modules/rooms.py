import logging
import os
import random
import spotipy
from dotenv import load_dotenv
from flask import Blueprint, redirect, request, session, url_for, Response
from functions import spotify, util
import json
import spotipy
from functools import wraps
import traceback
import models

users_collection = models.users_collection
rooms_collection = models.rooms_collection
load_dotenv(override=True)
logger = logging.getLogger("vibecheck")

room = Blueprint("rooms", __name__, url_prefix="/api")

sp_oauth = spotify.sp_oauth

NON_PUBLIC_ROOM_DATA = ["owner", "guests"]


def is_request_authorized(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            user_id = request.headers["Authorization"]
        except KeyError:
            logger.error("User not authorized")
            return 500, "User not authorized"
        user = users_collection.find_one({"_id": user_id})
        if not user:
            logger.error("User not found")
            return 500, "User not found"
        return f(*args, **kwargs)

    return decorated_function


def is_room_owner(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request:
            return f(*args, **kwargs)
        try:
            user_id = request.headers["Authorization"]
        except KeyError:
            logger.error("User not authorized")
            return 500, "User not authorized"
        user = users_collection.find_one({"_id": user_id})
        if not user:
            logger.error("User not found")
            return 500, "User not found"
        room_id = kwargs["room_id"]
        room = rooms_collection.find_one({"_id": room_id})
        if room["owner"] != user_id:
            logger.error("User not owner")
            return 500, "User not owner"
        return f(*args, **kwargs)

    return decorated_function


def room_exists(room_id):
    room = rooms_collection.find_one({"_id": room_id})
    if not room:
        logger.error("Room not found")
        return False
    return True


@room.route("/rooms/create", methods=["POST"])
def create_room(user_id=None):
    if not request:
        user_id = user_id
    else:
        try:
            user_id = request.headers["Authorization"]
        except KeyError:
            logger.error("User not authorized")
            return 500, "User not authorized"
    user = users_collection.find_one({"_id": user_id})
    if not user:
        logger.error("User not found")
        return 500, "User not found"

    if rooms_collection.find_one({"owner": user_id}):
        logger.error("User already owns a room")
        return 500, "User already owns a room"

    room_id = os.urandom(16).hex()
    data = {
        "_id": room_id,
        "owner": user_id,
        "guests": [],
        "queue": [],
        "state": {
            "active": False,
            "playing": False,
            "progress": 0,
            "track": None,
            "volume": 50,
            "progress_last_updated": 0,
        },
    }
    rooms_collection.insert_one(data)
    logger.info(f"Room {room_id} created")
    if request:
        return "Room created", 200
    return "Room created"


@room.route("/rooms/<room_id>", methods=["GET"])
def get_room(room_id):
    if not request:
        return rooms_collection.find_one({"_id": room_id})
    try:
        auth = request.headers["Authorization"]
        room = rooms_collection.find_one({"_id": room_id})
        if not room:
            return 500, "Room not found"
        if room["owner"] == auth:
            return room
        if auth in room["guests"]:
            return {k: v for k, v in room.items() if k not in NON_PUBLIC_ROOM_DATA}
        return 500, "User not authorized"
    except KeyError:
        return {k: v for k, v in room.items() if k not in NON_PUBLIC_ROOM_DATA}


@room.route("/rooms/<room_id>/update_state", methods=["PATCH"])
def update_room_state(room_id, data=None):
    if not room_exists(room_id):
        return 500, "Room not found"
    states = ["active", "playing", "progress", "track", "volume"]
    try:
        data = request.json
    except:
        pass
    if not data:
        return 500, "No data"
    for key in data:
        if key not in states:
            return 500, "Invalid state: {}".format(key)
    rooms_collection.update_one({"_id": room_id}, {"$set": {"state": data}})
    if request:
        return 200, "Success"
    return rooms_collection.find_one({"_id": room_id})["state"]


@room.route("/rooms/<room_id>/add_to_queue", methods=["POST"])
def add_to_queue(room_id, track_id=None, user_id=None):
    if not room_exists(room_id):
        return Response("Room not found", 500)
    try:
        if request:
            track_id = request.json["track_id"]
            user_id = request.headers["Authorization"]
        else:
            track_id = track_id
            user_id = user_id

        queue = rooms_collection.find_one({"_id": room_id})["queue"]
        try:
            for track in queue:
                if track["id"] == track_id:
                    return "Track already in queue"
        except:
            logger.error("No queue")
        token = util.decrypt(
            users_collection.find_one(
                {"_id": rooms_collection.find_one({"_id": room_id})["owner"]}
            )["token"]
        )
        sp = spotipy.Spotify(auth=token["access_token"])
        track = sp.track(track_id)
        rooms_collection.update_one(
            {"_id": room_id},
            {
                "$push": {
                    "queue": {
                        "track": track,
                        "votes": 1,
                        "added_by": user_id,
                        "voters": [user_id],
                        "position": len(queue) + 1,
                    }
                }
            },
        )
        if request:
            return "Success"
        return rooms_collection.find_one({"_id": room_id})["queue"]
    except Exception as e:
        logger.error(e)
        return 500, str(e)


@room.route("/rooms/<room_id>/remove_from_queue", methods=["POST"])
@is_room_owner
def remove_from_queue(room_id, track_id, user_id=None):
    if not room_exists(room_id):
        return 500, "Room not found"
    if request:
        track_id = request.json["track_id"]
        user_id = request.headers["Authorization"]
    else:
        track_id = track_id
        user_id = user_id
    queue = rooms_collection
    for track in queue:
        if track["id"] == track_id:
            rooms_collection.update_one(
                {"_id": room_id},
                {
                    "$pull": {
                        "queue": {
                            "track": track,
                        }
                    }
                },
            )
            if request:
                return 200, "Success"
            return rooms_collection
    return 500, "Track not in queue"


@room.route("/rooms/<room_id>/upvote", methods=["POST"])
def upvote(room_id, track_id=None, user_id=None):
    try:
        if not room_exists(room_id):
            return Response("Room not found", status=500)
        if request:
            track_id = request.json["track_id"]

            user_id = request.headers["Authorization"]

        else:
            track_id = track_id
            user_id = user_id
        if (
            rooms_collection.find_one({"_id": room_id, "queue.track.id": track_id})
            is None
        ):
            return Response("Track not in queue", status=500)
        if (
            rooms_collection.find_one(
                {"_id": room_id, "queue.track.id": track_id, "queue.voters": user_id}
            )
            is not None
        ):
            return Response("User has already voted", status=500)

        rooms_collection.update_one(
            {
                "_id": room_id,
                "queue.track.id": track_id,
            },
            {
                "$inc": {
                    "queue.$.votes": 1,
                },
                "$push": {
                    "queue.$.voters": user_id,
                },
            },
        )

        queues = rooms_collection.find_one({"_id": room_id})["queue"]
        queues = sorted(queues, key=lambda k: k["votes"], reverse=True)
        for i, queue in enumerate(queues):
            rooms_collection.update_one(
                {
                    "_id": room_id,
                    "queue.track.id": queue["track"]["id"],
                },
                {
                    "$set": {
                        "queue.$.position": i + 1,
                    }
                },
            )

        if request:
            return Response("Success", status=200)
        return rooms_collection
    except Exception as e:
        logger.error(traceback.format_exc())
        if request:
            return Response(str(e), status=500)
        return str(e)

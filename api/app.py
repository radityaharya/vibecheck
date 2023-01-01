import datetime
import json
from flask import Flask, request, session, redirect, url_for
from flask_socketio import SocketIO, join_room, leave_room, emit
import threading

import os
from dotenv import load_dotenv
from functions import util
from functions import spotify
import logging
from rich.logging import RichHandler
from cryptography.fernet import Fernet
import models

from modules.auth.spotify import auth as spotify_auth
from modules import rooms as room_module

load_dotenv(override=True)

app = Flask(__name__)

app.register_blueprint(spotify_auth)
app.register_blueprint(room_module.room)

socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode="threading",
    engineio_logger=False,
    logger=False,
    ping_timeout=10,
    ping_interval=5,
)


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(lineno)s - %(funcName)s ] %(message)s",
    handlers=[logging.FileHandler(".log"), RichHandler()],
)

logger = logging.getLogger("vibecheck")

users_collection = models.users_collection
rooms_collection = models.rooms_collection

sp_oauth = spotify.sp_oauth


@socketio.on("connect")
def test_connect():
    logger.info("Client connected")


@socketio.on("join_room")
def handle_join_room(json):
    logger.info(f"{json['user']} joined {json['room']}")
    rooms_collection.update_one(
        {"_id": json["room"]},
        {"$addToSet": {"guests": {"_id": json["user"], "sid": request.sid}}},
    )
    join_room(json["room"])


@socketio.on("disconnect")
def test_disconnect():
    logger.info("Client disconnected")
    try:
        rooms_collection.update_one(
            {"guests.sid": request.sid},
            {"$pull": {"guests": {"sid": request.sid}}},
        )
    except Exception as e:
        logger.error(e)


def broadcast_room_info_to_all_loop():
    while True:
        socketio.sleep(1)
        rooms = rooms_collection.find()
        for room in rooms:
            room_id = room["_id"]
            logger.debug(f"broadcasting room info to {room_id}")
            socketio.emit(
                "room_info",
                {"data": json.dumps(room_module.get_room(room_id))},
                room=room_id,
            )


def update_room_state_loop():
    while True:
        socketio.sleep(1)
        rooms = rooms_collection.find()
        for room in rooms:
            owner_id = room["owner"]
            room_id = room["_id"]
            access_token = util.decrypt(
                users_collection.find_one({"_id": owner_id})["token"]
            )

            try:
                latest_update = room["state"]["last_updated"]  # in timestamp
                progress_last_updated = room["state"]["progress_last_updated"]
                playing = room["state"]["playing"]

                now = datetime.datetime.now().timestamp()
                new_progress = (
                    room["state"]["progress"] + (now - progress_last_updated) * 1000
                )
                track_percent_complete = round(
                    new_progress / room["state"]["track_length"] * 100, 2
                )
                if playing:
                    rooms_collection.update_one(
                        {"_id": room_id},
                        {
                            "$set": {
                                "state.progress": new_progress,
                                "state.progress_last_updated": now,
                                "state.percentage": track_percent_complete,
                            }
                        },
                    )

                if now - latest_update < 2:
                    logger.info(f"Room {room_id} is up to date")
                    continue
            except Exception as e:
                logger.error(e)

            logger.debug(f"Updating room state for room {room_id}")
            current_track = spotify.get_current_playback(access_token)

            if current_track:
                state = {
                    "playing": True,
                    "track": current_track["item"],
                    "progress": current_track["progress_ms"],
                    "track_length": current_track["item"]["duration_ms"],
                    "percentage": track_percent_complete,
                    "volume": int(current_track["device"]["volume_percent"]),
                    "progress_last_updated": datetime.datetime.now().timestamp(),
                }
                if current_track["is_playing"]:
                    state["playing"] = True
                else:
                    state["playing"] = False

            else:
                logger.info("No current track")
                state = {
                    "playing": False,
                    "track": None,
                    "progress": 0,
                    "volume": 0,
                    "progress_last_updated": datetime.datetime.now().timestamp(),
                }
            state["last_updated"] = datetime.datetime.now().timestamp()
            rooms_collection.update_one({"_id": room_id}, {"$set": {"state": state}})
            logger.debug(f"Updated room state for room {room_id}")
            rooms.close()
            socketio.sleep(1)


if __name__ == "__main__":
    try:
        t2 = threading.Thread(target=broadcast_room_info_to_all_loop)
        t2.start()
        t3 = threading.Thread(target=update_room_state_loop)
        t3.start()

        if os.getenv("ENCRYPTION_KEY"):
            key = os.getenv("ENCRYPTION_KEY")
            key = bytes(key, "utf-8")
        else:
            key = Fernet.generate_key()
            with open(".env", "a") as f:
                f.write(f'\nENCRYPTION_KEY= "{key.decode()}"')
        app.secret_key = os.getenv("ENCRYPTION_KEY")
        socketio.run(app, host="0.0.0.0", port=5000, debug=False, use_reloader=True)
    except Exception as e:
        logger.error(e)
        logger.info("Exiting")
        exit(1)

import logging
import os

import spotipy
from dotenv import load_dotenv
from flask import Blueprint, redirect, request, session, url_for

from functions import spotify, util

load_dotenv(override=True)

import models

users_collection = models.users_collection

auth = Blueprint("auth", __name__, url_prefix="/api")
logger = logging.getLogger("vibecheck")

sp_oauth = spotify.sp_oauth


@auth.route("/login")
def login():
    session.pop("auth", None)
    return redirect(sp_oauth.get_authorize_url())


@auth.route("/logout")
def logout():
    session.pop("auth", None)
    return redirect(
        url_for("index"),
    )


@auth.route("/callback")
def callback():
    code = request.args["code"]
    token = sp_oauth.get_access_token(code, as_dict=True, check_cache=False)
    user_info = spotify.get_user_info(token)
    logger.info(f"{user_info['id']} calledback")
    if not users_collection.find_one({"_id": user_info["id"]}):
        users_collection.insert_one(
            {
                "_id": user_info["id"],
                "user_id": user_info["id"],
                "token": util.encrypt(token),
            }
        )
    return redirect("/")

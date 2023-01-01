import datetime
import spotipy
import logging
import os
from dotenv import load_dotenv
from functools import wraps
from .util import encrypt, decrypt

import requests

requests_session = requests.Session()
load_dotenv(override=True)

import models

users_collection = models.users_collection

logger = logging.getLogger("vibecheck")

# spotify scopes  https://developer.spotify.com/documentation/general/guides/authorization/scopes/
SCOPE = "user-read-private user-read-playback-state user-modify-playback-state user-library-read user-top-read user-library-modify playlist-read-private playlist-modify-private playlist-read-collaborative playlist-modify-public"
sp_oauth = spotipy.oauth2.SpotifyOAuth(
    scope=SCOPE,
    client_id=os.environ.get("SPOTIFY_CLIENT_ID"),
    client_secret=os.environ.get("SPOTIFY_CLIENT_SECRET"),
    redirect_uri="http://localhost:3000/api/callback",
    cache_handler=None,
)


def check_and_refresh_token(func):
    """
    It takes a function and returns a function that checks if the user's access token is expired and
    refreshes it if it is.

    Args:
      func: The function that you want to wrap.

    Returns:
      A function that checks if the user's access token is expired and refreshes it if it is.
    """

    @wraps(func)
    def wrapper(*args, **kwargs):
        token = args[0]
        if token["expires_at"] - datetime.datetime.now().timestamp() < 60:
            logger.debug("Refreshing token")
            token = sp_oauth.refresh_access_token(token["refresh_token"])
            users_collection.update_one(
                {"user_id": get_user_info(token)["id"]},
                {"$set": {"token": encrypt(token)}},
            )
        return func(*args, **kwargs)

    return wrapper


@check_and_refresh_token
def get_user_info(access_token):
    """
    It takes an access token and returns the user's information

    Args:
      access_token: The access token that we got from the previous step.

    Returns:
      A dictionary with the user's information.
    """
    sp = spotipy.Spotify(auth=access_token["access_token"])
    logger.debug("Getting user info for {}".format(sp.current_user()["display_name"]))
    return sp.current_user()


def get_640_image(list_of_images):
    """
    It takes a list of images and returns the URL of the image that has a width of 640 pixels

    Args:
      list_of_images: a list of dictionaries, each dictionary containing information about an image.

    Returns:
      The url of the image with a width of 640.
    """
    for image in list_of_images:
        if image["width"] == 640:
            return image["url"]


@check_and_refresh_token
def get_user_currently_playing(access_token, raw=False):
    """
    It takes an access token, uses it to create a Spotify object, then uses that object to get the
    currently playing track. If there is a currently playing track, it returns a dictionary with the
    track's name, artist, album, album cover, track id, and track url. If there is no currently playing
    track, it returns a dictionary with empty strings for all of the values

    Args:
      access_token: The access token that you get from the Spotify API.

    Returns:
      A dictionary with the following keys:
        track_name
        artist_name
        album_name
        album_cover
        track_id
        track_url
        datetime_added
    """
    sp = spotipy.Spotify(auth=access_token["access_token"])
    data = sp.current_user_playing_track()
    if raw:
        return data
    datetime_added = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%fZ")
    if data:
        currently_playing = {
            "track_name": data["item"]["name"],
            "artist_name": data["item"]["artists"][0]["name"],
            "album_name": data["item"]["album"]["name"],
            "album_cover": get_640_image(data["item"]["album"]["images"]),
            "track_id": data["item"]["id"],
            "track_url": data["item"]["external_urls"]["spotify"],
            "datetime_added": datetime_added,
        }
    else:
        currently_playing = {
            "track_name": "",
            "artist_name": "",
            "album_name": "",
            "album_cover": "",
            "track_id": "",
            "track_url": "",
            "datetime_added": datetime_added,
        }
    logger.info(
        "Got currently playing for {}".format(sp.current_user()["display_name"])
    )
    return currently_playing


@check_and_refresh_token
def get_current_playback(access_token):
    sp = spotipy.Spotify(auth=access_token["access_token"])
    data = sp.current_playback()
    return data


@check_and_refresh_token
def get_user_queue(access_token):
    """
    It takes an access token, uses it to create a Spotify object, then uses that object to get the
    user's queue. It returns a list of dictionaries, each dictionary containing information about a
    track in the user's queue.

    Args:
      access_token: The access token that you get from the Spotify API.

    Returns:
      A list of dictionaries, each dictionary containing information about a track in the user's queue.
      The dictionary has the following keys:
        track_name
        artist_name
        album_name
        album_cover
        track_id
        track_url
        datetime_added
    """
    sp = spotipy.Spotify(auth=access_token["access_token"])
    queue = []
    data = sp.queue()
    return data

from typing import List, Dict, Any
import pymongo
import os

client = pymongo.MongoClient(os.environ.get("MONGO_URI"))

users_collection = client.vibecheck.users
rooms_collection = client.vibecheck.rooms


class RoomDTO:
    def __init__(self, name: str, owner: "UserDTO", track_queue: List[Dict[str, Any]]):
        self.name = name
        self.owner = owner
        self.track_queue = track_queue

    def to_dict(self):
        return {
            "name": self.name,
            "owner": self.owner.to_dict(),
            "track_queue": self.track_queue,
        }


class UserDTO:
    def __init__(self, name: str, access_token: str = None):
        self.name = name
        self.access_token = access_token

    def to_dict(self):
        return {"name": self.name, "access_token": self.access_token}

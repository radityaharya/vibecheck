import json
import os
from cryptography.fernet import Fernet
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("vibecheck")


def encrypt(data):
    if os.getenv("ENCRYPTION_KEY"):
        key = os.getenv("ENCRYPTION_KEY")
        key = bytes(key, "utf-8")
    else:
        key = Fernet.generate_key()
        with open(".env", "a") as f:
            f.write(f'\nENCRYPTION_KEY= "{key.decode()}"')
    fernet = Fernet(key)
    if isinstance(data, dict):
        data = json.dumps(data)
    return fernet.encrypt(data.encode())


def decrypt(data):
    key = os.getenv("ENCRYPTION_KEY")
    key = bytes(key, "utf-8")

    fernet = Fernet(key)
    decrypted_data = fernet.decrypt(data).decode()

    if decrypted_data.startswith("{"):
        decrypted_data = json.loads(decrypted_data)
    return decrypted_data

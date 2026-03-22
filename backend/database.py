"""database.py — MongoDB-backed database layer.

This module manages the connection to the production MongoDB instance.
"""

import os
from dotenv import load_dotenv
from pymongo import MongoClient, errors

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "vglug_job_portal")

_db_instance = None


def connect_db():
    global _db_instance
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.server_info()  # validate connection
        _db_instance = client[MONGO_DB_NAME]
        print(f"✅ MongoDB connected: {MONGO_URI} (DB: {MONGO_DB_NAME})")
    except errors.ServerSelectionTimeoutError as exc:
        raise RuntimeError(f"Failed to connect to MongoDB at {MONGO_URI}. {exc}") from exc


def get_db():
    if _db_instance is None:
        raise RuntimeError("Database not connected. Call connect_db() first.")
    return _db_instance


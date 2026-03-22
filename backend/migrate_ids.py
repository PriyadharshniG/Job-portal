import os
from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "vglug_job_portal")

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client[MONGO_DB_NAME]
    print("Migrating ObjectIds to strings in all collections...")
    for col_name in db.list_collection_names():
        col = db[col_name]
        docs = list(col.find())
        count = 0
        for doc in docs:
            if isinstance(doc["_id"], ObjectId):
                old_id = doc["_id"]
                new_doc = doc.copy()
                new_doc["_id"] = str(old_id)
                col.delete_one({"_id": old_id})
                col.insert_one(new_doc)
                count += 1
        print(f"Collection {col_name}: Migrated {count} documents.")
    print("Migration complete.")
except Exception as e:
    print(f"Migration error (this is okay if DB is inactive): {e}")

"""
database.py — TinyDB-based database layer.
Provides a MongoDB-like API so routers need minimal changes.
Data is stored in db.json in the backend folder.
No MongoDB server required!
"""

import os
import re
import uuid
from tinydb import TinyDB, Query
from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.path.join(os.path.dirname(__file__), "db.json")

_db_instance = None


def connect_db():
    global _db_instance
    # Use plain JSONStorage — every write goes directly to disk (no caching)
    _db_instance = TinyDB(DB_PATH)
    print(f"✅ TinyDB connected: {DB_PATH}")


def get_db():
    return _db_instance


# ── MongoDB-like Collection Wrapper ──────────────────────────────────────────

class Collection:
    """Wraps a TinyDB table to mimic PyMongo collection API."""

    def __init__(self, table):
        self._table = table

    def _match(self, doc, query_dict):
        """Return True if doc matches the query dict (supports basic mongo operators)."""
        for key, val in query_dict.items():
            if key == "$or":
                if not any(self._match(doc, sub) for sub in val):
                    return False
            elif key == "$and":
                if not all(self._match(doc, sub) for sub in val):
                    return False
            elif isinstance(val, dict):
                doc_val = doc.get(key)
                for op, operand in val.items():
                    if op == "$regex":
                        flags = 0
                        options = val.get("$options", "")
                        if "i" in options:
                            flags = re.IGNORECASE
                        if not isinstance(doc_val, str):
                            return False
                        if not re.search(operand, doc_val, flags):
                            return False
                    elif op == "$elemMatch":
                        if not isinstance(doc_val, list):
                            return False
                        matched = False
                        for elem in doc_val:
                            if self._match({"__elem__": elem}, {"__elem__": operand}):
                                matched = True
                                break
                        # Handle regex elemMatch
                        if not matched:
                            for sub_op, sub_val in operand.items():
                                if sub_op == "$regex":
                                    flags = 0
                                    options = operand.get("$options", "")
                                    if "i" in options:
                                        flags = re.IGNORECASE
                                    matched = any(
                                        isinstance(e, str) and re.search(sub_val, e, flags)
                                        for e in (doc_val if isinstance(doc_val, list) else [])
                                    )
                        if not matched:
                            return False
                    elif op == "$options":
                        pass  # handled together with $regex
                    elif op == "$set":
                        pass  # update operator, not query
                    else:
                        pass
            else:
                if doc.get(key) != val:
                    return False
        return True

    def _filter(self, query_dict, projection=None):
        """Return list of docs matching query_dict, optionally projecting fields."""
        results = []
        for doc in self._table.all():
            if self._match(doc, query_dict):
                if projection:
                    filtered = {"_id": doc.get("_id", "")}
                    exclude = [k for k, v in projection.items() if v == 0]
                    include = [k for k, v in projection.items() if v == 1]
                    if include:
                        filtered = {k: doc[k] for k in include if k in doc}
                        filtered["_id"] = doc.get("_id", "")
                    elif exclude:
                        filtered = {k: v for k, v in doc.items() if k not in exclude}
                    results.append(filtered)
                else:
                    results.append(dict(doc))
        return results

    def find_one(self, query_dict=None, projection=None):
        if query_dict is None:
            query_dict = {}
        results = self._filter(query_dict, projection)
        return results[0] if results else None

    def find(self, query_dict=None, projection=None):
        if query_dict is None:
            query_dict = {}
        return _Cursor(self._filter(query_dict, projection))

    def insert_one(self, doc):
        doc = dict(doc)
        if "_id" not in doc:
            doc["_id"] = str(uuid.uuid4())
        self._table.insert(doc)
        return _InsertResult(doc["_id"])

    def insert_many(self, docs):
        for doc in docs:
            self.insert_one(doc)

    def update_one(self, query_dict, update_dict):
        matches = self._filter(query_dict)
        if not matches:
            return
        target = matches[0]
        target_id = target["_id"]
        if "$set" in update_dict:
            for k, v in update_dict["$set"].items():
                target[k] = v
        else:
            target.update(update_dict)
        Q = Query()
        self._table.update(target, Q._id == target_id)

    def delete_one(self, query_dict):
        matches = self._filter(query_dict)
        if not matches:
            return
        target_id = matches[0]["_id"]
        Q = Query()
        self._table.remove(Q._id == target_id)

    def count_documents(self, query_dict=None):
        if query_dict is None:
            query_dict = {}
        return len(self._filter(query_dict))


class _InsertResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class _Cursor:
    """Mimics PyMongo cursor with sort/skip/limit chaining."""

    def __init__(self, docs):
        self._docs = docs
        self._sort_key = None
        self._sort_dir = 1
        self._skip_n = 0
        self._limit_n = None

    def sort(self, key, direction=1):
        self._sort_key = key
        self._sort_dir = direction
        return self

    def skip(self, n):
        self._skip_n = n
        return self

    def limit(self, n):
        self._limit_n = n
        return self

    def __iter__(self):
        docs = list(self._docs)
        if self._sort_key:
            reverse = self._sort_dir == -1
            docs.sort(key=lambda d: str(d.get(self._sort_key, "")), reverse=reverse)
        docs = docs[self._skip_n:]
        if self._limit_n:
            docs = docs[:self._limit_n]
        return iter(docs)


# ── DB proxy that returns Collection objects by attribute access ──────────────

class _DBProxy:
    """Allows db.collection_name style access."""

    def __getattr__(self, name):
        if _db_instance is None:
            raise RuntimeError("Database not connected. Call connect_db() first.")
        return Collection(_db_instance.table(name))


# Patch get_db to return the proxy so routers can do db.vgulg_users.find_one(...)
_proxy = _DBProxy()


def get_db():
    return _proxy

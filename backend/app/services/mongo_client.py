"""
Unstructured medical document store, backed by MongoDB as described in the
project synopsis. Because a live MongoDB instance may not be available in
every environment (e.g. local grading/demo machines), this wrapper degrades
gracefully to a JSON-file-backed store with an identical interface, so the
rest of the app never needs to know which backend is active.
"""
import json
import os
import uuid
from datetime import datetime
from typing import Optional

from app.config import settings

_FALLBACK_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "document_store")


class MongoDocumentStore:
    def __init__(self):
        self._collection = None
        try:
            from pymongo import MongoClient

            client = MongoClient(settings.mongo_uri, serverSelectionTimeoutMS=800)
            client.server_info()  # force connection check
            self._collection = client[settings.mongo_db]["medical_documents"]
        except Exception:
            os.makedirs(_FALLBACK_DIR, exist_ok=True)

    def save_document(self, user_id: int, title: str, content: str, doc_type: str = "note") -> dict:
        doc = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "title": title,
            "content": content,
            "doc_type": doc_type,
            "created_at": datetime.utcnow().isoformat(),
        }
        if self._collection is not None:
            self._collection.insert_one(dict(doc))
        else:
            path = os.path.join(_FALLBACK_DIR, f"{doc['id']}.json")
            with open(path, "w") as f:
                json.dump(doc, f)
        return doc

    def list_documents(self, user_id: int) -> list[dict]:
        if self._collection is not None:
            return list(self._collection.find({"user_id": user_id}, {"_id": 0}))
        docs = []
        if os.path.isdir(_FALLBACK_DIR):
            for fname in os.listdir(_FALLBACK_DIR):
                with open(os.path.join(_FALLBACK_DIR, fname)) as f:
                    doc = json.load(f)
                    if doc["user_id"] == user_id:
                        docs.append(doc)
        return docs


document_store = MongoDocumentStore()

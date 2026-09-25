import json
from typing import Dict, List

from fastapi import WebSocket


class ConnectionManager:
    """Tracks active WebSocket connections keyed by user id and broadcasts
    real-time workflow / claim / prior-authorization status events."""

    def __init__(self) -> None:
        self.active: Dict[int, List[WebSocket]] = {}

    async def connect(self, user_id: int, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active.setdefault(user_id, []).append(websocket)

    def disconnect(self, user_id: int, websocket: WebSocket) -> None:
        if user_id in self.active and websocket in self.active[user_id]:
            self.active[user_id].remove(websocket)
            if not self.active[user_id]:
                del self.active[user_id]

    async def send_to_user(self, user_id: int, event: dict) -> None:
        for ws in self.active.get(user_id, []):
            await ws.send_text(json.dumps(event))

    async def broadcast(self, event: dict) -> None:
        for sockets in self.active.values():
            for ws in sockets:
                await ws.send_text(json.dumps(event))


manager = ConnectionManager()

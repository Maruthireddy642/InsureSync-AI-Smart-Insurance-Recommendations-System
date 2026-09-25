from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.core.security import decode_token
from app.core.websocket_manager import manager

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/notifications")
async def notifications_ws(websocket: WebSocket, token: str = Query(...)):
    try:
        payload = decode_token(token)
        user_id = int(payload["sub"])
    except Exception:
        await websocket.close(code=4401)
        return

    await manager.connect(user_id, websocket)
    try:
        while True:
            # We don't expect incoming messages, but keep the connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)

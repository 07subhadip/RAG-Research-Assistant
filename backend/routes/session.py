from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from backend.services.chat_storage import chat_storage

router = APIRouter()

class SessionCreate(BaseModel):
    title: Optional[str] = "New Chat"

@router.post("/sessions")
def create_session(request: SessionCreate):
    session_id = chat_storage.create_session(request.title)
    return {"id": session_id, "title": request.title, "created_at": datetime.now().isoformat()}

@router.get("/sessions")
def list_sessions():
    return {"sessions": chat_storage.get_all_sessions()}

@router.get("/sessions/{session_id}")
def get_session(session_id: str):
    session = chat_storage.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.delete("/sessions/{session_id}")
def delete_session(session_id: str):
    if chat_storage.delete_session(session_id):
        return {"id": session_id, "status": "deleted"}
    raise HTTPException(status_code=404, detail="Session not found")

@router.patch("/sessions/{session_id}")
def update_title(session_id: str, title: str):
    if chat_storage.update_session_title(session_id, title):
        return {"status": "updated", "id": session_id, "title": title}
    raise HTTPException(status_code=404, detail="Session not found")

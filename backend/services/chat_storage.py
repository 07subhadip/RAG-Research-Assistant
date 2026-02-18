import os
import json
import uuid
from datetime import datetime
from typing import List, Dict, Optional
from backend.core.config import settings

CHATS_DIR = "data/chats"
os.makedirs(CHATS_DIR, exist_ok=True)

class ChatStorageService:
    def create_session(self, title: str = "New Research") -> str:
        session_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        session_data = {
            "id": session_id,
            "title": title,
            "created_at": timestamp,
            "updated_at": timestamp,
            "messages": []
        }
        self._save_session(session_id, session_data)
        return session_id

    def get_all_sessions(self) -> List[Dict]:
        sessions = []
        if not os.path.exists(CHATS_DIR):
            return []
            
        for filename in os.listdir(CHATS_DIR):
            if filename.endswith(".json"):
                try:
                    with open(os.path.join(CHATS_DIR, filename), "r", encoding="utf-8") as f:
                         data = json.load(f)
                         # Returns summary info only
                         sessions.append({
                             "id": data["id"],
                             "title": data.get("title", "Untitled"),
                             "created_at": data.get("created_at"),
                             "updated_at": data.get("updated_at")
                         })
                except Exception as e:
                    print(f"Error loading session {filename}: {e}")
        
        # Sort by updated_at desc
        sessions.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
        return sessions

    def get_session(self, session_id: str) -> Optional[Dict]:
        path = os.path.join(CHATS_DIR, f"{session_id}.json")
        if not os.path.exists(path):
            return None
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            return None

    def add_message(self, session_id: str, role: str, content: str):
        session = self.get_session(session_id)
        if not session:
            # If session doesn't exist (maybe deleted manually?), recreate or error?
            # Let's recreate for robustness if it was in memory
            session = {
                 "id": session_id,
                 "title": "New Research", 
                 "created_at": datetime.now().isoformat(),
                 "messages": []
            }
        
        message = {"role": role, "content": content, "timestamp": datetime.now().isoformat()}
        session["messages"].append(message)
        session["updated_at"] = datetime.now().isoformat()
        
        # Auto-update title if it's the first user message
        if len(session["messages"]) == 1 and role == "user":
             # Use first 30 chars of query as title
             session["title"] = content[:30] + "..." if len(content) > 30 else content
             
        self._save_session(session_id, session)
        return message

    def update_session_title(self, session_id: str, title: str):
        session = self.get_session(session_id)
        if session:
            session["title"] = title
            self._save_session(session_id, session)
            return True
        return False

    def delete_session(self, session_id: str):
         path = os.path.join(CHATS_DIR, f"{session_id}.json")
         if os.path.exists(path):
             os.remove(path)
             return True
         return False

    def _save_session(self, session_id: str, data: Dict):
        path = os.path.join(CHATS_DIR, f"{session_id}.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

chat_storage = ChatStorageService()

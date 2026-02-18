from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from backend.services.rag_service import rag_service
from backend.services.chat_storage import chat_storage

import json
import asyncio

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    session_id: str = "default"

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    if not rag_service.pipeline or not rag_service.pipeline.rag_chain:
        return JSONResponse(status_code=400, content={"error": "RAG system not initialized. Please upload PDFs first."})
    
    query = request.query
    session_id = request.session_id
    
    # Save user message
    chat_storage.add_message(session_id, "user", query)
    
    async def generate():
        full_response = ""
        try:
            async for chunk in rag_service.pipeline.rag_chain.astream(query):
                 message = {"token": chunk}
                 full_response += chunk
                 yield f"data: {json.dumps(message)}\n\n"

            # Save assistant message
            chat_storage.add_message(session_id, "assistant", full_response)
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            error_msg = {"error": str(e)}
            # Optionally log error
            yield f"data: {json.dumps(error_msg)}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")

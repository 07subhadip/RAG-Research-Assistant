from fastapi import APIRouter, File, UploadFile, HTTPException
from typing import List
import os
import shutil
from services.rag_service import rag_service
from core.config import settings

router = APIRouter()


@router.post("/upload-pdfs")
async def upload_pdfs(files: List[UploadFile] = File(...)):
    if len(files) > settings.MAX_FILES:
        raise HTTPException(
            status_code=400, detail=f"Maximum {settings.MAX_FILES} PDFs per request."
        )

    # Check existing files logic - "Never delete user files silently"
    # User might want to start fresh session.
    # For now, we allow upload if total < 5.

    # However, strict requirement: "Reject >5 files with proper error"

    if rag_service.pipeline:
        current_docs = (
            len(rag_service.pipeline.documents) if rag_service.pipeline.documents else 0
        )
        # If we just look at raw file count:
        if os.path.exists(settings.RAG_DATA_PATH):
            disk_files = len(
                [f for f in os.listdir(settings.RAG_DATA_PATH) if f.endswith(".pdf")]
            )
            if disk_files + len(files) > settings.MAX_FILES:
                raise HTTPException(
                    status_code=400,
                    detail="Total PDF limit reached. Please clear old files via UI or API.",
                )

    try:
        # Save files
        saved_files = []
        os.makedirs(settings.RAG_DATA_PATH, exist_ok=True)

        for file in files:
            if not file.filename.endswith(".pdf"):
                return {"error": f"File {file.filename} is not a PDF"}

            file_location = os.path.join(settings.RAG_DATA_PATH, file.filename)
            with open(file_location, "wb+") as file_object:
                shutil.copyfileobj(file.file, file_object)
            saved_files.append(file.filename)

        # Trigger re-index
        rag_service.reindex()

        return {
            "message": "Files uploaded and RAG updated successfully",
            "files": saved_files,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/files")
def list_files():
    """List currently uploaded files."""
    if not os.path.exists(settings.RAG_DATA_PATH):
        return {"files": []}
    files = [f for f in os.listdir(settings.RAG_DATA_PATH) if f.endswith(".pdf")]
    return {"files": files}


@router.delete("/files")
def clear_files():
    # Helper to clear workspace
    try:
        if os.path.exists(settings.RAG_DATA_PATH):
            for f in os.listdir(settings.RAG_DATA_PATH):
                file_path = os.path.join(settings.RAG_DATA_PATH, f)
                if os.path.isfile(file_path):
                    os.unlink(file_path)

        # Reset memory state
        if rag_service.pipeline:
            rag_service.pipeline.documents = []
            rag_service.pipeline.chunks = []
            rag_service.pipeline.vectorstore = None
            rag_service.pipeline.retriever = None
            rag_service.pipeline.rag_chain = None

        return {"message": "All files cleared. RAG reset."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear files: {str(e)}")

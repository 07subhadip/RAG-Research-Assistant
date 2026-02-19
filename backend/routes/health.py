from fastapi import APIRouter
from services.rag_service import rag_service

router = APIRouter()


@router.get("/health")
def health_check():
    rag_status = (
        "ready"
        if rag_service.pipeline and rag_service.pipeline.rag_chain
        else "waiting_for_documents"
    )
    return {"status": "ok", "rag_status": rag_status}

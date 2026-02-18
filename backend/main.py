from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import chat, upload, health, session
from backend.services.rag_service import rag_service
from backend.core.config import settings

app = FastAPI(title="RAG Research Assistant API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Startup event using lifespan
@app.on_event("startup")
async def startup_event():
    print("Starting RAG service...")
    rag_service.initialize()


# Include Routers
app.include_router(chat.router, tags=["Chat"])
app.include_router(upload.router, tags=["Upload"])
app.include_router(health.router, tags=["Health"])
app.include_router(session.router, tags=["Session"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

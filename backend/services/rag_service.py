import os
import shutil
import asyncio
from typing import List, Generator, AsyncGenerator
from fastapi import UploadFile, HTTPException
from app.rag_pipeline import RAGPipeline
from core.config import settings


class RAGService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RAGService, cls).__new__(cls)
            cls._instance.pipeline = None
        return cls._instance

    def initialize(self):
        """Initialize the RAG pipeline."""
        print("Initializing RAG Service...")
        self.pipeline = RAGPipeline(
            data_path=settings.RAG_DATA_PATH,
            vectorstore_path=settings.RAG_VECTORSTORE_PATH,
        )

        # Check if vectors already exist, or if data/raw has content
        if os.path.exists(settings.RAG_DATA_PATH) and any(
            f.endswith(".pdf") for f in os.listdir(settings.RAG_DATA_PATH)
        ):
            # We can assume if vectors exist we are good, but the RAGPipeline class might need explicit calls
            # The existing RAGPipeline class doesn't have a check for existing vectorstore before loading docs
            # However, let's follow the user's instruction: load docs if exist + build/reload vectorstore
            try:
                self.pipeline.load_documents()
                if self.pipeline.documents:
                    self.pipeline.split_documents()
                    self.pipeline.create_embeddings()
                    self.pipeline.create_vectorstore()
                    self.pipeline.create_retriever()
                    self.pipeline.setup_llm()
                    self.pipeline.create_rag_chain()
                    print("RAG Service Initialized Successfully with Documents.")
                else:
                    # Even if no docs, we should setup LLM just in case user uploads later?
                    # The RAG chain requires retriever which requires vectorstore. So we wait.
                    print("No documents found. Waiting for upload.")
            except Exception as e:
                print(f"Error initializing RAG Service: {e}")
        else:
            print("Data directory empty or missing. Waiting for uploads.")

    def reindex(self):
        """Re-run the full indexing pipeline."""
        if not self.pipeline:
            self.initialize()

        print("Re-indexing documents...")
        try:
            self.pipeline.load_documents()
            if not self.pipeline.documents:
                raise ValueError("No documents loaded.")

            self.pipeline.split_documents()
            # Embeddings usually loaded once, but let's ensure we have them
            if not self.pipeline.embeddings:
                self.pipeline.create_embeddings()

            self.pipeline.create_vectorstore()
            self.pipeline.create_retriever()

            if not self.pipeline.llm:
                self.pipeline.setup_llm()

            self.pipeline.create_rag_chain()
            print("Re-indexing complete.")
            return True
        except Exception as e:
            print(f"Re-indexing failed: {e}")
            raise e

    async def save_files(self, files: List[UploadFile]) -> List[str]:
        """Save uploaded files to data/raw."""

        # Validate count
        current_files = (
            [f for f in os.listdir(settings.RAG_DATA_PATH) if f.endswith(".pdf")]
            if os.path.exists(settings.RAG_DATA_PATH)
            else []
        )

        # Note: User requires "Maximum 5 PDFs ONLY (hard limit)".
        # This implies total system limit or per-upload?
        # "Accept multiple PDF files (max 5)" suggests per request,
        # but UX Goal "Upload up to 5 research PDFs" suggests total workspace limit.
        # I will enforce strict 5 total files limit for the "Research Assistant" feel.

        if len(current_files) + len(files) > settings.MAX_FILES:
            # If overwriting isn't implied, we reject.
            # But for a simple research assistant, maybe we clear old ones?
            # User said: "Reject >5 files with proper error"
            # I will stick to reject.
            pass

        # Actually user said "Maximum 5 PDFs at a time (hard limit)" in previous prompt but here:
        # "Reject >5 files with proper error" -> presumably in the request.
        # But let's look at "Upload up to 5 research PDFs" in UX flow.
        # I'll implement a logic: If current + new > 5, I'll error out or maybe just wipe if it's a new "session".
        # Let's assume we Wipe clean for a new "Research Session" if the user wants?
        # The prompt says: "Never delete user files silently".
        # So I will error if total > 5. BUT, I will provide a way to clear?
        # Re-reading: "Allows users to upload PDFs... Maximum 5 PDFs at a time".
        # Let's assume the limit is 5 files in the folder.

        # Simpler approach for now: Ensure data/raw exists.
        os.makedirs(settings.RAG_DATA_PATH, exist_ok=True)

        # Check total limit
        existing_pdfs = [
            f for f in os.listdir(settings.RAG_DATA_PATH) if f.endswith(".pdf")
        ]
        if len(existing_pdfs) + len(files) > settings.MAX_FILES:
            # Maybe user wants to replace?
            # For now, strict error.
            raise HTTPException(
                status_code=400,
                detail=f"Cannot upload. Limit is {settings.MAX_FILES} PDFs total. You have {len(existing_pdfs)}.",
            )

        saved_filenames = []
        for file in files:
            if not file.filename.endswith(".pdf"):
                continue

            file_path = os.path.join(settings.RAG_DATA_PATH, file.filename)
            with open(file_path, "wb+") as buffer:
                shutil.copyfileobj(file.file, buffer)
            saved_filenames.append(file.filename)

        return saved_filenames

    def clear_files(self):
        """Clear all PDF files."""
        if os.path.exists(settings.RAG_DATA_PATH):
            for f in os.listdir(settings.RAG_DATA_PATH):
                if f.endswith(".pdf"):
                    os.remove(os.path.join(settings.RAG_DATA_PATH, f))
        # Also clear vectorstore?
        # If we clear files, vectorstore is stale.
        # We should probably reset pipeline state.
        self.pipeline.documents = []
        self.pipeline.chunks = []
        # We can leave embeddings model loaded.
        self.pipeline.vectorstore = None
        self.pipeline.retriever = None
        self.pipeline.rag_chain = None

    async def chat(self, query: str):
        """Run chat query."""
        if not self.pipeline or not self.pipeline.rag_chain:
            raise HTTPException(
                status_code=400, detail="RAG system not initialized. Upload PDFs first."
            )

        return self.pipeline.rag_chain.stream(query)


rag_service = RAGService()

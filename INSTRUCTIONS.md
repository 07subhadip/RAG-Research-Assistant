# RAG Research Assistant

## Setup and Running

### 1. Backend (FastAPI)

1.  Navigate to root directory: `cd e:\rag-research-assistant`
2.  Install dependencies: `pip install -r requirements.txt` and `pip install fastapi uvicorn python-multipart`
3.  Run backend: `uvicorn backend.main:app --reload`
    - API available at http://localhost:8000
    - Swagger docs at http://localhost:8000/docs

### 2. Frontend (Next.js)

1.  Navigate to frontend: `cd frontend`
2.  Install dependencies: `npm install --legacy-peer-deps`
3.  Run frontend: `npm run dev`
    - App available at http://localhost:3000

## Features

- **Upload PDFs**: Drag and drop up to 5 PDFs.
- **RAG Pipeline**: Automatically indexes uploaded files.
- **Chat Interface**: ChatGPT-style UI with streaming responses.
- **Dark Mode**: Automatically adapts to system preference (or manual toggle if implemented).

## Project Structure

- `app/rag_pipeline.py`: Core RAG logic (reused).
- `backend/`: FastAPI application.
- `frontend/`: Next.js application.

@echo off
start cmd /k "call venv/Scripts/activate && uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"
cd frontend
start cmd /k "npm run dev"

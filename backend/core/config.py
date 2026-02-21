from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Project structure:
# root/
#   backend/
#     core/
#       config.py
#   data/
#   vectorstore/

# Resolve absolute path to project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    HUGGINGFACEHUB_ACCESS_TOKEN: str = ""
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "https://rag-research-assistant.vercel.app",
    ]
    MAX_FILE_SIZE: int = 20 * 1024 * 1024  # 20MB
    MAX_FILES: int = 5
    
    # Use absolute paths for robust deployment
    RAG_DATA_PATH: str = str(PROJECT_ROOT / "data" / "raw")
    RAG_VECTORSTORE_PATH: str = str(PROJECT_ROOT / "vectorstore")

    model_config = SettingsConfigDict(
        env_file=str(PROJECT_ROOT / ".env"), extra="ignore"
    )


settings = Settings()

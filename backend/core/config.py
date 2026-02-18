from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    HUGGINGFACEHUB_ACCESS_TOKEN: str
    ALLOWED_ORIGINS: list = ["http://localhost:3000", "http://localhost:8000"]
    MAX_FILE_SIZE: int = 20 * 1024 * 1024  # 20MB
    MAX_FILES: int = 5
    RAG_DATA_PATH: str = "data/raw"
    RAG_VECTORSTORE_PATH: str = "vectorstore"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

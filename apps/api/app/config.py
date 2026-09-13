import os
from pydantic import BaseModel

class Settings(BaseModel):
    release_id: str = os.getenv("DATA_RELEASE_ID", "rel-2026-v1")
    database_path: str = os.getenv(
        "API_DATA_PATH",
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "releases", "rel-2026-v1", "app.sqlite"))
    )
    allowed_origins: list[str] = [
        origin.strip()
        for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173").split(",")
        if origin.strip()
    ]
    log_level: str = os.getenv("LOG_LEVEL", "INFO")

settings = Settings()

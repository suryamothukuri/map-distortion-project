import sqlite3
import os
from .config import settings

def get_db_connection() -> sqlite3.Connection:
    if not os.path.exists(settings.database_path):
        raise FileNotFoundError(f"Database file not found at: {settings.database_path}")
    conn = sqlite3.connect(f"file:{settings.database_path}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row
    return conn

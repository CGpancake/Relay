from collections.abc import Generator
import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

DEFAULT_SQLITE_PATH = Path(__file__).resolve().parents[1] / ".data" / "relay-dev.sqlite3"
DEFAULT_DATABASE_URL = f"sqlite:///{DEFAULT_SQLITE_PATH.as_posix()}"


def get_database_url() -> str:
    return os.environ.get("DATABASE_URL", DEFAULT_DATABASE_URL)


def _engine_kwargs(database_url: str) -> dict:
    if database_url.startswith("sqlite"):
        DEFAULT_SQLITE_PATH.parent.mkdir(parents=True, exist_ok=True)
        return {"connect_args": {"check_same_thread": False}}
    return {}


class Base(DeclarativeBase):
    pass


DATABASE_URL = get_database_url()
engine = create_engine(DATABASE_URL, future=True, **_engine_kwargs(DATABASE_URL))
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def get_session() -> Generator[Session, None, None]:
    with SessionLocal() as session:
        yield session

from typing import Generator
from sqlalchemy.orm import Session
from rag.infrastructure.supabase.db import SessionLocal


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session per request.

    This function creates a new SQLAlchemy session using the global
    SessionLocal factory and ensures it is properly closed after the
    request lifecycle completes.

    Design:
    - A new session is created for each incoming request.
    - The session is yielded to the route handler.
    - The session is automatically closed after the response is sent.

    Usage:
        from fastapi import Depends
        from sqlalchemy.orm import Session

        @router.get("/example")
        def example_route(db: Session = Depends(get_db)):
            return db.query(...)

    Notes:
    - Sessions are not thread-safe and must not be shared across requests.
    - Do not create sessions manually inside routes or services when using this dependency.
    - Only use this dependency when the route requires direct interaction with the SQL database.
    - Avoid using this in routes that do not require database access to prevent unnecessary connections.

    Yields:
        Session: A SQLAlchemy session bound to the global engine.

    Raises:
        SQLAlchemyError: If session creation fails.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
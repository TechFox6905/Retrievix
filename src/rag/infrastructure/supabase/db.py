from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from sqlalchemy.orm import sessionmaker

from rag.config import settings
from rag.utils.logger_util import setup_logging

logger = setup_logging()


"""
Database Engine and Session Configuration.

This module initializes and exposes the SQLAlchemy engine and session factory
for the application.

Design:
- The engine is created once at module import time.
- A single global SessionLocal factory is defined using sessionmaker.
- Sessions are NOT created here and must be managed by the caller.

Usage Patterns:
- FastAPI:
    Use a dependency that creates and closes a session per request.

- Background jobs / pipelines:
    Create a session using SessionLocal() and close it manually.

Example:
    session = SessionLocal()
    try:
        # perform DB operations
        ...
    finally:
        session.close()

Notes:
- Do NOT create global/shared sessions.
- Do NOT recreate engine or SessionLocal elsewhere.
- Sessions are not thread-safe and must be short-lived.

Raises:
    ValueError: If database configuration is incomplete.
    OperationalError: If the database connection fails.
    SQLAlchemyError: For SQLAlchemy-related initialization errors.
"""


db = settings.supabase_db
if not all([db.user, db.password, db.host, db.port, db.name]):
    logger.error(
        "Incomplete database configuration: missing user, password, host, port, or name"
    )
    raise ValueError(
        "Incomplete database configuration: ensure all Supabase settings are provided"
    )

engine_url = (
    f"postgresql://{db.user}:{db.password.get_secret_value()}@{db.host}:{db.port}/{db.name}"
)
logger.debug(f"Using engine URL: {engine_url}")

try:
    logger.info(f"Connecting to database {db.name} at {db.host}:{db.port}")

    # Create the engine with connection pooling options for robustness
    engine = create_engine(
        engine_url,
        pool_size=5,  # Matches number of feeds/tasks
        max_overflow=10,  # Allow additional connections if pool is full
        pool_timeout=30,  # Timeout for getting a connection from the pool
        echo=False,  # Disable SQL statement logging (set to True for debugging)
        connect_args={
            "client_encoding": "utf8",
        },
    )

    # Test the connection to ensure it’s valid
    with engine.connect():
        logger.debug("Successfully tested database connection")

    logger.info("Database engine initialized successfully")
    

except AttributeError as e:
    logger.error(f"Invalid database configuration: {e}")
    raise ValueError(
        "Invalid database configuration: ensure settings.supabase_db is properly configured"
    ) from e
except OperationalError as e:
    logger.error(f"Failed to connect to database: {e}")
    raise
except SQLAlchemyError as e:
    logger.error(f"SQLAlchemy error during engine initialization: {e}")
    raise SQLAlchemyError("Failed to initialize database engine") from e
except Exception as e:
    logger.error(f"Unexpected error during engine initialization: {e}")
    raise

# Session factory used to create new database sessions.
# Each call to SessionLocal() returns a new Session instance.
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)

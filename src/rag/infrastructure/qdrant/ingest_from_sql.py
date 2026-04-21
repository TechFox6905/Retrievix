import asyncio
from datetime import datetime

from rag.infrastructure.qdrant.qdrant_vectorstore import AsyncQdrantVectorStore
from rag.infrastructure.supabase.db import SessionLocal
from rag.utils.logger_util import setup_logging

logger = setup_logging()


async def main() -> None:
    """Ingest articles from Supabase Postgres to Qdrant vector store.

    Initializes a SQLAlchemy engine and session to connect to Supabase Postgres,
    and an AsyncQdrantVectorStore to ingest articles from a specified date into
    Qdrant. Closes the session and Qdrant client after completion. Logs errors
    and ensures proper execution.

    Args:
        None

    Returns:
        None

    Raises:
        RuntimeError: If an error occurs during Qdrant ingestion or SQL operations.
        Exception: For unexpected errors during execution.

    """
    logger.info("Starting ingestion of articles from SQL to Qdrant")

    # Initialize database engine and session
    session = SessionLocal()

    # Initialize Qdrant vector store
    vectorstore = AsyncQdrantVectorStore()
    try:

        # Set the start date for ingestion
        from_date = datetime.strptime("2021-01-01", "%Y-%m-%d")

        # Ingest articles from SQL to Qdrant
        await vectorstore.ingest_from_sql(session=session, from_date=from_date)
        logger.info("Ingestion task completed successfully")
    except RuntimeError as e:
        logger.error(f"Failed to ingest articles to Qdrant: {e}")
        raise RuntimeError("Error during SQL to Qdrant ingestion") from e
    except Exception as e:
        logger.error(f"Unexpected error during ingestion: {e}")
        raise
    finally:
        # Close session and Qdrant client
        if "session" in locals():
            session.close()
            logger.info("SQLAlchemy session closed")
        if "vectorstore" in locals():
            await vectorstore.client.close()
            logger.info("Qdrant client closed")


if __name__ == "__main__":
    asyncio.run(main())

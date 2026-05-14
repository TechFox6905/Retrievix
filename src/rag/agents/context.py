from collections.abc import Awaitable, Callable
from dataclasses import dataclass

from rag.api.schemas.api_models import SearchResult

RetrieveFn = Callable[[], Awaitable[list[SearchResult]]]


@dataclass
class AgentRuntimeContext:
    """Immutable dependencies for agent graph nodes (per request)."""

    retrieve: RetrieveFn
    provider: str
    selected_model: str | None = None

from typing import Annotated, Any, TypedDict

from langchain_core.messages import AnyMessage
from langgraph.graph.message import add_messages


class AgentGraphState(TypedDict, total=False):
    """State for the linear retrieve → generate agent."""

    messages: Annotated[list[AnyMessage], add_messages]
    retrieval_results: list[dict[str, Any]]
    finish_reason: str | None
    model_used: str | None

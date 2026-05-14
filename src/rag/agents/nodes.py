from typing import Any

from langchain_core.messages import AIMessage, HumanMessage
from langgraph.runtime import Runtime

from rag.agents.context import AgentRuntimeContext
from rag.agents.state import AgentGraphState
from rag.api.schemas.api_models import SearchResult
from rag.api.services.generation_service import generate_answer
from rag.utils.logger_util import setup_logging

logger = setup_logging()


def _latest_human_query(messages: list[Any]) -> str:
    for message in reversed(messages):
        if isinstance(message, HumanMessage):
            content = message.content
            return content if isinstance(content, str) else str(content)
    return ""


async def retrieve_node(
    state: AgentGraphState,
    runtime: Runtime[AgentRuntimeContext],
) -> dict[str, Any]:
    """Fetch chunks from Qdrant via the bound retrieve callable."""
    logger.info("Agent node: retrieve")
    results = await runtime.context.retrieve()
    return {"retrieval_results": [hit.model_dump() for hit in results]}


async def generate_node(
    state: AgentGraphState,
    runtime: Runtime[AgentRuntimeContext],
) -> dict[str, Any]:
    """Generate an answer using existing provider stack and retrieved contexts."""
    logger.info("Agent node: generate")
    query = _latest_human_query(state.get("messages", []))
    raw = state.get("retrieval_results") or []
    contexts = [SearchResult(**item) for item in raw]

    answer_payload = await generate_answer(
        query=query,
        contexts=contexts,
        provider=runtime.context.provider,
        selected_model=runtime.context.selected_model,
    )
    answer = answer_payload["answer"]
    return {
        "messages": [AIMessage(content=answer)],
        "finish_reason": answer_payload.get("finish_reason"),
        "model_used": answer_payload.get("model"),
    }

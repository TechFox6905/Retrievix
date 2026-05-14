from typing import Any

from langchain_core.messages import AIMessage, HumanMessage
from langgraph.graph import END, START, StateGraph

from rag.agents.context import AgentRuntimeContext
from rag.agents.nodes import generate_node, retrieve_node
from rag.agents.state import AgentGraphState
from rag.api.schemas.api_models import SearchResult
from rag.utils.logger_util import setup_logging

logger = setup_logging()

_COMPILED_GRAPH: Any | None = None


def _build_graph() -> Any:
    workflow = StateGraph(AgentGraphState, context_schema=AgentRuntimeContext)
    workflow.add_node("retrieve", retrieve_node)
    workflow.add_node("generate", generate_node)
    workflow.add_edge(START, "retrieve")
    workflow.add_edge("retrieve", "generate")
    workflow.add_edge("generate", END)
    compiled = workflow.compile()
    logger.info("Compiled linear agent RAG graph (retrieve -> generate)")
    return compiled


def get_agent_rag_graph() -> Any:
    global _COMPILED_GRAPH
    if _COMPILED_GRAPH is None:
        _COMPILED_GRAPH = _build_graph()
    return _COMPILED_GRAPH


def _final_text_from_messages(messages: list[Any]) -> str:
    for message in reversed(messages):
        if isinstance(message, AIMessage):
            content = message.content
            return content if isinstance(content, str) else str(content)
    return ""


async def run_agent_rag(*, query_text: str, context: AgentRuntimeContext) -> dict[str, Any]:
    """Run the compiled graph and return a dict suitable for API mapping."""
    graph = get_agent_rag_graph()
    result = await graph.ainvoke(
        {"messages": [HumanMessage(content=query_text)]},
        context=context,
    )
    messages = result.get("messages", [])
    answer = _final_text_from_messages(messages)
    raw_sources = result.get("retrieval_results") or []
    sources = [SearchResult(**item) for item in raw_sources]
    return {
        "answer": answer,
        "sources": sources,
        "model": result.get("model_used"),
        "finish_reason": result.get("finish_reason"),
        "steps": ["retrieve", "generate"],
    }

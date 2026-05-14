from unittest.mock import AsyncMock, patch

import pytest

from rag.agents.context import AgentRuntimeContext
from rag.agents.graph import run_agent_rag
from rag.api.schemas.api_models import SearchResult


@pytest.mark.asyncio
async def test_run_agent_rag_uses_retrieve_and_generate():
    """Graph runs retrieve then generate; LLM call is mocked."""

    async def fake_retrieve() -> list[SearchResult]:
        return [
            SearchResult(
                title="T",
                chunk_text="Only this context.",
                url="https://example.com/a",
                score=0.9,
            )
        ]

    ctx = AgentRuntimeContext(
        retrieve=fake_retrieve,
        provider="huggingface",
        selected_model=None,
    )

    with patch(
        "rag.agents.nodes.generate_answer",
        new_callable=AsyncMock,
    ) as mock_gen:
        mock_gen.return_value = {
            "answer": "Mocked answer",
            "sources": ["https://example.com/a"],
            "model": "mock-model",
            "finish_reason": "stop",
        }
        out = await run_agent_rag(query_text="What is RAG?", context=ctx)

    mock_gen.assert_awaited_once()
    assert out["answer"] == "Mocked answer"
    assert out["steps"] == ["retrieve", "generate"]
    assert len(out["sources"]) == 1
    assert out["sources"][0].url == "https://example.com/a"
    assert out["model"] == "mock-model"
    assert out["finish_reason"] == "stop"

import asyncio
import json
from pathlib import Path

from rag.infrastructure.qdrant.qdrant_vectorstore import (
    AsyncQdrantVectorStore,
)
from rag.api.services.search_service import query_with_filters
from rag.api.services.generation_service import generate_answer


class MockApp:
    pass


class MockRequest:
    pass


TOP_K = 5


async def run_evaluation():
    # -----------------------
    # Init Vector Store
    # -----------------------
    vectorstore = AsyncQdrantVectorStore(
        cache_dir="/tmp/fastembed_cache"
    )

    app = MockApp()
    app.state = MockApp()
    app.state.vectorstore = vectorstore

    request = MockRequest()
    request.app = app

    # -----------------------
    # Load Evaluation Dataset
    # -----------------------
    dataset_path = Path(
        r"src/rag/eval/datasets/eval_dataset.json"
    )

    with open(dataset_path, "r", encoding="utf-8") as f:
        dataset = json.load(f)

    # -----------------------
    # Metrics Storage
    # -----------------------
    recall_scores = []
    precision_scores = []
    mrr_scores = []

    # -----------------------
    # Run Evaluation
    # -----------------------
    for idx, sample in enumerate(dataset, start=1):

        print(f"\n{'=' * 70}")
        print(f"Evaluation Sample {idx}")
        print(f"{'=' * 70}")

        question = sample["question"]
        expected_keywords = sample["expected_keywords"]

        print(f"\nQuestion:\n{question}")

        # -----------------------
        # Retrieval
        # -----------------------
        results = await query_with_filters(
            request=request,
            query_text=question,
            limit=TOP_K,
        )

        chunks = [
            r.chunk_text.lower()
            for r in results
            if r.chunk_text
        ]

        retrieved_keywords = set()
        relevant_chunks = 0

        # -----------------------
        # Precision@K + Recall@K
        # -----------------------
        for chunk in chunks:

            matched = False

            for keyword in expected_keywords:
                keyword_lower = keyword.lower()

                if keyword_lower in chunk:
                    retrieved_keywords.add(keyword_lower)
                    matched = True

            if matched:
                relevant_chunks += 1

        k = len(chunks)

        precision_at_k = (
            relevant_chunks / k
            if k > 0
            else 0.0
        )

        recall_at_k = (
            len(retrieved_keywords)
            / len(expected_keywords)
            if expected_keywords
            else 0.0
        )

        # -----------------------
        # MRR
        # -----------------------
        first_relevant_rank = None

        for rank, chunk in enumerate(chunks, start=1):

            if any(
                keyword.lower() in chunk
                for keyword in expected_keywords
            ):
                first_relevant_rank = rank
                break

        mrr = (
            1 / first_relevant_rank
            if first_relevant_rank
            else 0.0
        )

        # -----------------------
        # Store Metrics
        # -----------------------
        precision_scores.append(precision_at_k)
        recall_scores.append(recall_at_k)
        mrr_scores.append(mrr)

        # -----------------------
        # Print Metrics
        # -----------------------
        print("\nRetrieval Metrics:")
        print(f"Precision@{TOP_K}: {precision_at_k:.2f}")
        print(f"Recall@{TOP_K}:    {recall_at_k:.2f}")
        print(f"MRR:               {mrr:.2f}")

        if first_relevant_rank:
            print(
                f"First Relevant Rank: {first_relevant_rank}"
            )
        else:
            print("First Relevant Rank: Not Found")

        # -----------------------
        # Print Retrieved Chunks
        # -----------------------
        print("\nRetrieved Chunks:")

        for i, chunk in enumerate(chunks, start=1):
            preview = chunk[:250].replace("\n", " ")

            print(f"\n[{i}] {preview}...")

        # -----------------------
        # Generation
        # -----------------------
        answer_data = await generate_answer(
            query=question,
            contexts=results,
            provider="openrouter",
        )

        print("\nGenerated Answer:\n")
        print(answer_data["answer"][:1000])

    # -----------------------
    # Final Summary
    # -----------------------
    avg_precision = (
        sum(precision_scores)
        / len(precision_scores)
    )

    avg_recall = (
        sum(recall_scores)
        / len(recall_scores)
    )

    avg_mrr = (
        sum(mrr_scores)
        / len(mrr_scores)
    )

    print(f"\n{'=' * 70}")
    print("FINAL EVALUATION SUMMARY")
    print(f"{'=' * 70}")

    print(f"\nAverage Precision@{TOP_K}: {avg_precision:.2f}")
    print(f"Average Recall@{TOP_K}:    {avg_recall:.2f}")
    print(f"Average MRR:               {avg_mrr:.2f}")

    # -----------------------
    # Cleanup
    # -----------------------
    await vectorstore.client.close()


if __name__ == "__main__":
    asyncio.run(run_evaluation())
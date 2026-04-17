# =============================================================================
# Project Setup
# =============================================================================

PROJECT_NAME := rag
PYTHON := uv run python
UVICORN := uv run uvicorn

.DEFAULT_GOAL := help

# -----------------------------------------------------------------------------
# Environment check
# -----------------------------------------------------------------------------

ifeq (,$(wildcard .env))
$(warning ⚠️  .env file not found. Using default environment variables)
endif

-include .env

# =============================================================================
# Help
# =============================================================================

.PHONY: help
help:
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# =============================================================================
# Setup & Install
# =============================================================================

.PHONY: install
install: ## Install dependencies
	uv pip install -e .

.PHONY: install-dev
install-dev: ## Install dev dependencies
	uv pip install -e ".[dev]"

.PHONY: sync
sync: ## Sync dependencies using uv.lock
	uv pip sync uv.lock

# =============================================================================
# Run Applications
# =============================================================================

.PHONY: run-api
run-api: ## Run FastAPI app (dev mode)
	$(UVICORN) rag.api.main:app --reload 

.PHONY: run-api-prod
run-api-prod: ## Run FastAPI app (prod mode)
	$(UVICORN) rag.api.main:app --host 0.0.0.0 --port 8000

.PHONY: run-gradio
run-gradio: ## Run Gradio app
	$(PYTHON) frontend/app.py

# =============================================================================
# Supabase
# =============================================================================

.PHONY: supabase-create
supabase-create: ## Create Supabase DB
	$(PYTHON) -m rag.infrastructure.supabase.create_db

.PHONY: supabase-delete
supabase-delete: ## Delete Supabase DB
	$(PYTHON) -m rag.infrastructure.supabase.delete_db

.PHONY: recreate-supabase
recreate-supabase: supabase-delete supabase-create ## Recreate Supabase

# =============================================================================
# Qdrant
# =============================================================================

.PHONY: qdrant-create
qdrant-create: ## Create Qdrant collection
	$(PYTHON) -m rag.infrastructure.qdrant.create_collection

.PHONY: qdrant-delete
qdrant-delete: ## Delete Qdrant collection
	$(PYTHON) -m rag.infrastructure.qdrant.delete_collection

.PHONY: qdrant-index
qdrant-index: ## Create indexes
	$(PYTHON) -m rag.infrastructure.qdrant.create_indexes

.PHONY: qdrant-ingest
qdrant-ingest: ## Ingest SQL → Qdrant
	$(PYTHON) -m rag.infrastructure.qdrant.ingest_from_sql

.PHONY: recreate-qdrant
recreate-qdrant: qdrant-delete qdrant-create ## Recreate Qdrant

# =============================================================================
# Pipelines (Prefect)
# =============================================================================

.PHONY: ingest-rss
ingest-rss: ## Run RSS ingestion flow
	$(PYTHON) -m rag.pipelines.flows.rss_ingestion_flow

.PHONY: ingest-embeddings
ingest-embeddings: ## Run embeddings flow
	$(if $(FROM_DATE), \
		$(PYTHON) -m rag.pipelines.flows.embeddings_ingestion_flow --from-date $(FROM_DATE), \
		$(PYTHON) -m rag.pipelines.flows.embeddings_ingestion_flow)


# =============================================================================
# Composite Commands
# =============================================================================

.PHONY: recreate-all
recreate-all: recreate-supabase recreate-qdrant ## Recreate all infra
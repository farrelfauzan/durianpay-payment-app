.DEFAULT_GOAL := help

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ─── Setup ───────────────────────────────────────────────────────────────────

setup: setup-env setup-backend setup-frontend ## Install all dependencies

setup-env: ## Copy .env.example to .env if not present
	@cp -n .env.example .env || true

setup-backend: ## Install backend dependencies
	cd backend && make dep

setup-frontend: ## Install frontend dependencies
	pnpm install

# ─── Run ─────────────────────────────────────────────────────────────────────

run: ## Start backend and frontend concurrently
	@echo "Starting backend on :8080 and frontend on :3000..."
	@(cd backend && make run &) && pnpm dev

run-backend: ## Start backend only
	cd backend && make run

run-frontend: ## Start frontend only
	pnpm dev

# ─── Test ────────────────────────────────────────────────────────────────────

test: test-backend test-frontend ## Run all tests

test-backend: ## Run backend tests
	cd backend && go test ./...

test-frontend: ## Run frontend tests
	pnpm --filter frontend test

# ─── Build ───────────────────────────────────────────────────────────────────

build: build-backend build-frontend ## Build everything

build-backend: ## Build backend binary
	cd backend && make build

build-frontend: ## Build frontend for production
	pnpm --filter frontend build

# ─── OpenAPI ─────────────────────────────────────────────────────────────────

openapi-gen: ## Regenerate OpenAPI types (backend + SDK)
	cd backend && make openapi-gen
	pnpm --filter @durianpay/sdk openapi

# ─── Docker ──────────────────────────────────────────────────────────────────

docker-up: ## Start services via docker-compose
	docker compose up --build -d

docker-down: ## Stop docker-compose services
	docker compose down

# ─── Seed ────────────────────────────────────────────────────────────────────

seed: ## Seed database (auto on first backend run)
	cd backend && make run &
	@sleep 2 && kill $$!
	@echo "Database seeded."

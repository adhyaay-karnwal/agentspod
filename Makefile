# Wind - AI-first operating system
# Makefile for development and deployment

.PHONY: help up down logs api web worker format test clean install
# Add new development helpers
.PHONY: api-dev web-dev run-compose

# Default target
help:
	@echo "Wind - AI-first operating system"
	@echo "Available commands:"
	@echo "  make up        - Start all services (build if needed)"
	@echo "  make down      - Stop all services and remove volumes"
	@echo "  make logs      - Follow logs from API and web services"
	@echo "  make api       - Start just the API service"
	@echo "  make web       - Start just the web service"
	@echo "  make worker    - Start just the worker service"
	@echo "  make run-compose - Start docker-compose stack (alias for up)"
	@echo "  make format    - Format code with ruff and black"
	@echo "  make test      - Run tests with pytest"
	@echo "  make clean     - Remove build artifacts"
	@echo "  make install   - Install development dependencies"
	@echo "  make api-dev   - Run API locally without Docker (reload on changes)"
	@echo "  make web-dev   - Run Web locally without Docker (Next.js dev)"

# Docker Compose commands
up:
	docker compose up -d --build

down:
	docker compose down -v

logs:
	docker compose logs -f api web

api:
	docker compose up api -d

web:
	docker compose up web -d

worker:
	docker compose up worker -d

# Convenience alias (same as `up`)
run-compose: up

# Development commands
format:
	@echo "Formatting Python code..."
	@echo "This is a placeholder. To implement, run:"
	@echo "  cd apps/api && python -m ruff format ."
	@echo "  cd apps/api && python -m black ."

test:
	@echo "Running tests..."
	@echo "This is a placeholder. To implement, run:"
	@echo "  cd apps/api && python -m pytest"

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type d -name .pytest_cache -exec rm -rf {} +
	find . -type d -name .coverage -exec rm -rf {} +
	find . -type d -name .ruff_cache -exec rm -rf {} +
	find . -type d -name node_modules -exec rm -rf {} +
	find . -type d -name .next -exec rm -rf {} +
	find . -type d -name build -exec rm -rf {} +
	find . -type d -name dist -exec rm -rf {} +

install:
	@echo "Installing development dependencies..."
	@echo "For API:"
	@echo "  cd apps/api && pip install -r requirements.txt"
	@echo "For Web:"
	@echo "  cd apps/web && pnpm install"

# Run services locally without Docker
api-dev:
	cd apps/api && pip install -r requirements.txt && uvicorn wind_api.main:app --reload

web-dev:
	cd apps/web && pnpm install && pnpm dev

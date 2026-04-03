# =============================================================================
#  Celebrity Quiz — Makefile
#  Run `make` or `make help` to see all available commands.
# =============================================================================

# ── Config ────────────────────────────────────────────────────────────────────
IMAGE_NAME   ?= celebrity-quiz
IMAGE_TAG    ?= latest
REGISTRY     ?=
PORT         ?= 3000
DEV_PORT     ?= 3001

COMPOSE      := docker compose
COMPOSE_DEV  := $(COMPOSE) -f docker-compose.yml -f docker-compose.dev.yml

# Load .env if it exists (variables can be overridden on the CLI)
-include .env
export

# ── Colors ────────────────────────────────────────────────────────────────────
# Note: ANSI colors are disabled on Windows cmd, enabled for Git Bash/WSL
BOLD   := \033[1m
RESET  := \033[0m
GREEN  := \033[32m
YELLOW := \033[33m
CYAN   := \033[36m
RED    := \033[31m

# Windows-compatible echo command
ifeq ($(OS),Windows_NT)
    SHELL := cmd.exe
    .SHELLFLAGS := /c
    RM := del /Q
    RMD := rmdir /S /Q
else
    RM := rm -f
    RMD := rm -rf
endif

# ─────────────────────────────────────────────────────────────────────────────
.DEFAULT_GOAL := help
.PHONY: help env \
        dev dev-build dev-down dev-logs dev-shell \
        build up down restart logs shell \
        clean clean-volumes clean-all \
        lint test \
        push release


# ── Help ──────────────────────────────────────────────────────────────────────

help: ## 📋 Show this help message
	@echo.
	@echo Celebrity Quiz - available commands
	@echo.
	@echo Development:
	@echo   make dev              - Start dev server with hot-reload (port $(DEV_PORT))
	@echo   make dev-build        - Rebuild dev image then start
	@echo   make dev-down         - Stop dev server
	@echo   make dev-logs         - Follow dev server logs
	@echo   make dev-shell        - Open shell in dev container
	@echo.
	@echo Production:
	@echo   make build            - Build production Docker image
	@echo   make build-no-cache   - Build production image without cache
	@echo   make up               - Start production stack (port $(PORT))
	@echo   make up-build         - Build and start production stack
	@echo   make down             - Stop production stack
	@echo   make restart          - Restart production stack
	@echo   make logs             - Follow production logs
	@echo   make shell            - Open shell in production container
	@echo   make ps               - Show running containers
	@echo.
	@echo Quality:
	@echo   make lint             - Run ESLint in container
	@echo   make lint-host        - Run ESLint on host
	@echo.
	@echo Cleanup:
	@echo   make clean            - Stop and remove containers
	@echo   make clean-volumes    - Stop, remove containers and volumes
	@echo   make clean-all        - Remove containers, volumes and images
	@echo   make prune            - Docker system prune (careful!)
	@echo.
	@echo Variables: IMAGE_NAME=$(IMAGE_NAME) IMAGE_TAG=$(IMAGE_TAG) PORT=$(PORT) DEV_PORT=$(DEV_PORT)
	@echo.

# ── Environment setup ─────────────────────────────────────────────────────────

env: ## 🔧 Create .env from .env.example (skip if already exists
	@if exist .env (echo .env already exists — skipping.) else (copy .env.example .env && echo .env created from .env.example.)

# ── Development ───────────────────────────────────────────────────────────────

dev: ## 🔥 Start dev server with hot-reload (http://localhost:$(DEV_PORT))
	@echo. & echo Starting dev server on port $(DEV_PORT)...
	$(COMPOSE_DEV) up

dev-build: ## 🔨 Rebuild dev image then start
	@echo. & echo Rebuilding dev image...
	$(COMPOSE_DEV) up --build

dev-down: ## ⏹ Stop dev server
	$(COMPOSE_DEV) down

dev-logs: ## 📜 Follow dev server logs
	$(COMPOSE_DEV) logs -f

dev-shell: ## 🐚 Open shell in dev container
	$(COMPOSE_DEV) exec app sh

# ── Production build ──────────────────────────────────────────────────────────

build: ## 🏗  Build production Docker image
	@echo. & echo Building $(IMAGE_NAME):$(IMAGE_TAG)...
	$(COMPOSE) build --progress=plain

build-no-cache: ## 🏗  Build production image (no cache)
	@echo. & echo Building $(IMAGE_NAME):$(IMAGE_TAG) without cache...
	$(COMPOSE) build --no-cache --progress=plain

# ── Production stack ──────────────────────────────────────────────────────────

up: ## 🚀 Start production stack (http://localhost:$(PORT))
	@echo. & echo Starting production stack on port $(PORT)...
	$(COMPOSE) up -d
	@echo App running at http://localhost:$(PORT)

up-build: ## 🚀 Build then start production stack
	$(COMPOSE) up -d --build
	@echo App running at http://localhost:$(PORT)

down: ## ⏹ Stop production stack
	@echo. & echo Stopping production stack...
	$(COMPOSE) down

restart: ## 🔄 Restart production stack
	$(COMPOSE) restart

logs: ## 📜 Follow production logs
	$(COMPOSE) logs -f

shell: ## 🐚 Open shell in production container
	$(COMPOSE) exec app sh

ps: ## 📊 Show running containers and their status
	$(COMPOSE) ps

# ── Quality ───────────────────────────────────────────────────────────────────

lint: ## 🔍 Run ESLint (inside dev container)
	@echo. & echo Running ESLint...
	$(COMPOSE_DEV) run --rm app npm run lint

lint-host: ## 🔍 Run ESLint on host (requires node_modules)
	npm run lint

# ── Cleanup ───────────────────────────────────────────────────────────────────

clean: ## 🧹 Stop containers and remove them (keep volumes and images)
	$(COMPOSE) down
	$(COMPOSE_DEV) down

clean-volumes: ## 🧹 Stop containers, remove them and named volumes
	$(COMPOSE) down -v
	$(COMPOSE_DEV) down -v

clean-all: ## 🔥 Remove containers, volumes AND local images
	@echo. & echo Removing containers, volumes and images...
	$(COMPOSE) down -v --rmi local
	$(COMPOSE_DEV) down -v --rmi local
	@echo Done.

prune: ## 🔥 Docker system prune (remove ALL unused resources - careful!)
	@echo. & echo This will remove ALL unused Docker resources.
	docker system prune -f

# ── Registry / release ────────────────────────────────────────────────────────

tag: ## 🏷  Tag image for registry (REGISTRY=ghcr.io/user)
	@if "$(REGISTRY)" == "" (echo Set REGISTRY first: make tag REGISTRY=ghcr.io/user & exit /b 1)
	docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)
	@echo Tagged as $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)

push: tag ## 📤 Tag and push image to registry
	docker push $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)
	@echo Pushed $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)

release: ## 🎉 Build, tag latest + version, push (IMAGE_TAG=x.y.z required)
	@if "$(IMAGE_TAG)" == "latest" (echo Set a version: make release IMAGE_TAG=1.0.0 REGISTRY=ghcr.io/user & exit /b 1)
	$(MAKE) build
	docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)
	docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(REGISTRY)/$(IMAGE_NAME):latest
	docker push $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)
	docker push $(REGISTRY)/$(IMAGE_NAME):latest
	@echo Released $(IMAGE_TAG) + latest

# ── Info ──────────────────────────────────────────────────────────────────────

info: ## ℹ️  Show image size and layers
	@docker images $(IMAGE_NAME) --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" 2>/dev/null \
		|| printf "$(YELLOW)Image not built yet. Run: make build$(RESET)\n"

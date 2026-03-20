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
BOLD   := \033[1m
RESET  := \033[0m
GREEN  := \033[32m
YELLOW := \033[33m
CYAN   := \033[36m
RED    := \033[31m

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
	@printf "\n$(BOLD)$(CYAN)Celebrity Quiz — available commands$(RESET)\n\n"
	@awk 'BEGIN {FS = ":.*?## "} \
		/^[a-zA-Z_-]+:.*?## / { \
			split($$1, a, ":"); \
			printf "  $(BOLD)$(GREEN)%-20s$(RESET) %s\n", a[1], $$2 \
		}' $(MAKEFILE_LIST)
	@printf "\n$(BOLD)Variables:$(RESET)\n"
	@printf "  IMAGE_NAME=$(IMAGE_NAME)  IMAGE_TAG=$(IMAGE_TAG)  PORT=$(PORT)  DEV_PORT=$(DEV_PORT)\n\n"

# ── Environment setup ─────────────────────────────────────────────────────────

env: ## 🔧 Create .env from .env.example (skip if already exists)
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		printf "$(GREEN)✔ .env created from .env.example$(RESET)\n"; \
		printf "$(YELLOW)  Edit .env to customise your settings.$(RESET)\n"; \
	else \
		printf "$(YELLOW)  .env already exists — skipping.$(RESET)\n"; \
	fi

# ── Development ───────────────────────────────────────────────────────────────

dev: ## 🔥 Start dev server with hot-reload (http://localhost:$(DEV_PORT))
	@printf "$(CYAN)▶ Starting dev server on port $(DEV_PORT)…$(RESET)\n"
	$(COMPOSE_DEV) up

dev-build: ## 🔨 Rebuild dev image then start
	@printf "$(CYAN)▶ Rebuilding dev image…$(RESET)\n"
	$(COMPOSE_DEV) up --build

dev-down: ## ⏹ Stop dev server
	$(COMPOSE_DEV) down

dev-logs: ## 📜 Follow dev server logs
	$(COMPOSE_DEV) logs -f

dev-shell: ## 🐚 Open shell in dev container
	$(COMPOSE_DEV) exec app sh

# ── Production build ──────────────────────────────────────────────────────────

build: ## 🏗  Build production Docker image
	@printf "$(CYAN)▶ Building $(IMAGE_NAME):$(IMAGE_TAG)…$(RESET)\n"
	$(COMPOSE) build --progress=plain

build-no-cache: ## 🏗  Build production image (no cache)
	@printf "$(YELLOW)▶ Building $(IMAGE_NAME):$(IMAGE_TAG) (no cache)…$(RESET)\n"
	$(COMPOSE) build --no-cache --progress=plain

# ── Production stack ──────────────────────────────────────────────────────────

up: ## 🚀 Start production stack (http://localhost:$(PORT))
	@printf "$(CYAN)▶ Starting production stack on port $(PORT)…$(RESET)\n"
	$(COMPOSE) up -d
	@printf "$(GREEN)✔ App running at http://localhost:$(PORT)$(RESET)\n"

up-build: ## 🚀 Build then start production stack
	$(COMPOSE) up -d --build
	@printf "$(GREEN)✔ App running at http://localhost:$(PORT)$(RESET)\n"

down: ## ⏹ Stop production stack
	@printf "$(CYAN)▶ Stopping production stack…$(RESET)\n"
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
	@printf "$(CYAN)▶ Running ESLint…$(RESET)\n"
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
	@printf "$(RED)▶ Removing containers, volumes and images…$(RESET)\n"
	$(COMPOSE) down -v --rmi local
	$(COMPOSE_DEV) down -v --rmi local
	@printf "$(GREEN)✔ Done.$(RESET)\n"

prune: ## 🔥 Docker system prune (remove ALL unused resources — careful!)
	@printf "$(RED)⚠  This will remove ALL unused Docker resources.$(RESET)\n"
	@read -p "Continue? [y/N] " ans && [ "$$ans" = "y" ] && docker system prune -f || printf "Aborted.\n"

# ── Registry / release ────────────────────────────────────────────────────────

tag: ## 🏷  Tag image for registry (REGISTRY=ghcr.io/user)
	@if [ -z "$(REGISTRY)" ]; then printf "$(RED)Set REGISTRY first: make tag REGISTRY=ghcr.io/user$(RESET)\n"; exit 1; fi
	docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)
	@printf "$(GREEN)✔ Tagged as $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)$(RESET)\n"

push: tag ## 📤 Tag and push image to registry
	docker push $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)
	@printf "$(GREEN)✔ Pushed $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)$(RESET)\n"

release: ## 🎉 Build, tag latest + version, push (IMAGE_TAG=x.y.z required)
	@if [ "$(IMAGE_TAG)" = "latest" ]; then \
		printf "$(RED)Set a version: make release IMAGE_TAG=1.0.0 REGISTRY=ghcr.io/user$(RESET)\n"; exit 1; \
	fi
	$(MAKE) build
	docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)
	docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(REGISTRY)/$(IMAGE_NAME):latest
	docker push $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)
	docker push $(REGISTRY)/$(IMAGE_NAME):latest
	@printf "$(GREEN)✔ Released $(IMAGE_TAG) + latest$(RESET)\n"

# ── Info ──────────────────────────────────────────────────────────────────────

info: ## ℹ️  Show image size and layers
	@docker images $(IMAGE_NAME) --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" 2>/dev/null \
		|| printf "$(YELLOW)Image not built yet. Run: make build$(RESET)\n"

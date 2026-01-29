.PHONY: install dev build clean docker-up docker-down lint typecheck

# Install dependencies
install:
	pnpm install

# Development
dev:
	pnpm dev

dev-web:
	pnpm dev:web

dev-worker:
	pnpm dev:worker

# Build
build:
	pnpm build

# Clean
clean:
	pnpm clean

# Lint & Format (Biome)
lint:
	pnpm lint

lint-fix:
	pnpm lint:fix

format:
	pnpm format

# Type checking
typecheck:
	pnpm typecheck

typecheck-web:
	pnpm typecheck:web

typecheck-worker:
	pnpm typecheck:worker

# Docker
docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

# Database
db-generate:
	pnpm db:generate

db-push:
	pnpm db:push

db-migrate:
	pnpm db:migrate

db-migrate-deploy:
	pnpm db:migrate:deploy

db-studio:
	pnpm db:studio

db-reset:
	pnpm db:reset

# Setup (first time)
setup: docker-up install db-generate db-push
	@echo "✅ Setup complete! Run 'make dev' to start development."

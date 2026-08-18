.PHONY: install dev dev-api dev-web build test

install:
	bun install

dev-api:
	bun run dev:api

dev-web:
	bun run dev:web

dev:
	@echo "Starting both API and Web dev servers..."
	bun run dev:api & bun run dev:web; wait

build:
	bun run build

test:
	bun test

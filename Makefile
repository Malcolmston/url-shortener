.PHONY: dev build start install lint typecheck test clean docker-build docker-up docker-down

## Development
install:
	npm install

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

## Quality
lint:
	npm run lint

typecheck:
	npm run typecheck

test:
	npm test

## Docker
docker-build:
	docker build -t snip-app:latest .

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

## Cleanup
clean:
	rm -rf .next node_modules

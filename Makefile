.PHONY: dev build install migrate seed test clean

install:
	npm install
	cd short && npm install

dev:
	npm run dev

build:
	npm run build

migrate:
	npm run migrate

seed:
	npm run seed

test:
	npm test

clean:
	rm -rf node_modules short/node_modules short/build dist

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

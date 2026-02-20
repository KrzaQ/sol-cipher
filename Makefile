.PHONY: dev build preview clean lint test

dev:
	npm run dev

build:
	npm run build

preview: build
	npm run preview

lint:
	npm run lint

clean:
	rm -rf dist node_modules

test:
	npm run test

-include Makefile.local

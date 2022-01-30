UID := 1000
GID := 1000

list:
	@echo ""
	@echo "Useful targets:"
	@echo ""
	@echo "  start            > Start containers"
	@echo "  restart          > Restart containers"
	@echo "  stop             > Stop and kill running containers"
	@echo "  status           > Display stack containers status"
	@echo "  logs             > Display containers logs"
	@echo "  install          > Install dependencies"
	@echo "  build            > Generate the Angular client dist application (html, css, js)"
	@echo "  shell            > Shell into client container"
	@echo "  tests            > Start the unit tests"
	@echo ""


start:
	@docker-compose up -d

restart: stop start

stop:
	@docker-compose kill
	@docker-compose rm -v --force

status:
	@docker-compose ps

logs:
	@docker-compose logs -f -t

install:
	@docker run --init -it --rm --user $(UID):$(GID) \
	-v $(CURDIR):/project \
	-w /project node:16-slim yarn install

build:
	@docker-compose exec client ng build

shell:
	@docker-compose exec client bash

test:
	@docker-compose exec client ng test

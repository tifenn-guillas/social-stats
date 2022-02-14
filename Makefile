UID := 1000
GID := 1000
APP=social-stats

.DEFAULT_GOAL := help


help:
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

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

##
## Useful targets:
##---------------------------------------------------------------------------
start:			## Start containers
start:
	@docker-compose up -d

restart:		## Restart containers
restart: stop start

stop:			## Stop and kill running containers
stop:
	@docker-compose kill
	@docker-compose rm -v --force

status:			## Display stack containers status
status:
	@docker-compose ps

logs:			## Display containers logs
logs:
	@docker-compose logs -f -t

install:		## Install dependencies
install:
	@docker run --init -it --rm --user $(UID):$(GID) \
	-v $(CURDIR):/project \
	-w /project node:16-slim yarn install

build:			## Generate the Angular client dist application (html, css, js)
build:
	@docker-compose exec client ng build

shell:			## Shell into client container
shell:
	@docker-compose exec --user $(UID):$(GID) client bash

test:			## Start the unit tests
test:
	@docker-compose exec client ng test --code-coverage

open-coverage:		## Open code coverage report in a browser (only available for Linux)
open-coverage:
	xdg-open ./coverage/$(APP)/index.html

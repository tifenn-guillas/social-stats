FROM node:16-slim

WORKDIR /project

# Yarn
RUN yarn global add @angular/cli
RUN ng config -g cli.packageManager yarn
RUN ng config -g cli.warnings.versionMismatch false

# Chromium
RUN apt-get update \
    && apt-get install -y --no-install-recommends chromium
ENV CHROME_BIN=chromium

COPY . /project

ARG APPLICATION_ENV='dev'
ENV APPLICATION_ENV $APPLICATION_ENV
RUN if [ "$APPLICATION_ENV" = "prod" ]; then \
        yarn && \
        echo "Settings done !" \
    ; fi

CMD ["bash"]

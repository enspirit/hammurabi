FROM denoland/deno:1.23.2 as base

WORKDIR /home/app

COPY hammurabi /usr/bin
COPY . /home/app

RUN deno vendor --no-config src/deps.ts

ENTRYPOINT ["/usr/bin/hammurabi"]

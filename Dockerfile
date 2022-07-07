FROM denoland/deno:1.23.2 as base

WORKDIR /home/app

COPY hammurabi /usr/bin
COPY . /home/app

RUN deno vendor src/deps.ts

ENTRYPOINT ["hammurabi"]

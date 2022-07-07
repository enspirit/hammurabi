FROM denoland/deno:alpine-1.23.2 as builder

WORKDIR /home/app
COPY . /home/app

RUN deno vendor src/deps.ts
RUN deno compile --import-map=vendor/import_map.json --allow-read --allow-run -o hammurabi src/main.ts

FROM denoland/deno:alpine-1.23.2 as hammurabi

COPY --from=builder /home/app/hammurabi /usr/bin/

ENTRYPOINT ["/usr/bin/hammurabi"]

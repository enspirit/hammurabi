DOCKER_TAG := $(or ${DOCKER_TAG},${DOCKER_TAG},latest)
DOCKER_REGISTRY := $(or ${DOCKER_REGISTRY},${DOCKER_REGISTRY},docker.io)

image:
	@docker build -t enspirit/hammurabi:${DOCKER_TAG} .

image.push:
	@docker tag enspirit/hammurabi:${DOCKER_TAG} ${DOCKER_REGISTRY}/enspirit/hammurabi:${DOCKER_TAG}
	@docker push ${DOCKER_REGISTRY}/enspirit/hammurabi:${DOCKER_TAG}

tests::
	@docker run -v ${PWD}:/hammurabi denoland/deno:alpine-1.23.2 deno test --allow-env --allow-read --allow-run /hammurabi

lint::
	@docker run -v ${PWD}:/hammurabi denoland/deno:alpine-1.23.2 deno lint /hammurabi


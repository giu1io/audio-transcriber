#!/bin/sh

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

TAG=$1

# build for intel x64
docker buildx build . --platform linux/amd64 -t $DOCKER_REPO/$DOCKER_IMAGE:$TAG 
docker tag $DOCKER_REPO/$DOCKER_IMAGE:$TAG $DOCKER_REPO/$DOCKER_IMAGE:latest

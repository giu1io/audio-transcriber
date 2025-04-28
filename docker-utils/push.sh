#!/bin/sh

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

TAG=$1

docker push $DOCKER_REPO/$DOCKER_IMAGE:$TAG
docker push $DOCKER_REPO/$DOCKER_IMAGE:latest

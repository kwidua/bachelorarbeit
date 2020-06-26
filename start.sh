#!/bin/bash

docker build --file Dockerfile -t bachelorarbeit .
docker run -it --init --rm -p 8000:80 -p 3000:3000 -p 4000:4000 -p 5000:5000 bachelorarbeit
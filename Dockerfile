FROM node:bookworm
WORKDIR /usr/src/app
COPY . /app
EXPOSE 3000
EXPOSE 8788
RUN apt update && apt install libc++-dev -y

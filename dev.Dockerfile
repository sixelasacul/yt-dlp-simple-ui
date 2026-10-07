# https://docs.deno.com/runtime/reference/docker/
FROM ghcr.io/denoland/deno:alpine

RUN apk -U add yt-dlp ffmpeg

# May want to install Bun as an alternative when yt-dlp needs it
# RUN curl -fsSL https://bun.com/install | BUN_INSTALL=/usr/local bash

WORKDIR /app

COPY deno.json deno.lock package.json* ./
RUN deno --version
# for some weird reason, I can't deno ci --prod --skip-types as documented
# and alpine-2.9.7 still points to deno version 2.7.4, with last major version
# of typescript and v8
RUN deno install --frozen

COPY . .

# Create the download directories inside the container
RUN mkdir -p /app/videos /app/audio

CMD ["deno", "serve", "--watch", "-P", "main.ts"]

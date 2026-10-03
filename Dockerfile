# https://docs.deno.com/runtime/reference/docker/
FROM denoland/deno:alpine

RUN doas apk -U add yt-dlp ffmpeg

# May want to install Bun as an alternative when yt-dlp needs it
# RUN curl -fsSL https://bun.com/install | BUN_INSTALL=/usr/local bash

WORKDIR /app

COPY deno.json deno.lock package.json* ./
RUN deno ci --prod --skip-types

COPY . .

# Create the download directories inside the container
RUN mkdir -p /app/videos /app/audio

CMD ["deno", "serve", "-P", "main.ts"]

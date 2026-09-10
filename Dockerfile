# Étape 1 — build : le serveur (esbuild) dans une image node
FROM node:22-slim AS build
WORKDIR /build
COPY worker/package.json ./
RUN npm install --no-audit --no-fund
COPY src ./src
COPY worker/server.ts ./server.ts
RUN npx esbuild server.ts --bundle --platform=node --format=esm --target=node20 --outfile=server.mjs --log-level=warning

# Étape 2 — runtime : ffmpeg + yt-dlp + serveur
FROM node:22-slim
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg python3 ca-certificates curl \
  && rm -rf /var/lib/apt/lists/*

RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/download/2026.06.09/yt-dlp -o /usr/local/bin/yt-dlp \
  && chmod +x /usr/local/bin/yt-dlp

WORKDIR /app
COPY --from=build /build/server.mjs ./server.mjs

ENV PORT=4000
EXPOSE 4000
CMD ["node", "server.mjs"]
# syntax=docker/dockerfile:1

# Versao web do totem (bundle estatico servido por nginx). O executavel
# Windows/Electron nao usa esta imagem.
#
#   docker build -t dux-jardim-sao-paulo-web .
#   docker run --rm -p 8080:8080 dux-jardim-sao-paulo-web
#
# VITE_* sao lidas na compilacao (nao em tempo de execucao):
#   docker build --build-arg VITE_MAQUETE_URL=https://... --build-arg VITE_IDLE_TIMEOUT_MS=120000 .

# ---------- Compilacao ----------
FROM node:24-slim AS build
WORKDIR /app

# Electron so e usado pelo app desktop: nao baixar o binario para gerar o bundle web.
ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1 \
    CI=true

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_MAQUETE_URL
ARG VITE_IDLE_TIMEOUT_MS
ENV VITE_MAQUETE_URL=$VITE_MAQUETE_URL \
    VITE_IDLE_TIMEOUT_MS=$VITE_IDLE_TIMEOUT_MS

RUN npm run build:web

# ---------- Execucao ----------
FROM nginxinc/nginx-unprivileged:stable-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1

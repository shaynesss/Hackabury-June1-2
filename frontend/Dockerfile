# syntax=docker/dockerfile:1

# ---- build stage: compile the Vite app into static assets ----
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- runtime stage: serve the static assets with nginx ----
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# BACKEND_URL is resolved at container start (see nginx.conf.template).
# Default works with docker-compose/ECS service discovery; override for other setups:
#   docker run -e BACKEND_URL=http://localhost:8000 ...
ENV BACKEND_URL=http://backend:8000

EXPOSE 80

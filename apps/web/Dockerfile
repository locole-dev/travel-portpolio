FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN npm ci

COPY apps/web ./apps/web

ARG VITE_API_BASE_URL=/api/v1
ARG VITE_ENABLE_MOCK_API=false

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_ENABLE_MOCK_API=${VITE_ENABLE_MOCK_API}

RUN npm --workspace apps/web run build

FROM nginx:1.27-alpine AS runner

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN npm ci

COPY apps/api ./apps/api

RUN npm --workspace apps/api run prisma:generate
RUN npm --workspace apps/api run build

FROM node:22-alpine AS runner

WORKDIR /app/apps/api

ENV NODE_ENV=production

COPY --from=builder /app/package.json /app/package-lock.json /app/
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/uploads ./uploads
COPY apps/api/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

EXPOSE 4000

CMD ["./docker-entrypoint.sh"]

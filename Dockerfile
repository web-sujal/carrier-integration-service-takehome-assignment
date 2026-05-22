# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable && pnpm add esbuild@0.28.0 --allow-build=esbuild && pnpm install --frozen-lockfile 
# RUN corepack enable && pnpm install --frozen-lockfile --ignore-scripts

COPY . .

RUN pnpm run build

RUN pnpm prune --prod


# Production Stage

FROM node:22-alpine AS runner

WORKDIR /app

RUN corepack enable

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/src/index.js"]
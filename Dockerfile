FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable && pnpm add esbuild@0.28.0 --allow-build=esbuild && pnpm install --frozen-lockfile 
# RUN corepack enable && pnpm install --frozen-lockfile --ignore-scripts

COPY . .

RUN pnpm run build

EXPOSE 8080

CMD ["pnpm", "start"]
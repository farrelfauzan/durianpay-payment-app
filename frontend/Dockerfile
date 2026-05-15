FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY frontend ./frontend
COPY .env .env

RUN pnpm install --frozen-lockfile

WORKDIR /app/frontend
RUN pnpm build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/frontend/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]

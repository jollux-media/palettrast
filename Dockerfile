# Palettrast — single image: API + static frontend (see scripts/railway-build.mjs)
FROM node:24-bookworm-slim AS build

WORKDIR /app

RUN npm install -g pnpm@11.3.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.json ./
COPY artifacts ./artifacts
COPY lib ./lib
COPY scripts ./scripts

ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY}

# --ignore-scripts: root preinstall checks npm_config_user_agent (unset in Docker)
RUN pnpm install --frozen-lockfile --config.minimumReleaseAge=0 --ignore-scripts
RUN pnpm rebuild

ENV NODE_ENV=production
RUN node ./scripts/railway-build.mjs

FROM node:24-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# API bundle + frontend assets in dist/public
COPY --from=build /app/artifacts/api-server/dist ./artifacts/api-server/dist

# Release-phase schema push (railway.toml releaseCommand)
COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/lib/db ./lib/db
COPY --from=build /app/scripts/railway-db-push.mjs ./scripts/railway-db-push.mjs
COPY --from=build /app/node_modules ./node_modules
RUN npm install -g pnpm@11.3.0

EXPOSE 8080

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]

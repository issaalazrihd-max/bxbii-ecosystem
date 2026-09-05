# Multi-stage build for the bxbii web app (Next.js).
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --no-frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm --filter @edusec/web build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /repo/apps/web
COPY --from=build /repo/apps/web/.next ./.next
COPY --from=build /repo/apps/web/public ./public
COPY --from=build /repo/node_modules /repo/node_modules
COPY --from=build /repo/apps/web/package.json ./package.json
EXPOSE 3000
CMD ["npx", "next", "start"]

# ---- Base deps layer (only dependency metadata) ----
FROM node:22-alpine AS deps
WORKDIR /app

# RUN apk add --no-cache openssl

COPY package.json package.json
# COPY package-lock.json package-lock.json

RUN npm install

# ---- Build layer ----
FROM node:22-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.json tsconfig.json
COPY tsconfig.build.json tsconfig.build.json
COPY nest-cli.json nest-cli.json
COPY src src
COPY package.json package.json

RUN npm run build

# ---- Production deps (prune dev) ----
FROM node:22-alpine AS prod-deps
WORKDIR /app
COPY package.json package.json
# COPY package-lock.json package-lock.json

RUN npm install
RUN npm prune --production

# ---- Runtime image ----
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# (Optional) create non-root user
# RUN addgroup -S app && adduser -S app -G app
# USER app

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json package.json

EXPOSE 3000

CMD ["node", "dist/main.js"]
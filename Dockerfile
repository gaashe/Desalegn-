FROM node:20-alpine AS base
WORKDIR /app

# Install backend dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Install frontend dependencies and build
COPY frontend/package.json frontend/package-lock.json* ./frontend/
RUN cd frontend && npm ci
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Build backend
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm ci && npm run build

# Production image
FROM node:20-alpine
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/frontend/dist ./frontend/dist
COPY --from=base /app/package.json ./
COPY --from=base /app/src/db ./src/db

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/server.js"]

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (including dev dependencies for TypeScript)
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build the TypeScript code
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy compiled output from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the application port
EXPOSE 5000

# Start the application
CMD ["node", "dist/index.js"]

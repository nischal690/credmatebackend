# Build stage
FROM node:22.11.0-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy dependency files first to leverage cache
COPY package*.json ./ 
COPY tsconfig*.json ./ 
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Add this line in your Dockerfile where you copy source files


# Build the application
RUN npm run build

# Production stage
FROM node:22.11.0-alpine AS production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Install curl for healthchecks
RUN apk add --no-cache curl

# Install openssl
RUN apk add --no-cache openssl

# Create app directory and set permissions
RUN mkdir -p /app && chown node:node /app
WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Use node user for better security
USER node

# Install dependencies for production
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate

# Expose application port
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/main"]

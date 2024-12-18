# Build stage
FROM node:20.10-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++ curl

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy dependency files first to leverage cache
COPY package*.json ./ 
COPY tsconfig*.json ./ 
COPY prisma ./prisma/

# Install dependencies with specific flags for production build
RUN npm ci --prefer-offline --no-audit

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY --chown=appuser:appgroup . .

# Build the application
RUN npm run build

# Production stage
FROM node:20.10-alpine AS production

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    TZ=UTC

# Install production dependencies
RUN apk add --no-cache \
    curl \
    openssl \
    tzdata \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create app directory and set permissions
WORKDIR /app
RUN chown appuser:appgroup /app

# Copy only necessary files from builder stage
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/package*.json ./ 
COPY --from=builder --chown=appuser:appgroup /app/prisma ./prisma

# Switch to non-root user
USER appuser

# Install production dependencies only
RUN npm ci --prefer-offline --no-audit --production && \
    npm cache clean --force

# Expose application port
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/main"]

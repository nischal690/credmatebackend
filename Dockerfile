# Build stage
FROM node:22-alpine AS builder

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
COPY src/auth/credmate.json /app/src/auth/

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

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
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "run", "start:prod"]

#!/bin/bash

# ----------------------
# KUDU Deployment Script
# ----------------------

# Installs dependencies and builds the application
cd "$DEPLOYMENT_TARGET"

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building the application..."
npm run build

# Start the application
echo "Starting the application..."
npm run start:prod

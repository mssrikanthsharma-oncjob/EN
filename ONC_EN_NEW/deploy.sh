#!/bin/bash

# Deployment script for Enstructura Consultants Platform
set -e

# Configuration
IMAGE_NAME="enstructura-consultants"
DOCKER_USERNAME="your-dockerhub-username"  # Replace with your Docker Hub username
VERSION="latest"

echo "🚀 Starting deployment process..."

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t $IMAGE_NAME:$VERSION .

# Tag for Docker Hub
echo "🏷️  Tagging image for Docker Hub..."
docker tag $IMAGE_NAME:$VERSION $DOCKER_USERNAME/$IMAGE_NAME:$VERSION

# Push to Docker Hub (requires docker login)
echo "⬆️  Pushing to Docker Hub..."
docker push $DOCKER_USERNAME/$IMAGE_NAME:$VERSION

echo "✅ Image pushed successfully!"
echo "📋 Image: $DOCKER_USERNAME/$IMAGE_NAME:$VERSION"
echo ""
echo "🌐 Deploy commands for different platforms:"
echo ""
echo "Digital Ocean App Platform:"
echo "  Use Docker Hub image: $DOCKER_USERNAME/$IMAGE_NAME:$VERSION"
echo "  Port: 80"
echo ""
echo "Railway:"
echo "  railway login"
echo "  railway link"
echo "  railway up"
echo ""
echo "Render:"
echo "  Use Docker Hub image: $DOCKER_USERNAME/$IMAGE_NAME:$VERSION"
echo "  Port: 80"
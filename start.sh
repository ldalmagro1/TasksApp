#!/usr/bin/env bash
set -e

echo "🚀 Starting NoteFlow..."

# Check Docker is available
if ! command -v docker &>/dev/null; then
  echo "❌ Docker is not installed. Please install Docker first."
  exit 1
fi

if ! command -v docker compose &>/dev/null; then
  echo "❌ Docker Compose is not installed. Please install Docker Compose v2."
  exit 1
fi

# Build and start all services
docker compose up --build -d

echo ""
echo "✅ NoteFlow is running!"
echo "   Frontend → http://localhost:5173"
echo "   Backend  → http://localhost:3000/api"
echo ""
echo "To stop the app: docker compose down"

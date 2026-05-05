#!/bin/bash

# Kill background jobs on exit
trap 'kill $(jobs -p)' EXIT

echo "🚀 Starting Raksha..."

# Start Backend
cd backend
./venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 > /dev/null 2>&1 &
echo "✅ Backend running at http://127.0.0.1:8000"

# Start Frontend
cd ../frontend
echo "✅ Starting Frontend..."
npm run dev

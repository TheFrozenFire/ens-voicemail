#!/bin/bash

# Kill any existing server on port 8001
echo "Killing any existing server on port 8001..."
lsof -ti:8001 | xargs kill -9 2>/dev/null || echo "No existing server found"

# Wait a moment for the port to be released
sleep 2

# Start the new server in the background
echo "Starting logging server on port 8001..."
nohup python3 server.py > server.log 2>&1 &

# Wait a moment for the server to start
sleep 3

# Check if server is running
if lsof -i :8001 > /dev/null 2>&1; then
    echo "✅ Server is running on port 8001"
    echo "📝 Logs will be written to debug.log"
    echo "🔍 Monitor logs with: tail -f debug.log"
else
    echo "❌ Server failed to start"
    cat server.log
fi 
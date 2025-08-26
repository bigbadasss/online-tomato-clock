#!/bin/bash

# Online Tomato - Development Server Starter

echo "🍅 Starting Online Tomato Development Server..."
echo ""

# Check if we're in the right directory
if [[ ! -f "index.html" ]]; then
    echo "❌ Error: index.html not found. Make sure you're in the Online Tomato directory."
    exit 1
fi

# Check if Python is available (most systems have it)
if command -v python3 &> /dev/null; then
    echo "🚀 Starting server with Python 3 on http://localhost:8000"
    echo "   Press Ctrl+C to stop the server"
    echo ""
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "🚀 Starting server with Python 2 on http://localhost:8000" 
    echo "   Press Ctrl+C to stop the server"
    echo ""
    python -m SimpleHTTPServer 8000
else
    echo "❌ Python not found. You can:"
    echo "   1. Install Python from https://python.org"
    echo "   2. Use 'npm install -g live-server' then 'live-server'"
    echo "   3. Or just open index.html directly in your browser"
    exit 1
fi
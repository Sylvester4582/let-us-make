#!/bin/bash

# YouMatter - Full Stack Development Setup Script

echo "🚀 Setting up YouMatter Full Stack Application..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    netstat -tuln | grep ":$1 " > /dev/null
    return $?
}

# Start backend server
echo "📦 Starting backend server..."
cd backend

# Check if backend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    npm install
fi

# Start backend in background
echo "🔧 Starting backend on port 3001..."
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Go back to frontend
cd ..

# Check if frontend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    npm install
fi

# Start frontend
echo "🎨 Starting frontend on port 5173..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ YouMatter is now running!"
echo ""
echo "🔗 Frontend: http://localhost:5173"
echo "🔗 Backend:  http://localhost:3001"
echo "🔗 API Health: http://localhost:3001/health"
echo ""
echo "📋 Features Available:"
echo "   - User Authentication (Login/Register)"
echo "   - Gamified Wellness Tracking"
echo "   - AI-Powered Motivation & Challenges"
echo "   - Real-time Leaderboard"
echo "   - Points & Level System"
echo ""
echo "🛑 To stop the servers, press Ctrl+C"
echo ""

# Wait for user interrupt
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

# Keep script running
wait
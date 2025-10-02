@echo off
echo 🚀 Setting up YouMatter Full Stack Application...

REM Check if we're in the correct directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the project root directory
    pause
    exit /b 1
)

echo 📦 Starting backend server...
cd backend

REM Check if backend dependencies are installed
if not exist "node_modules" (
    echo 📥 Installing backend dependencies...
    call npm install
)

echo 🔧 Starting backend on port 3001...
start "YouMatter Backend" cmd /k "npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Go back to frontend
cd ..

REM Check if frontend dependencies are installed
if not exist "node_modules" (
    echo 📥 Installing frontend dependencies...
    call npm install
)

echo 🎨 Starting frontend on port 5173...
start "YouMatter Frontend" cmd /k "npm run dev"

echo.
echo ✅ YouMatter is now running!
echo.
echo 🔗 Frontend: http://localhost:5173
echo 🔗 Backend:  http://localhost:3001
echo 🔗 API Health: http://localhost:3001/health
echo.
echo 📋 Features Available:
echo    - User Authentication (Login/Register)
echo    - Gamified Wellness Tracking
echo    - AI-Powered Motivation ^& Challenges
echo    - Real-time Leaderboard
echo    - Points ^& Level System
echo.
echo 🛑 Close the terminal windows to stop the servers
echo.
pause
@echo off
echo ========================================
echo Starting Project Tracker (Development)
echo ========================================
echo.
echo Backend will run on: http://localhost:3001
echo Frontend will run on: http://localhost:5173
echo.
echo Press Ctrl+C to stop both servers
echo.

start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Both servers are starting in separate windows...
echo.
pause

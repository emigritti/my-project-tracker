@echo off
echo ========================================
echo Project Tracker - Quick Start
echo ========================================
echo.

echo Step 1: Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies
    pause
    exit /b %errorlevel%
)

echo.
echo Step 2: Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Configure AWS credentials in backend\.env
echo 2. Run 'start-dev.bat' to start the application
echo.
pause

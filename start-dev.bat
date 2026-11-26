@echo off
TITLE Student Portfolio Platform - Dev Startup

echo ============================================
echo  Student Portfolio Management Platform
echo  Starting development servers...
echo ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please download Node.js ^>= 18 from https://nodejs.org/
    pause
    exit /b 1
)

REM Check node_modules exist
IF NOT EXIST "server\node_modules" (
    echo [INFO] Installing server dependencies...
    cd server
    npm install
    cd ..
)

IF NOT EXIST "client\node_modules" (
    echo [INFO] Installing client dependencies...
    cd client
    npm install --legacy-peer-deps
    cd ..
)

echo [INFO] Starting backend server (Express + PostgreSQL)...
start "Backend - Port 5000" cmd /k "cd /d %~dp0server && npm start"

REM Give the backend a moment to start PostgreSQL
echo [INFO] Waiting for backend to initialize...
timeout /t 8 /nobreak >nul

echo [INFO] Starting frontend dev server (Vite)...
start "Frontend - Port 5173" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ============================================
echo  Both servers are starting in new windows.
echo.
echo  Frontend:  http://localhost:5173
echo  Backend:   http://localhost:5000
echo  API:       http://localhost:5000/api/health
echo.
echo  Demo Accounts:
echo    Admin:   admin@college.edu / AdminPassword@123
echo    Student: keerthana.ar@college.edu / Student@123
echo ============================================
echo.
pause

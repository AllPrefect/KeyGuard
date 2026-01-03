@echo off
REM KeyGuard Project Run Script
REM This script automates the process of running KeyGuard in development mode

set "SCRIPT_DIR=%~dp0"
mkdir "%SCRIPT_DIR%\logs" 2>nul
set "LOG_FILE=%SCRIPT_DIR%\logs\keyguard-run-%DATE:/=-%_%TIME::=-%.log"

REM Initialize log file
echo Starting KeyGuard development environment at %DATE% %TIME% > "%LOG_FILE%"
echo Script directory: %SCRIPT_DIR% >> "%LOG_FILE%"
cd /d "%SCRIPT_DIR%"
cd ..

echo ========================================= >> "%LOG_FILE%"
echo        KeyGuard Password Manager >> "%LOG_FILE%"
echo ========================================= >> "%LOG_FILE%"
echo Starting development environment... >> "%LOG_FILE%"
echo ========================================= >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

echo =========================================
echo        KeyGuard Password Manager
echo =========================================
echo Starting development environment...
echo =========================================
echo.

REM Check prerequisites
echo [1/5] Checking prerequisites...
echo [1/5] Checking prerequisites... >> "%LOG_FILE%"

REM Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js first.
    echo ERROR: Node.js is not installed. Please install Node.js first. >> "%LOG_FILE%"
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo INFO: Node.js found: %NODE_VERSION%
    echo INFO: Node.js found: %NODE_VERSION% >> "%LOG_FILE%"
)

REM Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Python is not installed. Please install Python first.
    echo ERROR: Python is not installed. Please install Python first. >> "%LOG_FILE%"
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo INFO: Python found: %PYTHON_VERSION%
    echo INFO: Python found: %PYTHON_VERSION% >> "%LOG_FILE%"
)

REM Check and install frontend dependencies
echo.
echo [2/5] Checking frontend dependencies...
echo. >> "%LOG_FILE%"
echo [2/5] Checking frontend dependencies... >> "%LOG_FILE%"
cd frontend
if not exist "node_modules" (
    echo INFO: Installing frontend dependencies...
    echo INFO: Installing frontend dependencies... >> "%LOG_FILE%"
    call npm install >> "%LOG_FILE%" 2>&1
    if %ERRORLEVEL% neq 0 (
        echo ERROR: Failed to install frontend dependencies
        echo ERROR: Failed to install frontend dependencies >> "%LOG_FILE%"
        pause
        exit /b 1
    )
) else (
    echo INFO: Frontend dependencies already installed
    echo INFO: Frontend dependencies already installed >> "%LOG_FILE%"
)
cd ..

REM Check and install backend dependencies
echo.
echo [3/5] Checking backend dependencies...
echo. >> "%LOG_FILE%"
echo [3/5] Checking backend dependencies... >> "%LOG_FILE%"
if not exist "backend\venv" (
    echo INFO: Installing backend dependencies...
    echo INFO: Installing backend dependencies... >> "%LOG_FILE%"
    pip install -r backend\src\requirements.txt >> "%LOG_FILE%" 2>&1
    if %ERRORLEVEL% neq 0 (
        echo ERROR: Failed to install backend dependencies
        echo ERROR: Failed to install backend dependencies >> "%LOG_FILE%"
        pause
        exit /b 1
    )
) else (
    echo INFO: Backend dependencies already installed
    echo INFO: Backend dependencies already installed >> "%LOG_FILE%"
)

REM Start backend server
echo.
echo [4/5] Starting backend server...
echo. >> "%LOG_FILE%"
echo [4/5] Starting backend server... >> "%LOG_FILE%"
echo Starting Flask server on http://localhost:5000...
echo Starting Flask server on http://localhost:5000... >> "%LOG_FILE%"
start "KeyGuard Backend" /b python backend\src\app.py >> "%LOG_FILE%" 2>&1

REM Wait for backend to start
timeout /t 2 /nobreak >nul

REM Start frontend server
echo.
echo [5/5] Starting frontend server...
echo. >> "%LOG_FILE%"
echo [5/5] Starting frontend server... >> "%LOG_FILE%"
echo Starting Vite dev server on http://localhost:3001...
echo Starting Vite dev server on http://localhost:3001... >> "%LOG_FILE%"
echo.
echo =========================================
echo        Servers Started Successfully!
echo =========================================
echo Frontend: http://localhost:3001
echo Backend: http://localhost:5000
echo =========================================
echo.
echo Press Ctrl+C to stop the servers
echo.
echo. >> "%LOG_FILE%"
echo ========================================= >> "%LOG_FILE%"
echo        Servers Started Successfully! >> "%LOG_FILE%"
echo ========================================= >> "%LOG_FILE%"
echo Frontend: http://localhost:3001 >> "%LOG_FILE%"
echo Backend: http://localhost:5000 >> "%LOG_FILE%"
echo ========================================= >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"
echo Press Ctrl+C to stop the servers >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

REM Start frontend in current terminal
cd frontend
npm run dev

REM Cleanup if script is interrupted
cd ..
taskkill /fi "WINDOWTITLE eq KeyGuard Backend" /f >nul 2>&1
echo Servers stopped and cleaned up >> "%LOG_FILE%"

@echo off
REM KeyGuard Development Environment Starter
REM Single window version

set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."
set "LOG_FILE=%SCRIPT_DIR%logs\keyguard-run-%date:~0,4%%date:~5,2%%date:~8,2%-%time:~0,2%%time:~3,2%%time:~6,2%.log"

REM Create logs directory if not exists
if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"

echo =========================================
echo       KeyGuard Password Manager
=========================================
echo Starting development environment...
echo =========================================
echo.

REM Write to log file
(echo Starting KeyGuard development environment at %date% %time%
echo Script directory: %SCRIPT_DIR%
echo Root directory: %ROOT_DIR%
echo =========================================
echo       KeyGuard Password Manager
echo =========================================
echo Starting development environment...
echo =========================================
echo.) > "%LOG_FILE%"

REM Check prerequisites
echo [1/5] Checking prerequisites...
echo.

REM Check Node.js
echo Checking Node.js...
node --version
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js first.
    echo ERROR: Node.js is not installed. >> "%LOG_FILE%"
    pause
    exit /b 1
)

REM Check Python
echo Checking Python...
python --version
if %ERRORLEVEL% neq 0 (
    echo ERROR: Python is not installed. Please install Python first.
    echo ERROR: Python is not installed. >> "%LOG_FILE%"
    pause
    exit /b 1
)

echo.

REM Check frontend dependencies
echo [2/5] Checking frontend dependencies...
cd "%ROOT_DIR%\frontend"
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install >> "%LOG_FILE%" 2>&1
    if %ERRORLEVEL% neq 0 (
        echo ERROR: Failed to install frontend dependencies.
        echo ERROR: Failed to install frontend dependencies. >> "%LOG_FILE%"
        pause
        exit /b 1
    )
) else (
    echo Frontend dependencies already installed.
)

echo.

REM Setup backend
echo [3/5] Setting up backend...
cd "%ROOT_DIR%\backend"

REM Create virtual environment if not exists
if not exist "venv" ( 
    echo Creating virtual environment...
    python -m venv venv
    if %ERRORLEVEL% neq 0 (
        echo ERROR: Failed to create virtual environment.
        echo ERROR: Failed to create virtual environment. >> "%LOG_FILE%"
        pause
        exit /b 1
    )
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install backend dependencies
echo Installing backend dependencies...
pip install -r src\requirements.txt >> "%LOG_FILE%" 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to install backend dependencies.
    echo ERROR: Failed to install backend dependencies. >> "%LOG_FILE%"
    pause
    exit /b 1
)

echo.

REM Cleanup any existing processes
echo [4/5] Cleaning up existing processes...

REM Kill process on port 5000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000.*LISTENING"') do (
    taskkill /f /pid %%a
)

REM Kill process on port 3001
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3001.*LISTENING"') do (
    taskkill /f /pid %%a
)

echo.

REM Start servers in single window
echo [5/5] Starting servers in single window...
echo.
echo =========================================
echo Starting servers...
echo Backend will run in background
echo Frontend will run in foreground
echo =========================================
echo.

REM Start backend in background
cd "%ROOT_DIR%\backend"
start /b "KeyGuard Backend" python src\app.py

REM Wait for backend to start
echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

REM Start frontend in foreground
cd "%ROOT_DIR%\frontend"
echo Starting frontend...
echo.
echo =========================================
echo Servers started successfully!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3001
echo =========================================
echo.
echo Press Ctrl+C to stop both servers
echo.

npm run dev

@echo off
REM KeyGuard One-Click Distribution Build Tool
REM Version: 2.0
REM This script automates the process of building a distributable version of KeyGuard

set "SCRIPT_DIR=%~dp0"
set "DIST_DIR=%SCRIPT_DIR%distribute"
set "BUILD_MODE=production"
set "VERSION=1.0.0"

REM Parse command line arguments
:parse_args
if "%~1" neq "" (
    if "%~1"=="--output" (
        set "DIST_DIR=%~2"
        shift
    ) else if "%~1"=="--mode" (
        set "BUILD_MODE=%~2"
        shift
    ) else if "%~1"=="--version" (
        set "VERSION=%~2"
        shift
    ) else if "%~1"=="--help" (
        call :show_help
        exit /b 0
    )
    shift
    goto :parse_args
)

REM Change to project root directory
cd /d "%SCRIPT_DIR%"
cd ..

REM Clear screen for better readability
cls

echo =========================================
echo        KeyGuard Distribution Builder
        echo =========================================
echo Version: %VERSION%
echo Build Mode: %BUILD_MODE%
echo Output Directory: %DIST_DIR%
echo =========================================
echo.
echo Building distributable version of KeyGuard...
echo.

REM 1. Initialize log directory and file
mkdir "%SCRIPT_DIR%\logs" 2>nul
set "LOG_FILE=%SCRIPT_DIR%\logs\keyguard-build-%DATE:/=-%_%TIME::=-%.log"
echo Starting build at %DATE% %TIME% > "%LOG_FILE%"
echo Build log will be saved to: %LOG_FILE%

REM 2. Check prerequisites
echo [1/7] Checking prerequisites...

REM Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js first.
    echo ERROR: Node.js is not installed. Please install Node.js first. >> "%LOG_FILE%"
    pause
    exit /b 1
) else (
    echo INFO: Node.js found. >> "%LOG_FILE%"
)

REM Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Python is not installed. Please install Python first.
    echo ERROR: Python is not installed. Please install Python first. >> "%LOG_FILE%"
    pause
    exit /b 1
) else (
    echo INFO: Python found. >> "%LOG_FILE%"
)

REM 3. Clean previous distribution directory
echo [2/7] Cleaning previous distribution directory...
echo INFO: Cleaning previous distribution directory... >> "%LOG_FILE%"
if exist "%DIST_DIR%" (
    rd /s /q "%DIST_DIR%" >nul 2>&1
    if %ERRORLEVEL% neq 0 (
        echo WARNING: Failed to clean previous distribution directory. Continuing...
        echo WARNING: Failed to clean previous distribution directory. Continuing... >> "%LOG_FILE%"
    )
)

REM 4. Create distribution directory structure
echo [3/8] Creating distribution directory structure...
echo INFO: Creating distribution directory structure... >> "%LOG_FILE%"
mkdir "%DIST_DIR%" >nul 2>&1
mkdir "%DIST_DIR%\backend" >nul 2>&1
mkdir "%DIST_DIR%\backend\config" >nul 2>&1
mkdir "%DIST_DIR%\backend\controllers" >nul 2>&1
mkdir "%DIST_DIR%\backend\models" >nul 2>&1
mkdir "%DIST_DIR%\backend\routes" >nul 2>&1
mkdir "%DIST_DIR%\backend\utils" >nul 2>&1
mkdir "%DIST_DIR%\backend\deps" >nul 2>&1
mkdir "%DIST_DIR%\frontend" >nul 2>&1
mkdir "%DIST_DIR%\frontend\dist" >nul 2>&1
mkdir "%DIST_DIR%\data" >nul 2>&1
mkdir "%DIST_DIR%\docs" >nul 2>&1

if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to create distribution directory structure
    echo ERROR: Failed to create distribution directory structure >> "%LOG_FILE%"
    pause
    exit /b 1
)

REM 5. Install frontend dependencies if needed
echo [4/7] Checking frontend dependencies...
echo INFO: Checking frontend dependencies... >> "%LOG_FILE%"
cd frontend
if not exist "node_modules" (
    echo INFO: Installing frontend dependencies...
    echo INFO: Installing frontend dependencies... >> "%LOG_FILE%"
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo ERROR: Failed to install frontend dependencies
        echo ERROR: Failed to install frontend dependencies >> "%LOG_FILE%"
        pause
        exit /b 1
    )
)

REM 6. Build frontend application
echo [5/7] Building frontend application...
echo INFO: Building frontend application... >> "%LOG_FILE%"
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to build frontend application
    echo ERROR: Failed to build frontend application >> "%LOG_FILE%"
    pause
    exit /b 1
)
cd ..

REM 7. Install Python dependencies locally
echo [6/8] Installing Python dependencies locally...
echo INFO: Installing Python dependencies locally... >> "%LOG_FILE%"

REM Create a temporary directory for installing dependencies
set "TEMP_DEPS_DIR=%TEMP%\keyguard-deps-%RANDOM%"
mkdir "%TEMP_DEPS_DIR%" >nul 2>&1

REM Install dependencies to temporary directory
pip install -r "backend\src\requirements.txt" --target "%TEMP_DEPS_DIR%"
if %ERRORLEVEL% neq 0 (
    echo WARNING: Failed to install some dependencies. Continuing...
    echo WARNING: Failed to install some dependencies. Continuing... >> "%LOG_FILE%"
)

REM 8. Copy backend files
echo [7/8] Copying backend files...
echo INFO: Copying backend files... >> "%LOG_FILE%"

REM Copy main backend files
copy /y "backend\src\app.py" "%DIST_DIR%\backend\" >nul 2>&1
copy /y "backend\src\requirements.txt" "%DIST_DIR%\backend\" >nul 2>&1

REM Copy backend modules
copy /y "backend\src\config\config.py" "%DIST_DIR%\backend\config\" >nul 2>&1
copy /y "backend\src\controllers\password_controller.py" "%DIST_DIR%\backend\controllers\" >nul 2>&1
copy /y "backend\src\models\password.py" "%DIST_DIR%\backend\models\" >nul 2>&1
copy /y "backend\src\routes\password_routes.py" "%DIST_DIR%\backend\routes\" >nul 2>&1
copy /y "backend\src\utils\db.py" "%DIST_DIR%\backend\utils\" >nul 2>&1

REM Copy installed dependencies to backend/deps directory
xcopy /y /s "%TEMP_DEPS_DIR%" "%DIST_DIR%\backend\deps" >nul 2>&1

REM Clean up temporary dependencies directory
rd /s /q "%TEMP_DEPS_DIR%" >nul 2>&1

if %ERRORLEVEL% neq 0 (
    echo WARNING: Some backend files or dependencies may not have been copied successfully
    echo WARNING: Some backend files or dependencies may not have been copied successfully >> "%LOG_FILE%"
)

REM 9. Copy frontend files
echo [8/8] Copying frontend files...
echo INFO: Copying frontend files... >> "%LOG_FILE%"

REM Copy all frontend build files
xcopy /y /s "frontend\dist" "%DIST_DIR%\frontend\dist" >nul 2>&1

if %ERRORLEVEL% neq 0 (
    echo WARNING: Some frontend files may not have been copied successfully
    echo WARNING: Some frontend files may not have been copied successfully >> "%LOG_FILE%"
)

REM 9. Create distribution start script
echo Creating distribution start script...
echo INFO: Creating distribution start script... >> "%LOG_FILE%"
(
    echo @echo off
    echo REM KeyGuard Distribution Start Script
    echo REM Version: %VERSION%
    echo cd /d "%%~dp0"
    echo echo =========================================
    echo echo        KeyGuard Password Manager
    echo echo =========================================
    echo echo Starting KeyGuard server...
    echo echo Server will be available at http://localhost:5000
    echo echo Press Ctrl+C to stop the server
    echo echo =========================================
    echo echo.
    echo REM Start the server in the background
    echo start "KeyGuard Server" /b python backend/app.py
    echo.
    echo REM Wait for the server to start (3 seconds)
    echo echo Waiting for server to start...
    echo timeout /t 3 /nobreak >nul
    echo.
    echo REM Open the browser automatically
    echo echo Opening browser...
    echo start http://localhost:5000
    echo.
    echo REM Keep the window open to show server output
    echo echo KeyGuard server is running.
    echo echo To stop the server, press Ctrl+C in this window.
    echo echo.
    echo REM Wait for user input to keep the window open
    echo pause >nul
) > "%DIST_DIR%\start.bat"

REM 10. Create requirements install script
echo Creating requirements install script...
echo INFO: Creating requirements install script... >> "%LOG_FILE%"
(
    echo @echo off
    echo REM KeyGuard Dependencies Installation Script
    echo echo Installing KeyGuard dependencies...
    echo pip install -r backend\requirements.txt
    echo echo Dependencies installed successfully!
    echo pause
) > "%DIST_DIR%\install-deps.bat"

REM 11. Create distribution README.md
echo Creating distribution README...
echo INFO: Creating distribution README... >> "%LOG_FILE%"
(
    echo # KeyGuard - Password Management Application
    echo Version: %VERSION%
    echo Build Mode: %BUILD_MODE%
    echo.
    echo ## Quick Start
    echo.
    echo 1. If you haven't installed Python dependencies yet, double-click `install-deps.bat`
    echo 2. Double-click `start.bat` to run the application
    echo 3. Access the application at http://localhost:5000 in your browser
    echo 4. Set a strong master password to start using KeyGuard
    echo.
    echo ## Features
    echo.
    echo - Secure password storage with AES-256-CBC encryption
    echo - Responsive design for multi-device support
    echo - Password search functionality
    echo - Category management for passwords
    echo - Modern UI design
    echo - Local SQLite database storage
    echo.
    echo ## System Requirements
    echo.
    echo - Python 3.8 or higher
    echo - Node.js (only required for development)
    echo - Modern web browser
    echo.
    echo ## Troubleshooting
    echo.
    echo Q: The application won't start. What should I do?
    echo A: Make sure Python is installed and run `install-deps.bat` to install required dependencies.
    echo.
    echo Q: I can't access http://localhost:5000.
    echo A: Check if the server is running and not blocked by your firewall.
    echo.
    echo ## Security Notes
    echo.
    echo - Your passwords are encrypted locally using AES-256-CBC
    echo - Always use a strong master password
    echo - Never share your master password with anyone
    echo - Regularly back up the `data` directory
) > "%DIST_DIR%\README.md"

REM 12. Copy main README and license if available
echo Copying documentation files...
if exist "README.md" (
    copy /y "README.md" "%DIST_DIR%\docs\README-main.md" >nul 2>&1
)

if exist "LICENSE" (
    copy /y "LICENSE" "%DIST_DIR%\docs\LICENSE.md" >nul 2>&1
)

REM 13. Create version information file
echo Creating version information...
echo INFO: Creating version information... >> "%LOG_FILE%"
(
    echo Version: %VERSION%
    echo Build Date: %DATE% %TIME%
    echo Build Mode: %BUILD_MODE%
    echo Build Script Version: 2.0
) > "%DIST_DIR%\VERSION.txt"

REM 14. Clean up temporary files
echo Cleaning up temporary files...
echo INFO: Build completed successfully. >> "%LOG_FILE%"

echo.
echo =========================================
echo        Build Complete!
        echo =========================================
echo.
echo Distribution built successfully at:
echo %DIST_DIR%
echo.
echo Build Log: %LOG_FILE%
echo.
echo To run KeyGuard:
echo 1. Navigate to the distribution directory
echo 2. Run install-deps.bat (first time only)
echo 3. Double-click start.bat
echo 4. Open http://localhost:5000 in your browser
echo.
echo Advanced Usage:
echo   build-distribute.bat --help         Show this help message
echo   build-distribute.bat --output [dir]  Specify custom output directory
echo   build-distribute.bat --mode [mode]   Set build mode (production/development)
echo   build-distribute.bat --version [ver] Set custom version number
echo.
pause

REM Exit script
exit /b 0

REM Helper functions
:show_help
echo KeyGuard Distribution Builder
 echo Usage: build-distribute.bat [options]
echo.
echo Options:
echo   --help          Show this help message
echo   --output [dir]  Specify custom output directory
echo   --mode [mode]   Set build mode (production/development)
echo   --version [ver] Set custom version number
echo.
echo Example:
echo   build-distribute.bat --output "C:\KeyGuard-Dist" --version "1.0.0"
echo.
return

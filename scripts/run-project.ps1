# KeyGuard Project Run Script
# This script automates the process of running KeyGuard in development mode

$ErrorActionPreference = "Stop"

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Create logs directory if it doesn't exist
$LogsDir = Join-Path -Path $ScriptDir -ChildPath "logs"
if (-not (Test-Path -Path $LogsDir)) {
    New-Item -ItemType Directory -Path $LogsDir | Out-Null
}

# Initialize log file
$LogFileName = "keyguard-run-$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss.fff').log"
$LogFile = Join-Path -Path $LogsDir -ChildPath $LogFileName

# Start logging
Add-Content -Path $LogFile -Value "Starting KeyGuard development environment at $(Get-Date)"
Add-Content -Path $LogFile -Value "Script directory: $ScriptDir"
Add-Content -Path $LogFile -Value "Logs directory: $LogsDir"
Add-Content -Path $LogFile -Value ""

# Change to project root directory
Set-Location -Path $ScriptDir
Set-Location -Path ..

# Write to console and log
function Write-LogAndHost {
    param(
        [string]$Message,
        [string]$ForegroundColor = "White"
    )
    Write-Host $Message -ForegroundColor $ForegroundColor
    Add-Content -Path $LogFile -Value $Message
}

Write-LogAndHost "=========================================" -ForegroundColor Cyan
Write-LogAndHost "        KeyGuard Password Manager" -ForegroundColor Cyan
Write-LogAndHost "=========================================" -ForegroundColor Cyan
Write-LogAndHost "Starting development environment..." -ForegroundColor Cyan
Write-LogAndHost "=========================================" -ForegroundColor Cyan
Write-LogAndHost ""

# Check prerequisites
Write-LogAndHost "[1/5] Checking prerequisites..." -ForegroundColor Yellow

# Check if Node.js is installed
Try {
    $nodeVersion = node --version
    Write-LogAndHost "INFO: Node.js found: $nodeVersion" -ForegroundColor Green
    Add-Content -Path $LogFile -Value "Node.js version: $nodeVersion"
} Catch {
    Write-LogAndHost "ERROR: Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    Add-Content -Path $LogFile -Value "ERROR: Node.js is not installed."
    Read-Host "Press Enter to exit"
    Exit 1
}

# Check if Python is installed
Try {
    $pythonVersion = python --version
    Write-LogAndHost "INFO: Python found: $pythonVersion" -ForegroundColor Green
    Add-Content -Path $LogFile -Value "Python version: $pythonVersion"
} Catch {
    Write-LogAndHost "ERROR: Python is not installed. Please install Python first." -ForegroundColor Red
    Add-Content -Path $LogFile -Value "ERROR: Python is not installed."
    Read-Host "Press Enter to exit"
    Exit 1
}

# Check and install frontend dependencies
Write-LogAndHost ""
Write-LogAndHost "[2/5] Checking frontend dependencies..." -ForegroundColor Yellow
Set-Location -Path frontend
if (-not (Test-Path -Path "node_modules")) {
    Write-LogAndHost "INFO: Installing frontend dependencies..." -ForegroundColor Green
    Add-Content -Path $LogFile -Value "Installing frontend dependencies..."
    npm install *>> $LogFile
    if ($LASTEXITCODE -ne 0) {
        Write-LogAndHost "ERROR: Failed to install frontend dependencies" -ForegroundColor Red
        Add-Content -Path $LogFile -Value "ERROR: Failed to install frontend dependencies"
        Read-Host "Press Enter to exit"
        Exit 1
    } else {
        Add-Content -Path $LogFile -Value "Frontend dependencies installed successfully"
    }
} else {
    Write-LogAndHost "INFO: Frontend dependencies already installed" -ForegroundColor Green
    Add-Content -Path $LogFile -Value "Frontend dependencies already installed"
}
Set-Location -Path ..

# Check and install backend dependencies
Write-LogAndHost ""
Write-LogAndHost "[3/5] Checking backend dependencies..." -ForegroundColor Yellow
if (-not (Test-Path -Path "backend\venv")) {
    Write-LogAndHost "INFO: Installing backend dependencies..." -ForegroundColor Green
    Add-Content -Path $LogFile -Value "Installing backend dependencies..."
    pip install -r backend\src\requirements.txt *>> $LogFile
    if ($LASTEXITCODE -ne 0) {
        Write-LogAndHost "ERROR: Failed to install backend dependencies" -ForegroundColor Red
        Add-Content -Path $LogFile -Value "ERROR: Failed to install backend dependencies"
        Read-Host "Press Enter to exit"
        Exit 1
    } else {
        Add-Content -Path $LogFile -Value "Backend dependencies installed successfully"
    }
} else {
    Write-LogAndHost "INFO: Backend dependencies already installed" -ForegroundColor Green
    Add-Content -Path $LogFile -Value "Backend dependencies already installed"
}

# Start backend server
Write-LogAndHost ""
Write-LogAndHost "[4/5] Starting backend server..." -ForegroundColor Yellow
Write-LogAndHost "Starting Flask server on http://localhost:5000..." -ForegroundColor Green
Add-Content -Path $LogFile -Value "Starting Flask server on http://localhost:5000..."
Start-Process -NoNewWindow -Name "python" -ArgumentList "backend\src\app.py" -WindowStyle Hidden *>> $LogFile

# Wait for backend to start
Start-Sleep -Seconds 2

# Start frontend server
Write-LogAndHost ""
Write-LogAndHost "[5/5] Starting frontend server..." -ForegroundColor Yellow
Write-LogAndHost "Starting Vite dev server on http://localhost:3001..." -ForegroundColor Green
Add-Content -Path $LogFile -Value "Starting Vite dev server on http://localhost:3001..."
Write-LogAndHost ""
Write-LogAndHost "=========================================" -ForegroundColor Cyan
Write-LogAndHost "        Servers Started Successfully!" -ForegroundColor Cyan
Write-LogAndHost "=========================================" -ForegroundColor Cyan
Write-LogAndHost "Frontend: http://localhost:3001" -ForegroundColor Green
Write-LogAndHost "Backend: http://localhost:5000" -ForegroundColor Green
Write-LogAndHost "=========================================" -ForegroundColor Cyan
Write-LogAndHost ""
Write-LogAndHost "Press Ctrl+C to stop the servers" -ForegroundColor Yellow
Write-LogAndHost ""

Add-Content -Path $LogFile -Value ""
Add-Content -Path $LogFile -Value "========================================="
Add-Content -Path $LogFile -Value "        Servers Started Successfully!"
Add-Content -Path $LogFile -Value "========================================="
Add-Content -Path $LogFile -Value "Frontend: http://localhost:3001"
Add-Content -Path $LogFile -Value "Backend: http://localhost:5000"
Add-Content -Path $LogFile -Value "========================================="
Add-Content -Path $LogFile -Value ""
Add-Content -Path $LogFile -Value "Press Ctrl+C to stop the servers"
Add-Content -Path $LogFile -Value ""

# Start frontend in current terminal
Set-Location -Path frontend
npm run dev

# Cleanup if script is interrupted
Set-Location -Path ..
Stop-Process -Name "python" -ArgumentList "backend\src\app.py" -ErrorAction SilentlyContinue
Add-Content -Path $LogFile -Value "Servers stopped and cleaned up"
Add-Content -Path $LogFile -Value "Script completed at $(Get-Date)"

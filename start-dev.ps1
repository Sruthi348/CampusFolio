# Student Portfolio Platform - Dev Startup Script
# Run from the project root: d:\MCA-SEMESTER-1-WAD

param(
    [switch]$SkipInstall,
    [switch]$SeedDb
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " Student Portfolio Management Platform" -ForegroundColor Cyan
Write-Host " Starting development servers..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Host "[OK] Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js not found. Install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

$rootDir = $PSScriptRoot

# Install dependencies if needed
if (-not $SkipInstall) {
    if (-not (Test-Path "$rootDir\server\node_modules")) {
        Write-Host "[INFO] Installing server dependencies..." -ForegroundColor Yellow
        Set-Location "$rootDir\server"
        npm install
    }
    if (-not (Test-Path "$rootDir\client\node_modules")) {
        Write-Host "[INFO] Installing client dependencies..." -ForegroundColor Yellow
        Set-Location "$rootDir\client"
        npm install --legacy-peer-deps
    }
    Set-Location $rootDir
}

# Optionally seed the database
if ($SeedDb) {
    Write-Host "[INFO] Seeding database..." -ForegroundColor Yellow
    Set-Location "$rootDir\server"
    node prisma/seed.js
    Set-Location $rootDir
}

Write-Host "[INFO] Starting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\server'; npm start" -WindowStyle Normal

Write-Host "[INFO] Waiting 8 seconds for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

Write-Host "[INFO] Starting frontend dev server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\client'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " Servers started in separate windows." -ForegroundColor Green
Write-Host ""
Write-Host " Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host " Backend:   http://localhost:5000" -ForegroundColor White
Write-Host " Health:    http://localhost:5000/api/health" -ForegroundColor White
Write-Host ""
Write-Host " Admin:   admin@college.edu / AdminPassword@123" -ForegroundColor Yellow
Write-Host " Student: keerthana.ar@college.edu / Student@123" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan

# Launch InsureSync AI Backend and Frontend simultaneously
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "   Starting InsureSync AI (Backend + Frontend)    " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/2] Starting Backend on http://localhost:8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$rootDir\backend`"; .\venv\Scripts\python -m uvicorn app.main:app --reload --port 8000"

Write-Host "[2/2] Starting Frontend on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$rootDir\frontend`"; npm.cmd run dev"

Start-Sleep -Seconds 3
Write-Host "Opening http://localhost:5173 in browser..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host " Both servers are now connected and running!" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

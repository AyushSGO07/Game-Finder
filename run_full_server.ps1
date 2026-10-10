# Game Finder - Full Stack Server Launcher
# Usage: .\run_full_server.ps1

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "       Game Finder Full-Stack Server Launch       " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

# 1. Start Backend in separate process
Write-Host "`n[1/2] Launching FastAPI Backend on http://localhost:8000..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$root'; .\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload"

Start-Sleep -Seconds 2

# 2. Start Frontend in current console
Write-Host "[2/2] Launching Next.js Frontend on http://localhost:3000..." -ForegroundColor Green
Set-Location "$root\frontend"
npm run dev

@echo off
title Game Finder Server Launcher
echo ==================================================
echo       Game Finder Full-Stack Server Launch
echo ==================================================

cd /d "%~dp0"

echo [1/2] Starting FastAPI Backend on port 8000...
start "Game Finder - Backend (FastAPI)" cmd /k ".venv\Scripts\activate.bat && uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Next.js Frontend on port 3000...
cd frontend
npm run dev

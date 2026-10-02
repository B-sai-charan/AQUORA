@echo off
TITLE Aquora - Marine Debris Triage Dashboard Launcher
echo ======================================================================
echo    AQUORA: MARINE DEBRIS TRIAGE DASHBOARD (MSC ELSA 3 DEMO)
echo ======================================================================
echo.
echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "Aquora Backend (FastAPI)" cmd /k "cd backend && python main.py"

echo [2/2] Starting Vite Frontend on http://localhost:5173 ...
start "Aquora Frontend (Vite React)" cmd /k "cd frontend && npm run dev"

echo.
echo ======================================================================
echo System successfully launched!
echo - Web-GIS Dashboard: http://localhost:5173
echo - API Documentation: http://localhost:8000/docs
echo - Health Check:      http://localhost:8000/health
echo ======================================================================
pause

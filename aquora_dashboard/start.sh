#!/usr/bin/env bash
# Aquora Marine Debris Triage Dashboard Startup Script

echo "======================================================================"
echo "   AQUORA: MARINE DEBRIS TRIAGE DASHBOARD (MSC ELSA 3 DEMO)"
echo "======================================================================"
echo ""

# Trap SIGINT to kill background jobs cleanly on exit
trap 'kill $(jobs -p)' EXIT

echo "[1/2] Starting FastAPI Backend on http://localhost:8000 ..."
(cd backend && python main.py) &

echo "[2/2] Starting Vite Frontend on http://localhost:5173 ..."
(cd frontend && npm run dev) &

echo ""
echo "======================================================================"
echo "Dashboard running:"
echo "- Web-GIS UI: http://localhost:5173"
echo "- Backend API: http://localhost:8000"
echo "======================================================================"
wait

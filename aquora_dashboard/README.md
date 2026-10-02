# Aquora: Marine Debris Triage Dashboard

[![CI/CD Pipeline](https://github.com/aquora-marine/aquora-gis/actions/workflows/ci_cd.yml/badge.svg)](https://github.com/aquora-marine/aquora-gis/actions/workflows/ci_cd.yml)
[![Tests Passing](https://img.shields.io/badge/tests-7%2F7%20passed-brightgreen?logo=pytest&logoColor=white)](https://github.com/aquora-marine/aquora-gis)
[![Docker Build](https://img.shields.io/badge/Docker-Compose%20Ready-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![Python 3.10](https://img.shields.io/badge/Python-3.10-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-2.0.0-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS-v4.0-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Autonomous Web-GIS Incident Response & Satellite Multi-Spectral Triage Platform**  
> Specialized for the **MSC ELSA 3 Containerized Polymer Nurdle Spill** (13 NM Off Kochi, Kerala Shelf).

---

## Key Capabilities

- **Sentinel-2 Multi-Spectral Engine**: Level-2A Bottom-of-Atmosphere (BOA) reflectance analysis using Constrained Linear Spectral Unmixing, Floating Debris Index (FDI), and NDVI vegetation masking to isolate floating PE/PP polymer resin pellets.
- **INCOIS ROMS Big Data Streamer**: Real-time hydrodynamic current and wave vector ingestion coupled with 4th-Order Runge-Kutta (RK4) Lagrangian Particle Tracking Model (PTM) with stochastic diffusion.
- **Dynamic Ecological Sensitivity Index (ESI)**: Spatial resolver evaluating coastline and marine sanctuaries (Vembanad Lake Ramsar, Ashtamudi Estuary, Gulf of Mannar Biosphere Reserve).
- **SAMUDRA 2.0 Multilingual Advisory Generation**: Real-time broadcasts formatted for Indian Coast Guard (ICG MRCC), disaster authorities (KSDMA), and artisanal fishing fleets in English, Malayalam (മലയാളം), and Tamil (தமிழ்).
- **Executive Incident Report Export**: One-click printable PDF / HTML situation report generator adhering to Indian Coast Guard operational dispatch standards.

---

## Quick Start with Docker Compose

Run the entire platform (FastAPI backend + NetCDF cache volume + React Web-GIS frontend) with a single command:

```bash
docker compose up --build
```

### Access URLs

| Component | URL | Description |
|---|---|---|
| **Web-GIS Dashboard** | [http://localhost:5173](http://localhost:5173) | Interactive MapLibre / Mapbox tactical command HUD |
| **FastAPI REST API** | [http://localhost:8000](http://localhost:8000) | Big Data ingestion & trajectory streaming endpoints |
| **Interactive Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | Swagger UI for endpoint testing |
| **Executive Report** | [http://localhost:8000/api/export-report](http://localhost:8000/api/export-report) | Official ICG / INCOIS JSON dispatch payload |

---

## Local Development Setup

### 1. Backend (FastAPI + Python 3.10)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
python main.py
```

Run test suite:
```bash
python test_pipeline.py
```

### 2. Frontend (React 19 + Vite + TailwindCSS v4)

```bash
cd frontend
npm install
npm run dev
```

---

## CI/CD Workflow (`.github/workflows/ci_cd.yml`)

The repository includes an automated GitHub Actions pipeline executing:
1. **`backend-tests`**: Runs Python 3.10 geospatial test suite verifying NetCDF stream opening, spectral unmixing, RK4 drift, and SAMUDRA advisories (7/7 tests).
2. **`frontend-build`**: Validates Node.js 20 build and static asset bundling.
3. **`docker-build`**: Validates Docker Buildx compilation for both backend and frontend images, and validates `docker compose config`.

---

## Architecture

```
[ Sentinel-2 MSI L2A ] ───> [ Spectral Unmixing Engine (FDI/NDVI) ] ──┐
                                                                      ├──> [ Triage Matrix: P = C x ESI x (1-U) ] ──> [ Web-GIS HUD ]
[ INCOIS ROMS Streamer ] ──> [ Lagrangian PTM (RK4 + Stokes Drift) ] ──┘         │
                                                                                 ├──> [ SAMUDRA 2.0 Multilingual Alerts ]
                                                                                 └──> [ Official Incident Report Export ]
```

---

## License

MIT License © 2026 Aquora Marine Debris Triage Consortium.

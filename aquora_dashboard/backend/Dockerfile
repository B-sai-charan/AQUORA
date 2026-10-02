# ==============================================================================
# Aquora: Marine Debris Triage Dashboard — Production Backend Container
# Python 3.10 with GeoSpatial & Oceanographic Big Data Stack
# Specialized for Sentinel-2 Multi-Spectral Processing & INCOIS ROMS Streamer
# ==============================================================================

FROM python:3.10-slim

# Set environment variables to prevent bytecode generation and buffer logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

# Set working directory
WORKDIR /app

# Install system dependencies for NetCDF, HDF5, and GDAL/Rasterio compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libhdf5-dev \
    libnetcdf-dev \
    gdal-bin \
    libgdal-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements specification
COPY requirements.txt .

# Install CPU-optimized PyTorch and all Python geospatial/API dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# Copy application source code and local data caches
COPY . .

# Expose FastAPI REST service port
EXPOSE 8000

# Health check to ensure API responsiveness
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Launch Uvicorn ASGI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

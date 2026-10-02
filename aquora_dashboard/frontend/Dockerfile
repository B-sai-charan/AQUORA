# ==============================================================================
# Aquora: Marine Debris Triage Dashboard — Production Frontend Container
# Multi-Stage Build: Node.js 20 (Vite Build) -> Nginx Alpine (Production Server)
# ==============================================================================

# Stage 1: Build production static bundle
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install npm dependencies
RUN npm ci || npm install

# Copy application source tree
COPY . .

# Build Vite production distribution bundle
RUN npm run build

# Stage 2: Serve optimized bundle via lightweight Nginx Alpine
FROM nginx:alpine

# Copy custom Nginx configuration with SPA fallback and API proxying
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled Web-GIS assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose Web-GIS application port
EXPOSE 5173

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]

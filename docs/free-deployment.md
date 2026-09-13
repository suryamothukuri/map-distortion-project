# Zero-Cost Deployment Guide

## Cloudflare Pages (Frontend)
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `apps/web/dist`
- **Environment Variables**:
  - `VITE_API_BASE_URL`: URL of deployed FastAPI service (or leave empty for standalone snapshot mode).
  - `VITE_DATA_RELEASE`: `rel-2026-v1`

## Render Free Web Service (Backend API)
- **Environment**: Python 3 / Docker
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python3 -m uvicorn apps.api.app.main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/readyz`

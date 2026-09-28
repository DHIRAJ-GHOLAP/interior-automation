#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "=========================================================="
echo "  🏢 Starting InteriorFlow SaaS Platform (v2.0.0)"
echo "=========================================================="

# Activate python virtualenv
source backend/venv/bin/activate

# Build frontend if needed
if [ ! -d "frontend/dist" ]; then
    echo "📦 Building frontend production bundle..."
    cd frontend && npm run build && cd ..
fi

echo "🚀 Starting FastAPI server on http://localhost:8000 ..."
echo "👉 Client Portal, Multi-Tenant Studio ERP, BOQ & Follow-up Engine are active!"
echo "👉 Health & Observability: http://localhost:8000/api/health"
echo "👉 API Swagger Docs: http://localhost:8000/docs"
echo "=========================================================="

cd backend
exec venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000

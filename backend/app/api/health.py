import time
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database import get_db
from ..config import settings

router = APIRouter(prefix="/api/health", tags=["System Health & Observability"])

START_TIME = time.time()

@router.api_route("", methods=["GET", "HEAD"], status_code=status.HTTP_200_OK)
@router.api_route("/", methods=["GET", "HEAD"], status_code=status.HTTP_200_OK)
def health_check(db: Session = Depends(get_db)):
    db_status = "healthy"
    latency_ms = 0.0

    try:
        t0 = time.time()
        db.execute(text("SELECT 1"))
        latency_ms = round((time.time() - t0) * 1000, 2)
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    uptime_seconds = int(time.time() - START_TIME)

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENV,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "uptime_seconds": uptime_seconds,
        "database": {
            "status": db_status,
            "latency_ms": latency_ms
        }
    }

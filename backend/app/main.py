import os
import time
import uuid
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from .config import settings
from .database import engine, Base, SessionLocal
from .seed_data import seed_database
from .services.auth import get_or_create_default_tenant, get_or_create_default_user
from .api import (
    auth,
    health,
    clients,
    projects,
    materials,
    quotations,
    portal,
    followups,
    analytics,
    whatsapp,
    ai
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise Multi-Tenant SaaS for Interior Quotation, BOQ Engine, Client CRM & Automated Follow-up",
    version=settings.VERSION,
    docs_url="/docs" if settings.DEBUG or settings.ENV != "production" else "/api/docs",
    redoc_url="/redoc" if settings.DEBUG or settings.ENV != "production" else "/api/redoc"
)

@app.on_event("startup")
def on_startup():
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        seed_database(db)
        db.close()
    except Exception as e:
        print(f"Startup DB init notice: {e}")

# 3. Security & Telemetry Middlewares
class SecurityAndTracingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        start_time = time.time()
        
        response = await call_next(request)
        
        process_time = round((time.time() - start_time) * 1000, 2)
        
        # Attach tracing & security headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time"] = f"{process_time}ms"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        return response

app.add_middleware(SecurityAndTracingMiddleware)

# 4. CORS Configuration (Explicitly supports more.gholap.xyz, Cloudflare Pages, Render, and Localhost)
origins = [
    "https://more.gholap.xyz",
    "https://gholap.xyz",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8000"
]
if isinstance(settings.CORS_ORIGINS, list):
    for o in settings.CORS_ORIGINS:
        if o != "*" and o not in origins:
            origins.append(o)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.gholap\.xyz|https://gholap\.xyz|https://.*\.pages\.dev|https://.*\.onrender\.com|http://localhost:\d+|http://127\.0\.0\.1:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-Response-Time"]
)

# 5. Global Exception Handlers with explicit CORS support
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    req_id = request.headers.get("X-Request-ID", "unknown")
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred while processing your request.",
                "details": str(exc),
                "request_id": req_id
            }
        },
        headers={
            "Access-Control-Allow-Origin": origin if origin != "null" else "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

# 6. Register SaaS API Routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(clients.router)
app.include_router(projects.router)
app.include_router(materials.router)
app.include_router(quotations.router)
app.include_router(portal.router)
app.include_router(followups.router)
app.include_router(analytics.router)
app.include_router(whatsapp.router)
app.include_router(ai.router)

@app.api_route("/health", methods=["GET", "HEAD"])
@app.api_route("/ping", methods=["GET", "HEAD"])
def quick_ping():
    return {"status": "ok"}

# 7. Static SPA Mount (Production Vite Bundle)
dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
if os.path.exists(dist_dir):
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        # Do not catch API routes
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
            
        index_file = os.path.join(dist_dir, "index.html")
        file_path = os.path.join(dist_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(index_file)

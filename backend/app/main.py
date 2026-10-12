import os
import sys
import types

# Ensure backend package resolves even when running directly from backend root
_app_dir = os.path.dirname(os.path.abspath(__file__))
_backend_dir = os.path.dirname(_app_dir)
_repo_dir = os.path.dirname(_backend_dir)

for _d in [_backend_dir, _repo_dir]:
    if _d and _d not in sys.path:
        sys.path.insert(0, _d)

if "backend" not in sys.modules:
    try:
        import backend
    except ImportError:
        _backend_pkg = types.ModuleType("backend")
        _backend_pkg.__path__ = [_backend_dir]
        _backend_pkg.__file__ = os.path.join(_backend_dir, "__init__.py")
        sys.modules["backend"] = _backend_pkg

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.api.v1 import recommendations, games, auth, library

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https?://((localhost|127\.0\.0\.1)(:\d+)?|.*\.vercel\.app)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(recommendations.router, prefix=settings.API_V1_STR)
app.include_router(recommendations.router, prefix="/api")
app.include_router(games.router, prefix=f"{settings.API_V1_STR}/games", tags=["games"])
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(library.router, prefix=f"{settings.API_V1_STR}/me", tags=["user-library"])
app.include_router(library.router, prefix=f"{settings.API_V1_STR}/library", tags=["library"])



@app.get(f"{settings.API_V1_STR}/health", tags=["system"])
async def health_check():
    """Health diagnostic probe."""
    return {
        "status": "ok",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION
    }


@app.get("/", tags=["system"])
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs_url": "/docs",
        "health_check": f"{settings.API_V1_STR}/health"
    }

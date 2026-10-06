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
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(recommendations.router, prefix=settings.API_V1_STR)
app.include_router(games.router, prefix=f"{settings.API_V1_STR}/games", tags=["games"])
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(library.router, prefix=f"{settings.API_V1_STR}/me", tags=["user-library"])



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

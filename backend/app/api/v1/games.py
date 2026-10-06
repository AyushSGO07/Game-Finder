"""API routes for game metadata, search, and enrichment."""

import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status

from backend.app.schemas.game import (
    BatchEnrichRequest,
    BatchEnrichResponse,
    GameDetail,
    GameSearchResponse,
)
from backend.app.services.game_service import game_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/search",
    response_model=GameSearchResponse,
    status_code=status.HTTP_200_OK,
    summary="Search games catalog",
    description="Search Steam catalog by title with genre filtering, minimum rating thresholds, and pagination.",
)
async def search_games(
    q: str = Query(..., min_length=1, max_length=100, description="Game search query"),
    genre: Optional[str] = Query(None, max_length=50, description="Genre filter (e.g. Action, RPG)"),
    min_rating: Optional[float] = Query(
        None, ge=0.0, le=100.0, description="Minimum Metacritic score (0-100)"
    ),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=50, description="Items per page"),
) -> GameSearchResponse:
    """Execute global game search and filtering."""
    try:
        return await game_service.search_and_filter(
            query=q,
            genre=genre,
            min_rating=min_rating,
            page=page,
            page_size=page_size,
        )
    except Exception as exc:
        logger.error("Error executing game search for '%s': %s", q, exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to execute game search at this time",
        )


@router.get(
    "/{app_id}",
    response_model=GameDetail,
    status_code=status.HTTP_200_OK,
    summary="Get game details by AppID",
    description="Retrieve comprehensive metadata, trailers, screenshots, and system requirements for a Steam AppID.",
)
async def get_game(app_id: int) -> GameDetail:
    """Retrieve full game details by Steam AppID."""
    try:
        detail = await game_service.get_game_details(app_id)
        if detail is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Game with AppID {app_id} was not found",
            )
        return detail
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Error retrieving game details for %s: %s", app_id, exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to fetch game details at this time",
        )


@router.post(
    "/batch",
    response_model=BatchEnrichResponse,
    status_code=status.HTTP_200_OK,
    summary="Batch enrich game titles",
    description="Enrich a list of game titles with capsules, artwork, and metadata, using fallbacks when needed.",
)
async def batch_enrich(request: BatchEnrichRequest) -> BatchEnrichResponse:
    """Enrich a list of game titles concurrently."""
    try:
        cards = await game_service.batch_enrich_games(request.titles)
        return BatchEnrichResponse(games=cards)
    except Exception as exc:
        logger.error("Error during batch game enrichment: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to enrich games at this time",
        )

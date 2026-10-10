"""API routes for game metadata, search, and enrichment."""

import logging
from typing import List, Optional, Union
from fastapi import APIRouter, HTTPException, Query, status

from backend.app.schemas.game import (
    BatchEnrichRequest,
    BatchEnrichResponse,
    GameCard,
    GameDetail,
    GameSearchResponse,
    GotyYearArchive,
    HeroSlide,
    GenreTile,
)
from backend.app.services.game_service import game_service
from backend.app.services.supabase_service import supabase_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/featured",
    response_model=List[HeroSlide],
    status_code=status.HTTP_200_OK,
    summary="Get featured showcase games",
    description="Retrieve curated hero slides for store hero carousel.",
)
async def get_featured() -> List[HeroSlide]:
    """Retrieve featured games for hero presentation."""
    try:
        return await game_service.get_featured_games()
    except Exception as exc:
        logger.error("Error retrieving featured games: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to fetch featured games at this time",
        )


@router.get(
    "/shelves/{category}",
    response_model=List[GameCard],
    status_code=status.HTTP_200_OK,
    summary="Get category shelf games",
    description="Retrieve games for a specific store shelf category (trending, new_releases, top_rated, hidden_gems, popular).",
)
async def get_shelf(category: str) -> List[GameCard]:
    """Retrieve games for a specific discovery shelf."""
    try:
        return await game_service.get_shelf_games(category)
    except Exception as exc:
        logger.error("Error retrieving shelf '%s': %s", category, exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to fetch shelf games at this time",
        )


@router.get(
    "/genres",
    response_model=List[GenreTile],
    status_code=status.HTTP_200_OK,
    summary="Get store genre hubs",
    description="Retrieve 12 structured genre tiles for store discovery.",
)
async def get_genres() -> List[GenreTile]:
    """Retrieve genre hubs for store discovery."""
    try:
        return await game_service.get_genres()
    except Exception as exc:
        logger.error("Error retrieving genre hubs: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to fetch genre hubs at this time",
        )


@router.get(
    "/discover",
    response_model=GameSearchResponse,
    status_code=status.HTTP_200_OK,
    summary="Discover games across store catalog",
    description="Explore games with full search, genre filtering, minimum rating, and sorting options.",
)
async def discover_games(
    q: Optional[str] = Query(None, max_length=100, description="Optional search query"),
    genre: Optional[str] = Query(None, max_length=50, description="Genre filter"),
    min_rating: Optional[float] = Query(None, ge=0.0, le=100.0, description="Minimum rating"),
    sort_by: str = Query("popularity", description="Sort criteria (popularity, rating, newest, title)"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(12, ge=1, le=50, description="Items per page"),
) -> GameSearchResponse:
    """Explore and filter catalog games."""
    try:
        return await game_service.discover_games(
            query=q,
            genre=genre,
            min_rating=min_rating,
            sort_by=sort_by,
            page=page,
            page_size=page_size,
        )
    except Exception as exc:
        logger.error("Error discovering games: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to discover games at this time",
        )



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
    "/goty",
    response_model=List[GotyYearArchive],
    status_code=status.HTTP_200_OK,
    summary="Get Game of the Year (GOTY) historical archive",
    description="Retrieve curated annual winners and runner-up nominees from 2014 to present.",
)
async def get_goty_archive() -> List[GotyYearArchive]:
    """Retrieve GOTY winners and nominees archive."""
    try:
        archive = supabase_service.get_goty_archive()
        return [GotyYearArchive(**entry) for entry in archive]
    except Exception as exc:
        logger.error("Error retrieving GOTY archive: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to fetch GOTY archive at this time",
        )


@router.get(
    "/{app_id}",
    response_model=GameDetail,
    status_code=status.HTTP_200_OK,
    summary="Get game details by AppID or slug",
    description="Retrieve comprehensive metadata, trailers, screenshots, and system requirements for a game identifier.",
)
async def get_game(app_id: Union[int, str]) -> GameDetail:
    """Retrieve full game details by Steam AppID or identifier."""
    try:
        parsed_id: Union[int, str] = int(app_id) if str(app_id).isdigit() else app_id
        detail = await game_service.get_game_details(parsed_id)
        if detail is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Game '{app_id}' was not found in catalog",
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

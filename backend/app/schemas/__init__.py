"""Schemas package exporting recommendation and game schemas."""

from backend.app.schemas.recommendation import (
    GameRecommendation,
    RecommendationRequest,
    RecommendationResponse,
)
from backend.app.schemas.game import (
    BatchEnrichRequest,
    BatchEnrichResponse,
    GameCard,
    GameDetail,
    GameSearchResponse,
    MovieItem,
    ScreenshotItem,
    SteamSearchResult,
    SteamSearchResultItem,
)

__all__ = [
    "GameRecommendation",
    "RecommendationRequest",
    "RecommendationResponse",
    "BatchEnrichRequest",
    "BatchEnrichResponse",
    "GameCard",
    "GameDetail",
    "GameSearchResponse",
    "MovieItem",
    "ScreenshotItem",
    "SteamSearchResult",
    "SteamSearchResultItem",
]

import logging
from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
)
from backend.app.services.recommendation_service import (
    RecommendationService,
    RecommendationError,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


def get_recommendation_service() -> RecommendationService:
    """Dependency providing a RecommendationService instance."""
    return RecommendationService()


@router.post(
    "",
    response_model=RecommendationResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate AI Video Game Recommendations",
    description="Accepts genre, age rating, difficulty, and optional player notes to return 8 structured game recommendations."
)
async def generate_recommendations(
    request: RecommendationRequest,
    service: RecommendationService = Depends(get_recommendation_service)
) -> RecommendationResponse:
    try:
        response = await service.get_recommendations(request)
        return response
    except RecommendationError as re:
        logger.warning(f"Recommendation generation error: {re}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The AI recommendation service is temporarily unavailable. Please try again."
        )
    except Exception as e:
        logger.error(f"Unexpected error in recommendation endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while generating recommendations."
        )

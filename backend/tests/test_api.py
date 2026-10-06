from unittest.mock import AsyncMock, MagicMock
import pytest
from backend.app.core.config import settings
from backend.app.schemas.recommendation import GameRecommendation, RecommendationResponse
from backend.app.services.recommendation_service import (
    RecommendationService,
    RecommendationError,
)
from backend.app.api.v1.recommendations import get_recommendation_service
from backend.app.main import app


MOCK_GAMES = [
    GameRecommendation(
        name=f"Game Title {i}",
        match_reason=f"Matches because of feature {i}",
        attributes=["Action", "Multiplayer"]
    )
    for i in range(1, 9)
]


def test_post_recommendations_success(client):
    mock_service = MagicMock(spec=RecommendationService)
    mock_service.get_recommendations = AsyncMock(
        return_value=RecommendationResponse(
            recommendations=MOCK_GAMES,
            query_genre="Action",
            query_difficulty="Normal",
            query_age="Teen"
        )
    )

    app.dependency_overrides[get_recommendation_service] = lambda: mock_service

    try:
        response = client.post(
            f"{settings.API_V1_STR}/recommendations",
            json={
                "genre": "Action",
                "age": "Teen",
                "difficulty": "Normal"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["recommendations"]) == 8
        assert data["query_genre"] == "Action"
        assert data["recommendations"][0]["name"] == "Game Title 1"
    finally:
        app.dependency_overrides.clear()


def test_post_recommendations_with_prompt(client):
    mock_service = MagicMock(spec=RecommendationService)
    mock_service.get_recommendations = AsyncMock(
        return_value=RecommendationResponse(
            recommendations=MOCK_GAMES,
            query_genre="RPG",
            query_difficulty="Hard",
            query_age="Mature"
        )
    )

    app.dependency_overrides[get_recommendation_service] = lambda: mock_service

    try:
        response = client.post(
            f"{settings.API_V1_STR}/recommendations",
            json={
                "genre": "RPG",
                "age": "Mature",
                "difficulty": "Hard",
                "prompt": "Dark fantasy with deep lore"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["recommendations"]) == 8
    finally:
        app.dependency_overrides.clear()


def test_post_recommendations_validation_error(client):
    response = client.post(
        f"{settings.API_V1_STR}/recommendations",
        json={
            "genre": "FakeGenre123",
            "age": "Teen",
            "difficulty": "Normal"
        }
    )
    assert response.status_code == 422


def test_post_recommendations_upstream_failure(client):
    mock_service = MagicMock(spec=RecommendationService)
    mock_service.get_recommendations = AsyncMock(
        side_effect=RecommendationError("Upstream model rate limit exceeded")
    )

    app.dependency_overrides[get_recommendation_service] = lambda: mock_service

    try:
        response = client.post(
            f"{settings.API_V1_STR}/recommendations",
            json={
                "genre": "Action",
                "age": "Teen",
                "difficulty": "Normal"
            }
        )
        assert response.status_code == 503
        data = response.json()
        assert "temporarily unavailable" in data["detail"]
        # Confirm no API keys or raw error traces leaked
        assert "rate limit exceeded" not in data["detail"]
    finally:
        app.dependency_overrides.clear()

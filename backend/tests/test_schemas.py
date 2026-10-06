import pytest
from pydantic import ValidationError
from backend.app.schemas.recommendation import (
    RecommendationRequest,
    GameRecommendation,
    RecommendationResponse,
)


def test_valid_recommendation_request():
    req = RecommendationRequest(
        genre="RPG",
        age="Teen",
        difficulty="Normal",
        prompt="Immersive world"
    )
    assert req.genre == "RPG"
    assert req.age == "Teen"
    assert req.difficulty == "Normal"
    assert req.prompt == "Immersive world"


def test_invalid_genre_rejected():
    with pytest.raises(ValueError):
        RecommendationRequest(
            genre="NotARealGenre",
            age="Teen",
            difficulty="Normal"
        )


def test_invalid_difficulty_rejected():
    with pytest.raises(ValueError):
        RecommendationRequest(
            genre="Action",
            age="Teen",
            difficulty="ImpossibleDifficulty"
        )


def test_invalid_age_rating_rejected():
    with pytest.raises(ValueError):
        RecommendationRequest(
            genre="Action",
            age="Toddler",
            difficulty="Normal"
        )


def test_valid_recommendation_response_with_8_games():
    games = [
        GameRecommendation(
            name=f"Game {i}",
            match_reason=f"Fits because of reason {i}",
            attributes=["RPG", "Adventure"]
        )
        for i in range(1, 9)
    ]
    resp = RecommendationResponse(
        recommendations=games,
        query_genre="RPG",
        query_difficulty="Normal",
        query_age="Teen"
    )
    assert len(resp.recommendations) == 8


def test_invalid_recommendation_response_with_non_8_games():
    # 7 games should fail
    games_7 = [
        GameRecommendation(
            name=f"Game {i}",
            match_reason=f"Reason {i}",
            attributes=["Action"]
        )
        for i in range(1, 8)
    ]
    with pytest.raises(ValidationError):
        RecommendationResponse(
            recommendations=games_7,
            query_genre="Action",
            query_difficulty="Normal",
            query_age="Teen"
        )

    # 9 games should fail
    games_9 = [
        GameRecommendation(
            name=f"Game {i}",
            match_reason=f"Reason {i}",
            attributes=["Action"]
        )
        for i in range(1, 10)
    ]
    with pytest.raises(ValidationError):
        RecommendationResponse(
            recommendations=games_9,
            query_genre="Action",
            query_difficulty="Normal",
            query_age="Teen"
        )

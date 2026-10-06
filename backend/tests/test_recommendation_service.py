import json
import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from backend.app.schemas.recommendation import RecommendationRequest
from backend.app.services.recommendation_service import (
    RecommendationService,
    RecommendationError,
    clean_json_markdown,
)


SAMPLE_8_GAMES = [
    {
        "name": f"Epic Game {i}",
        "match_reason": f"Matches genre and difficulty criteria {i}",
        "attributes": ["Exciting", "Atmospheric"]
    }
    for i in range(1, 9)
]


def test_clean_json_markdown_fences():
    raw_markdown = f"```json\n{json.dumps(SAMPLE_8_GAMES)}\n```"
    cleaned = clean_json_markdown(raw_markdown)
    data = json.loads(cleaned)
    assert len(data) == 8
    assert data[0]["name"] == "Epic Game 1"


def test_clean_json_markdown_with_prefix_text():
    raw_text = f"Here are your recommendations:\n```json\n{json.dumps(SAMPLE_8_GAMES)}\n```\nEnjoy playing!"
    cleaned = clean_json_markdown(raw_text)
    data = json.loads(cleaned)
    assert len(data) == 8
    assert data[0]["name"] == "Epic Game 1"


@pytest.mark.asyncio
async def test_successful_recommendation():
    service = RecommendationService(api_key="mock-api-key")
    mock_llm_output = json.dumps(SAMPLE_8_GAMES)
    
    mock_chain = MagicMock()
    mock_chain.ainvoke = AsyncMock(return_value=mock_llm_output)
    
    with patch.object(service, "get_chain", return_value=mock_chain):
        req = RecommendationRequest(
            genre="RPG",
            age="Teen",
            difficulty="Normal"
        )
        response = await service.get_recommendations(req)
        
        assert len(response.recommendations) == 8
        assert response.query_genre == "RPG"
        assert response.recommendations[0].name == "Epic Game 1"
        assert response.recommendations[0].attributes == ["Exciting", "Atmospheric"]


@pytest.mark.asyncio
async def test_missing_api_key_raises_error():
    service = RecommendationService(api_key="")
    req = RecommendationRequest(genre="Action", age="Teen", difficulty="Normal")
    
    with pytest.raises(RecommendationError, match="GEMINI_API_KEY is not configured"):
        await service.get_recommendations(req)


@pytest.mark.asyncio
async def test_malformed_json_raises_error():
    service = RecommendationService(api_key="mock-api-key")
    
    mock_chain = MagicMock()
    mock_chain.ainvoke = AsyncMock(return_value="Sorry, I could not find games matching that criteria.")
    
    with patch.object(service, "get_chain", return_value=mock_chain):
        req = RecommendationRequest(genre="RPG", age="Teen", difficulty="Normal")
        with pytest.raises(RecommendationError, match="Could not parse AI output as JSON"):
            await service.get_recommendations(req)


@pytest.mark.asyncio
async def test_retry_on_transient_503_error():
    service = RecommendationService(api_key="mock-api-key")
    mock_llm_output = json.dumps(SAMPLE_8_GAMES)
    
    mock_chain = MagicMock()
    mock_chain.ainvoke = AsyncMock(side_effect=[
        Exception("503 Service Unavailable"),
        mock_llm_output
    ])
    
    with patch.object(service, "get_chain", return_value=mock_chain):
        with patch("asyncio.sleep", new_callable=AsyncMock) as mock_sleep:
            req = RecommendationRequest(genre="RPG", age="Teen", difficulty="Normal")
            response = await service.get_recommendations(req)
            
            assert len(response.recommendations) == 8
            assert mock_chain.ainvoke.call_count == 2
            assert mock_sleep.call_count == 1

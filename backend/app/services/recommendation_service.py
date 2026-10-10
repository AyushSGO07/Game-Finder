import os
import re
import json
import asyncio
from typing import List, Optional
from langchain_core.prompts import load_prompt
from langchain_google_genai import GoogleGenerativeAI

from backend.app.core.config import settings
from backend.app.schemas.recommendation import (
    RecommendationRequest,
    GameRecommendation,
    RecommendationResponse,
)


class RecommendationError(Exception):
    """Domain exception raised when game recommendation generation fails."""
    pass


def clean_json_markdown(text: str) -> str:
    """Strip markdown code block fences and isolate the valid JSON array."""
    cleaned = text.strip()
    
    # Strip leading code fences
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
        
    # Strip trailing code fences
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
        
    cleaned = cleaned.strip()
    
    # If there's still surrounding commentary, use regex to extract the JSON array
    if not (cleaned.startswith("[") and cleaned.endswith("]")):
        match = re.search(r'\[\s*\{.*\}\s*\]', cleaned, re.DOTALL)
        if match:
            cleaned = match.group(0).strip()
            
    return cleaned


class RecommendationService:
    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = api_key if api_key is not None else settings.GEMINI_API_KEY
        self.model_name = model_name or settings.GEMINI_MODEL
        
        current_dir = os.path.dirname(os.path.abspath(__file__))
        prompt_path = os.path.join(os.path.dirname(current_dir), "prompts", "prompt.json")
        self.prompt_template = load_prompt(prompt_path)

    def _get_llm(self) -> GoogleGenerativeAI:
        if not self.api_key or self.api_key == "your-gemini-api-key-here":
            raise RecommendationError(
                "GEMINI_API_KEY is not configured. Please set GEMINI_API_KEY in the environment or .env file."
            )
        return GoogleGenerativeAI(
            model=self.model_name,
            google_api_key=self.api_key,
            temperature=0.4,
            max_retries=5
        )

    def get_chain(self):
        """Construct the LangChain prompt | llm sequence."""
        llm = self._get_llm()
        return self.prompt_template | llm

    async def get_recommendations(self, request: RecommendationRequest) -> RecommendationResponse:
        """Generate exactly 8 video game recommendations matching the input criteria."""
        chain = self.get_chain()

        inputs = {
            "genre": request.genre,
            "age": request.age,
            "difficulty": request.difficulty
        }

        # If user supplied platform or freeform prompt, augment context
        context_notes = []
        if request.platform and request.platform.lower() != "any":
            context_notes.append(f"Target Platform: {request.platform}")
        if request.prompt:
            context_notes.append(f"Theme / Player note: {request.prompt.strip()}")

        if context_notes:
            inputs["genre"] = f"{request.genre} ({'; '.join(context_notes)})"

        raw_output = None
        max_attempts = 4

        for attempt in range(max_attempts):
            try:
                # LangChain async invocation
                raw_output = await chain.ainvoke(inputs)
                break
            except Exception as e:
                err_str = str(e)
                if ("503" in err_str or "429" in err_str or "ResourceExhausted" in err_str) and attempt < max_attempts - 1:
                    await asyncio.sleep(1.5 * (attempt + 1))
                    continue
                raise RecommendationError(f"Failed to query AI recommendation model: {err_str}") from e

        if not raw_output:
            raise RecommendationError("AI recommendation model returned empty response.")

        cleaned_text = clean_json_markdown(raw_output)

        try:
            parsed_data = json.loads(cleaned_text)
        except json.JSONDecodeError as jde:
            raise RecommendationError(f"Could not parse AI output as JSON: {jde}. Raw output: {raw_output[:200]}") from jde

        if not isinstance(parsed_data, list):
            raise RecommendationError(f"Expected a JSON list of games, got {type(parsed_data).__name__}")

        games: List[GameRecommendation] = []
        for item in parsed_data:
            if not isinstance(item, dict) or "name" not in item:
                continue
            games.append(
                GameRecommendation(
                    name=item.get("name", "Unknown Title"),
                    match_reason=item.get("match_reason", "Recommended match based on your preferences."),
                    attributes=item.get("attributes", [])
                )
            )

        if len(games) != 8:
            # If the model returned slightly different count, slice or pad if >= 8, else raise error
            if len(games) > 8:
                games = games[:8]
            else:
                raise RecommendationError(f"Expected exactly 8 game recommendations, but model produced {len(games)}.")

        # Enrich recommendations against genuine catalog / Steam metadata
        try:
            from backend.app.services.game_service import game_service
            for idx, game in enumerate(games):
                try:
                    card = await game_service.enrich_game(title=game.name)
                    if card:
                        game.id = card.steam_appid or card.id or (idx + 1)
                        game.steam_appid = card.steam_appid
                        game.header_image = card.header_image or card.capsule_image
                        game.capsule_image = card.capsule_image or card.header_image
                        game.rating = card.rating
                        game.release_date = card.release_date
                        game.developer = card.developer
                        if card.steam_appid:
                            game.store_url = f"https://store.steampowered.com/app/{card.steam_appid}/"
                except Exception:
                    if game.id is None:
                        game.id = idx + 1
        except Exception:
            pass

        return RecommendationResponse(
            recommendations=games,
            query_genre=request.genre,
            query_difficulty=request.difficulty,
            query_age=request.age,
            query_platform=request.platform
        )

from typing import List, Optional, Union
from pydantic import BaseModel, Field, field_validator


ALLOWED_GENRES = {
    "Action", "RPG", "Adventure", "Shooter", "Horror", "Strategy",
    "Simulation", "Racing", "Sports", "Indie", "Puzzle", "Platformer", "Any"
}

ALLOWED_AGE_RATINGS = {
    "Everyone", "Everyone 10+", "Teen", "Mature", "Any"
}

ALLOWED_DIFFICULTIES = {
    "Casual", "Normal", "Hard", "Punishing", "Any"
}

ALLOWED_PLATFORMS = {
    "PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile", "Any"
}


class RecommendationRequest(BaseModel):
    genre: str = Field(..., description="Target game genre")
    age: str = Field(..., description="Target age rating")
    difficulty: str = Field(..., description="Target gameplay difficulty")
    platform: Optional[str] = Field(None, description="Target gaming platform (e.g. PC, PlayStation, Xbox, Nintendo Switch, Any)")
    prompt: Optional[str] = Field(None, description="Optional natural language guidance or theme")

    @field_validator("genre")
    @classmethod
    def validate_genre(cls, v: str) -> str:
        formatted = v.strip().title()
        if formatted not in ALLOWED_GENRES and v.strip() not in ALLOWED_GENRES:
            raise ValueError(f"Genre '{v}' not allowed. Must be one of: {sorted(list(ALLOWED_GENRES))}")
        return v.strip()

    @field_validator("age")
    @classmethod
    def validate_age(cls, v: str) -> str:
        cleaned = v.strip()
        if cleaned not in ALLOWED_AGE_RATINGS:
            raise ValueError(f"Age rating '{v}' not allowed. Must be one of: {sorted(list(ALLOWED_AGE_RATINGS))}")
        return cleaned

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, v: str) -> str:
        formatted = v.strip().title()
        if formatted not in ALLOWED_DIFFICULTIES and v.strip() not in ALLOWED_DIFFICULTIES:
            raise ValueError(f"Difficulty '{v}' not allowed. Must be one of: {sorted(list(ALLOWED_DIFFICULTIES))}")
        return formatted

    @field_validator("platform")
    @classmethod
    def validate_platform(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        cleaned = v.strip()
        matched = next((p for p in ALLOWED_PLATFORMS if p.lower() == cleaned.lower()), None)
        if not matched:
            raise ValueError(f"Platform '{v}' not allowed. Must be one of: {sorted(list(ALLOWED_PLATFORMS))}")
        return matched


class GameRecommendation(BaseModel):
    name: str = Field(..., description="Official title of the recommended game")
    match_reason: str = Field(..., description="Rationale explaining why the game fits the user preferences")
    attributes: List[str] = Field(default_factory=list, description="Key attributes and tags for the game")
    id: Optional[Union[str, int]] = Field(None, description="Unique catalog or Steam identifier")
    steam_appid: Optional[int] = Field(None, description="Steam AppID if available")
    header_image: Optional[str] = Field(None, description="Header banner image URL")
    capsule_image: Optional[str] = Field(None, description="Cover capsule image URL")
    hero_image: Optional[str] = Field(None, description="High-res background hero URL")
    rating: Optional[float] = Field(None, description="Metacritic or review rating")
    release_date: Optional[str] = Field(None, description="Game release date")
    store_url: Optional[str] = Field(None, description="Storefront page link")
    developer: Optional[str] = Field(None, description="Studio developer")
    publisher: Optional[str] = Field(None, description="Game publisher")


class RecommendationResponse(BaseModel):
    recommendations: List[GameRecommendation] = Field(
        ...,
        description="Exactly 8 recommended video games"
    )
    query_genre: str = Field(..., description="Echoed queried genre")
    query_difficulty: str = Field(..., description="Echoed queried difficulty")
    query_age: str = Field(..., description="Echoed queried age rating")
    query_platform: Optional[str] = Field(None, description="Echoed queried platform")

    @field_validator("recommendations")
    @classmethod
    def validate_count(cls, v: List[GameRecommendation]) -> List[GameRecommendation]:
        if len(v) != 8:
            raise ValueError(f"Recommendation response must contain exactly 8 games, got {len(v)}")
        return v

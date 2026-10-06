from typing import List, Optional
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


class RecommendationRequest(BaseModel):
    genre: str = Field(..., description="Target game genre")
    age: str = Field(..., description="Target age rating")
    difficulty: str = Field(..., description="Target gameplay difficulty")
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


class GameRecommendation(BaseModel):
    name: str = Field(..., description="Official title of the recommended game")
    match_reason: str = Field(..., description="Rationale explaining why the game fits the user preferences")
    attributes: List[str] = Field(default_factory=list, description="Key attributes and tags for the game")


class RecommendationResponse(BaseModel):
    recommendations: List[GameRecommendation] = Field(
        ...,
        description="Exactly 8 recommended video games"
    )
    query_genre: str = Field(..., description="Echoed queried genre")
    query_difficulty: str = Field(..., description="Echoed queried difficulty")
    query_age: str = Field(..., description="Echoed queried age rating")

    @field_validator("recommendations")
    @classmethod
    def validate_count(cls, v: List[GameRecommendation]) -> List[GameRecommendation]:
        if len(v) != 8:
            raise ValueError(f"Recommendation response must contain exactly 8 games, got {len(v)}")
        return v

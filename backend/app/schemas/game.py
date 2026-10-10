"""Game metadata schemas for Game Finder."""

from typing import Dict, List, Optional, Union
from pydantic import BaseModel, ConfigDict, Field, computed_field


class ScreenshotItem(BaseModel):
    """Screenshot item representation."""
    model_config = ConfigDict(from_attributes=True)

    id: int = Field(description="Unique screenshot ID")
    path_thumbnail: str = Field(description="URL for thumbnail resolution image")
    path_full: str = Field(description="URL for full resolution image")


class MovieItem(BaseModel):
    """Trailer / Movie preview representation."""
    model_config = ConfigDict(from_attributes=True)

    id: int = Field(description="Unique movie ID")
    name: str = Field(description="Trailer title")
    thumbnail: str = Field(description="Trailer poster thumbnail URL")
    mp4_url: Optional[str] = Field(default=None, description="MP4 stream/file URL")
    webm_url: Optional[str] = Field(default=None, description="WebM stream/file URL")


class GameCard(BaseModel):
    """Minimal game representation for cards, carousels, and grid displays."""
    model_config = ConfigDict(from_attributes=True)

    id: Union[int, str] = Field(description="Game identifier (Steam AppID or unique slug)")
    steam_appid: Optional[int] = Field(default=None, description="Steam AppID if available")
    title: str = Field(description="Game title")
    header_image: Optional[str] = Field(default=None, description="Header banner image URL")
    capsule_image: Optional[str] = Field(default=None, description="Capsule poster image URL")
    hero_image: Optional[str] = Field(default=None, description="Hero backdrop image URL")
    genres: List[str] = Field(default_factory=list, description="Associated genres")
    rating: Optional[float] = Field(default=None, description="Score or rating (e.g. 0-100)")
    release_date: Optional[str] = Field(default=None, description="Release date string")
    short_description: Optional[str] = Field(default=None, description="Short summary snippet")
    price_overview: Optional[str] = Field(default=None, description="Formatted price or Free")
    price: Optional[str] = Field(default=None, description="Price string")
    developer: Optional[str] = Field(default=None, description="Developer")
    publisher: Optional[str] = Field(default=None, description="Publisher")


class HeroSlide(BaseModel):
    """Slide item representation for store hero carousels."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    steam_appid: Optional[int] = None
    title: str
    backdrop_url: str
    logo_url: Optional[str] = None
    rating: float = 9.0
    genres: List[str] = Field(default_factory=list)
    synopsis: str = ""
    store_url: Optional[str] = None
    release_date: Optional[str] = None


class GenreTile(BaseModel):
    """Tile representation for store genre exploration hubs."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    slug: str
    iconName: str
    gradient: str
    description: str
    accentColor: str



class GameDetail(BaseModel):
    """Comprehensive game metadata representation for game detail pages."""
    model_config = ConfigDict(from_attributes=True)

    id: Union[int, str] = Field(description="Game identifier")
    steam_appid: Optional[int] = Field(default=None, description="Steam AppID if available")
    title: str = Field(description="Official game title")
    header_image: Optional[str] = Field(default=None, description="Header banner URL")
    capsule_image: Optional[str] = Field(default=None, description="Capsule poster URL")
    short_description: Optional[str] = Field(default=None, description="Short synopsis")
    detailed_description: Optional[str] = Field(default=None, description="Full rich description")
    about_the_game: Optional[str] = Field(default=None, description="About the game section")
    genres: List[str] = Field(default_factory=list, description="Game genres")
    developers: List[str] = Field(default_factory=list, description="Developer studios")
    publishers: List[str] = Field(default_factory=list, description="Publishers")
    release_date: Optional[str] = Field(default=None, description="Release date")
    rating: Optional[float] = Field(default=None, description="Metacritic / aggregate rating")
    screenshots: List[ScreenshotItem] = Field(default_factory=list, description="Screenshot gallery")
    movies: List[MovieItem] = Field(default_factory=list, description="Trailers and video previews")
    pc_requirements: Optional[Dict[str, str]] = Field(default=None, description="PC system requirements")
    website: Optional[str] = Field(default=None, description="Official website URL")
    steam_url: Optional[str] = Field(default=None, description="Steam store URL")


class SteamSearchResultItem(BaseModel):
    """Raw item from Steam storesearch endpoint."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    tiny_image: Optional[str] = None
    metascore: Optional[str] = None


class SteamSearchResult(BaseModel):
    """Container for Steam storesearch response."""
    model_config = ConfigDict(from_attributes=True)

    total: int = 0
    items: List[SteamSearchResultItem] = Field(default_factory=list)


class GameSearchResponse(BaseModel):
    """Paginated game search response model."""
    model_config = ConfigDict(from_attributes=True)

    total: int = Field(description="Total matched games count")
    page: int = Field(default=1, ge=1, description="Current page number")
    page_size: int = Field(default=10, ge=1, le=100, description="Items per page")
    items: List[GameCard] = Field(default_factory=list, description="Matched game cards")

    @computed_field
    @property
    def games(self) -> List[GameCard]:
        return self.items


class BatchEnrichRequest(BaseModel):
    """Request payload for batch game title enrichment."""
    model_config = ConfigDict(from_attributes=True)

    titles: List[str] = Field(..., min_length=1, max_length=50, description="List of game titles to enrich")


class BatchEnrichResponse(BaseModel):
    """Response payload for batch game title enrichment."""
    model_config = ConfigDict(from_attributes=True)

    games: List[GameCard] = Field(default_factory=list, description="Enriched game cards")


class GotyNominee(BaseModel):
    """GOTY Nominee model."""
    model_config = ConfigDict(from_attributes=True)

    game_id: str
    title: str
    cover_url: Optional[str] = None
    developer: Optional[str] = None
    publisher: Optional[str] = None
    genres: List[str] = Field(default_factory=list)
    steam_appid: Optional[int] = None


class GotyWinner(BaseModel):
    """GOTY Winner model."""
    model_config = ConfigDict(from_attributes=True)

    game_id: str
    title: str
    slug: Optional[str] = None
    cover_url: Optional[str] = None
    hero_image: Optional[str] = None
    developer: Optional[str] = None
    publisher: Optional[str] = None
    release_date: Optional[str] = None
    genres: List[str] = Field(default_factory=list)
    description: Optional[str] = None
    award_rationale: Optional[str] = None
    steam_appid: Optional[int] = None
    steam_url: Optional[str] = None


class GotyYearArchive(BaseModel):
    """GOTY annual archive model."""
    model_config = ConfigDict(from_attributes=True)

    year: int
    award_name: str = "Game of the Year"
    source: str = "The Game Awards"
    winner: GotyWinner
    nominees: List[GotyNominee] = Field(default_factory=list)

from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters long")
    username: str = Field(
        ...,
        min_length=3,
        max_length=30,
        pattern=r"^[a-zA-Z0-9_-]+$",
        description="Gamer handle / username (letters, numbers, underscore, hyphen)"
    )
    display_name: Optional[str] = Field(None, max_length=50)


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class UserInfo(BaseModel):
    id: str
    email: str
    username: Optional[str] = None
    role: str = "authenticated"


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: int = 3600
    user: Optional[UserInfo] = None


class UserProfileResponse(BaseModel):
    id: str
    username: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    favorite_genres: List[str] = []
    preferred_platforms: List[str] = []
    default_difficulty: str = "medium"
    default_age_rating: str = "T"
    is_public: bool = True
    show_library: bool = True
    show_favorites: bool = True
    show_reviews: bool = True
    show_rankings: bool = True
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(None, max_length=50)
    avatar_url: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=280)
    favorite_genres: Optional[List[str]] = None
    preferred_platforms: Optional[List[str]] = None
    default_difficulty: Optional[str] = None
    default_age_rating: Optional[str] = None
    is_public: Optional[bool] = None
    show_library: Optional[bool] = None
    show_favorites: Optional[bool] = None
    show_reviews: Optional[bool] = None
    show_rankings: Optional[bool] = None


class UserLibraryItemCreate(BaseModel):
    game_id: str
    status: Optional[str] = Field(
        "wishlist",
        pattern=r"^(wishlist|backlog|playing|completed|dropped)$",
        description="Shelf status"
    )
    is_favorite: bool = False
    is_wishlisted: bool = False
    personal_rating: Optional[int] = Field(None, ge=1, le=10)
    personal_rank: Optional[int] = Field(None, ge=1)
    playtime_hours: float = Field(0.0, ge=0.0)
    notes: Optional[str] = Field(None, max_length=2000)


class UserLibraryItemUpdate(BaseModel):
    status: Optional[str] = Field(
        None,
        pattern=r"^(wishlist|backlog|playing|completed|dropped)$"
    )
    is_favorite: Optional[bool] = None
    is_wishlisted: Optional[bool] = None
    personal_rating: Optional[int] = Field(None, ge=1, le=10)
    personal_rank: Optional[int] = Field(None, ge=1)
    playtime_hours: Optional[float] = Field(None, ge=0.0)
    notes: Optional[str] = Field(None, max_length=2000)


class UserLibraryItemResponse(BaseModel):
    id: str
    user_id: str
    game_id: str
    is_favorite: bool = False
    is_wishlisted: bool = False
    status: Optional[str] = "wishlist"
    personal_rating: Optional[int] = None
    personal_rank: Optional[int] = None
    playtime_hours: float = 0.0
    notes: Optional[str] = None
    game_title: Optional[str] = None
    game_cover_url: Optional[str] = None
    game_slug: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class RankedPosition(BaseModel):
    game_id: str
    rank: int = Field(..., ge=1, le=10)
    title: Optional[str] = None
    cover_url: Optional[str] = None


class RankedListUpdate(BaseModel):
    title: str = Field("My Top 10", max_length=100)
    positions: List[RankedPosition] = Field(..., max_length=10)


class RankedListResponse(BaseModel):
    id: str
    user_id: str
    title: str = "My Top 10"
    positions: List[RankedPosition] = []
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class ReviewCreateRequest(BaseModel):
    game_id: str
    rating: int = Field(..., ge=1, le=10)
    title: Optional[str] = Field(None, max_length=150)
    body: str = Field(..., min_length=1, max_length=5000)


class ReviewResponse(BaseModel):
    id: str
    user_id: str
    game_id: str
    rating: int
    title: Optional[str] = None
    body: str
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

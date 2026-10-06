from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from backend.app.schemas.auth import (
    UserProfileResponse,
    UserProfileUpdate,
    UserLibraryItemCreate,
    UserLibraryItemUpdate,
    UserLibraryItemResponse,
    RankedListUpdate,
    RankedListResponse,
)
from backend.app.services.supabase_service import supabase_service
from backend.app.core.auth import get_current_user, AuthenticatedUser

router = APIRouter()


@router.get(
    "/profile",
    response_model=UserProfileResponse,
    summary="Get user profile"
)
async def get_my_profile(current_user: AuthenticatedUser = Depends(get_current_user)):
    """Retrieve personal gamer profile and preferences."""
    profile = supabase_service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    return UserProfileResponse(**profile)


@router.patch(
    "/profile",
    response_model=UserProfileResponse,
    summary="Update user profile"
)
async def update_my_profile(
    updates: UserProfileUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Update profile bio, avatar, gaming preferences, and privacy toggles."""
    try:
        updated = supabase_service.update_profile(
            current_user.id,
            updates.model_dump(exclude_unset=True)
        )
        return UserProfileResponse(**updated)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get(
    "/library",
    response_model=List[UserLibraryItemResponse],
    summary="Get user game library"
)
async def get_my_library(
    status: Optional[str] = Query(None, description="Filter by shelf status (wishlist, backlog, playing, completed, dropped)"),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Retrieve all shelved games in user library."""
    items = supabase_service.get_user_library(current_user.id, status=status)
    return [UserLibraryItemResponse(**item) for item in items]


@router.post(
    "/library/{game_id}",
    response_model=UserLibraryItemResponse,
    summary="Add or update game in library"
)
async def shelf_game(
    game_id: str,
    item_data: Optional[UserLibraryItemUpdate] = None,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Add a game to library shelf or update its status, rating, and playtime."""
    payload = item_data.model_dump(exclude_unset=True) if item_data else {"status": "wishlist"}
    saved = supabase_service.upsert_user_game(current_user.id, game_id, payload)
    return UserLibraryItemResponse(**saved)


@router.delete(
    "/library/{game_id}",
    summary="Remove game from library"
)
async def remove_game_from_library(
    game_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Remove a game entry from personal library."""
    deleted = supabase_service.delete_user_game(current_user.id, game_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found in library"
        )
    return {"message": "Game removed from library", "game_id": game_id}


@router.get(
    "/favorites",
    response_model=List[UserLibraryItemResponse],
    summary="Get user favorite games"
)
async def get_my_favorites(current_user: AuthenticatedUser = Depends(get_current_user)):
    """Retrieve all favorited games."""
    items = supabase_service.get_user_library(current_user.id)
    favorites = [i for i in items if i.get("is_favorite") is True]
    return [UserLibraryItemResponse(**item) for item in favorites]


@router.post(
    "/favorites/{game_id}",
    response_model=UserLibraryItemResponse,
    summary="Toggle game favorite status"
)
async def toggle_favorite(
    game_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Toggle the favorite status for a game."""
    item = supabase_service.toggle_favorite(current_user.id, game_id)
    return UserLibraryItemResponse(**item)


@router.get(
    "/rankings",
    response_model=RankedListResponse,
    summary="Get user Top 10 rankings"
)
async def get_my_rankings(current_user: AuthenticatedUser = Depends(get_current_user)):
    """Retrieve personal ranked Top 10 list."""
    ranking = supabase_service.get_user_rankings(current_user.id)
    return RankedListResponse(**ranking)


@router.post(
    "/rankings",
    response_model=RankedListResponse,
    summary="Save user Top 10 rankings"
)
async def update_my_rankings(
    payload: RankedListUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Update and reorder personal Top 10 ranked games list."""
    saved = supabase_service.update_user_rankings(
        current_user.id,
        payload.title,
        [p.model_dump() for p in payload.positions]
    )
    return RankedListResponse(**saved)

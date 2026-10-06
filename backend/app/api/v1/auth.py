from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserInfo,
    UserProfileResponse,
)
from backend.app.services.supabase_service import supabase_service
from backend.app.core.auth import get_current_user, AuthenticatedUser

router = APIRouter()


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account"
)
async def register(req: UserRegisterRequest):
    """Create a new user identity in Supabase Auth and initialize user profile."""
    try:
        auth_data = supabase_service.sign_up(
            email=req.email,
            password=req.password,
            username=req.username,
            display_name=req.display_name
        )
        return TokenResponse(
            access_token=auth_data["access_token"],
            refresh_token=auth_data.get("refresh_token"),
            expires_in=auth_data.get("expires_in", 3600),
            user=UserInfo(
                id=auth_data["user_id"],
                email=auth_data["email"],
                username=auth_data["username"]
            )
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Sign in to user account"
)
async def login(req: UserLoginRequest):
    """Authenticate user with email and password and return session JWT."""
    try:
        auth_data = supabase_service.sign_in(
            email=req.email,
            password=req.password
        )
        return TokenResponse(
            access_token=auth_data["access_token"],
            refresh_token=auth_data.get("refresh_token"),
            expires_in=auth_data.get("expires_in", 3600),
            user=UserInfo(
                id=auth_data["user_id"],
                email=auth_data["email"],
                username=auth_data["username"]
            )
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"}
        )


@router.post(
    "/logout",
    summary="Sign out user session"
)
async def logout(current_user: AuthenticatedUser = Depends(get_current_user)):
    """Invalidate authenticated session."""
    return {"message": "Successfully logged out", "user_id": current_user.id}


@router.get(
    "/me",
    response_model=UserProfileResponse,
    summary="Get current user profile"
)
async def get_me(current_user: AuthenticatedUser = Depends(get_current_user)):
    """Retrieve the authenticated user's gamer profile and preferences."""
    profile = supabase_service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    return UserProfileResponse(**profile)

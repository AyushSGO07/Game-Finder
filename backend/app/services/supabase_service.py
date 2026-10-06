import time
import uuid
from typing import Any, Dict, List, Optional
import jwt
from backend.app.core.config import settings

try:
    from supabase import create_client, Client
except ImportError:
    create_client = None
    Client = None


class SupabaseService:
    """Service handling Supabase Authentication and Database operations with offline fallback."""

    def __init__(self):
        self.url = settings.SUPABASE_URL
        self.anon_key = settings.SUPABASE_ANON_KEY
        self.jwt_secret = settings.SUPABASE_JWT_SECRET
        self.client: Optional[Any] = None

        if self.url and self.anon_key and create_client is not None:
            try:
                self.client = create_client(self.url, self.anon_key)
            except Exception:
                self.client = None

        # In-memory storage for offline mode and automated tests
        self._mock_users: Dict[str, Dict[str, Any]] = {}
        self._mock_profiles: Dict[str, Dict[str, Any]] = {}
        self._mock_libraries: Dict[str, Dict[str, Dict[str, Any]]] = {}  # user_id -> {game_id -> item}
        self._mock_rankings: Dict[str, Dict[str, Any]] = {}  # user_id -> ranking data
        self._mock_reviews: Dict[str, List[Dict[str, Any]]] = {}  # game_id -> list of reviews

    def is_configured(self) -> bool:
        """Returns True if live Supabase credentials are configured."""
        return bool(self.client and self.url and self.anon_key)

    def generate_jwt(self, user_id: str, email: str, username: str, expires_in: int = 3600) -> str:
        """Generate a compliant Supabase-style JWT token."""
        now = int(time.time())
        payload = {
            "sub": user_id,
            "email": email,
            "user_metadata": {"username": username},
            "role": "authenticated",
            "aud": "authenticated",
            "iat": now,
            "exp": now + expires_in,
        }
        return jwt.encode(payload, self.jwt_secret, algorithm="HS256")

    def decode_jwt(self, token: str) -> Optional[Dict[str, Any]]:
        """Decode and validate JWT token signature and expiration."""
        try:
            return jwt.decode(
                token,
                self.jwt_secret,
                algorithms=["HS256"],
                options={"verify_exp": True, "verify_aud": False}
            )
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return None

    def sign_up(self, email: str, password: str, username: str, display_name: Optional[str] = None) -> Dict[str, Any]:
        """Sign up a new user and auto-provision user profile."""
        if self.is_configured():
            try:
                res = self.client.auth.sign_up({
                    "email": email,
                    "password": password,
                    "options": {
                        "data": {
                            "username": username,
                            "display_name": display_name or username,
                            "avatar_url": f"https://ui-avatars.com/api/?name={username}&background=1e293b&color=cbd5e1"
                        }
                    }
                })
                user = res.user
                session = res.session
                return {
                    "user_id": str(user.id),
                    "email": email,
                    "username": username,
                    "access_token": session.access_token if session else self.generate_jwt(str(user.id), email, username),
                    "refresh_token": session.refresh_token if session else None,
                    "expires_in": 3600
                }
            except Exception as e:
                raise ValueError(str(e))

        # Offline / Mock Fallback implementation
        for uid, u in self._mock_users.items():
            if u["email"].lower() == email.lower():
                raise ValueError("User with this email already exists")
            if u["username"].lower() == username.lower():
                raise ValueError("Username is already taken")

        user_id = str(uuid.uuid4())
        user_record = {
            "id": user_id,
            "email": email,
            "password": password,
            "username": username,
            "display_name": display_name or username,
            "avatar_url": f"https://ui-avatars.com/api/?name={username}&background=1e293b&color=cbd5e1"
        }
        self._mock_users[user_id] = user_record
        self._mock_profiles[user_id] = {
            "id": user_id,
            "username": username,
            "display_name": display_name or username,
            "avatar_url": user_record["avatar_url"],
            "bio": "Gamer on Game Finder",
            "favorite_genres": [],
            "preferred_platforms": [],
            "default_difficulty": "medium",
            "default_age_rating": "T",
            "is_public": True,
            "show_library": True,
            "show_favorites": True,
            "show_reviews": True,
            "show_rankings": True,
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
        self._mock_libraries[user_id] = {}

        token = self.generate_jwt(user_id, email, username)
        return {
            "user_id": user_id,
            "email": email,
            "username": username,
            "access_token": token,
            "refresh_token": f"mock-refresh-{user_id}",
            "expires_in": 3600
        }

    def sign_in(self, email: str, password: str) -> Dict[str, Any]:
        """Sign in an existing user with email and password."""
        if self.is_configured():
            try:
                res = self.client.auth.sign_in_with_password({
                    "email": email,
                    "password": password
                })
                user = res.user
                session = res.session
                username = user.user_metadata.get("username", email.split("@")[0])
                return {
                    "user_id": str(user.id),
                    "email": email,
                    "username": username,
                    "access_token": session.access_token,
                    "refresh_token": session.refresh_token,
                    "expires_in": 3600
                }
            except Exception as e:
                raise ValueError(str(e))

        # Offline / Mock Fallback
        for uid, u in self._mock_users.items():
            if u["email"].lower() == email.lower() and u["password"] == password:
                token = self.generate_jwt(uid, email, u["username"])
                return {
                    "user_id": uid,
                    "email": email,
                    "username": u["username"],
                    "access_token": token,
                    "refresh_token": f"mock-refresh-{uid}",
                    "expires_in": 3600
                }
        raise ValueError("Invalid email or password")

    def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve user profile."""
        if self.is_configured():
            try:
                res = self.client.table("profiles").select("*").eq("id", user_id).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass
        return self._mock_profiles.get(user_id)

    def update_profile(self, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update user profile attributes."""
        if self.is_configured():
            try:
                res = self.client.table("profiles").update(updates).eq("id", user_id).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                raise ValueError(str(e))

        profile = self._mock_profiles.get(user_id)
        if not profile:
            raise ValueError("Profile not found")
        for k, v in updates.items():
            if v is not None:
                profile[k] = v
        profile["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        return profile

    def get_user_library(self, user_id: str, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve user library items, optionally filtered by status shelf."""
        if self.is_configured():
            try:
                query = self.client.table("user_games").select("*, games(*)").eq("user_id", user_id)
                if status:
                    query = query.eq("status", status)
                res = query.execute()
                return res.data or []
            except Exception:
                pass

        user_shelf = self._mock_libraries.get(user_id, {})
        items = list(user_shelf.values())
        if status:
            items = [i for i in items if i.get("status") == status]
        return items

    def upsert_user_game(self, user_id: str, game_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Add or update a game in the user's library."""
        if self.is_configured():
            try:
                payload = {**data, "user_id": user_id, "game_id": game_id}
                res = self.client.table("user_games").upsert(payload).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                raise ValueError(str(e))

        if user_id not in self._mock_libraries:
            self._mock_libraries[user_id] = {}

        existing = self._mock_libraries[user_id].get(game_id, {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "game_id": game_id,
            "is_favorite": False,
            "is_wishlisted": False,
            "status": "wishlist",
            "personal_rating": None,
            "personal_rank": None,
            "playtime_hours": 0.0,
            "notes": None,
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        })

        for k, v in data.items():
            if v is not None:
                existing[k] = v
        existing["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        self._mock_libraries[user_id][game_id] = existing
        return existing

    def delete_user_game(self, user_id: str, game_id: str) -> bool:
        """Remove a game from the user's library."""
        if self.is_configured():
            try:
                self.client.table("user_games").delete().eq("user_id", user_id).eq("game_id", game_id).execute()
                return True
            except Exception:
                return False

        if user_id in self._mock_libraries and game_id in self._mock_libraries[user_id]:
            del self._mock_libraries[user_id][game_id]
            return True
        return False

    def toggle_favorite(self, user_id: str, game_id: str) -> Dict[str, Any]:
        """Toggle favorite status for a game."""
        user_shelf = self._mock_libraries.setdefault(user_id, {})
        item = user_shelf.get(game_id)
        if not item:
            item = self.upsert_user_game(user_id, game_id, {"is_favorite": True})
        else:
            item["is_favorite"] = not item.get("is_favorite", False)
            item["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        return item

    def get_user_rankings(self, user_id: str) -> Dict[str, Any]:
        """Get user Top 10 rankings."""
        if self.is_configured():
            try:
                res = self.client.table("ranked_lists").select("*").eq("user_id", user_id).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass
        return self._mock_rankings.get(user_id, {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "title": "My Top 10",
            "positions": []
        })

    def update_user_rankings(self, user_id: str, title: str, positions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Save reordered rankings."""
        record = {
            "id": self._mock_rankings.get(user_id, {}).get("id", str(uuid.uuid4())),
            "user_id": user_id,
            "title": title,
            "positions": positions,
            "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
        self._mock_rankings[user_id] = record
        return record


# Global singleton instance
supabase_service = SupabaseService()

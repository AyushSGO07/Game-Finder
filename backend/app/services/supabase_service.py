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
        self._mock_reviews: Dict[str, List[Dict[str, Any]]] = {
            "1245620": [
                {
                    "id": "rev-1",
                    "user_id": "user-tarnished",
                    "game_id": "1245620",
                    "rating": 10,
                    "title": "A transcendent open-world benchmark",
                    "body": "FromSoftware has achieved the pinnacle of exploration and combat synergy. The Lands Between rewards every single detour with breathtaking vistas, daunting dungeon architecture, and deep lore.",
                    "username": "EldenLord99",
                    "avatar_url": "https://ui-avatars.com/api/?name=EldenLord&background=4f46e5&color=fff",
                    "created_at": "2026-09-10T12:00:00Z",
                    "updated_at": "2026-09-10T12:00:00Z",
                },
                {
                    "id": "rev-2",
                    "user_id": "user-alex",
                    "game_id": "1245620",
                    "rating": 9,
                    "title": "Demanding, beautiful, and vast",
                    "body": "The boss battles push your reflexes to the limit. Some late-game scaling is fierce, but summoning and spirit ashes give every build a viable path forward.",
                    "username": "SoulsVeteran",
                    "avatar_url": "https://ui-avatars.com/api/?name=SoulsVeteran&background=0d9488&color=fff",
                    "created_at": "2026-09-22T14:30:00Z",
                    "updated_at": "2026-09-22T14:30:00Z",
                }
            ],
            "1086940": [
                {
                    "id": "rev-3",
                    "user_id": "user-shadowheart",
                    "game_id": "1086940",
                    "rating": 10,
                    "title": "Roleplaying perfection with infinite reactivity",
                    "body": "Every quest has five solutions you never expected. The companions feel alive, the turn-based tactical combat is deeply rewarding, and Act 3 is an unbelievable accomplishment.",
                    "username": "TavPaladin",
                    "avatar_url": "https://ui-avatars.com/api/?name=TavPaladin&background=d97706&color=fff",
                    "created_at": "2026-09-15T18:00:00Z",
                    "updated_at": "2026-09-15T18:00:00Z",
                }
            ]
        }

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

    def get_game_reviews(self, game_id: str) -> List[Dict[str, Any]]:
        """Retrieve reviews for a game."""
        str_id = str(game_id)
        if self.is_configured():
            try:
                res = self.client.table("reviews").select("*, profiles(username, avatar_url)").eq("game_id", str_id).order("created_at", desc=True).execute()
                if res.data:
                    results = []
                    for r in res.data:
                        profile = r.get("profiles") or {}
                        results.append({
                            "id": r.get("id"),
                            "user_id": r.get("user_id"),
                            "game_id": r.get("game_id"),
                            "rating": r.get("rating"),
                            "title": r.get("title"),
                            "body": r.get("body"),
                            "username": profile.get("username", "Gamer"),
                            "avatar_url": profile.get("avatar_url"),
                            "created_at": r.get("created_at"),
                            "updated_at": r.get("updated_at"),
                        })
                    return results
            except Exception:
                pass

        return self._mock_reviews.get(str_id, [])

    def create_or_update_review(
        self,
        user_id: str,
        game_id: str,
        rating: int,
        title: Optional[str],
        body: str,
        username: Optional[str] = None,
        avatar_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create or update a game review."""
        str_id = str(game_id)
        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        record = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "game_id": str_id,
            "rating": rating,
            "title": title,
            "body": body,
            "username": username or "Gamer",
            "avatar_url": avatar_url or f"https://ui-avatars.com/api/?name={username or 'Gamer'}&background=1e293b&color=cbd5e1",
            "created_at": now,
            "updated_at": now,
        }

        if self.is_configured():
            try:
                payload = {
                    "user_id": user_id,
                    "game_id": str_id,
                    "rating": rating,
                    "title": title,
                    "body": body,
                    "updated_at": now
                }
                res = self.client.table("reviews").upsert(payload).execute()
                if res.data:
                    return {**record, **res.data[0]}
            except Exception as e:
                raise ValueError(str(e))

        reviews = self._mock_reviews.setdefault(str_id, [])
        for i, existing in enumerate(reviews):
            if existing.get("user_id") == user_id:
                record["id"] = existing["id"]
                record["created_at"] = existing.get("created_at", now)
                reviews[i] = record
                return record

        reviews.insert(0, record)
        return record


# Global singleton instance
supabase_service = SupabaseService()


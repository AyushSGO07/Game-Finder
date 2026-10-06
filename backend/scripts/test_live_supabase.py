"""Script for testing live Supabase connection if configured, or demonstrating offline mock behavior."""
import os
import sys

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.services.supabase_service import supabase_service
from backend.app.core.config import settings


def main():
    print(f"Supabase URL: {settings.SUPABASE_URL or '(not configured, running in offline mock mode)'}")
    print(f"Live Client Configured: {supabase_service.is_configured()}")

    # Test user signup in service
    test_email = "tester@gamefinder.io"
    print(f"\n1. Testing user registration for {test_email}...")
    try:
        user_data = supabase_service.sign_up(
            email=test_email,
            password="StrongPassword123!",
            username="speedrunner_99",
            display_name="Speedrunner 99"
        )
        print(f"   Success! User ID: {user_data['user_id']}")
        print(f"   JWT Token Generated (truncated): {user_data['access_token'][:30]}...")
    except ValueError as e:
        print(f"   User already exists or error: {e}")
        user_data = supabase_service.sign_in(test_email, "StrongPassword123!")
        print(f"   Signed in! User ID: {user_data['user_id']}")

    uid = user_data["user_id"]

    # Test profile retrieval
    print("\n2. Testing user profile retrieval...")
    profile = supabase_service.get_profile(uid)
    print(f"   Profile handle: @{profile['username']}, public: {profile['is_public']}")

    # Test shelving a game
    print("\n3. Testing personal library shelving...")
    item = supabase_service.upsert_user_game(uid, "game-elden-ring", {
        "status": "playing",
        "personal_rating": 10,
        "playtime_hours": 85.0
    })
    print(f"   Shelved: game={item['game_id']}, status={item['status']}, rating={item['personal_rating']}/10")

    # Test ranking update
    print("\n4. Testing personal Top 10 rankings update...")
    ranking = supabase_service.update_user_rankings(uid, "All-Time Best", [
        {"game_id": "game-elden-ring", "rank": 1, "title": "Elden Ring"}
    ])
    print(f"   Rankings title: '{ranking['title']}' with {len(ranking['positions'])} ranked games.")

    print("\n[OK] Phase 3 Supabase & Authentication Service operational!")


if __name__ == "__main__":
    main()

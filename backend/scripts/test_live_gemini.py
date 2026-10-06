"""
Interactive CLI verification script for live Gemini recommendations.
Run with: python backend/scripts/test_live_gemini.py
"""

import os
import sys
import asyncio
from dotenv import load_dotenv

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

load_dotenv()

from backend.app.schemas.recommendation import RecommendationRequest
from backend.app.services.recommendation_service import (
    RecommendationService,
    RecommendationError,
)
from backend.app.core.config import settings


async def main():
    print("=" * 60)
    print(" Game Finder - Live Gemini Recommendation Verification")
    print("=" * 60)
    
    api_key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
    if not api_key:
        print("\n[!] WARNING: GEMINI_API_KEY is not set.")
        print("    To run a live test, add GEMINI_API_KEY to your .env file or environment.")
        print("    Example: GEMINI_API_KEY=your_key_here\n")
        return

    print(f"\n[*] Model configured: {settings.GEMINI_MODEL}")
    print("[*] Testing sample query: Genre='RPG', Age='Teen', Difficulty='Normal'")
    print("[*] Querying Gemini model...\n")

    service = RecommendationService(api_key=api_key)
    request = RecommendationRequest(
        genre="RPG",
        age="Teen",
        difficulty="Normal",
        prompt="Games with memorable companions and choices that matter"
    )

    try:
        response = await service.get_recommendations(request)
        print(f"[✓] SUCCESS: Received {len(response.recommendations)} recommendations!\n")
        for idx, game in enumerate(response.recommendations, 1):
            print(f"{idx}. {game.name}")
            print(f"   Reason: {game.match_reason}")
            print(f"   Tags: {', '.join(game.attributes)}\n")
    except RecommendationError as re:
        print(f"[x] RecommendationError: {re}")
    except Exception as e:
        print(f"[x] Unexpected Error: {e}")


if __name__ == "__main__":
    asyncio.run(main())

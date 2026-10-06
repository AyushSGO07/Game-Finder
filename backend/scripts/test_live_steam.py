import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from backend.app.services.game_service import game_service


async def main():
    query = sys.argv[1] if len(sys.argv) > 1 else "Elden Ring"
    print(f"\n--- Searching for '{query}' ---")
    search_res = await game_service.search_and_filter(query=query, page=1, page_size=5)
    print(f"Total found: {search_res.total}")
    for idx, item in enumerate(search_res.items, 1):
        print(f"[{idx}] {item.title} (ID: {item.id}, Score: {item.rating})")
        print(f"    Capsule: {item.capsule_image}")
        print(f"    Genres: {', '.join(item.genres)}")

    if search_res.items and search_res.items[0].steam_appid:
        app_id = search_res.items[0].steam_appid
        print(f"\n--- Inspecting Details for AppID {app_id} ---")
        detail = await game_service.get_game_details(app_id)
        if detail:
            print(f"Title: {detail.title}")
            print(f"Developers: {', '.join(detail.developers)}")
            print(f"Screenshots: {len(detail.screenshots)}")
            print(f"Trailers: {len(detail.movies)}")
            print(f"Steam URL: {detail.steam_url}")

    print("\n--- Testing Fallback on Obscure Title ---")
    fallback_card = await game_service.enrich_game("Mystical Adventure Alpha Beta 2099")
    print(f"Fallback Title: {fallback_card.title}")
    print(f"Fallback ID: {fallback_card.id}")
    print(f"Fallback Image: {fallback_card.header_image}")


if __name__ == "__main__":
    asyncio.run(main())

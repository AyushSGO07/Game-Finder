"""Unified game coordinator service managing Steam integration, fallbacks, and caching."""

import asyncio
import logging
from typing import List, Optional, Union
from backend.app.schemas.game import (
    GameCard,
    GameDetail,
    GameSearchResponse,
    HeroSlide,
    GenreTile,
    ScreenshotItem,
)
from backend.app.services.cache_service import CacheService, game_cache
from backend.app.services.fallback_service import FallbackService, fallback_service
from backend.app.services.steam_service import SteamService, steam_service
from backend.app.services.supabase_service import supabase_service

logger = logging.getLogger(__name__)


class GameService:
    """Coordinates metadata enrichment, search filtering, and fallback resolution."""

    def __init__(
        self,
        steam: Optional[SteamService] = None,
        fallback: Optional[FallbackService] = None,
        cache: Optional[CacheService] = None,
        concurrency_limit: int = 5,
    ) -> None:
        """Initialize coordinator with services and concurrency semaphore."""
        self.steam = steam or steam_service
        self.fallback = fallback or fallback_service
        self.cache = cache or game_cache
        self._semaphore = asyncio.Semaphore(concurrency_limit)

    async def enrich_game(
        self, title: str, app_id: Optional[int] = None
    ) -> GameCard:
        """Enrich a single game title or AppID with Steam metadata, falling back when needed."""
        clean_title = title.strip()
        cache_key = CacheService.make_key(
            "game:card", f"{app_id or ''}:{clean_title}"
        )
        cached_card = await self.cache.get(cache_key)
        if cached_card is not None:
            return GameCard.model_validate(cached_card)

        # 1. If app_id provided, fetch details directly
        if app_id:
            detail = await self.steam.get_app_details(app_id)
            if detail:
                card = GameCard(
                    id=detail.id,
                    steam_appid=detail.steam_appid,
                    title=detail.title,
                    header_image=detail.header_image,
                    capsule_image=detail.capsule_image,
                    genres=detail.genres,
                    rating=detail.rating,
                    release_date=detail.release_date,
                    short_description=detail.short_description,
                )
                await self.cache.set(cache_key, card.model_dump())
                return card

        # 2. Search Steam by title
        if clean_title:
            search_res = await self.steam.search_games(clean_title, limit=1)
            if search_res.items:
                found_id = search_res.items[0].id
                detail = await self.steam.get_app_details(found_id)
                if detail:
                    card = GameCard(
                        id=detail.id,
                        steam_appid=detail.steam_appid,
                        title=detail.title,
                        header_image=detail.header_image,
                        capsule_image=detail.capsule_image,
                        genres=detail.genres,
                        rating=detail.rating,
                        release_date=detail.release_date,
                        short_description=detail.short_description,
                    )
                    await self.cache.set(cache_key, card.model_dump())
                    return card
                else:
                    # Use storesearch item info
                    found_item = search_res.items[0]
                    card = GameCard(
                        id=found_id,
                        steam_appid=found_id,
                        title=found_item.name,
                        header_image=found_item.tiny_image,
                        capsule_image=found_item.tiny_image,
                        rating=float(found_item.metascore) if found_item.metascore else None,
                    )
                    await self.cache.set(cache_key, card.model_dump())
                    return card

        # 3. Fallback to Wikipedia or generated placeholder
        fallback_card = await self.fallback.resolve_fallback_metadata(clean_title)
        await self.cache.set(cache_key, fallback_card.model_dump())
        return fallback_card

    async def batch_enrich_games(self, titles: List[str]) -> List[GameCard]:
        """Concurrently enrich multiple game titles respecting the concurrency semaphore."""
        async def _bounded_enrich(t: str) -> GameCard:
            async with self._semaphore:
                return await self.enrich_game(title=t)

        tasks = [_bounded_enrich(title) for title in titles if title.strip()]
        if not tasks:
            return []
        return await asyncio.gather(*tasks)

    async def get_game_details(self, app_id: Union[int, str]) -> Optional[GameDetail]:
        """Retrieve complete game details for an AppID or slug."""
        clean_id = str(app_id).strip()
        numeric_id = int(clean_id) if clean_id.isdigit() else None

        if numeric_id:
            detail = await self.steam.get_app_details(numeric_id)
            if detail:
                return detail

        # Check curated shelves for authentic fallback metadata
        for category_name in ["trending", "new_releases", "top_rated", "hidden_gems"]:
            shelf = await self.get_shelf_games(category_name)
            for card in shelf:
                if (
                    str(card.id) == clean_id
                    or (card.steam_appid and str(card.steam_appid) == clean_id)
                ):
                    return GameDetail(
                        id=card.id,
                        steam_appid=card.steam_appid,
                        title=card.title,
                        header_image=card.header_image,
                        capsule_image=card.capsule_image,
                        short_description=card.short_description or f"Experience {card.title}.",
                        detailed_description=card.short_description or f"Experience {card.title}.",
                        about_the_game=card.short_description or f"Experience {card.title}.",
                        genres=card.genres,
                        developers=[card.developer] if card.developer else ["Game Developer"],
                        publishers=[card.publisher or card.developer or "Publisher"],
                        release_date=card.release_date or "2024",
                        rating=card.rating or 9.0,
                        steam_url=f"https://store.steampowered.com/app/{card.steam_appid or card.id}/",
                        movies=[],
                        screenshots=[
                            ScreenshotItem(
                                id=1,
                                path_thumbnail=card.header_image or "",
                                path_full=card.header_image or "",
                            )
                        ] if card.header_image else [],
                        pc_requirements=None,
                    )

        # Check GOTY winners & nominees
        for entry in supabase_service.get_goty_archive():
            winner = entry.get("winner", {})
            if (
                str(winner.get("game_id")) == clean_id
                or (winner.get("steam_appid") and str(winner.get("steam_appid")) == clean_id)
            ):
                return GameDetail(
                    id=winner.get("steam_appid") or winner.get("game_id"),
                    steam_appid=winner.get("steam_appid"),
                    title=winner.get("title", clean_id),
                    header_image=winner.get("cover_url"),
                    capsule_image=winner.get("cover_url"),
                    short_description=winner.get("description", ""),
                    detailed_description=winner.get("description", ""),
                    about_the_game=winner.get("description", ""),
                    genres=winner.get("genres", []),
                    developers=[winner.get("developer", "Game Developer")],
                    publishers=[winner.get("publisher", "Publisher")],
                    release_date=winner.get("release_date", "2024"),
                    rating=9.5,
                    steam_url=winner.get("steam_url"),
                    movies=[],
                    screenshots=[],
                    pc_requirements=None,
                )
            for nom in entry.get("nominees", []):
                if (
                    str(nom.get("game_id")) == clean_id
                    or (nom.get("steam_appid") and str(nom.get("steam_appid")) == clean_id)
                ):
                    return GameDetail(
                        id=nom.get("steam_appid") or nom.get("game_id"),
                        steam_appid=nom.get("steam_appid"),
                        title=nom.get("title", clean_id),
                        header_image=nom.get("cover_url"),
                        capsule_image=nom.get("cover_url"),
                        short_description=f"Nominee for Game of the Year: {nom.get('title')}",
                        detailed_description=f"Nominee for Game of the Year: {nom.get('title')}",
                        about_the_game=f"Nominee for Game of the Year: {nom.get('title')}",
                        genres=nom.get("genres", []),
                        developers=[nom.get("developer", "Game Developer")],
                        publishers=[nom.get("publisher", "Publisher")],
                        release_date="2024",
                        rating=9.0,
                        steam_url=f"https://store.steampowered.com/app/{nom.get('steam_appid')}/" if nom.get('steam_appid') else None,
                        movies=[],
                        screenshots=[],
                        pc_requirements=None,
                    )

        return None

    async def search_and_filter(
        self,
        query: str,
        genre: Optional[str] = None,
        min_rating: Optional[float] = None,
        page: int = 1,
        page_size: int = 10,
    ) -> GameSearchResponse:
        """Search games across catalog, applying genre/rating filters and pagination."""
        clean_query = query.strip()
        if not clean_query:
            return GameSearchResponse(total=0, page=page, page_size=page_size, items=[])

        # Check local curated shelves and archives first for instant matching
        local_matches: List[GameCard] = []
        q_lower = clean_query.lower()
        all_shelves = [
            *(await self.get_shelf_games("trending")),
            *(await self.get_shelf_games("new_releases")),
            *(await self.get_shelf_games("top_rated")),
            *(await self.get_shelf_games("hidden_gems")),
            *(await self.get_shelf_games("popular")),
        ]
        seen_ids = set()
        for card in all_shelves:
            cid = str(card.id)
            if cid not in seen_ids and (
                q_lower in card.title.lower()
                or any(q_lower in g.lower() for g in card.genres)
                or (card.developer and q_lower in card.developer.lower())
            ):
                seen_ids.add(cid)
                local_matches.append(card)

        # Query Steam search with bounded limit
        search_res = await self.steam.search_games(clean_query, limit=page_size)
        matched_cards: List[GameCard] = list(local_matches)

        if search_res.items:
            # Batch enrich top items not already matched
            unseen_items = [
                item for item in search_res.items
                if str(item.id) not in seen_ids
            ][:page_size]

            async def _enrich_item(item) -> GameCard:
                async with self._semaphore:
                    return await self.enrich_game(title=item.name, app_id=item.id)

            enrich_tasks = [_enrich_item(item) for item in unseen_items]
            if enrich_tasks:
                steam_cards = await asyncio.gather(*enrich_tasks)
                matched_cards.extend(steam_cards)
        elif not matched_cards:
            # Generate fallback card for query
            fallback_card = await self.fallback.resolve_fallback_metadata(clean_query)
            matched_cards = [fallback_card]

        # Apply genre filter if provided
        filtered = matched_cards
        if genre and genre.strip():
            genre_target = genre.strip().lower()
            filtered = [
                c
                for c in filtered
                if any(genre_target in g.lower() for g in c.genres)
            ]

        # Apply minimum rating filter if provided
        if min_rating is not None:
            filtered = [
                c for c in filtered if c.rating is not None and c.rating >= min_rating
            ]

        total = len(filtered)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_items = filtered[start_idx:end_idx]

        return GameSearchResponse(
            total=total,
            page=page,
            page_size=page_size,
            items=paginated_items,
        )

    async def get_featured_games(self) -> List[HeroSlide]:
        """Retrieve curated featured games for hero presentation."""
        slides = [
            HeroSlide(
                id="hero-1",
                steam_appid=1245620,
                title="Elden Ring",
                backdrop_url="https://cdn.akamai.steamstatic.com/steam/apps/1245620/library_hero.jpg",
                rating=9.6,
                genres=["Action RPG", "Open World", "Dark Fantasy"],
                synopsis="Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.",
                store_url="https://store.steampowered.com/app/1245620/ELDEN_RING/",
                release_date="Feb 25, 2022",
            ),
            HeroSlide(
                id="hero-2",
                steam_appid=1091500,
                title="Cyberpunk 2077: Phantom Liberty",
                backdrop_url="https://cdn.akamai.steamstatic.com/steam/apps/1091500/library_hero.jpg",
                rating=9.2,
                genres=["Open World", "Sci-Fi", "RPG", "Cyberpunk"],
                synopsis="Freedom Always Comes At A Price. Infiltrate Dogtown to rescue the NUS President.",
                store_url="https://store.steampowered.com/app/1091500/Cyberpunk_2077/",
                release_date="Sep 26, 2023",
            ),
            HeroSlide(
                id="hero-3",
                steam_appid=1086940,
                title="Baldur's Gate 3",
                backdrop_url="https://cdn.akamai.steamstatic.com/steam/apps/1086940/library_hero.jpg",
                rating=9.7,
                genres=["CRPG", "Tactical", "Story Rich", "D&D"],
                synopsis="Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal.",
                store_url="https://store.steampowered.com/app/1086940/Baldurs_Gate_3/",
                release_date="Aug 3, 2023",
            ),
            HeroSlide(
                id="hero-4",
                steam_appid=1145350,
                title="Hades II",
                backdrop_url="https://cdn.akamai.steamstatic.com/steam/apps/1145350/library_hero.jpg",
                rating=9.5,
                genres=["Roguelike", "Action", "Mythology", "Hack and Slash"],
                synopsis="Battle beyond the Underworld using dark sorcery to take on the Titan of Time.",
                store_url="https://store.steampowered.com/app/1145350/Hades_II/",
                release_date="May 6, 2024",
            ),
            HeroSlide(
                id="hero-5",
                steam_appid=1030300,
                title="Hollow Knight: Silksong",
                backdrop_url="https://cdn.akamai.steamstatic.com/steam/apps/1030300/library_hero.jpg",
                rating=9.8,
                genres=["Metroidvania", "Souls-like", "Atmospheric", "2D"],
                synopsis="Play as Hornet, princess-protector of Hallownest, in a whole new kingdom.",
                store_url="https://store.steampowered.com/app/1030300/Hollow_Knight_Silksong/",
                release_date="Coming Soon",
            ),
            HeroSlide(
                id="hero-6",
                steam_appid=1903340,
                title="Clair Obscur: Expedition 33",
                backdrop_url="https://cdn.akamai.steamstatic.com/steam/apps/1903340/library_hero.jpg",
                rating=9.1,
                genres=["Turn-Based RPG", "Dark Fantasy", "Cinematic"],
                synopsis="Lead Expedition 33 on their quest to destroy the Paintress so she may never paint death again.",
                store_url="https://store.steampowered.com/app/1903340/Clair_Obscur_Expedition_33/",
                release_date="2025",
            ),
        ]
        return slides

    async def get_shelf_games(self, category: str) -> List[GameCard]:
        """Retrieve curated games for discovery shelf categories."""
        shelves_data = {
            "trending": [
                GameCard(
                    id=2358720,
                    steam_appid=2358720,
                    title="Black Myth: Wukong",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/2358720/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/2358720/capsule_616x353.jpg",
                    genres=["Action RPG", "Souls-like", "Mythology"],
                    rating=92.0,
                    release_date="Aug 20, 2024",
                    developer="Game Science",
                    short_description="An action RPG rooted in Chinese mythology following the Destined One.",
                    price="$59.99",
                ),
                GameCard(
                    id=553850,
                    steam_appid=553850,
                    title="HELLDIVERS 2",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/553850/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/553850/capsule_616x353.jpg",
                    genres=["Co-op", "Shooter", "Action"],
                    rating=88.0,
                    release_date="Feb 8, 2024",
                    developer="Arrowhead Game Studios",
                    short_description="Join the Helldivers to fight for freedom across a hostile galaxy.",
                    price="$39.99",
                ),
                GameCard(
                    id=2379780,
                    steam_appid=2379780,
                    title="Balatro",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/2379780/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/2379780/capsule_616x353.jpg",
                    genres=["Roguelike", "Deckbuilder", "Strategy"],
                    rating=94.0,
                    release_date="Feb 20, 2024",
                    developer="LocalThunk",
                    short_description="A hypnotically satisfying poker roguelike where you play illegal hands.",
                    price="$14.99",
                ),
                GameCard(
                    id=1623730,
                    steam_appid=1623730,
                    title="Palworld",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/1623730/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/1623730/capsule_616x353.jpg",
                    genres=["Open World", "Survival", "Creature Collector"],
                    rating=86.0,
                    release_date="Jan 19, 2024",
                    developer="Pocketpair",
                    short_description="Fight, farm, build and work alongside mysterious creatures called Pals.",
                    price="$29.99",
                ),
                GameCard(
                    id=2054970,
                    steam_appid=2054970,
                    title="Dragon's Dogma 2",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/2054970/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/2054970/capsule_616x353.jpg",
                    genres=["Action RPG", "Open World", "Fantasy"],
                    rating=87.0,
                    release_date="Mar 22, 2024",
                    developer="CAPCOM Co., Ltd.",
                    short_description="A narrative-driven action RPG that challenges players to choose their own experience.",
                    price="$69.99",
                ),
                GameCard(
                    id=1363080,
                    steam_appid=1363080,
                    title="Manor Lords",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/1363080/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/1363080/capsule_616x353.jpg",
                    genres=["City Builder", "Medieval", "Strategy"],
                    rating=90.0,
                    release_date="Apr 26, 2024",
                    developer="Slavic Magic",
                    short_description="A medieval strategy game featuring in-depth city building and tactical battles.",
                    price="$39.99",
                ),
            ],
            "new_releases": [
                GameCard(
                    id=2183900,
                    steam_appid=2183900,
                    title="Warhammer 40,000: Space Marine 2",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/2183900/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/2183900/capsule_616x353.jpg",
                    genres=["Action", "Hack and Slash", "Third-Person Shooter"],
                    rating=89.0,
                    release_date="Sep 9, 2024",
                    developer="Saber Interactive",
                    short_description="Embody the superhuman skill and brutality of a Space Marine.",
                    price="$59.99",
                ),
                GameCard(
                    id=1601580,
                    steam_appid=1601580,
                    title="Frostpunk 2",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/1601580/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/1601580/capsule_616x353.jpg",
                    genres=["City Builder", "Survival", "Strategy"],
                    rating=88.0,
                    release_date="Sep 20, 2024",
                    developer="11 bit studios",
                    short_description="The city must not fall. Steer your metropolis toward survival across endless winter.",
                    price="$44.99",
                ),
                GameCard(
                    id=2124490,
                    steam_appid=2124490,
                    title="SILENT HILL 2",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/2124490/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/2124490/capsule_616x353.jpg",
                    genres=["Horror", "Psychological Horror", "Survival Horror"],
                    rating=86.0,
                    release_date="Oct 8, 2024",
                    developer="Bloober Team",
                    short_description="Having received a letter from his deceased wife, James heads to where they shared so many memories.",
                    price="$69.99",
                ),
                GameCard(
                    id=2620600,
                    steam_appid=2620600,
                    title="Metaphor: ReFantazio",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/2620600/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/2620600/capsule_616x353.jpg",
                    genres=["JRPG", "Turn-Based RPG", "Fantasy"],
                    rating=93.0,
                    release_date="Oct 11, 2024",
                    developer="Studio Zero",
                    short_description="From the creators of Persona 3, 4, and 5 comes an expansive high-fantasy RPG.",
                    price="$69.99",
                ),
                GameCard(
                    id=1790600,
                    steam_appid=1790600,
                    title="DRAGON BALL: Sparking! ZERO",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/1790600/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/1790600/capsule_616x353.jpg",
                    genres=["Fighting", "Action", "Anime"],
                    rating=85.0,
                    release_date="Oct 11, 2024",
                    developer="Spike Chunsoft Co., Ltd.",
                    short_description="Takes the legendary gameplay of the Budokai Tenkaichi series to historic levels.",
                    price="$69.99",
                ),
                GameCard(
                    id=2527390,
                    steam_appid=2527390,
                    title="Dead Rising Deluxe Remaster",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/2527390/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/2527390/capsule_616x353.jpg",
                    genres=["Zombies", "Action", "Survival"],
                    rating=82.0,
                    release_date="Sep 19, 2024",
                    developer="CAPCOM Co., Ltd.",
                    short_description="Frank West returns with polished graphics, full audio, and auto-saves.",
                    price="$49.99",
                ),
            ],
            "top_rated": [
                GameCard(
                    id=620,
                    steam_appid=620,
                    title="Portal 2",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/620/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/620/capsule_616x353.jpg",
                    genres=["Puzzle", "Sci-Fi", "Comedy"],
                    rating=98.0,
                    release_date="Apr 19, 2011",
                    developer="Valve",
                    short_description="The Perpetual Testing Initiative has been expanded to allow you to design co-op puzzles.",
                    price="$9.99",
                ),
                GameCard(
                    id=1086940,
                    steam_appid=1086940,
                    title="Baldur's Gate 3",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/1086940/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/1086940/capsule_616x353.jpg",
                    genres=["CRPG", "Story Rich", "Tactical"],
                    rating=97.0,
                    release_date="Aug 3, 2023",
                    developer="Larian Studios",
                    short_description="A monumental CRPG achievement with profound companion reactivity.",
                    price="$59.99",
                ),
                GameCard(
                    id=1245620,
                    steam_appid=1245620,
                    title="ELDEN RING",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/1245620/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/1245620/capsule_616x353.jpg",
                    genres=["Action RPG", "Souls-like", "Dark Fantasy"],
                    rating=96.0,
                    release_date="Feb 25, 2022",
                    developer="FromSoftware Inc.",
                    short_description="Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.",
                    price="$59.99",
                ),
                GameCard(
                    id=413150,
                    steam_appid=413150,
                    title="Stardew Valley",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/413150/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/413150/capsule_616x353.jpg",
                    genres=["Farming Sim", "RPG", "Relaxing"],
                    rating=97.0,
                    release_date="Feb 26, 2016",
                    developer="ConcernedApe",
                    short_description="You have inherited your grandfather's old farm plot in Stardew Valley.",
                    price="$14.99",
                ),
                GameCard(
                    id=105600,
                    steam_appid=105600,
                    title="Terraria",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/105600/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/105600/capsule_616x353.jpg",
                    genres=["Sandbox", "Survival", "2D"],
                    rating=97.0,
                    release_date="May 16, 2011",
                    developer="Re-Logic",
                    short_description="Dig, fight, explore, build! Nothing is impossible in this action-packed adventure.",
                    price="$9.99",
                ),
                GameCard(
                    id=294100,
                    steam_appid=294100,
                    title="RimWorld",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/294100/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/294100/capsule_616x353.jpg",
                    genres=["Colony Sim", "Survival", "Base Building"],
                    rating=98.0,
                    release_date="Oct 17, 2018",
                    developer="Ludeon Studios",
                    short_description="A sci-fi colony sim driven by an intelligent AI storyteller.",
                    price="$34.99",
                ),
            ],
            "hidden_gems": [
                GameCard(
                    id=813230,
                    steam_appid=813230,
                    title="ANIMAL WELL",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/813230/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/813230/capsule_616x353.jpg",
                    genres=["Metroidvania", "Puzzle", "Pixel Graphics"],
                    rating=91.0,
                    release_date="May 9, 2024",
                    developer="Shared Memory",
                    short_description="Hatch from a flower and explore the enigmatic, puzzle-box world of Animal Well.",
                    price="$24.99",
                ),
                GameCard(
                    id=1458140,
                    steam_appid=1458140,
                    title="Pacific Drive",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/1458140/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/1458140/capsule_616x353.jpg",
                    genres=["Survival", "Driving", "Atmospheric"],
                    rating=86.0,
                    release_date="Feb 22, 2024",
                    developer="Ironwood Studios",
                    short_description="Face the supernatural dangers of the Olympic Exclusion Zone with a car as your only lifeline.",
                    price="$29.99",
                ),
                GameCard(
                    id=1809540,
                    steam_appid=1809540,
                    title="Nine Sols",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/1809540/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/1809540/capsule_616x353.jpg",
                    genres=["Metroidvania", "2D Action", "Souls-like"],
                    rating=93.0,
                    release_date="May 29, 2024",
                    developer="RedCandleGames",
                    short_description="A lore-rich, hand-drawn 2D action-platformer featuring Sekiro-inspired deflection combat.",
                    price="$29.99",
                ),
                GameCard(
                    id=1996010,
                    steam_appid=1996010,
                    title="Crow Country",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/1996010/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/1996010/capsule_616x353.jpg",
                    genres=["Survival Horror", "Retro", "Atmospheric"],
                    rating=88.0,
                    release_date="May 9, 2024",
                    developer="SFB Games",
                    short_description="A survival horror game inspired by PS1 classics set in an abandoned theme park.",
                    price="$19.99",
                ),
                GameCard(
                    id=2041920,
                    steam_appid=2041920,
                    title="Lorelei and the Laser Eyes",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/2041920/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/2041920/capsule_616x353.jpg",
                    genres=["Puzzle", "Mystery", "Noir"],
                    rating=92.0,
                    release_date="May 16, 2024",
                    developer="Simogo",
                    short_description="A non-linear mystery adventure game full of mind-bending patterns and illusions.",
                    price="$24.99",
                ),
                GameCard(
                    id=1147860,
                    steam_appid=1147860,
                    title="UFO 50",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/1147860/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/1147860/capsule_616x353.jpg",
                    genres=["Retro", "Indie", "Arcade"],
                    rating=93.0,
                    release_date="Sep 18, 2024",
                    developer="Mossmouth",
                    short_description="A collection of 50 brand-new 8-bit games from the creators of Spelunky and Downwell.",
                    price="$24.99",
                ),
            ],
            "popular": [
                GameCard(
                    id=271590,
                    steam_appid=271590,
                    title="Grand Theft Auto V",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/271590/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/271590/capsule_616x353.jpg",
                    genres=["Open World", "Action", "Multiplayer"],
                    rating=96.0,
                    release_date="Apr 14, 2015",
                    developer="Rockstar North",
                    short_description="Explore the award-winning world of Los Santos and Blaine County.",
                    price="$29.99",
                ),
                GameCard(
                    id=730,
                    steam_appid=730,
                    title="Counter-Strike 2",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/730/capsule_616x353.jpg",
                    genres=["FPS", "Shooter", "Competitive"],
                    rating=88.0,
                    release_date="Sep 27, 2023",
                    developer="Valve",
                    short_description="The next chapter in the history-defining tactical first-person shooter.",
                    price="Free to Play",
                ),
                GameCard(
                    id=570,
                    steam_appid=570,
                    title="Dota 2",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/570/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/570/capsule_616x353.jpg",
                    genres=["MOBA", "Strategy", "Multiplayer"],
                    rating=90.0,
                    release_date="Jul 9, 2013",
                    developer="Valve",
                    short_description="Every day, millions of players worldwide enter the battle as one of over a hundred heroes.",
                    price="Free to Play",
                ),
                GameCard(
                    id=1172470,
                    steam_appid=1172470,
                    title="Apex Legends",
                    header_image="https://cdn.akamai.steamstatic.com/steam/apps/1172470/header.jpg",
                    capsule_image="https://cdn.akamai.steamstatic.com/steam/apps/1172470/capsule_616x353.jpg",
                    genres=["Battle Royale", "Shooter", "Hero Shooter"],
                    rating=88.0,
                    release_date="Nov 4, 2020",
                    developer="Respawn Entertainment",
                    short_description="Conquer with character in Apex Legends, a free-to-play hero shooter.",
                    price="Free to Play",
                ),
            ],
        }
        return shelves_data.get(category, shelves_data["trending"])

    async def get_genres(self) -> List[GenreTile]:
        """Retrieve 12 structured genre tiles for store discovery."""
        return [
            GenreTile(id="tile-1", name="Action", slug="action", iconName="Sword", gradient="from-red-600/80 to-amber-600/80", description="Fast-paced reflexes, intense combat, adrenaline.", accentColor="#ef4444"),
            GenreTile(id="tile-2", name="RPG", slug="rpg", iconName="Shield", gradient="from-indigo-600/80 to-purple-600/80", description="Deep stories, character progression, epic worlds.", accentColor="#6366f1"),
            GenreTile(id="tile-3", name="Strategy", slug="strategy", iconName="Crosshair", gradient="from-blue-600/80 to-cyan-600/80", description="Tactical mastery, empire management, grand scale.", accentColor="#3b82f6"),
            GenreTile(id="tile-4", name="Adventure", slug="adventure", iconName="Compass", gradient="from-emerald-600/80 to-teal-600/80", description="Exploration, discovery, narrative-driven journeys.", accentColor="#10b981"),
            GenreTile(id="tile-5", name="Indie", slug="indie", iconName="Sparkles", gradient="from-purple-600/80 to-pink-600/80", description="Visionary artistic design, boundary-pushing mechanics.", accentColor="#a855f7"),
            GenreTile(id="tile-6", name="Shooter", slug="shooter", iconName="Target", gradient="from-orange-600/80 to-red-600/80", description="Precision gunplay, tactical squad battles, chaos.", accentColor="#f97316"),
            GenreTile(id="tile-7", name="Simulation", slug="simulation", iconName="Cpu", gradient="from-cyan-600/80 to-blue-600/80", description="Life sims, complex management, virtual realities.", accentColor="#06b6d4"),
            GenreTile(id="tile-8", name="Horror", slug="horror", iconName="Skull", gradient="from-stone-800/90 to-red-950/90", description="Psychological dread, jump scares, survival tension.", accentColor="#dc2626"),
            GenreTile(id="tile-9", name="Puzzle", slug="puzzle", iconName="Flame", gradient="from-violet-600/80 to-indigo-600/80", description="Spatial reasoning, logic locks, mind teasers.", accentColor="#8b5cf6"),
            GenreTile(id="tile-10", name="Racing", slug="racing", iconName="Zap", gradient="from-amber-500/80 to-yellow-600/80", description="High-speed drift circuits, simulators, arcade rallies.", accentColor="#f59e0b"),
            GenreTile(id="tile-11", name="Sports", slug="sports", iconName="Award", gradient="from-teal-600/80 to-emerald-600/80", description="Competitive leagues, authentic stadiums, championships.", accentColor="#14b8a6"),
            GenreTile(id="tile-12", name="Platformer", slug="platformer", iconName="Gamepad2", gradient="from-fuchsia-600/80 to-pink-600/80", description="Precision jumps, 2D & 3D speed runs, vibrant worlds.", accentColor="#d946ef"),
        ]

    async def discover_games(
        self,
        query: Optional[str] = None,
        genre: Optional[str] = None,
        min_rating: Optional[float] = None,
        sort_by: str = "popularity",
        page: int = 1,
        page_size: int = 12,
    ) -> GameSearchResponse:
        """Comprehensive catalog discovery across all shelves and search with sorting."""
        if query and query.strip():
            # Delegate to search_and_filter which queries Steam catalog
            return await self.search_and_filter(
                query=query.strip(),
                genre=genre,
                min_rating=min_rating,
                page=page,
                page_size=page_size,
            )

        # Collect catalog from all shelves
        all_shelves = [
            *(await self.get_shelf_games("trending")),
            *(await self.get_shelf_games("new_releases")),
            *(await self.get_shelf_games("top_rated")),
            *(await self.get_shelf_games("hidden_gems")),
            *(await self.get_shelf_games("popular")),
        ]

        seen = set()
        unique_games: List[GameCard] = []
        for g in all_shelves:
            str_id = str(g.id)
            if str_id not in seen:
                seen.add(str_id)
                unique_games.append(g)

        # Apply genre filter
        filtered = unique_games
        if genre and genre.strip() and genre.lower() != "all":
            g_target = genre.strip().lower()
            filtered = [
                g for g in filtered
                if any(g_target in cat.lower() for cat in g.genres)
            ]

        # Apply min rating
        if min_rating is not None:
            filtered = [
                g for g in filtered
                if g.rating is not None and g.rating >= min_rating
            ]

        # Apply sorting
        if sort_by == "rating":
            filtered.sort(key=lambda g: g.rating or 0, reverse=True)
        elif sort_by == "newest":
            filtered.sort(key=lambda g: g.release_date or "", reverse=True)
        elif sort_by == "title":
            filtered.sort(key=lambda g: g.title.lower())

        total = len(filtered)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated = filtered[start_idx:end_idx]

        return GameSearchResponse(
            total=total,
            page=page,
            page_size=page_size,
            items=paginated,
        )


# Global singleton instance
game_service = GameService()


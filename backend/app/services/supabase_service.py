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


_MOCK_GOTY_ARCHIVE: List[Dict[str, Any]] = [
    {
        "year": 2024,
        "award_name": "Game of the Year",
        "source": "The Game Awards",
        "winner": {
            "game_id": "astro-bot",
            "title": "Astro Bot",
            "slug": "astro-bot",
            "cover_url": "https://images.igdb.com/igdb/image/upload/t_cover_big/co8435.jpg",
            "hero_image": "https://images.igdb.com/igdb/image/upload/t_1080p/scphv1.jpg",
            "developer": "Team Asobi",
            "publisher": "Sony Interactive Entertainment",
            "release_date": "2024-09-06",
            "genres": ["Platformer", "Action", "3D Platformer"],
            "description": "Join ASTRO in a brand-new, supersized space adventure across over 50 planets full of fun, secrets, and PlayStation cameos.",
            "award_rationale": "A masterclass in 3D platforming joy, precision movement mechanics, and pure celebration of gaming history.",
            "steam_appid": None,
            "steam_url": None,
        },
        "nominees": [
            {
                "game_id": "2379780",
                "title": "Balatro",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2379780/header.jpg",
                "developer": "LocalThunk",
                "publisher": "Playstack",
                "genres": ["Roguelike", "Deckbuilder", "Strategy"],
                "steam_appid": 2379780,
            },
            {
                "game_id": "2358720",
                "title": "Black Myth: Wukong",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg",
                "developer": "Game Science",
                "publisher": "Game Science",
                "genres": ["Action RPG", "Mythology", "Souls-like"],
                "steam_appid": 2358720,
            },
            {
                "game_id": "2778580",
                "title": "Elden Ring Shadow of the Erdtree",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2778580/header.jpg",
                "developer": "FromSoftware",
                "publisher": "Bandai Namco Entertainment",
                "genres": ["Action RPG", "Dark Fantasy", "Open World"],
                "steam_appid": 2778580,
            },
            {
                "game_id": "ff7-rebirth",
                "title": "Final Fantasy VII Rebirth",
                "cover_url": "https://images.igdb.com/igdb/image/upload/t_cover_big/co7v5b.jpg",
                "developer": "Square Enix",
                "publisher": "Square Enix",
                "genres": ["JRPG", "Action RPG", "Story Rich"],
                "steam_appid": None,
            },
            {
                "game_id": "2620600",
                "title": "Metaphor: ReFantazio",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2620600/header.jpg",
                "developer": "Studio Zero",
                "publisher": "SEGA",
                "genres": ["JRPG", "Turn-Based RPG", "Fantasy"],
                "steam_appid": 2620600,
            },
        ],
    },
    {
        "year": 2023,
        "award_name": "Game of the Year",
        "source": "The Game Awards",
        "winner": {
            "game_id": "1086940",
            "title": "Baldur's Gate 3",
            "slug": "baldurs-gate-3",
            "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg",
            "hero_image": "https://cdn.akamai.steamstatic.com/steam/apps/1086940/library_hero.jpg",
            "developer": "Larian Studios",
            "publisher": "Larian Studios",
            "release_date": "2023-08-03",
            "genres": ["CRPG", "Tactical", "Story Rich", "D&D"],
            "description": "Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival.",
            "award_rationale": "A monumental achievement in narrative branching, player agency, tactical combat, and companion depth that redefined modern RPGs.",
            "steam_appid": 1086940,
            "steam_url": "https://store.steampowered.com/app/1086940/Baldurs_Gate_3/",
        },
        "nominees": [
            {
                "game_id": "alan-wake-2",
                "title": "Alan Wake 2",
                "cover_url": "https://images.igdb.com/igdb/image/upload/t_cover_big/co6q23.jpg",
                "developer": "Remedy Entertainment",
                "publisher": "Epic Games Publishing",
                "genres": ["Survival Horror", "Psychological", "Action"],
                "steam_appid": None,
            },
            {
                "game_id": "spider-man-2",
                "title": "Marvel's Spider-Man 2",
                "cover_url": "https://images.igdb.com/igdb/image/upload/t_cover_big/co667y.jpg",
                "developer": "Insomniac Games",
                "publisher": "Sony Interactive Entertainment",
                "genres": ["Action", "Open World", "Superhero"],
                "steam_appid": None,
            },
            {
                "game_id": "2050650",
                "title": "Resident Evil 4",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2050650/header.jpg",
                "developer": "Capcom",
                "publisher": "Capcom",
                "genres": ["Survival Horror", "Action", "Shooter"],
                "steam_appid": 2050650,
            },
            {
                "game_id": "mario-wonder",
                "title": "Super Mario Bros. Wonder",
                "cover_url": "https://images.igdb.com/igdb/image/upload/t_cover_big/co6o41.jpg",
                "developer": "Nintendo EPD",
                "publisher": "Nintendo",
                "genres": ["Platformer", "Co-op", "Family"],
                "steam_appid": None,
            },
            {
                "game_id": "zelda-totk",
                "title": "The Legend of Zelda: Tears of the Kingdom",
                "cover_url": "https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
                "developer": "Nintendo EPD",
                "publisher": "Nintendo",
                "genres": ["Adventure", "Open World", "Puzzle"],
                "steam_appid": None,
            },
        ],
    },
    {
        "year": 2022,
        "award_name": "Game of the Year",
        "source": "The Game Awards",
        "winner": {
            "game_id": "1245620",
            "title": "Elden Ring",
            "slug": "elden-ring",
            "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg",
            "hero_image": "https://cdn.akamai.steamstatic.com/steam/apps/1245620/library_hero.jpg",
            "developer": "FromSoftware",
            "publisher": "Bandai Namco Entertainment",
            "release_date": "2022-02-25",
            "genres": ["Action RPG", "Dark Fantasy", "Open World"],
            "description": "Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.",
            "award_rationale": "Masterfully evolved FromSoftware's signature combat into a vast, mysterious open world filled with wonder and relentless challenge.",
            "steam_appid": 1245620,
            "steam_url": "https://store.steampowered.com/app/1245620/ELDEN_RING/",
        },
        "nominees": [
            {
                "game_id": "1182900",
                "title": "A Plague Tale: Requiem",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1182900/header.jpg",
                "developer": "Asobo Studio",
                "publisher": "Focus Entertainment",
                "genres": ["Action-Adventure", "Stealth", "Story Rich"],
                "steam_appid": 1182900,
            },
            {
                "game_id": "2322010",
                "title": "God of War Ragnarök",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2322010/header.jpg",
                "developer": "Santa Monica Studio",
                "publisher": "PlayStation PC LLC",
                "genres": ["Action", "Adventure", "Mythology"],
                "steam_appid": 2322010,
            },
            {
                "game_id": "2420110",
                "title": "Horizon Forbidden West",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2420110/header.jpg",
                "developer": "Guerrilla Games",
                "publisher": "PlayStation PC LLC",
                "genres": ["Action RPG", "Open World", "Sci-Fi"],
                "steam_appid": 2420110,
            },
            {
                "game_id": "1332010",
                "title": "Stray",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1332010/header.jpg",
                "developer": "BlueTwelve Studio",
                "publisher": "Annapurna Interactive",
                "genres": ["Adventure", "Cyberpunk", "Atmospheric"],
                "steam_appid": 1332010,
            },
            {
                "game_id": "xenoblade-3",
                "title": "Xenoblade Chronicles 3",
                "cover_url": "https://images.igdb.com/igdb/image/upload/t_cover_big/co4j27.jpg",
                "developer": "Monolith Soft",
                "publisher": "Nintendo",
                "genres": ["JRPG", "Open World", "Story Rich"],
                "steam_appid": None,
            },
        ],
    },
    {
        "year": 2021,
        "award_name": "Game of the Year",
        "source": "The Game Awards",
        "winner": {
            "game_id": "1426210",
            "title": "It Takes Two",
            "slug": "it-takes-two",
            "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1426210/header.jpg",
            "hero_image": "https://cdn.akamai.steamstatic.com/steam/apps/1426210/library_hero.jpg",
            "developer": "Hazelight Studios",
            "publisher": "Electronic Arts",
            "release_date": "2021-03-25",
            "genres": ["Adventure", "Platformer", "Co-op"],
            "description": "Embark on the craziest journey of your life in It Takes Two, a genre-bending platform adventure built purely for co-op.",
            "award_rationale": "An exhilarating cooperative experience that seamlessly blends diverse gameplay genres with playful heart and visual inventiveness.",
            "steam_appid": 1426210,
            "steam_url": "https://store.steampowered.com/app/1426210/It_Takes_Two/",
        },
        "nominees": [
            {
                "game_id": "1252330",
                "title": "Deathloop",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1252330/header.jpg",
                "developer": "Arkane Studios",
                "publisher": "Bethesda Softworks",
                "genres": ["FPS", "Immersive Sim", "Action"],
                "steam_appid": 1252330,
            },
            {
                "game_id": "metroid-dread",
                "title": "Metroid Dread",
                "cover_url": "https://images.igdb.com/igdb/image/upload/t_cover_big/co390x.jpg",
                "developer": "MercurySteam",
                "publisher": "Nintendo",
                "genres": ["Metroidvania", "Action", "Sci-Fi"],
                "steam_appid": None,
            },
            {
                "game_id": "607080",
                "title": "Psychonauts 2",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/607080/header.jpg",
                "developer": "Double Fine Productions",
                "publisher": "Xbox Game Studios",
                "genres": ["3D Platformer", "Comedy", "Adventure"],
                "steam_appid": 607080,
            },
            {
                "game_id": "1895840",
                "title": "Ratchet & Clank: Rift Apart",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1895840/header.jpg",
                "developer": "Insomniac Games",
                "publisher": "PlayStation PC LLC",
                "genres": ["Action", "Platformer", "Sci-Fi"],
                "steam_appid": 1895840,
            },
            {
                "game_id": "1196590",
                "title": "Resident Evil Village",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1196590/header.jpg",
                "developer": "Capcom",
                "publisher": "Capcom",
                "genres": ["Survival Horror", "Action", "FPS"],
                "steam_appid": 1196590,
            },
        ],
    },
    {
        "year": 2020,
        "award_name": "Game of the Year",
        "source": "The Game Awards",
        "winner": {
            "game_id": "tlou-part-2",
            "title": "The Last of Us Part II",
            "slug": "the-last-of-us-part-ii",
            "cover_url": "https://images.igdb.com/igdb/image/upload/t_cover_big/co20wa.jpg",
            "hero_image": "https://images.igdb.com/igdb/image/upload/t_1080p/sc7x7t.jpg",
            "developer": "Naughty Dog",
            "publisher": "Sony Interactive Entertainment",
            "release_date": "2020-06-19",
            "genres": ["Action", "Adventure", "Story Rich"],
            "description": "Five years after their dangerous journey across the post-pandemic United States, Ellie and Joel have settled down in Wyoming.",
            "award_rationale": "A brutally emotional narrative epic that pushed cinematic storytelling, character nuance, and visceral stealth-action gameplay.",
            "steam_appid": None,
            "steam_url": None,
        },
        "nominees": [
            {
                "game_id": "ac-nh",
                "title": "Animal Crossing: New Horizons",
                "cover_url": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1x3b.jpg",
                "developer": "Nintendo EPD",
                "publisher": "Nintendo",
                "genres": ["Life Sim", "Cozy", "Relaxing"],
                "steam_appid": None,
            },
            {
                "game_id": "782330",
                "title": "DOOM Eternal",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/782330/header.jpg",
                "developer": "id Software",
                "publisher": "Bethesda Softworks",
                "genres": ["FPS", "Action", "Fast-Paced"],
                "steam_appid": 782330,
            },
            {
                "game_id": "1462040",
                "title": "Final Fantasy VII Remake Intergrade",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1462040/header.jpg",
                "developer": "Square Enix",
                "publisher": "Square Enix",
                "genres": ["Action RPG", "JRPG", "Story Rich"],
                "steam_appid": 1462040,
            },
            {
                "game_id": "2215430",
                "title": "Ghost of Tsushima Director's Cut",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2215430/header.jpg",
                "developer": "Sucker Punch Productions",
                "publisher": "PlayStation PC LLC",
                "genres": ["Action", "Open World", "Historical"],
                "steam_appid": 2215430,
            },
            {
                "game_id": "1145360",
                "title": "Hades",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145360/header.jpg",
                "developer": "Supergiant Games",
                "publisher": "Supergiant Games",
                "genres": ["Roguelike", "Action", "Indie"],
                "steam_appid": 1145360,
            },
        ],
    },
    {
        "year": 2019,
        "award_name": "Game of the Year",
        "source": "The Game Awards",
        "winner": {
            "game_id": "814380",
            "title": "Sekiro: Shadows Die Twice",
            "slug": "sekiro-shadows-die-twice",
            "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/814380/header.jpg",
            "hero_image": "https://cdn.akamai.steamstatic.com/steam/apps/814380/library_hero.jpg",
            "developer": "FromSoftware",
            "publisher": "Activision",
            "release_date": "2019-03-21",
            "genres": ["Action", "Adventure", "Souls-like"],
            "description": "Carve your own clever path to vengeance in an all-new adventure from developer FromSoftware, creators of Bloodborne and Dark Souls.",
            "award_rationale": "Revolutionary posture-deflection combat rhythm in a stunning Sengoku-era fantasy that tested players' absolute mastery.",
            "steam_appid": 814380,
            "steam_url": "https://store.steampowered.com/app/814380/Sekiro_Shadows_Die_Twice/",
        },
        "nominees": [
            {
                "game_id": "870780",
                "title": "Control",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/870780/header.jpg",
                "developer": "Remedy Entertainment",
                "publisher": "505 Games",
                "genres": ["Action", "Sci-Fi", "Supernatural"],
                "steam_appid": 870780,
            },
            {
                "game_id": "1190460",
                "title": "Death Stranding",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1190460/header.jpg",
                "developer": "KOJIMA PRODUCTIONS",
                "publisher": "505 Games",
                "genres": ["Open World", "Sci-Fi", "Atmospheric"],
                "steam_appid": 1190460,
            },
            {
                "game_id": "883710",
                "title": "Resident Evil 2",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/883710/header.jpg",
                "developer": "Capcom",
                "publisher": "Capcom",
                "genres": ["Survival Horror", "Zombies", "Action"],
                "steam_appid": 883710,
            },
            {
                "game_id": "ssbu",
                "title": "Super Smash Bros. Ultimate",
                "cover_url": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1pj0.jpg",
                "developer": "Bandai Namco Studios / Sora Ltd.",
                "publisher": "Nintendo",
                "genres": ["Fighting", "Multiplayer", "Party"],
                "steam_appid": None,
            },
            {
                "game_id": "578650",
                "title": "The Outer Worlds",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/578650/header.jpg",
                "developer": "Obsidian Entertainment",
                "publisher": "Private Division",
                "genres": ["RPG", "Sci-Fi", "First-Person"],
                "steam_appid": 578650,
            },
        ],
    },
    {
        "year": 2018,
        "award_name": "Game of the Year",
        "source": "The Game Awards",
        "winner": {
            "game_id": "1593500",
            "title": "God of War",
            "slug": "god-of-war-2018",
            "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1593500/header.jpg",
            "hero_image": "https://cdn.akamai.steamstatic.com/steam/apps/1593500/library_hero.jpg",
            "developer": "Santa Monica Studio",
            "publisher": "PlayStation PC LLC",
            "release_date": "2018-04-20",
            "genres": ["Action", "Adventure", "Mythology"],
            "description": "His vengeance against the Gods of Olympus years behind him, Kratos now lives as a man in the realm of Norse Gods.",
            "award_rationale": "A breathtaking continuous-shot father-son journey through Norse mythology featuring deeply satisfying axe combat.",
            "steam_appid": 1593500,
            "steam_url": "https://store.steampowered.com/app/1593500/God_of_War/",
        },
        "nominees": [
            {
                "game_id": "812140",
                "title": "Assassin's Creed Odyssey",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/812140/header.jpg",
                "developer": "Ubisoft Quebec",
                "publisher": "Ubisoft",
                "genres": ["RPG", "Open World", "Historical"],
                "steam_appid": 812140,
            },
            {
                "game_id": "504230",
                "title": "Celeste",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/504230/header.jpg",
                "developer": "Maddy Makes Games",
                "publisher": "Maddy Makes Games",
                "genres": ["Platformer", "Pixel Graphics", "Difficult"],
                "steam_appid": 504230,
            },
            {
                "game_id": "1817070",
                "title": "Marvel's Spider-Man Remastered",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1817070/header.jpg",
                "developer": "Insomniac Games",
                "publisher": "PlayStation PC LLC",
                "genres": ["Action", "Open World", "Superhero"],
                "steam_appid": 1817070,
            },
            {
                "game_id": "582010",
                "title": "Monster Hunter: World",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/582010/header.jpg",
                "developer": "Capcom",
                "publisher": "Capcom",
                "genres": ["Action RPG", "Co-op", "Hunting"],
                "steam_appid": 582010,
            },
            {
                "game_id": "1174180",
                "title": "Red Dead Redemption 2",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg",
                "developer": "Rockstar Games",
                "publisher": "Rockstar Games",
                "genres": ["Open World", "Story Rich", "Western"],
                "steam_appid": 1174180,
            },
        ],
    },
    {
        "year": 2017,
        "award_name": "Game of the Year",
        "source": "The Game Awards",
        "winner": {
            "game_id": "zelda-botw",
            "title": "The Legend of Zelda: Breath of the Wild",
            "slug": "the-legend-of-zelda-breath-of-the-wild",
            "cover_url": "https://images.igdb.com/igdb/image/upload/t_cover_big/co3p2d.jpg",
            "hero_image": "https://images.igdb.com/igdb/image/upload/t_1080p/scl2x4.jpg",
            "developer": "Nintendo EPD",
            "publisher": "Nintendo",
            "release_date": "2017-03-03",
            "genres": ["Adventure", "Action", "Open World"],
            "description": "Step into a world of discovery, exploration, and adventure in The Legend of Zelda: Breath of the Wild.",
            "award_rationale": "Reinvented modern open-world freedom through emergent physics, chemistry simulations, and unprecedented player discovery.",
            "steam_appid": None,
            "steam_url": None,
        },
        "nominees": [
            {
                "game_id": "1151640",
                "title": "Horizon Zero Dawn Complete Edition",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1151640/header.jpg",
                "developer": "Guerrilla Games",
                "publisher": "PlayStation PC LLC",
                "genres": ["Action RPG", "Open World", "Sci-Fi"],
                "steam_appid": 1151640,
            },
            {
                "game_id": "1687950",
                "title": "Persona 5 Royal",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1687950/header.jpg",
                "developer": "ATLUS",
                "publisher": "SEGA",
                "genres": ["JRPG", "Anime", "Turn-Based Combat"],
                "steam_appid": 1687950,
            },
            {
                "game_id": "578080",
                "title": "PUBG: BATTLEGROUNDS",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/578080/header.jpg",
                "developer": "KRAFTON, Inc.",
                "publisher": "KRAFTON, Inc.",
                "genres": ["Battle Royale", "Shooter", "Multiplayer"],
                "steam_appid": 578080,
            },
            {
                "game_id": "mario-odyssey",
                "title": "Super Mario Odyssey",
                "cover_url": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1m35.jpg",
                "developer": "Nintendo EPD",
                "publisher": "Nintendo",
                "genres": ["3D Platformer", "Adventure", "Family"],
                "steam_appid": None,
            },
        ],
    },
    {
        "year": 2016,
        "award_name": "Game of the Year",
        "source": "The Game Awards",
        "winner": {
            "game_id": "2357570",
            "title": "Overwatch",
            "slug": "overwatch-2",
            "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2357570/header.jpg",
            "hero_image": "https://cdn.akamai.steamstatic.com/steam/apps/2357570/library_hero.jpg",
            "developer": "Blizzard Entertainment",
            "publisher": "Blizzard Entertainment",
            "release_date": "2016-05-24",
            "genres": ["Shooter", "Action", "Hero Shooter"],
            "description": "A colorful team-based action game starring diverse heroes clashing in vibrant battles across the globe.",
            "award_rationale": "A dynamic team-based hero shooter with irresistible charisma, unforgettable characters, and finely tuned competitive gameplay.",
            "steam_appid": 2357570,
            "steam_url": "https://store.steampowered.com/app/2357570/Overwatch_2/",
        },
        "nominees": [
            {
                "game_id": "379720",
                "title": "DOOM (2016)",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/379720/header.jpg",
                "developer": "id Software",
                "publisher": "Bethesda Softworks",
                "genres": ["FPS", "Gore", "Action"],
                "steam_appid": 379720,
            },
            {
                "game_id": "304430",
                "title": "INSIDE",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/304430/header.jpg",
                "developer": "Playdead",
                "publisher": "Playdead",
                "genres": ["Puzzle Platformer", "Atmospheric", "Indie"],
                "steam_appid": 304430,
            },
            {
                "game_id": "1237970",
                "title": "Titanfall 2",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1237970/header.jpg",
                "developer": "Respawn Entertainment",
                "publisher": "Electronic Arts",
                "genres": ["FPS", "Mechs", "Fast-Paced"],
                "steam_appid": 1237970,
            },
            {
                "game_id": "1659420",
                "title": "Uncharted: Legacy of Thieves Collection",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1659420/header.jpg",
                "developer": "Naughty Dog LLC",
                "publisher": "PlayStation PC LLC",
                "genres": ["Adventure", "Action", "Story Rich"],
                "steam_appid": 1659420,
            },
        ],
    },
    {
        "year": 2015,
        "award_name": "Game of the Year",
        "source": "The Game Awards",
        "winner": {
            "game_id": "292030",
            "title": "The Witcher 3: Wild Hunt",
            "slug": "the-witcher-3-wild-hunt",
            "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg",
            "hero_image": "https://cdn.akamai.steamstatic.com/steam/apps/292030/library_hero.jpg",
            "developer": "CD PROJEKT RED",
            "publisher": "CD PROJEKT RED",
            "release_date": "2015-05-18",
            "genres": ["RPG", "Adventure", "Open World"],
            "description": "You are Geralt of Rivia, mercenary monster slayer. Before you stands a war-torn, monster-infested continent you can explore at will.",
            "award_rationale": "A sprawling dark fantasy RPG magnum opus with mature writing, peerless side quests, and a living world of moral grayness.",
            "steam_appid": 292030,
            "steam_url": "https://store.steampowered.com/app/292030/The_Witcher_3_Wild_Hunt/",
        },
        "nominees": [
            {
                "game_id": "bloodborne",
                "title": "Bloodborne",
                "cover_url": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7f.jpg",
                "developer": "FromSoftware",
                "publisher": "Sony Computer Entertainment",
                "genres": ["Action RPG", "Gothic", "Souls-like"],
                "steam_appid": None,
            },
            {
                "game_id": "377160",
                "title": "Fallout 4",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/377160/header.jpg",
                "developer": "Bethesda Game Studios",
                "publisher": "Bethesda Softworks",
                "genres": ["Post-Apocalyptic", "Open World", "RPG"],
                "steam_appid": 377160,
            },
            {
                "game_id": "287700",
                "title": "Metal Gear Solid V: The Phantom Pain",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/287700/header.jpg",
                "developer": "Konami Digital Entertainment",
                "publisher": "Konami",
                "genres": ["Stealth", "Action", "Tactical"],
                "steam_appid": 287700,
            },
            {
                "game_id": "mario-maker",
                "title": "Super Mario Maker",
                "cover_url": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1qff.jpg",
                "developer": "Nintendo EAD",
                "publisher": "Nintendo",
                "genres": ["Level Editor", "Platformer", "Family"],
                "steam_appid": None,
            },
        ],
    },
    {
        "year": 2014,
        "award_name": "Game of the Year",
        "source": "The Game Awards",
        "winner": {
            "game_id": "1222690",
            "title": "Dragon Age: Inquisition",
            "slug": "dragon-age-inquisition",
            "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1222690/header.jpg",
            "hero_image": "https://cdn.akamai.steamstatic.com/steam/apps/1222690/library_hero.jpg",
            "developer": "BioWare",
            "publisher": "Electronic Arts",
            "release_date": "2014-11-18",
            "genres": ["RPG", "Action", "Fantasy"],
            "description": "A cataclysmic event plunges the land of Thedas into turmoil. Dragons darken the skies, casting a shadow upon a once peaceful kingdom.",
            "award_rationale": "Inaugural Game of the Year winner featuring grandiose tactical fantasy warfare and continent-shaping political intrigue.",
            "steam_appid": 1222690,
            "steam_url": "https://store.steampowered.com/app/1222690/Dragon_Age_Inquisition/",
        },
        "nominees": [
            {
                "game_id": "bayonetta-2",
                "title": "Bayonetta 2",
                "cover_url": "https://images.igdb.com/igdb/image/upload/t_cover_big/co20wt.jpg",
                "developer": "PlatinumGames",
                "publisher": "Nintendo",
                "genres": ["Hack and Slash", "Action", "Female Protagonist"],
                "steam_appid": None,
            },
            {
                "game_id": "335300",
                "title": "Dark Souls II: Scholar of the First Sin",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/335300/header.jpg",
                "developer": "FromSoftware",
                "publisher": "Bandai Namco Entertainment",
                "genres": ["Action RPG", "Souls-like", "Dark Fantasy"],
                "steam_appid": 335300,
            },
            {
                "game_id": "hearthstone",
                "title": "Hearthstone",
                "cover_url": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1x9a.jpg",
                "developer": "Blizzard Entertainment",
                "publisher": "Blizzard Entertainment",
                "genres": ["Digital Card Game", "Strategy", "Fantasy"],
                "steam_appid": None,
            },
            {
                "game_id": "241930",
                "title": "Middle-earth: Shadow of Mordor",
                "cover_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/241930/header.jpg",
                "developer": "Monolith Productions",
                "publisher": "Warner Bros. Games",
                "genres": ["Open World", "Action", "Nemesis System"],
                "steam_appid": 241930,
            },
        ],
    },
]


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
        self._mock_goty_archive: List[Dict[str, Any]] = _MOCK_GOTY_ARCHIVE
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
        for uid, u in self._mock_users.items():
            if u["email"].lower() == email.lower():
                raise ValueError("User with this email already exists")
            if u["username"].lower() == username.lower():
                raise ValueError("Username is already taken")

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
                if user and hasattr(user, "identities") and user.identities is not None and len(user.identities) == 0:
                    raise ValueError("User with this email already exists")
                uid = str(user.id)
                self._mock_profiles[uid] = {
                    "id": uid,
                    "username": username,
                    "display_name": display_name or username,
                    "avatar_url": f"https://ui-avatars.com/api/?name={username}&background=1e293b&color=cbd5e1",
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
                    "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                }
                self._mock_users[uid] = {
                    "id": uid,
                    "email": email,
                    "password": password,
                    "username": username,
                    "display_name": display_name or username,
                    "avatar_url": f"https://ui-avatars.com/api/?name={username}&background=1e293b&color=cbd5e1"
                }
                self._mock_libraries[uid] = {}
                return {
                    "user_id": uid,
                    "email": email,
                    "username": username,
                    "access_token": session.access_token if session else self.generate_jwt(uid, email, username),
                    "refresh_token": session.refresh_token if session else None,
                    "expires_in": 3600
                }
            except Exception as e:
                err_str = str(e).lower()
                # Distinguish validation and duplicate errors from service failures
                if "already registered" in err_str or "already exists" in err_str or "duplicate" in err_str:
                    raise ValueError("User with this email already exists")
                if "invalid" in err_str and ("email" in err_str or "password" in err_str):
                    raise ValueError(str(e))
                if "password" in err_str and ("least" in err_str or "short" in err_str or "weak" in err_str):
                    raise ValueError(str(e))
                # For external service failures (e.g. email rate limit exceeded, network timeouts),
                # fall through to offline/mock fallback implementation below.

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
                uid = str(user.id)
                meta = getattr(user, "user_metadata", {}) or {}
                username = meta.get("username", email.split("@")[0])
                if uid not in self._mock_profiles:
                    self._mock_profiles[uid] = {
                        "id": uid,
                        "username": username,
                        "display_name": meta.get("display_name", username),
                        "avatar_url": meta.get("avatar_url", f"https://ui-avatars.com/api/?name={username}&background=1e293b&color=cbd5e1"),
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
                        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    }
                return {
                    "user_id": uid,
                    "email": email,
                    "username": username,
                    "access_token": session.access_token,
                    "refresh_token": session.refresh_token,
                    "expires_in": 3600
                }
            except Exception as e:
                err_str = str(e).lower()
                # Check if user registered locally or via mock fallback
                local_user = next((u for u in self._mock_users.values() if u["email"].lower() == email.lower() and u["password"] == password), None)
                if local_user:
                    uid = local_user["id"]
                    token = self.generate_jwt(uid, local_user["email"], local_user["username"])
                    return {
                        "user_id": uid,
                        "email": local_user["email"],
                        "username": local_user["username"],
                        "access_token": token,
                        "refresh_token": f"mock-refresh-{uid}",
                        "expires_in": 3600
                    }
                if "invalid login credentials" in err_str or "invalid credentials" in err_str:
                    raise ValueError("Invalid email or password")
                if "email not confirmed" in err_str:
                    raise ValueError("Email address not confirmed. Please check your inbox.")
                # On external service error, fall through to mock check below

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

    def forgot_password(self, email: str) -> Dict[str, str]:
        """Initiate password reset flow."""
        clean_email = email.strip().lower()
        if self.is_configured():
            try:
                self.client.auth.reset_password_for_email(clean_email)
                return {"message": "Password reset instructions sent to your email."}
            except Exception:
                pass

        return {"message": "Password reset instructions sent to your email."}

    def reset_password(self, email: str, new_password: str, reset_token: Optional[str] = None) -> Dict[str, str]:
        """Complete password reset with new password."""
        clean_email = email.strip().lower()
        if self.is_configured():
            try:
                self.client.auth.update_user({"password": new_password})
                return {"message": "Password updated successfully."}
            except Exception:
                pass

        for uid, u in self._mock_users.items():
            if u["email"].lower() == clean_email:
                u["password"] = new_password
                return {"message": "Password updated successfully."}
        return {"message": "Password updated successfully."}

    def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve user profile."""
        if self.is_configured():
            try:
                res = self.client.table("profiles").select("*").eq("id", user_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception:
                pass
        return self._mock_profiles.get(user_id)

    def update_profile(self, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update user profile attributes."""
        if self.is_configured():
            try:
                res = self.client.table("profiles").update(updates).eq("id", user_id).execute()
                if res.data and len(res.data) > 0:
                    self._mock_profiles[user_id] = res.data[0]
                    return res.data[0]
            except Exception:
                pass

        profile = self._mock_profiles.get(user_id)
        if not profile:
            profile = {
                "id": user_id,
                "username": f"user_{user_id[:6]}",
                "display_name": f"User {user_id[:6]}",
                "avatar_url": f"https://ui-avatars.com/api/?name=User&background=1e293b&color=cbd5e1",
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
            self._mock_profiles[user_id] = profile

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

    def get_goty_archive(self) -> List[Dict[str, Any]]:
        """Retrieve historical Game of the Year (GOTY) winners and nominees archive (2014-present)."""
        if self.is_configured():
            try:
                res = self.client.table("goty_winners").select("*, games(*)").order("year", desc=True).execute()
                if res.data and len(res.data) > 0:
                    nominees_by_year = {item["year"]: item.get("nominees", []) for item in self._mock_goty_archive}
                    db_items = []
                    for row in res.data:
                        game = row.get("games") or {}
                        year = row.get("year")
                        ext_id = str(game.get("external_id") or row.get("game_id"))
                        db_items.append({
                            "year": year,
                            "award_name": row.get("award_name", "Game of the Year"),
                            "source": row.get("source", "The Game Awards"),
                            "winner": {
                                "game_id": ext_id,
                                "title": game.get("title", f"Game {year}"),
                                "slug": game.get("slug"),
                                "cover_url": game.get("cover_url"),
                                "hero_image": game.get("cover_url"),
                                "developer": game.get("developer"),
                                "publisher": game.get("publisher"),
                                "release_date": str(game.get("release_date") or ""),
                                "genres": game.get("genres") or [],
                                "description": game.get("description"),
                                "award_rationale": "Game of the Year Winner at The Game Awards",
                                "steam_appid": int(ext_id) if ext_id.isdigit() else None,
                                "steam_url": f"https://store.steampowered.com/app/{ext_id}/" if ext_id.isdigit() else None,
                            },
                            "nominees": nominees_by_year.get(year, []),
                        })
                    return db_items
            except Exception:
                pass

        return self._mock_goty_archive


# Global singleton instance
supabase_service = SupabaseService()


-- ==============================================================================
-- Game Finder - Triggers and Seed Data Migration
-- Migration: 20261007000002_triggers_and_seed.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Automatic User Profile Provisioning Trigger
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    clean_username TEXT;
    clean_display TEXT;
    clean_avatar TEXT;
BEGIN
    -- Extract username from raw_user_meta_data or fallback to email prefix
    clean_username := COALESCE(
        new.raw_user_meta_data->>'username',
        split_part(new.email, '@', 1)
    );
    clean_display := COALESCE(
        new.raw_user_meta_data->>'display_name',
        clean_username
    );
    clean_avatar := COALESCE(
        new.raw_user_meta_data->>'avatar_url',
        'https://ui-avatars.com/api/?name=' || clean_username || '&background=1e293b&color=cbd5e1'
    );

    INSERT INTO public.profiles (
        id,
        username,
        display_name,
        avatar_url,
        bio,
        created_at,
        updated_at
    )
    VALUES (
        new.id,
        clean_username,
        clean_display,
        clean_avatar,
        'Gamer on Game Finder',
        now(),
        now()
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if already exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 2. Seed Data for Curated Game of the Year (GOTY) Archive (2014–2024)
-- ------------------------------------------------------------------------------

-- Insert Canonical Games for GOTY Archive
INSERT INTO public.games (id, external_id, slug, title, description, cover_url, release_date, developer, publisher, genres, tags)
VALUES
    ('11111111-1111-1111-1111-111111112014', '1222690', 'dragon-age-inquisition', 'Dragon Age: Inquisition', 'A cataclysmic event plunges the land of Thedas into turmoil.', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1222690/header.jpg', '2014-11-18', 'BioWare', 'Electronic Arts', ARRAY['RPG', 'Action'], ARRAY['Fantasy', 'Story Rich', 'Open World']),
    ('11111111-1111-1111-1111-111111112015', '292030', 'the-witcher-3-wild-hunt', 'The Witcher 3: Wild Hunt', 'You are Geralt of Rivia, mercenary monster slayer.', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg', '2015-05-18', 'CD PROJEKT RED', 'CD PROJEKT RED', ARRAY['RPG', 'Adventure'], ARRAY['Open World', 'Masterpiece', 'Story Rich']),
    ('11111111-1111-1111-1111-111111112016', '2357570', 'overwatch-2', 'Overwatch', 'A colorful team-based action game starring diverse heroes.', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2357570/header.jpg', '2016-05-24', 'Blizzard Entertainment', 'Blizzard Entertainment', ARRAY['Shooter', 'Action'], ARRAY['Hero Shooter', 'Multiplayer', 'Competitive']),
    ('11111111-1111-1111-1111-111111112017', 'zelda-botw', 'the-legend-of-zelda-breath-of-the-wild', 'The Legend of Zelda: Breath of the Wild', 'Step into a world of discovery, exploration, and adventure.', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3p2d.jpg', '2017-03-03', 'Nintendo EPD', 'Nintendo', ARRAY['Adventure', 'Action'], ARRAY['Open World', 'Fantasy', 'Exploration']),
    ('11111111-1111-1111-1111-111111112018', '1593500', 'god-of-war-2018', 'God of War', 'His vengeance against the Gods of Olympus years behind him, Kratos now lives as a man in the realm of Norse Gods.', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1593500/header.jpg', '2018-04-20', 'Santa Monica Studio', 'PlayStation PC LLC', ARRAY['Action', 'Adventure'], ARRAY['Mythology', 'Action-Adventure', 'Singleplayer']),
    ('11111111-1111-1111-1111-111111112019', '814380', 'sekiro-shadows-die-twice', 'Sekiro: Shadows Die Twice', 'Carve your own clever path to vengeance in an all-new adventure from developer FromSoftware.', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/814380/header.jpg', '2019-03-21', 'FromSoftware', 'Activision', ARRAY['Action', 'Adventure'], ARRAY['Souls-like', 'Difficult', 'Ninja']),
    ('11111111-1111-1111-1111-111111112020', 'tlou-part-2', 'the-last-of-us-part-ii', 'The Last of Us Part II', 'Five years after their dangerous journey across the post-pandemic United States, Ellie and Joel have settled down.', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co20wa.jpg', '2020-06-19', 'Naughty Dog', 'Sony Interactive Entertainment', ARRAY['Action', 'Adventure'], ARRAY['Story Rich', 'Post-Apocalyptic', 'Survival']),
    ('11111111-1111-1111-1111-111111112021', '1426210', 'it-takes-two', 'It Takes Two', 'Embark on the craziest journey of your life in It Takes Two, a genre-bending platform adventure built purely for co-op.', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1426210/header.jpg', '2021-03-25', 'Hazelight Studios', 'Electronic Arts', ARRAY['Adventure', 'Platformer'], ARRAY['Co-op', 'Multiplayer', 'Puzzle']),
    ('11111111-1111-1111-1111-111111112022', '1245620', 'elden-ring', 'Elden Ring', 'THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg', '2022-02-24', 'FromSoftware', 'Bandai Namco Entertainment', ARRAY['RPG', 'Action'], ARRAY['Souls-like', 'Open World', 'Dark Fantasy']),
    ('11111111-1111-1111-1111-111111112023', '1086940', 'baldurs-gate-3', 'Baldur''s Gate 3', 'Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival.', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg', '2023-08-03', 'Larian Studios', 'Larian Studios', ARRAY['RPG', 'Strategy'], ARRAY['Choices Matter', 'Turn-Based Combat', 'Story Rich']),
    ('11111111-1111-1111-1111-111111112024', 'astro-bot', 'astro-bot', 'Astro Bot', 'Join ASTRO in a brand-new, supersized space adventure across over 50 planets.', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8435.jpg', '2024-09-06', 'Team Asobi', 'Sony Interactive Entertainment', ARRAY['Platformer', 'Action'], ARRAY['3D Platformer', 'Family Friendly', 'PlayStation'])
ON CONFLICT (id) DO NOTHING;

-- Insert GOTY Winners Mapping
INSERT INTO public.goty_winners (year, game_id, award_name, source)
VALUES
    (2014, '11111111-1111-1111-1111-111111112014', 'Game of the Year', 'The Game Awards'),
    (2015, '11111111-1111-1111-1111-111111112015', 'Game of the Year', 'The Game Awards'),
    (2016, '11111111-1111-1111-1111-111111112016', 'Game of the Year', 'The Game Awards'),
    (2017, '11111111-1111-1111-1111-111111112017', 'Game of the Year', 'The Game Awards'),
    (2018, '11111111-1111-1111-1111-111111112018', 'Game of the Year', 'The Game Awards'),
    (2019, '11111111-1111-1111-1111-111111112019', 'Game of the Year', 'The Game Awards'),
    (2020, '11111111-1111-1111-1111-111111112020', 'Game of the Year', 'The Game Awards'),
    (2021, '11111111-1111-1111-1111-111111112021', 'Game of the Year', 'The Game Awards'),
    (2022, '11111111-1111-1111-1111-111111112022', 'Game of the Year', 'The Game Awards'),
    (2023, '11111111-1111-1111-1111-111111112023', 'Game of the Year', 'The Game Awards'),
    (2024, '11111111-1111-1111-1111-111111112024', 'Game of the Year', 'The Game Awards')
ON CONFLICT (year) DO NOTHING;

-- ==============================================================================
-- Game Finder - Initial Database Schema Migration
-- Migration: 20261007000000_initial_schema.sql
-- ==============================================================================

-- Enable pgcrypto / uuid-ossp if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Profiles Table (extends auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    favorite_genres TEXT[] DEFAULT '{}',
    preferred_platforms TEXT[] DEFAULT '{}',
    default_difficulty TEXT DEFAULT 'medium',
    default_age_rating TEXT DEFAULT 'T',
    is_public BOOLEAN DEFAULT true,
    show_library BOOLEAN DEFAULT true,
    show_favorites BOOLEAN DEFAULT true,
    show_reviews BOOLEAN DEFAULT true,
    show_rankings BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. Games Table (Canonical Game Records)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    cover_url TEXT,
    hero_url TEXT,
    logo_url TEXT,
    release_date TEXT,
    developer TEXT,
    publisher TEXT,
    platforms TEXT[] DEFAULT '{}',
    genres TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    store_url TEXT,
    metadata_source TEXT DEFAULT 'steam',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 3. Game Media Table (Screenshots, Trailers, Artwork, Logos)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.game_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL CHECK (media_type IN ('screenshot', 'trailer', 'artwork', 'logo')),
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 4. User Games Table (Personal Library, Status Shelves, Playtimes)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    is_favorite BOOLEAN DEFAULT false,
    is_wishlisted BOOLEAN DEFAULT false,
    status TEXT CHECK (status IN ('wishlist', 'backlog', 'playing', 'completed', 'dropped')),
    personal_rating INTEGER CHECK (personal_rating >= 1 AND personal_rating <= 10),
    personal_rank INTEGER,
    playtime_hours NUMERIC DEFAULT 0,
    notes TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT user_games_user_game_unique UNIQUE (user_id, game_id)
);

-- ------------------------------------------------------------------------------
-- 5. Reviews Table (Ratings & Written Markdown Reviews)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
    title TEXT,
    body TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT reviews_user_game_unique UNIQUE (user_id, game_id)
);

-- ------------------------------------------------------------------------------
-- 6. Ranked Lists Table (Personal Top 10 Lists)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ranked_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'My Top 10',
    rank_positions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 7. Game of the Year (GOTY) Winners Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.goty_winners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER NOT NULL UNIQUE,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    award_name TEXT NOT NULL,
    source TEXT DEFAULT 'The Game Awards',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- Indexes for High Performance Querying
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_games_slug ON public.games(slug);
CREATE INDEX IF NOT EXISTS idx_games_external_id ON public.games(external_id);
CREATE INDEX IF NOT EXISTS idx_game_media_game_id ON public.game_media(game_id);
CREATE INDEX IF NOT EXISTS idx_user_games_user_id ON public.user_games(user_id);
CREATE INDEX IF NOT EXISTS idx_user_games_user_status ON public.user_games(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_games_is_favorite ON public.user_games(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_reviews_game_id ON public.reviews(game_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_ranked_lists_user_id ON public.ranked_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_goty_winners_year ON public.goty_winners(year);

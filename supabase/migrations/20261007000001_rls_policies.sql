-- ==============================================================================
-- Game Finder - Row-Level Security (RLS) Policies Migration
-- Migration: 20261007000001_rls_policies.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Enable Row-Level Security on All Public Tables
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranked_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goty_winners ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. Profiles Policies
-- ------------------------------------------------------------------------------
-- Anyone can view public profiles; users can always view their own profile
CREATE POLICY "Profiles are viewable by owner or if public"
    ON public.profiles
    FOR SELECT
    USING (is_public = true OR auth.uid() = id);

-- Users can insert only their own profile
CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update only their own profile
CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can delete only their own profile
CREATE POLICY "Users can delete their own profile"
    ON public.profiles
    FOR DELETE
    USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 3. Games & Media Policies (Public read, Service Role write)
-- ------------------------------------------------------------------------------
CREATE POLICY "Games are viewable by everyone"
    ON public.games
    FOR SELECT
    USING (true);

CREATE POLICY "Games can only be modified by service role"
    ON public.games
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Game media is viewable by everyone"
    ON public.game_media
    FOR SELECT
    USING (true);

CREATE POLICY "Game media can only be modified by service role"
    ON public.game_media
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- ------------------------------------------------------------------------------
-- 4. User Games Policies (Library Shelves & Tracking)
-- ------------------------------------------------------------------------------
-- Library entries can be read by their owner, or by anyone if the user's profile is public with show_library = true
CREATE POLICY "User games are viewable by owner or if profile public"
    ON public.user_games
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE public.profiles.id = public.user_games.user_id
              AND public.profiles.show_library = true
              AND public.profiles.is_public = true
        )
    );

-- Users can only insert records into their own library
CREATE POLICY "Users can insert into their own library"
    ON public.user_games
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only update records in their own library
CREATE POLICY "Users can update their own library items"
    ON public.user_games
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can only delete records from their own library
CREATE POLICY "Users can delete their own library items"
    ON public.user_games
    FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 5. Reviews Policies
-- ------------------------------------------------------------------------------
-- Reviews are publicly readable
CREATE POLICY "Reviews are viewable by everyone"
    ON public.reviews
    FOR SELECT
    USING (true);

-- Users can only create their own reviews
CREATE POLICY "Users can insert their own reviews"
    ON public.reviews
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only update their own reviews
CREATE POLICY "Users can update their own reviews"
    ON public.reviews
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own reviews
CREATE POLICY "Users can delete their own reviews"
    ON public.reviews
    FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 6. Ranked Lists Policies
-- ------------------------------------------------------------------------------
-- Ranked lists can be read by their owner, or by anyone if the profile is public with show_rankings = true
CREATE POLICY "Ranked lists are viewable by owner or if profile public"
    ON public.ranked_lists
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE public.profiles.id = public.ranked_lists.user_id
              AND public.profiles.show_rankings = true
              AND public.profiles.is_public = true
        )
    );

-- Users can only manage their own ranked lists
CREATE POLICY "Users can insert their own ranked lists"
    ON public.ranked_lists
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ranked lists"
    ON public.ranked_lists
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ranked lists"
    ON public.ranked_lists
    FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 7. GOTY Winners Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "GOTY winners are viewable by everyone"
    ON public.goty_winners
    FOR SELECT
    USING (true);

CREATE POLICY "GOTY winners can only be modified by service role"
    ON public.goty_winners
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

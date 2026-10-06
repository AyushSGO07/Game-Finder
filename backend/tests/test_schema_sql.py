import os
import re
import pytest

MIGRATIONS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "supabase", "migrations")

def read_migration(filename: str) -> str:
    path = os.path.join(MIGRATIONS_DIR, filename)
    assert os.path.exists(path), f"Migration file {filename} does not exist at {path}"
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def test_initial_schema_migration_tables_exist():
    sql = read_migration("20261007000000_initial_schema.sql")
    
    expected_tables = [
        "public.profiles",
        "public.games",
        "public.game_media",
        "public.user_games",
        "public.reviews",
        "public.ranked_lists",
        "public.goty_winners"
    ]
    
    for table in expected_tables:
        pattern = rf"CREATE TABLE IF NOT EXISTS {re.escape(table)}"
        assert re.search(pattern, sql, re.IGNORECASE), f"Missing CREATE TABLE for {table}"


def test_initial_schema_migration_constraints_and_cascades():
    sql = read_migration("20261007000000_initial_schema.sql")
    
    # Profiles cascade from auth.users
    assert "REFERENCES auth.users(id) ON DELETE CASCADE" in sql
    
    # Cascade deletes on foreign keys
    assert "REFERENCES public.games(id) ON DELETE CASCADE" in sql
    
    # Unique constraints
    assert "CONSTRAINT user_games_user_game_unique UNIQUE (user_id, game_id)" in sql
    assert "CONSTRAINT reviews_user_game_unique UNIQUE (user_id, game_id)" in sql
    
    # Enums / Check constraints
    assert "CHECK (media_type IN ('screenshot', 'trailer', 'artwork', 'logo'))" in sql
    assert "CHECK (status IN ('wishlist', 'backlog', 'playing', 'completed', 'dropped'))" in sql
    assert "CHECK (personal_rating >= 1 AND personal_rating <= 10)" in sql


def test_initial_schema_migration_indexes():
    sql = read_migration("20261007000000_initial_schema.sql")
    
    expected_indexes = [
        "idx_games_slug",
        "idx_games_external_id",
        "idx_game_media_game_id",
        "idx_user_games_user_id",
        "idx_user_games_user_status",
        "idx_user_games_is_favorite",
        "idx_reviews_game_id",
        "idx_reviews_user_id",
        "idx_ranked_lists_user_id",
        "idx_goty_winners_year"
    ]
    
    for idx in expected_indexes:
        assert idx in sql, f"Missing index {idx} in initial schema migration"


def test_rls_policies_migration_enablement_and_rules():
    sql = read_migration("20261007000001_rls_policies.sql")
    
    expected_tables = [
        "public.profiles",
        "public.games",
        "public.game_media",
        "public.user_games",
        "public.reviews",
        "public.ranked_lists",
        "public.goty_winners"
    ]
    
    for table in expected_tables:
        pattern = rf"ALTER TABLE {re.escape(table)} ENABLE ROW LEVEL SECURITY;"
        assert re.search(pattern, sql, re.IGNORECASE), f"Missing ENABLE ROW LEVEL SECURITY for {table}"
        
    # Verify key tenant isolation policies
    assert "auth.uid() = id" in sql
    assert "auth.uid() = user_id" in sql
    assert "auth.role() = 'service_role'" in sql
    assert "show_library = true" in sql
    assert "show_rankings = true" in sql


def test_triggers_and_seed_migration():
    sql = read_migration("20261007000002_triggers_and_seed.sql")
    
    # Auto-provisioning trigger
    assert "CREATE OR REPLACE FUNCTION public.handle_new_user()" in sql
    assert "CREATE TRIGGER on_auth_user_created" in sql
    assert "AFTER INSERT ON auth.users" in sql
    
    # GOTY winners seed (2014-2024)
    for year in range(2014, 2025):
        assert f"({year}," in sql or f"({year} ," in sql, f"Missing seed row for GOTY year {year}"
    
    assert "The Witcher 3: Wild Hunt" in sql
    assert "Elden Ring" in sql
    assert "Baldur''s Gate 3" in sql
    assert "Astro Bot" in sql

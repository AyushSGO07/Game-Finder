"""Tests for Game of the Year (GOTY) historical archive endpoint."""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_get_goty_archive_success():
    """Verify GOTY archive endpoint returns 200 and a non-empty list."""
    response = client.get("/api/v1/games/goty")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 11


def test_get_goty_archive_covers_all_years():
    """Verify archive contains all years from 2014 through 2024."""
    response = client.get("/api/v1/games/goty")
    assert response.status_code == 200
    data = response.json()

    years = [entry["year"] for entry in data]
    expected_years = list(range(2014, 2025))

    for y in expected_years:
        assert y in years, f"Expected year {y} to be in GOTY archive"


def test_get_goty_archive_winner_and_nominees_structure():
    """Verify each entry has a valid winner structure and nominee list."""
    response = client.get("/api/v1/games/goty")
    assert response.status_code == 200
    data = response.json()

    for entry in data:
        assert "year" in entry
        assert "award_name" in entry
        assert "winner" in entry
        assert "nominees" in entry

        winner = entry["winner"]
        assert "game_id" in winner
        assert "title" in winner
        assert len(winner["title"]) > 0

        nominees = entry["nominees"]
        assert isinstance(nominees, list)
        assert len(nominees) >= 4
        for nom in nominees:
            assert "game_id" in nom
            assert "title" in nom


def test_goty_winner_specific_years():
    """Verify specific known winners (e.g. 2023 Baldur's Gate 3, 2022 Elden Ring)."""
    response = client.get("/api/v1/games/goty")
    assert response.status_code == 200
    data = response.json()

    by_year = {entry["year"]: entry for entry in data}

    assert "Baldur's Gate 3" in by_year[2023]["winner"]["title"]
    assert "Elden Ring" in by_year[2022]["winner"]["title"]
    assert "Astro Bot" in by_year[2024]["winner"]["title"]
    assert "Dragon Age" in by_year[2014]["winner"]["title"]

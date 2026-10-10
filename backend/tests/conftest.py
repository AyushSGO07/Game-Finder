import pytest
from fastapi.testclient import TestClient
from backend.app.main import app


@pytest.fixture
def client():
    """FastAPI TestClient fixture."""
    return TestClient(app)


@pytest.fixture(autouse=True)
def isolate_supabase_client():
    from backend.app.services.supabase_service import supabase_service
    old_client = supabase_service.client
    supabase_service.client = None
    yield
    supabase_service.client = old_client


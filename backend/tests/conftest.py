import os

os.environ.setdefault("MOCK_MODE", "true")
os.environ.setdefault("FRONTEND_ORIGINS", "http://localhost:3000")

import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client():
    return TestClient(app)

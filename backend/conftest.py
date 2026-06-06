import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).parent))

SIGNUP_DATA = {
    "name": "Test User",
    "phone": "9999999999",
    "email": "user@test.com",
    "location": "Bangalore",
    "password": "pass123",
}

ADMIN_CREDS = {
    "email": "Truptiyoganaturecure@gmail.com",
    "password": "Trupti_yoga",
}


@pytest.fixture(autouse=True)
def isolate(tmp_path, monkeypatch):
    """Give each test its own fresh SQLite DB and clear in-memory token stores."""
    import models
    import main

    monkeypatch.setattr(models, "DB_PATH", tmp_path / "test.db")
    models.init_db()
    main.active_tokens.clear()
    main.admin_tokens.clear()
    yield
    main.active_tokens.clear()
    main.admin_tokens.clear()


@pytest.fixture
def client(isolate):
    from main import app
    return TestClient(app)


@pytest.fixture
def user_token(client):
    """Signed-up and logged-in regular user token."""
    client.post("/signup", json=SIGNUP_DATA)
    r = client.post("/login", json={"email": SIGNUP_DATA["email"], "password": SIGNUP_DATA["password"]})
    return r.json()["token"]


@pytest.fixture
def user_headers(user_token):
    return {"Authorization": f"Bearer {user_token}"}


@pytest.fixture
def admin_token(client):
    """Admin token."""
    r = client.post("/admin/login", json=ADMIN_CREDS)
    return r.json()["token"]


@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def payment_id(client, user_headers, admin_headers):
    """Submit a payment and return its DB id."""
    client.post("/payment", json={"plan": "1month", "transaction_id": "TXN001"}, headers=user_headers)
    users = client.get("/admin/users", headers=admin_headers).json()
    return users[0]["payment_id"]

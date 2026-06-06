SIGNUP = {
    "name": "Test User",
    "phone": "9999999999",
    "email": "user@test.com",
    "location": "Bangalore",
    "password": "pass123",
}


def test_signup_success(client):
    r = client.post("/signup", json=SIGNUP)
    assert r.status_code == 200
    assert "created" in r.json()["message"].lower()


def test_signup_duplicate_email(client):
    client.post("/signup", json=SIGNUP)
    r = client.post("/signup", json=SIGNUP)
    assert r.status_code == 400
    assert "already registered" in r.json()["detail"].lower()


def test_login_success(client):
    client.post("/signup", json=SIGNUP)
    r = client.post("/login", json={"email": SIGNUP["email"], "password": SIGNUP["password"]})
    assert r.status_code == 200
    data = r.json()
    assert "token" in data
    assert data["name"] == SIGNUP["name"]


def test_login_wrong_password(client):
    client.post("/signup", json=SIGNUP)
    r = client.post("/login", json={"email": SIGNUP["email"], "password": "wrongpass"})
    assert r.status_code == 401


def test_login_unknown_email(client):
    r = client.post("/login", json={"email": "nobody@test.com", "password": "pass"})
    assert r.status_code == 401


def test_logout_invalidates_token(client, user_token, user_headers):
    r = client.post("/logout", headers=user_headers)
    assert r.status_code == 200

    # Token should no longer work
    r2 = client.get("/dashboard", headers=user_headers)
    assert r2.status_code == 401


def test_dashboard_requires_auth(client):
    r = client.get("/dashboard")
    assert r.status_code == 422  # missing Authorization header

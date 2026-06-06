ADMIN_CREDS = {
    "email": "Truptiyoganaturecure@gmail.com",
    "password": "Trupti_yoga",
}

MEET_LINKS = {
    "meet_6am":  "https://meet.google.com/abc-def-ghi",
    "meet_8am":  "https://meet.google.com/jkl-mno-pqr",
    "meet_11am": "https://meet.google.com/stu-vwx-yza",
}


# ── Admin login ───────────────────────────────────────────

def test_admin_login_success(client):
    r = client.post("/admin/login", json=ADMIN_CREDS)
    assert r.status_code == 200
    assert "token" in r.json()


def test_admin_login_wrong_password(client):
    r = client.post("/admin/login", json={"email": ADMIN_CREDS["email"], "password": "wrong"})
    assert r.status_code == 401


def test_admin_login_wrong_email(client):
    r = client.post("/admin/login", json={"email": "hacker@evil.com", "password": ADMIN_CREDS["password"]})
    assert r.status_code == 401


# ── User listing ──────────────────────────────────────────

def test_list_users_empty(client, admin_headers):
    r = client.get("/admin/users", headers=admin_headers)
    assert r.status_code == 200
    assert r.json() == []


def test_list_users_shows_registered_user(client, admin_headers, user_headers):
    r = client.get("/admin/users", headers=admin_headers)
    assert r.status_code == 200
    assert len(r.json()) == 1
    assert r.json()[0]["email"] == "user@test.com"


def test_admin_users_requires_auth(client):
    r = client.get("/admin/users")
    assert r.status_code == 422


# ── Approve / Reject ──────────────────────────────────────

def test_approve_payment(client, admin_headers, user_headers, payment_id):
    r = client.post(f"/admin/approve/{payment_id}", headers=admin_headers)
    assert r.status_code == 200

    dashboard = client.get("/dashboard", headers=user_headers).json()
    assert dashboard["payment"]["status"] == "approved"


def test_reject_payment(client, admin_headers, user_headers, payment_id):
    r = client.post(f"/admin/reject/{payment_id}", headers=admin_headers)
    assert r.status_code == 200

    dashboard = client.get("/dashboard", headers=user_headers).json()
    assert dashboard["payment"]["status"] == "rejected"


def test_approve_requires_admin(client, payment_id):
    r = client.post(f"/admin/approve/{payment_id}")
    assert r.status_code == 422


# ── Meet links ────────────────────────────────────────────

def test_get_meet_links_initially_empty(client, admin_headers):
    r = client.get("/admin/meet-links", headers=admin_headers)
    assert r.status_code == 200
    data = r.json()
    assert data == {"meet_6am": "", "meet_8am": "", "meet_11am": ""}


def test_save_meet_links(client, admin_headers):
    r = client.post("/admin/meet-links", json=MEET_LINKS, headers=admin_headers)
    assert r.status_code == 200


def test_saved_links_are_persisted(client, admin_headers):
    client.post("/admin/meet-links", json=MEET_LINKS, headers=admin_headers)
    r = client.get("/admin/meet-links", headers=admin_headers)
    assert r.json()["meet_6am"]  == MEET_LINKS["meet_6am"]
    assert r.json()["meet_8am"]  == MEET_LINKS["meet_8am"]
    assert r.json()["meet_11am"] == MEET_LINKS["meet_11am"]


def test_meet_links_visible_to_approved_user(client, admin_headers, user_headers, payment_id):
    # Save links then approve payment
    client.post("/admin/meet-links", json=MEET_LINKS, headers=admin_headers)
    client.post(f"/admin/approve/{payment_id}", headers=admin_headers)

    dashboard = client.get("/dashboard", headers=user_headers).json()
    assert dashboard["payment"]["meet_6am"]  == MEET_LINKS["meet_6am"]
    assert dashboard["payment"]["meet_8am"]  == MEET_LINKS["meet_8am"]
    assert dashboard["payment"]["meet_11am"] == MEET_LINKS["meet_11am"]


def test_meet_links_not_visible_to_pending_user(client, admin_headers, user_headers):
    client.post("/admin/meet-links", json=MEET_LINKS, headers=admin_headers)
    client.post("/payment", json={"plan": "1month", "transaction_id": "TXN001"}, headers=user_headers)

    dashboard = client.get("/dashboard", headers=user_headers).json()
    assert dashboard["payment"]["status"] == "pending"
    assert dashboard["payment"]["meet_6am"] == ""  # hidden until approved


def test_meet_links_requires_admin(client):
    r = client.get("/admin/meet-links")
    assert r.status_code == 422

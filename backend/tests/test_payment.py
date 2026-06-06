def test_submit_payment_success(client, user_headers):
    r = client.post("/payment", json={"plan": "1month", "transaction_id": "TXN001"}, headers=user_headers)
    assert r.status_code == 200
    assert "submitted" in r.json()["message"].lower()


def test_submit_payment_6month(client, user_headers):
    r = client.post("/payment", json={"plan": "6month", "transaction_id": "TXN002"}, headers=user_headers)
    assert r.status_code == 200


def test_submit_payment_1year(client, user_headers):
    r = client.post("/payment", json={"plan": "1year", "transaction_id": "TXN003"}, headers=user_headers)
    assert r.status_code == 200


def test_submit_payment_invalid_plan(client, user_headers):
    r = client.post("/payment", json={"plan": "3year", "transaction_id": "TXN999"}, headers=user_headers)
    assert r.status_code == 400


def test_submit_payment_requires_auth(client):
    r = client.post("/payment", json={"plan": "1month", "transaction_id": "TXN001"})
    assert r.status_code == 422


def test_duplicate_payment_blocked(client, user_headers):
    client.post("/payment", json={"plan": "1month", "transaction_id": "TXN001"}, headers=user_headers)
    r = client.post("/payment", json={"plan": "6month", "transaction_id": "TXN002"}, headers=user_headers)
    assert r.status_code == 400
    assert "already" in r.json()["detail"].lower()


def test_dashboard_shows_pending_payment(client, user_headers):
    client.post("/payment", json={"plan": "1month", "transaction_id": "TXN001"}, headers=user_headers)
    r = client.get("/dashboard", headers=user_headers)
    assert r.status_code == 200
    payment = r.json()["payment"]
    assert payment["status"] == "pending"
    assert payment["plan"] == "1month"
    assert payment["amount"] == 1000
    assert payment["meet_6am"] == ""  # no links for pending payments


def test_dashboard_no_payment(client, user_headers):
    r = client.get("/dashboard", headers=user_headers)
    assert r.status_code == 200
    assert r.json()["payment"] is None

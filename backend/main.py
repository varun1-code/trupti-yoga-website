from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import hashlib, sqlite3, os
import jwt
from datetime import datetime, timedelta, timezone
from models import get_connection, init_db
from email_utils import (send_welcome, send_payment_received, send_admin_new_payment,
                         send_payment_approved, send_payment_rejected)

app = FastAPI()

FRONTEND_URL   = os.environ.get("FRONTEND_URL",   "http://localhost:5173")
ADMIN_EMAIL    = os.environ.get("ADMIN_EMAIL",    "Truptiyoganaturecure@gmail.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "Trupti_yoga")
JWT_SECRET     = os.environ.get("JWT_SECRET",     "dev-secret-change-in-production")
JWT_ALGORITHM  = "HS256"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def create_token(payload: dict, expires_days: int = 7) -> str:
    data = payload.copy()
    data["exp"] = datetime.now(timezone.utc) + timedelta(days=expires_days)
    return jwt.encode(data, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired, please log in again")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

PLAN_AMOUNTS_INR = {
    "individual_1m": 2000,  "individual_3m": 5000,  "individual_6m": 8500,  "individual_12m": 15000,
    "couple_1m":     3000,  "couple_3m":     8000,  "couple_6m":     15000, "couple_12m":     25000,
    "family_1m":     5000,  "family_3m":     12000, "family_6m":     20000, "family_12m":     40000,
    "1to1_1m":       6000,  "1to1_3m":       15000, "1to1_6m":       30000,
}

PLAN_AMOUNTS_USD = {
    "individual_1m": 35,  "individual_3m": 105, "individual_6m": 165, "individual_12m": 265,
    "couple_1m":     55,  "couple_3m":     150, "couple_6m":     265, "couple_12m":     425,
    "family_1m":     85,  "family_3m":     235, "family_6m":     475, "family_12m":     800,
    "1to1_1m":       127, "1to1_3m":       320, "1to1_6m":       587,
}

PLAN_DAYS = {
    "individual_1m": 30,  "individual_3m": 90,  "individual_6m": 180, "individual_12m": 365,
    "couple_1m":     30,  "couple_3m":     90,  "couple_6m":     180, "couple_12m":     365,
    "family_1m":     30,  "family_3m":     90,  "family_6m":     180, "family_12m":     365,
    "1to1_1m":       30,  "1to1_3m":       90,  "1to1_6m":       180,
}


def calc_expiry(approved_at_str: str | None, plan: str):
    if not approved_at_str:
        return None, False
    approved_at = datetime.fromisoformat(approved_at_str)
    expires_at  = approved_at + timedelta(days=PLAN_DAYS.get(plan, 30))
    return expires_at.isoformat(), datetime.now() > expires_at


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def get_current_user(authorization: str = Header(...)) -> int:
    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id or payload.get("role") == "admin":
        raise HTTPException(status_code=401, detail="Not authenticated")
    return int(user_id)


# ── Schemas ──────────────────────────────────────────────

class SignupRequest(BaseModel):
    name: str
    phone: str
    email: str
    location: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class PaymentRequest(BaseModel):
    plan: str
    transaction_id: str = ""
    currency: str = "INR"
    paypal_order_id: str = ""   # set for PayPal payments → auto-approved

class AdminLoginRequest(BaseModel):
    email: str
    password: str

class MeetLinksRequest(BaseModel):
    meet_6am: str = ""
    meet_8am: str = ""
    meet_11am: str = ""

class ClientMeetLinkRequest(BaseModel):
    link: str

class ScheduleProposeRequest(BaseModel):
    proposed_time: str
    notes: str = ""

class AdminScheduleProposeRequest(BaseModel):
    user_id: int
    payment_id: int
    proposed_time: str
    notes: str = ""


# ── Auth ─────────────────────────────────────────────────

@app.post("/signup")
def signup(data: SignupRequest):
    conn = get_connection()
    try:
        conn.execute(
            "INSERT INTO users (name, phone, email, location, password) VALUES (?, ?, ?, ?, ?)",
            (data.name, data.phone, data.email, data.location, hash_password(data.password))
        )
        conn.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Email already registered")
    finally:
        conn.close()
    send_welcome(data.email, data.name)
    return {"message": "Account created successfully"}


@app.post("/login")
def login(data: LoginRequest):
    conn = get_connection()
    user = conn.execute(
        "SELECT * FROM users WHERE email = ? AND password = ?",
        (data.email, hash_password(data.password))
    ).fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token({"sub": str(user["id"])})
    return {"token": token, "name": user["name"]}


@app.post("/logout")
def logout(_: int = Depends(get_current_user)):
    # JWT is stateless — the client drops the token; nothing to invalidate server-side
    return {"message": "Logged out"}


# ── Payment ───────────────────────────────────────────────

@app.post("/payment")
def submit_payment(data: PaymentRequest, user_id: int = Depends(get_current_user)):
    amounts = PLAN_AMOUNTS_USD if data.currency == "USD" else PLAN_AMOUNTS_INR
    if data.plan not in amounts:
        raise HTTPException(status_code=400, detail="Invalid plan")
    amount = amounts[data.plan]
    conn = get_connection()
    existing = conn.execute(
        "SELECT * FROM payments WHERE user_id = ? AND status IN ('pending', 'approved') ORDER BY created_at DESC LIMIT 1",
        (user_id,)
    ).fetchone()
    if existing:
        if existing["status"] == "pending":
            conn.close()
            raise HTTPException(status_code=400, detail="You already have a payment awaiting approval")
        _, is_expired = calc_expiry(existing["approved_at"], existing["plan"])
        if not is_expired:
            conn.close()
            raise HTTPException(status_code=400, detail="You already have an active membership")
    is_paypal = bool(data.paypal_order_id)
    status     = "approved" if is_paypal else "pending"
    approved_at = datetime.now().isoformat() if is_paypal else None

    conn.execute(
        "INSERT INTO payments (user_id, plan, amount, transaction_id, currency, status, approved_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (user_id, data.plan, amount, data.paypal_order_id or data.transaction_id, data.currency, status, approved_at)
    )
    conn.commit()
    # Fetch user details for emails before closing
    user = conn.execute("SELECT name, email FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    u_name, u_email = user["name"], user["email"]
    amt_str = str(amount)

    if is_paypal:
        expires_at, _ = calc_expiry(approved_at, data.plan)
        exp_str = None
        if expires_at:
            from datetime import datetime as dt
            exp_str = dt.fromisoformat(expires_at).strftime("%d %b %Y")
        send_payment_approved(u_email, u_name, data.plan, amt_str, data.currency, exp_str)
    else:
        send_payment_received(u_email, u_name, data.plan, amt_str, data.currency)
        send_admin_new_payment(
            ADMIN_EMAIL, u_name, u_email, data.plan, amt_str,
            data.currency, data.transaction_id
        )

    msg = "Payment successful. Your membership is now active!" if is_paypal else "Payment submitted. Awaiting approval."
    return {"message": msg, "auto_approved": is_paypal}


@app.get("/dashboard")
def get_dashboard(user_id: int = Depends(get_current_user)):
    conn = get_connection()
    user = conn.execute("SELECT name, email, phone, location FROM users WHERE id = ?", (user_id,)).fetchone()
    payment = conn.execute(
        "SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
        (user_id,)
    ).fetchone()
    result = {
        "name": user["name"], "email": user["email"],
        "phone": user["phone"], "location": user["location"],
        "payment": None,
    }
    if payment:
        p = dict(payment)
        meet_6am = meet_8am = meet_11am = ""
        expires_at, is_expired = calc_expiry(p.get("approved_at"), p.get("plan", ""))
        is_1to1 = p.get("plan", "").startswith("1to1")
        if p["status"] == "approved" and not is_expired and not is_1to1:
            rows = conn.execute(
                "SELECT key, value FROM settings WHERE key IN ('meet_6am','meet_8am','meet_11am')"
            ).fetchall()
            links = {r["key"]: r["value"] for r in rows}
            meet_6am  = links.get("meet_6am", "")
            meet_8am  = links.get("meet_8am", "")
            meet_11am = links.get("meet_11am", "")
        result["payment"] = {
            "plan":             p["plan"],
            "amount":           p["amount"],
            "currency":         p.get("currency") or "INR",
            "status":           p["status"],
            "expires_at":       expires_at,
            "is_expired":       is_expired,
            "is_1to1":          is_1to1,
            "client_meet_link": p.get("client_meet_link") or "",
            "meet_6am":         meet_6am,
            "meet_8am":         meet_8am,
            "meet_11am":        meet_11am,
        }
    conn.close()
    return result


# ── Schedule (Client) ────────────────────────────────────

@app.get("/schedule")
def get_my_schedules(user_id: int = Depends(get_current_user)):
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM schedules WHERE user_id = ? ORDER BY created_at DESC",
        (user_id,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.post("/schedule/propose")
def propose_schedule(data: ScheduleProposeRequest, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    payment = conn.execute(
        "SELECT * FROM payments WHERE user_id = ? AND status = 'approved' AND plan LIKE '1to1_%' ORDER BY created_at DESC LIMIT 1",
        (user_id,)
    ).fetchone()
    if not payment:
        conn.close()
        raise HTTPException(status_code=400, detail="You do not have an active One-to-One membership")
    conn.execute(
        "INSERT INTO schedules (payment_id, user_id, proposed_by, proposed_time, notes) VALUES (?, ?, 'client', ?, ?)",
        (payment["id"], user_id, data.proposed_time, data.notes)
    )
    conn.commit()
    conn.close()
    return {"message": "Session time proposed. Awaiting admin confirmation."}


@app.post("/schedule/accept/{schedule_id}")
def accept_schedule(schedule_id: int, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    s = conn.execute(
        "SELECT * FROM schedules WHERE id = ? AND user_id = ?", (schedule_id, user_id)
    ).fetchone()
    if not s or s["proposed_by"] != "admin":
        conn.close()
        raise HTTPException(status_code=404, detail="Schedule not found")
    conn.execute("UPDATE schedules SET status = 'confirmed' WHERE id = ?", (schedule_id,))
    conn.commit()
    conn.close()
    return {"message": "Session confirmed"}


@app.post("/schedule/reject/{schedule_id}")
def reject_schedule(schedule_id: int, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    s = conn.execute(
        "SELECT * FROM schedules WHERE id = ? AND user_id = ?", (schedule_id, user_id)
    ).fetchone()
    if not s or s["proposed_by"] != "admin":
        conn.close()
        raise HTTPException(status_code=404, detail="Schedule not found")
    conn.execute("UPDATE schedules SET status = 'rejected' WHERE id = ?", (schedule_id,))
    conn.commit()
    conn.close()
    return {"message": "Session rejected"}


# ── Admin ─────────────────────────────────────────────────

@app.post("/admin/login")
def admin_login(data: AdminLoginRequest):
    if data.email != ADMIN_EMAIL or data.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token({"sub": "admin", "role": "admin"}, expires_days=1)
    return {"token": token}


def get_admin(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    if payload.get("role") != "admin":
        raise HTTPException(status_code=401, detail="Not authorized")


@app.get("/admin/users")
def list_users(_=Depends(get_admin)):
    conn = get_connection()
    rows = conn.execute("""
        SELECT u.id, u.name, u.email, u.phone, u.location, u.created_at,
               p.id as payment_id, p.plan, p.amount, p.transaction_id, p.currency,
               p.status, p.created_at as paid_at, p.approved_at, p.client_meet_link
        FROM users u
        LEFT JOIN payments p ON p.user_id = u.id
        ORDER BY p.created_at DESC
    """).fetchall()
    conn.close()
    result = []
    for r in rows:
        row = dict(r)
        expires_at, is_expired = calc_expiry(row.get("approved_at"), row.get("plan") or "")
        row["expires_at"] = expires_at
        row["is_expired"] = is_expired
        result.append(row)
    return result


@app.post("/admin/client-meet-link/{payment_id}")
def set_client_meet_link(payment_id: int, data: ClientMeetLinkRequest, _=Depends(get_admin)):
    conn = get_connection()
    conn.execute("UPDATE payments SET client_meet_link = ? WHERE id = ?", (data.link, payment_id))
    conn.commit()
    conn.close()
    return {"message": "Client meet link saved"}


@app.get("/admin/schedules")
def get_all_schedules(_=Depends(get_admin)):
    conn = get_connection()
    rows = conn.execute("""
        SELECT s.*, u.name, u.email
        FROM schedules s
        JOIN users u ON u.id = s.user_id
        ORDER BY s.created_at DESC
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.post("/admin/schedule/approve/{schedule_id}")
def admin_approve_schedule(schedule_id: int, _=Depends(get_admin)):
    conn = get_connection()
    conn.execute("UPDATE schedules SET status = 'confirmed' WHERE id = ?", (schedule_id,))
    conn.commit()
    conn.close()
    return {"message": "Schedule confirmed"}


@app.post("/admin/schedule/decline/{schedule_id}")
def admin_decline_schedule(schedule_id: int, _=Depends(get_admin)):
    conn = get_connection()
    conn.execute("UPDATE schedules SET status = 'declined' WHERE id = ?", (schedule_id,))
    conn.commit()
    conn.close()
    return {"message": "Schedule declined"}


@app.post("/admin/schedule/propose")
def admin_propose_schedule(data: AdminScheduleProposeRequest, _=Depends(get_admin)):
    conn = get_connection()
    conn.execute(
        "INSERT INTO schedules (payment_id, user_id, proposed_by, proposed_time, notes) VALUES (?, ?, 'admin', ?, ?)",
        (data.payment_id, data.user_id, data.proposed_time, data.notes)
    )
    conn.commit()
    conn.close()
    return {"message": "Time proposed to client"}


@app.get("/admin/meet-links")
def get_meet_links(_=Depends(get_admin)):
    conn = get_connection()
    rows = conn.execute(
        "SELECT key, value FROM settings WHERE key IN ('meet_6am','meet_8am','meet_11am')"
    ).fetchall()
    conn.close()
    return {r["key"]: r["value"] for r in rows}


@app.post("/admin/meet-links")
def save_meet_links(data: MeetLinksRequest, _=Depends(get_admin)):
    conn = get_connection()
    conn.execute("UPDATE settings SET value = ? WHERE key = 'meet_6am'",  (data.meet_6am,))
    conn.execute("UPDATE settings SET value = ? WHERE key = 'meet_8am'",  (data.meet_8am,))
    conn.execute("UPDATE settings SET value = ? WHERE key = 'meet_11am'", (data.meet_11am,))
    conn.commit()
    conn.close()
    return {"message": "Meet links saved"}


@app.post("/admin/approve/{payment_id}")
def approve_payment(payment_id: int, _=Depends(get_admin)):
    conn = get_connection()
    conn.execute(
        "UPDATE payments SET status = 'approved', approved_at = CURRENT_TIMESTAMP WHERE id = ?",
        (payment_id,)
    )
    conn.commit()
    conn.close()
    return {"message": "Payment approved"}


@app.post("/admin/reject/{payment_id}")
def reject_payment(payment_id: int, _=Depends(get_admin)):
    conn = get_connection()
    conn.execute("UPDATE payments SET status = 'rejected' WHERE id = ?", (payment_id,))
    conn.commit()
    conn.close()
    return {"message": "Payment rejected"}


# ── Startup ───────────────────────────────────────────────

@app.on_event("startup")
def startup():
    init_db()

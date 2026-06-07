from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Depends, Header, Body
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import hashlib, os
import jwt
import psycopg2
from datetime import datetime, timedelta, timezone
from models import get_connection, init_db, fetchone_dict, fetchall_dict
from email_utils import (send_welcome, send_payment_received, send_admin_new_payment,
                         send_payment_approved, send_payment_rejected,
                         send_expiry_warning, send_admin_expiry_alert, send_post_expiry_reminder)
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

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


def calc_expiry(approved_at_val, plan: str, expires_at_stored=None):
    if expires_at_stored:
        ea = datetime.fromisoformat(str(expires_at_stored).replace('Z', '+00:00')) \
            if isinstance(expires_at_stored, str) else expires_at_stored
        if ea.tzinfo is not None:
            ea = ea.replace(tzinfo=None)
        return ea.isoformat(), datetime.now() > ea
    if not approved_at_val:
        return None, False
    if isinstance(approved_at_val, str):
        approved_at = datetime.fromisoformat(approved_at_val)
    else:
        approved_at = approved_at_val
    if approved_at.tzinfo is not None:
        approved_at = approved_at.replace(tzinfo=None)
    expires_at = approved_at + timedelta(days=PLAN_DAYS.get(plan, 30))
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
    paypal_order_id: str = ""
    is_upgrade: bool = False

class ApproveRequest(BaseModel):
    expires_at: Optional[str] = None

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
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO users (name, phone, email, location, password) VALUES (%s, %s, %s, %s, %s)",
            (data.name, data.phone, data.email, data.location, hash_password(data.password))
        )
        conn.commit()
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")
    finally:
        cur.close()
        conn.close()
    send_welcome(data.email, data.name)
    return {"message": "Account created successfully"}


@app.post("/login")
def login(data: LoginRequest):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT * FROM users WHERE email = %s AND password = %s",
        (data.email, hash_password(data.password))
    )
    user = fetchone_dict(cur)
    cur.close()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token({"sub": str(user["id"])})
    return {"token": token, "name": user["name"]}


@app.post("/logout")
def logout(_: int = Depends(get_current_user)):
    return {"message": "Logged out"}


# ── Payment ───────────────────────────────────────────────

@app.post("/payment")
def submit_payment(data: PaymentRequest, user_id: int = Depends(get_current_user)):
    amounts = PLAN_AMOUNTS_USD if data.currency == "USD" else PLAN_AMOUNTS_INR
    if data.plan not in amounts:
        raise HTTPException(status_code=400, detail="Invalid plan")
    amount = amounts[data.plan]
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT * FROM payments WHERE user_id = %s AND status IN ('pending', 'approved') ORDER BY created_at DESC LIMIT 1",
        (user_id,)
    )
    existing = fetchone_dict(cur)
    if existing:
        if existing["status"] == "pending":
            cur.close(); conn.close()
            detail = "You already have an upgrade request awaiting approval" \
                if existing.get("is_upgrade") else "You already have a payment awaiting approval"
            raise HTTPException(status_code=400, detail=detail)
        _, is_expired = calc_expiry(existing["approved_at"], existing["plan"], existing.get("expires_at"))
        if not is_expired:
            if not data.is_upgrade:
                cur.close(); conn.close()
                raise HTTPException(status_code=400, detail="You already have an active membership")

    is_paypal   = bool(data.paypal_order_id)
    status      = "approved" if is_paypal else "pending"
    approved_at = datetime.now().isoformat() if is_paypal else None
    stored_amount = 0 if data.is_upgrade else amount

    cur.execute(
        "INSERT INTO payments (user_id, plan, amount, transaction_id, currency, status, approved_at, is_upgrade) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
        (user_id, data.plan, stored_amount, data.paypal_order_id or data.transaction_id, data.currency, status, approved_at, data.is_upgrade)
    )
    conn.commit()

    cur.execute("SELECT name, email FROM users WHERE id = %s", (user_id,))
    user = fetchone_dict(cur)
    cur.close()
    conn.close()

    u_name, u_email = user["name"], user["email"]
    amt_str = str(amount)

    if is_paypal:
        expires_at, _ = calc_expiry(approved_at, data.plan)
        exp_str = None
        if expires_at:
            exp_str = datetime.fromisoformat(expires_at).strftime("%d %b %Y")
        send_payment_approved(u_email, u_name, data.plan, amt_str, data.currency, exp_str)
    elif data.is_upgrade:
        send_admin_new_payment(ADMIN_EMAIL, u_name, u_email, data.plan, "Custom (Upgrade)", data.currency, data.transaction_id)
    else:
        send_payment_received(u_email, u_name, data.plan, amt_str, data.currency)
        send_admin_new_payment(ADMIN_EMAIL, u_name, u_email, data.plan, amt_str, data.currency, data.transaction_id)

    if is_paypal:
        msg = "Payment successful. Your membership is now active!"
    elif data.is_upgrade:
        msg = "Upgrade request submitted. Admin will verify and activate your new plan."
    else:
        msg = "Payment submitted. Awaiting approval."
    return {"message": msg, "auto_approved": is_paypal}


@app.get("/dashboard")
def get_dashboard(user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT name, email, phone, location FROM users WHERE id = %s", (user_id,))
    user = fetchone_dict(cur)
    if not user:
        cur.close(); conn.close()
        raise HTTPException(status_code=404, detail="User not found")

    cur.execute(
        "SELECT * FROM payments WHERE user_id = %s ORDER BY created_at DESC LIMIT 5",
        (user_id,)
    )
    all_payments = fetchall_dict(cur)

    # Separate the active/latest payment from any pending upgrade request
    payment = None
    pending_upgrade_row = None
    for p in all_payments:
        if p.get("is_upgrade") and p["status"] == "pending" and pending_upgrade_row is None:
            pending_upgrade_row = p
        elif payment is None:
            payment = p

    result = {
        "name": user["name"], "email": user["email"],
        "phone": user["phone"], "location": user["location"],
        "payment": None,
        "pending_upgrade": None,
    }

    if payment:
        meet_6am = meet_8am = meet_11am = ""
        expires_at, is_expired = calc_expiry(payment.get("approved_at"), payment.get("plan", ""), payment.get("expires_at"))
        is_1to1 = payment.get("plan", "").startswith("1to1")
        if payment["status"] == "approved" and not is_expired and not is_1to1:
            cur.execute("SELECT key, value FROM settings WHERE key IN ('meet_6am','meet_8am','meet_11am')")
            links = {r[0]: r[1] for r in cur.fetchall()}
            meet_6am  = links.get("meet_6am", "")
            meet_8am  = links.get("meet_8am", "")
            meet_11am = links.get("meet_11am", "")
        result["payment"] = {
            "plan":             payment["plan"],
            "amount":           payment["amount"],
            "currency":         payment.get("currency") or "INR",
            "status":           payment["status"],
            "expires_at":       expires_at,
            "is_expired":       is_expired,
            "is_1to1":          is_1to1,
            "is_upgrade":       bool(payment.get("is_upgrade")),
            "client_meet_link": payment.get("client_meet_link") or "",
            "meet_6am":         meet_6am,
            "meet_8am":         meet_8am,
            "meet_11am":        meet_11am,
        }

    if pending_upgrade_row:
        result["pending_upgrade"] = {
            "plan": pending_upgrade_row["plan"],
        }

    cur.close()
    conn.close()
    return result


# ── Schedule (Client) ────────────────────────────────────

@app.get("/schedule")
def get_my_schedules(user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM schedules WHERE user_id = %s ORDER BY created_at DESC", (user_id,))
    rows = fetchall_dict(cur)
    cur.close()
    conn.close()
    return rows


@app.post("/schedule/propose")
def propose_schedule(data: ScheduleProposeRequest, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT * FROM payments WHERE user_id = %s AND status = 'approved' AND plan LIKE '1to1_%%' ORDER BY created_at DESC LIMIT 1",
        (user_id,)
    )
    payment = fetchone_dict(cur)
    if not payment:
        cur.close(); conn.close()
        raise HTTPException(status_code=400, detail="You do not have an active One-to-One membership")
    cur.execute(
        "INSERT INTO schedules (payment_id, user_id, proposed_by, proposed_time, notes) VALUES (%s, %s, 'client', %s, %s)",
        (payment["id"], user_id, data.proposed_time, data.notes)
    )
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Session time proposed. Awaiting admin confirmation."}


@app.post("/schedule/accept/{schedule_id}")
def accept_schedule(schedule_id: int, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM schedules WHERE id = %s AND user_id = %s", (schedule_id, user_id))
    s = fetchone_dict(cur)
    if not s or s["proposed_by"] != "admin":
        cur.close(); conn.close()
        raise HTTPException(status_code=404, detail="Schedule not found")
    cur.execute("UPDATE schedules SET status = 'confirmed' WHERE id = %s", (schedule_id,))
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Session confirmed"}


@app.post("/schedule/reject/{schedule_id}")
def reject_schedule(schedule_id: int, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM schedules WHERE id = %s AND user_id = %s", (schedule_id, user_id))
    s = fetchone_dict(cur)
    if not s or s["proposed_by"] != "admin":
        cur.close(); conn.close()
        raise HTTPException(status_code=404, detail="Schedule not found")
    cur.execute("UPDATE schedules SET status = 'rejected' WHERE id = %s", (schedule_id,))
    conn.commit()
    cur.close()
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
    cur = conn.cursor()
    cur.execute("""
        SELECT * FROM (
            SELECT DISTINCT ON (u.id)
                u.id, u.name, u.email, u.phone, u.location, u.created_at,
                p.id as payment_id, p.plan, p.amount, p.transaction_id, p.currency,
                p.status, p.created_at as paid_at, p.approved_at, p.client_meet_link,
                p.is_upgrade, p.expires_at as stored_expires_at
            FROM users u
            LEFT JOIN payments p ON p.user_id = u.id
            ORDER BY u.id, p.created_at DESC NULLS LAST
        ) sub
        ORDER BY paid_at DESC NULLS LAST
    """)
    rows = fetchall_dict(cur)
    cur.close()
    conn.close()
    result = []
    for row in rows:
        expires_at, is_expired = calc_expiry(row.get("approved_at"), row.get("plan") or "", row.get("stored_expires_at"))
        row["expires_at"] = expires_at
        row["is_expired"] = is_expired
        result.append(row)
    return result


@app.post("/admin/client-meet-link/{payment_id}")
def set_client_meet_link(payment_id: int, data: ClientMeetLinkRequest, _=Depends(get_admin)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE payments SET client_meet_link = %s WHERE id = %s", (data.link, payment_id))
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Client meet link saved"}


@app.get("/admin/schedules")
def get_all_schedules(_=Depends(get_admin)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT s.*, u.name, u.email
        FROM schedules s
        JOIN users u ON u.id = s.user_id
        ORDER BY s.created_at DESC
    """)
    rows = fetchall_dict(cur)
    cur.close()
    conn.close()
    return rows


@app.post("/admin/schedule/approve/{schedule_id}")
def admin_approve_schedule(schedule_id: int, _=Depends(get_admin)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE schedules SET status = 'confirmed' WHERE id = %s", (schedule_id,))
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Schedule confirmed"}


@app.post("/admin/schedule/decline/{schedule_id}")
def admin_decline_schedule(schedule_id: int, _=Depends(get_admin)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE schedules SET status = 'declined' WHERE id = %s", (schedule_id,))
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Schedule declined"}


@app.post("/admin/schedule/propose")
def admin_propose_schedule(data: AdminScheduleProposeRequest, _=Depends(get_admin)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO schedules (payment_id, user_id, proposed_by, proposed_time, notes) VALUES (%s, %s, 'admin', %s, %s)",
        (data.payment_id, data.user_id, data.proposed_time, data.notes)
    )
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Time proposed to client"}


@app.get("/admin/meet-links")
def get_meet_links(_=Depends(get_admin)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT key, value FROM settings WHERE key IN ('meet_6am','meet_8am','meet_11am')")
    result = {r[0]: r[1] for r in cur.fetchall()}
    cur.close()
    conn.close()
    return result


@app.post("/admin/meet-links")
def save_meet_links(data: MeetLinksRequest, _=Depends(get_admin)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE settings SET value = %s WHERE key = 'meet_6am'",  (data.meet_6am,))
    cur.execute("UPDATE settings SET value = %s WHERE key = 'meet_8am'",  (data.meet_8am,))
    cur.execute("UPDATE settings SET value = %s WHERE key = 'meet_11am'", (data.meet_11am,))
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Meet links saved"}


@app.post("/admin/approve/{payment_id}")
def approve_payment(payment_id: int, data: ApproveRequest = Body(default=ApproveRequest()), _=Depends(get_admin)):
    conn = get_connection()
    cur = conn.cursor()
    if data and data.expires_at:
        cur.execute(
            "UPDATE payments SET status = 'approved', approved_at = NOW(), expires_at = %s WHERE id = %s",
            (data.expires_at, payment_id)
        )
    else:
        cur.execute(
            "UPDATE payments SET status = 'approved', approved_at = NOW() WHERE id = %s",
            (payment_id,)
        )
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Payment approved"}


@app.post("/admin/reject/{payment_id}")
def reject_payment(payment_id: int, _=Depends(get_admin)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE payments SET status = 'rejected' WHERE id = %s", (payment_id,))
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Payment rejected"}


# ── Expiry reminder job ───────────────────────────────────

def check_expiry_reminders():
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("""
            SELECT DISTINCT ON (p.user_id)
                p.*, u.name AS user_name, u.email AS user_email
            FROM payments p
            JOIN users u ON u.id = p.user_id
            WHERE p.status = 'approved'
            ORDER BY p.user_id, p.created_at DESC
        """)
        payments = fetchall_dict(cur)
    finally:
        cur.close()
        conn.close()

    today = datetime.now().date()
    for p in payments:
        expires_at, _ = calc_expiry(p.get("approved_at"), p.get("plan", ""), p.get("expires_at"))
        if not expires_at:
            continue
        expiry_date = datetime.fromisoformat(expires_at.split('T')[0]).date()
        days_left   = (expiry_date - today).days
        name        = p["user_name"]
        email       = p["user_email"]
        plan        = p["plan"]

        if days_left == 7:
            send_expiry_warning(email, name, plan, expires_at, days=7)
        elif days_left == 1:
            send_expiry_warning(email, name, plan, expires_at, days=1)
            send_admin_expiry_alert(ADMIN_EMAIL, name, email, plan, expires_at)
        elif days_left == -3:
            send_post_expiry_reminder(email, name, plan)


# ── Startup ───────────────────────────────────────────────

@app.on_event("startup")
def startup():
    init_db()
    scheduler = BackgroundScheduler(timezone="Asia/Kolkata")
    scheduler.add_job(check_expiry_reminders, CronTrigger(hour=8, minute=0))
    scheduler.start()

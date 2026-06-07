import os, smtplib, threading
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_EMAIL    = os.environ.get("SMTP_EMAIL", "")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")   # Gmail App Password
SITE_URL      = os.environ.get("FRONTEND_URL", "http://localhost:5173")

PLAN_LABELS = {
    "individual_1m": "Individual · 1 Month",   "individual_3m": "Individual · 3 Months",
    "individual_6m": "Individual · 6 Months",  "individual_12m": "Individual · 12 Months",
    "couple_1m":     "Couple · 1 Month",        "couple_3m":     "Couple · 3 Months",
    "couple_6m":     "Couple · 6 Months",       "couple_12m":    "Couple · 12 Months",
    "family_1m":     "Family · 1 Month",        "family_3m":     "Family · 3 Months",
    "family_6m":     "Family · 6 Months",       "family_12m":    "Family · 12 Months",
    "1to1_1m":       "One-to-One · 1 Month",    "1to1_3m":       "One-to-One · 3 Months",
    "1to1_6m":       "One-to-One · 6 Months",
}

# ── Base template ─────────────────────────────────────────
def _wrap(content: str) -> str:
    return f"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#065f46,#059669);padding:32px 40px;text-align:center;">
            <p style="margin:0;color:#a7f3d0;font-size:12px;letter-spacing:3px;text-transform:uppercase;font-weight:600;">Trupti Yoga & Nature Cure</p>
            <h1 style="margin:8px 0 0;color:#ffffff;font-size:24px;font-weight:700;">🧘 Dr. Vishwa Hiremath</h1>
            <p style="margin:6px 0 0;color:#d1fae5;font-size:13px;">Yoga · Naturopathy · Lifestyle Medicine</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            {content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0;color:#6b7280;font-size:12px;">Trupti Yoga & Nature Cure · Live sessions at 6 AM, 8 AM & 11 AM IST</p>
            <p style="margin:6px 0 0;color:#6b7280;font-size:12px;">
              WhatsApp: <a href="https://wa.me/918088943510" style="color:#059669;">+91 80889 43510</a> &nbsp;|&nbsp;
              <a href="{SITE_URL}" style="color:#059669;">Visit Website</a>
            </p>
            <p style="margin:8px 0 0;color:#9ca3af;font-size:11px;font-style:italic;">"One Breath. One Step. Slowly but Surely."</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
"""

def _btn(label: str, url: str) -> str:
    return f'<a href="{url}" style="display:inline-block;background:#059669;color:#ffffff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:50px;text-decoration:none;margin-top:8px;">{label}</a>'

def _info_row(label: str, value: str) -> str:
    return f'<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:140px;">{label}</td><td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;">{value}</td></tr>'

# ── Core sender ───────────────────────────────────────────
def _send(to: str, subject: str, html: str):
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        return
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = f"Trupti Yoga <{SMTP_EMAIL}>"
        msg["To"]      = to
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as s:
            s.login(SMTP_EMAIL, SMTP_PASSWORD)
            s.sendmail(SMTP_EMAIL, to, msg.as_string())
    except Exception as e:
        print(f"[Email] Failed to send to {to}: {e}")

def _async(to, subject, html):
    t = threading.Thread(target=_send, args=(to, subject, html), daemon=True)
    t.start()


# ── 1. Welcome email ─────────────────────────────────────
def send_welcome(to: str, name: str):
    html = _wrap(f"""
        <h2 style="margin:0 0 8px;color:#065f46;font-size:22px;">Welcome, {name}! 🙏</h2>
        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
            Your account on <strong>Trupti Yoga & Nature Cure</strong> has been created successfully.
            We're delighted to have you join our wellness community.
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px;">
            Dr. Vishwa Hiremath (BNYS) conducts <strong>three live therapeutic yoga sessions</strong> every day:
        </p>
        <table style="background:#f0fdf4;border-radius:12px;padding:16px 20px;margin:0 0 24px;width:100%;border-collapse:collapse;">
            <tr>
                <td style="padding:6px 12px;font-size:14px;color:#065f46;">🌅 <strong>6:00 AM IST</strong> — Early Morning Session</td>
            </tr>
            <tr>
                <td style="padding:6px 12px;font-size:14px;color:#065f46;">☀️ <strong>8:00 AM IST</strong> — Morning Session</td>
            </tr>
            <tr>
                <td style="padding:6px 12px;font-size:14px;color:#065f46;">🌿 <strong>11:00 AM IST</strong> — Late Morning Session</td>
            </tr>
        </table>
        <p style="color:#374151;font-size:15px;margin:0 0 28px;">
            To get started, choose a plan and complete your enrollment below.
        </p>
        <div style="text-align:center;">
            {_btn("Choose Your Plan →", f"{SITE_URL}/payment")}
        </div>
    """)
    _async(to, "Welcome to Trupti Yoga & Nature Cure 🙏", html)


# ── 2. Payment submitted (to client) ─────────────────────
def send_payment_received(to: str, name: str, plan: str, amount: str, currency: str):
    label = PLAN_LABELS.get(plan, plan)
    sym   = "$" if currency == "USD" else "₹"
    html  = _wrap(f"""
        <h2 style="margin:0 0 8px;color:#065f46;font-size:22px;">Payment Received ✅</h2>
        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
            Hi <strong>{name}</strong>, we have received your payment and it is currently under review.
            Dr. Vishwa's team will verify and activate your account within a few hours.
        </p>
        <table style="background:#f0fdf4;border-radius:12px;padding:16px 24px;margin:0 0 24px;width:100%;border-collapse:collapse;">
            {_info_row("Plan", label)}
            {_info_row("Amount", f"{sym}{amount}")}
            {_info_row("Status", "⏳ Pending Approval")}
        </table>
        <p style="color:#374151;font-size:14px;margin:0 0 28px;">
            You will receive another email as soon as your membership is activated.
            For any queries, reach us on WhatsApp.
        </p>
        <div style="text-align:center;">
            {_btn("View Dashboard", f"{SITE_URL}/dashboard")}
        </div>
    """)
    _async(to, "Payment Received — Under Review | Trupti Yoga", html)


# ── 3. New payment alert (to admin) ──────────────────────
def send_admin_new_payment(admin_email: str, user_name: str, user_email: str,
                           plan: str, amount: str, currency: str, txn_id: str):
    label = PLAN_LABELS.get(plan, plan)
    sym   = "$" if currency == "USD" else "₹"
    html  = _wrap(f"""
        <h2 style="margin:0 0 8px;color:#065f46;font-size:22px;">New Payment Submitted 💰</h2>
        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
            A new payment is waiting for your approval.
        </p>
        <table style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:16px 24px;margin:0 0 24px;width:100%;border-collapse:collapse;">
            {_info_row("Client", user_name)}
            {_info_row("Email", user_email)}
            {_info_row("Plan", label)}
            {_info_row("Amount", f"{sym}{amount}")}
            {_info_row("Transaction ID", txn_id or "—")}
        </table>
        <p style="color:#374151;font-size:14px;margin:0 0 28px;">
            Please verify the payment and approve or reject it from the admin panel.
        </p>
        <div style="text-align:center;">
            {_btn("Open Admin Panel →", f"{SITE_URL}/admin")}
        </div>
    """)
    _async(admin_email, f"💰 New Payment — {user_name} | Trupti Yoga", html)


# ── 4. Payment approved (to client) ──────────────────────
def send_payment_approved(to: str, name: str, plan: str, amount: str,
                          currency: str, expires_at: str = None):
    label   = PLAN_LABELS.get(plan, plan)
    sym     = "$" if currency == "USD" else "₹"
    exp_row = _info_row("Expires On", expires_at) if expires_at else ""
    html    = _wrap(f"""
        <h2 style="margin:0 0 8px;color:#065f46;font-size:22px;">Membership Activated! 🎉</h2>
        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
            Congratulations <strong>{name}</strong>! Your payment has been verified and your
            membership is now <strong style="color:#059669;">active</strong>.
            You can now join all live sessions on your dashboard.
        </p>
        <table style="background:#f0fdf4;border-radius:12px;padding:16px 24px;margin:0 0 24px;width:100%;border-collapse:collapse;">
            {_info_row("Plan", label)}
            {_info_row("Amount Paid", f"{sym}{amount}")}
            {_info_row("Status", "✅ Active")}
            {exp_row}
        </table>
        <table style="background:#f9fafb;border-radius:12px;padding:16px 20px;margin:0 0 24px;width:100%;border-collapse:collapse;">
            <tr><td style="padding:4px 12px;font-size:13px;color:#374151;">🌅 <strong>6:00 AM IST</strong> · 🌿 <strong>8:00 AM IST</strong> · ☀️ <strong>11:00 AM IST</strong></td></tr>
            <tr><td style="padding:4px 12px;font-size:13px;color:#6b7280;">Join any session from your dashboard. Link is available 5 minutes before start.</td></tr>
        </table>
        <div style="text-align:center;">
            {_btn("Go to Dashboard →", f"{SITE_URL}/dashboard")}
        </div>
    """)
    _async(to, "✅ Membership Activated — Welcome to Trupti Yoga!", html)


# ── 5. Payment rejected (to client) ──────────────────────

def send_payment_rejected(to: str, name: str):
    html = _wrap(f"""
        <h2 style="margin:0 0 8px;color:#991b1b;font-size:22px;">Payment Not Verified</h2>
        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
            Hi <strong>{name}</strong>, unfortunately we were unable to verify your recent payment.
            This can happen if the transaction ID was incorrect or the payment did not go through.
        </p>
        <table style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px 24px;margin:0 0 24px;width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#991b1b;font-size:14px;">Please try one of the following:</td></tr>
            <tr><td style="padding:4px 0;color:#374151;font-size:14px;">• Double-check the transaction ID in your UPI app and resubmit</td></tr>
            <tr><td style="padding:4px 0;color:#374151;font-size:14px;">• Contact us on WhatsApp with a screenshot of your payment</td></tr>
            <tr><td style="padding:4px 0;color:#374151;font-size:14px;">• Try making the payment again</td></tr>
        </table>
        <div style="text-align:center;margin-bottom:16px;">
            {_btn("💬 WhatsApp Us", "https://wa.me/918088943510")}
        </div>
        <div style="text-align:center;">
            {_btn("Try Again →", f"{SITE_URL}/payment")}
        </div>
    """)
    _async(to, "Payment Not Verified | Trupti Yoga", html)


def _fmt_date(iso: str) -> str:
    try:
        return datetime.fromisoformat(iso.split('T')[0]).strftime("%d %B %Y")
    except Exception:
        return iso


# ── 6. Expiry warning (to client) — 7 days or 1 day before ──

def send_expiry_warning(to: str, name: str, plan: str, expires_at: str, days: int):
    label    = PLAN_LABELS.get(plan, plan)
    exp_date = _fmt_date(expires_at)
    is_urgent = days == 1
    accent   = "#991b1b" if is_urgent else "#92400e"
    bg       = "#fef2f2" if is_urgent else "#fffbeb"
    border   = "#fecaca" if is_urgent else "#fde68a"
    icon     = "🚨" if is_urgent else "⚠️"
    subject  = f"{'Urgent: ' if is_urgent else ''}Your Membership Expires {'Tomorrow' if is_urgent else f'in {days} Days'} | Trupti Yoga"

    html = _wrap(f"""
        <h2 style="margin:0 0 8px;color:{accent};font-size:22px;">
            {icon} Membership Expiring {'Tomorrow' if is_urgent else f'in {days} Days'}
        </h2>
        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
            Dear <strong>{name}</strong>,
            {'<br>This is an urgent reminder —' if is_urgent else ''} your
            <strong>Trupti Yoga & Nature Cure</strong> membership is set to expire on
            <strong style="color:{accent};">{exp_date}</strong>.
            {'After this date, you will lose access to all live sessions.' if is_urgent else
             'Please renew soon to ensure uninterrupted access to your daily sessions.'}
        </p>
        <table style="background:{bg};border:1px solid {border};border-radius:12px;padding:16px 24px;margin:0 0 24px;width:100%;border-collapse:collapse;">
            {_info_row("Plan", label)}
            {_info_row("Expires On", exp_date)}
            {_info_row("Days Left", f"{'1 day — renew now!' if is_urgent else f'{days} days'}")}
        </table>
        <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 24px;">
            To renew, simply choose a new plan on the website and complete the payment.
            Your sessions will continue without any interruption.
        </p>
        <div style="text-align:center;margin-bottom:16px;">
            {_btn("Renew My Membership →", f"{SITE_URL}/payment")}
        </div>
        <div style="text-align:center;">
            <a href="https://wa.me/918088943510" style="color:#059669;font-size:13px;">
                Need help? Contact us on WhatsApp
            </a>
        </div>
    """)
    _async(to, subject, html)


# ── 7. Expiry alert to admin — 1 day before ──────────────

def send_admin_expiry_alert(admin_email: str, user_name: str, user_email: str,
                            plan: str, expires_at: str):
    label    = PLAN_LABELS.get(plan, plan)
    exp_date = _fmt_date(expires_at)
    html = _wrap(f"""
        <h2 style="margin:0 0 8px;color:#92400e;font-size:22px;">⚠️ Membership Expiring Tomorrow</h2>
        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
            A member's plan expires <strong>tomorrow ({exp_date})</strong>.
            They have been notified via email. No action is required unless they reach out to renew.
        </p>
        <table style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px 24px;margin:0 0 24px;width:100%;border-collapse:collapse;">
            {_info_row("Member", user_name)}
            {_info_row("Email", user_email)}
            {_info_row("Plan", label)}
            {_info_row("Expires On", exp_date)}
        </table>
        <div style="text-align:center;">
            {_btn("Open Admin Panel →", f"{SITE_URL}/admin")}
        </div>
    """)
    _async(admin_email, f"⚠️ Membership Expiring Tomorrow — {user_name} | Trupti Yoga", html)


# ── 8. Post-expiry recharge reminder (to client) — 3 days after ──

def send_post_expiry_reminder(to: str, name: str, plan: str):
    label = PLAN_LABELS.get(plan, plan)
    html = _wrap(f"""
        <h2 style="margin:0 0 8px;color:#065f46;font-size:22px;">We Miss You, {name}! 🙏</h2>
        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
            Your <strong>{label}</strong> membership with
            <strong>Trupti Yoga & Nature Cure</strong> has expired.
            It has been a few days since your last session — we hope you are well.
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
            Your wellness journey doesn't have to stop here. Dr. Vishwa Hiremath continues
            to conduct <strong>three live therapeutic yoga sessions every day</strong>
            and your spot is always open.
        </p>
        <table style="background:#f0fdf4;border-radius:12px;padding:16px 20px;margin:0 0 24px;width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 12px;font-size:14px;color:#065f46;">🌅 <strong>6:00 AM IST</strong> — Early Morning Session</td></tr>
            <tr><td style="padding:6px 12px;font-size:14px;color:#065f46;">☀️ <strong>8:00 AM IST</strong> — Morning Session</td></tr>
            <tr><td style="padding:6px 12px;font-size:14px;color:#065f46;">🌿 <strong>11:00 AM IST</strong> — Late Morning Session</td></tr>
        </table>
        <p style="color:#6b7280;font-size:14px;font-style:italic;margin:0 0 28px;text-align:center;">
            "One Breath. One Step. Slowly but Surely."
        </p>
        <div style="text-align:center;margin-bottom:16px;">
            {_btn("Reactivate My Membership →", f"{SITE_URL}/payment")}
        </div>
        <div style="text-align:center;">
            <a href="https://wa.me/918088943510" style="color:#059669;font-size:13px;">
                Questions? We're on WhatsApp
            </a>
        </div>
    """)
    _async(to, "Your Membership Has Expired — We'd Love to Have You Back | Trupti Yoga", html)

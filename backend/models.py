import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "enrollments.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT    NOT NULL,
            phone       TEXT    NOT NULL,
            email       TEXT    NOT NULL UNIQUE,
            location    TEXT    NOT NULL,
            password    TEXT    NOT NULL,
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS payments (
            id                INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id           INTEGER NOT NULL,
            plan              TEXT    NOT NULL,
            amount            INTEGER NOT NULL,
            transaction_id    TEXT    NOT NULL DEFAULT '',
            currency          TEXT    NOT NULL DEFAULT 'INR',
            client_meet_link  TEXT    DEFAULT '',
            status            TEXT    NOT NULL DEFAULT 'pending',
            created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
            approved_at       DATETIME,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            key   TEXT PRIMARY KEY,
            value TEXT NOT NULL DEFAULT ''
        )
    """)
    conn.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('meet_6am', '')")
    conn.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('meet_8am', '')")
    conn.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('meet_11am', '')")

    conn.execute("""
        CREATE TABLE IF NOT EXISTS schedules (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            payment_id     INTEGER NOT NULL,
            user_id        INTEGER NOT NULL,
            proposed_by    TEXT    NOT NULL,
            proposed_time  TEXT    NOT NULL,
            notes          TEXT    DEFAULT '',
            status         TEXT    NOT NULL DEFAULT 'pending',
            created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (payment_id) REFERENCES payments(id),
            FOREIGN KEY (user_id)    REFERENCES users(id)
        )
    """)

    # Migrate existing databases — add new columns if missing
    for col, definition in [
        ("currency",         "TEXT NOT NULL DEFAULT 'INR'"),
        ("client_meet_link", "TEXT DEFAULT ''"),
    ]:
        try:
            conn.execute(f"ALTER TABLE payments ADD COLUMN {col} {definition}")
        except sqlite3.OperationalError:
            pass

    conn.commit()
    conn.close()

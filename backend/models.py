import os
import psycopg2
import psycopg2.extras

DATABASE_URL = os.environ.get("DATABASE_URL", "")


def get_connection():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = False
    return conn


def dict_row(cursor, row):
    """Convert a row to a dict using cursor column names."""
    cols = [desc[0] for desc in cursor.description]
    return dict(zip(cols, row))


def fetchone_dict(cursor):
    row = cursor.fetchone()
    return dict_row(cursor, row) if row else None


def fetchall_dict(cursor):
    rows = cursor.fetchall()
    cols = [desc[0] for desc in cursor.description]
    return [dict(zip(cols, row)) for row in rows]


def init_db():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id          SERIAL PRIMARY KEY,
            name        TEXT    NOT NULL,
            phone       TEXT    NOT NULL,
            email       TEXT    NOT NULL UNIQUE,
            location    TEXT    NOT NULL,
            password    TEXT    NOT NULL,
            created_at  TIMESTAMPTZ DEFAULT NOW()
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS payments (
            id                SERIAL PRIMARY KEY,
            user_id           INTEGER NOT NULL REFERENCES users(id),
            plan              TEXT    NOT NULL,
            amount            INTEGER NOT NULL,
            transaction_id    TEXT    NOT NULL DEFAULT '',
            currency          TEXT    NOT NULL DEFAULT 'INR',
            client_meet_link  TEXT    DEFAULT '',
            status            TEXT    NOT NULL DEFAULT 'pending',
            created_at        TIMESTAMPTZ DEFAULT NOW(),
            approved_at       TIMESTAMPTZ
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            key   TEXT PRIMARY KEY,
            value TEXT NOT NULL DEFAULT ''
        )
    """)

    cur.execute("INSERT INTO settings (key, value) VALUES ('meet_6am',  '') ON CONFLICT (key) DO NOTHING")
    cur.execute("INSERT INTO settings (key, value) VALUES ('meet_8am',  '') ON CONFLICT (key) DO NOTHING")
    cur.execute("INSERT INTO settings (key, value) VALUES ('meet_11am', '') ON CONFLICT (key) DO NOTHING")

    cur.execute("""
        CREATE TABLE IF NOT EXISTS schedules (
            id             SERIAL PRIMARY KEY,
            payment_id     INTEGER NOT NULL REFERENCES payments(id),
            user_id        INTEGER NOT NULL REFERENCES users(id),
            proposed_by    TEXT    NOT NULL,
            proposed_time  TEXT    NOT NULL,
            notes          TEXT    DEFAULT '',
            status         TEXT    NOT NULL DEFAULT 'pending',
            created_at     TIMESTAMPTZ DEFAULT NOW()
        )
    """)

    conn.commit()
    cur.close()
    conn.close()

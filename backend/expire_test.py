import sqlite3

conn = sqlite3.connect('enrollments.db')
conn.execute("UPDATE payments SET approved_at = datetime('now', '-31 days') WHERE status='approved'")
conn.commit()
conn.close()
print("Done — subscription backdated 31 days. Refresh the dashboard.")

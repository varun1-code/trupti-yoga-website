import sqlite3

conn = sqlite3.connect('enrollments.db')
conn.execute("UPDATE payments SET approved_at = datetime('now') WHERE status='approved'")
conn.commit()
conn.close()
print("Reset — subscription is active again.")

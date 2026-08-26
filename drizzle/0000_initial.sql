CREATE TABLE IF NOT EXISTS booking_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  arrival TEXT NOT NULL,
  departure TEXT NOT NULL,
  adults INTEGER NOT NULL,
  children INTEGER NOT NULL DEFAULT 0,
  boat_rental INTEGER NOT NULL DEFAULT 0,
  pets INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'requested',
  quote_cents INTEGER,
  stripe_session_id TEXT,
  payment_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS date_blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT 'Owner blocked',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS booking_requests_dates_idx
  ON booking_requests (arrival, departure, status);

CREATE INDEX IF NOT EXISTS date_blocks_dates_idx
  ON date_blocks (start_date, end_date);

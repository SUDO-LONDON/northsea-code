-- SQLite schema for storing 1 hour of price history
CREATE TABLE IF NOT EXISTS csc_price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL,
  value REAL NOT NULL,
  recorded_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_csc_price_history_product_time ON csc_price_history (product_id, recorded_at);


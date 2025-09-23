import Database from 'better-sqlite3';
import fetch from 'node-fetch';

const db = new Database('./table-code/csc_price_history.sqlite');

// Ensure table exists
const schema = `
CREATE TABLE IF NOT EXISTS csc_price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL,
  value REAL NOT NULL,
  recorded_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_csc_price_history_product_time ON csc_price_history (product_id, recorded_at);
`;
db.exec(schema);

const PRODUCT_IDS = [
  "e9e305ee-8605-4503-b3e2-8f5763870cd2",
  "99d27f4d-0a7e-44fe-b9de-9c27d27f08d2",
  "b0738070-229c-4aa7-b5d0-45b4119dd0e0",
  "662e5a2f-f028-4d18-81dc-89be3ba01f3a",
  "6ccbf93e-d43d-46ab-ba50-c26659add883",
  "e506264b-1bcd-429f-b018-f50e3f517133",
  "29d3a405-cb03-45b4-9ebf-f0176b7ba06a"
];

async function fetchLatestFolioPrices() {
  const res = await fetch('http://localhost:3000/api/folio-prices'); // Adjust to your actual API endpoint
  if (!res.ok) throw new Error('Failed to fetch folio prices');
  const data = await res.json();
  return data;
}

async function insertAndPrune() {
  const prices = await fetchLatestFolioPrices();
  const now = new Date().toISOString();
  const insert = db.prepare('INSERT INTO csc_price_history (product_id, value, recorded_at) VALUES (?, ?, ?)');
  for (const id of PRODUCT_IDS) {
    if (prices[id] !== undefined) {
      insert.run(id, prices[id], now);
    }
  }
  // Delete entries older than 1 hour
  const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  db.prepare('DELETE FROM csc_price_history WHERE recorded_at < ?').run(cutoff);
  console.log('Inserted new prices and pruned old data.');
}

insertAndPrune().catch(console.error);


moimport { NextResponse } from 'next/server';

// In-memory history: [{ timestamp: string, prices: { [product_id]: number } }]
let priceHistory: { timestamp: string; prices: Record<string, number> }[] = [];

// List of product IDs to track
const PRODUCT_IDS = [
  "e9e305ee-8605-4503-b3e2-8f5763870cd2",
  "99d27f4d-0a7e-44fe-b9de-9c27d27f08d2",
  "b0738070-229c-4aa7-b5d0-45b4119dd0e0",
  "662e5a2f-f028-4d18-81dc-89be3ba01f3a",
  "6ccbf93e-d43d-46ab-ba50-c26659add883",
  "e506264b-1bcd-429f-b018-f50e3f517133",
  "29d3a405-cb03-45b4-9ebf-f0176b7ba06a"
];

// Helper to fetch latest prices from folio API
async function fetchLatestFolioPrices(): Promise<Record<string, number>> {
  const res = await fetch("/api/folio-prices");
  if (!res.ok) throw new Error("Failed to fetch folio prices");
  const data = await res.json();
  // Only keep tracked product IDs
  const filtered: Record<string, number> = {};
  PRODUCT_IDS.forEach(id => {
    if (data[id] !== undefined) filtered[id] = data[id];
  });
  return filtered;
}

export async function GET() {
  try {
    const prices = await fetchLatestFolioPrices();
    const now = new Date().toISOString();
    priceHistory.push({ timestamp: now, prices });
    // Keep only last 1 hour of data
    const cutoff = Date.now() - 60 * 60 * 1000;
    priceHistory = priceHistory.filter(entry => new Date(entry.timestamp).getTime() >= cutoff);
    return NextResponse.json(priceHistory);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}


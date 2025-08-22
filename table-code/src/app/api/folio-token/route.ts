import { NextRequest, NextResponse } from 'next/server';

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

const FOLIO_CLIENT_ID = process.env.FOLIO_CLIENT_ID || 'iNuJKp1LRk3VBzeaDucHgGSZzGvSoQ8q';
const FOLIO_CLIENT_SECRET = process.env.FOLIO_CLIENT_SECRET || 'Zy-Ip_GgAT1japzy-Fpwv80hNo9Y4WUGLugYI3V6ZtqcH_2kCznQrM7aWVGSgrFm';
const FOLIO_TOKEN_URL = 'https://api.folio.com/oauth2/token'; // Replace with actual Folio token endpoint

async function fetchFolioToken() {
  const res = await fetch(FOLIO_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: FOLIO_CLIENT_ID,
      client_secret: FOLIO_CLIENT_SECRET,
    }),
  });
  if (!res.ok) throw new Error('Failed to fetch Folio token');
  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in ? data.expires_in * 1000 : 3600000); // fallback 1h
}

// Refresh token every 6 minutes
setInterval(async () => {
  try {
    await fetchFolioToken();
  } catch (e) {
    // Optionally log error
  }
}, 360000);

export async function GET(req: NextRequest) {
  if (!cachedToken || !tokenExpiry || Date.now() > tokenExpiry - 60000) {
    try {
      await fetchFolioToken();
    } catch (e) {
      return NextResponse.json({ error: 'Failed to fetch token' }, { status: 500 });
    }
  }
  return NextResponse.json({ token: cachedToken });
}


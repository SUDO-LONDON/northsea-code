let token: string | null = null;
let tokenExpiry: number | null = null;

const TOKEN_URL = 'https://folio-api.artis.works/oauth/token';
const CLIENT_ID = 'iNuJKp1LRk3VBzeaDucHgGSZzGvSoQ8q';
const CLIENT_SECRET = 'Zy-Ip_GgAT1japzy-Fpwv80hNo9Y4WUGLugYI3V6ZtqcH_2kCznQrM7aWVGSgrFm';
const AUDIENCE = 'folio-api';
const GRANT_TYPE = 'client_credentials';
const REFRESH_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in ms

async function fetchToken(): Promise<string> {
  const params = new URLSearchParams();
  params.append('audience', AUDIENCE);
  params.append('grant_type', GRANT_TYPE);
  params.append('client_id', CLIENT_ID);
  params.append('client_secret', CLIENT_SECRET);

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch token: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  token = data.access_token;
  tokenExpiry = Date.now() + ((data.expires_in ? data.expires_in : 86400) * 1000);
  return token as string;
}

async function getToken(): Promise<string> {
  if (!token || !tokenExpiry || Date.now() > tokenExpiry) {
    return fetchToken();
  }
  return token;
}

// Refresh token every 24h
setInterval(() => {
  fetchToken().catch(() => {/* ignore errors, will retry on next getToken */});
}, REFRESH_INTERVAL);

// Fetch token immediately on startup
fetchToken().catch(() => {/* ignore errors, will retry on next getToken */});

export { getToken };

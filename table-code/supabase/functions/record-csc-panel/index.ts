// Supabase Edge Function: record-csc-panel
// This function fetches folio API data and stores it in csc_panel_history every 15 minutes, keeping only the last 24 hours of data.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const FOLIO_TOKEN_URL = 'https://folio-api.artis.works/oauth/token';
const FOLIO_PRICES_URL = 'https://folio-api.artis.works/prices/v2/liveprices';

const CLIENT_ID = Deno.env.get('FOLIO_CLIENT_ID');
const CLIENT_SECRET = Deno.env.get('FOLIO_CLIENT_SECRET');
const AUDIENCE = 'folio-api';
const GRANT_TYPE = 'client_credentials';

async function fetchToken() {
  const params = new URLSearchParams();
  params.append('audience', AUDIENCE);
  params.append('grant_type', GRANT_TYPE);
  params.append('client_id', CLIENT_ID!);
  params.append('client_secret', CLIENT_SECRET!);

  const res = await fetch(FOLIO_TOKEN_URL, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  if (!res.ok) throw new Error('Failed to fetch token');
  const data = await res.json();
  return data.access_token;
}

async function fetchFolioData(token: string) {
  const res = await fetch(FOLIO_PRICES_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch folio data');
  return await res.json();
}

serve(async () => {
  try {
    const token = await fetchToken();
    const folioData = await fetchFolioData(token);
    // Store the entire payload and generated_at timestamp for full fidelity
    const generatedAt = folioData.generated_at || new Date().toISOString();
    const payload = folioData.payload || {};

    // Insert into csc_panel_history
    const insertRes = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/csc_panel_history`, {
      method: 'POST',
      headers: {
        'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ value: payload, recorded_at: generatedAt }),
    });
    if (!insertRes.ok) throw new Error('Failed to insert into csc_panel_history');

    // Delete records older than 24 hours
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/csc_panel_history?recorded_at=lt.${cutoff}`, {
      method: 'DELETE',
      headers: {
        'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
    });

    return new Response('Success', { status: 200 });
  } catch (e) {
    return new Response(`Error: ${e}`, { status: 500 });
  }
});

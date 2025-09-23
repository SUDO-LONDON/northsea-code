// Supabase Edge Function: record-csc-panel
// Fetches folio API data and stores it in csc_panel_history every 15 minutes, keeping only the last 24 hours of data.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

let FOLIO_TOKEN_URL = (Deno.env.get('FOLIO_TOKEN_URL') ?? 'https://folio-api.artis.works/oauth/token').replace(/^"+|"+$/g, '');
const FOLIO_PRICES_URL = 'https://folio-api.artis.works/prices/v2/liveprices';
const CLIENT_ID = (Deno.env.get('FOLIO_CLIENT_ID') ?? '').replace(/^"+|"+$/g, '');
const CLIENT_SECRET = (Deno.env.get('FOLIO_CLIENT_SECRET') ?? '').replace(/^"+|"+$/g, '');
const AUDIENCE = 'folio-api';
const GRANT_TYPE = 'client_credentials';

async function fetchToken() {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error('Missing CLIENT_ID or CLIENT_SECRET — check Supabase secrets.');
    }

    const params = new URLSearchParams();
    params.append('audience', AUDIENCE);
    params.append('grant_type', GRANT_TYPE);
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);

    const res = await fetch(FOLIO_TOKEN_URL, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
    });

    const text = await res.text();
    if (!res.ok) {
        console.error('Token fetch failed:', res.status, text);
        throw new Error(`Failed to fetch token: ${res.status} ${text}`);
    }

    const data = JSON.parse(text);
    // Decode token and log claims
    try {
        const [, payload] = data.access_token.split('.');
        const decoded = JSON.parse(atob(payload));
        console.log("Decoded JWT claims:", decoded);
    } catch (e) {
        console.error("Failed to decode token:", e);
    }

    return data.access_token;
}

async function fetchFolioData(token: string) {
    const res = await fetch(FOLIO_PRICES_URL, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const text = await res.text();
    if (!res.ok) {
        console.error('Folio API returned error:', res.status, text);
        throw new Error(`Failed to fetch folio data: ${res.status} ${text}`);
    }

    try {
        return JSON.parse(text);
    } catch (e) {
        throw new Error(`Failed to parse folio data: ${e}`);
    }
}

serve(async () => {
    try {
        console.log('CLIENT_ID present:', !!CLIENT_ID);
        console.log('CLIENT_SECRET present:', !!CLIENT_SECRET);
        console.log('SUPABASE_URL:', Deno.env.get('SUPABASE_URL'));
        console.log('SUPABASE_SERVICE_ROLE_KEY present:', !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));

        const token = await fetchToken();
        const folioData = await fetchFolioData(token);

        const generatedAt = folioData.generated_at || new Date().toISOString();
        const payload = folioData.payload || {};

        // Insert into csc_panel_history
        const insertBody = {
            value: payload,
            recorded_at: generatedAt
        };
        console.log('Insert body:', JSON.stringify(insertBody));
        const insertRes = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/csc_panel_history`, {
            method: 'POST',
            headers: {
                'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(insertBody)
        });

        const insertText = await insertRes.text();
        console.log('Insert response status:', insertRes.status);
        console.log('Insert response body:', insertText);
        if (!insertRes.ok) {
            throw new Error(`Failed to insert into csc_panel_history: ${insertRes.status} ${insertText}`);
        }

        // Delete records older than 24 hours
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const deleteRes = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/csc_panel_history?recorded_at=lt.${cutoff}`, {
            method: 'DELETE',
            headers: {
                'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
            }
        });
        const deleteText = await deleteRes.text();
        console.log('Delete response status:', deleteRes.status);
        console.log('Delete response body:', deleteText);

        return new Response('Success', { status: 200 });

    } catch (e) {
        console.error('Edge Function error:', e);
        return new Response(`Error: ${e instanceof Error ? e.message : e}`);
    }
});

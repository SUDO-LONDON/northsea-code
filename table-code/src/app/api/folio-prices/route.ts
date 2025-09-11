import { NextResponse } from 'next/server';

const FOLIO_TOKEN_URL = 'https://folio-api.artis.works/oauth/token';
const FOLIO_PRICES_URL = 'https://folio-api.artis.works/prices/v2/liveprices';

const IDS = [
    'd71f82b9-21e2-49f0-9974-4a11a9e5b09f',
    '29d3a405-cb03-45b4-9ebf-f0176b7ba06a',
    '99d27f4d-0a7e-44fe-b9de-9c27d27f08d2',
    '662e5a2f-f028-4d18-81dc-89be3ba01f3a',
    'b0738070-229c-4aa7-b5d0-45b4119dd0e0',
    'e9e305ee-8605-4503-b3e2-8f5763870cd2',
    'e506264b-1bcd-429f-b018-f50e3f517133',
    '9c68de75-aed7-417b-abab-eaf576d0d6fe',
    '6ccbf93e-d43d-46ab-ba50-c26659add883',
];

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

const FOLIO_CLIENT_ID = process.env.FOLIO_CLIENT_ID!;
const FOLIO_CLIENT_SECRET = process.env.FOLIO_CLIENT_SECRET!;

interface TokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

interface PayloadEntry {
    data?: Record<string, { value?: number }>;
}

interface FolioApiResponse {
    payload?: Record<string, PayloadEntry>;
}

// Fetch a fresh token if needed
async function getFolioToken(): Promise<string> {
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 60000) {
        return cachedToken; // return cached if still valid
    }

    const res = await fetch(FOLIO_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            audience: 'folio-api',
            client_id: FOLIO_CLIENT_ID,
            client_secret: FOLIO_CLIENT_SECRET,
        }).toString(),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch token: ${res.status} ${text}`);
    }

    const data: TokenResponse = await res.json();

    if (!data.access_token) {
        throw new Error('No access_token returned from Folio API');
    }

    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in ? data.expires_in * 1000 : 3600000);

    return cachedToken;
}

// POST handler: fetch prices
export async function POST() {
    try {
        const token = await getFolioToken();

        const res = await fetch(FOLIO_PRICES_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(IDS),
        });

        if (!res.ok) {
            const errorText = await res.text();
            return NextResponse.json({ error: errorText }, { status: res.status });
        }

        const data: FolioApiResponse = await res.json();

        // Log the full payload for debugging
        console.log('Folio API payload:', JSON.stringify(data.payload, null, 2));

        // Dynamically pick the first available Q key for each ID
        const prices = Object.entries(data.payload || {}).map(([id, entry]) => {
            let value = 0;

            if (entry?.data) {
                const keys = Object.keys(entry.data);
                if (keys.length > 0) {
                    const firstKey = keys[0];
                    value = entry.data[firstKey]?.value ?? 0;
                }
            }

            return { id, value };
        });


        return NextResponse.json(prices);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// GET handler: redirect to POST for convenience
export async function GET() {
    return POST();
}

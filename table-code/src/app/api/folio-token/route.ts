import { NextResponse } from 'next/server';

const FOLIO_TOKEN_URL = 'https://folio-api.artis.works/oauth/token';

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

const FOLIO_CLIENT_ID = "iNuJKp1LRk3VBzeaDucHgGSZzGvSoQ8q";
const FOLIO_CLIENT_SECRET = "Ip_GgAT1japzy-Fpwv80hNo9Y4WUGLugYI3V6ZtqcH_2kCznQrM7aWVGSgrFm";

interface TokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

async function fetchFolioToken(): Promise<string> {
    // Return cached if still valid
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 60000) {
        return cachedToken;
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

export async function GET() {
    try {
        const token = await fetchFolioToken();
        return NextResponse.json({ token, expires: tokenExpiry });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

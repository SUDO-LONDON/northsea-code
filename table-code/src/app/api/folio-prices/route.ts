import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getToken } from '@/lib/folioToken';
import { supabase } from '@/lib/supabaseClient';

// Server-only client for the RLS-protected snapshots table; falls back to the
// anon client if the service role key is not configured.
const serviceSupabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : supabase;

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

// Number of snapshot points returned for each product's sparkline
const SPARKLINE_POINTS = 50;
// Clients poll every 5s; only persist a snapshot once per minute
const SNAPSHOT_MIN_INTERVAL_MS = 60 * 1000;

interface PayloadEntry {
    data?: Record<string, { value?: number }>;
}

interface FolioApiResponse {
    payload?: Record<string, PayloadEntry>;
}

// POST handler: fetch prices
export async function POST() {
    try {
        const token = await getToken();

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

        const payload = data.payload || {};

        // One entry per tracked ID; value is null when the upstream payload omits the product
        const prices: { id: string; value: number | null }[] = IDS.map((id) => {
            const entry = payload[id];
            let value: number | null = null;

            if (entry?.data) {
                const keys = Object.keys(entry.data);
                if (keys.length > 0) {
                    const firstKey = keys[0];
                    value = entry.data[firstKey]?.value ?? null;
                }
            }

            return { id, value };
        });

        const missingIds = prices.filter((p) => p.value === null).map((p) => p.id);
        if (missingIds.length > 0) {
            console.warn('Folio API payload missing values for product IDs:', missingIds);
        }

        const pricedEntries = prices.filter(
            (p): p is { id: string; value: number } => typeof p.value === 'number'
        );

        // Insert price snapshots for historical tracking (throttled — clients poll every 5s)
        if (pricedEntries.length > 0) {
            const { data: lastSnap, error: lastSnapError } = await serviceSupabase
                .from('product_price_snapshots')
                .select('recorded_at')
                .order('recorded_at', { ascending: false })
                .limit(1);
            if (lastSnapError) {
                console.error('Error fetching last snapshot time:', lastSnapError);
            }
            const lastSnapAt = lastSnap?.[0]?.recorded_at
                ? new Date(lastSnap[0].recorded_at).getTime()
                : 0;

            if (Date.now() - lastSnapAt >= SNAPSHOT_MIN_INTERVAL_MS) {
                const now = new Date().toISOString();
                const snapshotRows = pricedEntries.map((p) => ({
                    product_id: p.id,
                    value: p.value,
                    recorded_at: now,
                }));
                const { error: snapshotError } = await serviceSupabase
                    .from('product_price_snapshots')
                    .insert(snapshotRows);
                if (snapshotError) {
                    console.error('Error inserting price snapshots:', snapshotError);
                }
            }
        }

        // Daily open (first snapshot today, UTC) and recent history per product
        const startOfDay = new Date();
        startOfDay.setUTCHours(0, 0, 0, 0);
        const startOfDayISO = startOfDay.toISOString();

        const [opens, histories] = await Promise.all([
            Promise.all(
                IDS.map(async (id) => {
                    const { data: rows, error } = await serviceSupabase
                        .from('product_price_snapshots')
                        .select('value')
                        .eq('product_id', id)
                        .gte('recorded_at', startOfDayISO)
                        .order('recorded_at', { ascending: true })
                        .limit(1);
                    if (error) {
                        console.error(`Error fetching daily open for ${id}:`, error);
                    }
                    return { id, open: rows?.[0]?.value ?? null };
                })
            ),
            Promise.all(
                IDS.map(async (id) => {
                    const { data: rows, error } = await serviceSupabase
                        .from('product_price_snapshots')
                        .select('value')
                        .eq('product_id', id)
                        .order('recorded_at', { ascending: false })
                        .limit(SPARKLINE_POINTS);
                    if (error) {
                        console.error(`Error fetching history for ${id}:`, error);
                    }
                    return { id, history: (rows ?? []).map((r) => r.value).reverse() };
                })
            ),
        ]);

        // Attach daily % change and snapshot history to each price
        const enriched = prices.map((p) => {
            const open = opens.find((o) => o.id === p.id)?.open ?? null;
            const history = histories.find((h) => h.id === p.id)?.history ?? [];
            const change =
                typeof p.value === 'number' && typeof open === 'number' && open !== 0
                    ? ((p.value - open) / open) * 100
                    : null;
            return { ...p, change, history };
        });

        // Persist latest price and daily change on the products table
        for (const priceObj of enriched) {
            if (typeof priceObj.value !== 'number') continue;
            const { error: updateError } = await supabase
                .from('products')
                .update({ hfo: priceObj.value, change: priceObj.change ?? 0 })
                .eq('id', priceObj.id);
            if (updateError) {
                console.error(`Error updating product ${priceObj.id}:`, updateError);
            }
        }

        return NextResponse.json(enriched);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// GET handler: redirect to POST for convenience test
export async function GET() {
    return POST();
}

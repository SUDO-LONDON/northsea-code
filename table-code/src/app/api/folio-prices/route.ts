import { NextResponse } from 'next/server';
import { getToken } from '@/lib/folioToken';
import { supabase } from '@/lib/supabaseClient';

const FOLIO_PRICES_URL = 'https://folio-api.artis.works/prices/v2/liveprices';

// Deprecated: Old product IDs array
// const IDS = [
//     'd71f82b9-21e2-49f0-9974-4a11a9e5b09f',
//     '29d3a405-cb03-45b4-9ebf-f0176b7ba06a',
//     '99d27f4d-0a7e-44fe-b9de-9c27d27f08d2',
//     '662e5a2f-f028-4d18-81dc-89be3ba01f3a',
//     'b0738070-229c-4aa7-b5d0-45b4119dd0e0',
//     'e9e305ee-8605-4503-b3e2-8f5763870cd2',
//     'e506264b-1bcd-429f-b018-f50e3f517133',
//     '9c68de75-aed7-417b-abab-eaf576d0d6fe',
//     '6ccbf93e-d43d-46ab-ba50-c26659add883',
// ];

// New product mapping: { id: name }
const PRODUCTS_MAP: Record<string, string> = {
    'd71f82b9-21e2-49f0-9974-4a11a9e5b09f': 'MO 0.1% BGS- Rotterdam 0.1%', // M0 0.1% BGS
    '9c68de75-aed7-417b-abab-eaf576d0d6fe': 'MO SG 10ppm FP-Singapore 10ppm', // M0 SG 10PPM FP
    // USGC 0.5% renamed to USGC M
    '4044847b-45b1-4e05-8fb9-deeb55321b2a': 'MO 0.5% GC FP- USGC 0.5%', // USGC M
    // USGC 3% renamed to USGC A
    'bce42590-21ba-4f5b-bd14-085b30330003': 'MO 3% GC FP-USGC 3%', // USGC A
    '662e5a2f-f028-4d18-81dc-89be3ba01f3a': 'MO 0.5% SG FP-Singapore 0.5%', // M0 0.5% SG FP
    '6ccbf93e-d43d-46ab-ba50-c26659add883': 'MO Sing 380 FP- Singapore Singapore CST 380', // M0 SING 380 FP
    'b0738070-229c-4aa7-b5d0-45b4119dd0e0': 'MO 0.1% FOB FP- NWE 0.1% FOB', // M0 1% FOB FP
    '29d3a405-cb03-45b4-9ebf-f0176b7ba06a': 'MO 0.5% BGS FP-Rotterdam 0.5%', // M0 0.5% BGS FP
    'e9e305ee-8605-4503-b3e2-8f5763870cd2': 'MO 3.5% BGS FP- Rotterdam 3.5%', // M0 3.5% BGS FP
};

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

        // Use new product IDs for request
        const productIds = Object.keys(PRODUCTS_MAP);
        const res = await fetch(FOLIO_PRICES_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productIds),
        });

        if (!res.ok) {
            const errorText = await res.text();
            return NextResponse.json({ error: errorText }, { status: res.status });
        }

        const data: FolioApiResponse = await res.json();

        // Log the full payload for debugging
        console.log('Folio API payload:', JSON.stringify(data.payload, null, 2));

        // Dynamically pick the first available Q key for each ID
        const prices: { id: string; name: string; value: number | null; status?: string }[] = Object.entries(data.payload || {}).map(([id, entry]) => {
            let value: number | null = 0;
            let status: string | undefined = undefined;
            if (entry?.data) {
                const keys = Object.keys(entry.data);
                if (keys.length > 0) {
                    const firstKey = keys[0];
                    const v = entry.data[firstKey]?.value;
                    if (typeof v === 'number') {
                        value = v;
                    } else if (typeof v === 'object' && v !== null && 'error' in v && typeof (v as any).error === 'object') {
                        value = null;
                        status = (v as any).error?.cause || 'unavailable';
                    }
                }
            }
            return { id, name: PRODUCTS_MAP[id] || id, value, status };
        });

        // Fetch previous prices from Supabase
        const { data: previousProducts, error: fetchError } = await supabase
            .from('products')
            .select('id, hfo')
            .in('id', prices.map(p => p.id));
        if (fetchError) {
            console.error('Error fetching previous prices:', fetchError);
        }

        // Calculate percentage change and update Supabase
        for (const priceObj of prices) {
            // previousProducts is typed as { id: string; hfo: number }[]
            const prev = previousProducts?.find(p => p.id === priceObj.id);
            const oldPrice = prev?.hfo ?? 0;
            const newPrice = priceObj.value ?? 0;
            const change = oldPrice !== 0 ? ((newPrice - oldPrice) / oldPrice) * 100 : 0;
            await supabase
                .from('products')
                .update({ hfo: newPrice, change })
                .eq('id', priceObj.id);
        }

        // Insert price snapshots for historical tracking
        const now = new Date().toISOString();
        const snapshotRows = prices.map((p) => ({
            product_id: p.id,
            value: p.value,
            recorded_at: now,
        }));
        const { error: snapshotError } = await supabase
            .from('product_price_snapshots')
            .insert(snapshotRows);
        if (snapshotError) {
            console.error('Error inserting price snapshots:', snapshotError);
        }

        // Diagnostics for USGC 3% and USGC 0.5%
        const usgc3Id = 'bce42590-21ba-4f5b-bd14-085b30330003';
        const usgc05Id = '4044847b-45b1-4e05-8fb9-deeb55321b2a';
        const usgc3Payload = data.payload?.[usgc3Id];
        const usgc05Payload = data.payload?.[usgc05Id];
        function hasError(val: unknown): val is { error: unknown } {
            return typeof val === 'object' && val !== null && 'error' in val;
        }
        if (!usgc3Payload || !usgc3Payload.data || Object.keys(usgc3Payload.data).length === 0) {
            console.warn('USGC 3% (MO 3% GC FP-USGC 3%) is missing or empty in payload:', usgc3Payload);
        } else {
            const firstKey = Object.keys(usgc3Payload.data)[0];
            const val = usgc3Payload.data[firstKey]?.value;
            if (hasError(val)) {
                console.warn('USGC 3% (MO 3% GC FP-USGC 3%) returned error:', val.error);
            }
        }
        if (!usgc05Payload || !usgc05Payload.data || Object.keys(usgc05Payload.data).length === 0) {
            console.warn('USGC 0.5% (MO 0.5% GC FP- USGC 0.5%) is missing or empty in payload:', usgc05Payload);
        } else {
            const firstKey = Object.keys(usgc05Payload.data)[0];
            const val = usgc05Payload.data[firstKey]?.value;
            if (hasError(val)) {
                console.warn('USGC 0.5% (MO 0.5% GC FP- USGC 0.5%) returned error:', val.error);
            }
        }

        return NextResponse.json(prices);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// GET handler: redirect to POST for convenience test
export async function GET() {
    return POST();
}

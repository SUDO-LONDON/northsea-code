import { NextResponse } from 'next/server';
import { getToken } from '@/lib/folioToken';
import { supabase } from '@/lib/supabaseClient';

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

        // Dynamically pick the first available Q key for each ID
        const prices: { id: string; value: number }[] = Object.entries(data.payload || {}).map(([id, entry]) => {
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
            const newPrice = priceObj.value;
            const change = oldPrice !== 0 ? ((newPrice - oldPrice) / oldPrice) * 100 : 0;
            await supabase
                .from('products')
                .update({ hfo: newPrice, change })
                .eq('id', priceObj.id);
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

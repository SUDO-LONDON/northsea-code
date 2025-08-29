import { NextResponse } from 'next/server';
import { getToken } from '@/lib/folioToken';

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

export async function POST() {
  try {
    const token = await getToken();
    const res = await fetch(FOLIO_PRICES_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(IDS),
    });
    if (!res.ok) {
      const error = await res.text();
      return NextResponse.json({ error }, { status: res.status });
    }
    const data = await res.json();
    // Extract prices from nested structure: data.payload[ID].data.Q25.value
    type Entry = { data?: { Q25?: { value?: number } } };
    let prices: { id: string; value: number }[] = [];
    if (data && typeof data === 'object' && data.payload && typeof data.payload === 'object') {
      prices = Object.entries(data.payload).map(([id, entry]) => {
        const e = entry as { data?: { Q25?: { value?: number } } };
        return {
          id,
          value: e?.data?.Q25?.value ?? 0,
        };
      });
    }
    return NextResponse.json(prices);
  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      message = (error as { message: string }).message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  // For convenience, allow GET to also fetch prices
  return POST();
}

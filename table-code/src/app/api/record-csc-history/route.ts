import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

interface FolioPrice {
  id: string;
  value: number;
  // ...other fields if needed
}

interface CSCPanelHistoryEntry {
  value: number;
  recorded_at: string;
}

export async function GET() {
  try {
    // Fetch FOLIO prices from the internal API
    const folioRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/folio-prices`);
    if (!folioRes.ok) {
      const errorText = await folioRes.text();
      console.error('Failed to fetch FOLIO prices:', folioRes.status, errorText);
      return NextResponse.json({ error: 'Failed to fetch FOLIO prices', status: folioRes.status, details: errorText }, { status: 500 });
    }
    const prices: FolioPrice[] = await folioRes.json();

    // Extract CSC value
    const cscEntry = prices.find((p: FolioPrice) => p.id === 'e9e305ee-8605-4503-b3e2-8f5763870cd2');
    if (!cscEntry || typeof cscEntry.value !== 'number') {
      return new Response('CSC value not found', { status: 404 });
    }

    const newRecord: CSCPanelHistoryEntry = {
      value: cscEntry.value,
      recorded_at: new Date().toISOString(),
    };

    // Get current history, add new record, and trim
    const history = (await kv.get<CSCPanelHistoryEntry[]>('csc_panel_history')) || [];
    history.push(newRecord);

    // Keep only the last 96 records (24 hours * 4 records per hour)
    while (history.length > 96) {
      history.shift();
    }

    await kv.set('csc_panel_history', history);

    return NextResponse.json({ success: true, message: 'CSC value recorded.' });
  } catch (error) {
    console.error('Error in record-csc-history:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

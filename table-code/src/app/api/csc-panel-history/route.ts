import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Only import and use server-side env vars, never expose service role key to client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Supabase environment variables are not set.');
}

const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
);

export async function GET() {
  // Fetch all history, order by recorded_at ascending, include product_id
  const { data, error } = await supabase
    .from('csc_panel_history')
    .select('product_id, value, recorded_at')
    .order('recorded_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// Supabase Edge Function: record-csc-panel
// Fetches CSC value from /api/folio-prices and stores it in csc_panel_history every 15 minutes
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend";

serve(async (req) => {
  // Fetch FOLIO prices from the internal API
  const folioRes = await fetch(`${Deno.env.get('INTERNAL_API_BASE') || 'http://localhost:3000'}/api/folio-prices`);
  if (!folioRes.ok) {
    return new Response('Failed to fetch FOLIO prices', { status: 500 });
  }
  const prices = await folioRes.json();

  // Extract CSC value (adjust key as needed)
  // Example: find the value for a specific product id or name
  const cscEntry = prices.find((p: any) => p.id === 'e9e305ee-8605-4503-b3e2-8f5763870cd2'); // Adjust as needed
  if (!cscEntry || typeof cscEntry.value !== 'number') {
    return new Response('CSC value not found', { status: 404 });
  }

  // Insert into Supabase
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Insert the new value
  const { error } = await supabase.from('csc_panel_history').insert({
    value: cscEntry.value,
    recorded_at: new Date().toISOString(),
  });
  if (error) {
    return new Response('Failed to insert CSC value', { status: 500 });
  }

  // Delete records older than 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  await supabase.from('csc_panel_history').delete().lt('recorded_at', twentyFourHoursAgo);

  return new Response('CSC value recorded', { status: 200 });
});

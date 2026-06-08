-- Creates the product_price_snapshots table used by /api/folio-prices for
-- sparkline history and daily % change. Run this in the Supabase SQL editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run).

create table if not exists public.product_price_snapshots (
    id bigint generated always as identity primary key,
    product_id uuid not null,
    value double precision not null,
    recorded_at timestamptz not null default now()
);

-- Queried by (product_id, recorded_at) for daily-open and recent-history lookups
create index if not exists product_price_snapshots_product_recorded_idx
    on public.product_price_snapshots (product_id, recorded_at desc);

create index if not exists product_price_snapshots_recorded_idx
    on public.product_price_snapshots (recorded_at desc);

-- Lock the table down: only the service role (used by the API route) may touch it.
alter table public.product_price_snapshots enable row level security;

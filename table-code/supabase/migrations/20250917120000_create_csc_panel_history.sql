-- Migration: Create csc_panel_history table for storing CSC panel values at 15-minute intervals
CREATE TABLE IF NOT EXISTS csc_panel_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    value float8 NOT NULL,
    recorded_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast retrieval by time
CREATE INDEX IF NOT EXISTS idx_csc_panel_history_recorded_at ON csc_panel_history(recorded_at DESC);

-- SentinelZone Database Schema

-- Custom Types (Enums)
CREATE TYPE public.incident_type AS ENUM ('IP', 'URL', 'Email');
CREATE TYPE public.incident_severity AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE public.incident_status AS ENUM ('Open', 'Triage', 'Resolved');
CREATE TYPE public.resolution_reason_type AS ENUM ('User', 'Distance');

-- Incidents Table
CREATE TABLE public.incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    type public.incident_type NOT NULL,
    indicator_value TEXT NOT NULL,
    severity public.incident_severity NOT NULL,
    status public.incident_status NOT NULL DEFAULT 'Open',
    context TEXT,
    is_distance_anomaly BOOLEAN DEFAULT false,
    resolution_reason public.resolution_reason_type,
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow ANYONE (including unauthenticated/anon) to INSERT new incidents (reporting)
CREATE POLICY "Allow public insert for incidents"
    ON public.incidents
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Policy 2: Allow ONLY authenticated users to SELECT (view) incidents
CREATE POLICY "Allow authenticated select for incidents"
    ON public.incidents
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy 3: Allow ONLY authenticated users to UPDATE incidents (resolving/triaging)
CREATE POLICY "Allow authenticated update for incidents"
    ON public.incidents
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Index for faster querying by status and severity (common SOC flows)
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON public.incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON public.incidents(created_at DESC);

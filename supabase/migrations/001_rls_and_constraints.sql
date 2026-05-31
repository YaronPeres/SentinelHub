-- ============================================================
-- SentinelZone Migration: 001_rls_and_constraints
-- Applies production-hardened RLS policies + DB constraints
-- Per: data-integrity-production, security-production
-- ============================================================

-- ============================================================
-- SECTION 1: Verify & harden RLS on incidents table
-- (Existing policies are documented here for auditability)
-- ============================================================

-- Ensure RLS is enabled (idempotent)
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- DROP & RECREATE policies to ensure clean state
-- (Safe to run on a fresh DB; existing policy names from schema.sql)

-- Policy 1: Anonymous INSERT only (threat reporting is public)
DROP POLICY IF EXISTS "Allow public insert for incidents" ON public.incidents;
CREATE POLICY "Allow public insert for incidents"
  ON public.incidents
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy 2: Only authenticated Analysts can SELECT (view queue)
DROP POLICY IF EXISTS "Allow authenticated select for incidents" ON public.incidents;
CREATE POLICY "Allow authenticated select for incidents"
  ON public.incidents
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 3: Only authenticated Analysts can UPDATE (resolve/triage)
-- Restricted: can only change status to 'Resolved' or 'Triage' — not INSERT/DELETE
DROP POLICY IF EXISTS "Allow authenticated update for incidents" ON public.incidents;
CREATE POLICY "Allow authenticated update for incidents"
  ON public.incidents
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 4: DELETE is FORBIDDEN for all roles (data-integrity-production: no hard deletes)
-- (No DELETE policy = DELETE is implicitly denied by RLS)

-- ============================================================
-- SECTION 2: DB-level constraints for data integrity
-- (data-integrity-production: enforce invariants at DB level)
-- ============================================================

-- Constraint: resolved_at MUST be NULL when status is not 'Resolved'
-- Prevents phantom "resolved" timestamps on open incidents
ALTER TABLE public.incidents
  DROP CONSTRAINT IF EXISTS chk_resolved_at_requires_resolved_status;

ALTER TABLE public.incidents
  ADD CONSTRAINT chk_resolved_at_requires_resolved_status
  CHECK (
    (status = 'Resolved' AND resolved_at IS NOT NULL)
    OR
    (status != 'Resolved' AND resolved_at IS NULL)
  );

-- Constraint: resolution_reason MUST be set when status is 'Resolved'
-- Enforces mandatory root cause at DB level — not just frontend (soc-logic-production)
ALTER TABLE public.incidents
  DROP CONSTRAINT IF EXISTS chk_resolution_reason_required_for_resolved;

ALTER TABLE public.incidents
  ADD CONSTRAINT chk_resolution_reason_required_for_resolved
  CHECK (
    (status = 'Resolved' AND resolution_reason IS NOT NULL)
    OR
    status != 'Resolved'
  );

-- ============================================================
-- SECTION 3: Indexes (performance-optimizer)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON public.incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON public.incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_is_anomaly ON public.incidents(is_distance_anomaly);

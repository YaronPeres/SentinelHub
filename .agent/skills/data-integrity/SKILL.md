---
name: data-integrity-production
description: Production-grade Supabase schema architect, RLS enforcement, immutable audit logging, and strict TypeScript alignment.
---

# Data Integrity Skill (Production-Ready)

## Advanced Row Level Security (RLS) & Access Control
- **Zero-Trust Rule:** Every single table MUST have RLS enabled by default.
- **Granular Policies:** 
  - **Anon/Public:** Allowed strictly to `INSERT` new incident reports. They MUST NOT have `SELECT`, `UPDATE`, or `DELETE` access to the primary incidents table.
  - **Authenticated (Analysts):** Allowed `SELECT` and restricted `UPDATE` (e.g., only changing status to 'Resolved' and appending a root cause). `DELETE` operations are strictly FORBIDDEN to maintain historical integrity.

## Immutability & Audit Trails
- **Soft Deletes Only:** Records should never be permanently deleted from the database. Implement an `is_archived` or `status` column instead of destructive actions.
- **Audit Logging:** Any `UPDATE` or significant `INSERT` must trigger a secondary insert into an immutable `audit_logs` table (tracking the action, user ID, timestamp, and target row).

## Schema & Database Standards
- **Naming Conventions:** Enforce `snake_case` for database schemas (tables, columns, functions) and `camelCase` for TypeScript interfaces/types.
- **Data Constraints:** Utilize Postgres constraints at the database level (e.g., `NOT NULL`, `UNIQUE`, `CHECK` constraints) to prevent invalid data ingestion regardless of frontend validation. For example, ensure `resolved_at` cannot be populated if `status` is still 'Open'.
- **Type Generation:** All TypeScript types in `@/types/database.ts` MUST be automatically generated or strictly synced with the live Supabase schema. Do not rely on manually written definitions that can drift from reality.
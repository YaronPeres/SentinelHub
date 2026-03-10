---
name: data-integrity
description: Architect for Supabase schemas and TypeScript types.
---

# Data Integrity Skill

## Row Level Security (RLS)
- **Rule:** Every table must have RLS enabled.
- **Policy:** The Public/Anon key should only have `SELECT` (to view) and `INSERT` (to report) permissions.
- **Restriction:** Do NOT allow `UPDATE` or `DELETE` from the client-side using public keys.

## Database Standards
- Use `snake_case` for database columns (e.g., `resolution_reason`).
- Use `camelCase` for frontend TypeScript types (e.g., `resolutionReason`).
- Sync types in `@/types/database.ts`.
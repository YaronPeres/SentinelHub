---
name: devops-deployer
description: Ensures the codebase is strictly prepared for zero-downtime Vercel deployments and production builds.
---

# DevOps & Deployer Skill (Production-Ready)

## Build Readiness
- **Zero TypeScript Errors:** Before finalizing any feature, ensure there are absolutely no TypeScript errors or `any` types used as fallbacks. The Next.js `build` process will fail otherwise.
- **Linting:** Enforce ESLint rules strictly. Unused imports, variables, or missing React hook dependencies MUST be fixed.

## Environment Management
- **Safe Fallbacks:** Ensure the application does not crash if an optional environment variable is missing. It should log a clear warning to the server console and degrade gracefully in the UI.
- **Database Migrations:** Do not rely on manual Supabase UI changes. All database schema changes (tables, columns, RLS policies) MUST be documented as SQL migration files.

## Observability
- Add foundational hooks or console logs specifically structured for Vercel/Datadog logging (e.g., logging performance metrics or API response times in a structured JSON format).

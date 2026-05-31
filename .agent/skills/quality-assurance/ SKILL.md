---
name: quality-assurance-production
description: Production-grade E2E testing (Playwright), strict Zod schema validation, state mocking, and CI/CD readiness.
---

# Quality Assurance Skill (Production-Ready)

## Robust E2E Testing (Playwright)
- **Auth & Access Control:** Verify rigorous route protection. Assert that unauthenticated users are forcefully redirected from `/command-center` and `/intel-vault` to `/login`, and that API routes return `401 Unauthorized`.
- **Critical Workflows:** 
  - Simulate the full 'Threat Ingest' lifecycle: Submit IOC -> Verify success toast UI -> Verify persistence in DB -> Verify appearance in Triage Queue.
  - Test the 'Resolve' action: Ensure resolving an incident correctly updates the DB status, mandates a Root Cause, and dynamically updates the Intel Vault metrics (MTTR).
- **Network Mocking & Resilience:** Mock external API responses (`IP-API.com`, `HIBP`) to test both 'Happy Paths' (successful enrichment) and 'Sad Paths' (Rate limits, 500 server errors, timeouts). Ensure the UI handles these gracefully without crashing.

## Strict Data Validation (Zod)
- **Zero-Trust Input:** Enforce strict Zod schemas on ALL incoming Server Actions and API routes. Discard any payload that contains unexpected fields (use `.strict()`).
- **Domain-Specific Types:** Use regex or specific string validation for Indicators of Compromise (e.g., validate IPv4/v6 format, domain structure, valid SHA-1 hash length).
- **State Integrity:** Guarantee that the 'Resolution' action fails if a valid Root Cause enum ('User' or 'Distance') is missing. 

## Testing Environment Etiquette
- **Test Isolation:** Ensure Playwright tests run against a dedicated staging/test database or use transaction rollbacks. NEVER pollute the production Supabase database with dummy test data.
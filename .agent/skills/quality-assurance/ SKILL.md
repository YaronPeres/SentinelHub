---
name: quality-assurance
description: Expert in Playwright E2E testing and Zod schema validation.
---

# Quality Assurance Skill

## E2E Testing Strategy (Playwright)
- **Auth Guard Test:** Every build must verify that `/dashboard` redirects to `/` for unauthenticated users.
- **Ingest Flow:** Simulate a 'Threat Ingest' and verify the 'Terminal Success' message appears.
- **Anomaly Logic:** Mock the `IP-API.com` response to verify that 'Distance' flags are triggered correctly in the database.

## Data Validation
- Use **Zod** for all Server Action inputs to prevent SQL injection or malformed IoCs.
- **Requirement:** No 'Resolution' can be saved without a valid 'User' or 'Distance' enum value.
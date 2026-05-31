---
name: soc-logic-production
description: Production-grade logic for incident enrichment, resolution workflows, error handling, and KPI calculation.
---
# SOC Logic Skill (Production-Ready)

- **Mandatory Resolution & Audit:** Every 'Resolve' action MUST require a mandatory Root Cause classification: **'User'** (Human Error) or **'Distance'** (Geo-Anomaly). The action MUST update the status in the database AND write an immutable entry to the Live Audit Log detailing who resolved it and when.
- **Robust Enrichment:** Use `IP-API.com` to fetch geographic context for IP indicators. CRITICAL: Implement graceful fallback. If the API fails or rate-limits, the ingestion MUST still succeed with a 'Location Unknown' status, without crashing the application.
- **Accurate Metrics (MTTR):** Calculate MTTR using strict difference between `created_at` and `resolved_at` timestamps. If the resolution time is < 60 seconds, display it as `< 1 min` instead of `0.0 mins`.
- **Authorization & Validation:** Ensure that ONLY authenticated users with the 'Analyst' role can trigger the 'Resolve' action. Validate all manual ingestion inputs on the server-side before processing.
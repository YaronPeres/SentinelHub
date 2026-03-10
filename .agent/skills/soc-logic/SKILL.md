---
name: soc-logic
description: Logic for incident scoring and the mandatory resolution classification.
---
# SOC Logic Skill
- **Mandatory Resolution:** Every 'Close Case' action MUST require a selection: **'User'** (Human Error) or **'Distance'** (Impossible Travel).
- **Enrichment:** Use `IP-API.com` to provide geographic context for the 'Distance' logic.
- **Metrics:** Calculate MTTR (Time to Resolution) using `created_at` and `resolved_at`.
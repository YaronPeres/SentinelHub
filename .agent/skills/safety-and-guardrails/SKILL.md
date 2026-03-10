---
name: safety-and-guardrails
description: Prevents secret leakage and ensures data sanitization.
---
# Safety Skill
- **No Secrets in Client:** AbuseIPDB and HIBP keys stay in `.env` and are used ONLY in server-side code.
- **Sanitization:** Sanitize all IPs and URLs before rendering to prevent XSS.
- **Privacy:** Never store actual passwords; only the breach count result.
---
name: safety-and-guardrails-production
description: Production-grade strict enforcement of secret management, input sanitization, safe logging, and privacy compliance.
---
# Safety Skill (Production-Ready Guardrails)

- **Absolute Secret Isolation:** API keys (AbuseIPDB, IP-API, etc.) MUST reside exclusively in `.env.local` / environment variables. The agent MUST NOT prefix any secret keys with `NEXT_PUBLIC_` unless specifically required by the vendor's frontend SDK (e.g., Supabase ANON key).
- **Comprehensive Sanitization & Validation:** 
  - Validate all incoming payloads against strict schemas (e.g., using Zod) before processing.
  - Sanitize all user-generated content (IPs, URLs, context text) before inserting into the DB AND before rendering in the DOM to prevent XSS (Cross-Site Scripting) and SQL/NoSQL Injection.
- **Privacy & Zero-Knowledge Architecture:** Never store plaintext passwords, full hashes, or any PII (Personally Identifiable Information) beyond what is strictly necessary for the alert. The Password Checker must only record the timestamp and action, NEVER the payload.
- **Safe Logging Practices (Redaction):** Ensure that console logs and server-side errors DO NOT leak sensitive data. If an API call fails, log the generic error message but REDACT any tokens, payloads, or precise internal stack traces before returning the error to the client.
- **Fail-Safe Defaults:** If a security or validation check fails or throws an exception, the system must default to a 'Deny' or 'Safe' state without exposing the underlying system architecture to the user.
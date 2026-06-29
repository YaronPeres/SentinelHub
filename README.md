# 🛡️ SentinelZone
**Next-Gen Autonomous SOC: The Future of Threat Ingestion and Geographic Triage.**

> *"EDRs generate noise. SentinelZone extracts signal."*

![Landing Page](./public/screenshots/landing-page.png)

Modern Security Operations Centers (SOCs) are drowning in alerts. Traditional Endpoint Detection and Response (EDR) platforms generate thousands of raw logs daily, creating massive alert fatigue and leading to missed critical threats. 

**SentinelZone** is a specialized Threat Intelligence Command Center built to solve the "Context Gap." Instead of just aggregating logs, it mandates a geographic resolution logic—automatically correlating the origin of a threat report with the location of the threat itself to instantly identify impossible travel and coordinate high-fidelity triage.

---

## ✨ Core Cyber Capabilities

### 1. Zero-Friction Threat Ingestion
Security relies on rapid reporting. SentinelZone provides an instantaneous, anonymous public portal for employees, sensors, or automated bots to submit Indicators of Compromise (IoCs).

![Threat Ingestion](./public/screenshots/threat-ingestion.png)

- **Agnostic Payload Acceptance:** Instantly ingest suspicious IP addresses, malicious URLs, or spear-phishing email origins.
- **Contextual Logging:** Capture not just the indicator, but the behavioral context of the anomaly for downstream analyst review.

### 2. The "Distance Delta" Auto-Triage
The true power of SentinelZone lies in its automated enrichment pipeline. It doesn't just log a threat; it actively analyzes it *in-transit*.

- **Metadata Extraction:** The system automatically captures the origin IP of the entity reporting the threat.
- **Real-Time Geolocation:** It performs a simultaneous geographic lookup on both the reporter and the threat indicator.
- **Automated Anomaly Detection:** If the distance between the reporter and the target exceeds logical thresholds (e.g., a US-based employee reporting an internal login attempt originating from a foreign state), the system automatically flags the incident as a **Distance Anomaly**. 

### 3. Analyst Command Center & Justified Closure
A specialized, high-density dashboard built for rapid, conclusive decision-making by security analysts.

![Triage Queue](./public/screenshots/triage-queue.png)

- **Visual Prioritization:** Geo-Anomalies pulse in red, immediately bypassing low-level noise to draw the analyst's attention to critical, high-probability threats.
- **Mandatory Resolution Protocol:** Analysts cannot simply "dismiss" or "delete" an alert. To clear the queue, they are forced into a *Justified Closure* workflow, requiring them to explicitly classify the threat as either a *User Error* (false positive) or a *Distance Anomaly* (confirmed threat). 

### 4. Threat Intel Vault
Move from reactive firefighting to proactive threat hunting. 

![Analytics Dashboard](./public/screenshots/analytics-dashboard.png)

- **Real-Time KPIs:** Track your SOC's Mean Time to Resolution (MTTR) and daily ingestion volume to ensure SLA compliance.
- **Systemic Vulnerability Tracking:** Visual root-cause distribution charts highlight whether your organization suffers more from user error or active external probing.
- **Global Heatmap:** A live, interactive map plotting active geographic anomalies, allowing threat hunters to identify coordinated regional attacks.

---

## 🛠️ The Sentinel Workflow

1. **Ingest:** A suspicious IoC is reported into the perimeter network.
2. **Enrich:** The SentinelZone engine captures the telemetry and executes a geo-lookup.
3. **Correlate:** The Distance Delta is calculated. If impossible travel is detected, the threat is escalated automatically.
4. **Triage:** Analysts review the glowing, escalated threat in the Command Center queue.
5. **Resolve:** The analyst reviews the side-by-side geographic data and decisively closes the case using the Mandatory Resolution protocol.
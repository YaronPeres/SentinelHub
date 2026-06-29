# 🛡️ SentinelZone
**Next-Gen Autonomous SOC: The Future of Threat Ingestion and Geographic Triage.**

> *"EDRs generate noise. SentinelZone extracts signal."*

![Landing Page](./public/screenshots/landing-page.png)

Modern Security Operations Centers (SOCs) are drowning in alerts. Traditional Endpoint Detection and Response (EDR) platforms generate thousands of raw logs daily, creating massive alert fatigue and leading to missed critical threats. 

**SentinelZone** is a specialized Threat Intelligence Command Center built to solve the "Context Gap." Instead of just aggregating logs, it mandates a geographic resolution logic—automatically correlating the origin of a threat report with the location of the threat itself to instantly identify impossible travel and coordinate high-fidelity triage.

---

## ✨ Core Cyber Capabilities

### 1. Zero-Friction Threat Ingestion & Multi-Vector Enrichment
Security relies on rapid reporting. SentinelZone provides an instantaneous, anonymous public portal for employees, sensors, or automated bots to submit Indicators of Compromise (IoCs). Once an indicator is submitted, the ingestion engine automatically performs deep, multi-vector enrichment depending on the payload type:

- **IP Addresses:** 
  - Performs real-time geographic lookups via **ip-api**.
  - Calculates physical distances using the **Haversine formula** to map proximity to HQ or trusted endpoints.
- **URLs / Domains:** 
  - Resolves domain names to IP addresses via **Node DNS**.
  - Executes **SSL/TLS Probes** to check certificate validity and secure connections.
  - Cross-references the domain against the **OpenPhish Community Feed** to instantly flag known credential harvesters.
- **Email Addresses:** 
  - Queries the **LeakCheck API** to determine if the email has been exposed in known data breaches.
  - Validates deliverability and checks for disposable/burner addresses using the **Disify API**.

![Threat Ingestion](./public/screenshots/threat-ingestion.png)

### 2. The "Distance Delta" Auto-Triage
The true power of SentinelZone lies in its geographic correlation pipeline. It doesn't just log a threat; it actively analyzes physical impossibility.

- **Dual-IP Evaluation:** The system can evaluate the physical distance between a trusted IP and a reported IP.
- **Automated Anomaly Detection:** If the calculated distance between the two endpoints exceeds logical thresholds (e.g., >500km), the system automatically flags the incident as a **Distance Anomaly**, elevating its severity to Critical. 

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
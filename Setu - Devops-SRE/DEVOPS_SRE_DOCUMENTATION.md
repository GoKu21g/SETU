# Sahayogi Setu V2 — DevOps & SRE System Documentation

**Platform:** Sahayogi Setu V2  
**Section:** DevOps & Site Reliability Engineering (SRE) Control Plane  
**Target Persona:** Lead Site Reliability Engineer / DevOps Specialist (Arjun Mehta)  
**Document Version:** 2.1 (SRE Persona Lens & Architectural Blueprint Alignment)  

---

## 1. Executive Summary & Purpose

### What This Section Is
The **DevOps / SRE** section in Sahayogi Setu V2 is an **ecosystem observability, platform reliability, incident command, and deployment correlation control plane**. It provides the Site Reliability Engineer with deep, multi-layer visibility into microservice latency percentiles, error-budget/SLO burn, fleet-wide diagnostic verification, third-party provider quotas, and incident mitigation lifecycle tracking.

### What This Section Is NOT
- **It is NOT a CI/CD or Deployment Execution Engine:** Production deployments, canary promotions, and rollbacks are executed by authoritative pipelines (ArgoCD, GitHub Actions). Setu provides **visibility and 2-hour incident correlation** only.
- **It is NOT a Customer CRM or Support Ticketing Queue:** Customer ticket intake and SLA management live in BoSS Customer Service. SRE references customer workspaces purely for **blast-radius impact and subscription-tier prioritization**.
- **It is NOT an Infrastructure Provisioner or State Mutator:** SRE does not edit tenant subscriptions, override plan entitlements, or rotate credentials from this console.

### Core Permission & Governance Constraints
Setu operates strictly as an **observation, diagnostic, and incident management layer** for this persona:
1. **Read / Observe:** Unlimited depth across all metrics, traces, synthetic checks, dependency graphs, and provider telemetry.
2. **Diagnose:** Non-mutating verification only (fleet webhook pings, SSL cipher chain checks, anycast DNS edge checks, database connection pool lag).
3. **Write:** Restricted exclusively to **Setu-owned Incident objects** (status transitions, mitigation notes, linking probable-cause changes, Post-Incident Reviews) and the operator's own diagnostic run history.
4. **No Side-Channel Mutations:** Reconnect/re-auth actions on third-party providers route to a governed approval ticket for Platform Operations rather than executing directly.

---

## 2. Core Architectural Principles & Layout

```
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                                    SAHAYOGI SETU V2                                       │
│                                                                                           │
│   ┌──────────────┐  ┌─────────────────────────────────────────────────────────────────┐   │
│   │   SIDEBAR    │  │ HEADER (56px): Global Search [Ctrl+K] · SRE Alerts · Status    │   │
│   │    (80px)    │  ├─────────────────────────────────────────────────────────────────┤   │
│   │              │  │                                                                 │   │
│   │ [SETU LOGO]  │  │                      ACTIVE SRE VIEW CONTENT                    │   │
│   │ (→ Home/CR)  │  │                                                                 │   │
│   │              │  │  • Fleet SLO Error Budget Radar • Incident 360 State Machine    │   │
│   │  Plat. Health│  │  • 30-Day Daily Uptime Strips   • 2h Release Incident Marker    │   │
│   │  Incidents   │  │  • Multi-Tier Latency (p50-p99) • Fleet-Wide Diagnostic Runner   │   │
│   │  Releases    │  │  • Cross-Service Traces         • Immutable Audit Trail Log     │   │
│   │  Diagnostics │  │                                                                 │   │
│   │  Integrations│  ├─────────────────────────────────────────────────────────────────┤   │
│   │  Audit       │  │ PERSISTENT BOTTOM GUTTER (38px)             [AI Copilot Robot]  │   │
│   └──────────────┘  └─────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Logo Navigation:** Clicking the Setu brand mark at the top-left navigates to the **SRE Control Room (`dashboard`)**. The dashboard icon is omitted from the rail to maximize space for the 6 primary operational sections.
2. **Single SRE Specialist Focus:** Tailored for **Arjun Mehta** (Lead Site Reliability Engineer) with high-density operational metrics without vanity numbers or commercial clutter.
3. **Severity-First Ordering:** Incidents, alarms, and error budgets are sorted strictly by severity (`P1 Critical > P2 High > P3 Medium > P4 Low`), ensuring immediate containment focus.
4. **Persistent Bottom Bar:** Houses the borderless AI Assistant launcher for contextual copilot queries and log analysis.

---

## 3. The 8 SRE Operational Modules

### Module 1: Home / Control Room (`dashboard`)
**Primary Role:** Real-time fleet situational awareness, incident posture, and deployment correlation.
- **Top Metric Row (GreetingCard + 7 KPITile items + CalendarCard):**
  - **Fleet Service Health:** `99.982% Uptime` across 18 monitored microservices (14 healthy, 3 warning, 1 critical).
  - **Active Incidents:** `2 Active` sorted by severity (`P1 INC-1042`, `P2 INC-1039`).
  - **MTTA (Detect → Acknowledge):** `4.2m` (`-18%` improvement vs previous 30d window).
  - **MTTR (Acknowledge → Mitigate):** `28.4m` (`-12%` improvement vs previous 30d window).
  - **Deployments (Last 48h):** `6 Deploys`, highlighting `1 Correlated to INC-1042`.
  - **SLO Error Budgets:** `1 Exhausted` (WhatsApp Gateway 142% burn), `1 At Risk` (GSTN Ingestion 85% burn).
  - **Synthetic Checks:** `99.4%` pass rate across 17,280 daily probe runs.
- **Error Budget Donut & Root-Cause Breakdown:** Visual slice of failure categories (5xx timeouts, OAuth/credential expiry, queue backlog/rate-limiting, network drift).
- **Telemetry Trend with Incident Markers:** Area chart displaying fleet throughput vs p95 latency spikes with visual correlation markers during active outage windows.
- **Critical Services SLO Radar:** 3×3 grid of microservices with current availability, p95 latency, and burn status pills.
- **Severity-Ordered Incidents Table:** Direct links to Incident 360 command.

---

### Module 2: Platform Health (`health`)
**Primary Role:** Multi-layer observability and dependency blast-radius tracing.
- **Percentile Latency Analysis:** Granular latency breakdown across `p50 Median`, `p90`, `p95 SLA Target`, and `p99 Tail Latency`.
- **30-Day Aggregate Uptime Strips:** Continuous calendar history strip per microservice displaying daily aggregate health squares (`Healthy`, `Degraded`, `Outage`).
- **Dependency Topology Graph:** Upstream ingress → Target Microservice → Downstream Dependencies (NPCI Core, Redis streams, Kafka, Vault KMS) to analyze cascade risks.
- **Distributed Trace Path Inspection:** OpenTelemetry span durations across Envoy proxies, core services, and external provider APIs.

---

### Module 3: Reliability & Incidents (`incidents`)
**Primary Role:** Authoritative Incident 360 management with SRE write permissions.
- **Interactive State Machine Pipeline:** SRE can transition incident lifecycle:
  ```
  Detected → Triaged → Investigating → Mitigating → Monitoring → Resolved → Closed
  ```
- **SRE Write Capabilities:**
  - Transition status with automatic non-repudiable audit trail entry.
  - Append mitigation notes and runbook actions.
  - Link probable-cause releases and configuration changes.
  - Complete Post-Incident Review (PIR) fields (root cause, contributing factors, preventative action items).
- **SRE Write Restrictions:** No modifications to customer subscriptions, billing, or workspace provisioning.
- **Blast Radius Mapping:** Complete tenant population affected with direct links to read-only Workspace 360 dossiers.

---

### Module 4: Releases (`releases`)
**Primary Role:** Deployment pipeline visibility and bad-release detection (UC-06).
- **Pipeline Governance Metadata:** Commit reference, deployment initiator, CI/CD pipeline ID (`ArgoCD / GitHub Actions`), environment, and canary rollout cohort.
- **Pre vs. Post-Deployment Telemetry Diff:** Direct comparison of p95 latency and error rate 1 hour before vs. 1 hour after deployment.
- **2-Hour Incident Correlation Window:** Automatic flag linking any release deployed within 2 hours prior to an incident start time.
- **System Boundary Constraint:** Zero rollback/pause execution buttons in Setu. UI states: *"Managed via ArgoCD / GitHub Actions Pipeline — visibility only"*.

---

### Module 5: Diagnostics (`diagnostics`)
**Primary Role:** Fleet-wide non-mutating verification workbench.
- **Default Fleet-Wide Scope:** Defaults to `"All Monitored Workspaces (Fleet-Wide: 48 Tenants)"` so SRE immediately tests whether an anomaly is systemic or tenant-isolated.
- **Verification Probe Tools:**
  1. *Fleet Webhook Handshake & Delivery ACK*
  2. *Cross-Region DNS & Anycast Edge Validation*
  3. *SSL / TLS Certificate & Cipher Chain Verification*
  4. *Database Connection Pool & Read Replica Lag*
  5. *Meta Cloud API OAuth Token Validity Probe*
- **Live Output Console:** Real-time log output with execution durations in milliseconds.

---

### Module 6: Integrations (`integrations`)
**Primary Role:** Third-party provider monitoring and governed reconnect request workflow.
- **Integration 360 Ledger:** Connection health, webhook delivery percentages, rate-limit consumption (TPS), and linked incidents across NPCI UPI, Bharat BillPay, Meta Cloud API, NIC GSTN, and UIDAI.
- **Action Boundary:** Direct reconnect, revalidation, and secret rotation buttons are disabled.
- **Governed Reconnect Request:** SRE can submit a formal *"Request Reconnect"* that queues into Platform Operations with incident correlation references.

---

### Module 7: Workspace 360 (`workspaces`)
**Primary Role:** Read-only context panel for blast radius evaluation.
- **Search & Incident Entry Point:** Accessible via global search (`⌘K`) or by drilling into affected workspaces from an active incident.
- **Customer Context:** Organization legal identity, subscription tier (Enterprise Tier-1 SLA vs Growth Tier-2), provisioned products, and tenant error rate.
- **Strictly Read-Only:** Zero customer-facing mutation controls.

---

### Module 8: Audit & Timeline (`audit`)
**Primary Role:** Immutable, non-repudiable audit ledger.
- **Audit Logging Scope:** Automatically captures every incident status transition, mitigation note appended, diagnostic probe run, and deployment correlation.
- **Record Schema:** Event ID, timestamp (UTC), actor identity (`Arjun Mehta [Lead SRE]`), target object, and before/after state diff.

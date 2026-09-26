# Sahayogi Setu V2 — Technical Support System Documentation

**Platform:** Sahayogi Setu V2  
**Section:** Technical Support & Diagnostic Operations Control Plane  
**Target Persona:** Senior Technical Support Engineer (Tier 2 / Technical Operations Specialist)  
**Document Version:** 2.1 (Post-Simplification & Shift/Call Purge)  

---

## 1. Executive Summary & Purpose

### What This Section Is
The **Technical Support** section in Sahayogi Setu V2 is an **operations, telemetry, diagnostics, and root-cause analysis control plane**. It gives a technical support engineer complete visibility into customer workspace configurations, real-time API logs, external third-party integrations, and platform-level infrastructure health.

### What This Section Is NOT
- **It is NOT a Customer Ticketing System:** Upstream customer ticketing, case queues, triage assignment, and customer communication live in an existing dedicated platform. This section references ticket IDs (e.g., `CS-49201`) purely as correlation anchors to investigate technical failures.
- **It is NOT an HR or Workforce Management Tool:** All shift timers, on-call duty rosters, attendance records, and team hierarchies have been removed. The application focuses exclusively on operational diagnostics and system telemetry.
- **It is NOT an Infrastructure Modification Console:** Production infrastructure controls (such as auto-scaling policies, database failover triggers, and deployment rollbacks) are strictly reserved for SRE/DevOps. Technical Support has deep **read-only observability** with targeted **diagnostic execution** (pinging webhooks, tracing payloads, testing SSL/DNS).

---

## 2. Core Architectural Principles

```
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                                    SAHAYOGI SETU V2                                       │
│                                                                                           │
│   ┌──────────────┐  ┌─────────────────────────────────────────────────────────────────┐   │
│   │   SIDEBAR    │  │ HEADER (56px): Global Search [Ctrl+K] · Notifications · Status │   │
│   │    (80px)    │  ├─────────────────────────────────────────────────────────────────┤   │
│   │              │  │                                                                 │   │
│   │  Dashboard   │  │                      ACTIVE VIEW CONTENT                        │   │
│   │  API & Logs  │  │                                                                 │   │
│   │  W-space 360 │  │  • Technical KPI Metrics       • Interactive Diagnostic Runner  │   │
│   │  Diagnostics │  │  • Live API Request Stream     • Platform Service Observability │   │
│   │  Plat. Health│  │  • Progressive Workspace 360   • Incident Blast Radius Tracking │   │
│   │  Incidents   │  │                                                                 │   │
│   │  Integrations│  │                                                                 │   │
│   │              │  ├─────────────────────────────────────────────────────────────────┤   │
│   │              │  │ PERSISTENT BOTTOM GUTTER (38px)             [AI Copilot Robot]  │   │
│   └──────────────┘  └─────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Single-Operator Focus:** Designed for an individual engineer (**Dhruv Singla**, Senior Technical Support Engineer). All views, telemetry filters, and diagnostic tools cater to a single specialist diagnosing complex issues without multi-user clutter.
2. **High Information Density Without Visual Clutter:** Dense telemetry, tables, and traces are presented cleanly using quiet borders, clear typographic hierarchy (Inter/Roboto), and subtle status indicators.
3. **Progressive Disclosure:** Operators can assess overall system and workspace health in under 5 seconds. If an anomaly exists (e.g., HTTP 401 on WABA webhooks), one click expands headers, payload traces, and error root-cause details.
4. **Zero-Scroll Sidebar Rail:** The 80px navigation rail holds exactly 7 operational items that fit comfortably on any standard display without vertical scrolling.
5. **Persistent Bottom Space Bar:** A 38px bottom gutter bar ensures content never touches the bottom of the viewport and houses the borderless AI Assistant launcher in the bottom-right corner.

---

## 3. The 7 Operational Modules

### Module 1: Dashboard (`dashboard`)
**Primary Role:** Real-time situational awareness and rapid diagnostic jumping point.

- **Technical KPI Row:**
  - **Platform Status:** Current platform uptime (e.g., `99.98% Operational`) and count of monitored endpoints (`18 Active`).
  - **Monitored Workspaces:** High-priority accounts assigned to the operator (`5 Accounts`: 1 Attention, 1 Degraded, 3 Healthy).
  - **Diagnostics Executed:** Monthly probe count (`142 Traces`) and average execution latency (`4.2ms`).
  - **Active Alerts:** Total unaddressed alerts requiring technical investigation (`2 Alerts`).
- **Quick Action Bar:** One-click shortcuts to ping webhooks, trace request latencies, verify SSL certificates, and check ecosystem health.
- **Monitored Workspaces Table:** Live view of key customer workspaces (e.g., Sharma Traders, Bharat Agro, Rajdhani Fleet) displaying tenant health pills, API success rates, last run diagnostic, and direct links to **Workspace 360** or **Live API Logs**.
- **Platform Services Radar:** Snapshot of microservices (UPI Rail, BBPS Engine, WhatsApp Cloud Gateway, GST Ingestion).
- **Recent Diagnostic Executions:** Live stream of probe outputs executed by the operator.

---

### Module 2: API & Logs (`api_logs`)
**Primary Role:** Real-time telemetry ingestion and deep request/response inspection.

- **Live Stream Ingestion:** Tracks incoming and outgoing HTTP calls across all monitored customer accounts.
- **Multi-Dimensional Filtering:**
  - **Search:** Query by trace ID, endpoint path, error string, or customer name.
  - **Method:** `GET`, `POST`, `PUT`, `DELETE`.
  - **Status Range:** `All`, `2xx Success`, `4xx Client Error`, `5xx Server Error`.
  - **Workspace:** Filter down to a specific tenant (e.g., `WS-94812`).
- **Deep Inspection Drawer:** Selecting any log item expands an in-depth diagnostic panel:
  - **cURL Command:** Copy-to-clipboard reproduction command with full headers and payload.
  - **Request Details:** Timestamp, duration in milliseconds, IP address, user-agent, and trace ID.
  - **HTTP Headers:** Complete key-value headers (including `X-Hub-Signature-256`, `X-Setu-Trace-ID`, etc.).
  - **Payload & Response Body:** Syntax-highlighted JSON representations.
  - **Diagnostic Error Root-Cause:** Plain-language technical explanation of failures (e.g., *“HMAC signature verification failed: registered Meta WABA access token has expired”*).

---

### Module 3: Workspace 360 (`workspace_360`)
**Primary Role:** Unified 360-degree technical dossier for a customer workspace with progressive disclosure.

Designed for instant clarity without card bloat, using a compact identity header, a unified horizontal summary bar, and exactly **4 focused tabs**:

#### A. Header & Summary Bar
- **Identity Header:** Workspace legal name (`Sharma Traders Private Limited`), ID badge (`WS-94812`), tenant status (`Active`), and industry category.
- **Summary Bar (Unified Single-Row Matrix):**
  ```
  Products: 3 Active | Integrations: 2/3 Healthy | Provisioning: Healthy | Health: ● Degraded | Open Cases: 3
  ```
  Only abnormal states (e.g., `Health: Degraded`) show amber/red badges; healthy metrics remain neutral.

#### B. Tab 1: Overview
- **Identity & Membership (2 Columns):**
  - *Left Column:* Legal entity, GSTIN, primary IT contact email/phone, and a collapsible **"View details"** toggle for PAN, full registered address, and regional hub.
  - *Right Column:* Active seats (`11/14`), admin count, technical contacts, MFA enforcement status.
- **Current Technical Issues (Prominent Callout):**
  - Immediately highlights active blockers:
    - ⚠ `WhatsApp Authentication Failure (OAuth Token Expired)` → Action: `View Integration →`
    - ⚠ `Storage Bucket Provisioning Delay` → Action: `View Timeline →`
- **Active Products:** Compact list showing plan tier and status for Chat with Sahayogi, Pay with Sahayogi, and Tax Sahayogi.
- **Recent Support Cases & Integration Status:** Compact summary tables cross-referencing upstream tickets.

#### C. Tab 2: Subscriptions & Entitlements
- Commercial agreement details (`Growth Tier Annual`, renewal date, billing cycle).
- **Resource Limits & Entitlement Table:**
  - WhatsApp Business Numbers: `1 / 2 Assigned` (50%)
  - Monthly Outbound Messages: `48,200 / 100,000` (48%)
  - Encrypted Document Storage: `14.2 GB / 50 GB` (28%)
  - GST / E-Way Bill Bridge: `Unlimited (Fair Use)`

#### D. Tab 3: Integrations
- Comprehensive table of connected third-party providers (Meta WhatsApp Cloud API, Razorpay, NIC GST Portal, AWS S3).
- **Expandable Diagnostic Drawer per Integration:**
  - Handshake connection state and latency.
  - Secure vault secret reference pointers (`vault://app/secrets/...`).
  - Rate limit utilization vs. threshold.
  - Webhook delivery buffer and lag metrics.
  - Raw failure error payload and remediation recommendations.

#### E. Tab 4: Support & Timeline
- Upstream cases reference (`CS-49201`, `CS-49187`, `CS-49156`) with priority, status, and summary.
- Chronological audit and event timeline tracking token expirations, ERP synchronization runs, and automated provisioning verification.

---

### Module 4: Diagnostic Tools (`diagnostic_tools`)
**Primary Role:** Interactive diagnostic probe execution engine.

- **Interactive Test Runner:** Allows the engineer to run on-demand technical probes against any monitored workspace:
  1. `Webhook Ping` (Tests webhook endpoint accessibility and response code)
  2. `Payload Trace` (Sends sample JSON payloads and evaluates ingestion lag)
  3. `SSL Verification` (Validates TLS certificate validity, issuer, and cipher strength)
  4. `Integration Health` (Validates external API tokens and credentials)
  5. `Database Connection` (Checks tenant read-replica connectivity and pool latency)
- **Live Execution Output:** Displays response status (`passed` / `failed`), latency in milliseconds, timestamp, and a diagnostic summary.
- **Webhook Payload Inspector & HMAC Tool:**
  - View real-world sample webhook payloads (e.g. WhatsApp Meta Graph v21.0 messages).
  - Built-in signature verification assistant demonstrating SHA-256 HMAC calculation.
- **SSL & DNS Validator:** Checks domain resolution, DNS propagation, and SSL certificate expiration countdowns.

---

### Module 5: Platform Health (`platform_health`)
**Primary Role:** Infrastructure and microservice observability for customer failure correlation.

- **Read-Only Visibility:** Specifically configured to let Technical Support engineers determine whether customer issues stem from internal platform degradations versus tenant-specific misconfigurations, without risking accidental infrastructure changes.
- **Monitored Services:**
  - UPI Payment Rail (p95: 142ms, Error Rate: 0.02%)
  - BBPS Bill Payments Engine (p95: 88ms, Error Rate: 0.01%)
  - WhatsApp Cloud Gateway (p95: 124ms, Error Rate: 0.45%)
  - GST Portal Ingestion Gateway (p95: 3,420ms, Error Rate: 4.82% — *Degraded*)
  - PostgreSQL Tenant Read Replicas (p95: 3.2ms, Error Rate: 0.00%)
  - OAuth 2.0 Auth & Token Service (p95: 28ms, Error Rate: 0.00%)
- **Data Attributes per Service:** Status badge, current telemetry signal, p95 latency, error rate, affected customer count, linked incident ID, and upstream external dependencies (NIC, NPCI, Meta, AWS).

---

### Module 6: Incidents (`incidents`)
**Primary Role:** Outage tracking, blast radius calculation, and operational impact assessment.

- **Active Platform Incidents:**
  - Displays high-severity incidents (e.g., `INC-1042: GST Portal Ingestion Gateway Latency & Upstream 504 Timeouts`).
  - **Blast Radius:** Total number of impacted customer workspaces across the platform.
  - **Incident Commander Attribution:** Displays the SRE lead handling the incident (e.g., Kabir S.).
  - **Diagnostic Advice for Support:** Actionable notes guiding support engineers on how to handle incoming customer inquiries (e.g., *“NIC upstream server returning intermittent 504s. Retries are queued with exponential backoff. Advise customers that webhooks will arrive with delay.”*).
- **Incident Timeline & Mitigation Status:** Step-by-step resolution updates from the engineering and DevOps teams.

---

### Module 7: Integrations (`integrations`)
**Primary Role:** Fleet-wide integration health and third-party rail matrix.

- Aggregated view of all external bridges connecting to Setu:
  - Meta / WhatsApp Business Platform
  - NIC / Public GST E-Invoice & E-Way Portal
  - Razorpay Payment Gateway
  - Tally Prime Local Connector
  - AWS S3 Encrypted Document Store
- Provides immediate insight into global failure rates, webhook delivery delays, credential expirations, and security vault secret references.

---

## 4. Global Shell & Cross-Cutting Features

### A. Fixed Header (56px)
- **Setu Branding & Environment Badge:** Displays current environment (`Production · ap-south-1`).
- **Global Search Bar (`Ctrl+K`):** Keyboard-accessible quick-search opening the global search modal.
- **Notifications Popover:** Lists real-time telemetry alerts, webhook degradation pings, and incident updates.
- **Operator Profile & Availability Indicator:**
  - Displays engineer name (**Dhruv Singla**), designation (**Senior Technical Support Engineer**), and avatar badge.
  - **Availability Status:** Single neutral status indicator (`Available`, `Investigating`, `Do Not Disturb`) with subtle dot + label next to profile — status only, with zero shift/break semantics or time tracking.
  - Quick action button to immediately jump to the Diagnostic Workbench.

### B. Global Search Modal (`Ctrl+K`)
- Accessible via shortcut (`Ctrl+K` / `Cmd+K`) or the header search bar.
- Instant fuzzy search across:
  - Customer Workspaces (by ID or company name)
  - API Endpoints (by path or HTTP method)
  - Error Codes (e.g., `HTTP 401`, `Code 190`, `504 Gateway Timeout`)
  - Incidents (e.g., `INC-1042`)
  - Diagnostic Tools (e.g., Webhook Ping, SSL check)
- One-click navigation to the matching view.

### C. Floating AI Assistant (Sahayogi Copilot)
- **Launcher:** Minimalist 24px borderless robot icon anchored cleanly in the bottom-right space bar.
- **Context-Aware Technical Knowledge:**
  - Can explain active platform incidents (`INC-1042`).
  - Can inspect workspace diagnostics (e.g., explaining why Sharma Traders WS-94812 is failing).
  - Can check platform uptime and health across services.
  - Can trigger interactive diagnostic workbench runs.
- **Interactive Quick Prompts:** Pre-configured one-click questions (`Inspect Sharma Traders diagnostics`, `Run webhook ping on WS-94812`, `Check platform services uptime`, `What is the status of INC-1042?`).
- **Deep-Link Action Buttons:** Directly navigates the user to relevant views inside the application.

---

## 5. Technical Stack & State Management

| Layer | Technology | Rationale |
|---|---|---|
| **Core Framework** | React 18 + TypeScript | Strict typing, robust component lifecycle |
| **Bundler & Dev Server** | Vite 6 | Sub-second HMR and optimized production bundles |
| **Iconography** | Lucide React | Clean, consistent, lightweight SVG icons |
| **Styling** | Vanilla CSS + CSS Variables (`index.css`) | Maximum styling control, zero Tailwind dependencies, fine-tuned typography & spacing |
| **State Management** | React Context (`TechnicalSupportContext`) | Centralized state for `activeView`, `staffProfile`, `searchModalOpen`, and `runDiagnosticTest` |
| **Data Architecture** | Pure Mock Data Store (`src/data/mockData.ts`) | High-fidelity simulation of enterprise telemetries, webhook events, and workspace records |

---

## 6. Summary of Key Architectural Pivots

1. **Purged Ticketing & SLA Queues:** Upstream ticket handling belongs to the customer support ticketing tool. This application acts solely as the technical engine room.
2. **Removed Multi-Tier Hierarchy & HR Tracking:** No managers, no junior-agent triage queues, no shift timers, and no on-call rosters. Built for an agile technical specialist doing deep root-cause troubleshooting.
3. **Workspace 360 Redesign:** Transformed from an overwhelming multi-card view into a high-density, 4-tab dossier built on progressive disclosure.
4. **Permanent Removal of Shift & On-Call:** Completed clean elimination of all shift schedule models, calendar components, timers, and assistant prompts, leaving 0 residual references across the codebase.

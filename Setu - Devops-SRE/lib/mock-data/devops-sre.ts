import type { StatusLevel } from "@/components/shared/StatusBadge";

export type TrendRangeDays = 7 | 30 | 90;

export type SreKpiSnapshot = {
  fleetServiceHealth: {
    total: number;
    healthy: number;
    warning: number;
    critical: number;
    uptimePct: string;
  };
  activeIncidents: {
    total: number;
    p1: number;
    p2: number;
    p3: number;
    p4: number;
    note: string;
  };
  mtta: {
    value: string;
    delta: string;
    trend: "down" | "up";
    target: string;
  };
  mttr: {
    value: string;
    delta: string;
    trend: "down" | "up";
    target: string;
  };
  deploymentsLast48h: {
    count: number;
    incidentCorrelatedCount: number;
    note: string;
  };
  sloErrorBudget: {
    criticalServicesCount: number;
    exhaustedCount: number;
    atRiskCount: number;
    healthyCount: number;
  };
  syntheticChecks: {
    rate: string;
    totalRuns24h: number;
    failingCount: number;
  };
};

export const sreKpiData: SreKpiSnapshot = {
  fleetServiceHealth: {
    total: 18,
    healthy: 14,
    warning: 3,
    critical: 1,
    uptimePct: "99.982%",
  },
  activeIncidents: {
    total: 2,
    p1: 1,
    p2: 1,
    p3: 0,
    p4: 0,
    note: "P1 INC-1042 · P2 INC-1039",
  },
  mtta: {
    value: "4.2m",
    delta: "-18%",
    trend: "down",
    target: "< 5.0m",
  },
  mttr: {
    value: "28.4m",
    delta: "-12%",
    trend: "down",
    target: "< 35.0m",
  },
  deploymentsLast48h: {
    count: 6,
    incidentCorrelatedCount: 1,
    note: "1 Correlated to INC-1042",
  },
  sloErrorBudget: {
    criticalServicesCount: 6,
    exhaustedCount: 1,
    atRiskCount: 1,
    healthyCount: 4,
  },
  syntheticChecks: {
    rate: "99.4%",
    totalRuns24h: 17280,
    failingCount: 1,
  },
};

// Error Budget Breakdown for Donut Chart
export const sreFailureCategories = [
  { label: "Upstream 5xx Timeouts", value: 42, color: "#DC2626" },
  { label: "Auth / Expired Credentials", value: 28, color: "#D97706" },
  { label: "Rate Throttling & Limits", value: 18, color: "#2563EB" },
  { label: "Network & Handshake Drift", value: 12, color: "#0891B2" },
];

export type CriticalServiceSlo = {
  id: string;
  name: string;
  category: string;
  targetSlo: string;
  currentAvailability: string;
  errorBudgetBurnPct: number;
  status: "Exhausted" | "At Risk" | "Healthy";
  statusLevel: StatusLevel;
  p95Latency: string;
  throughputRps: number;
  queueDepth: number;
  dependencies: string[];
  uptimeHistory30d: ("healthy" | "warning" | "critical")[];
};

export const criticalServices: CriticalServiceSlo[] = [
  {
    id: "svc-upi",
    name: "UPI Payment Switch",
    category: "Financial Rail",
    targetSlo: "99.99%",
    currentAvailability: "99.992%",
    errorBudgetBurnPct: 12,
    status: "Healthy",
    statusLevel: "healthy",
    p95Latency: "18ms",
    throughputRps: 1840,
    queueDepth: 4,
    dependencies: ["NPCI UPI Core", "Razorpay Rail", "Postgres Primary"],
    uptimeHistory30d: Array(30).fill("healthy"),
  },
  {
    id: "svc-waba",
    name: "WhatsApp Cloud Gateway",
    category: "Messaging Bridge",
    targetSlo: "99.90%",
    currentAvailability: "98.240%",
    errorBudgetBurnPct: 142,
    status: "Exhausted",
    statusLevel: "critical",
    p95Latency: "840ms",
    throughputRps: 420,
    queueDepth: 186,
    dependencies: ["Meta Graph API v21.0", "Redis Inbound Stream"],
    uptimeHistory30d: [
      ...Array(26).fill("healthy"),
      "warning",
      "healthy",
      "critical",
      "critical",
    ],
  },
  {
    id: "svc-bbps",
    name: "BBPS Bill Rail",
    category: "Payment Network",
    targetSlo: "99.95%",
    currentAvailability: "99.964%",
    errorBudgetBurnPct: 8,
    status: "Healthy",
    statusLevel: "healthy",
    p95Latency: "24ms",
    throughputRps: 620,
    queueDepth: 2,
    dependencies: ["NPCI Bharat BillPay", "Kafka Ingestion"],
    uptimeHistory30d: Array(30).fill("healthy"),
  },
  {
    id: "svc-gstn",
    name: "GSTN Ingestion & E-Way",
    category: "Tax Government API",
    targetSlo: "99.50%",
    currentAvailability: "99.120%",
    errorBudgetBurnPct: 85,
    status: "At Risk",
    statusLevel: "warning",
    p95Latency: "420ms",
    throughputRps: 180,
    queueDepth: 64,
    dependencies: ["NIC Public GST Portal", "RabbitMQ Event Hub"],
    uptimeHistory30d: [
      ...Array(22).fill("healthy"),
      "warning",
      "healthy",
      "warning",
      "healthy",
      "healthy",
      "warning",
      "warning",
    ],
  },
  {
    id: "svc-kyc",
    name: "KYC & DigiLocker Engine",
    category: "Identity API",
    targetSlo: "99.90%",
    currentAvailability: "99.910%",
    errorBudgetBurnPct: 22,
    status: "Healthy",
    statusLevel: "healthy",
    p95Latency: "36ms",
    throughputRps: 290,
    queueDepth: 8,
    dependencies: ["UIDAI CIDR", "NSDL Switch", "Vault KMS"],
    uptimeHistory30d: Array(30).fill("healthy"),
  },
  {
    id: "svc-fasttag",
    name: "FastTag NETC Transit Rail",
    category: "Toll Network",
    targetSlo: "99.95%",
    currentAvailability: "99.970%",
    errorBudgetBurnPct: 16,
    status: "Healthy",
    statusLevel: "healthy",
    p95Latency: "29ms",
    throughputRps: 510,
    queueDepth: 0,
    dependencies: ["NETC Central Hub", "FastTag Switch"],
    uptimeHistory30d: Array(30).fill("healthy"),
  },
];

export type IncidentStatus =
  | "Detected"
  | "Triaged"
  | "Investigating"
  | "Mitigating"
  | "Monitoring"
  | "Resolved"
  | "Closed";

export type IncidentSeverity = "P1-Critical" | "P2-High" | "P3-Medium" | "P4-Low";

export type Incident360 = {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  statusLevel: StatusLevel;
  commander: string;
  technicalOwner: string;
  affectedServices: string[];
  affectedProducts: string[];
  affectedWorkspacesCount: number;
  sampleWorkspaces: string[];
  detectionSource: string;
  firstSeen: string;
  linkedRelease?: string;
  linkedReleaseWindow?: string;
  timeline: {
    time: string;
    actor: string;
    action: string;
    type: "status" | "mitigation" | "detection" | "note";
  }[];
  mitigationNotes: string;
  pir: {
    rootCause: string;
    contributingFactors: string;
    actionItems: string[];
  };
};

export const sreIncidents: Incident360[] = [
  {
    id: "INC-1042",
    title: "WhatsApp Meta Egress Gateway 504 Timeouts & OAuth Expired Failures",
    severity: "P1-Critical",
    status: "Investigating",
    statusLevel: "critical",
    commander: "Arjun Mehta (Lead SRE)",
    technicalOwner: "Priyanka Rao (Core Platform)",
    affectedServices: ["WhatsApp Cloud Gateway", "Inbound Message Dispatcher"],
    affectedProducts: ["Chat with Sahayogi (Enterprise)"],
    affectedWorkspacesCount: 48,
    sampleWorkspaces: ["Sharma Traders (WS-94812)", "QuickPay Retail (WS-64019)"],
    detectionSource: "Synthetic Probe P-WABA-04 & Datadog SLO Burn Alert",
    firstSeen: "2026-09-26 12:12 UTC (38m ago)",
    linkedRelease: "rel-2026-09-25-01 (WABA Bridge v3.4.1)",
    linkedReleaseWindow: "Deployed 42 min before incident first-seen",
    timeline: [
      {
        time: "12:12 UTC",
        actor: "Datadog Automated Alert",
        action: "High 5xx error rate detected on /v2/whatsapp/messages/webhook (>5.0%). Incident auto-created.",
        type: "detection",
      },
      {
        time: "12:15 UTC",
        actor: "Arjun Mehta [SRE]",
        action: "Acknowledged page. Assumed Incident Commander role. Triaged to P1 Critical.",
        type: "status",
      },
      {
        time: "12:24 UTC",
        actor: "Arjun Mehta [SRE]",
        action: "Correlated recent deployment rel-2026-09-25-01. Isolated upstream HMAC failure on expired Meta access tokens.",
        type: "mitigation",
      },
      {
        time: "12:35 UTC",
        actor: "Priyanka Rao [Eng Lead]",
        action: "Drafted configuration hotfix patch. Coordinated with Customer Support for tenant token re-auth.",
        type: "note",
      },
    ],
    mitigationNotes:
      "Customer tenant token expired upstream on Meta Developer platform. Preparing emergency token bypass in staging, and alerting Tier-2 support to contact affected accounts.",
    pir: {
      rootCause:
        "Long-lived Meta Graph API user access tokens expired without proactive telemetry warning threshold in Setu.",
      contributingFactors:
        "Release v3.4.1 tightened HMAC payload validation, causing cached expired tokens to reject instantly instead of graceful fallback.",
      actionItems: [
        "Implement 7-day pre-expiry synthetic check for all registered OAuth tokens in Setu.",
        "Add automated graceful retry with circuit breaker on upstream 504 responses.",
      ],
    },
  },
  {
    id: "INC-1039",
    title: "NIC GSTN Public Gateway Upstream Throttling (E-Way Bill Generation)",
    severity: "P2-High",
    status: "Monitoring",
    statusLevel: "warning",
    commander: "Neha Kapoor [SRE]",
    technicalOwner: "Devendra S. [Backend]",
    affectedServices: ["GSTN Ingestion & E-Way"],
    affectedProducts: ["Tax Sahayogi"],
    affectedWorkspacesCount: 32,
    sampleWorkspaces: ["Kalyan Logistics (WS-77104)", "Hind Auto Spares (WS-29108)"],
    detectionSource: "NIC Outage Status feed & Webhook Queue Depth > 50",
    firstSeen: "2026-09-26 10:45 UTC (2h ago)",
    timeline: [
      {
        time: "10:45 UTC",
        actor: "Prometheus Alertmanager",
        action: "Queue depth exceeded 50 messages on tax-gstn-dispatch queue.",
        type: "detection",
      },
      {
        time: "10:52 UTC",
        actor: "Neha Kapoor [SRE]",
        action: "Switched to secondary NIC state portal endpoint. Throttling subsided.",
        type: "mitigation",
      },
      {
        time: "11:30 UTC",
        actor: "Neha Kapoor [SRE]",
        action: "Queue depth returned to normal (2). Set incident status to Monitoring.",
        type: "status",
      },
    ],
    mitigationNotes: "Secondary endpoint routing active. Monitoring error rate.",
    pir: {
      rootCause: "Government NIC portal rate-limiting primary IP range during peak tax-filing window.",
      contributingFactors: "Dynamic IP pool rotation was disabled in proxy config.",
      actionItems: ["Enable multi-IP egress proxy rotation for GSTN engine."],
    },
  },
];

export type SreRelease = {
  id: string;
  version: string;
  service: string;
  environment: "Production" | "Staging";
  commitHash: string;
  deployedAt: string;
  initiator: string;
  pipelineRef: string;
  rolloutCohort: string;
  healthBefore: { latency: string; errorRate: string };
  healthAfter: { latency: string; errorRate: string };
  status: "Healthy" | "Correlated to Incident" | "Paused";
  statusLevel: StatusLevel;
  correlatedIncidentId?: string;
  managedByPipelineNote: string;
};

export const sreReleases: SreRelease[] = [
  {
    id: "rel-2026-09-26-02",
    version: "v2.18.4",
    service: "UPI Payment Switch",
    environment: "Production",
    commitHash: "9a4f21b",
    deployedAt: "Today, 10:15 UTC (3h ago)",
    initiator: "CI/CD via arjun.mehta",
    pipelineRef: "ArgoCD Pipeline #14902",
    rolloutCohort: "100% Full Fleet",
    healthBefore: { latency: "19ms", errorRate: "0.01%" },
    healthAfter: { latency: "18ms", errorRate: "0.01%" },
    status: "Healthy",
    statusLevel: "healthy",
    managedByPipelineNote: "Managed via ArgoCD Production Pipeline — visibility only",
  },
  {
    id: "rel-2026-09-25-01",
    version: "v3.4.1",
    service: "WhatsApp Meta Egress Gateway",
    environment: "Production",
    commitHash: "e47b92c",
    deployedAt: "Today, 11:30 UTC (42m before INC-1042)",
    initiator: "CI/CD via priyanka.rao",
    pipelineRef: "GitHub Actions Build #8841",
    rolloutCohort: "100% Fleet (Canary completed)",
    healthBefore: { latency: "120ms", errorRate: "0.12%" },
    healthAfter: { latency: "840ms", errorRate: "4.80%" },
    status: "Correlated to Incident",
    statusLevel: "critical",
    correlatedIncidentId: "INC-1042",
    managedByPipelineNote: "Managed via GitHub Actions Pipeline — visibility only (No rollback action from console)",
  },
  {
    id: "rel-2026-09-25-03",
    version: "v1.9.0",
    service: "GSTN Ingestion & E-Way",
    environment: "Production",
    commitHash: "c18a33f",
    deployedAt: "Yesterday, 18:40 UTC",
    initiator: "CI/CD via devendra.s",
    pipelineRef: "ArgoCD Pipeline #14878",
    rolloutCohort: "100% Full Fleet",
    healthBefore: { latency: "410ms", errorRate: "0.40%" },
    healthAfter: { latency: "420ms", errorRate: "0.42%" },
    status: "Healthy",
    statusLevel: "healthy",
    managedByPipelineNote: "Managed via ArgoCD Production Pipeline — visibility only",
  },
  {
    id: "rel-2026-09-24-04",
    version: "v4.1.0",
    service: "Sahayogi One Auth & Vault",
    environment: "Production",
    commitHash: "3f88d10",
    deployedAt: "2 days ago, 14:00 UTC",
    initiator: "CI/CD via secops.bot",
    pipelineRef: "ArgoCD Pipeline #14852",
    rolloutCohort: "100% Full Fleet",
    healthBefore: { latency: "45ms", errorRate: "0.00%" },
    healthAfter: { latency: "44ms", errorRate: "0.00%" },
    status: "Healthy",
    statusLevel: "healthy",
    managedByPipelineNote: "Managed via ArgoCD Production Pipeline — visibility only",
  },
];

export type SreDiagnosticProbe = {
  id: string;
  name: string;
  category: string;
  targetScope: string;
  frequency: string;
  lastExecuted: string;
  durationMs: number;
  status: "passed" | "failed" | "warning";
  statusLevel: StatusLevel;
  outputSummary: string;
};

export const sreDiagnosticProbes: SreDiagnosticProbe[] = [
  {
    id: "PRB-FLEET-01",
    name: "Fleet Webhook Handshake & Delivery ACK",
    category: "Network / Webhook",
    targetScope: "All Monitored Workspaces (Fleet-wide)",
    frequency: "Every 60s",
    lastExecuted: "45s ago",
    durationMs: 84,
    status: "warning",
    statusLevel: "warning",
    outputSummary: "47/48 endpoints returned 200 OK. WS-94812 failed with 401 Unauthorized.",
  },
  {
    id: "PRB-FLEET-02",
    name: "Cross-Region DNS & Anycast Edge Validation",
    category: "DNS / Edge",
    targetScope: "Global Edge POPs (Mumbai, Delhi, Bangalore)",
    frequency: "Every 5m",
    lastExecuted: "2m ago",
    durationMs: 24,
    status: "passed",
    statusLevel: "healthy",
    outputSummary: "All edge nodes routing to healthy ingress clusters. DNS TTL: 300s.",
  },
  {
    id: "PRB-FLEET-03",
    name: "SSL / TLS Certificate & Cipher Chain Verification",
    category: "Security & TLS",
    targetScope: "All *.setu.co & *.sahayogi.in Domains",
    frequency: "Every 1h",
    lastExecuted: "18m ago",
    durationMs: 42,
    status: "passed",
    statusLevel: "healthy",
    outputSummary: "All certificates valid. Closest expiry: api.setu.co (48 days).",
  },
  {
    id: "PRB-FLEET-04",
    name: "Database Connection Pool & Read Replica Lag",
    category: "Database",
    targetScope: "Aurora Postgres Primary & 3 Read Replicas",
    frequency: "Continuous (30s)",
    lastExecuted: "12s ago",
    durationMs: 12,
    status: "passed",
    statusLevel: "healthy",
    outputSummary: "Max replica lag: 14ms. Connection pool utilization: 34% (Safe).",
  },
  {
    id: "PRB-FLEET-05",
    name: "Meta Cloud API OAuth Token Validity Probe",
    category: "Third-Party Integration",
    targetScope: "WhatsApp Egress Gateway Fleet",
    frequency: "Every 10m",
    lastExecuted: "1m ago",
    durationMs: 340,
    status: "failed",
    statusLevel: "critical",
    outputSummary: "CRITICAL: Meta Graph API OAuth token invalid for WS-94812 (Correlated to INC-1042).",
  },
];

export type SreIntegration = {
  id: string;
  provider: string;
  service: string;
  connectionState: "Connected" | "Degraded" | "Failed";
  statusLevel: StatusLevel;
  lastSuccess: string;
  lastFailure: string;
  webhookDeliveryPct: string;
  rateLimitUsage: string;
  affectedWorkspacesCount: number;
  linkedIncident?: string;
};

export const sreIntegrations: SreIntegration[] = [
  {
    id: "INT-UPI",
    provider: "NPCI UPI Switch",
    service: "Instant Payments",
    connectionState: "Connected",
    statusLevel: "healthy",
    lastSuccess: "Just now",
    lastFailure: "2 days ago",
    webhookDeliveryPct: "99.99%",
    rateLimitUsage: "1,840 / 5,000 TPS (36%)",
    affectedWorkspacesCount: 0,
  },
  {
    id: "INT-META",
    provider: "Meta WhatsApp Cloud API",
    service: "Messaging Bridge",
    connectionState: "Degraded",
    statusLevel: "critical",
    lastSuccess: "38 min ago",
    lastFailure: "2 min ago",
    webhookDeliveryPct: "96.40%",
    rateLimitUsage: "420 / 1,000 TPS (42%)",
    affectedWorkspacesCount: 48,
    linkedIncident: "INC-1042",
  },
  {
    id: "INT-BBPS",
    provider: "NPCI Bharat BillPay",
    service: "Utility Biller Rail",
    connectionState: "Connected",
    statusLevel: "healthy",
    lastSuccess: "1 min ago",
    lastFailure: "4 days ago",
    webhookDeliveryPct: "99.96%",
    rateLimitUsage: "620 / 2,000 TPS (31%)",
    affectedWorkspacesCount: 0,
  },
  {
    id: "INT-GSTN",
    provider: "NIC GST Portal",
    service: "Tax & E-Way Bill",
    connectionState: "Degraded",
    statusLevel: "warning",
    lastSuccess: "4 min ago",
    lastFailure: "12 min ago",
    webhookDeliveryPct: "98.80%",
    rateLimitUsage: "180 / 200 TPS (90% Throttled)",
    affectedWorkspacesCount: 32,
    linkedIncident: "INC-1039",
  },
  {
    id: "INT-UIDAI",
    provider: "UIDAI Aadhaar / DigiLocker",
    service: "Identity Verification",
    connectionState: "Connected",
    statusLevel: "healthy",
    lastSuccess: "2 min ago",
    lastFailure: "18 hours ago",
    webhookDeliveryPct: "99.90%",
    rateLimitUsage: "290 / 1,000 TPS (29%)",
    affectedWorkspacesCount: 0,
  },
];

export type SreAuditLog = {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  targetObject: string;
  beforeState: string;
  afterState: string;
};

export const sreAuditTrail: SreAuditLog[] = [
  {
    id: "AUD-9912",
    timestamp: "2026-09-26 12:35:12 UTC",
    actor: "Priyanka Rao [Eng Lead]",
    action: "Append Incident Mitigation Note",
    targetObject: "Incident: INC-1042",
    beforeState: "Mitigation: None recorded",
    afterState: "Mitigation: Coordinated with Customer Support for tenant token re-auth",
  },
  {
    id: "AUD-9911",
    timestamp: "2026-09-26 12:24:08 UTC",
    actor: "Arjun Mehta [Lead SRE]",
    action: "Link Probable Cause Release",
    targetObject: "Incident: INC-1042",
    beforeState: "Linked Release: None",
    afterState: "Linked Release: rel-2026-09-25-01 (WABA Bridge v3.4.1)",
  },
  {
    id: "AUD-9910",
    timestamp: "2026-09-26 12:15:40 UTC",
    actor: "Arjun Mehta [Lead SRE]",
    action: "Incident Status Transition",
    targetObject: "Incident: INC-1042",
    beforeState: "Status: Detected · Severity: P2",
    afterState: "Status: Investigating · Severity: P1-Critical",
  },
  {
    id: "AUD-9909",
    timestamp: "2026-09-26 12:12:00 UTC",
    actor: "System [Datadog Webhook]",
    action: "Automatic Incident Declaration",
    targetObject: "Incident: INC-1042",
    beforeState: "None",
    afterState: "Created: INC-1042 (Meta WABA elevated 5xx errors)",
  },
  {
    id: "AUD-9908",
    timestamp: "2026-09-26 11:30:22 UTC",
    actor: "CI/CD Pipeline #8841",
    action: "Production Deployment",
    targetObject: "Release: rel-2026-09-25-01",
    beforeState: "v3.4.0 in Production",
    afterState: "v3.4.1 deployed to Production",
  },
];

export function buildSreTelemetryTrend(rangeDays: TrendRangeDays) {
  if (rangeDays === 7) {
    return [
      { label: "Mon", p95Latency: 22, throughputRps: 1840, errorPct: 0.04 },
      { label: "Tue", p95Latency: 20, throughputRps: 1920, errorPct: 0.02 },
      { label: "Wed", p95Latency: 24, throughputRps: 2100, errorPct: 0.03 },
      { label: "Thu", p95Latency: 21, throughputRps: 2050, errorPct: 0.02 },
      { label: "Fri", p95Latency: 28, throughputRps: 2400, errorPct: 0.08 },
      { label: "Sat", p95Latency: 48, throughputRps: 1650, errorPct: 0.42 }, // Incident spike
      { label: "Sun", p95Latency: 34, throughputRps: 1720, errorPct: 0.18 },
    ];
  }
  if (rangeDays === 90) {
    return [
      { label: "W1", p95Latency: 21, throughputRps: 1600, errorPct: 0.03 },
      { label: "W3", p95Latency: 22, throughputRps: 1750, errorPct: 0.02 },
      { label: "W5", p95Latency: 20, throughputRps: 1850, errorPct: 0.02 },
      { label: "W7", p95Latency: 24, throughputRps: 1980, errorPct: 0.04 },
      { label: "W9", p95Latency: 26, throughputRps: 2100, errorPct: 0.05 },
      { label: "W11", p95Latency: 32, throughputRps: 2240, errorPct: 0.12 },
      { label: "W13", p95Latency: 30, throughputRps: 2310, errorPct: 0.09 },
    ];
  }
  return [
    { label: "D1", p95Latency: 20, throughputRps: 1750, errorPct: 0.02 },
    { label: "D5", p95Latency: 21, throughputRps: 1820, errorPct: 0.02 },
    { label: "D10", p95Latency: 19, throughputRps: 1900, errorPct: 0.02 },
    { label: "D15", p95Latency: 24, throughputRps: 2050, errorPct: 0.04 },
    { label: "D20", p95Latency: 22, throughputRps: 2120, errorPct: 0.03 },
    { label: "D25", p95Latency: 45, throughputRps: 2450, errorPct: 0.38 }, // Incident window
    { label: "D30", p95Latency: 28, throughputRps: 2200, errorPct: 0.12 },
  ];
}

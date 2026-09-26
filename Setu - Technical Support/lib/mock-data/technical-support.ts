import type { StatusLevel } from "@/components/shared/StatusBadge";

export type TrendRangeDays = 7 | 30 | 90;

export type TechnicalSupportKpiSnapshot = {
  platformUptime: { value: string; status: StatusLevel; note: string; trend: string };
  monitoredWorkspaces: { count: number; status: StatusLevel; healthy: number; degraded: number; attention: number };
  activeAlerts: { count: number; status: StatusLevel; note: string };
  diagnosticsExecuted: { count: number; status: StatusLevel; speed: string; trend: string };
  webhookHealth: { rate: string; status: StatusLevel; latency: string; sla: string };
  apiErrorRate: { rate: string; status: StatusLevel; note: string; trend: string };
  openIncidents: { count: number; status: StatusLevel; activeTitle: string; workspaces: number };
};

export const technicalSupportKpis: TechnicalSupportKpiSnapshot = {
  platformUptime: { value: "99.98%", status: "healthy", note: "18 services operational", trend: "+0.04%" },
  monitoredWorkspaces: { count: 5, status: "warning", healthy: 3, degraded: 1, attention: 1 },
  activeAlerts: { count: 2, status: "critical", note: "1 Token Expired · 1 Delay" },
  diagnosticsExecuted: { count: 142, status: "healthy", speed: "4.2ms", trend: "+18/wk" },
  webhookHealth: { rate: "98.6%", status: "healthy", latency: "48ms", sla: "99.4% SLA" },
  apiErrorRate: { rate: "0.14%", status: "healthy", note: "Within 0.50% budget", trend: "-0.08%" },
  openIncidents: { count: 1, status: "critical", activeTitle: "INC-1042 GST Proxy", workspaces: 48 },
};

export const rootCausesData = [
  { label: "OAuth & Token Expiry", value: 58, color: "#DC2626" },
  { label: "Upstream 504 Timeouts", value: 46, color: "#D97706" },
  { label: "Webhook HMAC Mismatch", value: 24, color: "#2563EB" },
  { label: "Tenant Config & TLS", value: 14, color: "#0891B2" },
];

export type PlatformService = {
  id: string;
  name: string;
  product: string;
  status: "Healthy" | "Degraded";
  statusLevel: StatusLevel;
  latency: string;
  errorRate: string;
  dependency: string;
  affectedCustomers: number;
};

export const platformServices: PlatformService[] = [
  {
    id: "svc-upi",
    name: "UPI Payment Rail & QR Bridge",
    product: "Pay with Sahayogi",
    status: "Healthy",
    statusLevel: "healthy",
    latency: "74ms",
    errorRate: "0.02%",
    dependency: "NPCI UPI, Razorpay Gateway",
    affectedCustomers: 0,
  },
  {
    id: "svc-waba",
    name: "WhatsApp Meta Egress Gateway",
    product: "Chat with Sahayogi",
    status: "Degraded",
    statusLevel: "critical",
    latency: "340ms",
    errorRate: "1.4%",
    dependency: "Meta Graph API v21.0",
    affectedCustomers: 4,
  },
  {
    id: "svc-tax",
    name: "Tax Engine & E-Way Bridge",
    product: "Tax Sahayogi",
    status: "Degraded",
    statusLevel: "critical",
    latency: "4200ms",
    errorRate: "18.6%",
    dependency: "NIC Public GST Portal (INC-1042)",
    affectedCustomers: 48,
  },
  {
    id: "svc-bbps",
    name: "BBPS Bill Payments Engine",
    product: "Pay with Sahayogi",
    status: "Healthy",
    statusLevel: "healthy",
    latency: "88ms",
    errorRate: "0.01%",
    dependency: "NPCI Bharat BillPay",
    affectedCustomers: 0,
  },
  {
    id: "svc-vault",
    name: "Encrypted Document Vault",
    product: "Document Storage",
    status: "Healthy",
    statusLevel: "healthy",
    latency: "95ms",
    errorRate: "0.01%",
    dependency: "AWS S3 KMS Encryption",
    affectedCustomers: 0,
  },
  {
    id: "svc-auth",
    name: "Sahayogi One Auth & Token",
    product: "Identity & SSO",
    status: "Healthy",
    statusLevel: "healthy",
    latency: "45ms",
    errorRate: "0.00%",
    dependency: "HashiCorp Vault, OIDC",
    affectedCustomers: 0,
  },
];

export type CustomerWorkspace = {
  id: string;
  name: string;
  orgName: string;
  plan: string;
  status: string;
  health: "Healthy" | "Degraded" | "Attention";
  healthLevel: StatusLevel;
  lastDiagnostic: string;
  apiSuccessRate: string;
  primaryService: string;
  openIncidents: number;
};

export const customerWorkspaces: CustomerWorkspace[] = [
  {
    id: "WS-94812",
    name: "Sharma Traders Operations",
    orgName: "Sharma Traders Pvt Ltd",
    plan: "Growth",
    status: "Active",
    health: "Degraded",
    healthLevel: "critical",
    lastDiagnostic: "12 min ago",
    apiSuccessRate: "88.4%",
    primaryService: "Chat with Sahayogi (WABA)",
    openIncidents: 1,
  },
  {
    id: "WS-51928",
    name: "Bharat Agro Primary",
    orgName: "Bharat Agro Exporters Ltd",
    plan: "Starter",
    status: "Active",
    health: "Healthy",
    healthLevel: "healthy",
    lastDiagnostic: "1 hour ago",
    apiSuccessRate: "99.8%",
    primaryService: "Pay with Sahayogi (Razorpay)",
    openIncidents: 0,
  },
  {
    id: "WS-64019",
    name: "QuickPay Retail Network",
    orgName: "QuickPay Solutions Ltd",
    plan: "Enterprise",
    status: "Active",
    health: "Attention",
    healthLevel: "warning",
    lastDiagnostic: "25 min ago",
    apiSuccessRate: "94.2%",
    primaryService: "WhatsApp Cloud Inbound",
    openIncidents: 1,
  },
  {
    id: "WS-29108",
    name: "Hind Auto Spares Hub",
    orgName: "Hind Automotive Ltd",
    plan: "Enterprise",
    status: "Active",
    health: "Healthy",
    healthLevel: "healthy",
    lastDiagnostic: "2 hours ago",
    apiSuccessRate: "99.9%",
    primaryService: "Sahayogi One SSO",
    openIncidents: 0,
  },
  {
    id: "WS-18290",
    name: "Vaidya Herbal Remedies",
    orgName: "Vaidya Ayurveda Pvt Ltd",
    plan: "Starter",
    status: "Active",
    health: "Healthy",
    healthLevel: "healthy",
    lastDiagnostic: "3 hours ago",
    apiSuccessRate: "99.4%",
    primaryService: "Document Storage Vault",
    openIncidents: 0,
  },
];

export type PlatformIncident = {
  id: string;
  title: string;
  severity: string;
  status: "Investigating" | "Mitigating" | "Resolved";
  statusLevel: StatusLevel;
  affectedService: string;
  workspaceCount: number;
  firstSeen: string;
  commander: string;
  supportGuidance: string;
};

export const platformIncidents: PlatformIncident[] = [
  {
    id: "INC-1042",
    title: "GST Portal Gateway Latency & Upstream 504 Timeouts",
    severity: "P2 - High",
    status: "Investigating",
    statusLevel: "critical",
    affectedService: "Tax Calculation Engine & E-Way Bridge",
    workspaceCount: 48,
    firstSeen: "Today, 10:15 AM",
    commander: "Kabir S. (Staff SRE)",
    supportGuidance:
      "NIC upstream server returning intermittent 504s. Retries are queued with exponential backoff and jitter. Advise merchants webhooks will arrive with delay.",
  },
  {
    id: "INC-1038",
    title: "Payment Provider Callback Webhook Latency Spike",
    severity: "P3 - Moderate",
    status: "Resolved",
    statusLevel: "healthy",
    affectedService: "Payment Webhook & UPI Bridge",
    workspaceCount: 14,
    firstSeen: "Yesterday, 4:30 PM",
    commander: "Dev M. (Platform Ops Lead)",
    supportGuidance:
      "Consumer replicas scaled from 4 to 12. Queue fully drained and normalized at 64ms delivery latency.",
  },
];

export type DiagnosticLog = {
  id: string;
  timestamp: string;
  targetWorkspace: string;
  diagnosticType: string;
  status: "passed" | "failed" | "warning";
  statusLevel: StatusLevel;
  durationMs: number;
  summary: string;
};

export const recentDiagnosticLogs: DiagnosticLog[] = [
  {
    id: "DIAG-8819",
    timestamp: "10:48 AM",
    targetWorkspace: "WS-94812 (Sharma Traders)",
    diagnosticType: "Webhook Ping",
    status: "failed",
    statusLevel: "critical",
    durationMs: 420,
    summary: "HMAC signature mismatch on /webhooks/meta-waba endpoint (Code 190 token expired)",
  },
  {
    id: "DIAG-8818",
    timestamp: "10:15 AM",
    targetWorkspace: "WS-51928 (Bharat Agro)",
    diagnosticType: "Payload Trace",
    status: "passed",
    statusLevel: "healthy",
    durationMs: 84,
    summary: "Order #81920 callback verified against Razorpay gateway",
  },
  {
    id: "DIAG-8817",
    timestamp: "09:40 AM",
    targetWorkspace: "WS-64019 (QuickPay Retail)",
    diagnosticType: "SSL Verification",
    status: "warning",
    statusLevel: "warning",
    durationMs: 195,
    summary: "Client TLS certificate expires in 6 days (Let's Encrypt R3)",
  },
  {
    id: "DIAG-8816",
    timestamp: "Yesterday, 4:40 PM",
    targetWorkspace: "WS-29108 (Hind Auto)",
    diagnosticType: "Database Connection",
    status: "passed",
    statusLevel: "healthy",
    durationMs: 38,
    summary: "Tenant replica read-pool latency 1.8ms, pool utilization 14%",
  },
  {
    id: "DIAG-8815",
    timestamp: "Yesterday, 11:25 AM",
    targetWorkspace: "All Monitored Workspaces",
    diagnosticType: "Integration Health",
    status: "passed",
    statusLevel: "healthy",
    durationMs: 650,
    summary: "Routine platform health check across 18 assigned workspaces",
  },
];

export function buildTelemetryTrend(rangeDays: TrendRangeDays) {
  if (rangeDays === 7) {
    return [
      { label: "Mon", probes: 22, webhooks: 24 },
      { label: "Tue", probes: 28, webhooks: 28 },
      { label: "Wed", probes: 25, webhooks: 27 },
      { label: "Thu", probes: 34, webhooks: 33 },
      { label: "Fri", probes: 38, webhooks: 35 },
      { label: "Sat", probes: 19, webhooks: 18 },
      { label: "Sun", probes: 24, webhooks: 22 },
    ];
  }
  if (rangeDays === 90) {
    return [
      { label: "W1", probes: 85, webhooks: 84 },
      { label: "W3", probes: 96, webhooks: 96 },
      { label: "W5", probes: 110, webhooks: 106 },
      { label: "W7", probes: 128, webhooks: 122 },
      { label: "W9", probes: 142, webhooks: 138 },
      { label: "W11", probes: 156, webhooks: 148 },
      { label: "W13", probes: 168, webhooks: 162 },
    ];
  }
  return [
    { label: "Jan", probes: 68, webhooks: 62 },
    { label: "Feb", probes: 82, webhooks: 68 },
    { label: "Mar", probes: 76, webhooks: 78 },
    { label: "Apr", probes: 95, webhooks: 84 },
    { label: "May", probes: 110, webhooks: 96 },
    { label: "Jun", probes: 104, webhooks: 92 },
    { label: "Jul", probes: 125, webhooks: 104 },
    { label: "Aug", probes: 142, webhooks: 116 },
    { label: "Sep", probes: 138, webhooks: 108 },
    { label: "Oct", probes: 156, webhooks: 124 },
    { label: "Nov", probes: 149, webhooks: 121 },
    { label: "Dec", probes: 168, webhooks: 134 },
  ];
}

export function getTelemetryStats(rangeDays: TrendRangeDays) {
  if (rangeDays === 7) {
    return [
      { label: "Avg Latency", value: "3.8ms" },
      { label: "Success Rate", value: "99.4%" },
      { label: "Retries Queued", value: "14" },
    ];
  }
  if (rangeDays === 90) {
    return [
      { label: "Avg Latency", value: "4.5ms" },
      { label: "Success Rate", value: "98.9%" },
      { label: "Retries Queued", value: "56" },
    ];
  }
  return [
    { label: "Avg Latency", value: "4.2ms" },
    { label: "Success Rate", value: "99.1%" },
    { label: "Retries Queued", value: "38" },
  ];
}

export type ServiceRadarTile = {
  id: string;
  label: string;
  status: StatusLevel;
  cause: string;
  href: string;
};

export const serviceRadarTiles: ServiceRadarTile[] = [
  { id: "upi", label: "UPI Payment Switch", status: "healthy", cause: "p95 18ms · 0.01% error · NPCI Core", href: "/technical-support/health" },
  { id: "bbps", label: "BBPS Bill Rail", status: "healthy", cause: "p95 24ms · 0.02% error · Bharat BillPay", href: "/technical-support/health" },
  { id: "waba", label: "WhatsApp Gateway", status: "critical", cause: "p95 840ms · 401 token expired (WS-94812)", href: "/technical-support/integrations" },
  { id: "gstn", label: "GSTN Ingestion & E-Way", status: "healthy", cause: "p95 42ms · 0.00% error · NIC Portal", href: "/technical-support/health" },
  { id: "kyc", label: "KYC & DigiLocker", status: "healthy", cause: "p95 36ms · 0.01% error · UIDAI / NSDL", href: "/technical-support/health" },
  { id: "fasttag", label: "FastTag NETC Transit", status: "healthy", cause: "p95 29ms · 0.03% error · NETC Switch", href: "/technical-support/health" },
  { id: "imps", label: "IMPS / Account Verify", status: "healthy", cause: "p95 55ms · 0.01% error · IMPS Switch", href: "/technical-support/health" },
  { id: "webhooks", label: "Webhook Dispatch", status: "healthy", cause: "p95 12ms · 99.98% delivery · Kafka", href: "/technical-support/integrations" },
  { id: "sms", label: "SMS & OTP Gateway", status: "warning", cause: "p95 320ms · 2.1% carrier latency spike", href: "/technical-support/health" },
];

export const topBlockers = [
  { id: "b1", label: "Meta WABA HMAC token expiry (401 Unauthorized)", workspace: "WS-94812 · Sharma Traders", impact: "Outbound customer broadcasts failing", severity: "critical" as StatusLevel, badge: "P1 Blocker" },
  { id: "b2", label: "Razorpay Webhook signature drift (Webhook timeout)", workspace: "WS-10842 · Bharat Agro", impact: "Delayed payment confirmations (1,200ms)", severity: "warning" as StatusLevel, badge: "P2 Degraded" },
  { id: "b3", label: "UIDAI OTP carrier gateway throttling", workspace: "Fleet-wide (5 tenants)", impact: "DigiLocker auth retries elevated", severity: "warning" as StatusLevel, badge: "P3 Monitoring" },
];


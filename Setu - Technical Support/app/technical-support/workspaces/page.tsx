"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  Stethoscope,
  RefreshCw,
  SlidersHorizontal,
  AlertCircle,
  CheckCircle2,
  Building2,
  Package,
  Layers,
  Flame,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Lock,
  Settings,
  Key,
  Box,
  ShieldAlert,
  Users,
  User,
  Radio,
  Activity,
  Terminal,
  FileCode,
  FileText,
  Play,
  MoreVertical,
  X,
  Send,
  Clock,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import ProductIcon from "@/components/shared/ProductIcon";
import IntegrationIcon from "@/components/shared/IntegrationIcon";
import FilterDropdown, { FilterDropdownOption } from "@/components/shared/FilterDropdown";
import { customerWorkspaces } from "@/lib/mock-data/technical-support";

// ─────────────────────────────────────────────────────────────────────────────
// Types & Mock Data for Workspace 360
// ─────────────────────────────────────────────────────────────────────────────

type TabType =
  | "integrations"
  | "matrix"
  | "traces"
  | "incidents"
  | "users"
  | "subscriptions"
  | "health"
  | "audit";

interface WorkspaceIntegrationRow {
  id: string;
  integrationName: string;
  integrationSubtitle: string;
  integrationSlug: string;
  productName: string;
  environment: "Production" | "Sandbox" | "Staging";
  status: "Active" | "401 HMAC Failed" | "Token Expired" | "Degraded";
  statusType: "healthy" | "critical" | "warning";
  lastCheck: string;
}

const WORKSPACE_INTEGRATIONS: WorkspaceIntegrationRow[] = [
  {
    id: "int-1",
    integrationName: "Meta WhatsApp (WABA)",
    integrationSubtitle: "Webhook Delivery",
    integrationSlug: "meta-waba",
    productName: "Chat with Sahayogi",
    environment: "Production",
    status: "401 HMAC Failed",
    statusType: "critical",
    lastCheck: "2 mins ago",
  },
  {
    id: "int-2",
    integrationName: "Razorpay",
    integrationSubtitle: "Payments Callback",
    integrationSlug: "razorpay",
    productName: "BoSS",
    environment: "Production",
    status: "Active",
    statusType: "healthy",
    lastCheck: "12 mins ago",
  },
  {
    id: "int-3",
    integrationName: "Tally on Cloud",
    integrationSubtitle: "Application Sync",
    integrationSlug: "tally",
    productName: "Sahayogi Cloud",
    environment: "Production",
    status: "Active",
    statusType: "healthy",
    lastCheck: "18 mins ago",
  },
  {
    id: "int-4",
    integrationName: "Microsoft 365",
    integrationSubtitle: "Email & Calendar",
    integrationSlug: "microsoft-365",
    productName: "Sahayogi One",
    environment: "Production",
    status: "Token Expired",
    statusType: "critical",
    lastCheck: "1 hour ago",
  },
  {
    id: "int-5",
    integrationName: "Income Tax API",
    integrationSubtitle: "Filing & Validation",
    integrationSlug: "income-tax-api",
    productName: "Tax Sahayogi",
    environment: "Sandbox",
    status: "Active",
    statusType: "healthy",
    lastCheck: "2 hours ago",
  },
];

interface WorkspaceTrace {
  id: string;
  timestamp: string;
  traceId: string;
  product: string;
  service: string;
  endpoint: string;
  status: number;
  latencyMs: number;
  incidentId?: string;
  method: string;
  requestPayload: string;
  responsePayload: string;
}

const WORKSPACE_TRACES: WorkspaceTrace[] = [
  {
    id: "trc-1",
    timestamp: "14:24:18",
    traceId: "trc_94812_01j8m4k",
    product: "Chat with Sahayogi",
    service: "WhatsApp Integration",
    endpoint: "/v2/whatsapp/messages/webhook",
    status: 401,
    latencyMs: 342,
    incidentId: "INC-10291",
    method: "POST",
    requestPayload: JSON.stringify({ object: "whatsapp_business_account", entry: [{ id: "waba_77192", changes: [{ field: "messages" }] }] }, null, 2),
    responsePayload: JSON.stringify({ error: { message: "Invalid OAuth access token or HMAC secret signature mismatch.", type: "OAuthException", code: 190, error_subcode: 463 } }, null, 2),
  },
  {
    id: "trc-2",
    timestamp: "14:22:05",
    traceId: "trc_94812_01j8m1n",
    product: "Chat with Sahayogi",
    service: "WhatsApp Integration",
    endpoint: "/v2/whatsapp/messages/webhook",
    status: 401,
    latencyMs: 310,
    incidentId: "INC-10291",
    method: "POST",
    requestPayload: JSON.stringify({ object: "whatsapp_business_account", entry: [{ id: "waba_77192" }] }, null, 2),
    responsePayload: JSON.stringify({ error: { message: "Signature verification failed", code: 401 } }, null, 2),
  },
  {
    id: "trc-3",
    timestamp: "14:18:42",
    traceId: "trc_94812_01j8h9a",
    product: "BoSS",
    service: "Payments Reconciliation",
    endpoint: "/v1/payments/razorpay/webhook",
    status: 200,
    latencyMs: 44,
    method: "POST",
    requestPayload: JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: "pay_Pk19a28", amount: 1450000, status: "captured" } } } }, null, 2),
    responsePayload: JSON.stringify({ success: true, processed_at: "2026-09-30T14:18:42.102Z", case_updated: "CASE-49102" }, null, 2),
  },
  {
    id: "trc-4",
    timestamp: "14:15:30",
    traceId: "trc_94812_01j8g3e",
    product: "Sahayogi Cloud",
    service: "Tally Sync Agent",
    endpoint: "/api/v1/sync/tally/transactions",
    status: 200,
    latencyMs: 118,
    method: "GET",
    requestPayload: JSON.stringify({ company_id: "SHARMA_TRADERS_DELHI", ledger_count: 84 }, null, 2),
    responsePayload: JSON.stringify({ sync_status: "NOMINAL", synced_vouchers: 142, p95_ms: 118 }, null, 2),
  },
  {
    id: "trc-5",
    timestamp: "13:58:12",
    traceId: "trc_94812_01j8f2k",
    product: "Sahayogi One",
    service: "Identity & Governance",
    endpoint: "/v1.0/users/delta",
    status: 401,
    latencyMs: 495,
    method: "GET",
    requestPayload: JSON.stringify({ tenant_id: "sharmatraders.in", scope: "User.Read.All" }, null, 2),
    responsePayload: JSON.stringify({ error: "InvalidAuthenticationToken", message: "Access token has expired or is not yet valid." }, null, 2),
  },
  {
    id: "trc-6",
    timestamp: "13:20:04",
    traceId: "trc_94812_01j8b8p",
    product: "Tax Sahayogi",
    service: "GST Ingestion & E-Way",
    endpoint: "/v1/tax/gst/verify",
    status: 200,
    latencyMs: 82,
    method: "POST",
    requestPayload: JSON.stringify({ gstin: "07AAAAA0000A1Z5", financial_year: "2026-27" }, null, 2),
    responsePayload: JSON.stringify({ valid: true, filing_status: "FILED", portal_ack: "ARN-8491028" }, null, 2),
  },
];

interface ProductMatrixRow {
  product: string;
  plan: string;
  environment: "Production" | "Sandbox";
  status: "Active" | "Degraded" | "Attention" | "Inactive";
  lastActivity: string;
  usage: string;
}

const ALL_9_SAHAYOGI_PRODUCTS: ProductMatrixRow[] = [
  {
    product: "Office Sahayogi",
    plan: "Enterprise Core",
    environment: "Production",
    status: "Active",
    lastActivity: "5 mins ago",
    usage: "148 Active Users",
  },
  {
    product: "BoSS",
    plan: "Professional SLA",
    environment: "Production",
    status: "Active",
    lastActivity: "12 mins ago",
    usage: "1,240 Cases Handled",
  },
  {
    product: "Sahayogi Cloud",
    plan: "Business VPS (4 vCPU)",
    environment: "Production",
    status: "Active",
    lastActivity: "18 mins ago",
    usage: "4 Instances · 99.98% Uptime",
  },
  {
    product: "Chat with Sahayogi",
    plan: "Growth Tier (100k msgs)",
    environment: "Production",
    status: "Degraded",
    lastActivity: "2 mins ago",
    usage: "88.4% Delivery · 401 HMAC Auth Issue",
  },
  {
    product: "Investor Sahayogi",
    plan: "Institutional Statement Feed",
    environment: "Production",
    status: "Active",
    lastActivity: "45 mins ago",
    usage: "CAMS / KFintech Connected",
  },
  {
    product: "Tax Sahayogi",
    plan: "GST Multi-Entity (12 GSTINs)",
    environment: "Sandbox",
    status: "Active",
    lastActivity: "2 hours ago",
    usage: "Auto-reconciliation Active",
  },
  {
    product: "Sahayogi One",
    plan: "Identity & Governance",
    environment: "Production",
    status: "Attention",
    lastActivity: "1 hour ago",
    usage: "M365 OAuth Token Expired",
  },
  {
    product: "My Sahayogi",
    plan: "Employee Portal Standard",
    environment: "Production",
    status: "Active",
    lastActivity: "3 hours ago",
    usage: "Self-Service Portal Nominal",
  },
  {
    product: "Studio Sahayogi",
    plan: "AI Creative Suite",
    environment: "Production",
    status: "Active",
    lastActivity: "Yesterday",
    usage: "Marketing Asset Generation",
  },
];

interface WorkspaceUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: string;
  access: string;
  lastActive: string;
  mfa: string;
  status: "Active" | "Suspended" | "Pending";
}

const WORKSPACE_USERS: WorkspaceUser[] = [
  {
    id: "usr-1",
    name: "Rajesh Sharma",
    email: "rajesh@sharmatraders.in",
    initials: "RS",
    role: "Tenant Owner / Administrator",
    access: "Full Management Access",
    lastActive: "10 mins ago",
    mfa: "Enforced (FIDO2 Hardware Key)",
    status: "Active",
  },
  {
    id: "usr-2",
    name: "Anita Desai",
    email: "anita.desai@sharmatraders.in",
    initials: "AD",
    role: "Operations Lead",
    access: "Operator (Maker-Checker)",
    lastActive: "35 mins ago",
    mfa: "Enforced (Authenticator App)",
    status: "Active",
  },
  {
    id: "usr-3",
    name: "Vikram Patel",
    email: "vikram@sharmatraders.in",
    initials: "VP",
    role: "Finance & Accounts",
    access: "Billing, Ledger & Settlement",
    lastActive: "2 hours ago",
    mfa: "Enforced (SMS / OTP)",
    status: "Active",
  },
  {
    id: "usr-4",
    name: "Support Escort (Dhruv Singla)",
    email: "dhruv.singla@setu.co",
    initials: "DS",
    role: "Setu SRE Diagnostic Observer",
    access: "Read-only Telemetry & Probes",
    lastActive: "Active Now",
    mfa: "Enforced (Setu SSO SAML)",
    status: "Active",
  },
];

interface WorkspaceSubscription {
  product: string;
  plan: string;
  status: "Active" | "Degraded" | "Pending Renewal";
  started: string;
  renewal: string;
  entitlements: string;
}

const WORKSPACE_SUBSCRIPTIONS: WorkspaceSubscription[] = [
  {
    product: "Chat with Sahayogi",
    plan: "Growth",
    status: "Active",
    started: "01 Jan 2026",
    renewal: "31 Dec 2026",
    entitlements: "100K Outbound Messages/mo · 10 WhatsApp Agents · 4h SLA",
  },
  {
    product: "Sahayogi Cloud",
    plan: "Business",
    status: "Active",
    started: "15 Feb 2026",
    renewal: "14 Feb 2027",
    entitlements: "4 vCPU · 16 GB ECC RAM · 250 GB NVMe · Daily Automated Backups",
  },
  {
    product: "BoSS",
    plan: "Professional",
    status: "Active",
    started: "01 Jan 2026",
    renewal: "31 Dec 2026",
    entitlements: "Unlimited Omnichannel Cases · Priority Routing · 1h First Response SLA",
  },
  {
    product: "Tax Sahayogi",
    plan: "Multi-Entity",
    status: "Active",
    started: "01 Apr 2026",
    renewal: "31 Mar 2027",
    entitlements: "12 GSTIN Support · Automated GSTR-1 / 3B Reconciliations",
  },
  {
    product: "Sahayogi One",
    plan: "Enterprise Governance",
    status: "Active",
    started: "01 Jan 2026",
    renewal: "31 Dec 2026",
    entitlements: "Unified IAM · Directory Sync · Cross-Product Audit Logging",
  },
];

interface WorkspaceAuditEvent {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  actor: string;
  actorRole: string;
  status: "Success" | "Failed" | "Blocked";
  traceId?: string;
}

const WORKSPACE_AUDIT_EVENTS: WorkspaceAuditEvent[] = [
  {
    id: "aud-1",
    time: "14:26:10 (2 mins ago)",
    title: "Integration credential revalidated",
    subtitle: "Meta WABA Webhook Token (v2)",
    actor: "Dhruv Singla",
    actorRole: "Setu SRE Engineer",
    status: "Success",
    traceId: "trc_94812_01j8m4k",
  },
  {
    id: "aud-2",
    time: "14:24:03 (4 mins ago)",
    title: "User role updated",
    subtitle: "Anita Desai promoted to Operations Lead (Maker-Checker)",
    actor: "Rajesh Sharma",
    actorRole: "Tenant Owner",
    status: "Success",
    traceId: "trc_94812_01j8m1n",
  },
  {
    id: "aud-3",
    time: "14:19:45 (8 mins ago)",
    title: "VM provisioned",
    subtitle: "VPS Instance (srv-7812) scaled to 4 vCPU",
    actor: "Automated Orchestrator",
    actorRole: "System Bot",
    status: "Success",
    traceId: "trc_94812_01j8g3e",
  },
  {
    id: "aud-4",
    time: "13:58:20 (30 mins ago)",
    title: "Login failed",
    subtitle: "3 invalid OTP attempts from IP 194.26.29.112",
    actor: "Unknown External Client",
    actorRole: "WAF Filtered",
    status: "Blocked",
  },
  {
    id: "aud-5",
    time: "12:40:15 (2 hours ago)",
    title: "Workspace membership added",
    subtitle: "Added Vikram Patel (Finance & Accounts)",
    actor: "Rajesh Sharma",
    actorRole: "Tenant Owner",
    status: "Success",
  },
  {
    id: "aud-6",
    time: "11:15:30 (3 hours ago)",
    title: "Subscription plan changed",
    subtitle: "Chat with Sahayogi upgraded: Starter → Growth",
    actor: "Billing Admin",
    actorRole: "Automated Billing",
    status: "Success",
  },
  {
    id: "aud-7",
    time: "09:30:00 (5 hours ago)",
    title: "Webhook endpoint configuration updated",
    subtitle: "URL set to https://api.sharmatraders.in/webhooks/setu",
    actor: "Rajesh Sharma",
    actorRole: "Tenant Owner",
    status: "Success",
  },
];

export default function Workspace360Page() {
  const [selectedTenantId, setSelectedTenantId] = useState("WS-94812");
  const [activeTab, setActiveTab] = useState<TabType>("integrations");

  // Search & Filter bar states (matching Technical Logs)
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProduct, setFilterProduct] = useState("all");
  const [filterService, setFilterService] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterEnv, setFilterEnv] = useState("all");
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  // Probe execution state
  const [isProbing, setIsProbing] = useState(false);
  const [probeResult, setProbeResult] = useState<{
    open: boolean;
    pingOk: boolean;
    hmacOk: boolean;
    tokenOk: boolean;
  } | null>(null);

  // Action feedback toasts
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Selected Trace for Inspector
  const [selectedTrace, setSelectedTrace] = useState<WorkspaceTrace | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Tenant dropdown options
  const tenantOptions: FilterDropdownOption[] = useMemo(() => {
    return customerWorkspaces.map((w) => ({
      value: w.id,
      label: `${w.name} (${w.id})`,
      sub: `${w.orgName} · ${w.primaryService}`,
    }));
  }, []);

  const currentWorkspace =
    customerWorkspaces.find((w) => w.id === selectedTenantId) || customerWorkspaces[0];

  // Filter dropdown options (matching Technical Logs exactly)
  const productOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Products" },
    { value: "chat-with-sahayogi", label: "Chat with Sahayogi" },
    { value: "boss", label: "BoSS" },
    { value: "sahayogi-cloud", label: "Sahayogi Cloud" },
    { value: "office-sahayogi", label: "Office Sahayogi" },
    { value: "tax-sahayogi", label: "Tax Sahayogi" },
    { value: "sahayogi-one", label: "Sahayogi One" },
  ];

  const serviceOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Services" },
    { value: "whatsapp", label: "WhatsApp Integration (WABA)" },
    { value: "payments", label: "Payments Callback (Razorpay)" },
    { value: "tally", label: "Tally on Cloud Sync" },
    { value: "identity", label: "Identity & Access (M365)" },
    { value: "tax", label: "Income Tax Department API" },
  ];

  const statusOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Statuses" },
    { value: "active", label: "Active / 200 OK" },
    { value: "degraded", label: "Degraded / 401 HMAC Failed" },
    { value: "expired", label: "Token Expired" },
  ];

  const envOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Environments" },
    { value: "production", label: "Production" },
    { value: "sandbox", label: "Sandbox" },
  ];

  // Trigger Run Probe
  const handleRunProbe = () => {
    setIsProbing(true);
    setTimeout(() => {
      setIsProbing(false);
      setProbeResult({
        open: true,
        pingOk: true,
        hmacOk: false,
        tokenOk: false,
      });
    }, 1200);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Filtered integrations
  const filteredIntegrations = useMemo(() => {
    return WORKSPACE_INTEGRATIONS.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.integrationName.toLowerCase().includes(q) ||
          item.productName.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q) ||
          item.environment.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (filterStatus === "active" && item.status !== "Active") return false;
      if (filterStatus === "degraded" && !item.status.includes("401")) return false;
      if (filterStatus === "expired" && !item.status.includes("Expired")) return false;
      if (filterEnv === "production" && item.environment !== "Production") return false;
      if (filterEnv === "sandbox" && item.environment !== "Sandbox") return false;
      return true;
    });
  }, [searchQuery, filterStatus, filterEnv]);

  return (
    <div className="flex flex-col min-h-full text-[var(--text-heading)] -mt-2 -mx-1 sm:-mx-2 pb-16 screen-sm:pb-8">
      {/* ─────────────────────────────────────────────────────────────────
          TOAST FEEDBACK
      ────────────────────────────────────────────────────────────────── */}
      {toastMsg && (
        <div className="fixed top-18 right-6 z-50 flex items-center gap-2 rounded-xl border border-[var(--sidebar-active)]/30 bg-[var(--surface)] px-4 py-2.5 text-xs font-semibold text-[var(--text-heading)] shadow-lg animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          HEADER SECTION (Breadcrumb, Title, Subtitle, Tenant Selector)
      ────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 py-1.5 px-1 sm:px-2 mb-2">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[var(--text-muted)] font-normal">Workspaces</span>
          <span className="text-[var(--text-muted)]/60 font-light">&gt;</span>
          <span className="font-bold text-[var(--text-heading)]">Workspace 360</span>
        </div>

        {/* Title + Subtitle + Right Tenant Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mt-0.5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-heading)]">
              Workspace 360 Dossier
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Unified tenant telemetry, credentials validation, and progressive diagnostic state
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <FilterDropdown
              label="Tenant:"
              value={selectedTenantId}
              onChange={setSelectedTenantId}
              options={tenantOptions}
              title="Select Customer Tenant"
              placeholder="Select Workspace"
              searchable
              searchPlaceholder="Search tenant by name or WS-id..."
              align="right"
              className="font-semibold text-xs"
            />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          KPI SECTION (EXACT SAME KPI CARD STYLE AND DIMENSIONS AS TECHNICAL LOGS)
      ────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 screen-sm:grid-cols-3 screen-lg:grid-cols-6 lg:grid-cols-6 gap-2 sm:gap-2.5 lg:gap-3 px-1 sm:px-2 mb-3">
        {/* Card 1: Total Events */}
        <div
          className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Total Events</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--text-heading)] leading-none">
              12.4K
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-up-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-up-fg)]">
              &uarr; 12%
            </span>
          </div>
        </div>

        {/* Card 2: Errors */}
        <div
          className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Errors</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--kpi-bad)] leading-none">
              342
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-down-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-down-fg)]">
              &darr; 8%
            </span>
          </div>
        </div>

        {/* Card 3: 4xx (Client) */}
        <div
          className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">4xx (Client)</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--kpi-bad)] leading-none">
              255
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-down-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-down-fg)]">
              &darr; 5%
            </span>
          </div>
        </div>

        {/* Card 4: 5xx (Server) */}
        <div
          className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">5xx (Server)</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--kpi-bad)] leading-none">
              87
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-up-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-up-fg)]">
              &darr; 22%
            </span>
          </div>
        </div>

        {/* Card 5: P95 Latency */}
        <div
          className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">P95 Latency</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--kpi-good)] leading-none">
              1.2 s
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-up-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-up-fg)]">
              &uarr; 18%
            </span>
          </div>
        </div>

        {/* Card 6: Active Incidents */}
        <button
          type="button"
          onClick={() => setActiveTab("incidents")}
          className="group flex flex-col justify-between bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3 transition-all hover:border-[var(--icon-btn-navy)] cursor-pointer text-left"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Active Incidents</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--status-critical-fg)] leading-none">
              3
            </span>
            <span className="text-[var(--text-muted)] group-hover:text-[var(--icon-btn-navy)] group-hover:translate-x-1 transition-all text-sm font-bold">
              &rarr;
            </span>
          </div>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          SEARCH + FILTER BAR (EXACT SAME AS TECHNICAL LOGS)
      ────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 px-1 sm:px-2 mb-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={13}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--search-placeholder)]"
          />
          <input
            type="text"
            placeholder="Search by trace ID, workspace, endpoint, error code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[var(--divider)] bg-[var(--surface)] py-1.5 sm:py-2 pl-9 pr-3 text-xs text-[var(--text-heading)] placeholder:text-[var(--search-placeholder)] shadow-xs outline-none focus:border-[var(--sidebar-active)]"
          />
        </div>

        {/* Filter Controls Cluster */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <FilterDropdown
            value={filterProduct}
            onChange={setFilterProduct}
            options={productOptions}
            placeholder="All Products"
            title="Filter by Product"
            searchable
            searchPlaceholder="Search product..."
            showClear
          />

          <FilterDropdown
            value={filterService}
            onChange={setFilterService}
            options={serviceOptions}
            placeholder="All Services"
            title="Filter by Service"
            searchable
            searchPlaceholder="Search service..."
            showClear
          />

          <FilterDropdown
            value={filterStatus}
            onChange={setFilterStatus}
            options={statusOptions}
            placeholder="All Statuses"
            title="Filter by Status"
            showClear
          />

          <FilterDropdown
            value={filterEnv}
            onChange={setFilterEnv}
            options={envOptions}
            placeholder="All Environments"
            title="Filter by Environment"
            showClear
          />

          <button
            type="button"
            onClick={() => setMoreFiltersOpen(!moreFiltersOpen)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)] px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:border-[var(--icon-btn-navy)] shadow-xs transition-colors cursor-pointer"
          >
            <SlidersHorizontal size={13} />
            <span>More filters</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          WORKSPACE HEADER CARD (WIDE SUMMARY CARD)
      ────────────────────────────────────────────────────────────────── */}
      <div className="px-1 sm:px-2 mb-3">
        <div
          className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          {/* Left: Avatar + Details */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100/70 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-900/60 text-[#0058DD] dark:text-blue-400 font-bold text-base tracking-tight shadow-2xs select-none">
              SH
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-[var(--text-heading)]">
                  {currentWorkspace.name}
                </h2>
                <span className="font-mono rounded bg-[var(--search-bg)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--text-muted)] border border-[var(--divider)]/40">
                  {currentWorkspace.id}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/50 px-2 py-0.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                  Degraded
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {currentWorkspace.orgName} · Plan: {currentWorkspace.plan}
              </p>
            </div>
          </div>

          {/* Right: Telemetry & Probe Button */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
            <div className="border-l border-[var(--divider)] pl-4">
              <span className="text-[var(--text-muted)] block text-[11px]">Primary Rail</span>
              <strong className="text-[var(--text-heading)] font-semibold text-xs">
                {currentWorkspace.primaryService}
              </strong>
            </div>

            <div className="border-l border-[var(--divider)] pl-4">
              <span className="text-[var(--text-muted)] block text-[11px]">API Success</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs">
                {currentWorkspace.apiSuccessRate}
              </strong>
            </div>

            <div className="border-l border-[var(--divider)] pl-4">
              <span className="text-[var(--text-muted)] block text-[11px]">Open Alerts</span>
              <strong className="text-rose-600 dark:text-rose-400 font-mono font-bold text-xs">
                {currentWorkspace.openIncidents} Incident
              </strong>
            </div>

            <div className="border-l border-[var(--divider)] pl-4">
              <button
                type="button"
                onClick={handleRunProbe}
                disabled={isProbing}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#002244] hover:bg-[#001730] text-white px-3.5 py-2 font-semibold text-xs shadow-xs transition-all cursor-pointer hover:shadow-sm disabled:opacity-75"
              >
                <Stethoscope size={13} className={isProbing ? "animate-spin" : ""} />
                <span>{isProbing ? "Probing..." : "Run Probe"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          WORKSPACE TABS BAR (8 TABS WITH REFINED UNDERLINE ACTIVE STYLE)
      ────────────────────────────────────────────────────────────────── */}
      <div className="px-1 sm:px-2 border-b border-[var(--divider)] mb-3 overflow-x-auto scrollbar-none">
        <div className="flex gap-6 text-xs sm:text-sm font-medium min-w-max">
          <button
            type="button"
            onClick={() => setActiveTab("integrations")}
            className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
              activeTab === "integrations"
                ? "border-[#0058DD] font-bold text-[#0058DD] dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            Integrations &amp; Credentials
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("matrix")}
            className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
              activeTab === "matrix"
                ? "border-[#0058DD] font-bold text-[#0058DD] dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            Product Matrix
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("traces")}
            className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
              activeTab === "traces"
                ? "border-[#0058DD] font-bold text-[#0058DD] dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            Diagnostic Traces
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("incidents")}
            className={`pb-2.5 transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "incidents"
                ? "border-[#0058DD] font-bold text-[#0058DD] dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <span>Active Incidents</span>
            <span className="rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 text-[10px] font-bold px-1.5 py-0.2">
              1
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
              activeTab === "users"
                ? "border-[#0058DD] font-bold text-[#0058DD] dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            Users &amp; Access
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("subscriptions")}
            className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
              activeTab === "subscriptions"
                ? "border-[#0058DD] font-bold text-[#0058DD] dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            Subscriptions
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("health")}
            className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
              activeTab === "health"
                ? "border-[#0058DD] font-bold text-[#0058DD] dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            Health
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
              activeTab === "audit"
                ? "border-[#0058DD] font-bold text-[#0058DD] dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            Audit Trail
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          TAB 1: INTEGRATIONS & CREDENTIALS (MAIN 2-COLUMN LAYOUT)
      ────────────────────────────────────────────────────────────────── */}
      {activeTab === "integrations" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 px-1 sm:px-2">
          {/* ── LEFT COLUMN: Integrations & Credentials Table (~60%) ── */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-3">
            <div
              className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3.5 sm:p-4"
              style={{ boxShadow: "var(--card-shadow)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--divider)]">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-heading)]">
                    Integrations &amp; Credentials
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Connected services, authentication status and key configuration
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => showToast("Add Integration modal opened")}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#0B1B3B] hover:bg-[#001730] text-white px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  <span>+ Add Integration</span>
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--divider)] text-[10.5px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      <th className="py-2.5 pl-1 pr-3">INTEGRATION</th>
                      <th className="py-2.5 px-3">PRODUCT</th>
                      <th className="py-2.5 px-3">ENVIRONMENT</th>
                      <th className="py-2.5 px-3">STATUS</th>
                      <th className="py-2.5 px-3">LAST CHECK</th>
                      <th className="py-2.5 pl-3 pr-1 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--divider)]">
                    {filteredIntegrations.map((row) => (
                      <tr
                        key={row.id}
                        className="group hover:bg-[var(--surface-muted)]/50 transition-colors"
                      >
                        {/* Integration Column (Third-Party Provider Logo) */}
                        <td className="py-3 pl-1 pr-3">
                          <div className="flex items-center gap-2.5">
                            <IntegrationIcon
                              integration={row.integrationSlug}
                              size={26}
                              className="rounded-md shrink-0 shadow-2xs"
                            />
                            <div>
                              <p className="font-bold text-[var(--text-heading)] text-xs leading-tight">
                                {row.integrationName}
                              </p>
                              <p className="text-[11px] text-[var(--text-muted)] leading-tight mt-0.5">
                                {row.integrationSubtitle}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Product Column (CRITICAL: Real Sahayogi Product Brand Logo) */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <ProductIcon
                              product={row.productName}
                              size={22}
                              className="rounded-md shrink-0 shadow-2xs"
                            />
                            <span className="font-semibold text-[var(--text-heading)] text-xs">
                              {row.productName}
                            </span>
                          </div>
                        </td>

                        {/* Environment Column */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                row.environment === "Production"
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                              }`}
                            />
                            <span className="font-medium">{row.environment}</span>
                          </div>
                        </td>

                        {/* Status Column */}
                        <td className="py-3 px-3">
                          {row.status === "401 HMAC Failed" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/50 px-2.5 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                              401 HMAC Failed
                            </span>
                          ) : row.status === "Token Expired" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/50 px-2.5 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                              Token Expired
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-900/50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          )}
                        </td>

                        {/* Last Check Column */}
                        <td className="py-3 px-3 text-[var(--text-muted)] text-xs">
                          {row.lastCheck}
                        </td>

                        {/* Actions Column */}
                        <td className="py-3 pl-3 pr-1 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              showToast(`Actions menu for ${row.integrationName}`)
                            }
                            className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--search-bg)] transition-colors cursor-pointer"
                            aria-label="More actions"
                          >
                            <MoreVertical size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Webhook Endpoints & Third-Party Provider Tokens (~40%) ── */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-3">
            {/* Card 1: Webhook Endpoints & HMAC */}
            <div
              className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3.5 sm:p-4"
              style={{ boxShadow: "var(--card-shadow)" }}
            >
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[var(--divider)]">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-heading)]">
                    Webhook Endpoints &amp; HMAC
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Customer-provided delivery URLs
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      "Webhook test ping sent to https://api.sharmatraders.in/webhooks/setu"
                    )
                  }
                  className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] hover:bg-[var(--search-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--text-heading)] shadow-2xs transition-colors cursor-pointer"
                >
                  Test Webhook
                </button>
              </div>

              <div className="space-y-2.5">
                {/* Endpoint 1: WhatsApp Events Ingestion */}
                <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface-muted)]/40 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[var(--text-heading)]">
                      WhatsApp Events Ingestion
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/50 px-2 py-0.5 text-[10.5px] font-bold text-rose-600 dark:text-rose-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                      401 HMAC Failed
                    </span>
                  </div>
                  <p className="font-mono text-xs text-[var(--text-muted)] break-all select-all">
                    https://api.sharmatraders.in/webhooks/setu
                  </p>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span>
                      Secret:{" "}
                      <strong className="font-mono text-[var(--text-heading)] font-normal">
                        ••••••••••42f9
                      </strong>
                    </span>
                    <span>
                      p95 Latency:{" "}
                      <strong className="text-[var(--text-heading)] font-semibold">148ms</strong>
                    </span>
                  </div>
                </div>

                {/* Endpoint 2: Payment Reconciliation */}
                <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface-muted)]/40 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[var(--text-heading)]">
                      Payment Reconciliation
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-900/50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      200 Active
                    </span>
                  </div>
                  <p className="font-mono text-xs text-[var(--text-muted)] break-all select-all">
                    https://api.sharmatraders.in/payments/callback
                  </p>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span>
                      Secret:{" "}
                      <strong className="font-mono text-[var(--text-heading)] font-normal">
                        ••••••••••88bc
                      </strong>
                    </span>
                    <span>
                      p95 Latency:{" "}
                      <strong className="text-[var(--text-heading)] font-semibold">44ms</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Third-Party Provider Tokens */}
            <div
              className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3.5 sm:p-4"
              style={{ boxShadow: "var(--card-shadow)" }}
            >
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[var(--divider)]">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-heading)]">
                    Third-Party Provider Tokens
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Upstream authentication keys and OAuth credentials
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      "Token refresh challenge dispatched to Meta Developer Console & HashiCorp Vault"
                    )
                  }
                  className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] hover:bg-[var(--search-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--text-heading)] shadow-2xs transition-colors cursor-pointer"
                >
                  Refresh Tokens
                </button>
              </div>

              <div className="space-y-2.5">
                {/* Provider Token 1: Meta Cloud API (WABA) - Uses Meta Icon */}
                <div className="rounded-xl border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <IntegrationIcon integration="meta-waba" size={18} className="rounded" />
                      <span className="text-xs font-bold text-[var(--text-heading)]">
                        Meta Cloud API (WABA)
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100/80 dark:bg-rose-900/60 px-2 py-0.5 text-[10.5px] font-bold text-rose-700 dark:text-rose-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                      Token Expired
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    OAuth App:{" "}
                    <strong className="font-medium text-[var(--text-secondary)]">
                      Sahayogi WhatsApp Production Bridge
                    </strong>
                  </p>
                  <div className="mt-2 rounded-lg bg-rose-100/60 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-900/50 p-2 text-[11px] font-medium text-rose-700 dark:text-rose-300 leading-relaxed">
                    Expired 14h ago. Customer action required to refresh long-lived token via Meta
                    Developer Console.
                  </div>
                </div>

                {/* Provider Token 2: Razorpay Aggregator Keys - Uses Razorpay Icon */}
                <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface-muted)]/40 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <IntegrationIcon integration="razorpay" size={18} className="rounded" />
                      <span className="text-xs font-bold text-[var(--text-heading)]">
                        Razorpay Aggregator Keys
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-900/50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Valid
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Key ID:{" "}
                    <strong className="font-mono text-[var(--text-heading)] font-normal">
                      rzp_live_••••••39a1
                    </strong>
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                    All signature checks nominal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 2: PRODUCT MATRIX (REQUIREMENT #13)
      ────────────────────────────────────────────────────────────────── */}
      {activeTab === "matrix" && (
        <div className="px-1 sm:px-2">
          <div
            className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3.5 sm:p-4"
            style={{ boxShadow: "var(--card-shadow)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--divider)]">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-heading)]">
                  Active Sahayogi Product Entitlements
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Complete product portfolio status provisioned for Sharma Traders Operations
                </p>
              </div>
              <span className="text-xs font-semibold text-[var(--text-muted)]">
                9 Products Tracked
              </span>
            </div>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--divider)] text-[10.5px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    <th className="py-2.5 pl-1 pr-3">PRODUCT</th>
                    <th className="py-2.5 px-3">PLAN / ENTITLEMENT</th>
                    <th className="py-2.5 px-3">ENVIRONMENT</th>
                    <th className="py-2.5 px-3">STATUS</th>
                    <th className="py-2.5 px-3">TELEMETRY &amp; USAGE</th>
                    <th className="py-2.5 px-3">LAST ACTIVITY</th>
                    <th className="py-2.5 pl-3 pr-1 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--divider)]">
                  {ALL_9_SAHAYOGI_PRODUCTS.map((prod, idx) => (
                    <tr
                      key={idx}
                      className="group hover:bg-[var(--surface-muted)]/50 transition-colors"
                    >
                      <td className="py-3 pl-1 pr-3">
                        <div className="flex items-center gap-2.5">
                          <ProductIcon product={prod.product} size={26} className="rounded-md" />
                          <span className="font-bold text-[var(--text-heading)] text-xs">
                            {prod.product}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-[var(--text-secondary)] font-medium">
                        {prod.plan}
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              prod.environment === "Production" ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          />
                          {prod.environment}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {prod.status === "Active" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-900/50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : prod.status === "Degraded" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/50 px-2 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            Degraded
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-900/50 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Attention
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-[var(--text-muted)] text-[11px]">
                        {prod.usage}
                      </td>

                      <td className="py-3 px-3 text-[var(--text-muted)] text-xs">
                        {prod.lastActivity}
                      </td>

                      <td className="py-3 pl-3 pr-1 text-right">
                        <button
                          type="button"
                          onClick={() => showToast(`Diagnostics launched for ${prod.product}`)}
                          className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] hover:bg-[var(--search-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-heading)] shadow-2xs transition-colors cursor-pointer"
                        >
                          Probe
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 3: DIAGNOSTIC TRACES (REQUIREMENT #14)
      ────────────────────────────────────────────────────────────────── */}
      {activeTab === "traces" && (
        <div className="px-1 sm:px-2 flex flex-col gap-3">
          <div
            className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3.5 sm:p-4"
            style={{ boxShadow: "var(--card-shadow)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--divider)]">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-heading)]">
                  Workspace Telemetry Traces
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Recent HTTP/webhook execution waterfall spanning Sharma Traders ingress &amp; egress rails
                </p>
              </div>
              <span className="text-xs font-semibold text-[var(--text-muted)]">
                {WORKSPACE_TRACES.length} Traces in buffer
              </span>
            </div>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--divider)] text-[10.5px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    <th className="py-2.5 pl-1 pr-3">TIMESTAMP</th>
                    <th className="py-2.5 px-3">TRACE ID</th>
                    <th className="py-2.5 px-3">PRODUCT</th>
                    <th className="py-2.5 px-3">SERVICE</th>
                    <th className="py-2.5 px-3">ENDPOINT</th>
                    <th className="py-2.5 px-3">STATUS</th>
                    <th className="py-2.5 px-3">LATENCY</th>
                    <th className="py-2.5 pl-3 pr-1 text-right">INCIDENT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--divider)] font-sans">
                  {WORKSPACE_TRACES.map((tr) => (
                    <tr
                      key={tr.id}
                      onClick={() => setSelectedTrace(tr)}
                      className={`group hover:bg-[var(--surface-muted)] cursor-pointer transition-colors ${
                        selectedTrace?.id === tr.id ? "bg-[var(--search-bg)]" : ""
                      }`}
                    >
                      <td className="py-3 pl-1 pr-3 font-mono text-[11px] text-[var(--text-muted)]">
                        {tr.timestamp}
                      </td>

                      <td className="py-3 px-3 font-mono text-xs font-semibold text-[#0058DD] dark:text-blue-400 group-hover:underline">
                        {tr.traceId}
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <ProductIcon product={tr.product} size={18} className="rounded" />
                          <span className="font-semibold text-[var(--text-heading)]">{tr.product}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-[var(--text-secondary)]">{tr.service}</td>

                      <td className="py-3 px-3 font-mono text-[11px] text-[var(--text-muted)]">
                        <span className="font-bold text-[var(--text-heading)] mr-1">
                          {tr.method}
                        </span>
                        {tr.endpoint}
                      </td>

                      <td className="py-3 px-3">
                        {tr.status >= 400 ? (
                          <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200/80 dark:border-rose-900/50">
                            {tr.status}
                          </span>
                        ) : (
                          <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200/80 dark:border-emerald-900/50">
                            {tr.status}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-[var(--text-muted)]">
                        {tr.latencyMs} ms
                      </td>

                      <td className="py-3 pl-3 pr-1 text-right">
                        {tr.incidentId ? (
                          <span className="font-mono text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/50">
                            {tr.incidentId}
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trace Inspector Modal / Panel if trace clicked */}
          {selectedTrace && (
            <div
              className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3.5 sm:p-4 shadow-sm animate-in fade-in"
              style={{ boxShadow: "var(--card-shadow)" }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--divider)]">
                <div className="flex items-center gap-2">
                  <Terminal size={16} className="text-[#0058DD]" />
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--text-heading)]">
                    Diagnostic Trace Inspector — {selectedTrace.traceId}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTrace(null)}
                  className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                    Request Payload ({selectedTrace.method} {selectedTrace.endpoint})
                  </span>
                  <pre className="rounded-lg bg-[var(--surface-muted)] border border-[var(--divider)] p-2.5 font-mono text-[11px] text-[var(--text-secondary)] overflow-x-auto max-h-48">
                    {selectedTrace.requestPayload}
                  </pre>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                    Response Payload (Status {selectedTrace.status})
                  </span>
                  <pre
                    className={`rounded-lg bg-[var(--surface-muted)] border border-[var(--divider)] p-2.5 font-mono text-[11px] overflow-x-auto max-h-48 ${
                      selectedTrace.status >= 400
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {selectedTrace.responsePayload}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 4: ACTIVE INCIDENTS (REQUIREMENT #15)
      ────────────────────────────────────────────────────────────────── */}
      {activeTab === "incidents" && (
        <div className="px-1 sm:px-2">
          <div
            className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3.5 sm:p-4"
            style={{ boxShadow: "var(--card-shadow)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--divider)] mb-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-heading)]">
                  Active Incidents Affecting Workspace
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Correlated customer tickets, infrastructure telemetry and progressive resolution
                </p>
              </div>
              <Link
                href="/technical-support/incidents"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0058DD] dark:text-blue-400 hover:underline"
              >
                <span>View Global Incidents Board</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            {/* Incident Card Matching Setu Incident Style */}
            <div className="rounded-xl border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-rose-200/60 dark:border-rose-900/40">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded">
                    INC-10291
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-[var(--text-heading)]">
                    WhatsApp webhook authentication failure
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-[10.5px] font-bold px-2.5 py-0.5 border border-rose-200/60">
                    Severity: High
                  </span>
                  <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10.5px] font-bold px-2.5 py-0.5 border border-amber-200/60">
                    Status: Investigating
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs border-b border-rose-200/60 dark:border-rose-900/40">
                <div>
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">
                    Product
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <ProductIcon product="Chat with Sahayogi" size={16} className="rounded" />
                    <strong className="text-[var(--text-heading)] font-semibold">
                      Chat with Sahayogi
                    </strong>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">
                    Integration
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <IntegrationIcon integration="meta-waba" size={16} className="rounded" />
                    <strong className="text-[var(--text-heading)] font-semibold">
                      Meta WhatsApp (WABA)
                    </strong>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">
                    Affected Scope
                  </span>
                  <strong className="text-[var(--text-heading)] font-semibold mt-0.5 block">
                    1 workspace (Sharma Traders)
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">
                    Started
                  </span>
                  <strong className="text-[var(--text-heading)] font-semibold mt-0.5 block">
                    14:24 IST (Today)
                  </strong>
                </div>
              </div>

              <div className="pt-3 text-xs text-[var(--text-secondary)] space-y-2">
                <p className="leading-relaxed">
                  <strong>Diagnostic Summary:</strong> Upstream webhook deliveries from Meta
                  Cloud API are failing signature verification with HTTP 401 Unauthorized. The
                  long-lived system OAuth user token expired 14 hours ago, preventing HMAC payload
                  validation on the Setu ingress bridge.
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[var(--text-muted)]">
                    Linked BoSS Case: <strong>CASE-94812-WABA</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRunProbe}
                      className="rounded-lg bg-[#002244] hover:bg-[#001730] text-white px-3 py-1.5 text-xs font-semibold shadow-2xs"
                    >
                      Re-run Diagnostic Probe
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 5: USERS & ACCESS (REQUIREMENT #16)
      ────────────────────────────────────────────────────────────────── */}
      {activeTab === "users" && (
        <div className="px-1 sm:px-2">
          <div
            className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3.5 sm:p-4"
            style={{ boxShadow: "var(--card-shadow)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--divider)]">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-heading)]">
                  Workspace Users &amp; Permissions
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Identity governance, Maker-Checker authorization roles, and MFA enforcement
                </p>
              </div>
              <button
                type="button"
                onClick={() => showToast("Add User invite modal opened")}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0B1B3B] hover:bg-[#001730] text-white px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <span>+ Invite User</span>
              </button>
            </div>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--divider)] text-[10.5px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    <th className="py-2.5 pl-1 pr-3">USER</th>
                    <th className="py-2.5 px-3">ROLE</th>
                    <th className="py-2.5 px-3">ACCESS LEVEL</th>
                    <th className="py-2.5 px-3">LAST ACTIVE</th>
                    <th className="py-2.5 px-3">MFA</th>
                    <th className="py-2.5 pl-3 pr-1 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--divider)]">
                  {WORKSPACE_USERS.map((u) => (
                    <tr
                      key={u.id}
                      className="group hover:bg-[var(--surface-muted)]/50 transition-colors"
                    >
                      <td className="py-3 pl-1 pr-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-[#0058DD] dark:text-blue-400 font-bold text-xs">
                            {u.initials}
                          </div>
                          <div>
                            <p className="font-bold text-[var(--text-heading)] text-xs leading-tight">
                              {u.name}
                            </p>
                            <p className="text-[11px] text-[var(--text-muted)] leading-tight mt-0.5">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-semibold text-[var(--text-heading)]">
                        {u.role}
                      </td>

                      <td className="py-3 px-3 text-[var(--text-secondary)]">{u.access}</td>

                      <td className="py-3 px-3 text-[var(--text-muted)]">{u.lastActive}</td>

                      <td className="py-3 px-3 text-xs text-[var(--text-secondary)]">
                        <span className="inline-flex items-center gap-1">
                          <Lock size={12} className="text-emerald-500" />
                          <span>{u.mfa}</span>
                        </span>
                      </td>

                      <td className="py-3 pl-3 pr-1 text-right">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-900/50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 6: SUBSCRIPTIONS (REQUIREMENT #17)
      ────────────────────────────────────────────────────────────────── */}
      {activeTab === "subscriptions" && (
        <div className="px-1 sm:px-2">
          <div
            className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3.5 sm:p-4"
            style={{ boxShadow: "var(--card-shadow)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--divider)]">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-heading)]">
                  Provisioned Product Subscriptions
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Official commercial tiers, active billing contracts and provisioned limits
                </p>
              </div>
              <span className="text-xs font-semibold text-[var(--text-muted)]">
                Billing Cycle: Annual Pre-paid
              </span>
            </div>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--divider)] text-[10.5px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    <th className="py-2.5 pl-1 pr-3">PRODUCT</th>
                    <th className="py-2.5 px-3">PLAN</th>
                    <th className="py-2.5 px-3">STATUS</th>
                    <th className="py-2.5 px-3">STARTED</th>
                    <th className="py-2.5 px-3">RENEWAL</th>
                    <th className="py-2.5 pl-3 pr-1">ENTITLEMENTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--divider)]">
                  {WORKSPACE_SUBSCRIPTIONS.map((sub, idx) => (
                    <tr
                      key={idx}
                      className="group hover:bg-[var(--surface-muted)]/50 transition-colors"
                    >
                      <td className="py-3 pl-1 pr-3">
                        <div className="flex items-center gap-2.5">
                          <ProductIcon product={sub.product} size={24} className="rounded" />
                          <span className="font-bold text-[var(--text-heading)] text-xs">
                            {sub.product}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-semibold text-[var(--text-heading)]">
                        {sub.plan}
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-900/50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {sub.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-[var(--text-muted)]">{sub.started}</td>

                      <td className="py-3 px-3 text-[var(--text-muted)] font-medium">
                        {sub.renewal}
                      </td>

                      <td className="py-3 pl-3 pr-1 text-[var(--text-secondary)] text-[11px]">
                        {sub.entitlements}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 7: HEALTH (REQUIREMENT #18)
      ────────────────────────────────────────────────────────────────── */}
      {activeTab === "health" && (
        <div className="px-1 sm:px-2 space-y-3">
          {/* Health Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-3">
              <span className="text-[11px] text-[var(--text-muted)] font-medium">
                Overall Status
              </span>
              <p className="text-base font-bold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                Degraded
              </p>
            </div>

            <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-3">
              <span className="text-[11px] text-[var(--text-muted)] font-medium">
                API Success Rate
              </span>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                88.4%
              </p>
            </div>

            <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-3">
              <span className="text-[11px] text-[var(--text-muted)] font-medium">P95 Latency</span>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                1.2 s
              </p>
            </div>

            <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-3">
              <span className="text-[11px] text-[var(--text-muted)] font-medium">Error Rate</span>
              <p className="text-base font-bold text-rose-600 dark:text-rose-400 font-mono mt-1">
                11.6%
              </p>
            </div>

            <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-3">
              <span className="text-[11px] text-[var(--text-muted)] font-medium">
                Active Incidents
              </span>
              <p className="text-base font-bold text-rose-600 dark:text-rose-400 font-mono mt-1">
                1 Open
              </p>
            </div>

            <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-3">
              <span className="text-[11px] text-[var(--text-muted)] font-medium">
                Integration Health
              </span>
              <p className="text-base font-bold text-[var(--text-heading)] font-mono mt-1">
                3 / 5 Nominal
              </p>
            </div>
          </div>

          {/* Integration Health Matrix */}
          <div
            className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3.5 sm:p-4"
            style={{ boxShadow: "var(--card-shadow)" }}
          >
            <h3 className="text-sm font-bold text-[var(--text-heading)] mb-3 pb-2 border-b border-[var(--divider)]">
              Subsystem &amp; Rail Health Matrix
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/30 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-[var(--text-heading)]">Meta WABA Webhook</span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
                    CRITICAL
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  HMAC verification failing due to expired long-lived OAuth token.
                </p>
                <div className="mt-2 text-[10.5px] font-mono text-rose-600">Error rate: 100%</div>
              </div>

              <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/30 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-[var(--text-heading)]">Razorpay Payment Rail</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                    HEALTHY
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Signatures match on 100% of captured transaction callbacks.
                </p>
                <div className="mt-2 text-[10.5px] font-mono text-emerald-600">
                  Success rate: 100% · p95: 44ms
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/30 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-[var(--text-heading)]">Tally on Cloud Sync</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                    HEALTHY
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Continuous ledger syncing active with zero voucher backpressure.
                </p>
                <div className="mt-2 text-[10.5px] font-mono text-emerald-600">
                  Last sync: 18 mins ago
                </div>
              </div>

              <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/30 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-[var(--text-heading)]">Microsoft 365 OAuth</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                    ATTENTION
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Access token expired. Re-consent workflow waiting on tenant admin.
                </p>
                <div className="mt-2 text-[10.5px] font-mono text-amber-600">
                  Token life: Expired 1h ago
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/30 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-[var(--text-heading)]">Income Tax Department API</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                    HEALTHY
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Sandbox proxy operational with 82ms response latency.
                </p>
                <div className="mt-2 text-[10.5px] font-mono text-emerald-600">
                  Success rate: 100% · p95: 82ms
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 8: AUDIT TRAIL (REQUIREMENT #19)
      ────────────────────────────────────────────────────────────────── */}
      {activeTab === "audit" && (
        <div className="px-1 sm:px-2">
          <div
            className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3.5 sm:p-4"
            style={{ boxShadow: "var(--card-shadow)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--divider)]">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-heading)]">
                  Tenant Audit Trail &amp; Ledger
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Immutable chronological audit logs scoped strictly to Sharma Traders Operations
                </p>
              </div>
              <span className="text-xs font-semibold text-[var(--text-muted)]">
                {WORKSPACE_AUDIT_EVENTS.length} Audit Events
              </span>
            </div>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--divider)] text-[10.5px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    <th className="py-2.5 pl-1 pr-3">TIMESTAMP</th>
                    <th className="py-2.5 px-3">EVENT / ACTION</th>
                    <th className="py-2.5 px-3">DETAILS</th>
                    <th className="py-2.5 px-3">ACTOR</th>
                    <th className="py-2.5 px-3">STATUS</th>
                    <th className="py-2.5 pl-3 pr-1 text-right">TRACE REF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--divider)]">
                  {WORKSPACE_AUDIT_EVENTS.map((ev) => (
                    <tr
                      key={ev.id}
                      className="group hover:bg-[var(--surface-muted)]/50 transition-colors"
                    >
                      <td className="py-3 pl-1 pr-3 font-mono text-[11px] text-[var(--text-muted)]">
                        {ev.time}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-[var(--text-heading)] text-xs">
                          {ev.title}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-[var(--text-secondary)] text-[11px]">
                        {ev.subtitle}
                      </td>

                      <td className="py-3 px-3">
                        <div>
                          <p className="font-semibold text-[var(--text-heading)] text-xs">
                            {ev.actor}
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)]">{ev.actorRole}</p>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {ev.status === "Success" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-900/50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Success
                          </span>
                        ) : ev.status === "Blocked" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-900/50 px-2 py-0.5 text-[10.5px] font-bold text-amber-600 dark:text-amber-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/50 px-2 py-0.5 text-[10.5px] font-bold text-rose-600 dark:text-rose-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            Failed
                          </span>
                        )}
                      </td>

                      <td className="py-3 pl-3 pr-1 text-right font-mono text-[11px]">
                        {ev.traceId ? (
                          <span className="font-semibold text-[#0058DD] dark:text-blue-400">
                            {ev.traceId}
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          RUN PROBE RESULT MODAL
      ────────────────────────────────────────────────────────────────── */}
      {probeResult?.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={() => setProbeResult(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-[var(--divider)] bg-[var(--surface)] p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--divider)]">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-[#0058DD]">
                  <Stethoscope size={16} />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-heading)]">
                    Diagnostic Probe Results
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Target: Sharma Traders Operations (WS-94812)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProbeResult(null)}
                className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-heading)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="rounded-xl border border-[var(--divider)] p-3 flex items-center justify-between bg-[var(--surface-muted)]/50">
                <div>
                  <p className="font-bold text-[var(--text-heading)]">
                    Ping Webhook SSL &amp; Handshake
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    https://api.sharmatraders.in/webhooks/setu · 84ms
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-600 px-2 py-0.5 font-bold text-[10.5px] border border-emerald-200">
                  <CheckCircle2 size={12} /> TLS 1.3 PASS
                </span>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[var(--text-heading)]">
                    HMAC Payload Signature Validation
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Secret: ••••••••••42f9
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-700 px-2 py-0.5 font-bold text-[10.5px] border border-rose-200">
                  <AlertCircle size={12} /> HMAC FAIL
                </span>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[var(--text-heading)]">
                    Meta Cloud API (WABA) OAuth Handshake
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Token Expired 14h ago
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-700 px-2 py-0.5 font-bold text-[10.5px] border border-rose-200">
                  <AlertTriangle size={12} /> 401 UNAUTHORIZED
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-[var(--divider)]">
              <button
                type="button"
                onClick={() => setProbeResult(null)}
                className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] hover:bg-[var(--search-bg)] px-3.5 py-1.5 text-xs font-semibold text-[var(--text-heading)]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setProbeResult(null);
                  showToast("Notification sent to Rajesh Sharma to refresh Meta OAuth token.");
                }}
                className="rounded-lg bg-[#002244] hover:bg-[#001730] text-white px-3.5 py-1.5 text-xs font-semibold"
              >
                Notify Tenant Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

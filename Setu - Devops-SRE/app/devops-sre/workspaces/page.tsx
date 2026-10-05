"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  AlertOctagon,
  Lock,
  Search,
  ExternalLink,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Terminal,
  Clock,
  Activity,
  UserCheck,
  FileText,
  X,
  CreditCard,
  MessageSquare,
  FileCheck,
  Copy,
  Check,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Database,
  Server,
  Zap,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Network,
  Share2,
  Key,
} from "lucide-react";
import ProductIcon from "@/components/shared/ProductIcon";
import IntegrationIcon from "@/components/shared/IntegrationIcon";
import FilterDropdown, { FilterDropdownOption } from "@/components/shared/FilterDropdown";
import { triggerRefresh } from "@/lib/events/refresh";

export interface SreWorkspaceFull {
  id: string;
  name: string;
  orgName: string;
  tier: "Enterprise Tier-1 (1h SLA)" | "Growth Tier-2 (4h SLA)" | "Standard Tier-3 (24h SLA)";
  tierCategory: "Tier-1" | "Tier-2" | "Tier-3";
  health: "Critical Outage" | "Degraded" | "Healthy";
  healthType: "critical" | "warning" | "healthy";
  primaryService: string;
  activeProducts: string[];
  currentTps: number;
  maxTpsQuota: number;
  burstAllowanceTps: number;
  k8sNamespace: string;
  dbShard: string;
  dbReplicaLagMs: number;
  redisCluster: string;
  ingressVip: string;
  podCount: number;
  activeOutageId?: string;
  outageImpactSummary?: string;
  telemetryAttribution: {
    client4xxPct: number;
    server5xxPct: number;
    meanLatencyP50: number;
    meanLatencyP95: number;
    meanLatencyP99: number;
    requestsToday: number;
    error401HmacCount: number;
    error429RateLimitCount: number;
    error504GatewayCount: number;
    error500SystemCount: number;
  };
  circuitBreakers: {
    rail: string;
    state: "Closed" | "Half-Open" | "Open";
    failureRate: number;
    lastTripped: string;
  }[];
  traceSample: {
    traceId: string;
    rootSpan: string;
    durationMs: number;
    statusCode: number;
    timestamp: string;
    errorSummary: string;
  };
  recentAudit: {
    time: string;
    action: string;
    actor: string;
    status: "Success" | "Failed";
  }[];
}

export const SRE_WORKSPACES_DATA: SreWorkspaceFull[] = [
  {
    id: "WS-94812",
    name: "Sharma Traders Private Limited",
    orgName: "Sharma Traders Group",
    tier: "Enterprise Tier-1 (1h SLA)",
    tierCategory: "Tier-1",
    health: "Critical Outage",
    healthType: "critical",
    primaryService: "WhatsApp Cloud Gateway",
    activeProducts: ["Chat with Sahayogi", "BoSS", "Sahayogi Cloud"],
    currentTps: 142,
    maxTpsQuota: 250,
    burstAllowanceTps: 350,
    k8sNamespace: "tenant-ws-94812-prod",
    dbShard: "db-shard-04 (ap-south-1a)",
    dbReplicaLagMs: 1.2,
    redisCluster: "redis-cluster-m5-shared",
    ingressVip: "10.142.12.89 (Envoy Edge)",
    podCount: 6,
    activeOutageId: "INC-1042",
    outageImpactSummary: "Meta WhatsApp WABA Egress 504 Timeouts. 412 calls dropped in last 30 minutes.",
    telemetryAttribution: {
      client4xxPct: 18,
      server5xxPct: 82,
      meanLatencyP50: 180,
      meanLatencyP95: 3420,
      meanLatencyP99: 5120,
      requestsToday: 184200,
      error401HmacCount: 28,
      error429RateLimitCount: 4,
      error504GatewayCount: 1420,
      error500SystemCount: 44,
    },
    circuitBreakers: [
      { rail: "Meta WhatsApp WABA", state: "Half-Open", failureRate: 4.82, lastTripped: "18 mins ago" },
      { rail: "NPCI UPI Switch", state: "Closed", failureRate: 0.01, lastTripped: "Never" },
      { rail: "NIC GST E-Invoice", state: "Closed", failureRate: 0.12, lastTripped: "Yesterday" },
      { rail: "Razorpay Payments", state: "Closed", failureRate: 0.00, lastTripped: "Never" },
    ],
    traceSample: {
      traceId: "trc_94812_01j8m4k",
      rootSpan: "POST /v2/whatsapp/messages",
      durationMs: 3420,
      statusCode: 504,
      timestamp: "14:26:10",
      errorSummary: "Upstream Meta Graph API Gateway Timeout after 3000ms timeout threshold",
    },
    recentAudit: [
      { time: "14:26:10", action: "TENANT_PROBE_PING_TRIGGERED", actor: "Dhruv Singla [Support]", status: "Success" },
      { time: "14:02:40", action: "INCIDENT_ATTACHED_INC-1042", actor: "Arjun Mehta [Lead SRE]", status: "Success" },
      { time: "12:15:00", action: "QUOTA_TPS_BURST_ELEVATION", actor: "Priyanka Rao [Platform]", status: "Success" },
    ],
  },
  {
    id: "WS-10021",
    name: "Bharat Agro Distributors",
    orgName: "Bharat Agro Cooperative",
    tier: "Enterprise Tier-1 (1h SLA)",
    tierCategory: "Tier-1",
    health: "Degraded",
    healthType: "warning",
    primaryService: "UPI Payment Rail Switch",
    activeProducts: ["BoSS", "Office Sahayogi"],
    currentTps: 380,
    maxTpsQuota: 500,
    burstAllowanceTps: 700,
    k8sNamespace: "tenant-ws-10021-prod",
    dbShard: "db-shard-01 (ap-south-1a)",
    dbReplicaLagMs: 0.8,
    redisCluster: "redis-cluster-m5-dedicated",
    ingressVip: "10.142.10.42 (Envoy Edge)",
    podCount: 12,
    activeOutageId: "INC-1039",
    outageImpactSummary: "Intermittent BBPS biller timeouts. Error rate elevated to 0.45%.",
    telemetryAttribution: {
      client4xxPct: 74,
      server5xxPct: 26,
      meanLatencyP50: 12,
      meanLatencyP95: 180,
      meanLatencyP99: 420,
      requestsToday: 490100,
      error401HmacCount: 140,
      error429RateLimitCount: 12,
      error504GatewayCount: 88,
      error500SystemCount: 14,
    },
    circuitBreakers: [
      { rail: "NPCI UPI Switch", state: "Closed", failureRate: 0.01, lastTripped: "Never" },
      { rail: "BBPS Ingestion Switch", state: "Half-Open", failureRate: 1.2, lastTripped: "2 hours ago" },
      { rail: "Razorpay Payments", state: "Closed", failureRate: 0.02, lastTripped: "Never" },
    ],
    traceSample: {
      traceId: "trc_10021_04p9a2b",
      rootSpan: "POST /v2/bbps/biller/fetch",
      durationMs: 840,
      statusCode: 504,
      timestamp: "14:15:22",
      errorSummary: "Upstream biller response delayed beyond 800ms SLA",
    },
    recentAudit: [
      { time: "13:45:00", action: "RATE_LIMIT_ADAPTIVE_THROTTLE", actor: "Setu Sentinel Bot", status: "Success" },
      { time: "11:20:00", action: "MEMBER_ROLE_ELEVATION", actor: "Arjun Mehta [Lead SRE]", status: "Success" },
    ],
  },
  {
    id: "WS-55321",
    name: "Kalyan Logistics & Supply Chain",
    orgName: "Kalyan Enterprise",
    tier: "Growth Tier-2 (4h SLA)",
    tierCategory: "Tier-2",
    health: "Healthy",
    healthType: "healthy",
    primaryService: "GST Ingestion Gateway",
    activeProducts: ["Tax Sahayogi", "Sahayogi Cloud"],
    currentTps: 88,
    maxTpsQuota: 150,
    burstAllowanceTps: 200,
    k8sNamespace: "tenant-ws-55321-prod",
    dbShard: "db-shard-02 (ap-south-1b)",
    dbReplicaLagMs: 2.1,
    redisCluster: "redis-cluster-m5-shared",
    ingressVip: "10.142.14.19 (Envoy Edge)",
    podCount: 4,
    telemetryAttribution: {
      client4xxPct: 94,
      server5xxPct: 6,
      meanLatencyP50: 84,
      meanLatencyP95: 142,
      meanLatencyP99: 290,
      requestsToday: 98400,
      error401HmacCount: 210,
      error429RateLimitCount: 0,
      error504GatewayCount: 2,
      error500SystemCount: 1,
    },
    circuitBreakers: [
      { rail: "NIC GST E-Invoice", state: "Closed", failureRate: 0.05, lastTripped: "Never" },
      { rail: "AWS S3 Document Vault", state: "Closed", failureRate: 0.00, lastTripped: "Never" },
    ],
    traceSample: {
      traceId: "trc_55321_02m8k1a",
      rootSpan: "POST /v2/tax/einvoice/generate",
      durationMs: 142,
      statusCode: 200,
      timestamp: "14:19:45",
      errorSummary: "Transaction completed successfully in 142ms",
    },
    recentAudit: [
      { time: "Yesterday", action: "VM_INSTANCE_ATTACHED", actor: "Amit Kumar [DevOps]", status: "Success" },
    ],
  },
  {
    id: "WS-33019",
    name: "Rajdhani Commercial Fleet",
    orgName: "Rajdhani Transport Corp",
    tier: "Enterprise Tier-1 (1h SLA)",
    tierCategory: "Tier-1",
    health: "Healthy",
    healthType: "healthy",
    primaryService: "FASTag Toll & Payments",
    activeProducts: ["BoSS", "Pay with Sahayogi"],
    currentTps: 210,
    maxTpsQuota: 300,
    burstAllowanceTps: 450,
    k8sNamespace: "tenant-ws-33019-prod",
    dbShard: "db-shard-03 (ap-south-1a)",
    dbReplicaLagMs: 0.9,
    redisCluster: "redis-cluster-m5-dedicated",
    ingressVip: "10.142.11.02 (Envoy Edge)",
    podCount: 8,
    telemetryAttribution: {
      client4xxPct: 96,
      server5xxPct: 4,
      meanLatencyP50: 18,
      meanLatencyP95: 34,
      meanLatencyP99: 72,
      requestsToday: 320400,
      error401HmacCount: 18,
      error429RateLimitCount: 2,
      error504GatewayCount: 0,
      error500SystemCount: 1,
    },
    circuitBreakers: [
      { rail: "NETC FASTag NPCI Rail", state: "Closed", failureRate: 0.01, lastTripped: "Never" },
      { rail: "UPI Payments Switch", state: "Closed", failureRate: 0.00, lastTripped: "Never" },
    ],
    traceSample: {
      traceId: "trc_33019_07k1a9f",
      rootSpan: "POST /v2/fastag/tag-inquiry",
      durationMs: 24,
      statusCode: 200,
      timestamp: "14:24:00",
      errorSummary: "FASTag balance inquiry returned 200 OK",
    },
    recentAudit: [
      { time: "01 Oct 2026", action: "SLA_TIER_1_RENEWAL", actor: "Arjun Mehta [Lead SRE]", status: "Success" },
    ],
  },
  {
    id: "WS-40182",
    name: "Zeta Fintech Technologies",
    orgName: "Zeta Global Holdings",
    tier: "Enterprise Tier-1 (1h SLA)",
    tierCategory: "Tier-1",
    health: "Critical Outage",
    healthType: "critical",
    primaryService: "WhatsApp Cloud Gateway",
    activeProducts: ["Chat with Sahayogi", "Sahayogi One"],
    currentTps: 195,
    maxTpsQuota: 250,
    burstAllowanceTps: 350,
    k8sNamespace: "tenant-ws-40182-prod",
    dbShard: "db-shard-04 (ap-south-1a)",
    dbReplicaLagMs: 1.4,
    redisCluster: "redis-cluster-m5-shared",
    ingressVip: "10.142.12.91 (Envoy Edge)",
    podCount: 6,
    activeOutageId: "INC-1042",
    outageImpactSummary: "Impacted by INC-1042. 504 timeouts on WABA egress.",
    telemetryAttribution: {
      client4xxPct: 15,
      server5xxPct: 85,
      meanLatencyP50: 210,
      meanLatencyP95: 3600,
      meanLatencyP99: 5400,
      requestsToday: 198000,
      error401HmacCount: 12,
      error429RateLimitCount: 1,
      error504GatewayCount: 1290,
      error500SystemCount: 38,
    },
    circuitBreakers: [
      { rail: "Meta WhatsApp WABA", state: "Half-Open", failureRate: 4.82, lastTripped: "18 mins ago" },
    ],
    traceSample: {
      traceId: "trc_40182_09m1k2a",
      rootSpan: "POST /v2/whatsapp/templates/send",
      durationMs: 3600,
      statusCode: 504,
      timestamp: "14:27:12",
      errorSummary: "Egress timeout after 3000ms threshold",
    },
    recentAudit: [
      { time: "14:02:40", action: "INCIDENT_ATTACHED_INC-1042", actor: "Arjun Mehta [Lead SRE]", status: "Success" },
    ],
  },
];

type WorkspaceTab =
  | "overview"
  | "telemetry-attribution"
  | "quotas"
  | "circuit-breakers"
  | "traces"
  | "incidents"
  | "diagnostics"
  | "audit";

export default function SreWorkspace360Page() {
  const [workspaces, setWorkspaces] = useState<SreWorkspaceFull[]>(SRE_WORKSPACES_DATA);
  const [selectedId, setSelectedId] = useState<string>("WS-94812");
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterTier, setFilterTier] = useState("all");
  const [filterHealth, setFilterHealth] = useState("all");
  const [filterService, setFilterService] = useState("all");
  const [sortBy, setSortBy] = useState<"tps" | "errors" | "name">("tps");
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  const [isProbing, setIsProbing] = useState(false);
  const [probeResult, setProbeResult] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const selectedWorkspace = useMemo(() => {
    return workspaces.find((w) => w.id === selectedId) || workspaces[0];
  }, [workspaces, selectedId]);

  const tierOptions: FilterDropdownOption[] = [
    { value: "all", label: "All SLA Tiers" },
    { value: "Tier-1", label: "Enterprise Tier-1 (1h SLA)" },
    { value: "Tier-2", label: "Growth Tier-2 (4h SLA)" },
    { value: "Tier-3", label: "Standard Tier-3 (24h SLA)" },
  ];

  const healthOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Health Statuses" },
    { value: "Critical Outage", label: "Critical Outage (Active Incident)" },
    { value: "Degraded", label: "Degraded Performance" },
    { value: "Healthy", label: "Healthy / Nominal" },
  ];

  const serviceOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Primary Services" },
    { value: "WhatsApp Cloud Gateway", label: "WhatsApp Cloud Gateway" },
    { value: "UPI Payment Rail Switch", label: "UPI Payment Rail Switch" },
    { value: "GST Ingestion Gateway", label: "GST Ingestion Gateway" },
    { value: "FASTag Toll & Payments", label: "FASTag Toll & Payments" },
  ];

  const sortOptions: FilterDropdownOption[] = [
    { value: "tps", label: "Highest TPS Volume" },
    { value: "errors", label: "Highest 5xx Server Errors" },
    { value: "name", label: "Tenant Name (A-Z)" },
  ];

  const tenantSelectOptions: FilterDropdownOption[] = useMemo(() => {
    return workspaces.map((w) => ({
      value: w.id,
      label: `${w.name} (${w.id})`,
      sub: `${w.tierCategory} · ${w.health}`,
    }));
  }, [workspaces]);

  const filteredWorkspaces = useMemo(() => {
    const list = workspaces.filter((w) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          w.id.toLowerCase().includes(q) ||
          w.name.toLowerCase().includes(q) ||
          w.orgName.toLowerCase().includes(q) ||
          w.primaryService.toLowerCase().includes(q) ||
          w.activeProducts.some((p) => p.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (filterTier !== "all" && w.tierCategory !== filterTier) return false;
      if (filterHealth !== "all" && w.health !== filterHealth) return false;
      if (filterService !== "all" && w.primaryService !== filterService) return false;
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === "tps") return b.currentTps - a.currentTps;
      if (sortBy === "errors") return b.telemetryAttribution.server5xxPct - a.telemetryAttribution.server5xxPct;
      return a.name.localeCompare(b.name);
    });
  }, [workspaces, searchQuery, filterTier, filterHealth, filterService, sortBy]);

  const totalTenants = 48;
  const impactedCount = workspaces.filter((w) => w.health === "Critical Outage").length;
  const tier1Count = workspaces.filter((w) => w.tierCategory === "Tier-1").length;
  const tier2Count = workspaces.filter((w) => w.tierCategory === "Tier-2").length;
  const fleetThroughputTps = "2,420 TPS";
  const slaBreaches30d = "0 Breaches";

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTriggerProbe = () => {
    setIsProbing(true);
    setProbeResult(null);
    setTimeout(() => {
      setIsProbing(false);
      setProbeResult(
        `Diagnostic Probe Complete for ${selectedWorkspace.id}: Database Replica Lag: ${selectedWorkspace.dbReplicaLagMs}ms (PASS), Redis Ingress: 1.1ms (PASS), Upstream Ingress Gateway: ${selectedWorkspace.health === "Critical Outage" ? "504 TIMEOUT (FAIL)" : "200 OK (PASS)"}`
      );
      showToast(`Diagnostic Probe completed for ${selectedWorkspace.id}`);
      triggerRefresh({ source: `probe-${selectedWorkspace.id}` });
    }, 1200);
  };

  return (
    <div className="flex flex-col min-h-full text-[var(--text-heading)] -mt-2 -mx-1 sm:-mx-2 pb-16 screen-sm:pb-8">
      {toastMsg && (
        <div className="fixed top-18 right-6 z-50 flex items-center gap-2 rounded-xl border border-[var(--sidebar-active)]/30 bg-[var(--surface)] px-4 py-2.5 text-xs font-semibold text-[var(--text-heading)] shadow-lg animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-1 py-1.5 px-1 sm:px-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[var(--text-muted)] font-normal">Workspaces</span>
          <span className="text-[var(--text-muted)]/60 font-light">&gt;</span>
          <span className="font-bold text-[var(--text-heading)]">Workspace 360 Dossier</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mt-0.5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-heading)]">
                Workspace 360 (SRE Blast Radius Context Panel)
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-[var(--divider)]">
                <Lock size={10} />
                READ-ONLY DOSSIER
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Multi-tenant infrastructure isolation, tenant payload (4xx) vs platform fault (5xx) attribution, and circuit breaker status
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <FilterDropdown
              label="Tenant:"
              value={selectedId}
              onChange={setSelectedId}
              options={tenantSelectOptions}
              title="Select Customer Workspace"
              searchable
              searchPlaceholder="Search tenant by name or WS-id..."
              align="right"
              className="font-semibold text-xs"
            />
          </div>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-2 screen-sm:grid-cols-3 screen-lg:grid-cols-6 lg:grid-cols-6 gap-2 sm:gap-2.5 lg:gap-3 px-1 sm:px-2 mb-3">
        <div
          onClick={() => { setFilterHealth("all"); setFilterTier("all"); }}
          className="cursor-pointer group flex flex-col justify-between rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2.5 sm:p-3 hover:border-[var(--sidebar-active)]/50 transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--text-muted)]">Monitored Fleet</span>
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
              All 48 Tenants
            </span>
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-heading)]">
              {totalTenants}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] ml-1">Namespaces</span>
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-1 truncate">Isolated K8s Tenancy</div>
        </div>

        <div
          onClick={() => setFilterHealth("Critical Outage")}
          className={`cursor-pointer group flex flex-col justify-between rounded-xl border p-2.5 sm:p-3 transition-all shadow-2xs ${
            filterHealth === "Critical Outage"
              ? "border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 ring-1 ring-rose-500"
              : "border-[var(--divider)] bg-[var(--surface)] hover:border-rose-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">Outage Blast Radius</span>
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-950 px-1.5 py-0.5 rounded animate-pulse">
              INC-1042 Active
            </span>
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              {impactedCount}
            </span>
            <span className="text-[10px] text-rose-600 dark:text-rose-400 ml-1">Tenants Impacted</span>
          </div>
          <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 truncate font-medium">
            Meta WABA 504 Egress
          </div>
        </div>

        <div
          onClick={() => setFilterTier("Tier-1")}
          className="cursor-pointer group flex flex-col justify-between rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2.5 sm:p-3 hover:border-purple-400 transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--text-muted)]">Enterprise Tier-1</span>
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-purple-700 bg-purple-50 dark:bg-purple-950 px-1.5 py-0.5 rounded">
              1h SLA Target
            </span>
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400">
              {tier1Count}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] ml-1">Accounts</span>
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-1 truncate">Highest Priority Queue</div>
        </div>

        <div
          onClick={() => setFilterTier("Tier-2")}
          className="cursor-pointer group flex flex-col justify-between rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2.5 sm:p-3 hover:border-blue-400 transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--text-muted)]">Growth Tier-2</span>
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-blue-700 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
              4h SLA Target
            </span>
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              {tier2Count}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] ml-1">Accounts</span>
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-1 truncate">Standard Monitoring</div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2.5 sm:p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--text-muted)]">Fleet Throughput</span>
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
              <TrendingUp size={10} /> +18.4%
            </span>
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-heading)]">
              {fleetThroughputTps}
            </span>
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-1 truncate">Peak Ingestion Load</div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2.5 sm:p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--text-muted)]">SLA Breaches (30d)</span>
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
              99.98% SLA
            </span>
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600">
              {slaBreaches30d}
            </span>
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-1 truncate">Zero Penalties Incurred</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 sm:px-2 mb-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tenant name, WS-id, org, or product..."
              className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xl border border-[var(--divider)] bg-[var(--surface)] text-[var(--text-heading)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--sidebar-active)] shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-heading)]"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <FilterDropdown label="SLA Tier:" value={filterTier} onChange={setFilterTier} options={tierOptions} title="Filter by SLA Tier" className="text-xs" />
          <FilterDropdown label="Health:" value={filterHealth} onChange={setFilterHealth} options={healthOptions} title="Filter by Infrastructure Health" className="text-xs" />
          <FilterDropdown label="Service:" value={filterService} onChange={setFilterService} options={serviceOptions} title="Filter by Primary Service" className="text-xs" />

          <button
            onClick={() => setMoreFiltersOpen(!moreFiltersOpen)}
            className={`tap-pop flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium shadow-2xs transition-colors ${
              moreFiltersOpen
                ? "border-[var(--sidebar-active)] bg-[var(--sidebar-active)]/10 text-[var(--sidebar-active)]"
                : "border-[var(--divider)] bg-[var(--surface)] text-[var(--text-heading)] hover:bg-[var(--search-bg)]"
            }`}
          >
            <SlidersHorizontal size={13} />
            <span>More Filters</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <FilterDropdown label="Sort by:" value={sortBy} onChange={(val) => setSortBy(val as any)} options={sortOptions} title="Sort Tenants" className="text-xs" align="right" />
        </div>
      </div>

      {moreFiltersOpen && (
        <div className="mx-1 sm:mx-2 mb-3 p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)] flex flex-wrap items-center gap-4 text-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--text-heading)]">Blast Radius Filter:</span>
            <button
              onClick={() => setFilterHealth(filterHealth === "Critical Outage" ? "all" : "Critical Outage")}
              className={`px-2 py-1 rounded-lg border font-medium ${
                filterHealth === "Critical Outage"
                  ? "bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                  : "bg-[var(--surface)] border-[var(--divider)] text-[var(--text-muted)]"
              }`}
            >
              Only Active Outage Impacted Tenants
            </button>
          </div>
          <button
            onClick={() => {
              setSearchQuery("");
              setFilterTier("all");
              setFilterHealth("all");
              setFilterService("all");
              setSortBy("tps");
            }}
            className="text-xs text-[var(--sidebar-active)] hover:underline ml-auto"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Split View */}
      <div className="flex flex-col lg:flex-row gap-3 px-1 sm:px-2 min-h-0 flex-1">
        {/* ── LEFT PANEL: WORKSPACES QUEUE (45%) ────────────────────────── */}
        <div
          className="w-full lg:w-[45%] shrink-0 bg-[var(--surface)] rounded-2xl border border-[var(--card-border)] shadow-xs flex flex-col p-3 sm:p-3.5 max-h-[520px] lg:max-h-none lg:h-[calc(100dvh-17rem)] overflow-hidden"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--divider)]">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-heading)] leading-tight">
                Workspaces ({filteredWorkspaces.length})
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Customer workspaces, circuit breakers &amp; telemetry
              </p>
            </div>
            <FilterDropdown
              label="Sort by:"
              value={sortBy}
              onChange={(val) => setSortBy(val as any)}
              options={sortOptions}
              title="Sort Workspaces"
              className="text-xs"
              align="right"
            />
          </div>

          <div className="flex-1 overflow-y-auto pt-2 space-y-2 pr-0.5">
            {filteredWorkspaces.map((ws) => {
              const isSelected = ws.id === selectedId;
              const isOutage = ws.health === "Critical Outage";

              return (
                <div
                  key={ws.id}
                  onClick={() => setSelectedId(ws.id)}
                  className={`tap-pop cursor-pointer text-left rounded-xl border p-3 transition-all relative ${
                    isSelected
                      ? "border-[var(--sidebar-active)] bg-[var(--sidebar-active)]/[0.04] shadow-xs ring-1 ring-[var(--sidebar-active)]"
                      : "border-[var(--divider)] bg-[var(--surface)] hover:border-[var(--sidebar-active)]/40 hover:bg-[var(--search-bg)]"
                  } ${
                    isOutage
                      ? "border-l-4 border-l-rose-500"
                      : ws.health === "Degraded"
                      ? "border-l-4 border-l-amber-500"
                      : "border-l-4 border-l-emerald-500"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[var(--text-heading)] shrink-0">
                        <Building2 size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-[var(--text-heading)] truncate">
                            {ws.name}
                          </span>
                          <span className="px-1.5 py-0.2 rounded font-mono font-bold text-[10px] bg-slate-100 dark:bg-slate-800 text-[var(--text-heading)]">
                            {ws.id}
                          </span>
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)] truncate block">
                          {ws.orgName} · {ws.primaryService}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                        {ws.tierCategory}
                      </span>
                    </div>
                  </div>

                  {isOutage && ws.activeOutageId && (
                    <div className="mb-2 p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between text-[11px] text-rose-700">
                      <span className="font-semibold truncate">
                        ⚠ Impacted by {ws.activeOutageId}
                      </span>
                      <span className="font-bold shrink-0">p95: {ws.telemetryAttribution.meanLatencyP95}ms</span>
                    </div>
                  )}

                  <div className="mb-2 flex items-center gap-2 text-[10px]">
                    <span className="text-[var(--text-muted)]">Attribution:</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[var(--text-heading)] font-medium">
                      Tenant 4xx: {ws.telemetryAttribution.client4xxPct}%
                    </span>
                    <span className={`px-1.5 py-0.2 rounded font-bold ${
                      ws.telemetryAttribution.server5xxPct > 20
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950"
                    }`}>
                      Platform 5xx: {ws.telemetryAttribution.server5xxPct}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-[var(--divider)] text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--text-muted)]">Current TPS:</span>
                      <span className="font-bold text-[var(--text-heading)] font-mono">{ws.currentTps} / {ws.maxTpsQuota}</span>
                    </div>

                    <div className="flex items-center gap-1 font-semibold">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isOutage ? "bg-rose-500 animate-pulse" : ws.health === "Degraded" ? "bg-amber-500" : "bg-emerald-500"
                      }`} />
                      <span className={isOutage ? "text-rose-600 font-bold" : ws.health === "Degraded" ? "text-amber-600" : "text-emerald-600"}>
                        {ws.health}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT PANEL: WORKSPACE 360 (55%) ─────────────────────────── */}
        <div
          className="flex-1 min-w-0 bg-[var(--surface)] rounded-2xl border border-[var(--card-border)] shadow-xs flex flex-col p-3.5 sm:p-5 overflow-hidden lg:h-[calc(100dvh-17rem)]"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <div className="flex flex-col h-full overflow-y-auto">
          <div className="p-3.5 sm:p-4 border-b border-[var(--divider)] bg-[var(--surface)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[var(--text-heading)] shrink-0 mt-0.5">
                  <Building2 size={24} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-bold text-[var(--text-heading)]">
                      {selectedWorkspace.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 text-[var(--text-heading)]">
                      {selectedWorkspace.id}
                      <button
                        onClick={() => handleCopyId(selectedWorkspace.id)}
                        className="text-[var(--text-muted)] hover:text-[var(--text-heading)] ml-1"
                      >
                        {copiedId === selectedWorkspace.id ? <Check size={11} className="text-emerald-500 inline" /> : <Copy size={11} className="inline" />}
                      </button>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedWorkspace.health === "Critical Outage"
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950 border border-rose-300 animate-pulse"
                        : selectedWorkspace.health === "Degraded"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {selectedWorkspace.health}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-1 flex-wrap">
                    <span>{selectedWorkspace.orgName}</span>
                    <span>·</span>
                    <span className="font-semibold text-purple-700">{selectedWorkspace.tier}</span>
                    <span>·</span>
                    <span className="font-mono">Namespace: {selectedWorkspace.k8sNamespace}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                <button
                  onClick={handleTriggerProbe}
                  disabled={isProbing}
                  className="tap-pop flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--sidebar-active)] bg-[var(--sidebar-active)] text-white hover:bg-[var(--sidebar-active)]/90 text-xs font-semibold shadow-2xs"
                >
                  <Play size={12} />
                  <span>{isProbing ? "Running Probe..." : "Run Infra Probe"}</span>
                </button>
              </div>
            </div>

            {probeResult && (
              <div className="mt-3 p-2.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] border border-emerald-900/50 flex items-start justify-between gap-2">
                <span>{probeResult}</span>
                <button onClick={() => setProbeResult(null)} className="text-slate-400 hover:text-white">
                  <X size={12} />
                </button>
              </div>
            )}

            <div className="flex items-center gap-1 mt-3 border-b border-[var(--divider)] overflow-x-auto scrollbar-none text-xs">
              {[
                { id: "overview", label: "Overview & Topology" },
                { id: "telemetry-attribution", label: "Telemetry Attribution (4xx vs 5xx)" },
                { id: "quotas", label: "TPS & Resource Quotas" },
                { id: "circuit-breakers", label: "Circuit Breakers" },
                { id: "traces", label: "OpenTelemetry Traces" },
                { id: "incidents", label: "Incidents & Blast Radius" },
                { id: "diagnostics", label: "Diagnostic Runner" },
                { id: "audit", label: "Audit Ledger" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as WorkspaceTab)}
                  className={`px-3 py-1.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-[var(--sidebar-active)] text-[var(--sidebar-active)] font-bold"
                      : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 sm:p-4 overflow-y-auto flex-1 text-xs">
            {activeTab === "overview" && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                    <span className="text-[10px] text-[var(--text-muted)]">K8s Namespace</span>
                    <div className="font-bold text-xs text-[var(--text-heading)] mt-0.5 font-mono truncate">
                      {selectedWorkspace.k8sNamespace}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                    <span className="text-[10px] text-[var(--text-muted)]">Database Shard</span>
                    <div className="font-bold text-xs text-[var(--text-heading)] mt-0.5 font-mono truncate">
                      {selectedWorkspace.dbShard}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                    <span className="text-[10px] text-[var(--text-muted)]">Replica Lag</span>
                    <div className="font-bold text-xs text-emerald-600 mt-0.5 font-mono">
                      {selectedWorkspace.dbReplicaLagMs} ms
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                    <span className="text-[10px] text-[var(--text-muted)]">Ingress Edge VIP</span>
                    <div className="font-bold text-xs text-[var(--text-heading)] mt-0.5 font-mono truncate">
                      {selectedWorkspace.ingressVip}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                  <span className="font-bold text-xs text-[var(--text-heading)] mb-2 block">
                    Active Product Bridges &amp; Integrations
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {selectedWorkspace.activeProducts.map((prod) => (
                      <div key={prod} className="p-2 rounded-lg border border-[var(--divider)] bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
                        <ProductIcon product={prod} size={18} className="shrink-0" />
                        <span className="font-medium text-xs text-[var(--text-heading)] truncate">{prod}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "telemetry-attribution" && (
              <div className="flex flex-col gap-4">
                <div className="p-3.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold">
                      Tenant-Attributed Errors (4xx): {selectedWorkspace.telemetryAttribution.client4xxPct}%
                    </span>
                    <span className={`font-bold ${
                      selectedWorkspace.telemetryAttribution.server5xxPct > 20 ? "text-rose-600" : "text-emerald-600"
                    }`}>
                      Platform-Attributed Faults (5xx): {selectedWorkspace.telemetryAttribution.server5xxPct}%
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                    <div
                      style={{ width: `${selectedWorkspace.telemetryAttribution.client4xxPct}%` }}
                      className="bg-blue-500 h-full transition-all"
                    />
                    <div
                      style={{ width: `${selectedWorkspace.telemetryAttribution.server5xxPct}%` }}
                      className="bg-rose-500 h-full transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                  <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                    <span className="text-[10px] text-[var(--text-muted)]">401 HMAC Auth Failed</span>
                    <div className="text-base font-bold text-amber-600 mt-0.5">
                      {selectedWorkspace.telemetryAttribution.error401HmacCount.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                    <span className="text-[10px] text-[var(--text-muted)]">429 Rate Limit Tripped</span>
                    <div className="text-base font-bold text-blue-600 mt-0.5">
                      {selectedWorkspace.telemetryAttribution.error429RateLimitCount.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                    <span className="text-[10px] text-[var(--text-muted)]">504 Gateway Timeout</span>
                    <div className="text-base font-bold text-rose-600 mt-0.5">
                      {selectedWorkspace.telemetryAttribution.error504GatewayCount.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                    <span className="text-[10px] text-[var(--text-muted)]">500 Server Error</span>
                    <div className="text-base font-bold text-rose-600 mt-0.5">
                      {selectedWorkspace.telemetryAttribution.error500SystemCount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "quotas" && (
              <div className="p-3.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[var(--text-heading)]">
                    Throughput: {selectedWorkspace.currentTps} TPS / {selectedWorkspace.maxTpsQuota} TPS Quota
                  </span>
                  <span className="font-mono font-bold text-purple-600">
                    {Math.round((selectedWorkspace.currentTps / selectedWorkspace.maxTpsQuota) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, Math.round((selectedWorkspace.currentTps / selectedWorkspace.maxTpsQuota) * 100))}%` }}
                    className="bg-purple-600 h-full rounded-full transition-all"
                  />
                </div>
              </div>
            )}

            {activeTab === "circuit-breakers" && (
              <div className="space-y-2">
                {selectedWorkspace.circuitBreakers.map((cb) => (
                  <div
                    key={cb.rail}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      cb.state === "Open"
                        ? "border-rose-300 bg-rose-50/50 text-rose-800"
                        : cb.state === "Half-Open"
                        ? "border-amber-300 bg-amber-50/50 text-amber-800"
                        : "border-[var(--divider)] bg-[var(--surface)] text-[var(--text-heading)]"
                    }`}
                  >
                    <div>
                      <span className="font-bold block">{cb.rail}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">Failure: {cb.failureRate}%</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      cb.state === "Open" ? "bg-rose-600 text-white" : cb.state === "Half-Open" ? "bg-amber-500 text-white" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {cb.state}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "traces" && (
              <div className="p-3.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)] text-xs font-mono">
                <div className="text-[var(--text-heading)] font-bold mb-1">{selectedWorkspace.traceSample.traceId}</div>
                <div className="text-[var(--text-muted)] mb-2">{selectedWorkspace.traceSample.rootSpan} · {selectedWorkspace.traceSample.durationMs}ms</div>
                <div className="p-2 rounded bg-slate-950 text-rose-400">{selectedWorkspace.traceSample.errorSummary}</div>
              </div>
            )}

            {activeTab === "incidents" && (
              <div>
                {selectedWorkspace.activeOutageId ? (
                  <div className="p-4 rounded-xl border border-rose-300 bg-rose-50/40 text-xs">
                    <span className="font-bold block text-sm text-rose-800 mb-1">{selectedWorkspace.activeOutageId} Active Outage</span>
                    <p className="text-rose-700 mb-2">{selectedWorkspace.outageImpactSummary}</p>
                    <Link href="/devops-sre/incidents" className="tap-pop px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs inline-flex items-center gap-1">
                      Open Incident 360 <ArrowRight size={12} />
                    </Link>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-[var(--text-muted)] border border-dashed rounded-xl">
                    <CheckCircle2 size={20} className="text-emerald-500 mx-auto mb-1" />
                    No active outages impacting this workspace.
                  </div>
                )}
              </div>
            )}

            {activeTab === "diagnostics" && (
              <div className="p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)] text-xs">
                <span className="font-bold block mb-1">Synthetic Infrastructure Probes</span>
                <p className="text-[var(--text-muted)] mb-3">Execute on-demand probe for this tenant.</p>
                <button onClick={handleTriggerProbe} disabled={isProbing} className="tap-pop px-3 py-1.5 rounded-xl bg-[var(--sidebar-active)] text-white font-bold text-xs">
                  {isProbing ? "Running..." : "Run Complete Probe"}
                </button>
              </div>
            )}

            {activeTab === "audit" && (
              <div className="space-y-2 font-mono text-xs">
                {selectedWorkspace.recentAudit.map((evt, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-900 border border-[var(--divider)]">
                    <span>{evt.time} {evt.action} by {evt.actor}</span>
                    <span className="font-bold text-emerald-600">{evt.status}</span>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

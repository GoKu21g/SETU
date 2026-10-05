"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  History,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  FileText,
  RefreshCw,
  TrendingUp,
  X,
  SlidersHorizontal,
  Code,
  Check,
  Copy,
  ExternalLink,
  Lock,
  Hash,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import Card from "@/components/shared/Card";
import FilterDropdown, { type FilterDropdownOption } from "@/components/shared/FilterDropdown";
import UserAvatar from "@/components/shared/UserAvatar";

export interface SreAuditLogFull {
  id: string;
  timestamp: string;
  timeRelative: string;
  merkleLeafIndex: number;
  sha256Hash: string;
  kmsVerification: string;
  actor: {
    name: string;
    role: string;
    email: string;
    avatar?: string;
  };
  action: string;
  actionCategory: "Incident Lifecycle" | "Rollback Governance" | "Circuit Breaker" | "Break-Glass Access";
  targetObject: string;
  targetType: "Incident" | "CircuitBreaker" | "AccessGrant" | "Release";
  result: "Success" | "Failed" | "Blocked";
  stateDiff: Array<{ field: string; before: string; after: string }>;
  beforeState: string;
  afterState: string;
  relatedObjects: {
    incidentId?: string;
    releaseVersion?: string;
    workspaceId?: string;
  };
  rawJsonPayload: string;
  ipAddress: string;
  userAgent: string;
  justification: string;
}

export const SRE_AUDIT_LOGS_DATA: SreAuditLogFull[] = [
  {
    id: "aud_9a4f210e8b29",
    timestamp: "2026-09-26 12:45:10 UTC",
    timeRelative: "12m ago",
    merkleLeafIndex: 10492,
    sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    kmsVerification: "VALID (AWS KMS ap-south-1)",
    actor: {
      name: "Arjun Mehta",
      role: "Lead SRE",
      email: "arjun.mehta@setu.co",
      avatar: "AM"
    },
    action: "Transition Incident Status",
    actionCategory: "Incident Lifecycle",
    targetObject: "Incident: INC-1042 (Meta WhatsApp Egress Failure)",
    targetType: "Incident",
    result: "Success",
    stateDiff: [
      { field: "status", before: "Triaged", after: "Investigating" },
      { field: "severity", before: "P2-High", after: "P1-Critical" },
      { field: "commander", before: "Unassigned", after: "Arjun Mehta [Lead SRE]" }
    ],
    beforeState: JSON.stringify({ id: "INC-1042", status: "Triaged", severity: "P2-High", commander: null }, null, 2),
    afterState: JSON.stringify({ id: "INC-1042", status: "Investigating", severity: "P1-Critical", commander: "Arjun Mehta" }, null, 2),
    relatedObjects: {
      incidentId: "INC-1042",
      releaseVersion: "v3.4.1",
      workspaceId: "WS-94812"
    },
    rawJsonPayload: JSON.stringify({
      version: "2.4",
      eventId: "aud_9a4f210e8b29",
      merkleRoot: "0x8f192b4c10aef731...",
      leafIndex: 10492,
      action: "Transition Incident Status",
      actor: { email: "arjun.mehta@setu.co", role: "Lead SRE" },
      target: "INC-1042",
      signature: "MEQCID...KMS_VALIDATED"
    }, null, 2),
    ipAddress: "10.0.14.82",
    userAgent: "Setu-SRE-Console/v2.4 (macOS; arm64)",
    justification: "Escalated to P1 due to 48 enterprise tenants facing outbound notification drop"
  },
  {
    id: "aud_7b12cd4e01aa",
    timestamp: "2026-09-26 12:35:12 UTC",
    timeRelative: "22m ago",
    merkleLeafIndex: 10491,
    sha256Hash: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
    kmsVerification: "VALID (AWS KMS ap-south-1)",
    actor: {
      name: "Priyanka Rao",
      role: "Lead Platform",
      email: "priyanka.rao@setu.co",
      avatar: "PR"
    },
    action: "Append Incident Mitigation Note",
    actionCategory: "Incident Lifecycle",
    targetObject: "Incident: INC-1042",
    targetType: "Incident",
    result: "Success",
    stateDiff: [
      { field: "mitigationNotes", before: "None recorded", after: "Coordinated with Customer Support for tenant token re-auth" }
    ],
    beforeState: JSON.stringify({ incidentId: "INC-1042", notes: "" }, null, 2),
    afterState: JSON.stringify({ incidentId: "INC-1042", notes: "Coordinated with Customer Support for tenant token re-auth" }, null, 2),
    relatedObjects: {
      incidentId: "INC-1042"
    },
    rawJsonPayload: JSON.stringify({
      eventId: "aud_7b12cd4e01aa",
      action: "Append Incident Mitigation Note",
      actor: "priyanka.rao@setu.co",
      target: "INC-1042"
    }, null, 2),
    ipAddress: "10.0.14.90",
    userAgent: "Setu-SRE-Console/v2.4 (Chrome/Linux)",
    justification: "Publishing workaround for active support teams"
  },
  {
    id: "aud_5c88ea210f99",
    timestamp: "2026-09-26 12:28:00 UTC",
    timeRelative: "29m ago",
    merkleLeafIndex: 10490,
    sha256Hash: "88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589",
    kmsVerification: "VALID (AWS KMS ap-south-1)",
    actor: {
      name: "Setu Sentinel Bot",
      role: "System Automation",
      email: "sentinel-bot@internal.setu.co",
      avatar: "SB"
    },
    action: "Trip Circuit Breaker to Open",
    actionCategory: "Circuit Breaker",
    targetObject: "Rail: INT-META (Meta WhatsApp Cloud API)",
    targetType: "CircuitBreaker",
    result: "Success",
    stateDiff: [
      { field: "circuitBreakerState", before: "Closed (Normal)", after: "Open (Tripped)" },
      { field: "failureRateThreshold", before: "5.0%", after: "4.8% triggered" }
    ],
    beforeState: JSON.stringify({ railId: "INT-META", state: "Closed" }, null, 2),
    afterState: JSON.stringify({ railId: "INT-META", state: "Open", tripReason: "4.8% error rate" }, null, 2),
    relatedObjects: {
      incidentId: "INC-1042"
    },
    rawJsonPayload: JSON.stringify({
      eventId: "aud_5c88ea210f99",
      action: "Trip Circuit Breaker to Open",
      actor: "Setu Sentinel Bot",
      target: "INT-META"
    }, null, 2),
    ipAddress: "127.0.0.1 (Internal Cluster)",
    userAgent: "SentinelDaemon/v3.1.0",
    justification: "Automatic protection to stop cascaded thread exhaustion"
  },
  {
    id: "aud_3e11ba992c44",
    timestamp: "2026-09-26 12:12:00 UTC",
    timeRelative: "45m ago",
    merkleLeafIndex: 10489,
    sha256Hash: "1203b879a9578f192b4c10aef731853488d4266fd4e6338d13b845fcf289579d",
    kmsVerification: "VALID (AWS KMS ap-south-1)",
    actor: {
      name: "Datadog Sentinel Webhook",
      role: "Telemetry Ingestion",
      email: "datadog-webhook@datadoghq.com",
      avatar: "DD"
    },
    action: "Ingest SLO Error Budget Breach",
    actionCategory: "Incident Lifecycle",
    targetObject: "Service: svc-whatsapp-egress",
    targetType: "Incident",
    result: "Success",
    stateDiff: [
      { field: "burnRate", before: "1.0x (Normal)", after: "14.2x (Fast Burn)" },
      { field: "incidentTriggered", before: "None", after: "INC-1042 created" }
    ],
    beforeState: JSON.stringify({ serviceId: "svc-whatsapp-egress", burnRate: 1.0 }, null, 2),
    afterState: JSON.stringify({ serviceId: "svc-whatsapp-egress", burnRate: 14.2, incidentCreated: "INC-1042" }, null, 2),
    relatedObjects: {
      incidentId: "INC-1042"
    },
    rawJsonPayload: JSON.stringify({
      eventId: "aud_3e11ba992c44",
      action: "Ingest SLO Error Budget Breach",
      actor: "Datadog Sentinel Webhook"
    }, null, 2),
    ipAddress: "199.27.76.120",
    userAgent: "Datadog-Webhook/1.0",
    justification: "SLO budget burn exceeded 2% in 1 hour"
  },
  {
    id: "aud_1a99ef8801bb",
    timestamp: "2026-09-25 18:20:00 UTC",
    timeRelative: "18h ago",
    merkleLeafIndex: 10488,
    sha256Hash: "9a4f210e8b29e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495",
    kmsVerification: "VALID (AWS KMS ap-south-1)",
    actor: {
      name: "Arjun Mehta",
      role: "Lead SRE",
      email: "arjun.mehta@setu.co",
      avatar: "AM"
    },
    action: "Break-Glass Production Access",
    actionCategory: "Break-Glass Access",
    targetObject: "K8s Cluster: prod-bom-01",
    targetType: "AccessGrant",
    result: "Success",
    stateDiff: [
      { field: "roleBinding", before: "sre-readonly", after: "cluster-admin (30 min lease)" }
    ],
    beforeState: JSON.stringify({ actor: "arjun.mehta", binding: "sre-readonly" }, null, 2),
    afterState: JSON.stringify({ actor: "arjun.mehta", binding: "cluster-admin", expiry: "18:50:00 UTC" }, null, 2),
    relatedObjects: {},
    rawJsonPayload: JSON.stringify({
      eventId: "aud_1a99ef8801bb",
      action: "Break-Glass Production Access",
      actor: "arjun.mehta@setu.co",
      target: "prod-bom-01"
    }, null, 2),
    ipAddress: "10.0.14.82",
    userAgent: "Setu-SRE-Console/v2.4 (macOS; arm64)",
    justification: "Diagnosing thread lock on payment router pods under CAB emergency procedure"
  }
];

type AuditTab =
  | "details"
  | "state-diff"
  | "cryptographic-seal"
  | "related-objects"
  | "timeline-chain"
  | "raw-json";

export default function SreAuditPage() {
  const [logs, setLogs] = useState<SreAuditLogFull[]>(SRE_AUDIT_LOGS_DATA);
  const [selectedId, setSelectedId] = useState<string>("aud_9a4f210e8b29");
  const [activeTab, setActiveTab] = useState<AuditTab>("details");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActor, setFilterActor] = useState("all");
  const [filterAction, setFilterAction] = useState("all");
  const [filterResult, setFilterResult] = useState("all");
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  // Raw JSON Modal State
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const selectedLog = useMemo(() => {
    return logs.find((l) => l.id === selectedId) || logs[0];
  }, [logs, selectedId]);

  // Derived filter options
  const actorOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Actors" },
    { value: "Arjun Mehta", label: "Arjun Mehta [Lead SRE]" },
    { value: "Priyanka Rao", label: "Priyanka Rao [Lead Platform]" },
    { value: "Setu Sentinel Bot", label: "Setu Sentinel Bot [System]" },
    { value: "Datadog Sentinel Webhook", label: "Datadog Sentinel Webhook" },
  ];

  const actionOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Action Categories" },
    { value: "Incident Lifecycle", label: "Incident Lifecycle" },
    { value: "Rollback Governance", label: "Rollback Governance" },
    { value: "Circuit Breaker", label: "Circuit Breaker" },
    { value: "Break-Glass Access", label: "Break-Glass Access" },
  ];

  const resultOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Verdicts" },
    { value: "Success", label: "Success" },
    { value: "Failed", label: "Failed" },
    { value: "Blocked", label: "Blocked" },
  ];

  const sortOptions: FilterDropdownOption[] = [
    { value: "latest", label: "Latest Events First" },
    { value: "oldest", label: "Earliest Events First" },
  ];

  // Filtering
  const filteredLogs = useMemo(() => {
    const list = logs.filter((l) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          l.id.toLowerCase().includes(q) ||
          l.actor.name.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.targetObject.toLowerCase().includes(q) ||
          l.sha256Hash.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (filterActor !== "all" && l.actor.name !== filterActor) return false;
      if (filterAction !== "all" && l.actionCategory !== filterAction) return false;
      if (filterResult !== "all" && l.result !== filterResult) return false;
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === "oldest") return a.merkleLeafIndex - b.merkleLeafIndex;
      return b.merkleLeafIndex - a.merkleLeafIndex;
    });
  }, [logs, searchQuery, filterActor, filterAction, filterResult, sortBy]);

  // KPI Calculations
  const totalMutations = 1842;
  const cryptoSealsPct = "100%";
  const sreIncidentMutations = 48;
  const rollbackRequests = 3;
  const breakGlassSessions = 1;
  const automatedAgentEvents = 1790;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

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
          HEADER SECTION (Breadcrumb, Title, Subtitle, Badges)
      ────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 py-1.5 px-1 sm:px-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[var(--text-muted)] font-normal">Audit</span>
          <span className="text-[var(--text-muted)]/60 font-light">&gt;</span>
          <span className="font-bold text-[var(--text-heading)]">Cryptographic Ledger</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mt-0.5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-heading)]">
                Audit Explorer &amp; State Mutation Ledger
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <ShieldCheck size={11} className="text-emerald-600" />
                SHA-256 SEALED
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Tamper-resistant cryptographic audit trail tracking all SRE state mutations, rollback declarations, circuit trips, and break-glass production sessions.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                showToast("Audit chain verified: 10,492 / 10,492 Merkle blocks valid");
              }}
              className="tap-pop flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)] hover:bg-[var(--search-bg)] text-[var(--text-heading)] text-xs font-semibold shadow-2xs transition-colors"
            >
              <RefreshCw size={13} className="text-[var(--sidebar-active)]" />
              <span>Verify Merkle Chain</span>
            </button>
            <button
              onClick={() => setIsJsonModalOpen(true)}
              className="tap-pop flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--sidebar-active)] hover:opacity-90 text-white text-xs font-semibold shadow-xs transition-opacity"
            >
              <FileText size={13} />
              <span>Export Signed Ledger</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 5: 6 KPI SUMMARY CARDS (Clickable filter cards)
      ────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 px-1 sm:px-2 mb-3">
        {/* Card 1: Total Mutations */}
        <div
          onClick={() => {
            setFilterActor("all");
            setFilterAction("all");
            setFilterResult("all");
            setSearchQuery("");
          }}
          className="cursor-pointer group flex flex-col justify-between p-3 rounded-2xl border border-[var(--divider)] bg-[var(--surface)] hover:border-[var(--sidebar-active)]/40 hover:shadow-xs transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-medium">
            <span>Total Mutations</span>
            <FileText size={13} className="text-slate-500" />
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-heading)] font-mono">
              {totalMutations}
            </span>
            <div className="flex items-center gap-1 mt-0.5 text-[10px] text-emerald-600 font-bold">
              <TrendingUp size={10} />
              <span>+142 this week</span>
            </div>
          </div>
        </div>

        {/* Card 2: Cryptographic Seals */}
        <div className="flex flex-col justify-between p-3 rounded-2xl border border-[var(--divider)] bg-[var(--surface)] shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-medium">
            <span>Crypto Sealed</span>
            <ShieldCheck size={13} className="text-emerald-500" />
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600 font-mono">
              {cryptoSealsPct}
            </span>
            <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
              10,492 Merkle blocks
            </div>
          </div>
        </div>

        {/* Card 3: Incident Mutations */}
        <div
          onClick={() => {
            setFilterAction("Incident Lifecycle");
            setSearchQuery("");
          }}
          className={`cursor-pointer group flex flex-col justify-between p-3 rounded-2xl border transition-all shadow-2xs ${
            filterAction === "Incident Lifecycle"
              ? "border-rose-500 bg-rose-50/10 shadow-xs"
              : "border-[var(--divider)] bg-[var(--surface)] hover:border-rose-400"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-medium">
            <span>Incident Lifecycle</span>
            <span className="h-2 w-2 rounded-full bg-rose-500" />
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-rose-600 font-mono">
              {sreIncidentMutations}
            </span>
            <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
              State transitions &amp; PIRs
            </div>
          </div>
        </div>

        {/* Card 4: Rollback Requests */}
        <div
          onClick={() => {
            setFilterAction("Rollback Governance");
            setSearchQuery("");
          }}
          className={`cursor-pointer group flex flex-col justify-between p-3 rounded-2xl border transition-all shadow-2xs ${
            filterAction === "Rollback Governance"
              ? "border-amber-500 bg-amber-50/10 shadow-xs"
              : "border-[var(--divider)] bg-[var(--surface)] hover:border-amber-400"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-medium">
            <span>Rollback Governed</span>
            <span className="h-2 w-2 rounded-full bg-amber-500" />
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-amber-600 font-mono">
              {rollbackRequests}
            </span>
            <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
              Dual-CAB signoffs
            </div>
          </div>
        </div>

        {/* Card 5: Break-Glass Sessions */}
        <div
          onClick={() => {
            setFilterAction("Break-Glass Access");
            setSearchQuery("");
          }}
          className={`cursor-pointer group flex flex-col justify-between p-3 rounded-2xl border transition-all shadow-2xs ${
            filterAction === "Break-Glass Access"
              ? "border-purple-500 bg-purple-50/10 shadow-xs"
              : "border-[var(--divider)] bg-[var(--surface)] hover:border-purple-400"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-medium">
            <span>Break-Glass Access</span>
            <Lock size={13} className="text-purple-500" />
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-purple-600 font-mono">
              {breakGlassSessions}
            </span>
            <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
              Privileged prod leases
            </div>
          </div>
        </div>

        {/* Card 6: Automated Agent Events */}
        <div
          onClick={() => {
            setFilterActor("Setu Sentinel Bot");
            setSearchQuery("");
          }}
          className={`cursor-pointer group flex flex-col justify-between p-3 rounded-2xl border transition-all shadow-2xs ${
            filterActor === "Setu Sentinel Bot"
              ? "border-indigo-500 bg-indigo-50/10 shadow-xs"
              : "border-[var(--divider)] bg-[var(--surface)] hover:border-indigo-400"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-medium">
            <span>Autonomous Events</span>
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-indigo-600 font-mono">
              {automatedAgentEvents}
            </span>
            <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
              97.2% automated audit
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 6: SEARCH & FILTER BAR
      ────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-1 sm:px-2 mb-3">
        <div className="flex items-center gap-2 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event ID, actor, action, SHA-256 hash..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)] text-xs text-[var(--text-heading)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--sidebar-active)]"
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

          {/* Actor Dropdown */}
          <FilterDropdown
            label="Actor"
            value={filterActor}
            options={actorOptions}
            onChange={(val) => setFilterActor(val)}
          />

          {/* Action Category Dropdown */}
          <FilterDropdown
            label="Category"
            value={filterAction}
            options={actionOptions}
            onChange={(val) => setFilterAction(val)}
          />

          {/* Result Dropdown */}
          <FilterDropdown
            label="Verdict"
            value={filterResult}
            options={resultOptions}
            onChange={(val) => setFilterResult(val)}
          />
        </div>

        {/* Right Tools: Sort & Reset */}
        <div className="flex items-center gap-2 shrink-0">
          {(searchQuery || filterActor !== "all" || filterAction !== "all" || filterResult !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterActor("all");
                setFilterAction("all");
                setFilterResult("all");
              }}
              className="tap-pop flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}

          <FilterDropdown
            label="Sort"
            value={sortBy}
            options={sortOptions}
            onChange={(val) => setSortBy(val as "latest" | "oldest")}
          />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 7 & 8: 2-COLUMN SPLIT (Left 45% Events List / Right 55% Inspector)
      ────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-3 px-1 sm:px-2 min-h-0 flex-1">
        {/* ── LEFT PANEL: AUDIT EVENTS (45%) ───────────────────────────── */}
        <div
          className="w-full lg:w-[45%] shrink-0 bg-[var(--surface)] rounded-2xl border border-[var(--card-border)] shadow-xs flex flex-col p-3 sm:p-3.5 max-h-[520px] lg:max-h-none lg:h-[calc(100dvh-17rem)] overflow-hidden"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--divider)]">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-heading)] leading-tight">
                Audit Records ({filteredLogs.length})
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                KMS-sealed tamper-evident operational telemetry
              </p>
            </div>
            <FilterDropdown
              label="Sort"
              value={sortBy}
              options={sortOptions}
              onChange={(val) => setSortBy(val as "latest" | "oldest")}
              align="right"
            />
          </div>

          <div className="flex-1 overflow-y-auto pt-2 space-y-2 pr-0.5">
            {filteredLogs.map((log) => {
              const isSelected = log.id === selectedId;

              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedId(log.id)}
                  className={`tap-pop cursor-pointer text-left rounded-xl border p-3 transition-all relative ${
                    isSelected
                      ? "border-[var(--sidebar-active)] bg-[var(--sidebar-active)]/[0.04] shadow-xs ring-1 ring-[var(--sidebar-active)]"
                      : "border-[var(--divider)] bg-[var(--surface)] hover:border-[var(--sidebar-active)]/40 hover:bg-[var(--search-bg)]"
                  } ${
                    log.actionCategory === "Break-Glass Access"
                      ? "border-l-4 border-l-amber-500"
                      : log.actionCategory === "Incident Lifecycle"
                      ? "border-l-4 border-l-rose-500"
                      : "border-l-4 border-l-emerald-500"
                  }`}
                >
                  {/* Top Row: Action Tag + Event ID + Result Pill */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-xs text-[var(--text-heading)] font-mono truncate">
                        {log.action}
                      </span>
                      <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)]">
                        {log.id.slice(0, 10)}
                      </span>
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.result === "Success"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                      }`}>
                        {log.result}
                      </span>
                    </div>
                  </div>

                  {/* Target Object */}
                  <div className="text-xs text-[var(--text-heading)] font-medium mb-1.5 truncate">
                    Target: {log.targetObject}
                  </div>

                  {/* Actor + Timestamp Snippet */}
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mb-2">
                    <div className="flex items-center gap-1.5">
                      <UserAvatar name={log.actor.name} size={18} />
                      <span className="truncate">{log.actor.name}</span>
                    </div>
                    <span>{log.timeRelative}</span>
                  </div>

                  {/* Bottom Bar: Merkle Leaf & SHA-256 preview */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-[var(--divider)] text-[10px] font-mono text-[var(--text-muted)]">
                    <span>Leaf #{log.merkleLeafIndex}</span>
                    <span className="truncate max-w-[200px]">{log.sha256Hash.slice(0, 20)}...</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT PANEL: AUDIT INSPECTOR (55%) ───────────────────────── */}
        <div
          className="flex-1 min-w-0 bg-[var(--surface)] rounded-2xl border border-[var(--card-border)] shadow-xs flex flex-col p-3.5 sm:p-5 overflow-hidden lg:h-[calc(100dvh-17rem)]"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <div className="flex flex-col h-full overflow-y-auto">
          {/* Inspector Header */}
          <div className="p-3.5 sm:p-4 border-b border-[var(--divider)] bg-[var(--surface)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[var(--text-heading)] shrink-0 mt-0.5">
                  <ShieldCheck size={24} className="text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-bold text-[var(--text-heading)] font-mono">
                      {selectedLog.action}
                    </h2>
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 text-[var(--text-heading)]">
                      {selectedLog.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {selectedLog.result}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-1 flex-wrap">
                    <span>Actor: {selectedLog.actor.name} ({selectedLog.actor.role})</span>
                    <span>·</span>
                    <span>{selectedLog.timestamp}</span>
                    <span>·</span>
                    <span className="font-mono text-emerald-600 font-bold">KMS: {selectedLog.kmsVerification}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => setIsJsonModalOpen(true)}
                  className="tap-pop flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)] hover:bg-[var(--search-bg)] text-[var(--text-heading)] text-xs font-semibold shadow-2xs"
                >
                  <Code size={13} />
                  <span>Raw Cryptographic JSON</span>
                </button>
              </div>
            </div>

            {/* Inspector Tab Bar */}
            <div className="flex items-center gap-1 mt-3 border-b border-[var(--divider)] overflow-x-auto scrollbar-none text-xs">
              {[
                { id: "details", label: "Transaction Details" },
                { id: "state-diff", label: "State Mutation Diff" },
                { id: "cryptographic-seal", label: "SHA-256 Merkle Seal" },
                { id: "related-objects", label: "Related Objects" },
                { id: "timeline-chain", label: "Event Chain" },
                { id: "raw-json", label: "Payload Schema" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AuditTab)}
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

          {/* Inspector Content Area */}
          <div className="p-3.5 sm:p-4 overflow-y-auto flex-1 text-xs">
            {/* TAB 1: TRANSACTION DETAILS */}
            {activeTab === "details" && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                    <span className="text-[10px] text-[var(--text-muted)]">Client IP Address</span>
                    <div className="font-bold text-xs text-[var(--text-heading)] mt-0.5 font-mono">
                      {selectedLog.ipAddress}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                    <span className="text-[10px] text-[var(--text-muted)]">MFA Verification</span>
                    <div className="font-bold text-xs text-emerald-600 mt-0.5">
                      FIDO2 Hardware Key
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                    <span className="text-[10px] text-[var(--text-muted)]">Target Type</span>
                    <div className="font-bold text-xs text-[var(--text-heading)] mt-0.5">
                      {selectedLog.targetType}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                    <span className="text-[10px] text-[var(--text-muted)]">Merkle Leaf Index</span>
                    <div className="font-bold text-xs text-[var(--text-heading)] mt-0.5 font-mono">
                      #{selectedLog.merkleLeafIndex}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                  <span className="font-bold text-xs text-[var(--text-heading)] mb-1 block">
                    Operational Justification &amp; Authority Statement:
                  </span>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {selectedLog.justification}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: STATE DIFF */}
            {activeTab === "state-diff" && (
              <div className="flex flex-col gap-3">
                <div className="rounded-xl border border-[var(--divider)] overflow-hidden">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-[var(--divider)] text-[10px] text-[var(--text-muted)]">
                      <tr>
                        <th className="p-2.5">Field / Key</th>
                        <th className="p-2.5 text-rose-600">Before Mutation</th>
                        <th className="p-2.5 text-emerald-600">After Mutation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--divider)]">
                      {selectedLog.stateDiff.map((diff, i) => (
                        <tr key={i} className="hover:bg-[var(--search-bg)]/50">
                          <td className="p-2.5 font-bold text-[var(--text-heading)]">{diff.field}</td>
                          <td className="p-2.5 text-rose-600 line-through bg-rose-50/10">{diff.before}</td>
                          <td className="p-2.5 text-emerald-600 font-bold bg-emerald-50/10">{diff.after}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Raw State Payloads */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-[11px]">
                  <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/20">
                    <span className="font-bold text-rose-700 block mb-1">State Before (JSON):</span>
                    <pre className="text-slate-700 dark:text-slate-300 overflow-x-auto">{selectedLog.beforeState}</pre>
                  </div>
                  <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/20">
                    <span className="font-bold text-emerald-700 block mb-1">State After (JSON):</span>
                    <pre className="text-slate-700 dark:text-slate-300 overflow-x-auto">{selectedLog.afterState}</pre>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SHA-256 MERKLE SEAL */}
            {activeTab === "cryptographic-seal" && (
              <div className="flex flex-col gap-4 font-mono">
                <div className="p-3.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-[var(--text-heading)] font-sans">
                      SHA-256 Merkle Leaf Hash
                    </span>
                    <button
                      onClick={() => handleCopyHash(selectedLog.sha256Hash)}
                      className="tap-pop flex items-center gap-1 text-[11px] text-[var(--sidebar-active)] font-sans"
                    >
                      {copiedHash === selectedLog.sha256Hash ? <Check size={12} /> : <Copy size={12} />}
                      <span>Copy Full Hash</span>
                    </button>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 text-emerald-400 text-[11px] break-all border border-emerald-900/40">
                    {selectedLog.sha256Hash}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-sans mt-2">
                    <span>Algorithm: SHA-256 with KMS Hardware HMAC</span>
                    <span className="text-emerald-600 font-bold">KMS Signature: VALID</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: RELATED OBJECTS */}
            {activeTab === "related-objects" && (
              <div className="flex flex-col gap-3 text-xs">
                <div className="p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                  <span className="font-bold text-xs text-[var(--text-heading)] mb-2 block">Linked Entity References</span>
                  <div className="space-y-2">
                    {selectedLog.relatedObjects.incidentId && (
                      <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-900 border border-[var(--divider)]">
                        <span>Incident: <strong className="font-mono">{selectedLog.relatedObjects.incidentId}</strong></span>
                        <Link href="/devops-sre/incidents" className="text-[var(--sidebar-active)] font-bold">
                          View in Incident 360 →
                        </Link>
                      </div>
                    )}
                    {selectedLog.relatedObjects.releaseVersion && (
                      <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-900 border border-[var(--divider)]">
                        <span>Release: <strong className="font-mono">{selectedLog.relatedObjects.releaseVersion}</strong></span>
                        <Link href="/devops-sre/releases" className="text-[var(--sidebar-active)] font-bold">
                          View in Release 360 →
                        </Link>
                      </div>
                    )}
                    {selectedLog.relatedObjects.workspaceId && (
                      <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-900 border border-[var(--divider)]">
                        <span>Tenant: <strong className="font-mono">{selectedLog.relatedObjects.workspaceId}</strong></span>
                        <Link href="/devops-sre/workspaces" className="text-[var(--sidebar-active)] font-bold">
                          View in Workspace 360 →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: TIMELINE CHAIN */}
            {activeTab === "timeline-chain" && (
              <div className="flex flex-col gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)] font-sans">
                  <span className="font-bold text-xs text-[var(--text-heading)] mb-2 block">Cryptographic Chain Verification</span>
                  <div className="space-y-2 font-mono text-[11px]">
                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-900">
                      Leaf #{selectedLog.merkleLeafIndex - 1}: Previous Block Hash verified
                    </div>
                    <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300">
                      Leaf #{selectedLog.merkleLeafIndex}: Current Event Committed [{selectedLog.action}]
                    </div>
                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-900">
                      Leaf #{selectedLog.merkleLeafIndex + 1}: Next Block Hash linked
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: RAW PAYLOAD SCHEMA */}
            {activeTab === "raw-json" && (
              <div className="rounded-xl border border-[var(--divider)] overflow-hidden font-mono text-xs">
                <div className="p-2 bg-slate-50 dark:bg-slate-900 border-b border-[var(--divider)] flex items-center justify-between">
                  <span className="font-sans font-bold text-xs">JSON Cryptographic Payload</span>
                  <button
                    onClick={() => handleCopyHash(selectedLog.rawJsonPayload)}
                    className="tap-pop text-[var(--sidebar-active)] font-sans text-[11px]"
                  >
                    Copy JSON
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 text-slate-100 text-[11px] overflow-x-auto leading-relaxed">
                  {selectedLog.rawJsonPayload}
                </pre>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          RAW CRYPTOGRAPHIC JSON MODAL
      ────────────────────────────────────────────────────────────────── */}
      {isJsonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl border border-[var(--divider)] bg-[var(--surface)] p-5 shadow-2xl text-[var(--text-heading)]">
            <div className="flex items-center justify-between border-b border-[var(--divider)] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Code className="text-emerald-600" size={18} />
                <h3 className="font-bold text-sm text-[var(--text-heading)] font-mono">
                  {selectedLog.id} · Cryptographic Payload
                </h3>
              </div>
              <button
                onClick={() => setIsJsonModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-heading)]"
              >
                <X size={16} />
              </button>
            </div>

            <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-[420px] leading-relaxed">
              {selectedLog.rawJsonPayload}
            </pre>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[var(--divider)] text-xs">
              <span className="text-[var(--text-muted)] font-mono">SHA-256 Merkle Sealed</span>
              <button
                onClick={() => {
                  handleCopyHash(selectedLog.rawJsonPayload);
                  showToast("Raw JSON copied to clipboard");
                }}
                className="tap-pop px-3 py-1.5 rounded-xl bg-[var(--sidebar-active)] text-white font-bold"
              >
                Copy JSON Payload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

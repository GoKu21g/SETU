"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Copy,
  Check,
  ExternalLink,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Globe,
  Flame,
  Wrench,
  Terminal,
  ShieldCheck,
  RefreshCw,
  FileText,
  Ticket,
  Link2,
  AlertCircle,
  Clock,
  Send,
  Sparkles,
  Zap,
  Share2,
  MoreHorizontal,
  Shield,
  Layers,
  ArrowRight,
} from "lucide-react";
import ProductIcon from "@/components/shared/ProductIcon";
import IntegrationIcon from "@/components/shared/IntegrationIcon";
import FilterDropdown, { FilterDropdownOption } from "@/components/shared/FilterDropdown";
import {
  MOCK_DIAGNOSTIC_RUNS,
  DiagnosticInvestigation,
  DiagnosticActionItem,
} from "@/lib/mock-data/diagnostics";
import { triggerRefresh } from "@/lib/events/refresh";

type InspectorTab =
  | "overview"
  | "actions"
  | "output"
  | "related"
  | "timeline"
  | "audit";

type SortOption = "latest" | "oldest" | "duration" | "status";

const SORT_OPTIONS: { id: SortOption; label: string; sub: string }[] = [
  { id: "latest", label: "Latest", sub: "Most recent first" },
  { id: "oldest", label: "Oldest", sub: "Earliest first" },
  { id: "duration", label: "Duration", sub: "Longest running first" },
  { id: "status", label: "Status (Errors first)", sub: "Prioritize failures" },
];

function statusPillClass(status: "Failed" | "Success" | "Warning" | number) {
  if (status === "Failed" || status === 401 || status === 503) {
    return "bg-[var(--status-critical-bg)] text-[var(--status-critical-fg)] border border-[var(--status-critical-fg)]/20";
  }
  if (status === "Warning" || status === 429) {
    return "bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)] border border-[var(--status-warning-fg)]/20";
  }
  return "bg-[var(--status-healthy-bg)] text-[var(--status-healthy-fg)] border border-[var(--status-healthy-fg)]/20";
}

function riskBadgeClass(risk: string) {
  if (risk === "SAFE") {
    return "bg-[var(--status-healthy-bg)] text-[var(--status-healthy-fg)] border border-[var(--status-healthy-fg)]/20";
  }
  if (risk === "APPROVAL REQUIRED") {
    return "bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)] border border-[var(--status-warning-fg)]/20";
  }
  return "bg-[var(--status-critical-bg)] text-[var(--status-critical-fg)] border border-[var(--status-critical-fg)]/20";
}

function DiagnosticWorkbenchContent() {
  const searchParams = useSearchParams();
  const initialTarget = searchParams.get("target");

  // Runs queue state
  const [runs, setRuns] = useState<DiagnosticInvestigation[]>(MOCK_DIAGNOSTIC_RUNS);
  
  // Selected investigation
  const [selectedId, setSelectedId] = useState<string>(() => {
    if (initialTarget) {
      const match = MOCK_DIAGNOSTIC_RUNS.find((r) => r.workspace.id === initialTarget);
      if (match) return match.id;
    }
    return "diag-101"; // Chat with Sahayogi / Sharma Traders default
  });

  // Active Inspector tab
  const [activeTab, setActiveTab] = useState<InspectorTab>("overview");

  // Filters & Search
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [integrationFilter, setIntegrationFilter] = useState("all");
  const [envFilter, setEnvFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Execution & modal state
  const [confirmModalProbe, setConfirmModalProbe] = useState<DiagnosticActionItem | null>(null);
  const [approvalModalProbe, setApprovalModalProbe] = useState<DiagnosticActionItem | null>(null);
  const [approvalReason, setApprovalReason] = useState("Customer escalated via TK-9011 for webhook revalidation.");
  const [approvalSubmitted, setApprovalSubmitted] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionToast, setExecutionToast] = useState<string | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Expandable terminal state
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(true);

  // Copy helper
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filter options derived from runs data
  const allProducts = useMemo(
    () => Array.from(new Set(runs.map((r) => r.product))).sort(),
    [runs]
  );
  const allServices = useMemo(
    () => Array.from(new Set(runs.map((r) => r.service))).sort(),
    [runs]
  );
  const allIntegrations = useMemo(
    () => Array.from(new Set(runs.map((r) => r.integration))).sort(),
    [runs]
  );

  const productOptions: FilterDropdownOption[] = useMemo(
    () => [
      { value: "all", label: "All Products" },
      ...allProducts.map((p) => ({ value: p, label: p })),
    ],
    [allProducts]
  );

  const serviceOptions: FilterDropdownOption[] = useMemo(
    () => [
      { value: "all", label: "All Services" },
      ...allServices.map((s) => ({ value: s, label: s })),
    ],
    [allServices]
  );

  const integrationOptions: FilterDropdownOption[] = useMemo(
    () => [
      { value: "all", label: "All Integrations" },
      ...allIntegrations.map((i) => ({ value: i, label: i })),
    ],
    [allIntegrations]
  );

  const statusOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Statuses", sub: "All diagnostic results" },
    { value: "failed", label: "Failed", sub: "Probes with failure result" },
    { value: "success", label: "Success", sub: "Nominal passed probes" },
  ];

  const envOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Environments", sub: "All deployment targets" },
    { value: "Production", label: "Production", sub: "Live customer traffic" },
    { value: "Staging", label: "Staging", sub: "Pre-release sandbox" },
  ];

  // Filtered and sorted queue
  const filteredRuns = useMemo(() => {
    const list = runs.filter((item) => {
      const q = search.toLowerCase().trim();
      if (q) {
        const haystack = [
          item.traceId,
          item.requestId,
          item.workspace.name,
          item.workspace.id,
          item.workspace.shortName,
          item.product,
          item.service,
          item.integration,
          item.endpoint,
          item.resultLabel,
          item.problem,
          item.incidentId || "",
          item.caseId || "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (productFilter !== "all" && item.product !== productFilter) return false;
      if (serviceFilter !== "all" && item.service !== serviceFilter) return false;
      if (integrationFilter !== "all" && item.integration !== integrationFilter) return false;
      if (envFilter !== "all" && item.environment !== envFilter) return false;
      if (statusFilter !== "all") {
        if (statusFilter === "failed" && item.status !== "Failed") return false;
        if (statusFilter === "success" && item.status !== "Success") return false;
      }
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === "latest") return b.id.localeCompare(a.id);
      if (sortBy === "oldest") return a.id.localeCompare(b.id);
      if (sortBy === "duration") return b.durationMs - a.durationMs;
      if (sortBy === "status") {
        if (a.status === "Failed" && b.status !== "Failed") return -1;
        if (a.status !== "Failed" && b.status === "Failed") return 1;
      }
      return 0;
    });
  }, [runs, search, productFilter, serviceFilter, integrationFilter, envFilter, statusFilter, sortBy]);

  // Selected investigation item
  const selectedInvestigation = useMemo(() => {
    return (
      filteredRuns.find((r) => r.id === selectedId) ??
      filteredRuns[0] ??
      runs[0]
    );
  }, [filteredRuns, selectedId, runs]);

  // Execute diagnostic action
  const handleExecuteDiagnostic = (probe: DiagnosticActionItem) => {
    setConfirmModalProbe(null);
    setIsExecuting(true);
    setActiveTab("output");

    setTimeout(() => {
      setIsExecuting(false);
      triggerRefresh({ source: `probe-${probe.id}` });
      setExecutionToast(`Diagnostic '${probe.name}' completed in ${probe.durationMs || 384}ms`);
      setTimeout(() => setExecutionToast(null), 4000);

      // Append log entry to selected run's execution output and timeline
      setRuns((prev) =>
        prev.map((r) => {
          if (r.id === selectedInvestigation.id) {
            const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            return {
              ...r,
              timeline: [
                {
                  time: timeNow,
                  actor: "Dhruv Singla",
                  action: `Diagnostic probe executed: ${probe.name}`,
                  result: probe.result === "Passed" ? "Passed (Nominal)" : "Failed (401 HMAC Mismatch)",
                  type: "diagnostic",
                },
                ...r.timeline,
              ],
              auditTrail: [
                {
                  eventId: `evt_prb_${Date.now().toString().slice(-6)}`,
                  correlationId: `corr_${probe.id}_${Date.now().toString().slice(-5)}`,
                  actor: "dhruv.singla@setu.co",
                  role: "Tier-2 Technical Support",
                  timestamp: `28 Sep 2026, ${timeNow} IST`,
                  environment: r.environment,
                  target: `${r.workspace.name} (${r.workspace.id})`,
                  action: probe.name.toUpperCase().replace(/\s+/g, "_"),
                  reason: r.caseId || "Routine Investigation",
                  result: probe.result === "Passed" ? "Success" : "Failed",
                  linkedIncident: r.incidentId,
                  linkedCase: r.caseId,
                },
                ...r.auditTrail,
              ],
            };
          }
          return r;
        })
      );
    }, 1200);
  };

  // Submit approval request
  const handleRequestApproval = () => {
    if (!approvalModalProbe) return;
    setApprovalModalProbe(null);
    setApprovalSubmitted(true);
    setExecutionToast(`Approval request dispatched to SRE On-call for '${approvalModalProbe.name}'`);
    setTimeout(() => {
      setApprovalSubmitted(false);
      setExecutionToast(null);
    }, 5000);
  };

  return (
    <div className="flex flex-col min-h-full text-[var(--text-heading)] -mt-2 -mx-1 sm:-mx-2 pb-16 screen-sm:pb-8">
      {/* Toast Notification */}
      {executionToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-[var(--status-healthy-fg)]/30 bg-[var(--surface)] px-4 py-3 text-xs font-semibold text-[var(--text-heading)] shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-[var(--status-healthy-fg)]" />
          <span>{executionToast}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 4: TOP HEADER
          Diagnostic Workbench
          Subtitle: Investigate product failures, integrations, services and platform incidents
          Top-right actions: [ Run Diagnostic ], [ More ▾ ]
      ────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2 px-1 sm:px-2 mb-2">
        <div className="flex items-center gap-2.5">
          <Link
            href="/technical-support/api-logs"
            title="Back to Technical Logs"
            className="tap-pop flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--divider)] bg-[var(--surface)] text-[var(--role-text)] shadow-2xs hover:bg-[var(--search-bg)] transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-heading)] leading-none">
              Diagnostic Workbench
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Investigate product failures, integrations, services and platform incidents
            </p>
          </div>
        </div>

        {/* Top-right actions */}
        <div className="flex items-center gap-2 relative">
          <button
            type="button"
            onClick={() => {
              const probe = selectedInvestigation.availableActions.find((a) => a.risk === "SAFE") || selectedInvestigation.availableActions[0];
              setConfirmModalProbe(probe);
            }}
            disabled={isExecuting}
            className="tap-pop flex items-center gap-1.5 rounded-xl bg-[var(--accent-solid)] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isExecuting ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <Play size={13} className="fill-white" />
            )}
            <span>{isExecuting ? "Executing Probe..." : "Run Diagnostic"}</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoreMenu((v) => !v)}
              className="flex items-center gap-1 rounded-xl border border-[var(--divider)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] shadow-xs hover:bg-[var(--search-bg)] transition-colors cursor-pointer"
            >
              <span>More</span>
              <ChevronDown size={13} />
            </button>

            {showMoreMenu && (
              <div
                className="absolute right-0 mt-1.5 w-56 rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-1.5 shadow-lg z-30 text-xs"
                onMouseLeave={() => setShowMoreMenu(false)}
              >
                <Link
                  href="/technical-support/api-logs"
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[var(--text-secondary)] hover:bg-[var(--search-bg)] hover:text-[var(--text-heading)] transition-colors"
                >
                  <Terminal size={13} />
                  <span>Open Technical Logs</span>
                </Link>
                <Link
                  href="/technical-support/incidents"
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[var(--text-secondary)] hover:bg-[var(--search-bg)] hover:text-[var(--text-heading)] transition-colors"
                >
                  <AlertTriangle size={13} />
                  <span>Create / Link Incident</span>
                </Link>
                <Link
                  href="/technical-support/workspaces"
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[var(--text-secondary)] hover:bg-[var(--search-bg)] hover:text-[var(--text-heading)] transition-colors"
                >
                  <Building2 size={13} />
                  <span>Open Workspace 360</span>
                </Link>
                <div className="my-1 border-t border-[var(--divider)]" />
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    copyToClipboard(window.location.href, "page-link");
                    setExecutionToast("Investigation link copied to clipboard");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[var(--text-secondary)] hover:bg-[var(--search-bg)] hover:text-[var(--text-heading)] transition-colors"
                >
                  <Share2 size={13} />
                  <span>Copy Investigation Link</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 5: INVESTIGATION CONTEXT BAR
          Fields: Workspace, Product, Environment, Incident, Case, Status
          Compact horizontal controls matching existing Setu selector components
      ────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 screen-sm:grid-cols-3 screen-lg:grid-cols-6 lg:grid-cols-6 gap-2 px-1 sm:px-2 mb-3">
        {/* Workspace */}
        <div className="flex items-center justify-between rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-2 sm:p-2.5 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--status-blue-bg)] text-[var(--status-blue-fg)]">
              <Building2 size={14} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide leading-none">
                Workspace
              </p>
              <p className="text-xs font-bold text-[var(--text-heading)] truncate mt-0.5 leading-tight">
                {selectedInvestigation.workspace.name}
              </p>
              <p className="text-[10px] font-mono text-[var(--text-muted)] leading-tight">
                {selectedInvestigation.workspace.id}
              </p>
            </div>
          </div>
          <ChevronDown size={13} className="shrink-0 text-[var(--text-muted)] ml-1" />
        </div>

        {/* Product */}
        <div className="flex items-center justify-between rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-2 sm:p-2.5 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--search-bg)]">
              <ProductIcon product={selectedInvestigation.product} size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide leading-none">
                Product
              </p>
              <p className="text-xs font-bold text-[var(--text-heading)] truncate mt-0.5 leading-tight">
                {selectedInvestigation.product}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] truncate leading-tight">
                {selectedInvestigation.service}
              </p>
            </div>
          </div>
          <ChevronDown size={13} className="shrink-0 text-[var(--text-muted)] ml-1" />
        </div>

        {/* Environment */}
        <div className="flex items-center justify-between rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-2 sm:p-2.5 shadow-2xs">
          <div>
            <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide leading-none">
              Environment
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="h-2 w-2 rounded-full bg-[var(--status-healthy-fg)]" />
              <span className="text-xs font-bold text-[var(--text-heading)]">
                {selectedInvestigation.environment}
              </span>
            </div>
          </div>
          <ChevronDown size={13} className="shrink-0 text-[var(--text-muted)]" />
        </div>

        {/* Incident */}
        <div className="flex items-center justify-between rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-2 sm:p-2.5 shadow-2xs">
          <div>
            <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide leading-none">
              Incident
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <AlertTriangle size={13} className="text-[var(--status-warning-fg)]" />
              <span className="text-xs font-bold text-[var(--status-critical-fg)]">
                {selectedInvestigation.incidentId || "None"}
              </span>
            </div>
          </div>
          <ChevronDown size={13} className="shrink-0 text-[var(--text-muted)]" />
        </div>

        {/* Case */}
        <div className="flex items-center justify-between rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-2 sm:p-2.5 shadow-2xs">
          <div>
            <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide leading-none">
              Case
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <Ticket size={13} className="text-amber-500" />
              <span className="text-xs font-bold text-[var(--text-heading)]">
                {selectedInvestigation.caseId || "Unassigned"}
              </span>
            </div>
          </div>
          <ChevronDown size={13} className="shrink-0 text-[var(--text-muted)]" />
        </div>

        {/* Status */}
        <div className="flex items-center justify-between rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-2 sm:p-2.5 shadow-2xs">
          <div>
            <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide leading-none">
              Status
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-xs font-bold text-[var(--text-heading)]">
                {selectedInvestigation.impact.activeIncidentStatus || "Investigating"}
              </span>
            </div>
          </div>
          <ChevronDown size={13} className="shrink-0 text-[var(--text-muted)]" />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 6: KPI ROW
          Six compact KPI cards:
          Diagnostic Runs (128, ↑ 12%)
          Failed (17, ↓ 8%)
          Success Rate (86.7%, ↑ 5%)
          Active Investigations (4, ↑ 33%)
          Affected Workspaces (3, ↑ 50%)
          Last Run (2 mins ago, →)
      ────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 screen-sm:grid-cols-3 screen-lg:grid-cols-6 lg:grid-cols-6 gap-2 sm:gap-2.5 lg:gap-3 px-1 sm:px-2 mb-3">
        {/* 1. Diagnostic Runs */}
        <div
          className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Diagnostic Runs</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--text-heading)] leading-none">128</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-up-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-up-fg)]">
              &uarr; 12%
            </span>
          </div>
        </div>

        {/* 2. Failed */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "failed" ? "all" : "failed")}
          className={`bg-[var(--surface)] rounded-xl border p-2.5 sm:p-3 text-left transition-all cursor-pointer ${
            statusFilter === "failed"
              ? "border-[var(--status-critical-fg)] ring-2 ring-[var(--status-critical-fg)]/20"
              : "border-[var(--card-border)] hover:border-[var(--divider)]"
          }`}
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Failed</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--kpi-bad)] leading-none">17</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-down-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-down-fg)]">
              &darr; 8%
            </span>
          </div>
        </button>

        {/* 3. Success Rate */}
        <div
          className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Success Rate</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--kpi-good)] leading-none">86.7%</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-up-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-up-fg)]">
              &uarr; 5%
            </span>
          </div>
        </div>

        {/* 4. Active Investigations */}
        <div
          className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Active Investigations</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--text-heading)] leading-none">4</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-up-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-up-fg)]">
              &uarr; 33%
            </span>
          </div>
        </div>

        {/* 5. Affected Workspaces */}
        <div
          className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Affected Workspaces</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--kpi-warn)] leading-none">3</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-up-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-up-fg)]">
              &uarr; 50%
            </span>
          </div>
        </div>

        {/* 6. Last Run */}
        <div
          className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3 flex items-center justify-between"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <div>
            <p className="text-[11px] font-medium text-[var(--text-muted)]">Last Run</p>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
              <span className="text-base sm:text-lg font-bold text-[var(--text-heading)] leading-none">
                2 mins ago
              </span>
            </div>
          </div>
          <ArrowRight size={14} className="text-[var(--text-muted)]" />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 7: SEARCH + FILTER BAR
          Search trace ID, endpoint, workspace, integration, incident...
          All Products, All Services, All Integrations, All Environments, All Statuses, More filters
      ────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 px-1 sm:px-2 mb-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--search-placeholder)]" />
          <input
            type="text"
            placeholder="Search trace ID, endpoint, workspace, integration, incident..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--divider)] bg-[var(--surface)] py-1.5 sm:py-2 pl-9 pr-3 text-xs text-[var(--text-heading)] placeholder:text-[var(--search-placeholder)] shadow-xs outline-none focus:border-[var(--sidebar-active)]"
          />
        </div>

        {/* Filter Controls Cluster */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <FilterDropdown
            value={productFilter}
            onChange={setProductFilter}
            options={productOptions}
            placeholder="All Products"
            title="Filter by Product"
            searchable
            searchPlaceholder="Search product..."
            showClear
          />

          <FilterDropdown
            value={serviceFilter}
            onChange={setServiceFilter}
            options={serviceOptions}
            placeholder="All Services"
            title="Filter by Service"
            searchable
            searchPlaceholder="Search service..."
            showClear
          />

          <FilterDropdown
            value={integrationFilter}
            onChange={setIntegrationFilter}
            options={integrationOptions}
            placeholder="All Integrations"
            title="Filter by Integration"
            searchable
            searchPlaceholder="Search integration..."
            showClear
          />

          <FilterDropdown
            value={envFilter}
            onChange={setEnvFilter}
            options={envOptions}
            placeholder="All Environments"
            title="Filter by Environment"
            className="hidden sm:inline-block"
            showClear
          />

          <FilterDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            placeholder="All Statuses"
            title="Filter by Status"
            showClear
          />

          <button
            type="button"
            onClick={() => setShowMoreFilters((s) => !s)}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl border py-1.5 sm:py-2 px-2.5 sm:px-3 text-xs font-medium shadow-xs transition-colors cursor-pointer ${
              showMoreFilters
                ? "border-[var(--accent-solid)] bg-[var(--accent-solid)] text-white"
                : "border-[var(--divider)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--sidebar-active)] hover:bg-[var(--search-bg)]"
            }`}
          >
            <SlidersHorizontal size={12} />
            <span className="hidden sm:inline">More filters</span>
            <span className="sm:hidden">Filters</span>
          </button>
        </div>
      </div>

      {/* Advanced Quick Filters Drawer */}
      {showMoreFilters && (
        <div className="mx-1 sm:mx-2 mb-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3 shadow-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <span className="font-semibold text-[var(--text-heading)]">Quick Filters:</span>
            {[
              { label: "Only Failed", action: () => setStatusFilter("failed") },
              { label: "Only Success", action: () => setStatusFilter("success") },
              { label: "Workspace: Sharma Traders", action: () => setSearch("Sharma Traders") },
              { label: "Integration: Meta WABA", action: () => setIntegrationFilter("Meta WhatsApp (WABA)") },
              { label: "Environment: Production", action: () => setEnvFilter("Production") },
            ].map((f) => (
              <button
                key={f.label}
                type="button"
                onClick={f.action}
                className="rounded-lg border border-[var(--divider)] bg-[var(--search-bg)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] cursor-pointer"
              >
                {f.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setProductFilter("all");
                setServiceFilter("all");
                setIntegrationFilter("all");
                setStatusFilter("all");
                setEnvFilter("all");
              }}
              className="ml-auto text-[var(--icon-btn-navy)] font-medium hover:underline text-[11px] cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 8: MAIN WORKSPACE (TWO-COLUMN INVESTIGATION LAYOUT)
          LEFT: ~48% Diagnostic Runs / Investigation Queue
          RIGHT: ~52% Selected Diagnostic Inspector
      ────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-3 px-1 sm:px-2 min-h-0 flex-1">
        {/* ── LEFT PANEL — DIAGNOSTIC RUNS (48%) ──────────────────────── */}
        <div
          className="w-full lg:w-[48%] shrink-0 bg-[var(--surface)] rounded-2xl border border-[var(--card-border)] shadow-xs flex flex-col p-3 sm:p-3.5 max-h-[500px] lg:max-h-none lg:h-[calc(100dvh-17rem)]"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--divider)]">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-heading)] leading-tight">
                Diagnostic Runs ({filteredRuns.length})
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Recent and active technical investigations
              </p>
            </div>

            <FilterDropdown
              label="Sort by:"
              value={sortBy}
              onChange={(v) => setSortBy(v as SortOption)}
              options={SORT_OPTIONS.map((o) => ({
                value: o.id,
                label: o.label,
                sub: o.sub,
              }))}
              placeholder="Latest"
              title="Sort Runs"
              align="right"
            />
          </div>

          {/* Investigation Queue Rows */}
          <div className="flex-1 overflow-y-auto pt-2 space-y-1.5">
            {filteredRuns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-xs text-[var(--text-muted)]">
                <Wrench size={24} className="mb-2 text-[var(--text-muted)]/50" />
                <p className="font-semibold text-[var(--text-heading)]">No diagnostic runs found</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">Try modifying your search or filter options</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setProductFilter("all");
                    setServiceFilter("all");
                    setIntegrationFilter("all");
                    setStatusFilter("all");
                    setEnvFilter("all");
                  }}
                  className="mt-3 text-[var(--sidebar-active)] font-semibold hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              filteredRuns.map((run) => {
                const isSelected = run.id === selectedInvestigation.id;

                return (
                  <button
                    key={run.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(run.id);
                      setActiveTab("overview");
                    }}
                    className={`group relative flex w-full items-center justify-between rounded-xl p-2.5 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[var(--icon-chip-bg)] border border-[var(--sidebar-active)]/40 shadow-2xs"
                        : "border border-transparent hover:bg-[var(--search-bg)]"
                    }`}
                  >
                    {/* Active blue left bar */}
                    {isSelected && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-[var(--sidebar-active)] rounded-r" />
                    )}

                    <div className="flex items-center gap-2.5 min-w-0 flex-1 pl-1">
                      {/* Column 1: Time & Status */}
                      <div className="shrink-0 flex flex-col items-start w-16">
                        <span className="font-mono text-[11px] font-semibold text-[var(--text-heading)]">
                          {run.timestamp}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] leading-tight">
                          {run.relativeTime}
                        </span>
                        <span
                          className={`mt-1 rounded px-1.5 py-0.2 font-mono text-[10px] font-bold leading-none ${statusPillClass(
                            run.status
                          )}`}
                        >
                          {run.status}
                        </span>
                      </div>

                      {/* Column 2: Sahayogi Product Icon (RULE: PRODUCT ICON = SAHAYOGI PRODUCT) */}
                      <div className="shrink-0">
                        <ProductIcon product={run.product} size={20} />
                      </div>

                      {/* Column 3: Product, Service, Workspace, Environment */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-[var(--text-heading)] leading-tight">
                          {run.product}
                        </p>
                        <p className="truncate text-[11px] text-[var(--text-muted)] leading-tight mt-0.5">
                          {run.service}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 text-[10.5px]">
                          <span className="font-medium text-[var(--text-secondary)] truncate">
                            {run.workspace.shortName}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-[var(--status-healthy-fg)]" />
                          <span className="text-[var(--text-muted)] text-[10px]">
                            {run.environment}
                          </span>
                        </div>
                      </div>

                      {/* Column 4: Result badge */}
                      <div className="shrink-0 text-right pr-1">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10.5px] font-semibold ${
                            run.status === "Failed"
                              ? "bg-[var(--status-critical-bg)] text-[var(--status-critical-fg)]"
                              : "bg-[var(--status-healthy-bg)] text-[var(--status-healthy-fg)]"
                          }`}
                        >
                          {run.resultLabel}
                        </span>
                      </div>
                    </div>

                    {/* Column 5: Duration & Chevron */}
                    <div className="flex shrink-0 items-center gap-1.5 pl-2">
                      <span className="font-mono text-[10.5px] text-[var(--text-muted)]">
                        {run.durationMs >= 1000
                          ? `${(run.durationMs / 1000).toFixed(2)} s`
                          : `${run.durationMs} ms`}
                      </span>
                      <ChevronRight
                        size={14}
                        className="text-[var(--text-muted)]/50 group-hover:text-[var(--text-secondary)] transition-colors"
                      />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL — DIAGNOSTIC INSPECTOR (52%) ─────────────────── */}
        <div
          className="flex-1 min-w-0 bg-[var(--surface)] rounded-2xl border border-[var(--card-border)] shadow-xs flex flex-col p-3.5 sm:p-5 overflow-hidden lg:h-[calc(100dvh-17rem)]"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          {selectedInvestigation ? (
            <div className="flex flex-col h-full overflow-y-auto">
              {/* ─────────────────────────────────────────────────────────
                  SECTION 11: RIGHT PANEL HEADER
                  [401] HMAC signature verification failed  [Customer-Specific]
                  [Chat with Sahayogi icon] Chat with Sahayogi · WhatsApp Integration
                  HMAC signature verification failed for incoming WhatsApp webhook.
                  Actions: Copy Trace ID | Run Diagnostics | Create / Link Incident
              ────────────────────────────────────────────────────────── */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-2 border-b border-[var(--divider)]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 font-mono text-sm font-bold ${statusPillClass(
                        selectedInvestigation.status
                      )}`}
                    >
                      {selectedInvestigation.statusCode}
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-[var(--text-heading)] leading-none">
                      {selectedInvestigation.statusText}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--status-critical-bg)] px-2.5 py-0.5 text-[10.5px] font-medium text-[var(--status-critical-fg)] border border-[var(--status-critical-fg)]/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-critical-fg)]" />
                      {selectedInvestigation.classification}
                    </span>
                  </div>

                  {/* Subtitle with Official Sahayogi Brand Icon */}
                  <div className="flex items-center gap-2 mt-2">
                    <ProductIcon product={selectedInvestigation.product} size={18} />
                    <span className="text-xs font-bold text-[var(--text-heading)]">
                      {selectedInvestigation.product}
                    </span>
                    <span className="text-[var(--text-muted)] text-[11px]">&middot;</span>
                    <span className="text-xs text-[var(--text-secondary)] font-medium">
                      {selectedInvestigation.service}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {selectedInvestigation.problem}
                  </p>
                </div>

                {/* Top-Right Action Buttons */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedInvestigation.traceId, "traceId")}
                    className="flex items-center gap-1.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)] px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] shadow-xs hover:bg-[var(--search-bg)] transition-colors cursor-pointer"
                  >
                    {copiedKey === "traceId" ? (
                      <Check size={12} className="text-emerald-500" />
                    ) : (
                      <Copy size={12} className="text-[var(--text-muted)]" />
                    )}
                    <span>Copy Trace ID</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const probe = selectedInvestigation.availableActions.find((a) => a.risk === "SAFE") || selectedInvestigation.availableActions[0];
                      setConfirmModalProbe(probe);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-[var(--accent-solid)] px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:brightness-110 transition-colors cursor-pointer"
                  >
                    <Play size={12} className="fill-white" />
                    <span>Run Diagnostics</span>
                  </button>

                  <Link
                    href={`/technical-support/incidents?create=true&ref=${selectedInvestigation.workspace.id}`}
                    className="flex items-center gap-1.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)] px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] shadow-xs hover:bg-[var(--search-bg)] transition-colors"
                  >
                    <AlertTriangle size={12} className="text-[var(--status-warning-fg)]" />
                    <span>Create / Link Incident</span>
                  </Link>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────
                  SECTION 12: INSPECTOR TABS
                  Overview | Diagnostic Actions | Execution Output | Related Objects | Timeline | Audit Trail
              ────────────────────────────────────────────────────────── */}
              <div className="flex items-center gap-5 sm:gap-6 border-b border-[var(--divider)] text-xs font-semibold overflow-x-auto mt-2">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "actions", label: "Diagnostic Actions" },
                  { id: "output", label: "Execution Output" },
                  { id: "related", label: "Related Objects" },
                  { id: "timeline", label: "Timeline" },
                  { id: "audit", label: "Audit Trail" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id as InspectorTab)}
                    className={`pb-2.5 transition-colors relative cursor-pointer shrink-0 ${
                      activeTab === t.id
                        ? "text-[var(--sidebar-active)] font-bold"
                        : "text-[var(--text-muted)] hover:text-[var(--text-heading)] font-medium"
                    }`}
                  >
                    {t.label}
                    {activeTab === t.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--sidebar-active)] rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* ─────────────────────────────────────────────────────────
                  TAB CONTENTS
              ────────────────────────────────────────────────────────── */}
              <div className="pt-3 flex-1">
                {/* ── TAB 1: OVERVIEW ─────────────────────────────────── */}
                {activeTab === "overview" && (
                  <div className="space-y-3.5">
                    {/* Compact Context Information Cards */}
                    <div className="grid grid-cols-2 screen-sm:grid-cols-4 gap-2.5">
                      {/* Workspace */}
                      <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          <Building2 size={12} />
                          Workspace
                        </div>
                        <p className="mt-1 text-xs font-bold text-[var(--text-heading)] truncate">
                          {selectedInvestigation.workspace.name}
                        </p>
                        <p className="font-mono text-[10px] text-[var(--text-muted)]">
                          {selectedInvestigation.workspace.id}
                        </p>
                      </div>

                      {/* Product (Strictly Sahayogi Logo Only, No WhatsApp) */}
                      <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          <ProductIcon product={selectedInvestigation.product} size={12} />
                          Product
                        </div>
                        <p className="mt-1 text-xs font-bold text-[var(--text-heading)] truncate">
                          {selectedInvestigation.product}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] truncate">
                          Official Sahayogi App
                        </p>
                      </div>

                      {/* Service */}
                      <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          <Layers size={12} />
                          Service
                        </div>
                        <p className="mt-1 text-xs font-bold text-[var(--text-heading)] truncate">
                          {selectedInvestigation.service}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] truncate">
                          Core Gateway Service
                        </p>
                      </div>

                      {/* Integration (UNDERLYING PROVIDER ICON) */}
                      <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          <IntegrationIcon integration={selectedInvestigation.integration} size={12} />
                          Integration
                        </div>
                        <p className="mt-1 text-xs font-bold text-[var(--text-heading)] truncate">
                          {selectedInvestigation.integration}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] truncate">
                          Underlying Provider
                        </p>
                      </div>
                    </div>

                    {/* Secondary Identifiers Row */}
                    <div className="grid grid-cols-2 screen-sm:grid-cols-4 gap-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface-muted)] p-2.5 text-xs">
                      <div>
                        <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide block">
                          Environment
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-healthy-fg)]" />
                          <span className="font-semibold text-[var(--text-heading)]">
                            {selectedInvestigation.environment}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide block">
                          Endpoint
                        </span>
                        <span className="font-mono font-semibold text-[var(--text-secondary)] text-[11px] truncate block mt-0.5">
                          {selectedInvestigation.endpoint}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide block">
                          Trace ID
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="font-mono font-semibold text-[var(--sidebar-active)] text-[11px] truncate">
                            {selectedInvestigation.traceId}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedInvestigation.traceId, "overview-trace")}
                            className="text-[var(--text-muted)] hover:text-[var(--text-heading)] cursor-pointer"
                          >
                            {copiedKey === "overview-trace" ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide block">
                          Request ID
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="font-mono font-semibold text-[var(--text-secondary)] text-[11px] truncate">
                            {selectedInvestigation.requestId}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedInvestigation.requestId, "overview-req")}
                            className="text-[var(--text-muted)] hover:text-[var(--text-heading)] cursor-pointer"
                          >
                            {copiedKey === "overview-req" ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 14: DIAGNOSTIC SUMMARY CALLOUT */}
                    <div className="rounded-xl border border-[var(--status-critical-fg)]/25 bg-[var(--status-critical-bg)]/25 p-3 sm:p-3.5">
                      <div className="flex items-center gap-1.5 text-[var(--status-critical-fg)] font-bold text-xs">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--status-critical-fg)] text-[10px] text-white font-black">
                          !
                        </span>
                        {selectedInvestigation.diagnosticSummary.title}
                      </div>
                      <p className="text-xs text-[var(--text-heading)] mt-1.5 leading-relaxed font-normal">
                        {selectedInvestigation.diagnosticSummary.message}
                      </p>
                      <div className="mt-3 pt-3 border-t border-[var(--status-critical-fg)]/20 grid grid-cols-1 screen-sm:grid-cols-3 gap-2.5 text-xs">
                        <div>
                          <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide block">
                            Error Code
                          </span>
                          <span className="font-mono font-bold text-[var(--text-heading)] text-[11px]">
                            {selectedInvestigation.diagnosticSummary.errorCode}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide block">
                            Failed Layer
                          </span>
                          <span className="font-medium text-[var(--text-secondary)] text-[11px]">
                            {selectedInvestigation.diagnosticSummary.failedLayer}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide block">
                            Confidence
                          </span>
                          <span className="inline-flex rounded bg-[var(--status-info-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--status-info-fg)]">
                            {selectedInvestigation.diagnosticSummary.confidence}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* BOTTOM 3-CARD SECTION: Impact | Failure Classification | Diagnostic Chain */}
                    <div className="grid grid-cols-1 screen-md:grid-cols-3 gap-3">
                      {/* SECTION 15: IMPACT */}
                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 shadow-2xs">
                        <h4 className="text-xs font-bold text-[var(--text-heading)] mb-2 flex items-center gap-1.5">
                          <Flame size={13} className="text-amber-500" />
                          Impact Evidence
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-lg bg-[var(--surface-muted)] p-2">
                            <span className="text-[10px] text-[var(--text-muted)] block">Similar errors</span>
                            <span className="text-sm font-bold text-[var(--text-heading)] block mt-0.5">
                              {selectedInvestigation.impact.similarErrorsLastHour}
                            </span>
                            <span className="text-[9.5px] text-[var(--text-muted)]">in last 1 hour</span>
                          </div>

                          <div className="rounded-lg bg-[var(--surface-muted)] p-2">
                            <span className="text-[10px] text-[var(--text-muted)] block">Affected works</span>
                            <span className="text-sm font-bold text-[var(--text-heading)] block mt-0.5">
                              {selectedInvestigation.impact.affectedWorkspacesCount}
                            </span>
                            <span className="text-[9.5px] text-[var(--text-muted)] truncate block">
                              {selectedInvestigation.impact.affectedWorkspacesSummary}
                            </span>
                          </div>

                          <div className="rounded-lg bg-[var(--surface-muted)] p-2">
                            <span className="text-[10px] text-[var(--text-muted)] block">Active incident</span>
                            <span className="text-xs font-bold text-[var(--status-critical-fg)] block mt-0.5">
                              {selectedInvestigation.impact.activeIncidentId || "None"}
                            </span>
                            <span className="text-[9.5px] text-[var(--status-warning-fg)] block">
                              {selectedInvestigation.impact.activeIncidentStatus || "Healthy"}
                            </span>
                          </div>

                          <div className="rounded-lg bg-[var(--surface-muted)] p-2">
                            <span className="text-[10px] text-[var(--text-muted)] block">Last successful</span>
                            <span className="text-xs font-bold text-[var(--status-healthy-fg)] block mt-0.5">
                              {selectedInvestigation.impact.lastSuccessfulTime}
                            </span>
                            <span className="text-[9.5px] text-[var(--status-healthy-fg)] block">
                              ({selectedInvestigation.impact.lastSuccessfulCode})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 16: FAILURE CLASSIFICATION */}
                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 shadow-2xs flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-[var(--text-heading)] mb-2 flex items-center gap-1.5">
                            <ShieldCheck size={13} className="text-[var(--sidebar-active)]" />
                            Failure Classification
                          </h4>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            <span className="text-sm font-bold text-[var(--text-heading)]">
                              {selectedInvestigation.classification}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                            System assessment verified by error signature agreement, tenant credential timeline, and cross-workspace comparison.
                          </p>
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-[var(--divider)] flex items-center justify-between text-[11px]">
                          <span className="text-[var(--text-muted)] font-medium">Confidence:</span>
                          <span className="rounded bg-[var(--status-info-bg)] px-2 py-0.5 font-bold text-[var(--status-info-fg)]">
                            {selectedInvestigation.confidence}
                          </span>
                        </div>
                      </div>

                      {/* SECTION 17: DIAGNOSTIC CHAIN */}
                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 shadow-2xs">
                        <h4 className="text-xs font-bold text-[var(--text-heading)] mb-2">
                          Diagnostic Chain
                        </h4>
                        <div className="relative pl-3.5 space-y-1.5 border-l-2 border-[var(--divider)] ml-1.5 text-[11px]">
                          {selectedInvestigation.chain.map((node, i) => (
                            <div key={i} className="relative">
                              <span
                                className={`absolute -left-[19px] top-1.5 h-2 w-2 rounded-full border border-[var(--surface)] ${
                                  node.isError ? "bg-[var(--status-critical-fg)]" : "bg-[var(--text-muted)]"
                                }`}
                              />
                              <p className={`leading-tight truncate ${node.isError ? "font-bold text-[var(--status-critical-fg)]" : "text-[var(--text-secondary)] font-medium"}`}>
                                {node.label}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 2: DIAGNOSTIC ACTIONS (SECTIONS 18 & 19) ─────── */}
                {activeTab === "actions" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-[var(--surface-muted)] rounded-xl p-2.5 border border-[var(--divider)]">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--sidebar-active)] text-white text-xs font-bold">
                          DS
                        </span>
                        <div>
                          <p className="text-xs font-bold text-[var(--text-heading)]">
                            Dhruv Singla (Tier-2 Support)
                          </p>
                          <p className="text-[10.5px] text-[var(--text-muted)]">
                            Role: Tier-2 Operations &middot; Read-only diagnostics & Safe Execution granted
                          </p>
                        </div>
                      </div>
                      <span className="rounded bg-[var(--status-healthy-bg)] px-2 py-0.5 text-[10.5px] font-bold text-[var(--status-healthy-fg)] border border-[var(--status-healthy-fg)]/20">
                        SAFE EXECUTION ENABLED
                      </span>
                    </div>

                    <div className="space-y-2">
                      {selectedInvestigation.availableActions.map((action) => (
                        <div
                          key={action.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 hover:border-[var(--sidebar-active)] transition-colors shadow-2xs"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-bold text-[var(--text-heading)]">
                                {action.name}
                              </h5>
                              <span
                                className={`rounded px-1.5 py-0.2 text-[9.5px] font-bold ${riskBadgeClass(
                                  action.risk
                                )}`}
                              >
                                {action.risk}
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                              {action.description}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[var(--text-muted)]">
                              <span>Expected: {action.expectedEffect}</span>
                              {action.lastRun && (
                                <span>&middot; Last Run: {action.lastRun}</span>
                              )}
                              {action.result && (
                                <span
                                  className={
                                    action.result === "Passed"
                                      ? "text-[var(--status-healthy-fg)] font-bold"
                                      : "text-[var(--status-critical-fg)] font-bold"
                                  }
                                >
                                  &middot; Result: {action.result}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0">
                            {action.risk === "SAFE" ? (
                              <button
                                type="button"
                                onClick={() => setConfirmModalProbe(action)}
                                disabled={isExecuting}
                                className="flex items-center gap-1.5 rounded-xl bg-[var(--sidebar-active)] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:brightness-110 disabled:opacity-50 cursor-pointer"
                              >
                                <Play size={11} className="fill-white" />
                                <span>Run</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setApprovalModalProbe(action)}
                                className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 shadow-xs hover:bg-amber-100 cursor-pointer"
                              >
                                <Shield size={11} />
                                <span>Request Approval</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── TAB 3: EXECUTION OUTPUT (SECTIONS 21 & 22) ──────── */}
                {activeTab === "output" && (
                  <div className="space-y-3.5">
                    {/* Compact Execution Result Card */}
                    <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3 sm:p-4 shadow-2xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded px-2.5 py-0.5 text-xs font-bold ${
                              selectedInvestigation.executionOutput.status === "PROBE FAILED"
                                ? "bg-[var(--status-critical-bg)] text-[var(--status-critical-fg)] border border-[var(--status-critical-fg)]/20"
                                : "bg-[var(--status-healthy-bg)] text-[var(--status-healthy-fg)] border border-[var(--status-healthy-fg)]/20"
                            }`}
                          >
                            {selectedInvestigation.executionOutput.status}
                          </span>
                          <span className="text-xs font-mono text-[var(--text-muted)]">
                            Probe ID: {selectedInvestigation.executionOutput.probeId}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                          <span>
                            Execution time:{" "}
                            <strong className="text-[var(--text-heading)] font-mono">
                              {selectedInvestigation.executionOutput.durationMs} ms
                            </strong>
                          </span>
                          <span>&middot;</span>
                          <span>
                            Operator:{" "}
                            <strong className="text-[var(--text-heading)]">
                              {selectedInvestigation.executionOutput.operator}
                            </strong>
                          </span>
                        </div>
                      </div>

                      {/* Expandable Execution Terminal */}
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => setIsTerminalExpanded((v) => !v)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-[var(--sidebar-active)] hover:underline cursor-pointer"
                        >
                          <span>{isTerminalExpanded ? "Hide Execution Output" : "View Execution Output"}</span>
                          <ChevronDown
                            size={13}
                            className={`transition-transform ${isTerminalExpanded ? "rotate-180" : ""}`}
                          />
                        </button>

                        {isTerminalExpanded && (
                          <div className="mt-2 rounded-xl bg-[#090D12] border border-gray-800 p-3 font-mono text-[11px] leading-relaxed text-gray-300">
                            {selectedInvestigation.executionOutput.logs.map((log, idx) => {
                              const isFail = log.includes("FAIL") || log.includes("401");
                              const isPass = log.includes("PASS") || log.includes("Verified");
                              return (
                                <div
                                  key={idx}
                                  className={
                                    isFail
                                      ? "text-red-400 font-bold"
                                      : isPass
                                      ? "text-emerald-400 font-bold"
                                      : "text-gray-300"
                                  }
                                >
                                  {log}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Result Interpretation (Section 22) */}
                    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3.5 shadow-2xs space-y-3">
                      <h4 className="text-xs font-bold text-[var(--text-heading)]">
                        Result Interpretation
                      </h4>

                      <div className="grid grid-cols-1 screen-sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="rounded-lg bg-[var(--surface-muted)] p-2.5">
                          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                            Result
                          </span>
                          <span className="font-bold text-[var(--status-critical-fg)] text-xs mt-0.5 block">
                            {selectedInvestigation.status}
                          </span>
                        </div>
                        <div className="rounded-lg bg-[var(--surface-muted)] p-2.5">
                          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                            Failed Layer
                          </span>
                          <span className="font-medium text-[var(--text-secondary)] text-xs mt-0.5 block truncate">
                            {selectedInvestigation.diagnosticSummary.failedLayer}
                          </span>
                        </div>
                        <div className="rounded-lg bg-[var(--surface-muted)] p-2.5">
                          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                            Root Reason
                          </span>
                          <span className="font-medium text-[var(--text-secondary)] text-xs mt-0.5 block truncate">
                            Credential hash mismatch
                          </span>
                        </div>
                      </div>

                      <div className="text-xs">
                        <span className="font-bold text-[var(--text-heading)] block mb-1">
                          Evidence Breakdown:
                        </span>
                        <ul className="space-y-1 text-[11.5px] text-[var(--text-secondary)]">
                          <li className="flex items-start gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-critical-fg)] mt-1.5 shrink-0" />
                            <span>{selectedInvestigation.impact.similarErrorsLastHour} similar errors in the last hour.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-critical-fg)] mt-1.5 shrink-0" />
                            <span>1 affected workspace ({selectedInvestigation.workspace.name}).</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-healthy-fg)] mt-1.5 shrink-0" />
                            <span>Last successful request was {selectedInvestigation.impact.lastSuccessfulTime} (200 OK).</span>
                          </li>
                        </ul>
                      </div>

                      <div className="rounded-xl border border-[var(--status-warning-fg)]/25 bg-[var(--status-warning-bg)]/25 p-3 text-xs">
                        <span className="font-bold text-[var(--status-warning-fg)] block">
                          Suggested Next Action:
                        </span>
                        <p className="text-[var(--text-heading)] mt-0.5 leading-relaxed">
                          {selectedInvestigation.executionOutput.suggestedAction}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Link
                          href="/technical-support/integrations"
                          className="flex items-center gap-1.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--sidebar-active)] hover:bg-[var(--search-bg)] transition-colors shadow-2xs"
                        >
                          <ExternalLink size={12} />
                          <span>Open Integration 360</span>
                        </Link>

                        {selectedInvestigation.executionOutput.canRevalidateCredential && (
                          <button
                            type="button"
                            onClick={() => {
                              const probe = selectedInvestigation.availableActions.find((a) => a.id === "cred_validation") || selectedInvestigation.availableActions[0];
                              setApprovalModalProbe(probe);
                            }}
                            className="flex items-center gap-1.5 rounded-xl bg-[var(--sidebar-active)] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:brightness-110 cursor-pointer"
                          >
                            <Shield size={12} />
                            <span>Request Credential Revalidation</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 4: RELATED OBJECTS (SECTION 23 & 26) ────────── */}
                {activeTab === "related" && (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface-muted)] p-2.5 text-xs text-[var(--text-muted)]">
                      <strong className="text-[var(--text-heading)]">Support / BoSS Correlation:</strong> Setu Technical Diagnostics provides technical telemetry, traces, and integration health correlated with BoSS customer case <strong className="text-amber-600 font-mono">{selectedInvestigation.caseId || "TK-9011"}</strong>. Diagnostics does not replace the BoSS CRM case workflow.
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      {/* Workspace 360 */}
                      <Link
                        href={`/technical-support/workspaces?id=${selectedInvestigation.relatedObjects.workspaceId}`}
                        className="group rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 hover:border-[var(--sidebar-active)] transition-colors shadow-2xs block"
                      >
                        <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">
                          Workspace 360
                        </span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-bold text-[var(--sidebar-active)] group-hover:underline">
                            {selectedInvestigation.relatedObjects.workspaceName}
                          </span>
                          <ArrowRight size={13} className="text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <p className="font-mono text-[10.5px] text-[var(--text-muted)] mt-0.5">
                          {selectedInvestigation.relatedObjects.workspaceId}
                        </p>
                      </Link>

                      {/* Product */}
                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 shadow-2xs">
                        <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">
                          Product
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <ProductIcon product={selectedInvestigation.relatedObjects.product} size={16} />
                          <span className="font-bold text-[var(--text-heading)]">
                            {selectedInvestigation.relatedObjects.product}
                          </span>
                        </div>
                      </div>

                      {/* Integration 360 */}
                      <Link
                        href="/technical-support/integrations"
                        className="group rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 hover:border-[var(--sidebar-active)] transition-colors shadow-2xs block"
                      >
                        <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">
                          Integration 360
                        </span>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <IntegrationIcon integration={selectedInvestigation.relatedObjects.integration} size={16} />
                            <span className="font-bold text-[var(--sidebar-active)] group-hover:underline truncate">
                              {selectedInvestigation.relatedObjects.integration}
                            </span>
                          </div>
                          <ArrowRight size={13} className="text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </Link>

                      {/* Incident */}
                      <Link
                        href={`/technical-support/incidents?id=${selectedInvestigation.relatedObjects.incidentId || "INC-10291"}`}
                        className="group rounded-xl border border-[var(--status-critical-fg)]/20 bg-[var(--status-critical-bg)]/10 p-3 hover:border-[var(--status-critical-fg)] transition-colors shadow-2xs block"
                      >
                        <span className="text-[10px] font-bold uppercase text-[var(--status-critical-fg)] block">
                          Active Incident
                        </span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-bold text-[var(--status-critical-fg)] group-hover:underline">
                            {selectedInvestigation.relatedObjects.incidentId || "INC-10291"}
                          </span>
                          <ArrowRight size={13} className="text-[var(--status-critical-fg)] group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <p className="text-[10.5px] text-[var(--text-muted)] mt-0.5">
                          Investigating &middot; WhatsApp webhook authentication failure
                        </p>
                      </Link>

                      {/* Support Case */}
                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 shadow-2xs">
                        <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">
                          Support Case (BoSS)
                        </span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-bold text-amber-600 font-mono">
                            {selectedInvestigation.relatedObjects.caseId || "TK-9011"}
                          </span>
                          <span className="rounded bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5">
                            Customer Priority
                          </span>
                        </div>
                      </div>

                      {/* Trace */}
                      <Link
                        href={`/technical-support/api-logs?search=${selectedInvestigation.relatedObjects.traceId}`}
                        className="group rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 hover:border-[var(--sidebar-active)] transition-colors shadow-2xs block"
                      >
                        <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">
                          Telemetry Trace
                        </span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-mono font-bold text-[var(--sidebar-active)] group-hover:underline text-[11px] truncate">
                            {selectedInvestigation.relatedObjects.traceId}
                          </span>
                          <ArrowRight size={13} className="text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </Link>

                      {/* Release */}
                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 shadow-2xs">
                        <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">
                          Deployed Release
                        </span>
                        <p className="font-mono font-bold text-[var(--text-heading)] mt-1">
                          {selectedInvestigation.relatedObjects.release}
                        </p>
                      </div>

                      {/* Audit Trail Shortcut */}
                      <button
                        type="button"
                        onClick={() => setActiveTab("audit")}
                        className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 hover:border-[var(--sidebar-active)] transition-colors shadow-2xs text-left cursor-pointer"
                      >
                        <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">
                          Audit Trail
                        </span>
                        <p className="font-bold text-[var(--sidebar-active)] mt-1">
                          View {selectedInvestigation.auditTrail.length} Audited Events &rarr;
                        </p>
                      </button>
                    </div>
                  </div>
                )}

                {/* ── TAB 5: TIMELINE (SECTION 24) ────────────────────── */}
                {activeTab === "timeline" && (
                  <div className="space-y-3">
                    <p className="text-xs text-[var(--text-muted)]">
                      Chronological technical telemetry events for this incident window:
                    </p>

                    <div className="relative pl-6 space-y-3.5 border-l-2 border-[var(--divider)] ml-2 text-xs">
                      {selectedInvestigation.timeline.map((item, idx) => (
                        <div key={idx} className="relative">
                          <span
                            className={`absolute -left-[31px] top-0.5 h-3 w-3 rounded-full border-2 border-[var(--surface)] ${
                              item.type === "error"
                                ? "bg-[var(--status-critical-fg)]"
                                : item.type === "diagnostic"
                                ? "bg-[var(--sidebar-active)]"
                                : item.type === "incident"
                                ? "bg-amber-500"
                                : "bg-[var(--status-healthy-fg)]"
                            }`}
                          />
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10.5px] font-semibold text-[var(--text-heading)]">
                              {item.time}
                            </span>
                            <span className="text-[10.5px] text-[var(--text-muted)]">&middot;</span>
                            <span className="text-[10.5px] text-[var(--text-muted)] font-medium">
                              {item.actor}
                            </span>
                          </div>
                          <p className="font-bold text-[var(--text-heading)] mt-0.5">
                            {item.action}
                          </p>
                          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 font-mono">
                            Result: {item.result}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── TAB 6: AUDIT TRAIL (SECTION 25) ─────────────────── */}
                {activeTab === "audit" && (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface-muted)] p-2.5 text-xs text-[var(--text-muted)] flex items-center gap-2">
                      <ShieldCheck size={16} className="text-[var(--sidebar-active)] shrink-0" />
                      <span>
                        All diagnostic executions are cryptographically audited. Payload secrets and keystore credentials are zero-plain-text and never stored.
                      </span>
                    </div>

                    <div className="space-y-2">
                      {selectedInvestigation.auditTrail.map((audit) => (
                        <div
                          key={audit.eventId}
                          className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 shadow-2xs text-xs space-y-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-[var(--divider)] pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-bold text-[var(--text-heading)]">
                                {audit.eventId}
                              </span>
                              <span className="text-[var(--text-muted)] text-[10px] font-mono">
                                ({audit.correlationId})
                              </span>
                            </div>
                            <span
                              className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                                audit.result === "Success"
                                  ? "bg-[var(--status-healthy-bg)] text-[var(--status-healthy-fg)]"
                                  : "bg-[var(--status-critical-bg)] text-[var(--status-critical-fg)]"
                              }`}
                            >
                              {audit.result}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 screen-sm:grid-cols-4 gap-2 text-[11px]">
                            <div>
                              <span className="text-[10px] text-[var(--text-muted)] uppercase block">Actor</span>
                              <span className="font-semibold text-[var(--text-heading)] truncate block">
                                {audit.actor}
                              </span>
                              <span className="text-[10px] text-[var(--text-muted)]">{audit.role}</span>
                            </div>

                            <div>
                              <span className="text-[10px] text-[var(--text-muted)] uppercase block">Action</span>
                              <span className="font-mono font-bold text-[var(--sidebar-active)] truncate block">
                                {audit.action}
                              </span>
                              <span className="text-[10px] text-[var(--text-muted)]">{audit.timestamp}</span>
                            </div>

                            <div>
                              <span className="text-[10px] text-[var(--text-muted)] uppercase block">Target</span>
                              <span className="font-medium text-[var(--text-secondary)] truncate block">
                                {audit.target}
                              </span>
                              <span className="text-[10px] text-[var(--text-muted)]">{audit.environment}</span>
                            </div>

                            <div>
                              <span className="text-[10px] text-[var(--text-muted)] uppercase block">Correlations</span>
                              <span className="text-[10px] font-mono text-[var(--text-secondary)] block">
                                Case: {audit.linkedCase || "N/A"}
                              </span>
                              <span className="text-[10px] font-mono text-[var(--status-critical-fg)] block">
                                Inc: {audit.linkedIncident || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-xs text-[var(--text-muted)] py-16">
              Select an investigation run from the queue to inspect diagnostics
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 20: EXECUTION CONFIRMATION MODAL (SAFE PROBES)
      ────────────────────────────────────────────────────────────────── */}
      {confirmModalProbe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--divider)] bg-[var(--surface)] p-5 shadow-2xl animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--divider)]">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--status-healthy-bg)] text-[var(--status-healthy-fg)] font-bold">
                  <Play size={13} className="fill-[var(--status-healthy-fg)]" />
                </span>
                <h3 className="text-sm font-bold text-[var(--text-heading)]">
                  Run {confirmModalProbe.name}?
                </h3>
              </div>
              <span className="rounded bg-[var(--status-healthy-bg)] px-2 py-0.5 font-bold text-[10px] text-[var(--status-healthy-fg)]">
                {confirmModalProbe.risk}
              </span>
            </div>

            <div className="py-3.5 space-y-2.5">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10.5px] text-[var(--text-muted)] block">Target Workspace</span>
                  <strong className="text-[var(--text-heading)] truncate block">
                    {selectedInvestigation.workspace.name}
                  </strong>
                  <span className="font-mono text-[10px] text-[var(--text-muted)]">
                    {selectedInvestigation.workspace.id}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] text-[var(--text-muted)] block">Product & Integration</span>
                  <strong className="text-[var(--text-heading)] truncate block">
                    {selectedInvestigation.product}
                  </strong>
                  <span className="text-[10px] text-[var(--text-muted)] truncate block">
                    {selectedInvestigation.integration}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-[var(--surface-muted)] p-2.5 space-y-1">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Purpose</span>
                <p className="text-[11.5px] text-[var(--text-secondary)]">
                  {confirmModalProbe.description}
                </p>
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block pt-1">
                  Expected Effect
                </span>
                <p className="text-[11.5px] text-[var(--status-healthy-fg)] font-medium">
                  {confirmModalProbe.expectedEffect}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] block">Operator</span>
                  <span className="font-semibold text-[var(--text-heading)]">Dhruv Singla (Tier-2 Support)</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] block">Reason / Reference</span>
                  <span className="font-semibold font-mono text-amber-600">
                    {selectedInvestigation.caseId || "TK-9011"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--divider)]">
              <button
                type="button"
                onClick={() => setConfirmModalProbe(null)}
                className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--search-bg)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleExecuteDiagnostic(confirmModalProbe)}
                className="rounded-xl bg-[var(--accent-solid)] px-4 py-1.5 text-xs font-bold text-white hover:brightness-110 shadow-xs cursor-pointer"
              >
                Run Diagnostic
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          APPROVAL REQUIRED MODAL (HIGH-RISK OPERATIONS)
      ────────────────────────────────────────────────────────────────── */}
      {approvalModalProbe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--divider)] bg-[var(--surface)] p-5 shadow-2xl animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--divider)]">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700 font-bold">
                  <Shield size={14} />
                </span>
                <h3 className="text-sm font-bold text-[var(--text-heading)]">
                  Approval Required for {approvalModalProbe.name}
                </h3>
              </div>
              <span className="rounded bg-amber-100 text-amber-800 px-2 py-0.5 font-bold text-[10px]">
                {approvalModalProbe.risk}
              </span>
            </div>

            <div className="py-3.5 space-y-3">
              <p className="text-[11.5px] text-[var(--text-secondary)]">
                This diagnostic operation touches credential keystore sessions and requires SRE Lead or Platform Lead authorization prior to execution.
              </p>

              <div>
                <label className="block text-[10.5px] font-bold text-[var(--text-muted)] uppercase mb-1">
                  Designated Approver
                </label>
                <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface-muted)] p-2.5 font-semibold text-[var(--text-heading)]">
                  Arjun Mehta (Lead SRE / Platform On-call)
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-[var(--text-muted)] uppercase mb-1">
                  Justification / Case Reference
                </label>
                <textarea
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2.5 text-xs text-[var(--text-heading)] outline-none focus:border-[var(--sidebar-active)]"
                  placeholder="Provide customer incident justification..."
                />
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                <span>Linked Incident: <strong className="text-[var(--status-critical-fg)]">{selectedInvestigation.incidentId || "INC-10291"}</strong></span>
                <span>&middot;</span>
                <span>Case: <strong className="text-amber-600 font-mono">{selectedInvestigation.caseId || "TK-9011"}</strong></span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--divider)]">
              <button
                type="button"
                onClick={() => setApprovalModalProbe(null)}
                className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--search-bg)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestApproval}
                className="rounded-xl bg-amber-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-amber-700 shadow-xs cursor-pointer"
              >
                Submit Approval Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DiagnosticsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center text-xs text-[var(--text-muted)]">
          <RefreshCw size={20} className="animate-spin text-[var(--sidebar-active)] mr-2" />
          Loading Diagnostic Workbench...
        </div>
      }
    >
      <DiagnosticWorkbenchContent />
    </Suspense>
  );
}

"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Play,
  Terminal,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  ShieldCheck,
  Server,
  Layers,
  Building2,
  Globe,
  Radio,
  RefreshCw,
  Copy,
  Check,
  Flame,
  ArrowRight,
  Wrench,
  Ticket,
  MapPin,
  Lock,
  Zap,
  User,
  GitCommit,
  Share2,
  Plus,
  X,
  AlertOctagon,
  FileText,
  RotateCcw,
} from "lucide-react";
import ProductIcon from "@/components/shared/ProductIcon";
import IntegrationIcon from "@/components/shared/IntegrationIcon";
import FilterDropdown, { FilterDropdownOption } from "@/components/shared/FilterDropdown";
import {
  sreIncidents,
  type Incident360,
  type IncidentStatus,
} from "@/lib/mock-data/devops-sre";
import { triggerRefresh } from "@/lib/events/refresh";

type InspectorTab =
  | "overview"
  | "impact"
  | "timeline"
  | "metrics"
  | "logs"
  | "diagnostics"
  | "dependencies"
  | "mitigation"
  | "changes"
  | "pir"
  | "audit";

const STATUS_PIPELINE: IncidentStatus[] = [
  "Detected",
  "Triaged",
  "Investigating",
  "Mitigating",
  "Monitoring",
  "Resolved",
  "Closed",
];

function statusPipelineColor(step: IncidentStatus, current: IncidentStatus) {
  const stepIdx = STATUS_PIPELINE.indexOf(step);
  const currentIdx = STATUS_PIPELINE.indexOf(current);

  if (step === current) {
    return "bg-[var(--sidebar-active)] text-white shadow-xs font-bold ring-2 ring-[var(--sidebar-active)]/30";
  }
  if (stepIdx < currentIdx) {
    return "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold";
  }
  return "bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)] hover:bg-slate-200 dark:hover:bg-slate-700";
}

// SVG Error Rate Telemetry Line Chart
function ErrorRateChart({ data }: { data: Array<{ time: string; rate: number }> }) {
  const width = 240;
  const height = 80;
  const padL = 24;
  const padR = 8;
  const padT = 8;
  const padB = 18;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const maxVal = 5.0;

  const pts = data.map((d, i) => {
    const x = padL + (i / (data.length - 1)) * plotW;
    const y = padT + plotH - (Math.min(d.rate, maxVal) / maxVal) * plotH;
    return { x, y, ...d };
  });

  const pathD = pts.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x},${p.y}`, "");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-20 overflow-visible">
      <line x1={padL} y1={padT} x2={width - padR} y2={padT} stroke="var(--divider)" strokeDasharray="2,2" />
      <line x1={padL} y1={padT + plotH / 2} x2={width - padR} y2={padT + plotH / 2} stroke="var(--divider)" strokeDasharray="2,2" />
      <line x1={padL} y1={padT + plotH} x2={width - padR} y2={padT + plotH} stroke="var(--divider)" />
      
      <text x={padL - 4} y={padT + 3} textAnchor="end" className="fill-[var(--text-muted)] text-[8px] font-mono">5%</text>
      <text x={padL - 4} y={padT + plotH / 2 + 3} textAnchor="end" className="fill-[var(--text-muted)] text-[8px] font-mono">2.5%</text>
      <text x={padL - 4} y={padT + plotH + 3} textAnchor="end" className="fill-[var(--text-muted)] text-[8px] font-mono">0%</text>

      <path d={pathD} fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {pts.map((p, idx) => (
        <circle key={idx} cx={p.x} cy={p.y} r={p.rate > 1 ? 3 : 2} fill={p.rate > 1 ? "#DC2626" : "#EF4444"} />
      ))}
    </svg>
  );
}

function SreIncidentsContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "INC-1042";

  const [incidents, setIncidents] = useState<Incident360[]>(sreIncidents);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(initialId);
  const [activeTab, setActiveTab] = useState<InspectorTab>("overview");

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"severity" | "latest" | "blast-radius">("severity");
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  // Mitigation Note input
  const [newNote, setNewNote] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isDeclareOpen, setIsDeclareOpen] = useState(false);
  const [declareTitle, setDeclareTitle] = useState("");
  const [declareSeverity, setDeclareSeverity] = useState("P1-Critical");

  const selectedIncident = useMemo(() => {
    return incidents.find((inc) => inc.id === selectedIncidentId) || incidents[0];
  }, [incidents, selectedIncidentId]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Authoritative State Machine Transition Handler
  const handleTransitionStatus = (nextStatus: IncidentStatus) => {
    const prevStatus = selectedIncident.status;
    const updatedIncidents = incidents.map((inc) => {
      if (inc.id === selectedIncident.id) {
        return {
          ...inc,
          status: nextStatus,
          statusLevel: (nextStatus === "Resolved" || nextStatus === "Closed"
            ? "healthy"
            : nextStatus === "Monitoring"
            ? "warning"
            : "critical") as any,
          timeline: [
            ...inc.timeline,
            {
              time: new Date().toLocaleTimeString() + " IST",
              actor: "Arjun Mehta [Lead SRE]",
              action: `Transitioned status from ${prevStatus} → ${nextStatus}.`,
              type: "status" as const,
            },
          ],
        };
      }
      return inc;
    });

    setIncidents(updatedIncidents);
    showToast(`Authoritative Status Transitioned: ${prevStatus} → ${nextStatus}. Recorded in SRE Audit Ledger.`);
    triggerRefresh({ source: `incident-status-${selectedIncident.id}` });
  };

  // Append Mitigation Note Handler
  const handleAddMitigationNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const noteText = newNote.trim();
    const updatedIncidents = incidents.map((inc) => {
      if (inc.id === selectedIncident.id) {
        return {
          ...inc,
          mitigationNotes: `${inc.mitigationNotes} | [${new Date().toLocaleTimeString()}]: ${noteText}`,
          timeline: [
            ...inc.timeline,
            {
              time: new Date().toLocaleTimeString() + " IST",
              actor: "Arjun Mehta [Lead SRE]",
              action: `Mitigation Action: ${noteText}`,
              type: "mitigation" as const,
            },
          ],
        };
      }
      return inc;
    });

    setIncidents(updatedIncidents);
    setNewNote("");
    showToast("Mitigation note immutably recorded in audit ledger.");
    triggerRefresh({ source: `incident-note-${selectedIncident.id}` });
  };

  const handleDeclareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeclareOpen(false);
    showToast(`P1 Incident Declared: "${declareTitle}". War room instantiated, on-call paged.`);
    setDeclareTitle("");
  };

  // Filter options
  const severityOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Severities" },
    { value: "P1-Critical", label: "P1 - Critical Outages" },
    { value: "P2-High", label: "P2 - High / Major" },
    { value: "P3-Medium", label: "P3 - Medium" },
  ];

  const statusOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Statuses" },
    { value: "Detected", label: "Detected" },
    { value: "Triaged", label: "Triaged" },
    { value: "Investigating", label: "Investigating" },
    { value: "Mitigating", label: "Mitigating" },
    { value: "Monitoring", label: "Monitoring" },
    { value: "Resolved", label: "Resolved" },
    { value: "Closed", label: "Closed" },
  ];

  const productOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Products" },
    { value: "Chat with Sahayogi", label: "Chat with Sahayogi" },
    { value: "BoSS", label: "BoSS" },
    { value: "Tax Sahayogi", label: "Tax Sahayogi" },
    { value: "Sahayogi One", label: "Sahayogi One" },
  ];

  const sortOptions: FilterDropdownOption[] = [
    { value: "severity", label: "Highest Severity (P1 First)" },
    { value: "blast-radius", label: "Highest Blast Radius" },
    { value: "latest", label: "Latest Updated First" },
  ];

  // Filtering
  const filteredIncidents = useMemo(() => {
    const list = incidents.filter((inc) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          inc.id.toLowerCase().includes(q) ||
          inc.title.toLowerCase().includes(q) ||
          inc.affectedServices.some((s) => s.toLowerCase().includes(q)) ||
          inc.commander.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (severityFilter !== "all" && inc.severity !== severityFilter) return false;
      if (statusFilter !== "all" && inc.status !== statusFilter) return false;
      if (productFilter !== "all" && !inc.affectedProducts?.includes(productFilter)) return false;
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === "blast-radius") return b.affectedWorkspacesCount - a.affectedWorkspacesCount;
      if (sortBy === "severity") {
        const order: Record<string, number> = { "P1-Critical": 1, "P2-High": 2, "P3-Medium": 3 };
        return (order[a.severity] || 9) - (order[b.severity] || 9);
      }
      return 0;
    });
  }, [incidents, searchQuery, severityFilter, statusFilter, productFilter, sortBy]);

  // KPI Calculations
  const activeOutagesCount = incidents.filter((i) => i.status !== "Resolved" && i.status !== "Closed").length;
  const p1Count = incidents.filter((i) => i.severity === "P1-Critical").length;
  const p2Count = incidents.filter((i) => i.severity === "P2-High").length;
  const totalBlastRadius = incidents.reduce((acc, i) => acc + i.affectedWorkspacesCount, 0);
  const degradedServicesCount = 2;
  const fleetMttr = "28.4m";

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
          HEADER SECTION (Breadcrumb, Title, Subtitle, Actions)
      ────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 py-1.5 px-1 sm:px-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[var(--text-muted)] font-normal">Incidents</span>
          <span className="text-[var(--text-muted)]/60 font-light">&gt;</span>
          <span className="font-bold text-[var(--text-heading)]">Active Command Center</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mt-0.5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-heading)]">
                Incident 360 Command Center
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-900">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                SRE AUTHORITATIVE COMMAND
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              7-stage authoritative lifecycle state machine, real-time blast radius calculations, runbook execution, and PIR 5-whys
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setIsDeclareOpen(true)}
              className="tap-pop flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-400 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition-colors"
            >
              <AlertOctagon size={13} />
              <span>Declare Production Incident</span>
            </button>
            <button
              onClick={() => showToast("Incident stream refreshed")}
              className="tap-pop flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)] hover:bg-[var(--search-bg)] text-[var(--text-heading)] text-xs font-medium shadow-2xs"
            >
              <RefreshCw size={13} className="text-[var(--text-muted)]" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          6 KPI SECTION (EXACT MATCH TO TECHNICAL SUPPORT METRIC ROW)
      ────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 screen-sm:grid-cols-3 screen-lg:grid-cols-6 lg:grid-cols-6 gap-2 sm:gap-2.5 lg:gap-3 px-1 sm:px-2 mb-3">
        {/* Card 1: Active Outages */}
        <div
          onClick={() => setStatusFilter("all")}
          className="cursor-pointer group flex flex-col justify-between rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2.5 sm:p-3 hover:border-[var(--sidebar-active)]/50 transition-all shadow-2xs hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--text-muted)]">Active Outages</span>
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-950 px-1.5 py-0.5 rounded animate-pulse">
              Open
            </span>
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-rose-600">
              {activeOutagesCount}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] ml-1">War Rooms</span>
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-1 truncate">P1 INC-1042 Active</div>
        </div>

        {/* Card 2: Critical P1 */}
        <div
          onClick={() => setSeverityFilter("P1-Critical")}
          className="cursor-pointer group flex flex-col justify-between rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2.5 sm:p-3 hover:border-rose-400 transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">Critical P1</span>
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-rose-800 bg-rose-100 dark:bg-rose-950 px-1.5 py-0.5 rounded">
              High Priority
            </span>
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-rose-600">
              {p1Count}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] ml-1">Core Impact</span>
          </div>
          <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 truncate font-medium">Meta WABA Egress</div>
        </div>

        {/* Card 3: Major P2 */}
        <div
          onClick={() => setSeverityFilter("P2-High")}
          className="cursor-pointer group flex flex-col justify-between rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2.5 sm:p-3 hover:border-amber-400 transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Major P2</span>
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded">
              Degraded
            </span>
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-amber-600">
              {p2Count}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] ml-1">Partial</span>
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-1 truncate">BBPS Biller Fetch</div>
        </div>

        {/* Card 4: Total Blast Radius */}
        <div className="flex flex-col justify-between rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2.5 sm:p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--text-muted)]">Fleet Blast Radius</span>
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
              Calculated
            </span>
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-heading)]">
              {totalBlastRadius}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] ml-1">Tenants</span>
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-1 truncate">All Monitored Workspaces</div>
        </div>

        {/* Card 5: Services Degraded */}
        <div className="flex flex-col justify-between rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2.5 sm:p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--text-muted)]">Services Affected</span>
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
              2 / 18
            </span>
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-rose-600">
              {degradedServicesCount}
            </span>
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-1 truncate">WABA &amp; BBPS</div>
        </div>

        {/* Card 6: Fleet MTTR */}
        <div className="flex flex-col justify-between rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2.5 sm:p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--text-muted)]">Fleet MTTR</span>
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
              -12%
            </span>
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600">
              {fleetMttr}
            </span>
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-1 truncate">Target &lt; 35.0m</div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          FILTER TOOLBAR (MATCHING TECHNICAL SUPPORT EXACT CONTROLS)
      ────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 sm:px-2 mb-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search incident ID, title, service, commander..."
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

          {/* Severity Dropdown */}
          <FilterDropdown
            label="Severity:"
            value={severityFilter}
            onChange={setSeverityFilter}
            options={severityOptions}
            title="Filter by Severity"
            className="text-xs"
          />

          {/* Status Dropdown */}
          <FilterDropdown
            label="Status:"
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            title="Filter by Incident Status"
            className="text-xs"
          />

          {/* Product Dropdown */}
          <FilterDropdown
            label="Product:"
            value={productFilter}
            onChange={setProductFilter}
            options={productOptions}
            title="Filter by Product"
            className="text-xs"
          />

          {/* More Filters Toggle */}
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

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-1.5">
          <FilterDropdown
            label="Sort by:"
            value={sortBy}
            onChange={(val) => setSortBy(val as any)}
            options={sortOptions}
            title="Sort Incidents"
            className="text-xs"
            align="right"
          />
        </div>
      </div>

      {/* Expanded More Filters Drawer */}
      {moreFiltersOpen && (
        <div className="mx-1 sm:mx-2 mb-3 p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)] flex flex-wrap items-center gap-4 text-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--text-heading)]">Incident Commander:</span>
            <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[var(--text-heading)] font-mono text-[11px]">
              Arjun Mehta [Lead SRE] · Kabir S.
            </span>
          </div>
          <button
            onClick={() => {
              setSearchQuery("");
              setSeverityFilter("all");
              setStatusFilter("all");
              setProductFilter("all");
              setSortBy("severity");
            }}
            className="text-xs text-[var(--sidebar-active)] hover:underline ml-auto"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          SPLIT VIEW: 45% LEFT QUEUE / 55% RIGHT DEEP INSPECTOR
      ────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-3 px-1 sm:px-2 min-h-0 flex-1">
        {/* ── LEFT PANEL: INCIDENT QUEUE (45%) ────────────────────────── */}
        <div
          className="w-full lg:w-[45%] shrink-0 bg-[var(--surface)] rounded-2xl border border-[var(--card-border)] shadow-xs flex flex-col p-3 sm:p-3.5 max-h-[520px] lg:max-h-none lg:h-[calc(100dvh-17rem)] overflow-hidden"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--divider)]">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-heading)] leading-tight">
                Incidents ({filteredIncidents.length})
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Active and recently resolved platform incidents
              </p>
            </div>
            <FilterDropdown
              label="Sort by:"
              value={sortBy}
              onChange={(v) => setSortBy(v as any)}
              options={sortOptions}
              title="Sort Incidents"
              align="right"
            />
          </div>

          <div className="flex-1 overflow-y-auto pt-2 space-y-2 pr-0.5">
            {filteredIncidents.map((inc) => {
              const isSelected = inc.id === selectedIncidentId;
              const isP1 = inc.severity === "P1-Critical";

              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncidentId(inc.id)}
                  className={`tap-pop cursor-pointer text-left rounded-xl border p-3 transition-all relative ${
                    isSelected
                      ? "border-[var(--sidebar-active)] bg-[var(--sidebar-active)]/[0.04] shadow-xs ring-1 ring-[var(--sidebar-active)]"
                      : "border-[var(--divider)] bg-[var(--surface)] hover:border-[var(--sidebar-active)]/40 hover:bg-[var(--search-bg)]"
                  } ${
                    isP1 ? "border-l-4 border-l-rose-500" : "border-l-4 border-l-amber-500"
                  }`}
                >
                  {/* Top Row: ID + Title + Severity Badge */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-xs text-[var(--text-heading)] font-mono">
                        {inc.id}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">·</span>
                      <span className="font-bold text-xs text-[var(--text-heading)] truncate">
                        {inc.title}
                      </span>
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isP1
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 animate-pulse"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}>
                        {inc.severity}
                      </span>
                    </div>
                  </div>

                  {/* Services & Commander */}
                  <div className="text-xs text-[var(--text-muted)] mb-2 flex items-center justify-between">
                    <span className="truncate">Service: {inc.affectedServices.join(", ")}</span>
                    <span className="font-semibold text-[var(--text-heading)] shrink-0">{inc.commander}</span>
                  </div>

                  {/* Bottom Bar: Blast Radius & Error Rate */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-[var(--divider)] text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--text-muted)]">Blast Radius:</span>
                      <span className="font-bold text-rose-600 font-mono">
                        {inc.affectedWorkspacesCount} Tenants
                      </span>
                      <span className="text-[var(--text-muted)]">| Status:</span>
                      <span className="font-semibold text-[var(--text-heading)]">{inc.status}</span>
                    </div>

                    <div className="text-[var(--text-muted)] flex items-center gap-1 font-mono">
                      <span>{inc.firstSeen}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT PANEL: INCIDENT 360 (55%) ─────────────────────────── */}
        <div
          className="flex-1 min-w-0 bg-[var(--surface)] rounded-2xl border border-[var(--card-border)] shadow-xs flex flex-col p-3.5 sm:p-5 overflow-hidden lg:h-[calc(100dvh-17rem)]"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <div className="flex flex-col h-full overflow-y-auto">
          {/* Inspector Header */}
          <div className="p-3.5 sm:p-4 border-b border-[var(--divider)] bg-[var(--surface)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mb-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 shrink-0 mt-0.5">
                  <AlertOctagon size={24} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-bold text-[var(--text-heading)]">
                      {selectedIncident.id}: {selectedIncident.title}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      {selectedIncident.severity}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {selectedIncident.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-1 flex-wrap">
                    <span>Commander: <strong>{selectedIncident.commander}</strong></span>
                    <span>·</span>
                    <span>Detected {selectedIncident.firstSeen}</span>
                    <span>·</span>
                    <span className="font-bold text-rose-600">{selectedIncident.affectedWorkspacesCount} Workspaces Impacted</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AUTHORITATIVE SRE STATUS MACHINE PIPELINE (CLICK TO TRANSITION) */}
            <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-slate-50 dark:bg-slate-900 mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Authoritative SRE Lifecycle State Pipeline (Click Step to Transition):
                </span>
                <span className="text-[10px] font-bold text-[var(--sidebar-active)]">
                  Current: {selectedIncident.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                {STATUS_PIPELINE.map((step, idx) => {
                  const isCurrent = step === selectedIncident.status;
                  const isPast = STATUS_PIPELINE.indexOf(step) < STATUS_PIPELINE.indexOf(selectedIncident.status);

                  return (
                    <button
                      key={step}
                      onClick={() => handleTransitionStatus(step)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                        statusPipelineColor(step, selectedIncident.status)
                      }`}
                    >
                      <span className="text-[9px] opacity-70">{idx + 1}.</span>
                      <span>{step}</span>
                      {isCurrent && <span className="ml-0.5 text-[8px] bg-[var(--surface)] text-[var(--icon-btn-navy)] px-1 rounded font-bold shadow-2xs">ACTIVE</span>}
                      {isPast && <Check size={11} className="inline ml-0.5 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inspector Tab Bar (11 Deep Tabs) */}
            <div className="flex items-center gap-1 border-b border-[var(--divider)] overflow-x-auto scrollbar-none text-xs">
              {[
                { id: "overview", label: "Overview" },
                { id: "impact", label: `Impact (${selectedIncident.affectedWorkspacesCount})` },
                { id: "timeline", label: "Timeline" },
                { id: "metrics", label: "Metrics & Spikes" },
                { id: "logs", label: "Traces & Logs" },
                { id: "diagnostics", label: "Diagnostics" },
                { id: "dependencies", label: "Dependencies" },
                { id: "mitigation", label: "Mitigation & Runbooks" },
                { id: "changes", label: "Changes & Releases (UC-06)" },
                { id: "pir", label: "PIR & 5-Whys" },
                { id: "audit", label: "Audit Ledger" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as InspectorTab)}
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
            {/* ─────────────────────────────────────────────────────────
                TAB 1: OVERVIEW
            ────────────────────────────────────────────────────────── */}
            {activeTab === "overview" && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                    <span className="text-[10px] text-[var(--text-muted)]">Detection Source</span>
                    <div className="font-bold text-xs text-[var(--text-heading)] mt-0.5 truncate">
                      {selectedIncident.detectionSource}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                    <span className="text-[10px] text-[var(--text-muted)]">Impacted Service</span>
                    <div className="font-bold text-xs text-rose-600 mt-0.5 truncate">
                      {selectedIncident.affectedServices.join(", ")}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                    <span className="text-[10px] text-[var(--text-muted)]">Pre → Post Errors</span>
                    <div className="font-bold text-xs text-rose-600 mt-0.5 font-mono">
                      {selectedIncident.id === "INC-1042" ? "0.12% → 4.80%" : "0.01% → 0.42%"}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                    <span className="text-[10px] text-[var(--text-muted)]">Blast Radius</span>
                    <div className="font-bold text-xs text-rose-600 mt-0.5">
                      {selectedIncident.affectedWorkspacesCount} Tenants
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                  <span className="font-bold text-xs text-[var(--text-heading)] mb-1 block">
                    SRE Root Cause Statement:
                  </span>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {selectedIncident.pir?.rootCause || selectedIncident.mitigationNotes}
                  </p>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────
                TAB 2: IMPACT
            ────────────────────────────────────────────────────────── */}
            {activeTab === "impact" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-[var(--text-heading)]">
                    Affected Customer Workspaces ({selectedIncident.affectedWorkspacesCount})
                  </h3>
                  <span className="text-[11px] text-rose-600 font-bold">P1 Priority Triage</span>
                </div>

                <div className="rounded-xl border border-[var(--divider)] overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 text-[var(--text-muted)] border-b border-[var(--divider)]">
                        <th className="p-2.5 font-medium">Tenant ID</th>
                        <th className="p-2.5 font-medium">Workspace Legal Name</th>
                        <th className="p-2.5 font-medium">SLA Tier</th>
                        <th className="p-2.5 font-medium">Error Volume</th>
                        <th className="p-2.5 font-medium">Support Guidance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--divider)]">
                      <tr>
                        <td className="p-2.5 font-mono font-bold text-[var(--sidebar-active)]">WS-94812</td>
                        <td className="p-2.5 font-bold">Sharma Traders Private Limited</td>
                        <td className="p-2.5"><span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">Tier-1</span></td>
                        <td className="p-2.5 font-mono text-rose-600 font-bold">1,420 errors</td>
                        <td className="p-2.5 text-[var(--text-muted)]">Advise retry with backoff. Webhooks queued.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono font-bold text-[var(--sidebar-active)]">WS-40182</td>
                        <td className="p-2.5 font-bold">Zeta Fintech Technologies</td>
                        <td className="p-2.5"><span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">Tier-1</span></td>
                        <td className="p-2.5 font-mono text-rose-600 font-bold">1,290 errors</td>
                        <td className="p-2.5 text-[var(--text-muted)]">Canary rollback in flight.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────
                TAB 3: TIMELINE
            ────────────────────────────────────────────────────────── */}
            {activeTab === "timeline" && (
              <div className="space-y-2">
                {selectedIncident.timeline.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-[var(--divider)]">
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between mb-0.5">
                        <strong className="text-[var(--text-heading)]">{item.actor}</strong>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">{item.time}</span>
                      </div>
                      <p className="text-[var(--text-muted)]">{item.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────
                TAB 4: METRICS & SPIKES
            ────────────────────────────────────────────────────────── */}
            {activeTab === "metrics" && (
              <div className="flex flex-col gap-4">
                <div className="p-3.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                  <span className="font-bold text-xs text-[var(--text-heading)] mb-2 block">
                    Error Rate Telemetry Spike (4.82% Peak)
                  </span>
                  <ErrorRateChart data={[
                    { time: "09:30", rate: 0.02 },
                    { time: "09:40", rate: 0.15 },
                    { time: "09:50", rate: 1.84 },
                    { time: "10:00", rate: 4.82 },
                    { time: "10:10", rate: 4.60 },
                    { time: "10:20", rate: 4.20 },
                  ]} />
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────
                TAB 5: LOGS & TRACES
            ────────────────────────────────────────────────────────── */}
            {activeTab === "logs" && (
              <div className="rounded-xl border border-[var(--divider)] overflow-hidden font-mono text-xs">
                <div className="p-2.5 bg-slate-950 text-emerald-400 space-y-1 overflow-x-auto max-h-72">
                  <div>[13:58:30] [ERROR] HTTP 504 Gateway Timeout from https://graph.facebook.com/v21.0/messages</div>
                  <div>[13:58:32] [TRACE] TraceID: trc_94812_01j8m4k SpanID: sp_meta_001 Duration: 3002ms</div>
                  <div>[13:58:35] [CIRCUIT_BREAKER] State tripped to HALF-OPEN after 5 consecutive timeouts</div>
                  <div>[14:00:12] [SENTINEL] Alert threshold 1.0% breached. Current: 4.82%. Incident INC-1042 declared.</div>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────
                TAB 6: DIAGNOSTICS
            ────────────────────────────────────────────────────────── */}
            {activeTab === "diagnostics" && (
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">Synthetic Canary Ping (Meta Graph API)</span>
                    <span className="px-1.5 py-0.2 rounded font-bold bg-rose-100 text-rose-800 text-[10px]">FAILED (504)</span>
                  </div>
                  <span className="text-[var(--text-muted)]">Target endpoint timeout exceeded 3000ms threshold.</span>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────
                TAB 7: DEPENDENCIES
            ────────────────────────────────────────────────────────── */}
            {activeTab === "dependencies" && (
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)] flex items-center justify-between">
                  <span>External: Meta Graph API v21.0</span>
                  <span className="px-2 py-0.5 rounded font-bold bg-rose-100 text-rose-800 text-[10px]">High Latency (504)</span>
                </div>
                <div className="p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)] flex items-center justify-between">
                  <span>Internal: Redis Inbound Queue</span>
                  <span className="px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 text-[10px]">Nominal</span>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────
                TAB 8: MITIGATION & RUNBOOKS
            ────────────────────────────────────────────────────────── */}
            {activeTab === "mitigation" && (
              <div className="flex flex-col gap-4 text-xs">
                {/* Append Note Box */}
                <form onSubmit={handleAddMitigationNote} className="p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                  <label className="font-bold block mb-1">Append Mitigation Note (SRE Authority):</label>
                  <textarea
                    rows={2}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Document action taken, runbook executed, or status update..."
                    className="w-full p-2 rounded-lg border border-[var(--divider)] bg-[var(--surface)] text-xs mb-2"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[var(--text-muted)]">Author: Arjun Mehta [Lead SRE]</span>
                    <button
                      type="submit"
                      disabled={!newNote.trim()}
                      className="tap-pop px-3 py-1.5 rounded-lg bg-[var(--sidebar-active)] text-white font-bold disabled:opacity-50"
                    >
                      Append Note
                    </button>
                  </div>
                </form>

                {/* SRE Runbooks */}
                <div className="p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                  <span className="font-bold block mb-2">Automated SRE Runbooks:</span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-900 border border-[var(--divider)]">
                      <div>
                        <span className="font-bold block">RB-WABA-FLUSH: Flush Connection Pool</span>
                        <span className="text-[10px] text-[var(--text-muted)]">Purges stale keep-alive sockets</span>
                      </div>
                      <button
                        onClick={() => showToast("Executed Runbook RB-WABA-FLUSH successfully")}
                        className="tap-pop px-2.5 py-1 rounded bg-[var(--sidebar-active)] text-white text-[11px] font-bold"
                      >
                        Execute
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────
                TAB 9: CHANGES & RELEASES (UC-06)
            ────────────────────────────────────────────────────────── */}
            {activeTab === "changes" && (
              <div className="p-3.5 rounded-xl border border-rose-300 bg-rose-50/40 dark:bg-rose-950/20 text-xs">
                <span className="font-bold block text-rose-800 dark:text-rose-300 mb-1">
                  Correlated Bad Release: v3.4.1 (SHA e8b29c1)
                </span>
                <p className="text-[var(--text-muted)] mb-2">
                  Deployed 18m prior to outage detection. Reduced upstream timeout from 15000ms to 3000ms in Helm values.yaml.
                </p>
                <Link href="/devops-sre/releases" className="tap-pop font-bold text-[var(--sidebar-active)] inline-flex items-center gap-1">
                  Inspect in Release 360 Governance →
                </Link>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────
                TAB 10: PIR & 5-WHYS
            ────────────────────────────────────────────────────────── */}
            {activeTab === "pir" && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                  <span className="font-bold block mb-2">5-Whys Root Cause Analysis:</span>
                  <ol className="list-decimal list-inside space-y-1 text-[var(--text-muted)]">
                    <li>Why did webhooks fail? Upstream HTTP 504 timeouts.</li>
                    <li>Why did it time out? Egress timeout was reduced to 3000ms in v3.4.1.</li>
                    <li>Why was it reduced? To prevent connection starvation during peak traffic.</li>
                    <li>Why did it cause failures? Meta Graph API p99 latency periodically exceeds 3500ms.</li>
                    <li>Why was this not caught? Canary verification test only tested happy path latencies under 500ms.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────
                TAB 11: AUDIT LEDGER
            ────────────────────────────────────────────────────────── */}
            {activeTab === "audit" && (
              <div className="space-y-2 font-mono text-xs">
                <div className="p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)] font-sans">
                  <span className="font-bold block mb-2">Incident State Transition Ledger (SHA-256 Sealed):</span>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="p-1.5 rounded bg-slate-50 dark:bg-slate-900">
                      14:02:40 [STATE_TRANSITION] Investigating → Mitigating by Arjun Mehta
                    </div>
                    <div className="p-1.5 rounded bg-slate-50 dark:bg-slate-900">
                      14:00:12 [INCIDENT_DETECTED] Alert fired via Sentinel Rule UC-06
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          DECLARE INCIDENT MODAL
      ────────────────────────────────────────────────────────────────── */}
      {isDeclareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-[var(--divider)] bg-[var(--surface)] p-5 shadow-2xl text-[var(--text-heading)]">
            <div className="flex items-center justify-between border-b border-[var(--divider)] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <AlertOctagon className="text-rose-600" size={18} />
                <h3 className="font-bold text-sm text-[var(--text-heading)]">
                  Declare Production Incident
                </h3>
              </div>
              <button
                onClick={() => setIsDeclareOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-heading)]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleDeclareSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Incident Title / Summary:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UPI Payment Switch Timeout Cascade"
                  value={declareTitle}
                  onChange={(e) => setDeclareTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[var(--divider)] bg-[var(--surface)] text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Severity Level:</label>
                <select
                  value={declareSeverity}
                  onChange={(e) => setDeclareSeverity(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[var(--divider)] bg-[var(--surface)] text-xs font-semibold"
                >
                  <option value="P1-Critical">P1 - Critical (Core Rail Down / Customer Outage)</option>
                  <option value="P2-High">P2 - Major (Degraded Latency / Error Budget Burn)</option>
                  <option value="P3-Medium">P3 - Moderate (Internal Synthetic Failure)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--divider)]">
                <button
                  type="button"
                  onClick={() => setIsDeclareOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-[var(--divider)] hover:bg-[var(--search-bg)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tap-pop px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
                >
                  Declare &amp; Open War Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SreIncidentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-[var(--text-muted)]">Loading Incident Command Center...</div>}>
      <SreIncidentsContent />
    </Suspense>
  );
}

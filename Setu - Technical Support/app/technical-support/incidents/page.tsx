"use client";

import { useState, useMemo, Suspense } from "react";
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
} from "lucide-react";
import ProductIcon from "@/components/shared/ProductIcon";
import IntegrationIcon from "@/components/shared/IntegrationIcon";
import FilterDropdown, { FilterDropdownOption } from "@/components/shared/FilterDropdown";
import {
  MOCK_INCIDENTS,
  IncidentItem,
  IncidentSeverity,
  IncidentStatus,
} from "@/lib/mock-data/incidents";

type InspectorTab =
  | "overview"
  | "impact"
  | "timeline"
  | "metrics"
  | "logs"
  | "diagnostics"
  | "dependencies"
  | "mitigation"
  | "tickets"
  | "changes"
  | "audit";

type SortOption = "severity" | "latest" | "blast-radius" | "status";

const SORT_OPTIONS: { id: SortOption; label: string; sub: string }[] = [
  { id: "latest", label: "Latest", sub: "Most recently updated" },
  { id: "severity", label: "Severity (P1 First)", sub: "Critical incidents first" },
  { id: "blast-radius", label: "Blast Radius", sub: "Highest workspace impact" },
  { id: "status", label: "Status", sub: "Investigating & Mitigating first" },
];

function severityBadgeClass(severity: IncidentSeverity) {
  if (severity.includes("P1")) {
    return "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800";
  }
  if (severity.includes("P2")) {
    return "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800";
  }
  if (severity.includes("P3")) {
    return "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800";
  }
  return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700";
}

function severityDotClass(severity: IncidentSeverity) {
  if (severity.includes("P1")) return "bg-red-600";
  if (severity.includes("P2")) return "bg-amber-500";
  if (severity.includes("P3")) return "bg-blue-500";
  return "bg-gray-500";
}

function statusBadgeClass(status: IncidentStatus) {
  if (status === "Investigating" || status === "Detected") {
    return "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900";
  }
  if (status === "Mitigating") {
    return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900";
  }
  if (status === "Monitoring") {
    return "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-900";
  }
  if (status === "Resolved") {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900";
  }
  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
}

function statusDotClass(status: IncidentStatus) {
  if (status === "Investigating" || status === "Detected") return "bg-red-500";
  if (status === "Mitigating") return "bg-amber-500";
  if (status === "Monitoring") return "bg-blue-500";
  if (status === "Resolved") return "bg-emerald-500";
  return "bg-gray-400";
}

// SVG Error Rate Telemetry Line Chart
function ErrorRateChart({ data }: { data: Array<{ time: string; rate: number }> }) {
  const width = 240;
  const height = 90;
  const padL = 24;
  const padR = 8;
  const padT = 8;
  const padB = 18;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const maxVal = 4.0;

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
      
      <text x={padL - 4} y={padT + 3} textAnchor="end" className="fill-[var(--text-muted)] text-[8px] font-mono">4%</text>
      <text x={padL - 4} y={padT + plotH / 2 + 3} textAnchor="end" className="fill-[var(--text-muted)] text-[8px] font-mono">2%</text>
      <text x={padL - 4} y={padT + plotH + 3} textAnchor="end" className="fill-[var(--text-muted)] text-[8px] font-mono">0%</text>

      <path d={pathD} fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {pts.map((p) => (
        <text key={p.time} x={p.x} y={height - 2} textAnchor="middle" className="fill-[var(--text-muted)] text-[8px] font-mono">
          {p.time}
        </text>
      ))}
    </svg>
  );
}

// SVG Latency Area Chart
function LatencyAreaChart({ data }: { data: Array<{ time: string; p95: number }> }) {
  const width = 240;
  const height = 90;
  const padL = 26;
  const padR = 8;
  const padT = 8;
  const padB = 18;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const maxVal = 2000;

  const pts = data.map((d, i) => {
    const x = padL + (i / (data.length - 1)) * plotW;
    const y = padT + plotH - (Math.min(d.p95, maxVal) / maxVal) * plotH;
    return { x, y, ...d };
  });

  const pathD = pts.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x},${p.y}`, "");
  const areaD = `${pathD} L ${pts[pts.length - 1].x},${padT + plotH} L ${pts[0].x},${padT + plotH} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-20 overflow-visible">
      <defs>
        <linearGradient id="incLatencyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <line x1={padL} y1={padT} x2={width - padR} y2={padT} stroke="var(--divider)" strokeDasharray="2,2" />
      <line x1={padL} y1={padT + plotH / 2} x2={width - padR} y2={padT + plotH / 2} stroke="var(--divider)" strokeDasharray="2,2" />
      <line x1={padL} y1={padT + plotH} x2={width - padR} y2={padT + plotH} stroke="var(--divider)" />

      <text x={padL - 4} y={padT + 3} textAnchor="end" className="fill-[var(--text-muted)] text-[8px] font-mono">2.0s</text>
      <text x={padL - 4} y={padT + plotH / 2 + 3} textAnchor="end" className="fill-[var(--text-muted)] text-[8px] font-mono">1.0s</text>
      <text x={padL - 4} y={padT + plotH + 3} textAnchor="end" className="fill-[var(--text-muted)] text-[8px] font-mono">0 ms</text>

      <path d={areaD} fill="url(#incLatencyGrad)" />
      <path d={pathD} fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {pts.map((p) => (
        <text key={p.time} x={p.x} y={height - 2} textAnchor="middle" className="fill-[var(--text-muted)] text-[8px] font-mono">
          {p.time}
        </text>
      ))}
    </svg>
  );
}

// SVG Request Volume Bar Chart
function VolumeBarChart({ data }: { data: Array<{ time: string; volume: number }> }) {
  const width = 240;
  const height = 90;
  const padL = 24;
  const padR = 8;
  const padT = 8;
  const padB = 18;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const maxVal = 2000;

  const barCount = 18;
  const barWidth = 6;
  const gap = (plotW - barCount * barWidth) / (barCount - 1);

  // Simulated bar heights
  const bars = [
    1200, 1350, 1400, 1380, 1420, 1390, 1450, 1500, 1480, 1350, 1220, 1180, 1200, 1240, 1220, 1260, 1280, 1250,
  ];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-20 overflow-visible">
      <line x1={padL} y1={padT} x2={width - padR} y2={padT} stroke="var(--divider)" strokeDasharray="2,2" />
      <line x1={padL} y1={padT + plotH / 2} x2={width - padR} y2={padT + plotH / 2} stroke="var(--divider)" strokeDasharray="2,2" />
      <line x1={padL} y1={padT + plotH} x2={width - padR} y2={padT + plotH} stroke="var(--divider)" />

      <text x={padL - 4} y={padT + 3} textAnchor="end" className="fill-[var(--text-muted)] text-[8px] font-mono">2K</text>
      <text x={padL - 4} y={padT + plotH / 2 + 3} textAnchor="end" className="fill-[var(--text-muted)] text-[8px] font-mono">1K</text>
      <text x={padL - 4} y={padT + plotH + 3} textAnchor="end" className="fill-[var(--text-muted)] text-[8px] font-mono">0</text>

      {bars.map((val, idx) => {
        const x = padL + idx * (barWidth + gap);
        const bH = (val / maxVal) * plotH;
        const y = padT + plotH - bH;
        return (
          <rect
            key={idx}
            x={x}
            y={y}
            width={barWidth}
            height={bH}
            rx={1.5}
            fill="#60A5FA"
            className="hover:fill-blue-600 transition-colors"
          />
        );
      })}

      {["09:30", "09:45", "10:00", "10:15", "10:30"].map((time, i) => {
        const x = padL + (i / 4) * plotW;
        return (
          <text key={time} x={x} y={height - 2} textAnchor="middle" className="fill-[var(--text-muted)] text-[8px] font-mono">
            {time}
          </text>
        );
      })}
    </svg>
  );
}

function IncidentsPageContent() {
  const searchParams = useSearchParams();
  const initialIncidentId = searchParams.get("id") || "INC-1045";
  const openCreateParam = searchParams.get("create") === "true";

  const [incidents, setIncidents] = useState<IncidentItem[]>(MOCK_INCIDENTS);
  const [selectedId, setSelectedId] = useState<string>(initialIncidentId);
  const [activeTab, setActiveTab] = useState<InspectorTab>("overview");

  // Filters & Search
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [envFilter, setEnvFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [timeRange, setTimeRange] = useState("Last 24 hours");

  // Interaction modals
  const [showCreateModal, setShowCreateModal] = useState(openCreateParam);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [actionToast, setActionToast] = useState<string | null>(null);

  // New incident form state
  const [newTitle, setNewTitle] = useState("");
  const [newProduct, setNewProduct] = useState("Chat with Sahayogi");
  const [newService, setNewService] = useState("WhatsApp Gateway");
  const [newSeverity, setNewSeverity] = useState<IncidentSeverity>("P1 · Critical");
  const [newImpact, setNewImpact] = useState("");

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3500);
  };

  // Filter dropdown options derived from data
  const allProducts = useMemo(
    () => Array.from(new Set(incidents.map((i) => i.product))).sort(),
    [incidents]
  );
  const allServices = useMemo(
    () => Array.from(new Set(incidents.map((i) => i.service))).sort(),
    [incidents]
  );
  const allOwners = useMemo(
    () => Array.from(new Set(incidents.map((i) => i.commander.split(" ")[0]))).sort(),
    [incidents]
  );

  const severityOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Severities", sub: "All priority tiers" },
    { value: "P1", label: "P1 · Critical", sub: "Platform outage / high revenue impact" },
    { value: "P2", label: "P2 · High", sub: "Major functionality degraded" },
    { value: "P3", label: "P3 · Moderate", sub: "Non-critical issue with workaround" },
    { value: "P4", label: "P4 · Low", sub: "Minor operational anomaly" },
  ];

  const statusOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Statuses", sub: "All incident lifecycles" },
    { value: "Investigating", label: "Investigating", sub: "Active triage in progress" },
    { value: "Mitigating", label: "Mitigating", sub: "Remediation active" },
    { value: "Monitoring", label: "Monitoring", sub: "Observing recovery" },
    { value: "Resolved", label: "Resolved", sub: "Service restored to SLA" },
    { value: "Closed", label: "Closed", sub: "Post-incident review completed" },
  ];

  const productOptions: FilterDropdownOption[] = useMemo(
    () => [{ value: "all", label: "All Products" }, ...allProducts.map((p) => ({ value: p, label: p }))],
    [allProducts]
  );

  const serviceOptions: FilterDropdownOption[] = useMemo(
    () => [{ value: "all", label: "All Services" }, ...allServices.map((s) => ({ value: s, label: s }))],
    [allServices]
  );

  const ownerOptions: FilterDropdownOption[] = useMemo(
    () => [{ value: "all", label: "All Owners" }, ...allOwners.map((o) => ({ value: o, label: o }))],
    [allOwners]
  );

  const envOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Environments" },
    { value: "Production", label: "Production" },
    { value: "Staging", label: "Staging" },
  ];

  // Filtered and sorted incidents list
  const filteredIncidents = useMemo(() => {
    const list = incidents.filter((inc) => {
      const q = search.toLowerCase().trim();
      if (q) {
        const haystack = [
          inc.id,
          inc.title,
          inc.product,
          inc.service,
          inc.integration,
          inc.commander,
          inc.rootCause,
          inc.errorSnippet,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (severityFilter !== "all" && !inc.severity.includes(severityFilter)) return false;
      if (statusFilter !== "all" && inc.status !== statusFilter) return false;
      if (productFilter !== "all" && inc.product !== productFilter) return false;
      if (serviceFilter !== "all" && inc.service !== serviceFilter) return false;
      if (envFilter !== "all" && inc.environment !== envFilter) return false;
      if (ownerFilter !== "all" && !inc.commander.toLowerCase().includes(ownerFilter.toLowerCase())) return false;
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === "severity") {
        const pA = a.severity.includes("P1") ? 1 : a.severity.includes("P2") ? 2 : a.severity.includes("P3") ? 3 : 4;
        const pB = b.severity.includes("P1") ? 1 : b.severity.includes("P2") ? 2 : b.severity.includes("P3") ? 3 : 4;
        return pA - pB;
      }
      if (sortBy === "blast-radius") return b.workspaceCount - a.workspaceCount;
      if (sortBy === "status") return a.status.localeCompare(b.status);
      return b.id.localeCompare(a.id); // Latest default
    });
  }, [incidents, search, severityFilter, statusFilter, productFilter, serviceFilter, envFilter, ownerFilter, sortBy]);

  // Selected incident item
  const selectedIncident = useMemo(() => {
    return (
      filteredIncidents.find((i) => i.id === selectedId) ??
      filteredIncidents[0] ??
      incidents[0]
    );
  }, [filteredIncidents, selectedId, incidents]);

  // Handle status update
  const handleUpdateStatus = (newStatus: IncidentStatus) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === selectedIncident.id ? { ...i, status: newStatus, lastUpdated: "Just now" } : i))
    );
    setShowStatusModal(false);
    showToast(`Incident ${selectedIncident.id} status transitioned to '${newStatus}'`);
  };

  // Handle create incident
  const handleCreateIncident = () => {
    if (!newTitle.trim()) return;
    const newId = `INC-${1046 + incidents.length}`;
    const newInc: IncidentItem = {
      ...selectedIncident,
      id: newId,
      title: newTitle,
      product: newProduct,
      service: newService,
      severity: newSeverity,
      status: "Investigating",
      startedAt: "Today, Just now",
      startedRelative: "Just now",
      lastUpdated: "Just now",
      updatedBy: "Dhruv S.",
      commander: "Dhruv S. (Tier-2 Support)",
      description: newImpact || `Incident reported for ${newProduct} / ${newService}.`,
      workspaceCount: 1,
      errorSnippet: "Under triage",
      blastRadius: {
        ...selectedIncident.blastRadius,
        workspaces: [
          {
            id: "WS-94812",
            name: "Sharma Traders Operations",
            product: newProduct,
            status: "Degraded",
            impact: "Investigating initial error reports",
            firstSeen: "Just now",
            latestError: "Just now",
          },
        ],
      },
    };

    setIncidents([newInc, ...incidents]);
    setSelectedId(newId);
    setShowCreateModal(false);
    setNewTitle("");
    setNewImpact("");
    showToast(`Created incident ${newId} assigned to Dhruv S.`);
  };

  return (
    <div className="flex flex-col min-h-full text-[var(--text-heading)] -mt-2 -mx-1 sm:-mx-2 pb-16 screen-sm:pb-8">
      {/* Toast Notification */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-[var(--sidebar-active)]/30 bg-[var(--surface)] px-4 py-3 text-xs font-semibold text-[var(--text-heading)] shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 3: PAGE HEADER
          Incident Command Center
          Subtitle: Monitor active incidents, blast radius, service impact and recovery
          Top-right actions: [ Create Incident ], [ More ▾ ]
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
              Incident Command Center
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Monitor active incidents, blast radius, service impact and recovery
            </p>
          </div>
        </div>

        {/* Top-Right Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="tap-pop flex items-center gap-1.5 rounded-xl bg-[var(--accent-solid)] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:brightness-110 transition-all cursor-pointer"
          >
            <Plus size={13} className="stroke-[2.5]" />
            <span>Create Incident</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoreActions((v) => !v)}
              className="flex items-center gap-1 rounded-xl border border-[var(--divider)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] shadow-xs hover:bg-[var(--search-bg)] transition-colors cursor-pointer"
            >
              <span>More</span>
              <ChevronDown size={13} />
            </button>

            {showMoreActions && (
              <div
                className="absolute right-0 mt-1.5 w-56 rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-1.5 shadow-lg z-30 text-xs"
                onMouseLeave={() => setShowMoreActions(false)}
              >
                <Link
                  href="/technical-support/api-logs"
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[var(--text-secondary)] hover:bg-[var(--search-bg)] hover:text-[var(--text-heading)] transition-colors"
                >
                  <Terminal size={13} />
                  <span>Open Technical Logs</span>
                </Link>
                <Link
                  href="/technical-support/diagnostics"
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[var(--text-secondary)] hover:bg-[var(--search-bg)] hover:text-[var(--text-heading)] transition-colors"
                >
                  <Wrench size={13} />
                  <span>Diagnostic Workbench</span>
                </Link>
                <Link
                  href="/technical-support/health"
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[var(--text-secondary)] hover:bg-[var(--search-bg)] hover:text-[var(--text-heading)] transition-colors"
                >
                  <Activity size={13} />
                  <span>Platform Health</span>
                </Link>
                <div className="my-1 border-t border-[var(--divider)]" />
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreActions(false);
                    navigator.clipboard.writeText(window.location.href);
                    showToast("Command center URL copied to clipboard");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[var(--text-secondary)] hover:bg-[var(--search-bg)] hover:text-[var(--text-heading)] transition-colors"
                >
                  <Share2 size={13} />
                  <span>Copy Command Link</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 5: INCIDENT KPI ROW
          Active Incidents: 4 (↑ 1 today)
          Critical / P1: 1 (↑ 100%, red emphasis)
          Major / P2: 2 (- 0%)
          Affected Workspaces: 52 (↑ 18%)
          Services Degraded: 3 (↑ 50%)
          MTTR: 42 min (↓ 12%)
      ────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 screen-sm:grid-cols-3 screen-lg:grid-cols-6 lg:grid-cols-6 gap-2 sm:gap-2.5 lg:gap-3 px-1 sm:px-2 mb-3">
        {/* 1. Active Incidents */}
        <div
          className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Active Incidents</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--text-heading)] leading-none">4</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 text-red-700 px-1.5 py-0.5 text-[10px] font-semibold">
              &uarr; 1 today
            </span>
          </div>
        </div>

        {/* 2. Critical / P1 (Strong Red Emphasis) */}
        <button
          type="button"
          onClick={() => setSeverityFilter(severityFilter === "P1" ? "all" : "P1")}
          className={`bg-[var(--surface)] rounded-xl border p-2.5 sm:p-3 text-left transition-all cursor-pointer ${
            severityFilter === "P1"
              ? "border-red-600 ring-2 ring-red-600/20"
              : "border-[var(--card-border)] hover:border-red-400"
          }`}
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Critical / P1</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-red-600 leading-none">1</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 text-red-700 px-1.5 py-0.5 text-[10px] font-semibold">
              &uarr; 100%
            </span>
          </div>
        </button>

        {/* 3. Major / P2 */}
        <button
          type="button"
          onClick={() => setSeverityFilter(severityFilter === "P2" ? "all" : "P2")}
          className={`bg-[var(--surface)] rounded-xl border p-2.5 sm:p-3 text-left transition-all cursor-pointer ${
            severityFilter === "P2"
              ? "border-amber-500 ring-2 ring-amber-500/20"
              : "border-[var(--card-border)] hover:border-amber-400"
          }`}
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Major / P2</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-amber-600 leading-none">2</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-gray-100 text-gray-600 px-1.5 py-0.5 text-[10px] font-semibold">
              &minus; 0%
            </span>
          </div>
        </button>

        {/* 4. Affected Workspaces */}
        <div
          className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Affected Workspaces</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--text-heading)] leading-none">52</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 text-red-700 px-1.5 py-0.5 text-[10px] font-semibold">
              &uarr; 18%
            </span>
          </div>
        </div>

        {/* 5. Services Degraded */}
        <div
          className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Services Degraded</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-red-600 leading-none">3</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 text-red-700 px-1.5 py-0.5 text-[10px] font-semibold">
              &uarr; 50%
            </span>
          </div>
        </div>

        {/* 6. MTTR */}
        <div
          className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">MTTR</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--text-heading)] leading-none">42 min</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-up-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-up-fg)]">
              &darr; 12%
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 6: FILTER / SEARCH BAR
          Search incident ID, service, workspace, error...
          All Severities, All Statuses, All Products, All Services, All Environments, All Owners, Last 24 hours ▾, More Filters
      ────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 px-1 sm:px-2 mb-3">
        {/* Search Field */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--search-placeholder)]" />
          <input
            type="text"
            placeholder="Search incident ID, service, workspace, error..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--divider)] bg-[var(--surface)] py-1.5 sm:py-2 pl-9 pr-3 text-xs text-[var(--text-heading)] placeholder:text-[var(--search-placeholder)] shadow-xs outline-none focus:border-[var(--sidebar-active)]"
          />
        </div>

        {/* Filter Controls Cluster */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <FilterDropdown
            value={severityFilter}
            onChange={setSeverityFilter}
            options={severityOptions}
            placeholder="All Severities"
            title="Filter by Severity"
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
            className="hidden md:inline-block"
            searchable
            searchPlaceholder="Search service..."
            showClear
          />

          <FilterDropdown
            value={envFilter}
            onChange={setEnvFilter}
            options={envOptions}
            placeholder="All Environments"
            title="Filter by Environment"
            className="hidden lg:inline-block"
            showClear
          />

          <FilterDropdown
            value={ownerFilter}
            onChange={setOwnerFilter}
            options={ownerOptions}
            placeholder="All Owners"
            title="Filter by Commander"
            className="hidden lg:inline-block"
            showClear
          />

          {/* Time range selector */}
          <div className="hidden sm:flex items-center rounded-xl border border-[var(--divider)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text-secondary)] shadow-2xs">
            <span>{timeRange}</span>
            <ChevronDown size={12} className="ml-1 text-[var(--text-muted)]" />
          </div>

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
              { label: "Only P1 / Critical", action: () => setSeverityFilter("P1") },
              { label: "Only P2 / High", action: () => setSeverityFilter("P2") },
              { label: "Active Only (Investigating / Mitigating)", action: () => setStatusFilter("Investigating") },
              { label: "Product: Chat with Sahayogi", action: () => setProductFilter("Chat with Sahayogi") },
              { label: "Product: Tax Sahayogi", action: () => setProductFilter("Tax Sahayogi") },
              { label: "Workspace: Sharma Traders", action: () => setSearch("Sharma Traders") },
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
                setSeverityFilter("all");
                setStatusFilter("all");
                setProductFilter("all");
                setServiceFilter("all");
                setEnvFilter("all");
                setOwnerFilter("all");
              }}
              className="ml-auto text-[var(--icon-btn-navy)] font-medium hover:underline text-[11px] cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 7 & 8: MAIN LAYOUT — TWO COLUMNS (45% LEFT / 55% RIGHT)
          LEFT: Incident Queue
          RIGHT: Selected Incident 360
      ────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-3 px-1 sm:px-2 min-h-0 flex-1">
        {/* ── LEFT PANEL: INCIDENT QUEUE (45%) ────────────────────────── */}
        <div
          className="w-full lg:w-[45%] shrink-0 bg-[var(--surface)] rounded-2xl border border-[var(--card-border)] shadow-xs flex flex-col p-3 sm:p-3.5 max-h-[520px] lg:max-h-none lg:h-[calc(100dvh-17rem)]"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          {/* Header */}
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
              onChange={(v) => setSortBy(v as SortOption)}
              options={SORT_OPTIONS.map((o) => ({
                value: o.id,
                label: o.label,
                sub: o.sub,
              }))}
              placeholder="Latest"
              title="Sort Incidents"
              align="right"
            />
          </div>

          {/* Incidents List */}
          <div className="flex-1 overflow-y-auto pt-2 space-y-2">
            {filteredIncidents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-xs text-[var(--text-muted)]">
                <AlertTriangle size={24} className="mb-2 text-[var(--text-muted)]/50" />
                <p className="font-semibold text-[var(--text-heading)]">No incidents match the filters</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">Try clearing or adjusting your criteria</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSeverityFilter("all");
                    setStatusFilter("all");
                    setProductFilter("all");
                  }}
                  className="mt-3 text-[var(--sidebar-active)] font-semibold hover:underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              filteredIncidents.map((inc) => {
                const isSelected = inc.id === selectedIncident.id;

                return (
                  <button
                    key={inc.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(inc.id);
                      setActiveTab("overview");
                    }}
                    className={`group relative flex w-full items-start justify-between rounded-xl p-3 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[var(--icon-chip-bg)] border border-[var(--sidebar-active)]/40 shadow-2xs"
                        : "border border-transparent hover:bg-[var(--search-bg)]"
                    }`}
                  >
                    {/* Active Left Indicator Bar */}
                    {isSelected && (
                      <span className="absolute left-0 top-3 bottom-3 w-1 bg-[var(--sidebar-active)] rounded-r" />
                    )}

                    <div className="flex items-start gap-2.5 min-w-0 flex-1 pl-1">
                      {/* Product Brand Icon (STRICT RULE: SAHAYOGI PRODUCT ICON ONLY) */}
                      <div className="shrink-0 mt-0.5">
                        <ProductIcon product={inc.product} size={22} />
                      </div>

                      {/* Content Block */}
                      <div className="min-w-0 flex-1">
                        {/* Row 1: Severity + ID */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.2 text-[10px] font-bold ${severityBadgeClass(
                              inc.severity
                            )}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${severityDotClass(inc.severity)}`} />
                            {inc.severity}
                          </span>
                          <span className="font-mono text-xs font-bold text-[var(--text-heading)]">
                            {inc.id}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-bold text-[var(--text-heading)] mt-1 leading-snug line-clamp-1">
                          {inc.title}
                        </h4>

                        {/* Product & Service Subtitle */}
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[var(--text-secondary)]">
                          <span className="font-semibold text-[var(--text-heading)]">{inc.product}</span>
                          <span className="text-[var(--text-muted)]">&middot;</span>
                          <span className="text-[var(--text-muted)] truncate">{inc.service}</span>
                        </div>

                        {/* Impact & Duration Snippet */}
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10.5px] text-[var(--text-muted)]">
                          <span className="font-medium text-[var(--text-heading)]">
                            {inc.workspaceCount} workspaces
                          </span>
                          <span>&middot;</span>
                          <span className="font-mono">{inc.errorSnippet}</span>
                          <span>&middot;</span>
                          <span>Started {inc.startedRelative}</span>
                        </div>
                      </div>

                      {/* Right Status & Owner Column */}
                      <div className="shrink-0 text-right pl-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-bold ${statusBadgeClass(
                            inc.status
                          )}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(inc.status)}`} />
                          {inc.status}
                        </span>
                        <p className="text-[10px] text-[var(--text-muted)] mt-1.5">
                          Owner: <strong className="text-[var(--text-heading)]">{inc.commander.split(" ")[0]}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Chevron */}
                    <div className="shrink-0 pl-1.5 pt-2">
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

        {/* ── RIGHT PANEL: INCIDENT 360 (55%) ─────────────────────────── */}
        <div
          className="flex-1 min-w-0 bg-[var(--surface)] rounded-2xl border border-[var(--card-border)] shadow-xs flex flex-col p-3.5 sm:p-5 overflow-hidden lg:h-[calc(100dvh-17rem)]"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          {selectedIncident ? (
            <div className="flex flex-col h-full overflow-y-auto">
              {/* ─────────────────────────────────────────────────────────
                  SECTION 12: INCIDENT 360 HEADER
                  Severity, ID, Title, Acknowledge, Update Status ▾, More ▾
              ────────────────────────────────────────────────────────── */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-2.5 border-b border-[var(--divider)]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${severityBadgeClass(
                        selectedIncident.severity
                      )}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${severityDotClass(selectedIncident.severity)}`} />
                      {selectedIncident.severity}
                    </span>
                    <span className="font-mono text-sm font-bold text-[var(--text-heading)]">
                      {selectedIncident.id}
                    </span>
                  </div>

                  <h2 className="text-base sm:text-lg font-bold text-[var(--text-heading)] mt-1 leading-snug">
                    {selectedIncident.title}
                  </h2>

                  {/* Subtitle with Official Sahayogi Brand Icon */}
                  <div className="flex items-center gap-2 mt-1.5 text-xs">
                    <ProductIcon product={selectedIncident.product} size={16} />
                    <span className="font-bold text-[var(--text-heading)]">{selectedIncident.product}</span>
                    <span className="text-[var(--text-muted)]">&middot;</span>
                    <span className="text-[var(--text-secondary)] font-medium">{selectedIncident.service}</span>
                  </div>

                  {/* Operational Status & Assignment Badge Row */}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                    <span
                      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-bold text-[11px] ${statusBadgeClass(
                        selectedIncident.status
                      )}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(selectedIncident.status)}`} />
                      {selectedIncident.status}
                    </span>
                    <span className="text-[var(--text-muted)]">
                      Started: <strong className="text-[var(--text-heading)]">{selectedIncident.startedAt}</strong> ({selectedIncident.startedRelative})
                    </span>
                    <span className="text-[var(--text-muted)]">&middot;</span>
                    <span className="text-[var(--text-muted)]">
                      Owner: <strong className="text-[var(--text-heading)]">{selectedIncident.commander}</strong>
                    </span>
                  </div>
                </div>

                {/* Top-Right Incident Action Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => showToast(`Incident ${selectedIncident.id} acknowledged by Dhruv S.`)}
                    className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--search-bg)] transition-colors shadow-2xs cursor-pointer"
                  >
                    Acknowledge
                  </button>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowStatusModal((v) => !v)}
                      className="flex items-center gap-1 rounded-xl border border-[var(--divider)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--search-bg)] transition-colors shadow-2xs cursor-pointer"
                    >
                      <span>Update Status</span>
                      <ChevronDown size={13} />
                    </button>

                    {showStatusModal && (
                      <div
                        className="absolute right-0 mt-1.5 w-44 rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-1.5 shadow-lg z-30 text-xs"
                        onMouseLeave={() => setShowStatusModal(false)}
                      >
                        {(["Investigating", "Mitigating", "Monitoring", "Resolved", "Closed"] as IncidentStatus[]).map(
                          (st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleUpdateStatus(st)}
                              className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[var(--text-secondary)] hover:bg-[var(--search-bg)] hover:text-[var(--text-heading)] transition-colors"
                            >
                              <span>{st}</span>
                              {selectedIncident.status === st && <Check size={12} className="text-blue-600" />}
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/technical-support/diagnostics?service=${selectedIncident.service}`}
                    className="flex items-center gap-1.5 rounded-xl bg-[var(--accent-solid)] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:brightness-110 transition-colors"
                  >
                    <Play size={11} className="fill-white" />
                    <span>Run Diagnostics</span>
                  </Link>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────
                  SECTION 13: INCIDENT SUMMARY CALLOUT
                  Description, Current Mitigation, Customer Impact, Last Updated, Updated By
              ────────────────────────────────────────────────────────── */}
              <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/40 dark:bg-red-950/20 p-3 sm:p-3.5 my-3">
                <div className="flex items-center gap-1.5 text-[var(--status-critical-fg)] font-bold text-xs">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--status-critical-fg)] text-[10px] text-white font-black">
                    !
                  </span>
                  Incident Summary
                </div>
                <p className="text-xs text-[var(--text-heading)] mt-1.5 leading-relaxed font-normal">
                  {selectedIncident.description}
                </p>

                <div className="mt-3 pt-3 border-t border-red-200/60 dark:border-red-900/40 grid grid-cols-2 screen-sm:grid-cols-4 gap-2.5 text-xs">
                  <div>
                    <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide block">
                      Current Mitigation
                    </span>
                    <span className="font-semibold text-[var(--text-heading)] text-xs mt-0.5 block truncate">
                      {selectedIncident.currentMitigation}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide block">
                      Customer Impact
                    </span>
                    <span className="font-medium text-[var(--text-secondary)] text-xs mt-0.5 block truncate">
                      {selectedIncident.customerImpact}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide block">
                      Last Updated
                    </span>
                    <span className="font-semibold text-[var(--text-heading)] text-xs mt-0.5 block">
                      {selectedIncident.lastUpdated}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide block">
                      Updated By
                    </span>
                    <span className="font-semibold text-[var(--text-heading)] text-xs mt-0.5 block">
                      {selectedIncident.updatedBy}
                    </span>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────
                  SECTION 15: INCIDENT TABS
                  Overview | Impact | Timeline | Metrics | Logs & Traces | Diagnostics | Dependencies | Mitigation | Related Tickets | Changes | Audit Trail
              ────────────────────────────────────────────────────────── */}
              <div className="flex items-center gap-5 sm:gap-6 border-b border-[var(--divider)] text-xs font-semibold overflow-x-auto">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "impact", label: "Impact" },
                  { id: "timeline", label: "Timeline" },
                  { id: "metrics", label: "Metrics" },
                  { id: "logs", label: "Logs & Traces" },
                  { id: "diagnostics", label: "Diagnostics" },
                  { id: "dependencies", label: "Dependencies" },
                  { id: "mitigation", label: "Mitigation" },
                  { id: "tickets", label: `Related Tickets (${selectedIncident.relatedTickets.length})` },
                  { id: "changes", label: "Changes" },
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
              <div className="pt-3.5 flex-1">
                {/* ── TAB 1: OVERVIEW ─────────────────────────────────── */}
                {activeTab === "overview" && (
                  <div className="space-y-3.5">
                    {/* Row 1: Context Cards */}
                    <div className="grid grid-cols-2 screen-sm:grid-cols-4 gap-2.5">
                      <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          <ProductIcon product={selectedIncident.product} size={13} />
                          Product
                        </div>
                        <p className="mt-1 text-xs font-bold text-[var(--text-heading)] truncate">
                          {selectedIncident.product}
                        </p>
                      </div>

                      <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          <Layers size={13} />
                          Service
                        </div>
                        <p className="mt-1 text-xs font-bold text-[var(--text-heading)] truncate">
                          {selectedIncident.service}
                        </p>
                      </div>

                      <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          <IntegrationIcon integration={selectedIncident.integration} size={13} />
                          Integration
                        </div>
                        <p className="mt-1 text-xs font-bold text-[var(--text-heading)] truncate">
                          {selectedIncident.integration}
                        </p>
                      </div>

                      <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          <Globe size={13} />
                          Environment
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-healthy-fg)]" />
                          <p className="text-xs font-bold text-[var(--text-heading)]">
                            {selectedIncident.environment}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Severity, Status, Blast Radius, Current Impact */}
                    <div className="grid grid-cols-2 screen-sm:grid-cols-4 gap-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface-muted)] p-2.5 text-xs">
                      <div>
                        <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide block">
                          Severity
                        </span>
                        <span className="font-bold text-red-600 mt-0.5 block">
                          {selectedIncident.severity}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide block">
                          Status
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(selectedIncident.status)}`} />
                          <span className="font-bold text-[var(--text-heading)]">
                            {selectedIncident.status}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide block">
                          Blast Radius
                        </span>
                        <span className="font-bold text-[var(--text-heading)] mt-0.5 block">
                          {selectedIncident.workspaceCount} Workspaces
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide block">
                          Current Impact
                        </span>
                        <span className="font-bold text-red-600 mt-0.5 block truncate">
                          {selectedIncident.errorSnippet}
                        </span>
                      </div>
                    </div>

                    {/* Three Telemetry Charts Row */}
                    <div className="grid grid-cols-1 screen-sm:grid-cols-3 gap-3">
                      {/* Chart 1: Error Rate */}
                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[var(--text-heading)]">Error Rate</span>
                          <span className="font-mono text-xs font-bold text-red-600">
                            {selectedIncident.metrics.errorRate}% {selectedIncident.metrics.errorRateChange}
                          </span>
                        </div>
                        <ErrorRateChart data={selectedIncident.metrics.errorTrend} />
                      </div>

                      {/* Chart 2: Response Time (p95) */}
                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[var(--text-heading)]">Response Time (p95)</span>
                          <span className="font-mono text-xs font-bold text-red-600">
                            {selectedIncident.metrics.responseTimeP95} ms {selectedIncident.metrics.responseTimeChange}
                          </span>
                        </div>
                        <LatencyAreaChart data={selectedIncident.metrics.latencyTrend} />
                      </div>

                      {/* Chart 3: Request Volume */}
                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[var(--text-heading)]">Request Volume</span>
                          <span className="font-mono text-xs font-bold text-[var(--sidebar-active)]">
                            {selectedIncident.metrics.requestVolume} {selectedIncident.metrics.requestVolumeChange}
                          </span>
                        </div>
                        <VolumeBarChart data={selectedIncident.metrics.volumeTrend} />
                      </div>
                    </div>

                    {/* Bottom Summary Cards (4 Cards) */}
                    <div className="grid grid-cols-2 screen-sm:grid-cols-4 gap-2.5">
                      {/* Affected Workspaces */}
                      <button
                        type="button"
                        onClick={() => setActiveTab("impact")}
                        className="group bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3 hover:border-[var(--sidebar-active)] transition-all shadow-2xs text-left cursor-pointer"
                      >
                        <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">
                          Affected Workspaces
                        </span>
                        <p className="mt-1 text-base font-bold text-[var(--text-heading)] leading-none">
                          {selectedIncident.workspaceCount}
                        </p>
                        <span className="text-[10px] font-bold text-[var(--sidebar-active)] group-hover:underline mt-2 inline-block">
                          View workspaces &rarr;
                        </span>
                      </button>

                      {/* Related Tickets */}
                      <button
                        type="button"
                        onClick={() => setActiveTab("tickets")}
                        className="group bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3 hover:border-[var(--sidebar-active)] transition-all shadow-2xs text-left cursor-pointer"
                      >
                        <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">
                          Related Tickets
                        </span>
                        <p className="mt-1 text-base font-bold text-[var(--text-heading)] leading-none">
                          {selectedIncident.relatedTickets.length}
                        </p>
                        <span className="text-[10px] font-bold text-[var(--sidebar-active)] group-hover:underline mt-2 inline-block">
                          View tickets &rarr;
                        </span>
                      </button>

                      {/* Similar Incidents */}
                      <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3 shadow-2xs">
                        <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">
                          Similar Incidents
                        </span>
                        <p className="mt-1 text-base font-bold text-[var(--text-heading)] leading-none">
                          7
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-1">in last 30 days</p>
                      </div>

                      {/* Last Successful Request */}
                      <Link
                        href={`/technical-support/api-logs?search=${selectedIncident.service}`}
                        className="group bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3 hover:border-[var(--sidebar-active)] transition-all shadow-2xs block"
                      >
                        <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">
                          Last Successful Request
                        </span>
                        <p className="mt-1 text-xs font-bold text-[var(--status-healthy-fg)] leading-none truncate">
                          27 Sep 2026, 18:42
                        </p>
                        <span className="text-[10px] font-bold text-[var(--sidebar-active)] group-hover:underline mt-2 inline-block">
                          View logs &rarr;
                        </span>
                      </Link>
                    </div>
                  </div>
                )}

                {/* ── TAB 2: IMPACT (SECTION 16 & 17) ─────────────────── */}
                {activeTab === "impact" && (
                  <div className="space-y-3.5 text-xs">
                    {/* Blast Radius Visual Chain */}
                    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 shadow-2xs">
                      <h4 className="font-bold text-[var(--text-heading)] mb-2">Blast Radius Propagation</h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-lg bg-red-100 text-red-700 font-mono font-bold px-2 py-1">
                          {selectedIncident.id}
                        </span>
                        <ArrowRight size={13} className="text-[var(--text-muted)]" />
                        <span className="rounded-lg bg-[var(--surface-muted)] font-semibold px-2 py-1">
                          {selectedIncident.service}
                        </span>
                        <ArrowRight size={13} className="text-[var(--text-muted)]" />
                        <span className="rounded-lg bg-[var(--surface-muted)] font-semibold px-2 py-1">
                          {selectedIncident.integration}
                        </span>
                        <ArrowRight size={13} className="text-[var(--text-muted)]" />
                        <span className="rounded-lg bg-[var(--surface-muted)] font-semibold px-2 py-1">
                          {selectedIncident.product}
                        </span>
                        <ArrowRight size={13} className="text-[var(--text-muted)]" />
                        <span className="rounded-lg bg-red-100 text-red-700 font-bold px-2 py-1">
                          {selectedIncident.workspaceCount} Workspaces Impacted
                        </span>
                      </div>
                    </div>

                    {/* Affected Workspaces Table */}
                    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 shadow-2xs space-y-2">
                      <h4 className="font-bold text-[var(--text-heading)]">Affected Customer Workspaces</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-[var(--divider)] text-[10.5px] uppercase font-bold text-[var(--text-muted)]">
                              <th className="pb-2">Workspace</th>
                              <th className="pb-2">Product</th>
                              <th className="pb-2">Status</th>
                              <th className="pb-2">Impact / Error</th>
                              <th className="pb-2">First Seen</th>
                              <th className="pb-2">Latest Error</th>
                              <th className="pb-2 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--divider)]">
                            {selectedIncident.blastRadius.workspaces.map((ws) => (
                              <tr key={ws.id} className="hover:bg-[var(--search-bg)] transition-colors">
                                <td className="py-2.5 font-bold text-[var(--text-heading)]">
                                  {ws.name}
                                  <span className="font-mono text-[10px] text-[var(--text-muted)] block">{ws.id}</span>
                                </td>
                                <td className="py-2.5 text-[var(--text-secondary)]">{ws.product}</td>
                                <td className="py-2.5">
                                  <span className="rounded bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.2">
                                    {ws.status}
                                  </span>
                                </td>
                                <td className="py-2.5 font-mono text-[11px] text-red-600">{ws.impact}</td>
                                <td className="py-2.5 text-[var(--text-muted)]">{ws.firstSeen}</td>
                                <td className="py-2.5 text-[var(--text-muted)]">{ws.latestError}</td>
                                <td className="py-2.5 text-right">
                                  <Link
                                    href={`/technical-support/workspaces?id=${ws.id}`}
                                    className="text-[var(--sidebar-active)] font-semibold hover:underline inline-flex items-center gap-1"
                                  >
                                    <span>Workspace 360</span>
                                    <ArrowRight size={10} />
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 3: TIMELINE (SECTION 18) ────────────────────── */}
                {activeTab === "timeline" && (
                  <div className="space-y-3 text-xs">
                    <p className="text-[var(--text-muted)]">
                      Chronological event progression from initial automated detection to active investigation:
                    </p>

                    <div className="relative pl-6 space-y-3.5 border-l-2 border-[var(--divider)] ml-2">
                      {selectedIncident.timeline.map((item, idx) => (
                        <div key={idx} className="relative">
                          <span
                            className={`absolute -left-[31px] top-0.5 h-3 w-3 rounded-full border-2 border-[var(--surface)] ${
                              item.type === "detection"
                                ? "bg-red-600"
                                : item.type === "mitigation"
                                ? "bg-amber-500"
                                : item.type === "case"
                                ? "bg-blue-500"
                                : "bg-[var(--sidebar-active)]"
                            }`}
                          />
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-[var(--text-heading)]">
                              {item.time}
                            </span>
                            <span className="text-[var(--text-muted)]">&middot;</span>
                            <span className="text-[var(--text-muted)] font-medium">{item.actor}</span>
                          </div>
                          <p className="font-bold text-[var(--text-heading)] mt-0.5">{item.event}</p>
                          <p className="text-[11px] text-[var(--text-secondary)] font-mono mt-0.5">
                            Result: {item.result} {item.relatedObject ? `(${item.relatedObject})` : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── TAB 4: METRICS (SECTION 19) ─────────────────────── */}
                {activeTab === "metrics" && (
                  <div className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-2 screen-sm:grid-cols-4 gap-2.5">
                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3">
                        <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Error Rate</span>
                        <span className="font-mono text-base font-bold text-red-600 mt-1 block">
                          {selectedIncident.metrics.errorRate}%
                        </span>
                        <span className="text-[10px] text-red-600 font-semibold">{selectedIncident.metrics.errorRateChange}</span>
                      </div>

                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3">
                        <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">p95 Latency</span>
                        <span className="font-mono text-base font-bold text-red-600 mt-1 block">
                          {selectedIncident.metrics.responseTimeP95} ms
                        </span>
                        <span className="text-[10px] text-red-600 font-semibold">{selectedIncident.metrics.responseTimeChange}</span>
                      </div>

                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3">
                        <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Request Volume</span>
                        <span className="font-mono text-base font-bold text-[var(--text-heading)] mt-1 block">
                          {selectedIncident.metrics.requestVolume}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">{selectedIncident.metrics.requestVolumeChange}</span>
                      </div>

                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3">
                        <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Success Rate</span>
                        <span className="font-mono text-base font-bold text-amber-600 mt-1 block">
                          {(100 - selectedIncident.metrics.errorRate).toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-amber-700 font-semibold">SLA deficit</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3.5 space-y-3">
                      <h4 className="font-bold text-[var(--text-heading)]">Detailed 1-Hour Telemetry Waterfall</h4>
                      <div className="grid grid-cols-1 screen-sm:grid-cols-2 gap-3">
                        <div className="rounded-lg bg-[var(--surface-muted)] p-3">
                          <p className="font-bold text-xs mb-1">Error Rate Progression</p>
                          <ErrorRateChart data={selectedIncident.metrics.errorTrend} />
                        </div>
                        <div className="rounded-lg bg-[var(--surface-muted)] p-3">
                          <p className="font-bold text-xs mb-1">p95 Latency Spike</p>
                          <LatencyAreaChart data={selectedIncident.metrics.latencyTrend} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 5: LOGS & TRACES (SECTION 20) ───────────────── */}
                {activeTab === "logs" && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <p className="text-[var(--text-muted)]">Correlated technical logs and error payloads:</p>
                      <Link
                        href={`/technical-support/api-logs?search=${selectedIncident.service}`}
                        className="flex items-center gap-1 font-semibold text-[var(--sidebar-active)] hover:underline"
                      >
                        <span>View in Technical Logs</span>
                        <ExternalLink size={11} />
                      </Link>
                    </div>

                    <div className="space-y-2">
                      {selectedIncident.logsTraces.map((trace, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 shadow-2xs space-y-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--divider)] pb-2">
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-red-100 text-red-700 font-mono text-[10px] font-bold px-1.5 py-0.2">
                                {trace.errorCode}
                              </span>
                              <span className="font-mono font-bold text-xs text-[var(--text-heading)]">
                                {trace.method} {trace.endpoint}
                              </span>
                            </div>
                            <span className="font-mono text-[10.5px] text-[var(--text-muted)]">{trace.timestamp}</span>
                          </div>

                          <div className="grid grid-cols-2 screen-sm:grid-cols-4 gap-2 text-[11px]">
                            <div>
                              <span className="text-[10px] text-[var(--text-muted)] uppercase block">Trace ID</span>
                              <span className="font-mono font-bold text-[var(--sidebar-active)] block truncate">
                                {trace.traceId}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-[var(--text-muted)] uppercase block">Workspace</span>
                              <span className="font-semibold text-[var(--text-heading)] block truncate">
                                {trace.workspaceName}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-[var(--text-muted)] uppercase block">Provider</span>
                              <span className="text-[var(--text-secondary)] block truncate">{trace.provider}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-[var(--text-muted)] uppercase block">Latency</span>
                              <span className="font-mono font-bold text-red-600 block">{trace.latency}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── TAB 6: DIAGNOSTICS (SECTION 21) ─────────────────── */}
                {activeTab === "diagnostics" && (
                  <div className="space-y-3 text-xs">
                    <p className="text-[var(--text-muted)]">
                      Available automated and on-demand diagnostic checks for this incident:
                    </p>

                    <div className="space-y-2">
                      {selectedIncident.diagnostics.map((diag, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 shadow-2xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-[var(--text-heading)]">{diag.name}</h5>
                              <span
                                className={`rounded px-1.5 py-0.2 text-[9.5px] font-bold ${
                                  diag.risk === "SAFE"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {diag.risk}
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.2 text-[9.5px] font-bold ${
                                  diag.status === "Passed"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : diag.status === "Failed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {diag.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{diag.description}</p>
                          </div>

                          <Link
                            href={`/technical-support/diagnostics?service=${selectedIncident.service}`}
                            className="shrink-0 flex items-center gap-1 rounded-xl bg-[var(--accent-solid)] px-3 py-1 text-xs font-semibold text-white shadow-xs hover:brightness-110"
                          >
                            <Play size={10} className="fill-white" />
                            <span>{diag.risk === "SAFE" ? "Run" : "Request Approval"}</span>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── TAB 7: DEPENDENCIES (SECTION 22) ────────────────── */}
                {activeTab === "dependencies" && (
                  <div className="space-y-3 text-xs">
                    <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface-muted)] p-2.5 text-xs text-[var(--text-muted)]">
                      <strong className="text-[var(--text-heading)]">Dependency Health Topology:</strong> Pinpoint whether failure originated inside internal platform services or external provider endpoints.
                    </div>

                    <div className="space-y-2">
                      {selectedIncident.dependencies.map((dep, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                dep.status === "Healthy"
                                  ? "bg-emerald-500"
                                  : dep.status === "Degraded"
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                              }`}
                            />
                            <div>
                              <p className="font-bold text-[var(--text-heading)]">{dep.name}</p>
                              <p className="text-[10.5px] text-[var(--text-muted)]">Classification: {dep.type}</p>
                            </div>
                          </div>

                          <span
                            className={`rounded px-2 py-0.5 font-bold text-[10px] ${
                              dep.status === "Healthy"
                                ? "bg-emerald-100 text-emerald-800"
                                : dep.status === "Degraded"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {dep.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── TAB 8: MITIGATION (SECTION 23) ──────────────────── */}
                {activeTab === "mitigation" && (
                  <div className="space-y-3.5 text-xs">
                    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3.5 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between border-b border-[var(--divider)] pb-2">
                        <h4 className="font-bold text-xs text-[var(--text-heading)]">Active Mitigation Policy</h4>
                        <span className="rounded bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 text-[10px]">
                          {selectedIncident.mitigationDetail.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="rounded-lg bg-[var(--surface-muted)] p-2.5">
                          <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">Previous Policy</span>
                          <p className="font-mono text-xs mt-1 text-[var(--text-secondary)]">
                            {selectedIncident.mitigationDetail.previousPolicy}
                          </p>
                        </div>
                        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 p-2.5">
                          <span className="text-[10px] font-bold uppercase text-emerald-800 block">Current Engaged Policy</span>
                          <p className="font-mono text-xs mt-1 text-emerald-900 dark:text-emerald-300 font-bold">
                            {selectedIncident.mitigationDetail.currentPolicy}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 screen-sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
                        <div>
                          <span className="text-[10px] text-[var(--text-muted)] block">Operator</span>
                          <strong className="text-[var(--text-heading)]">{selectedIncident.mitigationDetail.operator}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-[var(--text-muted)] block">Engaged At</span>
                          <strong className="text-[var(--text-heading)]">{selectedIncident.mitigationDetail.startedAt}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-[var(--text-muted)] block">Expected Effect</span>
                          <span className="text-[var(--text-secondary)]">{selectedIncident.mitigationDetail.expectedEffect}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--divider)]">
                        <button
                          type="button"
                          onClick={() => showToast("Mitigation policy updated")}
                          className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-heading)] hover:bg-[var(--search-bg)]"
                        >
                          Update Mitigation
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast("Mitigation marked successful. Incident moving to Monitoring.")}
                          className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
                        >
                          Mark Mitigation Successful
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 9: RELATED TICKETS (SECTION 25) ─────────────── */}
                {activeTab === "tickets" && (
                  <div className="space-y-3 text-xs">
                    <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface-muted)] p-2.5 text-xs text-[var(--text-muted)]">
                      <strong className="text-[var(--text-heading)]">BoSS Customer Support Correlation:</strong> BoSS remains the authoritative customer support case management system. Setu provides technical incident correlation.
                    </div>

                    <div className="space-y-2">
                      {selectedIncident.relatedTickets.map((tkt) => (
                        <div
                          key={tkt.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 shadow-2xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-amber-600">{tkt.id}</span>
                              <span className="font-bold text-[var(--text-heading)]">{tkt.title}</span>
                              <span className="rounded bg-amber-100 text-amber-800 text-[9.5px] font-bold px-1.5 py-0.2">
                                {tkt.priority}
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                              Workspace: {tkt.workspace} &middot; Product: {tkt.product} &middot; Status: {tkt.status}
                            </p>
                          </div>

                          <Link
                            href={`/technical-support/tickets?id=${tkt.id}`}
                            className="shrink-0 flex items-center gap-1 rounded-xl border border-[var(--divider)] bg-[var(--surface)] px-2.5 py-1 text-xs font-semibold text-[var(--sidebar-active)] hover:bg-[var(--search-bg)]"
                          >
                            <span>Open Ticket</span>
                            <ArrowRight size={11} />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── TAB 10: CHANGES (SECTION 26) ────────────────────── */}
                {activeTab === "changes" && (
                  <div className="space-y-3 text-xs">
                    <p className="text-[var(--text-muted)]">
                      Recent deployments and configuration changes correlated with this incident window:
                    </p>

                    <div className="space-y-2">
                      {selectedIncident.relatedReleases.map((rel, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 shadow-2xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-xs text-[var(--text-heading)]">
                              {rel.version}
                            </span>
                            <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                              {rel.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)]">{rel.changeDescription}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">
                            Service: {rel.service} &middot; Deployed: {rel.deployedAt}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── TAB 11: AUDIT TRAIL (SECTION 27) ────────────────── */}
                {activeTab === "audit" && (
                  <div className="space-y-2 text-xs">
                    {selectedIncident.auditTrail.map((audit, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono text-[10.5px] font-semibold text-[var(--text-muted)]">
                            {audit.time}
                          </span>
                          <div className="min-w-0">
                            <p className="font-mono font-bold text-[var(--sidebar-active)] text-xs truncate">
                              {audit.action}
                            </p>
                            <p className="text-[10.5px] text-[var(--text-muted)] truncate">
                              {audit.detail} &middot; Actor: {audit.actor}
                            </p>
                          </div>
                        </div>

                        <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 shrink-0">
                          {audit.result}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-xs text-[var(--text-muted)] py-16">
              Select an incident from the queue to inspect command details
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          MODAL: CREATE INCIDENT
      ────────────────────────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--divider)] bg-[var(--surface)] p-5 shadow-2xl animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--divider)]">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-red-700 font-bold">
                  <AlertTriangle size={14} />
                </span>
                <h3 className="text-sm font-bold text-[var(--text-heading)]">
                  Declare New Platform Incident
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-heading)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="py-3.5 space-y-3">
              <div>
                <label className="block text-[10.5px] font-bold text-[var(--text-muted)] uppercase mb-1">
                  Incident Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. UPI QR Payment Settlement Latency Surge"
                  className="w-full rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2.5 text-xs text-[var(--text-heading)] outline-none focus:border-[var(--sidebar-active)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10.5px] font-bold text-[var(--text-muted)] uppercase mb-1">
                    Affected Sahayogi Product
                  </label>
                  <select
                    value={newProduct}
                    onChange={(e) => setNewProduct(e.target.value)}
                    className="w-full rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2.5 text-xs text-[var(--text-heading)] outline-none focus:border-[var(--sidebar-active)]"
                  >
                    <option value="Chat with Sahayogi">Chat with Sahayogi</option>
                    <option value="BoSS">BoSS</option>
                    <option value="Tax Sahayogi">Tax Sahayogi</option>
                    <option value="Sahayogi Cloud">Sahayogi Cloud</option>
                    <option value="Office Sahayogi">Office Sahayogi</option>
                    <option value="Investor Sahayogi">Investor Sahayogi</option>
                    <option value="Sahayogi One">Sahayogi One</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-[var(--text-muted)] uppercase mb-1">
                    Severity Tier
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as IncidentSeverity)}
                    className="w-full rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2.5 text-xs text-[var(--text-heading)] outline-none focus:border-[var(--sidebar-active)]"
                  >
                    <option value="P1 · Critical">P1 · Critical (Outage / Revenue)</option>
                    <option value="P2 · High">P2 · High (Degraded functionality)</option>
                    <option value="P3 · Moderate">P3 · Moderate (Non-critical / Workaround)</option>
                    <option value="P4 · Low">P4 · Low (Minor anomaly)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-[var(--text-muted)] uppercase mb-1">
                  Impact & Initial Assessment
                </label>
                <textarea
                  value={newImpact}
                  onChange={(e) => setNewImpact(e.target.value)}
                  rows={3}
                  placeholder="Describe initial symptoms, blast radius, error codes..."
                  className="w-full rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-2.5 text-xs text-[var(--text-heading)] outline-none focus:border-[var(--sidebar-active)]"
                />
              </div>

              <div className="rounded-xl bg-[var(--surface-muted)] p-2.5 text-[11px] text-[var(--text-muted)]">
                Assigned Commander: <strong className="text-[var(--text-heading)]">Dhruv Singla (Tier-2 Support)</strong> &middot; Incident channel will be automatically broadcast across SRE On-call.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--divider)]">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--search-bg)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateIncident}
                disabled={!newTitle.trim()}
                className="rounded-xl bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 shadow-xs cursor-pointer"
              >
                Declare Incident
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IncidentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center text-xs text-[var(--text-muted)]">
          <RefreshCw size={20} className="animate-spin text-[var(--sidebar-active)] mr-2" />
          Loading Incident Command Center...
        </div>
      }
    >
      <IncidentsPageContent />
    </Suspense>
  );
}

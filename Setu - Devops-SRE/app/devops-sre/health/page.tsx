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
} from "lucide-react";
import FilterDropdown, { type FilterDropdownOption } from "@/components/shared/FilterDropdown";
import {
  criticalServices,
  sreIncidents,
  type CriticalServiceSlo,
} from "@/lib/mock-data/devops-sre";
import { triggerRefresh } from "@/lib/events/refresh";

type InspectorTab =
  | "overview"
  | "metrics"
  | "dependencies"
  | "traces"
  | "recent-issues"
  | "configuration"
  | "audit";

type SortOption = "status" | "name" | "latency" | "burn" | "uptime";

const SORT_OPTIONS: { id: SortOption; label: string; sub: string }[] = [
  { id: "status", label: "Health Status", sub: "Exhausted & At Risk first" },
  { id: "latency", label: "Response Time", sub: "Highest p95 latency first" },
  { id: "burn", label: "Error Budget Burn", sub: "Highest burn percentage first" },
  { id: "uptime", label: "Current Availability", sub: "Lowest uptime first" },
  { id: "name", label: "Service Name", sub: "Alphabetical A-Z" },
];

function statusPillClass(status: string) {
  switch (status) {
    case "Exhausted":
      return "bg-[var(--status-critical-bg)] text-[var(--status-critical-fg)] border border-[var(--status-critical-fg)]/25";
    case "At Risk":
      return "bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)] border border-[var(--status-warning-fg)]/25";
    case "Healthy":
    default:
      return "bg-[var(--status-healthy-bg)] text-[var(--status-healthy-fg)] border border-[var(--status-healthy-fg)]/25";
  }
}

function statusDotClass(status: string) {
  switch (status) {
    case "Exhausted":
      return "bg-[var(--status-critical-fg)]";
    case "At Risk":
      return "bg-[var(--status-warning-fg)]";
    case "Healthy":
    default:
      return "bg-[var(--status-healthy-fg)]";
  }
}

function ServiceIcon({ category, size = 20, className = "" }: { category: string; size?: number; className?: string }) {
  if (category.includes("Financial") || category.includes("Payment")) {
    return <Zap size={size} className={className} />;
  }
  if (category.includes("Messaging")) {
    return <Radio size={size} className={className} />;
  }
  if (category.includes("Tax") || category.includes("Government")) {
    return <Building2 size={size} className={className} />;
  }
  if (category.includes("Identity")) {
    return <ShieldCheck size={size} className={className} />;
  }
  return <Server size={size} className={className} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mini Sparkline / Latency Trend SVG
// ─────────────────────────────────────────────────────────────────────────────
function SreLatencyChart({
  p95Ms,
  status,
}: {
  p95Ms: number;
  status: string;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const width = 380;
  const height = 120;
  const paddingLeft = 32;
  const paddingRight = 12;
  const paddingTop = 12;
  const paddingBottom = 22;

  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const pointsCount = 24;
  const points = useMemo(() => {
    return Array.from({ length: pointsCount }, (_, i) => {
      const isOutage = status === "Exhausted" && i > 16;
      const base = isOutage ? p95Ms * (0.8 + Math.random() * 0.4) : (status === "At Risk" && i > 12 ? p95Ms * 0.7 : p95Ms * 0.25);
      const jitter = (Math.sin(i * 0.8) * 0.15 + Math.cos(i * 1.2) * 0.1) * base;
      const val = Math.max(8, Math.round(base + jitter));
      return { time: `-${pointsCount - i}m`, val };
    });
  }, [p95Ms, status]);

  const maxVal = Math.max(...points.map((p) => p.val), 50);

  const coords = points.map((p, i) => {
    const x = paddingLeft + (i / (pointsCount - 1)) * plotWidth;
    const y = paddingTop + plotHeight - (p.val / maxVal) * plotHeight;
    return { ...p, x, y };
  });

  const pathD = coords.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${paddingTop + plotHeight} L ${coords[0].x} ${paddingTop + plotHeight} Z`;

  const strokeColor = status === "Exhausted" ? "#DC2626" : status === "At Risk" ? "#D97706" : "#059669";
  const gradId = `sre-grad-${status}`;

  return (
    <div className="relative w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.00" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((pct) => {
          const y = paddingTop + plotHeight * pct;
          const val = Math.round(maxVal * (1 - pct));
          return (
            <g key={pct}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="var(--divider)"
                strokeDasharray="2 2"
                strokeWidth="0.75"
              />
              <text
                x={paddingLeft - 4}
                y={y + 3}
                textAnchor="end"
                className="fill-[var(--text-muted)] text-[8px] font-mono"
              >
                {val}ms
              </text>
            </g>
          );
        })}

        <path d={areaD} fill={`url(#${gradId})`} />
        <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />

        {coords.map((pt, i) => (
          <g key={pt.time} onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoverIndex === i ? 3.5 : 1.75}
              fill={strokeColor}
              stroke="var(--surface)"
              strokeWidth="1.2"
              className="cursor-pointer transition-all"
            />
          </g>
        ))}
      </svg>

      {hoverIndex !== null && (
        <div
          className="absolute -top-5 rounded bg-[var(--sidebar-active)] text-white px-1.5 py-0.5 text-[9.5px] font-mono shadow-md pointer-events-none -translate-x-1/2"
          style={{ left: `${(coords[hoverIndex].x / width) * 100}%` }}
        >
          {coords[hoverIndex].val}ms @ {coords[hoverIndex].time}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Health Page Content
// ─────────────────────────────────────────────────────────────────────────────
function HealthPageContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || searchParams.get("service") || "svc-waba";

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("status");
  const [selectedId, setSelectedId] = useState<string>(initialId);
  const [activeTab, setActiveTab] = useState<InspectorTab>("overview");
  const [timeRange, setTimeRange] = useState("Last 1 hour");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const allCategories = useMemo(
    () => Array.from(new Set(criticalServices.map((s) => s.category))).sort(),
    []
  );

  const categoryOptions: FilterDropdownOption[] = useMemo(
    () => [
      { value: "all", label: "All Categories" },
      ...allCategories.map((c) => ({ value: c, label: c })),
    ],
    [allCategories]
  );

  const statusOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Statuses", sub: "All health classifications" },
    { value: "Healthy", label: "Healthy", sub: "Operational within SLO" },
    { value: "At Risk", label: "At Risk", sub: "Elevated error budget burn" },
    { value: "Exhausted", label: "Exhausted", sub: "Outage / budget depleted" },
  ];

  const filteredServices = useMemo(() => {
    const list = criticalServices.filter((svc) => {
      const q = search.toLowerCase().trim();
      if (q) {
        const haystack = [svc.name, svc.category, svc.id, ...svc.dependencies].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (categoryFilter !== "all" && svc.category !== categoryFilter) return false;
      if (statusFilter !== "all" && svc.status !== statusFilter) return false;
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === "status") {
        const order: Record<string, number> = { Exhausted: 0, "At Risk": 1, Healthy: 2 };
        return (order[a.status] ?? 3) - (order[b.status] ?? 3);
      }
      if (sortBy === "latency") {
        return parseInt(b.p95Latency) - parseInt(a.p95Latency);
      }
      if (sortBy === "burn") {
        return b.errorBudgetBurnPct - a.errorBudgetBurnPct;
      }
      if (sortBy === "uptime") {
        return parseFloat(a.currentAvailability) - parseFloat(b.currentAvailability);
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [search, categoryFilter, statusFilter, sortBy]);

  const selectedService = useMemo(() => {
    return (
      filteredServices.find((s) => s.id === selectedId) ??
      criticalServices.find((s) => s.id === selectedId) ??
      filteredServices[0] ??
      criticalServices[0]
    );
  }, [filteredServices, selectedId]);

  return (
    <div className="flex flex-col min-h-full text-[var(--text-heading)] -mt-2 -mx-1 sm:-mx-2 pb-16 screen-sm:pb-8">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-18 right-6 z-50 flex items-center gap-2 rounded-xl border border-[var(--sidebar-active)]/30 bg-[var(--surface)] px-4 py-2.5 text-xs font-semibold text-[var(--text-heading)] shadow-lg animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 3: PAGE HEADER
          Platform & Microservice Telemetry
          Subtitle: Real-time infrastructure health, uptime tracking, and upstream dependency health
          Top-right status pill: ● 99.98% System Uptime
      ────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2 px-1 sm:px-2 mb-2">
        <div className="flex items-center gap-2.5">
          <Link
            href="/devops-sre/dashboard"
            title="Back to Dashboard"
            className="tap-pop flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--divider)] bg-[var(--surface)] text-[var(--role-text)] shadow-2xs hover:bg-[var(--search-bg)] transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-heading)] leading-none">
              Platform & Microservice Telemetry
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Real-time infrastructure health, SLO tracking, and upstream dependency health
            </p>
          </div>
        </div>

        {/* Top-Right System Uptime Pill */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--status-healthy-bg)] px-3 py-1 text-xs font-semibold text-[var(--status-healthy-fg)] border border-[var(--status-healthy-fg)]/20 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-[var(--status-healthy-fg)] animate-pulse" />
            99.98% Fleet SLO Compliance
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 4: KPI ROW
      ────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 screen-sm:grid-cols-3 screen-lg:grid-cols-6 lg:grid-cols-6 gap-2 sm:gap-2.5 lg:gap-3 px-1 sm:px-2 mb-3">
        {/* 1. Total Services */}
        <div
          className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Total Monitored</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--text-heading)] leading-none">
              {criticalServices.length}
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-up-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-up-fg)]">
              100% SRE
            </span>
          </div>
        </div>

        {/* 2. Healthy */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "Healthy" ? "all" : "Healthy")}
          className={`bg-[var(--surface)] rounded-xl border p-2.5 sm:p-3 text-left transition-all cursor-pointer ${
            statusFilter === "Healthy"
              ? "border-[var(--status-healthy-fg)] ring-2 ring-[var(--status-healthy-fg)]/20"
              : "border-[var(--card-border)] hover:border-[var(--divider)]"
          }`}
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Healthy</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--kpi-good)] leading-none">
              {criticalServices.filter((s) => s.status === "Healthy").length}
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-up-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-up-fg)]">
              &uarr; 9%
            </span>
          </div>
        </button>

        {/* 3. At Risk */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "At Risk" ? "all" : "At Risk")}
          className={`bg-[var(--surface)] rounded-xl border p-2.5 sm:p-3 text-left transition-all cursor-pointer ${
            statusFilter === "At Risk"
              ? "border-[var(--status-warning-fg)] ring-2 ring-[var(--status-warning-fg)]/20"
              : "border-[var(--card-border)] hover:border-[var(--divider)]"
          }`}
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">At Risk</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--kpi-warn)] leading-none">
              {criticalServices.filter((s) => s.status === "At Risk").length}
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-down-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-down-fg)]">
              &darr; 25%
            </span>
          </div>
        </button>

        {/* 4. Exhausted */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "Exhausted" ? "all" : "Exhausted")}
          className={`bg-[var(--surface)] rounded-xl border p-2.5 sm:p-3 text-left transition-all cursor-pointer ${
            statusFilter === "Exhausted"
              ? "border-[var(--status-critical-fg)] ring-2 ring-[var(--status-critical-fg)]/20"
              : "border-[var(--card-border)] hover:border-[var(--divider)]"
          }`}
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Exhausted</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--kpi-bad)] leading-none">
              {criticalServices.filter((s) => s.status === "Exhausted").length}
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-down-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-down-fg)]">
              &darr; 50%
            </span>
          </div>
        </button>

        {/* 5. Avg Response Time */}
        <div
          className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Avg Response Time</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--text-heading)] leading-none">48 ms</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-up-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-up-fg)]">
              &darr; 12%
            </span>
          </div>
        </div>

        {/* 6. Active Incidents */}
        <Link
          href="/devops-sre/incidents"
          title="View Active Incidents"
          className="group flex flex-col justify-between bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3 transition-all hover:border-[var(--sidebar-active)] cursor-pointer"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Active Incidents</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--status-critical-fg)] leading-none">
              {sreIncidents.filter((i) => i.status !== "Closed" && i.status !== "Resolved").length}
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-down-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-down-fg)]">
              P1 Active
            </span>
          </div>
        </Link>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 5: SEARCH + FILTER BAR
      ────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 px-1 sm:px-2 mb-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--search-placeholder)]" />
          <input
            type="text"
            placeholder="Search services, dependencies, protocols, IDs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--divider)] bg-[var(--surface)] py-1.5 sm:py-2 pl-9 pr-3 text-xs text-[var(--text-heading)] placeholder:text-[var(--search-placeholder)] shadow-xs outline-none focus:border-[var(--sidebar-active)]"
          />
        </div>

        {/* Filter Cluster */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <FilterDropdown
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categoryOptions}
            placeholder="All Categories"
            title="Filter by Category"
            searchable
            searchPlaceholder="Search category..."
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
              { label: "Only Exhausted", action: () => setStatusFilter("Exhausted") },
              { label: "Only At Risk", action: () => setStatusFilter("At Risk") },
              { label: "Financial Rails", action: () => setCategoryFilter("Financial Rail") },
              { label: "High Latency (> 100ms)", action: () => setSearch("840") },
              { label: "Exceeded Budget Burn (> 100%)", action: () => setSearch("142") },
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
                setCategoryFilter("all");
                setStatusFilter("all");
              }}
              className="ml-auto text-[var(--icon-btn-navy)] font-medium hover:underline text-[11px] cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 6 & 7: MAIN CONTENT — TWO-COLUMN LAYOUT (~50% / ~50%)
          LEFT: Services list
          RIGHT: Selected Service Health Inspector
      ────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-3 px-1 sm:px-2 min-h-0 flex-1">
        {/* ── LEFT PANEL: SERVICES LIST (50%) ─────────────────────────── */}
        <div
          className="w-full lg:w-1/2 shrink-0 bg-[var(--surface)] rounded-2xl border border-[var(--card-border)] shadow-xs flex flex-col p-3 sm:p-3.5 max-h-[520px] lg:max-h-none lg:h-[calc(100dvh-17rem)]"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--divider)]">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-heading)] leading-tight">
                Services ({filteredServices.length})
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Real-time health status of platform services and critical telemetry
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
              placeholder="Health Status"
              title="Sort Services"
              align="right"
            />
          </div>

          {/* Service List Rows */}
          <div className="flex-1 overflow-y-auto pt-2 space-y-1.5">
            {filteredServices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-[var(--text-muted)]">
                <Server size={28} className="mb-2 text-[var(--text-muted)]/50" />
                <p className="font-semibold text-[var(--text-heading)]">No services found</p>
                <p className="text-[11px] mt-0.5">Try adjusting your filters or search term</p>
              </div>
            ) : (
              filteredServices.map((svc) => {
                const isSelected = svc.id === selectedService.id;
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => setSelectedId(svc.id)}
                    className={`w-full flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-[var(--sidebar-active)] bg-[var(--search-bg)]/80 shadow-2xs"
                        : "border-[var(--divider)] bg-[var(--surface)] hover:bg-[var(--search-bg)]/40 hover:border-[var(--card-border)]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--search-bg)] text-[var(--text-secondary)]">
                        <ServiceIcon category={svc.category} size={18} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-[var(--text-heading)] truncate">
                            {svc.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] truncate">
                          {svc.category} &middot; <span className="font-mono-id">{svc.id}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-[var(--text-heading)]">
                          p95 {svc.p95Latency}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold ${statusPillClass(
                            svc.status
                          )}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(svc.status)}`} />
                          {svc.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10.5px] text-[var(--text-muted)] font-mono">
                        <span>SLO: {svc.targetSlo}</span>
                        <span>&middot;</span>
                        <span className={svc.errorBudgetBurnPct > 100 ? "text-red-600 font-bold" : ""}>
                          Burn: {svc.errorBudgetBurnPct}%
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL: SELECTED SERVICE HEALTH INSPECTOR (50%) ────── */}
        <div
          className="flex-1 min-w-0 bg-[var(--surface)] rounded-2xl border border-[var(--card-border)] shadow-xs flex flex-col p-3.5 sm:p-5 overflow-hidden lg:h-[calc(100dvh-17rem)]"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          {selectedService ? (
            <div className="flex flex-col h-full overflow-y-auto">
              {/* Top bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[var(--divider)]">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-bold ${statusPillClass(
                      selectedService.status
                    )}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(selectedService.status)}`} />
                    {selectedService.status}
                  </span>
                  <span className="font-mono text-xs font-semibold text-[var(--text-secondary)]">
                    p95 {selectedService.p95Latency}
                  </span>
                  <span className="text-[var(--text-muted)] text-[11px]">&middot;</span>
                  <span className="font-mono text-xs font-semibold text-[var(--text-secondary)]">
                    {selectedService.errorBudgetBurnPct}% budget burn
                  </span>
                </div>

                {/* Right-side quick controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTimeRange(timeRange === "Last 1 hour" ? "Last 24 hours" : "Last 1 hour")}
                    className="flex items-center gap-1 rounded-xl border border-[var(--divider)] bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--search-bg)] transition-colors cursor-pointer"
                  >
                    <span>{timeRange}</span>
                    <ChevronDown size={12} />
                  </button>

                  <Link
                    href={`/devops-sre/diagnostics?service=${selectedService.id}`}
                    className="flex items-center gap-1 rounded-xl border border-[var(--divider)] bg-[var(--surface)] px-2.5 py-1 text-xs font-semibold text-[var(--sidebar-active)] hover:bg-[var(--search-bg)] transition-colors shadow-2xs"
                  >
                    <span>Diagnostics</span>
                    <ArrowRight size={11} />
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      triggerRefresh({ source: `health-probe-${selectedService.id}` });
                      showToast(`Dispatched Synthetic Probe to ${selectedService.name} fleet`);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-[var(--accent-solid)] px-3 py-1 text-xs font-bold text-white shadow-xs hover:brightness-110 transition-colors cursor-pointer"
                  >
                    <Play size={11} className="fill-white" />
                    <span>Run Fleet Probe</span>
                  </button>
                </div>
              </div>

              {/* Service Identity & SLA Target */}
              <div className="flex flex-wrap items-start justify-between gap-3 pt-3 pb-2">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--search-bg)] text-[var(--sidebar-active)]">
                    <ServiceIcon category={selectedService.category} size={22} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-bold text-[var(--text-heading)] leading-tight">
                      {selectedService.name}
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {selectedService.category} &middot; <span className="font-mono-id">{selectedService.id}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-[11px] text-[var(--text-muted)]">SLO Target</p>
                    <p className="font-mono font-bold text-xs text-[var(--text-heading)]">
                      {selectedService.targetSlo}
                    </p>
                  </div>
                  <div className="h-7 w-px bg-[var(--divider)]" />
                  <div className="text-right">
                    <p className="text-[11px] text-[var(--text-muted)]">Current Availability</p>
                    <p
                      className={`font-mono font-bold text-xs ${
                        selectedService.status === "Exhausted"
                          ? "text-[var(--status-critical-fg)]"
                          : selectedService.status === "At Risk"
                          ? "text-[var(--status-warning-fg)]"
                          : "text-[var(--status-healthy-fg)]"
                      }`}
                    >
                      {selectedService.currentAvailability}
                    </p>
                  </div>
                </div>
              </div>

              {/* 30-Day Aggregate Uptime Strip */}
              <div className="mt-2 p-3 rounded-xl border border-[var(--divider)] bg-[var(--search-bg)]/40">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[var(--text-heading)] text-[11px]">
                    30-Day Reliability History Strip
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    99.98% aggregate fleet compliance
                  </span>
                </div>

                <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                  {selectedService.uptimeHistory30d.map((dayStatus, idx) => {
                    const dayColor =
                      dayStatus === "healthy"
                        ? "bg-emerald-500 hover:bg-emerald-600"
                        : dayStatus === "warning"
                        ? "bg-amber-400 hover:bg-amber-500"
                        : "bg-red-500 hover:bg-red-600";
                    return (
                      <div
                        key={idx}
                        title={`Day -${30 - idx}: ${dayStatus.toUpperCase()}`}
                        className={`h-6 flex-1 min-w-[0.5rem] rounded-xs cursor-pointer transition-colors ${dayColor}`}
                      />
                    );
                  })}
                </div>

                <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1.5 font-mono">
                  <span>30 Days Ago</span>
                  <span className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Healthy
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Degraded
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Outage
                    </span>
                  </span>
                  <span>Today</span>
                </div>
              </div>

              {/* Inspector Tabs */}
              <div className="flex items-center gap-1 border-b border-[var(--divider)] mt-4 mb-3 overflow-x-auto text-xs font-semibold">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "metrics", label: "Latency & Throughput" },
                  { id: "dependencies", label: "Dependencies" },
                  { id: "traces", label: "Traces & Spans" },
                  { id: "audit", label: "Audit Ledger" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as InspectorTab)}
                    className={`px-3 py-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-[var(--sidebar-active)] text-[var(--sidebar-active)]"
                        : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="flex-1 min-h-0">
                {/* 1. Overview */}
                {activeTab === "overview" && (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 screen-sm:grid-cols-4 gap-2">
                      <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                        <span className="text-[11px] text-[var(--text-muted)]">Throughput RPS</span>
                        <p className="font-mono text-sm font-bold text-[var(--text-heading)] mt-0.5">
                          {selectedService.throughputRps} req/s
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                        <span className="text-[11px] text-[var(--text-muted)]">Queue Depth</span>
                        <p className={`font-mono text-sm font-bold mt-0.5 ${selectedService.queueDepth > 50 ? "text-red-600" : "text-[var(--text-heading)]"}`}>
                          {selectedService.queueDepth}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                        <span className="text-[11px] text-[var(--text-muted)]">Budget Burn</span>
                        <p className={`font-mono text-sm font-bold mt-0.5 ${selectedService.errorBudgetBurnPct > 100 ? "text-red-600" : "text-emerald-600"}`}>
                          {selectedService.errorBudgetBurnPct}%
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                        <span className="text-[11px] text-[var(--text-muted)]">K8s Pods</span>
                        <p className="font-mono text-sm font-bold text-[var(--text-heading)] mt-0.5">
                          4 / 4 Nominal
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                      <h3 className="font-bold text-[var(--text-heading)] mb-1.5">SLO Error Budget Burn Rate</h3>
                      <div className="w-full bg-[var(--divider)] h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            selectedService.errorBudgetBurnPct > 100
                              ? "bg-red-600"
                              : selectedService.errorBudgetBurnPct > 50
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(100, selectedService.errorBudgetBurnPct)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-[var(--text-muted)] mt-1 font-mono">
                        <span>Burned: {selectedService.errorBudgetBurnPct}%</span>
                        <span>Budget Threshold: 100%</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                      <h3 className="font-bold text-[var(--text-heading)] mb-1.5">Active Dependencies</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedService.dependencies.map((dep) => (
                          <span
                            key={dep}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--divider)] bg-[var(--search-bg)] font-mono text-[11px] text-[var(--text-heading)]"
                          >
                            <Server size={12} className="text-[var(--text-muted)]" />
                            {dep}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Metrics */}
                {activeTab === "metrics" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 screen-sm:grid-cols-4 gap-2">
                      <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                        <span className="text-[11px] text-[var(--text-muted)]">p50 Median</span>
                        <p className="font-mono text-sm font-bold text-[var(--text-heading)] mt-0.5">
                          {selectedService.id === "svc-waba" ? "140ms" : "8ms"}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                        <span className="text-[11px] text-[var(--text-muted)]">p90 Latency</span>
                        <p className="font-mono text-sm font-bold text-[var(--text-heading)] mt-0.5">
                          {selectedService.id === "svc-waba" ? "420ms" : "14ms"}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                        <span className="text-[11px] text-[var(--text-muted)]">p95 SLA</span>
                        <p className={`font-mono text-sm font-bold mt-0.5 ${selectedService.status === "Exhausted" ? "text-red-600" : "text-emerald-600"}`}>
                          {selectedService.p95Latency}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                        <span className="text-[11px] text-[var(--text-muted)]">p99 Tail</span>
                        <p className="font-mono text-sm font-bold text-red-600 mt-0.5">
                          {selectedService.id === "svc-waba" ? "1,840ms" : "42ms"}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-xs text-[var(--text-heading)]">Real-Time Latency Telemetry (p95)</h3>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">1m interval</span>
                      </div>
                      <SreLatencyChart p95Ms={parseInt(selectedService.p95Latency) || 50} status={selectedService.status} />
                    </div>
                  </div>
                )}

                {/* 3. Dependencies */}
                {activeTab === "dependencies" && (
                  <div className="space-y-3 text-xs">
                    <p className="text-[var(--text-muted)]">
                      Topology mapping for <strong>{selectedService.name}</strong> to trace cascading failures and blast radius.
                    </p>
                    <div className="grid grid-cols-1 screen-sm:grid-cols-3 gap-2">
                      <div className="p-3 rounded-xl border border-[var(--divider)] bg-[var(--search-bg)]/50">
                        <span className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                          Upstream Ingress
                        </span>
                        <p className="font-semibold text-[var(--text-heading)]">Client API Gateways</p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Cloudflare &gt; Envoy Ingress</p>
                      </div>
                      <div className="p-3 rounded-xl border border-[var(--sidebar-active)] bg-[var(--search-bg)]/80">
                        <span className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--sidebar-active)] block mb-1">
                          Target Core
                        </span>
                        <p className="font-semibold text-[var(--text-heading)]">{selectedService.name}</p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Kubernetes Deployment</p>
                      </div>
                      <div className="p-3 rounded-xl border border-[var(--divider)] bg-[var(--search-bg)]/50">
                        <span className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                          Downstream Sinks
                        </span>
                        <p className="font-semibold text-[var(--text-heading)]">
                          {selectedService.dependencies[0] || "Postgres Primary"}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Database &amp; External Rails</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Traces */}
                {activeTab === "traces" && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-1 text-[11px] text-[var(--text-muted)]">
                      <span>Recent Distributed Spans</span>
                      <span>Latency Breakdown</span>
                    </div>
                    {[
                      { span: "POST /v1/messages/webhook", method: "POST", duration: "12ms", status: "200 OK", ok: true },
                      { span: "AUTH Bearer token validation", method: "INTERNAL", duration: "4ms", status: "200 OK", ok: true },
                      { span: "REDIS hmget session:active", method: "CACHE", duration: "1.2ms", status: "HIT", ok: true },
                      {
                        span: "UPSTREAM Meta Graph API v21.0",
                        method: "OUTBOUND",
                        duration: selectedService.status === "Exhausted" ? "820ms" : "24ms",
                        status: selectedService.status === "Exhausted" ? "504 Gateway Timeout" : "200 OK",
                        ok: selectedService.status !== "Exhausted",
                      },
                    ].map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)] text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-[var(--search-bg)] font-bold text-[10px]">
                            {t.method}
                          </span>
                          <span className="text-[var(--text-heading)]">{t.span}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--text-muted)]">{t.duration}</span>
                          <span className={`font-bold ${t.ok ? "text-emerald-600" : "text-red-600"}`}>
                            {t.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 5. Audit */}
                {activeTab === "audit" && (
                  <div className="space-y-2 text-xs">
                    {[
                      { time: "10 mins ago", actor: "Arjun Mehta (Lead SRE)", action: "Dispatched Health Probe", result: "Recorded" },
                      { time: "42 mins ago", actor: "Prometheus Alertmanager", action: "SLO Burn Alert Fired (Burn > 100%)", result: "Alerted" },
                      { time: "2 hours ago", actor: "ArgoCD Pipeline", action: "Rolling update synced to 100%", result: "Success" },
                    ].map((a, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)]"
                      >
                        <div>
                          <p className="font-semibold text-[var(--text-heading)]">{a.action}</p>
                          <p className="text-[11px] text-[var(--text-muted)] font-mono">
                            {a.actor} &middot; {a.time}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--search-bg)] text-[var(--text-secondary)]">
                          {a.result}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-xs text-[var(--text-muted)] py-16">
              Select a service from the list to inspect telemetry
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SrePlatformHealthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center text-xs text-[var(--text-muted)]">
          <RefreshCw size={20} className="animate-spin text-[var(--sidebar-active)] mr-2" />
          Loading Platform Health Telemetry...
        </div>
      }
    >
      <HealthPageContent />
    </Suspense>
  );
}

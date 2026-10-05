"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Activity,
  Terminal,
  Globe,
  RefreshCw,
  Copy,
  Check,
  Layers,
  Building2,
  Server,
  Zap,
  Filter,
  X,
  FileText,
  Play,
  RotateCw,
  Shield,
  Download,
} from "lucide-react";
import ProductIcon from "@/components/shared/ProductIcon";
import IntegrationIcon from "@/components/shared/IntegrationIcon";
import ProviderLogo from "@/components/shared/ProviderLogo";
import FilterDropdown, { FilterDropdownOption } from "@/components/shared/FilterDropdown";
import {
  MOCK_INTEGRATIONS,
  IntegrationItem,
  IntegrationStatus,
} from "@/lib/mock-data/integrations";

// ─────────────────────────────────────────────────────────────────────────────
// Types & Helpers
// ─────────────────────────────────────────────────────────────────────────────

type InspectorTab =
  | "overview"
  | "metrics"
  | "endpoints"
  | "dependencies"
  | "workspaces"
  | "recent-issues"
  | "configuration"
  | "audit";

type SortOption = "status" | "latency" | "sla" | "volume" | "name";

const SORT_OPTIONS: { id: SortOption; label: string; sub: string }[] = [
  { id: "status", label: "Health Status", sub: "Degraded & Down first" },
  { id: "latency", label: "Response Time", sub: "Highest latency first" },
  { id: "sla", label: "SLA Compliance", sub: "Lowest uptime first" },
  { id: "volume", label: "Request Volume", sub: "Highest throughput first" },
  { id: "name", label: "Integration Name", sub: "Alphabetical A-Z" },
];

function statusPillClass(status: IntegrationStatus) {
  switch (status) {
    case "Down":
      return "bg-[var(--status-critical-bg)] text-[var(--status-critical-fg)] border border-[var(--status-critical-fg)]/25";
    case "Degraded":
      return "bg-[var(--status-critical-bg)] text-[var(--status-critical-fg)] border border-[var(--status-critical-fg)]/25";
    case "Attention":
      return "bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)] border border-[var(--status-warning-fg)]/25";
    case "Healthy":
    default:
      return "bg-[var(--status-healthy-bg)] text-[var(--status-healthy-fg)] border border-[var(--status-healthy-fg)]/25";
  }
}

function statusDotClass(status: IntegrationStatus) {
  switch (status) {
    case "Down":
      return "bg-[var(--status-critical-fg)]";
    case "Degraded":
      return "bg-[var(--status-critical-fg)]";
    case "Attention":
      return "bg-[var(--status-warning-fg)]";
    case "Healthy":
    default:
      return "bg-[var(--status-healthy-fg)]";
  }
}

// Sparkline SVG component
function Sparkline({
  data,
  status,
  className = "",
}: {
  data: number[];
  status: IntegrationStatus;
  className?: string;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const width = 64;
  const height = 16;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * (width - 4) + 2;
      const y = height - 2 - ((val - min) / range) * (height - 6);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const strokeColor =
    status === "Down"
      ? "#EF4444"
      : status === "Degraded"
      ? "#EF4444"
      : status === "Attention"
      ? "#F59E0B"
      : "#10B981";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-14 h-3.5 select-none shrink-0 ${className}`}
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Telemetry Line Chart for Response Time (p95)
function ResponseTimeChart({
  series,
}: {
  series: { time: string; p95: number }[];
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const width = 360;
  const height = 110;
  const paddingLeft = 36;
  const paddingRight = 10;
  const paddingTop = 8;
  const paddingBottom = 20;

  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;
  const maxVal = 100;

  const coords = series.map((d, i) => {
    const x = paddingLeft + (i / (series.length - 1)) * plotWidth;
    const y = paddingTop + plotHeight - (Math.min(d.p95, maxVal) / maxVal) * plotHeight;
    return { x, y, ...d };
  });

  const pathD = coords.reduce((acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x},${pt.y}`, "");
  const areaD = `${pathD} L ${coords[coords.length - 1].x},${paddingTop + plotHeight} L ${coords[0].x},${paddingTop + plotHeight} Z`;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-22 overflow-visible select-none">
        <defs>
          <linearGradient id="p95Grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Y Axis Grid lines */}
        {[0, 50, 100].map((val) => {
          const y = paddingTop + plotHeight - (val / maxVal) * plotHeight;
          return (
            <g key={val}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="var(--divider)"
                strokeDasharray="2,3"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 4}
                y={y + 3}
                textAnchor="end"
                className="fill-[var(--text-muted)] text-[8px] font-mono"
              >
                {val === 0 ? "0 ms" : `${val} ms`}
              </text>
            </g>
          );
        })}

        <path d={areaD} fill="url(#p95Grad)" />
        <path d={pathD} fill="none" stroke="#10B981" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points & X labels */}
        {coords.map((pt, i) => (
          <g key={pt.time} onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)}>
            <text
              x={pt.x}
              y={height - 4}
              textAnchor="middle"
              className="fill-[var(--text-muted)] text-[8px] font-mono"
            >
              {pt.time}
            </text>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoverIndex === i ? 3.5 : 2}
              fill="#10B981"
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
          {coords[hoverIndex].p95} ms @ {coords[hoverIndex].time}
        </div>
      )}
    </div>
  );
}

// Telemetry Line Chart for Error Rate
function ErrorRateChart({
  series,
}: {
  series: { time: string; rate: number }[];
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const width = 360;
  const height = 110;
  const paddingLeft = 32;
  const paddingRight = 10;
  const paddingTop = 8;
  const paddingBottom = 20;

  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;
  const maxVal = 1.0;

  const coords = series.map((d, i) => {
    const x = paddingLeft + (i / (series.length - 1)) * plotWidth;
    const y = paddingTop + plotHeight - (Math.min(d.rate, maxVal) / maxVal) * plotHeight;
    return { x, y, ...d };
  });

  const pathD = coords.reduce((acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x},${pt.y}`, "");
  const areaD = `${pathD} L ${coords[coords.length - 1].x},${paddingTop + plotHeight} L ${coords[0].x},${paddingTop + plotHeight} Z`;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-22 overflow-visible select-none">
        <defs>
          <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Y Axis Grid lines */}
        {[0, 0.5, 1.0].map((val) => {
          const y = paddingTop + plotHeight - (val / maxVal) * plotHeight;
          return (
            <g key={val}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="var(--divider)"
                strokeDasharray="2,3"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 4}
                y={y + 3}
                textAnchor="end"
                className="fill-[var(--text-muted)] text-[8px] font-mono"
              >
                {val === 0 ? "0%" : `${val}%`}
              </text>
            </g>
          );
        })}

        <path d={areaD} fill="url(#errGrad)" />
        <path d={pathD} fill="none" stroke="#EF4444" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points & X labels */}
        {coords.map((pt, i) => (
          <g key={pt.time} onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)}>
            <text
              x={pt.x}
              y={height - 4}
              textAnchor="middle"
              className="fill-[var(--text-muted)] text-[8px] font-mono"
            >
              {pt.time}
            </text>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoverIndex === i ? 3.5 : 2}
              fill="#EF4444"
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
          {coords[hoverIndex].rate}% @ {coords[hoverIndex].time}
        </div>
      )}
    </div>
  );
}

// Telemetry Bar Chart for Transaction Volume
function TransactionVolumeChart({
  series,
}: {
  series: { time: string; reqs: number }[];
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const width = 360;
  const height = 110;
  const paddingLeft = 28;
  const paddingRight = 10;
  const paddingTop = 8;
  const paddingBottom = 20;

  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;
  const maxVal = 2000;

  // Render 32 discrete volume bars
  const barCount = 32;
  const bars = Array.from({ length: barCount }, (_, i) => {
    const base = series[Math.floor((i / barCount) * series.length)]?.reqs ?? 1200;
    const variation = Math.sin(i * 0.9) * 190 + Math.cos(i * 1.5) * 140;
    const reqs = Math.max(380, Math.min(1950, base + variation));
    const x = paddingLeft + (i / barCount) * plotWidth;
    const barW = Math.max(2.8, (plotWidth / barCount) - 2.2);
    const barH = (reqs / maxVal) * plotHeight;
    const y = paddingTop + plotHeight - barH;
    return { i, x, y, barW, barH, reqs };
  });

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-22 overflow-visible select-none">
        {/* Y Axis Grid lines */}
        {[0, 1000, 2000].map((val) => {
          const y = paddingTop + plotHeight - (val / maxVal) * plotHeight;
          return (
            <g key={val}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="var(--divider)"
                strokeDasharray="2,3"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 4}
                y={y + 3}
                textAnchor="end"
                className="fill-[var(--text-muted)] text-[8px] font-mono"
              >
                {val === 0 ? "0" : val === 1000 ? "1K" : "2K"}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {bars.map((bar) => {
          const isHovered = hoverIndex === bar.i;
          return (
            <rect
              key={bar.i}
              x={bar.x}
              y={bar.y}
              width={bar.barW}
              height={bar.barH}
              rx={1.2}
              fill={isHovered ? "#2563EB" : "#60A5FA"}
              className="cursor-pointer transition-colors"
              onMouseEnter={() => setHoverIndex(bar.i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          );
        })}

        {/* X Axis Timestamps */}
        {series.map((pt, i) => {
          const x = paddingLeft + (i / (series.length - 1)) * plotWidth;
          return (
            <text
              key={pt.time}
              x={x}
              y={height - 4}
              textAnchor="middle"
              className="fill-[var(--text-muted)] text-[8px] font-mono"
            >
              {pt.time}
            </text>
          );
        })}
      </svg>

      {hoverIndex !== null && (
        <div
          className="absolute -top-5 rounded bg-[var(--sidebar-active)] text-white px-1.5 py-0.5 text-[9.5px] font-mono shadow-md pointer-events-none -translate-x-1/2"
          style={{ left: `${(bars[hoverIndex].x / width) * 100}%` }}
        >
          {Math.round(bars[hoverIndex].reqs)} req/min
        </div>
      )}
    </div>
  );
}

// Circular SLA Gauge SVG
function CircularSLAGauge({
  percentage = 99.99,
  size = 80,
}: {
  percentage?: number;
  size?: number;
}) {
  const strokeWidth = 6.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--divider)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#10B981"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[13px] font-bold text-[var(--text-heading)] leading-none">{percentage}%</span>
        <span className="text-[8.5px] text-[var(--text-muted)] font-medium mt-0.5">SLA Target</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  // Search & Filter state
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [envFilter, setEnvFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("1h");
  const [sortBy, setSortBy] = useState<SortOption>("status");

  // Selection & Tab state
  const [selectedId, setSelectedId] = useState<string>("npci-upi");
  const [activeTab, setActiveTab] = useState<InspectorTab>("overview");

  // Modals & Drawers
  const [checkModalOpen, setCheckModalOpen] = useState(false);
  const [checkRunning, setCheckRunning] = useState(false);
  const [diagnosticsModalOpen, setDiagnosticsModalOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);

  // Pagination for workspaces tab
  const [workspacePage, setWorkspacePage] = useState(1);

  // Filter options
  const categoryOptions: FilterDropdownOption[] = useMemo(() => {
    const cats = Array.from(new Set(MOCK_INTEGRATIONS.map((i) => i.category)));
    return [
      { value: "all", label: "All Categories" },
      ...cats.map((c) => ({ value: c, label: c })),
    ];
  }, []);

  const providerOptions: FilterDropdownOption[] = useMemo(() => {
    const provs = Array.from(new Set(MOCK_INTEGRATIONS.map((i) => i.providerShort)));
    return [
      { value: "all", label: "All Providers" },
      ...provs.map((p) => ({ value: p, label: p })),
    ];
  }, []);

  const statusOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Statuses" },
    { value: "Healthy", label: "Healthy" },
    { value: "Degraded", label: "Degraded" },
    { value: "Attention", label: "Attention" },
    { value: "Down", label: "Down" },
  ];

  const envOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Environments" },
    { value: "Production", label: "Production" },
    { value: "Staging", label: "Staging" },
    { value: "Sandbox", label: "Sandbox" },
  ];

  const timeRangeOptions: FilterDropdownOption[] = [
    { value: "1h", label: "Last 1 hour" },
    { value: "6h", label: "Last 6 hours" },
    { value: "24h", label: "Last 24 hours" },
    { value: "7d", label: "Last 7 days" },
  ];

  // Filtered & sorted list
  const filteredIntegrations = useMemo(() => {
    return MOCK_INTEGRATIONS.filter((item) => {
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesProvider = item.provider.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesProduct = item.sahProduct.toLowerCase().includes(query);
        const matchesService = item.sahService.toLowerCase().includes(query);
        const matchesEndpoint = item.primaryEndpoint.toLowerCase().includes(query);
        if (!matchesName && !matchesProvider && !matchesCategory && !matchesProduct && !matchesService && !matchesEndpoint) {
          return false;
        }
      }

      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (providerFilter !== "all" && item.providerShort !== providerFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (envFilter !== "all" && item.environment !== envFilter) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "status") {
        const weight: Record<IntegrationStatus, number> = { Down: 0, Degraded: 1, Attention: 2, Healthy: 3 };
        return weight[a.status] - weight[b.status];
      }
      if (sortBy === "latency") return b.p95 - a.p95;
      if (sortBy === "sla") return a.currentUptime - b.currentUptime;
      if (sortBy === "volume") return parseInt(b.volume) - parseInt(a.volume);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [search, categoryFilter, providerFilter, statusFilter, envFilter, sortBy]);

  // Selected item
  const selected = useMemo(() => {
    return (
      filteredIntegrations.find((item) => item.id === selectedId) ??
      filteredIntegrations[0] ??
      MOCK_INTEGRATIONS[0]
    );
  }, [filteredIntegrations, selectedId]);

  // Trigger simulated integration check
  const handleRunCheck = () => {
    setCheckRunning(true);
    setTimeout(() => {
      setCheckRunning(false);
    }, 1200);
  };

  // Copy primary endpoint
  const handleCopyEndpoint = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-full text-[var(--text-heading)] -mt-2 -mx-1 sm:-mx-2 pb-16 screen-sm:pb-8">
      {/* ─────────────────────────────────────────────────────────────────
          SECTION 5: PAGE HEADER
          External Rails & Ecosystem Integrations
          Operational status and webhook delivery SLA across third-party financial and messaging networks
          Top-right: [ Check Integration ] [ More ▾ ]
      ────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2 px-1 sm:px-2 mb-2">
        <div className="flex items-center gap-2.5">
          <Link
            href="/technical-support/dashboard"
            title="Back to Dashboard"
            className="tap-pop flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--divider)] bg-[var(--surface)] text-[var(--role-text)] shadow-2xs hover:bg-[var(--search-bg)] transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-heading)] leading-none">
              External Rails & Ecosystem Integrations
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Operational status and webhook delivery SLA across third-party financial and messaging networks
            </p>
          </div>
        </div>

        {/* Top-Right Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCheckModalOpen(true);
              handleRunCheck();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-solid)] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            <ShieldCheck size={14} />
            <span>Check Integration</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--divider)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-heading)] shadow-2xs hover:bg-[var(--search-bg)] transition-colors cursor-pointer"
            >
              <span>More</span>
              <ChevronDown size={14} className="text-[var(--text-muted)]" />
            </button>

            {moreMenuOpen && (
              <div
                className="absolute right-0 mt-1 w-52 rounded-lg border border-[var(--divider)] bg-[var(--surface)] py-1 shadow-lg z-50 text-xs"
                onMouseLeave={() => setMoreMenuOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMoreMenuOpen(false);
                    handleCopyEndpoint(selected.primaryEndpoint);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[var(--search-bg)] flex items-center gap-2 text-[var(--text-heading)] cursor-pointer"
                >
                  <Copy size={13} className="text-[var(--text-muted)]" />
                  <span>Copy cURL Command</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMoreMenuOpen(false);
                    setDiagnosticsModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[var(--search-bg)] flex items-center gap-2 text-[var(--text-heading)] cursor-pointer"
                >
                  <Play size={13} className="text-[var(--text-muted)]" />
                  <span>Run Probe Suite</span>
                </button>
                <Link
                  href={`/technical-support/incidents?search=${encodeURIComponent(selected.provider)}`}
                  className="w-full text-left px-3 py-2 hover:bg-[var(--search-bg)] flex items-center gap-2 text-[var(--text-heading)] cursor-pointer"
                >
                  <AlertCircle size={13} className="text-[var(--text-muted)]" />
                  <span>View Related Incidents</span>
                </Link>
                <div className="border-t border-[var(--divider)] my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setMoreMenuOpen(false);
                    const blob = new Blob([JSON.stringify(selected, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${selected.id}-sla-report.json`;
                    a.click();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[var(--search-bg)] flex items-center gap-2 text-[var(--text-heading)] cursor-pointer"
                >
                  <Download size={13} className="text-[var(--text-muted)]" />
                  <span>Export SLA Report (JSON)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 6: KPI ROW (6 Compact Cards)
          Total Integrations: 12 (↑ 20%)
          Healthy: 9 (↑ 12%)
          Degraded: 2 (↑ 100%)
          Down: 1 (— 0%)
          Avg Response Time (p95): 86 ms (↓ 18%)
          SLA Compliance: 98.7% (↑ 2%)
      ────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 screen-sm:grid-cols-3 screen-lg:grid-cols-6 lg:grid-cols-6 gap-2 sm:gap-2.5 lg:gap-3 px-1 sm:px-2 mb-3">
        {/* 1. Total Integrations */}
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`bg-[var(--surface)] rounded-xl border p-2.5 sm:p-3 text-left transition-all cursor-pointer ${
            statusFilter === "all"
              ? "border-[var(--divider)] hover:border-blue-400"
              : "border-[var(--card-border)] hover:border-[var(--divider)] opacity-90"
          }`}
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Total Integrations</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--text-heading)] leading-none">12</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-up-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-up-fg)]">
              &uarr; 20%
            </span>
          </div>
        </button>

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
            <span className="text-lg sm:text-xl font-bold text-[var(--status-healthy-fg)] leading-none">9</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-up-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-up-fg)]">
              &uarr; 12%
            </span>
          </div>
        </button>

        {/* 3. Degraded */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "Degraded" ? "all" : "Degraded")}
          className={`bg-[var(--surface)] rounded-xl border p-2.5 sm:p-3 text-left transition-all cursor-pointer ${
            statusFilter === "Degraded"
              ? "border-amber-500 ring-2 ring-amber-500/20"
              : "border-[var(--card-border)] hover:border-[var(--divider)]"
          }`}
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Degraded</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400 leading-none">2</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-down-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-down-fg)]">
              &uarr; 100%
            </span>
          </div>
        </button>

        {/* 4. Down */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "Down" ? "all" : "Down")}
          className={`bg-[var(--surface)] rounded-xl border p-2.5 sm:p-3 text-left transition-all cursor-pointer ${
            statusFilter === "Down"
              ? "border-red-500 ring-2 ring-red-500/20"
              : "border-[var(--card-border)] hover:border-[var(--divider)]"
          }`}
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Down</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400 leading-none">1</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--search-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--text-muted)]">
              &mdash; 0%
            </span>
          </div>
        </button>

        {/* 5. Avg Response Time (p95) */}
        <div
          className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Avg Response Time (p95)</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--text-heading)] leading-none">86 ms</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-up-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-up-fg)]">
              &darr; 18%
            </span>
          </div>
        </div>

        {/* 6. SLA Compliance */}
        <div
          className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">SLA Compliance</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--text-heading)] leading-none">98.7%</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-up-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-up-fg)]">
              &uarr; 2%
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 7: SEARCH + FILTER BAR
          Search: Search integrations, providers, endpoints, workspace, error...
          Filters: All Categories, All Providers, All Statuses, All Environments, Last 24 hours, More filters
      ────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-1 sm:px-2 mb-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[280px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--search-placeholder)] pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search integrations, providers, endpoints, workspace, error..."
            className="w-full rounded-lg border border-[var(--divider)] bg-[var(--surface)] pl-9 pr-8 py-1.5 text-xs text-[var(--text-heading)] placeholder:text-[var(--search-placeholder)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-solid)]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-heading)]"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categoryOptions}
            placeholder="All Categories"
            className="text-xs"
          />
          <FilterDropdown
            value={providerFilter}
            onChange={setProviderFilter}
            options={providerOptions}
            placeholder="All Providers"
            className="text-xs"
          />
          <FilterDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            placeholder="All Statuses"
            className="text-xs"
          />
          <FilterDropdown
            value={envFilter}
            onChange={setEnvFilter}
            options={envOptions}
            placeholder="All Environments"
            className="text-xs"
          />
          <FilterDropdown
            value={timeRange}
            onChange={setTimeRange}
            options={timeRangeOptions}
            placeholder="Last 24 hours"
            className="text-xs"
          />

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategoryFilter("all");
              setProviderFilter("all");
              setStatusFilter("all");
              setEnvFilter("all");
              setTimeRange("1h");
            }}
            title="Reset filters"
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--divider)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--role-text)] hover:bg-[var(--search-bg)] transition-colors cursor-pointer"
          >
            <SlidersHorizontal size={13} />
            <span>More filters</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 8: MAIN CONTENT (Two-Column Layout ~45% Left / ~55% Right)
      ────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-3 px-1 sm:px-2 flex-1 items-start">
        {/* ── LEFT PANEL: Integrations List (~45%) ──────────────────── */}
        <div
          className="w-full lg:w-[46%] shrink-0 bg-[var(--surface)] rounded-xl border border-[var(--divider)] p-3 flex flex-col gap-2 max-h-[calc(100vh-17.5rem)] overflow-hidden"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          {/* Left Panel Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[var(--divider)]">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-heading)]">
                Integrations ({filteredIntegrations.length})
              </h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                Third-party rails, gateways and ecosystem services
              </p>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[11px] text-[var(--text-muted)] font-medium">Sort by:</span>
              <FilterDropdown
                value={sortBy}
                onChange={(v) => setSortBy(v as SortOption)}
                options={SORT_OPTIONS.map((o) => ({ value: o.id, label: o.label }))}
                className="text-xs border-none shadow-none font-semibold text-[var(--text-heading)]"
              />
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto pr-0.5 space-y-1.5">
            {filteredIntegrations.map((item) => {
              const isSelected = item.id === selected.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`group relative flex items-center justify-between gap-2 p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 shadow-xs ring-1 ring-blue-500/20"
                      : "border-[var(--divider)] bg-[var(--surface)] hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50/50 dark:hover:bg-gray-800/40"
                  }`}
                >
                  {/* Left: Integration Icon & Info */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <IntegrationIcon
                      integration={item.id}
                      size={36}
                      className="rounded-lg shadow-2xs shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-xs text-[var(--text-heading)] truncate block">
                        {item.name}
                      </span>
                      <span className="text-[10.5px] text-[var(--text-muted)] truncate block mt-0.5">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Provider Logo & Name */}
                  <div className="shrink-0 w-28 pl-1">
                    <ProviderLogo provider={item.providerLogoType} name={item.providerShort} size={15} />
                  </div>

                  {/* Middle metrics: SLA & p95 */}
                  <div className="flex items-center gap-2.5 shrink-0 text-right">
                    <div className="flex flex-col items-end w-12">
                      <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-medium leading-none">
                        SLA
                      </span>
                      <span className="text-[11.5px] font-bold text-[var(--text-heading)] mt-0.5">
                        {item.sla}
                      </span>
                    </div>

                    <div className="flex flex-col items-end w-12">
                      <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-medium leading-none">
                        p95
                      </span>
                      <span className="text-[11.5px] font-bold font-mono text-[var(--text-heading)] mt-0.5">
                        {item.p95} {item.p95Unit}
                      </span>
                    </div>
                  </div>

                  {/* Sparkline */}
                  <div className="shrink-0 pl-1">
                    <Sparkline data={item.sparkline} status={item.status} />
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap ${statusPillClass(
                        item.status
                      )}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(item.status)}`} />
                      {item.status}
                    </span>
                  </div>

                  {/* Chevron Right */}
                  <ChevronRight
                    size={14}
                    className={`shrink-0 transition-transform ${
                      isSelected ? "text-blue-600 translate-x-0.5" : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                </div>
              );
            })}

            {filteredIntegrations.length === 0 && (
              <div className="text-center py-10 px-4 text-xs text-[var(--text-muted)]">
                No integrations match your search or filter criteria.
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL: Integration Inspector (~54%) ─────────────── */}
        <div
          className="flex-1 min-w-0 bg-[var(--surface)] rounded-xl border border-[var(--divider)] p-4 flex flex-col gap-3.5 max-h-[calc(100vh-17.5rem)] overflow-y-auto"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          {/* Inspector Top Status & Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-[var(--divider)]">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusPillClass(
                  selected.status
                )}`}
              >
                <span className={`h-2 w-2 rounded-full ${statusDotClass(selected.status)} animate-pulse`} />
                {selected.status}
              </span>
              <span className="text-xs text-[var(--text-muted)] font-mono">
                p95 {selected.p95} {selected.p95Unit} · {selected.errorRate} error rate
              </span>
            </div>

            <div className="flex items-center gap-2">
              <FilterDropdown
                value={timeRange}
                onChange={setTimeRange}
                options={timeRangeOptions}
                className="text-xs"
              />

              <Link
                href={`/technical-support/api-logs?search=${encodeURIComponent(selected.name)}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline px-1 py-1"
              >
                <span>View Logs</span>
                <span className="text-[13px]">&rarr;</span>
              </Link>

              <button
                type="button"
                onClick={() => setDiagnosticsModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-solid)] px-2.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Activity size={13} />
                <span>Run Diagnostics</span>
              </button>

              <button
                type="button"
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--divider)] bg-[var(--surface)] px-2 py-1.5 text-xs text-[var(--text-heading)] hover:bg-[var(--search-bg)] cursor-pointer"
              >
                <span>More</span>
                <ChevronDown size={13} />
              </button>
            </div>
          </div>

          {/* Integration Title Banner */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <IntegrationIcon
                integration={selected.id}
                size={46}
                className="rounded-xl shadow-xs shrink-0 mt-0.5"
              />
              <div>
                <h2 className="text-lg font-bold text-[var(--text-heading)] leading-snug">
                  {selected.name}
                </h2>
                <div className="flex items-center gap-2 text-xs text-[var(--role-text)] mt-0.5">
                  <span>{selected.category}</span>
                  <span>·</span>
                  <span className="font-semibold text-[var(--text-heading)]">{selected.provider}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                    Used by:
                    <ProductIcon product={selected.sahProduct} size={14} className="rounded" />
                    <strong className="text-[var(--text-heading)]">{selected.sahProduct}</strong>
                    <span>({selected.sahService})</span>
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed max-w-xl">
                  {selected.description}
                </p>
              </div>
            </div>

            {/* Right side SLA summary */}
            <div className="flex items-center gap-4 shrink-0 text-right">
              <div>
                <p className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">SLA Target</p>
                <p className="text-sm font-bold text-[var(--text-heading)] mt-0.5">{selected.slaTarget}%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">Current Uptime</p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{selected.currentUptime}%</p>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              SECTION 14: TABS
              Overview, Metrics, Endpoints, Dependent Services, Workspaces (32),
              Recent Issues, Configuration, Audit Trail
          ────────────────────────────────────────────────────────────── */}
          <div className="border-b border-[var(--divider)] -mx-4 px-4 overflow-x-auto scrollbar-none">
            <nav className="flex space-x-5 min-w-max" aria-label="Tabs">
              {[
                { id: "overview", label: "Overview" },
                { id: "metrics", label: "Metrics" },
                { id: "endpoints", label: "Endpoints" },
                { id: "dependencies", label: "Dependent Services" },
                { id: "workspaces", label: `Workspaces (${selected.workspacesCount > 32 ? 32 : selected.workspacesCount})` },
                { id: "recent-issues", label: "Recent Issues" },
                { id: "configuration", label: "Configuration" },
                { id: "audit", label: "Audit Trail" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as InspectorTab)}
                    className={`py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                      isActive
                        ? "border-[var(--accent-solid)] text-[var(--text-heading)] font-semibold"
                        : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:border-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              TAB CONTENT 1: OVERVIEW (Target Layout from Reference Image)
          ────────────────────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-3.5">
              {/* 1. 8 Compact Metadata Cards in a 4x2 Grid */}
              <div className="grid grid-cols-2 screen-sm:grid-cols-4 gap-2">
                {/* 1. Provider */}
                <div className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-2.5 flex items-center gap-2">
                  <div className="shrink-0">
                    <ProviderLogo provider={selected.providerLogoType} size={16} showText={true} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-[var(--text-muted)] block leading-none">Provider</span>
                    <span className="text-xs font-bold text-[var(--text-heading)] mt-0.5 truncate block">
                      {selected.provider}
                    </span>
                  </div>
                </div>

                {/* 2. Category */}
                <div className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-2.5 flex items-center gap-2">
                  <FileText size={18} className="text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-[var(--text-muted)] block leading-none">Category</span>
                    <span className="text-xs font-bold text-[var(--text-heading)] mt-0.5 truncate block">
                      {selected.category}
                    </span>
                  </div>
                </div>

                {/* 3. Environment */}
                <div className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-2.5 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-[var(--text-muted)] block leading-none">Environment</span>
                    <span className="text-xs font-bold text-[var(--text-heading)] mt-0.5 truncate block">
                      {selected.environment}
                    </span>
                  </div>
                </div>

                {/* 4. Primary Endpoint */}
                <div
                  onClick={() => handleCopyEndpoint(selected.primaryEndpoint)}
                  title="Click to copy endpoint"
                  className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-2.5 flex items-center gap-2 cursor-pointer hover:border-blue-400 group"
                >
                  {copiedEndpoint ? (
                    <Check size={18} className="text-emerald-600 shrink-0" />
                  ) : (
                    <Terminal size={18} className="text-blue-600 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-[var(--text-muted)] block leading-none">
                      {copiedEndpoint ? "Copied!" : "Primary Endpoint"}
                    </span>
                    <span className="text-xs font-bold font-mono text-[var(--text-heading)] mt-0.5 truncate block">
                      {selected.primaryEndpoint.replace("https://", "")}
                    </span>
                  </div>
                </div>

                {/* 5. Webhook / Callback */}
                <div className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-2.5 flex items-center gap-2">
                  <RefreshCw size={18} className="text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-[var(--text-muted)] block leading-none">Webhook / Callback</span>
                    <span className="text-xs font-bold text-[var(--text-heading)] mt-0.5 truncate block">
                      {selected.webhookCallback}
                    </span>
                  </div>
                </div>

                {/* 6. Region */}
                <div className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-2.5 flex items-center gap-2">
                  <Globe size={18} className="text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-[var(--text-muted)] block leading-none">Region</span>
                    <span className="text-xs font-bold text-[var(--text-heading)] mt-0.5 truncate block">
                      {selected.region}
                    </span>
                  </div>
                </div>

                {/* 7. Version */}
                <div className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-2.5 flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-[var(--text-muted)] block leading-none">Version</span>
                    <span className="text-xs font-bold font-mono text-[var(--text-heading)] mt-0.5 truncate block">
                      {selected.version}
                    </span>
                  </div>
                </div>

                {/* 8. Workspaces Using */}
                <div
                  onClick={() => setActiveTab("workspaces")}
                  className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-2.5 flex items-center gap-2 cursor-pointer hover:border-blue-400"
                >
                  <Building2 size={18} className="text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-[var(--text-muted)] block leading-none">Workspaces Using</span>
                    <span className="text-xs font-bold text-[var(--text-heading)] mt-0.5 truncate block">
                      {selected.workspacesCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Telemetry Section (3 Compact Metric Panels) */}
              <div className="grid grid-cols-1 screen-sm:grid-cols-3 gap-2.5">
                {/* 1. Response Time (p95) */}
                <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text-muted)]">Response Time (p95)</span>
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-up-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-up-fg)]">
                      {selected.p95Change}
                    </span>
                  </div>
                  <div className="text-xl font-bold font-mono text-[var(--text-heading)] my-1">
                    {selected.p95} {selected.p95Unit}
                  </div>
                  <ResponseTimeChart series={selected.latencySeries} />
                </div>

                {/* 2. Error Rate */}
                <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text-muted)]">Error Rate</span>
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-up-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-up-fg)]">
                      {selected.errorRateChange}
                    </span>
                  </div>
                  <div className="text-xl font-bold font-mono text-[var(--text-heading)] my-1">
                    {selected.errorRate}
                  </div>
                  <ErrorRateChart series={selected.errorSeries} />
                </div>

                {/* 3. Transaction Volume */}
                <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text-muted)]">Transaction Volume</span>
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-up-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-up-fg)]">
                      {selected.volumeChange}
                    </span>
                  </div>
                  <div className="text-xl font-bold font-mono text-[var(--text-heading)] my-1">
                    {selected.volume}
                  </div>
                  <TransactionVolumeChart series={selected.volumeSeries} />
                </div>
              </div>

              {/* 3. Lower SLA, Dependencies & Workspaces Row */}
              <div className="grid grid-cols-1 screen-sm:grid-cols-3 gap-2.5">
                {/* 1. SLA & Reliability Card */}
                <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3 flex flex-col justify-between">
                  <span className="text-xs font-bold text-[var(--text-heading)]">SLA & Reliability</span>

                  <div className="flex items-center gap-3.5 my-2">
                    <CircularSLAGauge percentage={selected.slaTarget} size={76} />

                    <div className="flex flex-col gap-1 text-[11px] min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[var(--text-muted)]">Uptime (30 days)</span>
                        <span className="font-semibold text-[var(--text-heading)] font-mono">{selected.currentUptime}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[var(--text-muted)]">Incidents (30 days)</span>
                        <span className="font-semibold text-[var(--text-heading)] font-mono">{selected.recentIssues.length}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[var(--text-muted)]">Last Incident</span>
                        <span className="text-[var(--text-muted)] font-mono truncate max-w-[80px]">
                          {selected.recentIssues[0]?.date ? selected.recentIssues[0].date.split(",")[0] : "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[var(--text-muted)]">Status</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selected.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Dependent Services (3) Card */}
                <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-heading)]">
                      Dependent Services ({selected.dependentServices.length})
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 my-2">
                    {selected.dependentServices.slice(0, 3).map((dep) => (
                      <div key={dep.name} className="flex items-center justify-between text-xs py-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(dep.status)} shrink-0`} />
                          <span className="text-[var(--text-heading)] font-medium truncate">{dep.name}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                          {dep.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("dependencies")}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 text-left cursor-pointer"
                  >
                    <span>View dependencies</span>
                    <span>&rarr;</span>
                  </button>
                </div>

                {/* 3. Used by Workspaces Card */}
                <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3 flex flex-col justify-between">
                  <span className="text-xs font-bold text-[var(--text-heading)]">Used by Workspaces</span>

                  <div className="flex items-center gap-3 my-2">
                    <div className="w-10 h-10 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 flex items-center justify-center shrink-0">
                      <Building2 size={22} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold font-mono text-[var(--text-heading)] leading-none">
                        {selected.workspacesCount}
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] mt-1">Active workspaces</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("workspaces")}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 text-left cursor-pointer"
                  >
                    <span>View workspaces</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB CONTENT 2: METRICS TAB
          ────────────────────────────────────────────────────────────── */}
          {activeTab === "metrics" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between pb-1 border-b border-[var(--divider)]">
                <div>
                  <h3 className="text-xs font-bold text-[var(--text-heading)]">Latency & Reliability Breakdown</h3>
                  <p className="text-[11px] text-[var(--text-muted)]">Granular percentile distributions and request budgets</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {["1h", "6h", "24h", "7d"].map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setTimeRange(range)}
                      className={`px-2 py-0.5 text-xs rounded font-medium transition-colors ${
                        timeRange === range
                          ? "bg-[var(--accent-solid)] text-white"
                          : "border border-[var(--divider)] bg-[var(--surface)] text-[var(--role-text)] hover:bg-[var(--search-bg)]"
                      }`}
                    >
                      {range === "1h" ? "1 hr" : range === "6h" ? "6 hrs" : range === "24h" ? "24 hrs" : "7 days"}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Latency Percentile Cards */}
              <div className="grid grid-cols-2 screen-sm:grid-cols-4 gap-2">
                <div className="rounded-lg border border-[var(--divider)] p-2.5 bg-[var(--surface)]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">p50 Latency</span>
                  <span className="text-lg font-bold font-mono text-[var(--text-heading)] mt-0.5 block">
                    {selected.metricsBreakdown.p50} ms
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">Optimal threshold</span>
                </div>
                <div className="rounded-lg border border-[var(--divider)] p-2.5 bg-[var(--surface)]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">p95 Latency</span>
                  <span className="text-lg font-bold font-mono text-[var(--text-heading)] mt-0.5 block">
                    {selected.metricsBreakdown.p95} ms
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">{selected.p95Change} vs yesterday</span>
                </div>
                <div className="rounded-lg border border-[var(--divider)] p-2.5 bg-[var(--surface)]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">p99 Latency</span>
                  <span className="text-lg font-bold font-mono text-[var(--text-heading)] mt-0.5 block">
                    {selected.metricsBreakdown.p99} ms
                  </span>
                  <span className="text-[10px] text-amber-600 font-medium">Tail latency boundary</span>
                </div>
                <div className="rounded-lg border border-[var(--divider)] p-2.5 bg-[var(--surface)]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">Success Rate</span>
                  <span className="text-lg font-bold font-mono text-emerald-600 mt-0.5 block">
                    {selected.metricsBreakdown.successRate}%
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">Within error budget</span>
                </div>
              </div>

              {/* Telemetry charts */}
              <div className="grid grid-cols-1 screen-sm:grid-cols-2 gap-2.5 mt-1">
                <div className="rounded-xl border border-[var(--divider)] p-3">
                  <span className="text-xs font-bold text-[var(--text-heading)] block mb-1">Latency Trend</span>
                  <ResponseTimeChart series={selected.latencySeries} />
                </div>
                <div className="rounded-xl border border-[var(--divider)] p-3">
                  <span className="text-xs font-bold text-[var(--text-heading)] block mb-1">Error Rate Trend</span>
                  <ErrorRateChart series={selected.errorSeries} />
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB CONTENT 3: ENDPOINTS TAB
          ────────────────────────────────────────────────────────────── */}
          {activeTab === "endpoints" && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-[var(--divider)]">
                <div>
                  <h3 className="text-xs font-bold text-[var(--text-heading)]">Integration Endpoints ({selected.endpoints.length})</h3>
                  <p className="text-[11px] text-[var(--text-muted)]">Active routing paths, latency distribution, and volume</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDiagnosticsModalOpen(true)}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Activity size={12} />
                  <span>Test all endpoints</span>
                </button>
              </div>

              <div className="border border-[var(--divider)] rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 dark:bg-gray-800/60 border-b border-[var(--divider)] text-[var(--text-muted)] text-[11px]">
                    <tr>
                      <th className="py-2 px-3 font-semibold">Method & Endpoint</th>
                      <th className="py-2 px-2 font-semibold">Status</th>
                      <th className="py-2 px-2 font-semibold">p95</th>
                      <th className="py-2 px-2 font-semibold">Error Rate</th>
                      <th className="py-2 px-2 font-semibold">Volume</th>
                      <th className="py-2 px-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--divider)] font-mono text-[11.5px]">
                    {selected.endpoints.map((ep) => (
                      <tr key={ep.path} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                ep.method === "POST"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
                                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                              }`}
                            >
                              {ep.method}
                            </span>
                            <span className="font-medium text-[var(--text-heading)] truncate max-w-xs sm:max-w-sm">
                              {ep.path}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-sans font-medium ${statusPillClass(
                              ep.status
                            )}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(ep.status)}`} />
                            {ep.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 font-semibold text-[var(--text-heading)]">{ep.p95} ms</td>
                        <td className="py-2.5 px-2 text-[var(--text-muted)]">{ep.errorRate}</td>
                        <td className="py-2.5 px-2 text-[var(--text-muted)] font-sans">{ep.reqsPerMin}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleCopyEndpoint(ep.path)}
                            title="Copy Endpoint"
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-[var(--role-text)] cursor-pointer"
                          >
                            <Copy size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB CONTENT 4: DEPENDENT SERVICES TAB
          ────────────────────────────────────────────────────────────── */}
          {activeTab === "dependencies" && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-[var(--divider)]">
                <div>
                  <h3 className="text-xs font-bold text-[var(--text-heading)]">
                    Sahayogi Dependent Services ({selected.dependentServices.length})
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Internal microservices and product switches that rely on {selected.name}
                  </p>
                </div>
                <Link
                  href="/technical-support/health"
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span>Platform Health Telemetry</span>
                  <span>&rarr;</span>
                </Link>
              </div>

              <div className="border border-[var(--divider)] rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 dark:bg-gray-800/60 border-b border-[var(--divider)] text-[var(--text-muted)] text-[11px]">
                    <tr>
                      <th className="py-2 px-3 font-semibold">Service Name</th>
                      <th className="py-2 px-2 font-semibold">Sahayogi Product</th>
                      <th className="py-2 px-2 font-semibold">Status</th>
                      <th className="py-2 px-2 font-semibold">p95 Latency</th>
                      <th className="py-2 px-2 font-semibold">Error Rate</th>
                      <th className="py-2 px-3 font-semibold text-right">Last Health Check</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--divider)]">
                    {selected.dependentServices.map((svc) => (
                      <tr key={svc.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-[var(--text-heading)]">{svc.name}</span>
                        </td>
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-1.5">
                            <ProductIcon product={svc.product} size={14} className="rounded" />
                            <span className="font-medium text-[var(--text-heading)]">{svc.product}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium ${statusPillClass(
                              svc.status
                            )}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(svc.status)}`} />
                            {svc.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 font-mono font-semibold text-[var(--text-heading)]">{svc.p95} ms</td>
                        <td className="py-2.5 px-2 font-mono text-[var(--text-muted)]">{svc.errorRate}</td>
                        <td className="py-2.5 px-3 text-right text-[var(--text-muted)] text-[11px] font-mono">
                          {svc.lastCheck}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB CONTENT 5: WORKSPACES TAB
          ────────────────────────────────────────────────────────────── */}
          {activeTab === "workspaces" && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-[var(--divider)]">
                <div>
                  <h3 className="text-xs font-bold text-[var(--text-heading)]">
                    Workspaces Using {selected.name} ({selected.workspacesCount})
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Client workspaces actively routing transactions through this integration
                  </p>
                </div>
                <Link
                  href="/technical-support/workspaces"
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span>All Workspaces</span>
                  <span>&rarr;</span>
                </Link>
              </div>

              <div className="border border-[var(--divider)] rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 dark:bg-gray-800/60 border-b border-[var(--divider)] text-[var(--text-muted)] text-[11px]">
                    <tr>
                      <th className="py-2 px-3 font-semibold">Workspace Name</th>
                      <th className="py-2 px-2 font-semibold">Workspace ID</th>
                      <th className="py-2 px-2 font-semibold">Product</th>
                      <th className="py-2 px-2 font-semibold">Health</th>
                      <th className="py-2 px-2 font-semibold">Volume</th>
                      <th className="py-2 px-3 font-semibold text-right">Workspace 360</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--divider)]">
                    {selected.workspaces.map((ws) => (
                      <tr key={ws.wsId} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-[var(--text-heading)]">{ws.name}</span>
                        </td>
                        <td className="py-2.5 px-2 font-mono text-[var(--role-text)] text-[11px]">{ws.wsId}</td>
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-1.5">
                            <ProductIcon product={ws.product} size={14} className="rounded" />
                            <span className="font-medium text-[var(--text-heading)]">{ws.product}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium ${statusPillClass(
                              ws.status
                            )}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(ws.status)}`} />
                            {ws.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-[var(--text-muted)] font-mono text-[11px]">{ws.txVolume}</td>
                        <td className="py-2.5 px-3 text-right">
                          <Link
                            href={`/technical-support/workspaces?id=${ws.wsId}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
                          >
                            <span>Inspect 360</span>
                            <ExternalLink size={11} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              <div className="flex items-center justify-between pt-1 text-xs text-[var(--text-muted)]">
                <span>Showing 1 to {selected.workspaces.length} of {selected.workspacesCount} workspaces</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={workspacePage === 1}
                    onClick={() => setWorkspacePage((p) => Math.max(1, p - 1))}
                    className="px-2 py-1 rounded border border-[var(--divider)] disabled:opacity-40 hover:bg-[var(--search-bg)] cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="px-2 font-mono">Page {workspacePage}</span>
                  <button
                    type="button"
                    onClick={() => setWorkspacePage((p) => p + 1)}
                    className="px-2 py-1 rounded border border-[var(--divider)] hover:bg-[var(--search-bg)] cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB CONTENT 6: RECENT ISSUES TAB
          ────────────────────────────────────────────────────────────── */}
          {activeTab === "recent-issues" && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-[var(--divider)]">
                <div>
                  <h3 className="text-xs font-bold text-[var(--text-heading)]">Recent Integration Issues ({selected.recentIssues.length})</h3>
                  <p className="text-[11px] text-[var(--text-muted)]">Anomalies, provider upstream latency alerts, and gateway errors</p>
                </div>
                <Link
                  href="/technical-support/incidents"
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span>Incident Command Center</span>
                  <span>&rarr;</span>
                </Link>
              </div>

              {selected.recentIssues.length === 0 ? (
                <div className="text-center py-10 rounded-lg border border-dashed border-[var(--divider)] text-xs text-[var(--text-muted)]">
                  <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-500" />
                  <span>No recent issues or incident alerts recorded in the last 30 days.</span>
                </div>
              ) : (
                <div className="border border-[var(--divider)] rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50/80 dark:bg-gray-800/60 border-b border-[var(--divider)] text-[var(--text-muted)] text-[11px]">
                      <tr>
                        <th className="py-2 px-3 font-semibold">Timestamp</th>
                        <th className="py-2 px-2 font-semibold">Issue Summary</th>
                        <th className="py-2 px-2 font-semibold">Severity</th>
                        <th className="py-2 px-2 font-semibold">Status</th>
                        <th className="py-2 px-3 font-semibold text-right">Affected Scope</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--divider)]">
                      {selected.recentIssues.map((issue) => (
                        <tr key={issue.date} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                          <td className="py-2.5 px-3 text-[var(--text-muted)] font-mono text-[11px] whitespace-nowrap">
                            {issue.date}
                          </td>
                          <td className="py-2.5 px-2">
                            <span className="font-semibold text-[var(--text-heading)]">{issue.issue}</span>
                          </td>
                          <td className="py-2.5 px-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                issue.severity === "Critical"
                                  ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                                  : issue.severity === "High"
                                  ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                                  : issue.severity === "Medium"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                              }`}
                            >
                              {issue.severity}
                            </span>
                          </td>
                          <td className="py-2.5 px-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                issue.status === "Resolved"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                              }`}
                            >
                              {issue.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-[11px] text-[var(--text-muted)]">
                            {issue.affectedWorkspaces} workspaces
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB CONTENT 7: CONFIGURATION TAB (Safe Metadata Only)
          ────────────────────────────────────────────────────────────── */}
          {activeTab === "configuration" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between pb-1 border-b border-[var(--divider)]">
                <div>
                  <h3 className="text-xs font-bold text-[var(--text-heading)]">Integration Configuration & Security</h3>
                  <p className="text-[11px] text-[var(--text-muted)]">Safe operational parameters and cryptographic handshake metadata</p>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded">
                  <ShieldCheck size={13} />
                  <span>Masked Credentials Compliant</span>
                </div>
              </div>

              {/* Security Policy Alert */}
              <div className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 p-2.5 flex items-start gap-2 text-xs text-blue-800 dark:text-blue-300">
                <Shield size={14} className="mt-0.5 shrink-0" />
                <span>
                  <strong>Strict Security Policy:</strong> In compliance with RBI Digital Payment Guidelines & ISO-27001, private API keys, signing tokens, and credentials are cryptographically masked. Raw secret keys cannot be exported from this console.
                </span>
              </div>

              {/* Grid of Safe Config Parameters */}
              <div className="grid grid-cols-1 screen-sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg border border-[var(--divider)] bg-[var(--surface)]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">Provider & Network</span>
                  <span className="font-semibold text-[var(--text-heading)] mt-0.5 block">{selected.configuration.provider}</span>
                </div>

                <div className="p-2.5 rounded-lg border border-[var(--divider)] bg-[var(--surface)]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">Environment</span>
                  <span className="font-semibold text-emerald-600 mt-0.5 block">{selected.configuration.environment}</span>
                </div>

                <div className="p-2.5 rounded-lg border border-[var(--divider)] bg-[var(--surface)]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">Region & Hosting</span>
                  <span className="font-semibold text-[var(--text-heading)] mt-0.5 block">{selected.configuration.region}</span>
                </div>

                <div className="p-2.5 rounded-lg border border-[var(--divider)] bg-[var(--surface)]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">Primary Endpoint</span>
                  <span className="font-mono text-[11px] text-[var(--text-heading)] mt-0.5 block truncate">
                    {selected.configuration.primaryEndpoint}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-[var(--divider)] bg-[var(--surface)]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">Disaster Recovery (DR) Endpoint</span>
                  <span className="font-mono text-[11px] text-[var(--text-heading)] mt-0.5 block truncate">
                    {selected.configuration.backupEndpoint}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-[var(--divider)] bg-[var(--surface)]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">Masked Credential Token</span>
                  <span className="font-mono text-[11px] text-[var(--text-heading)] mt-0.5 block">
                    {selected.configuration.maskedCredential}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-[var(--divider)] bg-[var(--surface)]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">Credential Validation State</span>
                  <span className="font-semibold text-emerald-600 mt-0.5 block">
                    {selected.configuration.credentialStatus}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-[var(--divider)] bg-[var(--surface)]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">Last Validation Probe</span>
                  <span className="font-mono text-[11px] text-[var(--text-heading)] mt-0.5 block">
                    {selected.configuration.lastValidation}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-[var(--divider)] bg-[var(--surface)]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">TLS Cipher Suite</span>
                  <span className="font-mono text-[10.5px] text-[var(--text-heading)] mt-0.5 block truncate">
                    {selected.configuration.tlsCipher}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-[var(--divider)] bg-[var(--surface)]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">Webhook Callback Secret</span>
                  <span className="font-mono text-[11px] text-[var(--text-heading)] mt-0.5 block">
                    {selected.configuration.maskedWebhookSecret}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB CONTENT 8: AUDIT TRAIL TAB
          ────────────────────────────────────────────────────────────── */}
          {activeTab === "audit" && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-[var(--divider)]">
                <div>
                  <h3 className="text-xs font-bold text-[var(--text-heading)]">Configuration & Health Audit Trail</h3>
                  <p className="text-[11px] text-[var(--text-muted)]">Immutable change log and operator interventions</p>
                </div>
              </div>

              <div className="border border-[var(--divider)] rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 dark:bg-gray-800/60 border-b border-[var(--divider)] text-[var(--text-muted)] text-[11px]">
                    <tr>
                      <th className="py-2 px-3 font-semibold">Timestamp</th>
                      <th className="py-2 px-2 font-semibold">Actor</th>
                      <th className="py-2 px-2 font-semibold">Action</th>
                      <th className="py-2 px-2 font-semibold">Result</th>
                      <th className="py-2 px-3 font-semibold text-right">Reason & Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--divider)]">
                    {selected.auditTrail.map((audit) => (
                      <tr key={audit.reference} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--text-muted)] whitespace-nowrap">
                          {audit.time}
                        </td>
                        <td className="py-2.5 px-2 font-medium text-[var(--text-heading)]">{audit.actor}</td>
                        <td className="py-2.5 px-2 font-mono text-[10.5px]">
                          <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[var(--text-heading)]">
                            {audit.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              audit.result === "Success"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                            }`}
                          >
                            {audit.result}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-[11px] text-[var(--text-muted)]">
                          <span>{audit.reason}</span>
                          <span className="font-mono text-[10px] ml-1.5 text-blue-600 font-semibold">
                            [{audit.reference}]
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          MODAL 1: CHECK INTEGRATION (Automated Live Verification Workflow)
      ────────────────────────────────────────────────────────────────── */}
      {checkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div
            className="w-full max-w-md rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
            style={{ boxShadow: "var(--card-shadow-hover)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--divider)] pb-3">
              <div className="flex items-center gap-2">
                <IntegrationIcon integration={selected.id} size={24} className="rounded" />
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-heading)]">
                    Integration Health Probe: {selected.name}
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Live endpoint connectivity, DNS, and TLS mutual validation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCheckModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-heading)] p-1 rounded"
              >
                <X size={16} />
              </button>
            </div>

            {/* Check sequence */}
            <div className="flex flex-col gap-2.5 text-xs">
              {selected.diagnosticChecks.map((chk) => (
                <div
                  key={chk.name}
                  className="flex items-start justify-between gap-3 p-2 rounded-lg border border-[var(--divider)] bg-gray-50/40 dark:bg-gray-800/20"
                >
                  <div className="flex items-start gap-2">
                    {checkRunning ? (
                      <RefreshCw size={14} className="text-blue-500 animate-spin mt-0.5 shrink-0" />
                    ) : chk.status === "pass" ? (
                      <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                    ) : (
                      <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold text-[var(--text-heading)]">{chk.name}</p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{chk.detail}</p>
                    </div>
                  </div>
                  {chk.latency && (
                    <span className="font-mono text-[11px] text-[var(--text-muted)] shrink-0">
                      {chk.latency}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Overall Summary */}
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                  Overall Status: {selected.status}
                </span>
              </div>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                Last checked: Just now
              </span>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--divider)]">
              <button
                type="button"
                onClick={handleRunCheck}
                disabled={checkRunning}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--divider)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-heading)] hover:bg-[var(--search-bg)] cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={12} className={checkRunning ? "animate-spin" : ""} />
                <span>Re-run Check</span>
              </button>
              <button
                type="button"
                onClick={() => setCheckModalOpen(false)}
                className="rounded-lg bg-[var(--accent-solid)] px-4 py-1.5 text-xs font-semibold text-white shadow-2xs hover:opacity-90 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          MODAL 2: RUN DIAGNOSTICS WORKBENCH
      ────────────────────────────────────────────────────────────────── */}
      {diagnosticsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div
            className="w-full max-w-lg rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
            style={{ boxShadow: "var(--card-shadow-hover)" }}
          >
            <div className="flex items-center justify-between border-b border-[var(--divider)] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-heading)]">
                  Diagnostics Suite · {selected.name}
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Execute safe, non-destructive diagnostic probes against external endpoints
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDiagnosticsModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-heading)] p-1 rounded"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { name: "Provider Health Check", desc: "Validate upstream gateway HTTP 200 heartbeat" },
                { name: "Endpoint Connectivity", desc: "Ping primary and DR regional switch routes" },
                { name: "DNS & Edge Validation", desc: "Verify BGP Anycast routes across Indian PoPs" },
                { name: "TLS Certificate Check", desc: "Verify handshake ciphers and expiry dates" },
                { name: "Recent Event Check", desc: "Verify webhook callback signatures & deliveries" },
                { name: "Dependency Health Check", desc: "Verify Sahayogi product microservice bridges" },
              ].map((probe) => (
                <div
                  key={probe.name}
                  className="rounded-lg border border-[var(--divider)] p-3 bg-[var(--surface)] hover:border-blue-400 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <h4 className="font-bold text-[var(--text-heading)]">{probe.name}</h4>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1">{probe.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      alert(`Diagnostic probe "${probe.name}" executed successfully against ${selected.name}. Result: Nominal.`);
                    }}
                    className="mt-3 inline-flex items-center justify-center gap-1.5 rounded bg-gray-100 dark:bg-gray-800 text-[var(--text-heading)] hover:bg-blue-50 hover:text-blue-600 px-2 py-1 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    <Play size={11} />
                    <span>Run Probe</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--divider)]">
              <Link
                href={`/technical-support/diagnostics?search=${encodeURIComponent(selected.name)}`}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>Open in Diagnostics Workbench</span>
                <span>&rarr;</span>
              </Link>
              <button
                type="button"
                onClick={() => setDiagnosticsModalOpen(false)}
                className="rounded-lg bg-[var(--accent-solid)] px-4 py-1.5 text-xs font-semibold text-white shadow-2xs hover:opacity-90 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

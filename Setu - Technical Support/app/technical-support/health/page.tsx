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
} from "lucide-react";
import ProductIcon from "@/components/shared/ProductIcon";
import IntegrationIcon from "@/components/shared/IntegrationIcon";
import FilterDropdown, { FilterDropdownOption } from "@/components/shared/FilterDropdown";
import {
  MOCK_HEALTH_SERVICES,
  HealthService,
  HealthStatus,
} from "@/lib/mock-data/health-services";

type InspectorTab =
  | "overview"
  | "metrics"
  | "dependencies"
  | "incidents"
  | "recent-issues"
  | "configuration"
  | "audit";

type SortOption = "status" | "name" | "latency" | "error-rate" | "uptime";

const SORT_OPTIONS: { id: SortOption; label: string; sub: string }[] = [
  { id: "status", label: "Health Status", sub: "Degraded & Down first" },
  { id: "latency", label: "Response Time", sub: "Highest latency first" },
  { id: "error-rate", label: "Error Rate", sub: "Highest errors first" },
  { id: "uptime", label: "Lowest Uptime", sub: "SLA risk prioritized" },
  { id: "name", label: "Service Name", sub: "Alphabetical A-Z" },
];

function statusPillClass(status: HealthStatus) {
  if (status === "Down") {
    return "bg-[var(--status-critical-bg)] text-[var(--status-critical-fg)] border border-[var(--status-critical-fg)]/25";
  }
  if (status === "Degraded") {
    return "bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)] border border-[var(--status-warning-fg)]/25";
  }
  return "bg-[var(--status-healthy-bg)] text-[var(--status-healthy-fg)] border border-[var(--status-healthy-fg)]/25";
}

function statusDotClass(status: HealthStatus) {
  if (status === "Down") return "bg-[var(--status-critical-fg)]";
  if (status === "Degraded") return "bg-[var(--status-warning-fg)]";
  return "bg-[var(--status-healthy-fg)]";
}

// Sparkline SVG component
function Sparkline({
  data,
  status,
  className = "",
}: {
  data: number[];
  status: HealthStatus;
  className?: string;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const width = 72;
  const height = 18;

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
      ? "#F59E0B"
      : "#10B981";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-16 h-4 select-none ${className}`}
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

// Detailed Telemetry SVG Chart for Latency
function LatencyTelemetryChart({
  data,
}: {
  data: Array<{ time: string; p95: number }>;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const width = 360;
  const height = 120;
  const paddingLeft = 36;
  const paddingRight = 12;
  const paddingTop = 12;
  const paddingBottom = 22;

  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;
  const maxVal = 2000; // 2.0s scale

  const coords = data.map((d, i) => {
    const x = paddingLeft + (i / (data.length - 1)) * plotWidth;
    const y = paddingTop + plotHeight - (Math.min(d.p95, maxVal) / maxVal) * plotHeight;
    return { x, y, ...d };
  });

  const pathD = coords.reduce((acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x},${pt.y}`, "");
  const areaD = `${pathD} L ${coords[coords.length - 1].x},${paddingTop + plotHeight} L ${coords[0].x},${paddingTop + plotHeight} Z`;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28 overflow-visible">
        <defs>
          <linearGradient id="latencyAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
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
                className="fill-[var(--text-muted)] text-[8.5px] font-mono font-medium"
              >
                {val === 2000 ? "2.0 s" : val === 1000 ? "1.0 s" : "0 ms"}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill="url(#latencyAreaGrad)" />

        {/* Curve line */}
        <path
          d={pathD}
          fill="none"
          stroke="#EF4444"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* X-axis labels and interaction points */}
        {coords.map((pt, i) => (
          <g key={pt.time} onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)}>
            <text
              x={pt.x}
              y={height - 4}
              textAnchor="middle"
              className="fill-[var(--text-muted)] text-[8.5px] font-mono"
            >
              {pt.time}
            </text>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoverIndex === i ? 4 : 2.5}
              fill="#EF4444"
              stroke="var(--surface)"
              strokeWidth="1.5"
              className="cursor-pointer transition-all"
            />
          </g>
        ))}
      </svg>

      {hoverIndex !== null && (
        <div
          className="absolute -top-6 rounded-md bg-[var(--sidebar-active)] text-white px-2 py-0.5 text-[10px] font-mono shadow-md pointer-events-none -translate-x-1/2"
          style={{ left: `${(coords[hoverIndex].x / width) * 100}%` }}
        >
          {coords[hoverIndex].p95} ms @ {coords[hoverIndex].time}
        </div>
      )}
    </div>
  );
}

// Detailed Telemetry SVG Chart for Error Rate
function ErrorRateTelemetryChart({
  data,
}: {
  data: Array<{ time: string; rate: number }>;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const width = 360;
  const height = 120;
  const paddingLeft = 32;
  const paddingRight = 12;
  const paddingTop = 12;
  const paddingBottom = 22;

  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;
  const maxVal = 5.0; // 5% scale

  const coords = data.map((d, i) => {
    const x = paddingLeft + (i / (data.length - 1)) * plotWidth;
    const y = paddingTop + plotHeight - (Math.min(d.rate, maxVal) / maxVal) * plotHeight;
    return { x, y, ...d };
  });

  const pathD = coords.reduce((acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x},${pt.y}`, "");
  const areaD = `${pathD} L ${coords[coords.length - 1].x},${paddingTop + plotHeight} L ${coords[0].x},${paddingTop + plotHeight} Z`;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28 overflow-visible">
        <defs>
          <linearGradient id="errorAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 2.5, 5.0].map((val) => {
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
                className="fill-[var(--text-muted)] text-[8.5px] font-mono font-medium"
              >
                {val === 5.0 ? "5%" : val === 2.5 ? "2.5%" : "0%"}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill="url(#errorAreaGrad)" />

        {/* Curve line */}
        <path
          d={pathD}
          fill="none"
          stroke="#EF4444"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* X-axis labels and points */}
        {coords.map((pt, i) => (
          <g key={pt.time} onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)}>
            <text
              x={pt.x}
              y={height - 4}
              textAnchor="middle"
              className="fill-[var(--text-muted)] text-[8.5px] font-mono"
            >
              {pt.time}
            </text>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoverIndex === i ? 4 : 2.5}
              fill="#EF4444"
              stroke="var(--surface)"
              strokeWidth="1.5"
              className="cursor-pointer transition-all"
            />
          </g>
        ))}
      </svg>

      {hoverIndex !== null && (
        <div
          className="absolute -top-6 rounded-md bg-[var(--sidebar-active)] text-white px-2 py-0.5 text-[10px] font-mono shadow-md pointer-events-none -translate-x-1/2"
          style={{ left: `${(coords[hoverIndex].x / width) * 100}%` }}
        >
          {coords[hoverIndex].rate}% error @ {coords[hoverIndex].time}
        </div>
      )}
    </div>
  );
}

function HealthPageContent() {
  const searchParams = useSearchParams();
  const initialServiceId = searchParams.get("service") || "svc-whatsapp-gateway";

  const [services] = useState<HealthService[]>(MOCK_HEALTH_SERVICES);
  const [selectedId, setSelectedId] = useState<string>(initialServiceId);
  const [activeTab, setActiveTab] = useState<InspectorTab>("overview");

  // Filters
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [envFilter, setEnvFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("status");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [timeRange, setTimeRange] = useState("Last 1 hour");

  // Derived filter options
  const allProducts = useMemo(
    () => Array.from(new Set(services.map((s) => s.product))).sort(),
    [services]
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
      ...services.map((s) => ({ value: s.id, label: s.name })),
    ],
    [services]
  );

  const statusOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Statuses", sub: "All health classifications" },
    { value: "Healthy", label: "Healthy", sub: "Operational within SLA" },
    { value: "Degraded", label: "Degraded", sub: "Elevated latency / SLA risk" },
    { value: "Down", label: "Down", sub: "Major outage / upstream failure" },
  ];

  const envOptions: FilterDropdownOption[] = [
    { value: "all", label: "All Environments", sub: "All deployment targets" },
    { value: "Production", label: "Production", sub: "Live customer traffic" },
    { value: "Staging", label: "Staging", sub: "Pre-release sandbox" },
  ];

  // Filtered and sorted services
  const filteredServices = useMemo(() => {
    const list = services.filter((svc) => {
      const q = search.toLowerCase().trim();
      if (q) {
        const haystack = [
          svc.name,
          svc.product,
          svc.provider,
          svc.primaryEndpoint,
          svc.scope,
          svc.description,
          svc.serviceType,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (serviceFilter !== "all" && svc.id !== serviceFilter) return false;
      if (productFilter !== "all" && svc.product !== productFilter) return false;
      if (envFilter !== "all" && svc.environment !== envFilter) return false;
      if (statusFilter !== "all" && svc.status !== statusFilter) return false;
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === "status") {
        const order: Record<HealthStatus, number> = { Down: 0, Degraded: 1, Healthy: 2 };
        return order[a.status] - order[b.status];
      }
      if (sortBy === "latency") return b.responseTimeMs - a.responseTimeMs;
      if (sortBy === "error-rate") return b.errorRate - a.errorRate;
      if (sortBy === "uptime") return a.currentUptime - b.currentUptime;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [services, search, serviceFilter, productFilter, envFilter, statusFilter, sortBy]);

  // Selected service
  const selectedService = useMemo(() => {
    return (
      filteredServices.find((s) => s.id === selectedId) ??
      filteredServices[0] ??
      services[0]
    );
  }, [filteredServices, selectedId, services]);

  return (
    <div className="flex flex-col min-h-full text-[var(--text-heading)] -mt-2 -mx-1 sm:-mx-2 pb-16 screen-sm:pb-8">
      {/* ─────────────────────────────────────────────────────────────────
          SECTION 3: PAGE HEADER
          Platform & Microservice Telemetry
          Subtitle: Real-time infrastructure health, uptime tracking, and upstream dependency health
          Top-right status pill: ● 99.98% System Uptime
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
              Platform & Microservice Telemetry
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Real-time infrastructure health, uptime tracking, and upstream dependency health
            </p>
          </div>
        </div>

        {/* Top-Right System Uptime Pill */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--status-healthy-bg)] px-3 py-1 text-xs font-semibold text-[var(--status-healthy-fg)] border border-[var(--status-healthy-fg)]/20 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-[var(--status-healthy-fg)] animate-pulse" />
            99.98% System Uptime
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 4: KPI ROW
          Total Services: 28 (↑ 4%)
          Healthy: 24 (↑ 9%)
          Degraded: 3 (↓ 25%)
          Down: 1 (↓ 50%)
          Avg Response Time: 236 ms (↓ 12%)
          Active Incidents: 2 (↑ 100%)
      ────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 screen-sm:grid-cols-3 screen-lg:grid-cols-6 lg:grid-cols-6 gap-2 sm:gap-2.5 lg:gap-3 px-1 sm:px-2 mb-3">
        {/* 1. Total Services */}
        <div
          className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Total Services</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--text-heading)] leading-none">28</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-up-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-up-fg)]">
              &uarr; 4%
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
            <span className="text-lg sm:text-xl font-bold text-[var(--status-healthy-fg)] leading-none">24</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-up-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-up-fg)]">
              &uarr; 9%
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
            <span className="text-lg sm:text-xl font-bold text-amber-600 leading-none">3</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-down-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-down-fg)]">
              &darr; 25%
            </span>
          </div>
        </button>

        {/* 4. Down */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "Down" ? "all" : "Down")}
          className={`bg-[var(--surface)] rounded-xl border p-2.5 sm:p-3 text-left transition-all cursor-pointer ${
            statusFilter === "Down"
              ? "border-[var(--status-critical-fg)] ring-2 ring-[var(--status-critical-fg)]/20"
              : "border-[var(--card-border)] hover:border-[var(--divider)]"
          }`}
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Down</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--kpi-bad)] leading-none">1</span>
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
            <span className="text-lg sm:text-xl font-bold text-[var(--text-heading)] leading-none">236 ms</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-up-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-up-fg)]">
              &darr; 12%
            </span>
          </div>
        </div>

        {/* 6. Active Incidents */}
        <Link
          href="/technical-support/incidents"
          title="View Active Incidents"
          className="group flex flex-col justify-between bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3 transition-all hover:border-[var(--sidebar-active)] cursor-pointer"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Active Incidents</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--status-critical-fg)] leading-none">2</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-down-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-down-fg)]">
              &uarr; 100%
            </span>
          </div>
        </Link>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 5: SEARCH + FILTER BAR
          Search services, endpoints, hosts, environments...
          Filters: All Services, All Environments, All Statuses, All Products, More Filters
      ────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 px-1 sm:px-2 mb-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--search-placeholder)]" />
          <input
            type="text"
            placeholder="Search services, endpoints, hosts, environments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--divider)] bg-[var(--surface)] py-1.5 sm:py-2 pl-9 pr-3 text-xs text-[var(--text-heading)] placeholder:text-[var(--search-placeholder)] shadow-xs outline-none focus:border-[var(--sidebar-active)]"
          />
        </div>

        {/* Filter Cluster */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
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
              { label: "Only Degraded", action: () => setStatusFilter("Degraded") },
              { label: "Only Down", action: () => setStatusFilter("Down") },
              { label: "Product: Chat with Sahayogi", action: () => setProductFilter("Chat with Sahayogi") },
              { label: "Product: BoSS", action: () => setProductFilter("BoSS") },
              { label: "Product: Sahayogi Cloud", action: () => setProductFilter("Sahayogi Cloud") },
              { label: "High Latency (> 500ms)", action: () => setSearch("840") },
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
                setServiceFilter("all");
                setEnvFilter("all");
                setStatusFilter("all");
                setProductFilter("all");
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
          LEFT: Services list (28)
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
                Real-time health status of platform services and critical integrations
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
              <div className="flex flex-col items-center justify-center py-16 text-center text-xs text-[var(--text-muted)]">
                <Activity size={24} className="mb-2 text-[var(--text-muted)]/50" />
                <p className="font-semibold text-[var(--text-heading)]">No services found</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">Try modifying your search or filter options</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setServiceFilter("all");
                    setEnvFilter("all");
                    setStatusFilter("all");
                    setProductFilter("all");
                  }}
                  className="mt-3 text-[var(--sidebar-active)] font-semibold hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              filteredServices.map((svc) => {
                const isSelected = svc.id === selectedService.id;

                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(svc.id);
                      setActiveTab("overview");
                    }}
                    className={`group relative flex w-full items-center justify-between rounded-xl p-2.5 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[var(--icon-chip-bg)] border border-[var(--sidebar-active)]/40 shadow-2xs"
                        : "border border-transparent hover:bg-[var(--search-bg)]"
                    }`}
                  >
                    {/* Active blue left bar indicator */}
                    {isSelected && (
                      <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-[var(--sidebar-active)] rounded-r" />
                    )}

                    <div className="flex items-center gap-2.5 min-w-0 flex-1 pl-1">
                      {/* Product Brand Icon (STRICT RULE: SAHAYOGI PRODUCT ICON ONLY) */}
                      <div className="shrink-0">
                        <ProductIcon product={svc.product} size={22} />
                      </div>

                      {/* Service Name & Subtitle */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-[var(--text-heading)] leading-tight">
                          {svc.name}
                        </p>
                        <p className="truncate text-[11px] text-[var(--text-muted)] leading-tight mt-0.5">
                          {svc.product} &middot; {svc.scope}
                        </p>
                      </div>

                      {/* Response Time */}
                      <div className="shrink-0 text-left w-18 hidden sm:block">
                        <span className="text-[9.5px] uppercase font-medium text-[var(--text-muted)] block leading-none">
                          Response Time
                        </span>
                        <span className="font-mono text-[11px] font-bold text-[var(--text-heading)] leading-tight mt-0.5 block">
                          {svc.responseTimeMs} ms
                        </span>
                      </div>

                      {/* Error Rate */}
                      <div className="shrink-0 text-left w-16 hidden sm:block">
                        <span className="text-[9.5px] uppercase font-medium text-[var(--text-muted)] block leading-none">
                          Error Rate
                        </span>
                        <span
                          className={`font-mono text-[11px] font-bold leading-tight mt-0.5 block ${
                            svc.errorRate >= 1.0
                              ? "text-[var(--status-critical-fg)]"
                              : svc.errorRate > 0.1
                              ? "text-amber-600"
                              : "text-[var(--text-secondary)]"
                          }`}
                        >
                          {svc.errorRate.toFixed(2)}%
                        </span>
                      </div>

                      {/* Sparkline Wave */}
                      <div className="shrink-0 hidden md:block pl-1">
                        <Sparkline data={svc.sparkline} status={svc.status} />
                      </div>

                      {/* Status Pill */}
                      <div className="shrink-0 pl-1">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-bold ${statusPillClass(
                            svc.status
                          )}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(svc.status)}`} />
                          {svc.status}
                        </span>
                      </div>
                    </div>

                    {/* Chevron */}
                    <div className="shrink-0 pl-2">
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

        {/* ── RIGHT PANEL: SELECTED SERVICE HEALTH INSPECTOR (50%) ────── */}
        <div
          className="flex-1 min-w-0 bg-[var(--surface)] rounded-2xl border border-[var(--card-border)] shadow-xs flex flex-col p-3.5 sm:p-5 overflow-hidden lg:h-[calc(100dvh-17rem)]"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          {selectedService ? (
            <div className="flex flex-col h-full overflow-y-auto">
              {/* ─────────────────────────────────────────────────────────
                  SECTION 11: RIGHT PANEL HEADER
                  Top bar: Status pill, p95, error rate | Last 1 hour ▾ | View Logs → | Run Diagnostics
                  Title, Subtitle, Description, SLA Target & Current Uptime
              ────────────────────────────────────────────────────────── */}
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
                    p95 {selectedService.responseTimeMs} ms
                  </span>
                  <span className="text-[var(--text-muted)] text-[11px]">&middot;</span>
                  <span className="font-mono text-xs font-semibold text-[var(--text-secondary)]">
                    {selectedService.errorRate.toFixed(2)}% error rate
                  </span>
                </div>

                {/* Right-side quick controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-xl border border-[var(--divider)] bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--search-bg)] transition-colors cursor-pointer"
                  >
                    <span>{timeRange}</span>
                    <ChevronDown size={12} />
                  </button>

                  <Link
                    href={`/technical-support/api-logs?product=${encodeURIComponent(
                      selectedService.product
                    )}&service=${encodeURIComponent(selectedService.name)}`}
                    className="flex items-center gap-1 rounded-xl border border-[var(--divider)] bg-[var(--surface)] px-2.5 py-1 text-xs font-semibold text-[var(--sidebar-active)] hover:bg-[var(--search-bg)] transition-colors shadow-2xs"
                  >
                    <span>View Logs</span>
                    <ArrowRight size={11} />
                  </Link>

                  <Link
                    href={`/technical-support/diagnostics?service=${selectedService.id}&target=${selectedService.scope}`}
                    className="flex items-center gap-1.5 rounded-xl bg-[var(--accent-solid)] px-3 py-1 text-xs font-bold text-white shadow-xs hover:brightness-110 transition-colors"
                  >
                    <Play size={11} className="fill-white" />
                    <span>Run Diagnostics</span>
                  </Link>
                </div>
              </div>

              {/* Service Identity & SLA Target */}
              <div className="flex flex-wrap items-start justify-between gap-3 pt-3 pb-2">
                <div className="flex items-start gap-3 min-w-0">
                  <ProductIcon product={selectedService.product} size={28} className="mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-bold text-[var(--text-heading)] leading-tight">
                      {selectedService.name}
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {selectedService.product} &middot; {selectedService.serviceType}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                      {selectedService.description}
                    </p>
                  </div>
                </div>

                {/* Top-Right SLA & Current Uptime */}
                <div className="flex items-center gap-4 shrink-0 text-right">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                      SLA Target
                    </span>
                    <span className="font-mono text-sm font-bold text-[var(--text-heading)] block mt-0.5">
                      {selectedService.slaTarget}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                      Current Uptime
                    </span>
                    <span
                      className={`font-mono text-sm font-bold block mt-0.5 ${
                        selectedService.currentUptime < selectedService.slaTarget
                          ? "text-[var(--status-critical-fg)]"
                          : "text-[var(--status-healthy-fg)]"
                      }`}
                    >
                      {selectedService.currentUptime}%
                    </span>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────
                  SECTION 12: SERVICE INSPECTOR TABS
                  Overview | Metrics | Dependencies | Incidents (2) | Recent Issues | Configuration | Audit Trail
              ────────────────────────────────────────────────────────── */}
              <div className="flex items-center gap-5 sm:gap-6 border-b border-[var(--divider)] text-xs font-semibold overflow-x-auto mt-2">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "metrics", label: "Metrics" },
                  { id: "dependencies", label: "Dependencies" },
                  {
                    id: "incidents",
                    label: `Incidents${selectedService.incidents.length > 0 ? ` (${selectedService.incidents.length})` : ""}`,
                  },
                  { id: "recent-issues", label: "Recent Issues" },
                  { id: "configuration", label: "Configuration" },
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
                    {/* SECTION 13: 8 COMPACT CONTEXT CARDS */}
                    <div className="grid grid-cols-2 screen-sm:grid-cols-4 gap-2.5">
                      {/* Product */}
                      <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          <ProductIcon product={selectedService.product} size={13} />
                          Product
                        </div>
                        <p className="mt-1 text-xs font-bold text-[var(--text-heading)] truncate">
                          {selectedService.product}
                        </p>
                      </div>

                      {/* Service Type */}
                      <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          <Layers size={13} />
                          Service Type
                        </div>
                        <p className="mt-1 text-xs font-bold text-[var(--text-heading)] truncate">
                          {selectedService.serviceType}
                        </p>
                      </div>

                      {/* Environment */}
                      <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          <Globe size={13} />
                          Environment
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-healthy-fg)]" />
                          <p className="text-xs font-bold text-[var(--text-heading)] truncate">
                            {selectedService.environment}
                          </p>
                        </div>
                      </div>

                      {/* Workspace Scope */}
                      <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          <Building2 size={13} />
                          Workspace Scope
                        </div>
                        <p className="mt-1 text-xs font-bold text-[var(--text-heading)] truncate">
                          {selectedService.scope}
                        </p>
                      </div>

                      {/* Primary Endpoint */}
                      <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          <Terminal size={13} />
                          Primary Endpoint
                        </div>
                        <p className="mt-1 font-mono text-[11px] font-bold text-[var(--text-heading)] truncate">
                          {selectedService.primaryEndpoint}
                        </p>
                      </div>

                      {/* Region */}
                      <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          <MapPin size={13} />
                          Region
                        </div>
                        <p className="mt-1 text-xs font-bold text-[var(--text-heading)] truncate">
                          {selectedService.region}
                        </p>
                      </div>

                      {/* Provider (UNDERLYING PROVIDER ICON VIA INTEGRATIONICON) */}
                      <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          <IntegrationIcon integration={selectedService.provider} size={13} />
                          Provider
                        </div>
                        <p className="mt-1 text-xs font-bold text-[var(--text-heading)] truncate">
                          {selectedService.provider}
                        </p>
                      </div>

                      {/* Version */}
                      <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          <Zap size={13} />
                          Version
                        </div>
                        <p className="mt-1 font-mono text-xs font-bold text-[var(--text-heading)] truncate">
                          {selectedService.version}
                        </p>
                      </div>
                    </div>

                    {/* SECTION 14: TWO SIDE-BY-SIDE TELEMETRY CHARTS */}
                    <div className="grid grid-cols-1 screen-md:grid-cols-2 gap-3">
                      {/* Left: Response Time (p95) */}
                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 shadow-2xs">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-[var(--text-heading)]">
                            Response Time (p95)
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-[var(--text-heading)]">
                              {selectedService.responseTimeMs} ms
                            </span>
                            <span className="inline-flex items-center rounded bg-red-100 text-red-700 px-1 py-0.2 text-[9.5px] font-bold">
                              &uarr; 28%
                            </span>
                          </div>
                        </div>
                        <LatencyTelemetryChart data={selectedService.metrics.responseTrendData} />
                      </div>

                      {/* Right: Error Rate */}
                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 shadow-2xs">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-[var(--text-heading)]">
                            Error Rate
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-[var(--status-critical-fg)]">
                              {selectedService.errorRate.toFixed(2)}%
                            </span>
                            <span className="inline-flex items-center rounded bg-red-100 text-red-700 px-1 py-0.2 text-[9.5px] font-bold">
                              &uarr; 120%
                            </span>
                          </div>
                        </div>
                        <ErrorRateTelemetryChart data={selectedService.metrics.errorTrendData} />
                      </div>
                    </div>

                    {/* SECTION 15: BOTTOM SERVICE SUMMARY (4 CARDS) */}
                    <div className="grid grid-cols-2 screen-sm:grid-cols-4 gap-2.5">
                      {/* 1. Incidents */}
                      <Link
                        href="/technical-support/incidents"
                        className="group bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3 hover:border-[var(--status-critical-fg)] transition-all shadow-2xs block"
                      >
                        <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-[10.5px]">
                          <AlertTriangle size={12} className="text-[var(--status-critical-fg)]" />
                          <span>Incidents</span>
                        </div>
                        <p className="mt-1.5 text-base font-bold text-[var(--text-heading)] leading-none">
                          {selectedService.incidents.length}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                          {selectedService.incidents.filter((i) => i.status === "Investigating").length} active &middot;{" "}
                          {selectedService.incidents.filter((i) => i.status === "Resolved").length} resolved
                        </p>
                        <span className="text-[10px] font-bold text-[var(--sidebar-active)] group-hover:underline mt-2 inline-block">
                          View incidents &rarr;
                        </span>
                      </Link>

                      {/* 2. Related Tickets */}
                      <Link
                        href="/technical-support/tickets"
                        className="group bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3 hover:border-[var(--sidebar-active)] transition-all shadow-2xs block"
                      >
                        <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-[10.5px]">
                          <Ticket size={12} className="text-amber-500" />
                          <span>Related Tickets</span>
                        </div>
                        <p className="mt-1.5 text-base font-bold text-[var(--text-heading)] leading-none">
                          3
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                          2 open &middot; 1 closed
                        </p>
                        <span className="text-[10px] font-bold text-[var(--sidebar-active)] group-hover:underline mt-2 inline-block">
                          View tickets &rarr;
                        </span>
                      </Link>

                      {/* 3. Uptime (30 days) */}
                      <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-[10.5px]">
                          <span className={`h-2 w-2 rounded-full ${statusDotClass(selectedService.status)}`} />
                          <span>Uptime (30 days)</span>
                        </div>
                        <p
                          className={`mt-1.5 text-base font-bold leading-none ${
                            selectedService.currentUptime < selectedService.slaTarget
                              ? "text-[var(--status-critical-fg)]"
                              : "text-[var(--status-healthy-fg)]"
                          }`}
                        >
                          {selectedService.currentUptime}%
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                          Target: {selectedService.slaTarget}%
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveTab("metrics")}
                          className="text-[10px] font-bold text-[var(--sidebar-active)] hover:underline mt-2 inline-block cursor-pointer"
                        >
                          View history &rarr;
                        </button>
                      </div>

                      {/* 4. Last Degradation */}
                      <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-[10.5px]">
                          <Clock size={12} />
                          <span>Last Degradation</span>
                        </div>
                        <p className="mt-1.5 text-xs font-bold text-[var(--text-heading)] leading-none truncate">
                          {selectedService.lastDegradation.timestamp}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                          Duration: {selectedService.lastDegradation.duration}
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveTab("recent-issues")}
                          className="text-[10px] font-bold text-[var(--sidebar-active)] hover:underline mt-2 inline-block cursor-pointer"
                        >
                          View timeline &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 2: METRICS ──────────────────────────────────── */}
                {activeTab === "metrics" && (
                  <div className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-2 screen-sm:grid-cols-4 gap-2.5">
                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3">
                        <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">p50 Latency</span>
                        <span className="font-mono text-base font-bold text-[var(--text-heading)] mt-1 block">
                          {selectedService.metrics.p50Ms} ms
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">Median request turnaround</span>
                      </div>

                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3">
                        <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">p90 Latency</span>
                        <span className="font-mono text-base font-bold text-[var(--text-heading)] mt-1 block">
                          {selectedService.metrics.p90Ms} ms
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">90th percentile</span>
                      </div>

                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3">
                        <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">p95 Latency</span>
                        <span className="font-mono text-base font-bold text-amber-600 mt-1 block">
                          {selectedService.metrics.p95Ms} ms
                        </span>
                        <span className="text-[10px] text-amber-700">Elevated threshold</span>
                      </div>

                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3">
                        <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">p99 Latency</span>
                        <span className="font-mono text-base font-bold text-[var(--status-critical-fg)] mt-1 block">
                          {selectedService.metrics.p99Ms} ms
                        </span>
                        <span className="text-[10px] text-[var(--status-critical-fg)]">Outlier latency ceiling</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3.5 space-y-3">
                      <h4 className="font-bold text-[var(--text-heading)]">Availability & SLA Budget Breakdown</h4>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-lg bg-[var(--surface-muted)] p-2.5">
                          <span className="text-[10px] uppercase text-[var(--text-muted)] block">Last 24 Hours</span>
                          <span className="font-mono text-base font-bold text-[var(--text-heading)] mt-0.5 block">
                            {selectedService.metrics.uptime24h}%
                          </span>
                          <span className="text-[10px] text-[var(--status-critical-fg)]">SLA deficit (-1.5%)</span>
                        </div>
                        <div className="rounded-lg bg-[var(--surface-muted)] p-2.5">
                          <span className="text-[10px] uppercase text-[var(--text-muted)] block">Last 7 Days</span>
                          <span className="font-mono text-base font-bold text-[var(--text-heading)] mt-0.5 block">
                            {selectedService.metrics.uptime7d}%
                          </span>
                          <span className="text-[10px] text-[var(--status-healthy-fg)]">Within budget</span>
                        </div>
                        <div className="rounded-lg bg-[var(--surface-muted)] p-2.5">
                          <span className="text-[10px] uppercase text-[var(--text-muted)] block">Last 30 Days</span>
                          <span className="font-mono text-base font-bold text-[var(--text-heading)] mt-0.5 block">
                            {selectedService.metrics.uptime30d}%
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)]">Target: {selectedService.slaTarget}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 3: DEPENDENCIES (SECTION 18) ────────────────── */}
                {activeTab === "dependencies" && (
                  <div className="space-y-3 text-xs">
                    <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface-muted)] p-2.5 text-xs text-[var(--text-muted)]">
                      <strong className="text-[var(--text-heading)]">Upstream & Downstream Health:</strong> Verify whether service failure originates from local code execution or third-party upstream dependencies.
                    </div>

                    <div className="space-y-2">
                      {selectedService.dependencies.map((dep, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${statusDotClass(dep.status)}`} />
                            <div>
                              <p className="font-bold text-[var(--text-heading)]">{dep.name}</p>
                              <p className="text-[10.5px] text-[var(--text-muted)]">
                                Type: {dep.type} &middot; Last Checked: {dep.lastChecked}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-right shrink-0">
                            <div>
                              <span className="text-[10px] text-[var(--text-muted)] block">Latency</span>
                              <span className="font-mono font-bold text-[var(--text-heading)] text-xs">
                                {dep.latencyMs} ms
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] text-[var(--text-muted)] block">Error Rate</span>
                              <span className="font-mono font-bold text-xs text-[var(--text-secondary)]">
                                {dep.errorRate}
                              </span>
                            </div>

                            <span
                              className={`rounded px-2 py-0.5 font-bold text-[10px] ${statusPillClass(
                                dep.status
                              )}`}
                            >
                              {dep.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── TAB 4: INCIDENTS (SECTION 19) ───────────────────── */}
                {activeTab === "incidents" && (
                  <div className="space-y-3 text-xs">
                    {selectedService.incidents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-[var(--text-muted)]">
                        <CheckCircle2 size={24} className="mb-2 text-emerald-500" />
                        <p className="font-bold text-[var(--text-heading)]">No incidents recorded</p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">All operating within normal SLAs</p>
                      </div>
                    ) : (
                      selectedService.incidents.map((inc) => (
                        <div
                          key={inc.id}
                          className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3.5 shadow-2xs space-y-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--divider)] pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-[var(--status-critical-fg)]">
                                {inc.id}
                              </span>
                              <span className="font-bold text-[var(--text-heading)]">{inc.title}</span>
                            </div>
                            <span
                              className={`rounded px-2 py-0.5 font-bold text-[10px] ${
                                inc.status === "Investigating"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {inc.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 screen-sm:grid-cols-4 gap-2 text-[11px]">
                            <div>
                              <span className="text-[10px] text-[var(--text-muted)] uppercase block">Severity</span>
                              <span className="font-bold text-[var(--status-critical-fg)]">{inc.severity}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-[var(--text-muted)] uppercase block">Started</span>
                              <span className="font-medium text-[var(--text-secondary)]">{inc.startedAt}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-[var(--text-muted)] uppercase block">Impact</span>
                              <span className="font-semibold text-[var(--text-heading)]">
                                {inc.affectedWorkspaces} workspace
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-[var(--text-muted)] uppercase block">Action</span>
                              <Link
                                href={`/technical-support/incidents?id=${inc.id}`}
                                className="font-bold text-[var(--sidebar-active)] hover:underline inline-flex items-center gap-1"
                              >
                                <span>View Incident</span>
                                <ArrowRight size={10} />
                              </Link>
                            </div>
                          </div>

                          <div className="rounded-lg bg-[var(--surface-muted)] p-2 text-[11px]">
                            <span className="font-semibold text-[var(--text-muted)]">Root Cause: </span>
                            <span className="text-[var(--text-secondary)]">{inc.rootCause}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ── TAB 5: RECENT ISSUES (SECTION 20) ────────────────── */}
                {activeTab === "recent-issues" && (
                  <div className="space-y-2.5 text-xs">
                    {selectedService.recentIssues.map((issue, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 shadow-2xs"
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black mt-0.5 ${
                              issue.severity === "critical"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            !
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-semibold text-[var(--text-muted)]">
                                {issue.timestamp}
                              </span>
                              <span className="font-bold text-[var(--text-heading)]">{issue.title}</span>
                              {issue.occurrences && (
                                <span className="rounded bg-[var(--surface-muted)] px-1.5 py-0.2 text-[10px] font-semibold text-[var(--text-secondary)]">
                                  {issue.occurrences} occurrences
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{issue.detail}</p>
                          </div>
                        </div>

                        {issue.linkHref && (
                          <Link
                            href={issue.linkHref}
                            className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-[var(--sidebar-active)] hover:underline pt-0.5"
                          >
                            <span>Investigate</span>
                            <ExternalLink size={11} />
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ── TAB 6: CONFIGURATION (SECTION 21) ───────────────── */}
                {activeTab === "configuration" && (
                  <div className="space-y-3 text-xs">
                    <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface-muted)] p-2.5 text-xs text-[var(--text-muted)] flex items-center gap-2">
                      <ShieldCheck size={16} className="text-[var(--sidebar-active)] shrink-0" />
                      <span>
                        Safe masked metadata view. Cryptographic secrets, access tokens, and private keys are never exposed in this console.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3">
                        <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">Webhook Endpoint</span>
                        <p className="font-mono font-bold text-[var(--text-heading)] text-xs mt-1">
                          {selectedService.configuration.webhookEndpoint}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3">
                        <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">Provider Keystore</span>
                        <p className="font-bold text-[var(--text-heading)] text-xs mt-1">
                          {selectedService.configuration.provider}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3">
                        <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">Credential Reference</span>
                        <p className="font-mono font-bold text-[var(--text-heading)] text-xs mt-1">
                          {selectedService.configuration.credentialMask}
                        </p>
                        <span className="rounded bg-red-100 text-red-700 text-[10px] font-semibold px-1.5 py-0.2 mt-1 inline-block">
                          {selectedService.configuration.credentialStatus}
                        </span>
                      </div>

                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3">
                        <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">Last Configuration Update</span>
                        <p className="font-semibold text-[var(--text-heading)] text-xs mt-1">
                          {selectedService.configuration.lastChanged}
                        </p>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          By: {selectedService.configuration.changedBy}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 7: AUDIT TRAIL (SECTION 22) ─────────────────── */}
                {activeTab === "audit" && (
                  <div className="space-y-2 text-xs">
                    {selectedService.auditTrail.map((audit, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono text-[10.5px] font-semibold text-[var(--text-muted)]">
                            {audit.timestamp}
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

                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                            audit.result === "Success"
                              ? "bg-[var(--status-healthy-bg)] text-[var(--status-healthy-fg)]"
                              : "bg-[var(--status-critical-bg)] text-[var(--status-critical-fg)]"
                          }`}
                        >
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
              Select a service from the list to inspect telemetry
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PlatformHealthPage() {
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

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Network,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Send,
  RefreshCw,
  Search,
  Filter,
  X,
  ExternalLink,
  ArrowUpRight,
  Clock,
  Layers,
  Activity,
  Zap,
  Sliders,
  Check,
  Copy,
  Radio,
  RotateCcw,
  BarChart2,
  ShieldCheck,
  Server,
  AlertCircle
} from "lucide-react";
import Card from "@/components/shared/Card";
import StatusBadge from "@/components/shared/StatusBadge";
import FilterDropdown from "@/components/shared/FilterDropdown";
import ProviderLogo from "@/components/shared/ProviderLogo";
import { sreIntegrations, type SreIntegration } from "@/lib/mock-data/devops-sre";
import { triggerRefresh } from "@/lib/events/refresh";

type IntegrationTab =
  | "overview"
  | "telemetry"
  | "quotas"
  | "circuit-breaker"
  | "webhooks"
  | "blast-radius"
  | "audit";

interface ExtendedIntegration extends SreIntegration {
  circuitBreaker: "Closed (Normal)" | "Half-Open (Testing)" | "Open (Tripped)";
  circuitBreakerLevel: "healthy" | "warning" | "critical";
  p95Latency: string;
  errorRate: string;
  dlqDepth: number;
  ingressPop: string;
  protocol: string;
  activeTps: number;
  maxTps: number;
}

const extendedIntegrationsMap: Record<string, Partial<ExtendedIntegration>> = {
  "INT-UPI": {
    circuitBreaker: "Closed (Normal)",
    circuitBreakerLevel: "healthy",
    p95Latency: "18ms",
    errorRate: "0.01%",
    dlqDepth: 0,
    ingressPop: "POP-BOM-01 (Direct Fiber)",
    protocol: "ISO 8583 / HTTPS REST",
    activeTps: 1840,
    maxTps: 5000
  },
  "INT-META": {
    circuitBreaker: "Open (Tripped)",
    circuitBreakerLevel: "critical",
    p95Latency: "840ms",
    errorRate: "4.80%",
    dlqDepth: 420,
    ingressPop: "Edge Ingress Meta Global (Singapore/Mumbai)",
    protocol: "Graph API v19.0 / Webhooks",
    activeTps: 420,
    maxTps: 1000
  },
  "INT-BBPS": {
    circuitBreaker: "Closed (Normal)",
    circuitBreakerLevel: "healthy",
    p95Latency: "32ms",
    errorRate: "0.04%",
    dlqDepth: 2,
    ingressPop: "POP-DEL-02 (NPCI Central)",
    protocol: "XML / MTLS REST Gateway",
    activeTps: 620,
    maxTps: 2000
  },
  "INT-GSTN": {
    circuitBreaker: "Half-Open (Testing)",
    circuitBreakerLevel: "warning",
    p95Latency: "420ms",
    errorRate: "0.42%",
    dlqDepth: 38,
    ingressPop: "NIC E-Way Gateway Rail",
    protocol: "JSON REST via GSP Tunnel",
    activeTps: 180,
    maxTps: 200
  },
  "INT-UIDAI": {
    circuitBreaker: "Closed (Normal)",
    circuitBreakerLevel: "healthy",
    p95Latency: "36ms",
    errorRate: "0.02%",
    dlqDepth: 0,
    ingressPop: "UIDAI CIDR Leased Line",
    protocol: "KMS Signed XML / REST",
    activeTps: 290,
    maxTps: 1000
  }
};

function statusPillClass(status: "Connected" | "Degraded" | "Failed") {
  if (status === "Connected") return "bg-emerald-50 text-emerald-800 border border-emerald-200";
  if (status === "Degraded") return "bg-amber-50 text-amber-800 border border-amber-200";
  return "bg-rose-50 text-rose-800 border border-rose-200";
}

function statusDotClass(status: "Connected" | "Degraded" | "Failed") {
  if (status === "Connected") return "bg-emerald-500";
  if (status === "Degraded") return "bg-amber-500 animate-pulse";
  return "bg-rose-500 animate-ping";
}

export default function SreIntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [breakerFilter, setBreakerFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string>("INT-META");
  const [activeTab, setActiveTab] = useState<IntegrationTab>("overview");
  const [modalIntegration, setModalIntegration] = useState<SreIntegration | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Merge full data
  const fullIntegrations: ExtendedIntegration[] = useMemo(() => {
    return sreIntegrations.map((item) => {
      const ext = extendedIntegrationsMap[item.id] || {
        circuitBreaker: "Closed (Normal)",
        circuitBreakerLevel: "healthy",
        p95Latency: "25ms",
        errorRate: "0.05%",
        dlqDepth: 0,
        ingressPop: "General Ingress Hub",
        protocol: "HTTPS REST",
        activeTps: 100,
        maxTps: 1000
      };
      return { ...item, ...ext } as ExtendedIntegration;
    });
  }, []);

  const filteredIntegrations = useMemo(() => {
    return fullIntegrations.filter((item) => {
      const matchSearch =
        searchQuery === "" ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.service.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === "all" || item.connectionState.toLowerCase() === statusFilter.toLowerCase();

      const matchBreaker =
        breakerFilter === "all" ||
        (breakerFilter === "open" && item.circuitBreaker.includes("Open")) ||
        (breakerFilter === "closed" && item.circuitBreaker.includes("Closed")) ||
        (breakerFilter === "half-open" && item.circuitBreaker.includes("Half-Open"));

      return matchSearch && matchStatus && matchBreaker;
    });
  }, [fullIntegrations, searchQuery, statusFilter, breakerFilter]);

  const selectedIntegration = useMemo(() => {
    return fullIntegrations.find((item) => item.id === selectedId) || fullIntegrations[0];
  }, [fullIntegrations, selectedId]);

  function handleRefreshTelemetry() {
    setIsRefreshing(true);
    setToastMessage("Polling upstream API gateways and webhook endpoints...");
    setTimeout(() => {
      setIsRefreshing(false);
      triggerRefresh({ source: "manual-integrations-refresh" });
      setToastMessage("Telemetry synchronized: 5 upstream rails active, 1 circuit breaker tripped.");
      setTimeout(() => setToastMessage(null), 4000);
    }, 800);
  }

  function handleRequestReconnect(integration: SreIntegration) {
    setModalIntegration(null);
    setToastMessage(
      `Governed reconnect request for "${integration.provider}" submitted to Platform Operations approval queue (REQ-REC-${Date.now().toString().slice(-4)}).`
    );
    setTimeout(() => setToastMessage(null), 5000);
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard?.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  }

  function clearAllFilters() {
    setSearchQuery("");
    setStatusFilter("all");
    setBreakerFilter("all");
  }

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all" || breakerFilter !== "all";

  return (
    <div className="flex flex-col min-h-full text-[var(--text-heading)] -mt-2 -mx-1 sm:-mx-2 pb-16 screen-sm:pb-8">
      {/* ── TOAST NOTIFICATION ────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-[var(--surface)] px-4 py-3 text-xs font-semibold text-[var(--text-heading)] shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <Radio size={14} className="text-indigo-600 animate-pulse" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-[var(--text-muted)] hover:text-[var(--text-heading)] ml-2"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* ── SECTION 3: PAGE HEADER & ACTIONS ───────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2 px-1 sm:px-2 mb-2">
        <div className="flex items-center gap-2.5">
          <Link
            href="/devops-sre/dashboard"
            title="Back to SRE Dashboard"
            className="tap-pop flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--divider)] bg-[var(--surface)] text-[var(--role-text)] shadow-2xs hover:bg-[var(--search-bg)] transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[var(--text-heading)] leading-none">
                Third-Party Integrations &amp; Upstream Rails
              </h1>
              <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                Telemetry &amp; Circuit Breakers
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              NPCI UPI Switch, Meta WhatsApp Cloud API, Bharat BillPay, NIC GSTN, UIDAI Aadhaar quotas and circuit breaker states
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefreshTelemetry}
            disabled={isRefreshing}
            className="tap-pop flex items-center gap-1.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] shadow-2xs hover:bg-[var(--search-bg)] transition-colors cursor-pointer"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin text-indigo-600" : ""} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <button
            type="button"
            onClick={() => setModalIntegration(selectedIntegration)}
            className="tap-pop flex items-center gap-1.5 rounded-xl bg-[var(--accent-solid)] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:brightness-110 transition-all cursor-pointer"
          >
            <Send size={12} />
            <span>Request Reconnect</span>
          </button>
        </div>
      </div>

      {/* ── SECTION 5: 6 KPI SUMMARY CARDS ───────────────────────────── */}
      <div className="grid grid-cols-2 screen-sm:grid-cols-3 screen-lg:grid-cols-6 lg:grid-cols-6 gap-2 sm:gap-2.5 lg:gap-3 px-1 sm:px-2 mb-3">
        {/* KPI 1: Total Rails */}
        <div
          onClick={clearAllFilters}
          className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3 cursor-pointer hover:border-[var(--divider)] transition-all"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Upstream Rails</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--text-heading)] leading-none">5 Rails</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-up-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-up-fg)]">
              100% active
            </span>
          </div>
        </div>

        {/* KPI 2: Connected */}
        <button
          type="button"
          onClick={() => { setStatusFilter("connected"); setSearchQuery(""); }}
          className={`bg-[var(--surface)] rounded-xl border p-2.5 sm:p-3 text-left transition-all cursor-pointer ${
            statusFilter === "connected"
              ? "border-[var(--status-healthy-fg)] ring-2 ring-[var(--status-healthy-fg)]/20"
              : "border-[var(--card-border)] hover:border-[var(--divider)]"
          }`}
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Fully Connected</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--kpi-good)] leading-none">3 Rails</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 text-[10px] font-semibold">
              60% nominal
            </span>
          </div>
        </button>

        {/* KPI 3: Degraded / Throttled */}
        <button
          type="button"
          onClick={() => { setStatusFilter("degraded"); setSearchQuery(""); }}
          className={`bg-[var(--surface)] rounded-xl border p-2.5 sm:p-3 text-left transition-all cursor-pointer ${
            statusFilter === "degraded"
              ? "border-[var(--status-warning-fg)] ring-2 ring-[var(--status-warning-fg)]/20"
              : "border-[var(--card-border)] hover:border-[var(--divider)]"
          }`}
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Degraded / Throttled</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--kpi-warn)] leading-none">1 Rail</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 text-[10px] font-semibold">
              90% TPS cap
            </span>
          </div>
        </button>

        {/* KPI 4: Breaker Tripped */}
        <button
          type="button"
          onClick={() => { setBreakerFilter("open"); setSearchQuery(""); }}
          className={`bg-[var(--surface)] rounded-xl border p-2.5 sm:p-3 text-left transition-all cursor-pointer ${
            breakerFilter === "open"
              ? "border-[var(--status-critical-fg)] ring-2 ring-[var(--status-critical-fg)]/20"
              : "border-[var(--card-border)] hover:border-[var(--divider)]"
          }`}
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Breaker Tripped</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--kpi-bad)] leading-none">1 Open</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 text-[10px] font-semibold animate-pulse">
              Trip Active
            </span>
          </div>
        </button>

        {/* KPI 5: Avg Webhook SLA */}
        <div
          className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Avg Webhook SLA</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--kpi-good)] leading-none">98.9%</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--trend-up-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--trend-up-fg)]">
              &uarr; 0.2%
            </span>
          </div>
        </div>

        {/* KPI 6: Customer Exposure */}
        <div
          className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Customer Exposure</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--kpi-bad)] leading-none">48</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 text-[10px] font-semibold">
              WS-94812
            </span>
          </div>
        </div>
      </div>

      {/* ── SECTION 6: SEARCH & FILTER BAR ───────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 sm:px-2 mb-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by provider, rail service, ID, status..."
              className="w-full rounded-xl border border-[var(--divider)] bg-[var(--surface)] py-1.5 pl-8 pr-3 text-xs text-[var(--text-heading)] placeholder:text-[var(--text-muted)] focus:border-[var(--sidebar-active)] focus:outline-none shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-heading)]"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <FilterDropdown
            label="Connection State"
            value={statusFilter}
            options={[
              { label: "All States", value: "all" },
              { label: "Connected", value: "connected" },
              { label: "Degraded", value: "degraded" },
              { label: "Failed", value: "failed" }
            ]}
            onChange={setStatusFilter}
          />

          <FilterDropdown
            label="Circuit Breaker"
            value={breakerFilter}
            options={[
              { label: "All Breakers", value: "all" },
              { label: "Closed (Normal)", value: "closed" },
              { label: "Half-Open (Testing)", value: "half-open" },
              { label: "Open (Tripped)", value: "open" }
            ]}
            onChange={setBreakerFilter}
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="tap-pop flex items-center gap-1 text-xs font-semibold text-[var(--sidebar-active)] hover:underline transition-colors px-2 py-1 cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* ── SECTION 7 & 8: 45% LEFT LIST / 55% RIGHT INSPECTOR ────────── */}
      <div className="flex flex-col lg:flex-row gap-3 px-1 sm:px-2 min-h-0 flex-1">
        {/* LEFT 45%: INTEGRATION RAILS LIST */}
        <div
          className="w-full lg:w-[45%] shrink-0 bg-[var(--surface)] rounded-2xl border border-[var(--card-border)] shadow-xs flex flex-col p-3 sm:p-3.5 max-h-[520px] lg:max-h-none lg:h-[calc(100dvh-17rem)] overflow-hidden"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--divider)]">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-heading)] leading-tight">
                Upstream Rails ({filteredIntegrations.length})
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Telemetry, latency, quotas and breaker states
              </p>
            </div>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              SORT: IMPACT
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pt-2 space-y-2 pr-0.5">
            {filteredIntegrations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--divider)] p-8 text-center text-xs text-[var(--text-muted)]">
                No upstream integration rails match your active filter.
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="block mx-auto mt-2 text-[var(--sidebar-active)] font-semibold underline cursor-pointer"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredIntegrations.map((item) => {
                const isSelected = item.id === selectedIntegration.id;
                const isCircuitOpen = item.circuitBreaker.includes("Open");

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`tap-pop text-left rounded-xl border p-3 transition-all relative overflow-hidden w-full cursor-pointer ${
                      isSelected
                        ? "border-[var(--sidebar-active)] bg-[var(--sidebar-active)]/[0.04] shadow-xs ring-1 ring-[var(--sidebar-active)]"
                        : "border-[var(--divider)] bg-[var(--surface)] hover:border-[var(--divider)]/80 hover:bg-[var(--search-bg)]"
                    } ${
                      isCircuitOpen
                        ? "border-l-4 border-l-rose-500"
                        : item.connectionState === "Degraded"
                        ? "border-l-4 border-l-amber-500"
                        : "border-l-4 border-l-emerald-500"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ProviderLogo provider={item.provider} className="h-7 w-7 shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-[var(--text-heading)] truncate">
                              {item.provider}
                            </h4>
                            <span className="font-mono text-[10px] text-[var(--text-muted)] bg-[var(--search-bg)] px-1.5 py-0.2 rounded border border-[var(--divider)]/40">
                              {item.id}
                            </span>
                          </div>
                          <p className="text-[10px] text-[var(--text-muted)] truncate">
                            {item.service} &middot; {item.protocol}
                          </p>
                        </div>
                      </div>

                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold shrink-0 ${statusPillClass(item.connectionState)}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(item.connectionState)}`} />
                        {item.connectionState.toUpperCase()}
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-[var(--divider)] grid grid-cols-3 gap-2 text-[10px]">
                      <div>
                        <span className="text-[var(--text-muted)] block">p95 Latency</span>
                        <span className="font-mono font-bold text-[var(--text-heading)]">{item.p95Latency}</span>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)] block">Error Rate</span>
                        <span className={`font-mono font-bold ${parseFloat(item.errorRate) > 1 ? "text-rose-600 font-bold" : "text-emerald-600"}`}>
                          {item.errorRate}
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)] block">TPS Quota</span>
                        <span className="font-mono font-bold text-[var(--text-heading)]">{item.activeTps}/{item.maxTps}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT 55%: DEEP INTEGRATION 360 INSPECTOR */}
        <div
          className="flex-1 min-w-0 bg-[var(--surface)] rounded-2xl border border-[var(--card-border)] shadow-xs flex flex-col p-3.5 sm:p-5 overflow-hidden lg:h-[calc(100dvh-17rem)]"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <div className="flex flex-col h-full overflow-y-auto pr-0.5">
            {/* Header */}
            <div className="pb-3 border-b border-[var(--divider)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ProviderLogo provider={selectedIntegration.provider} className="h-10 w-10 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded">
                        {selectedIntegration.id}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${statusPillClass(selectedIntegration.connectionState)}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(selectedIntegration.connectionState)}`} />
                        {selectedIntegration.connectionState.toUpperCase()}
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-[var(--text-heading)]">
                      {selectedIntegration.provider}
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Service: <strong className="text-[var(--text-heading)]">{selectedIntegration.service}</strong> &middot; Protocol: <span className="font-mono text-[var(--text-muted)]">{selectedIntegration.protocol}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalIntegration(selectedIntegration)}
                    className="tap-pop flex items-center gap-1.5 rounded-xl bg-[var(--accent-solid)] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:brightness-110 transition-colors cursor-pointer"
                  >
                    <Send size={12} />
                    <span>Request Reconnect</span>
                  </button>
                </div>
              </div>

              {/* Inspector Tabs */}
              <div className="flex space-x-1 border-b border-[var(--divider)] -mb-3 mt-4 overflow-x-auto scrollbar-none">
                {(
                  [
                    { id: "overview", label: "Overview" },
                    { id: "telemetry", label: "Telemetry & RTT" },
                    { id: "quotas", label: "TPS Quotas" },
                    { id: "circuit-breaker", label: "Circuit Breaker" },
                    { id: "webhooks", label: "Webhook SLAs" },
                    { id: "blast-radius", label: `Blast Radius (${selectedIntegration.affectedWorkspacesCount})` },
                    { id: "audit", label: "Ops Audit" }
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === tab.id
                        ? "border-[var(--sidebar-active)] text-[var(--sidebar-active)] bg-[var(--surface)]"
                        : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Inspector Body */}
            <div className="pt-4 flex-1 text-xs space-y-4">

            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-[var(--divider)] p-3.5 bg-[var(--surface)]">
                  <h3 className="text-xs font-bold text-[var(--text-heading)] mb-2">Upstream Rail Specifications</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-[var(--text-muted)] block">Ingress POP</span>
                      <strong className="text-slate-800">{selectedIntegration.ingressPop}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-[var(--text-muted)] block">Last Success</span>
                      <strong className="text-slate-800 font-mono">{selectedIntegration.lastSuccess}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-[var(--text-muted)] block">Last Failure</span>
                      <strong className="text-rose-700 font-mono">{selectedIntegration.lastFailure}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-[var(--text-muted)] block">Webhook SLA</span>
                      <strong className="text-slate-800 font-mono">{selectedIntegration.webhookDeliveryPct}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-[var(--text-muted)] block">Circuit Breaker</span>
                      <strong className={selectedIntegration.circuitBreaker.includes("Open") ? "text-rose-700 font-bold" : "text-emerald-700"}>
                        {selectedIntegration.circuitBreaker}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-[var(--text-muted)] block">Dead-Letter Queue</span>
                      <strong className="text-slate-800 font-mono">{selectedIntegration.dlqDepth} messages</strong>
                    </div>
                  </div>
                </div>

                {selectedIntegration.linkedIncident && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-950 flex items-center justify-between">
                    <div>
                      <span className="font-bold block">Correlated Active Incident</span>
                      <span>This rail is the primary trigger for <strong>{selectedIntegration.linkedIncident}</strong></span>
                    </div>
                    <Link
                      href="/devops-sre/incidents"
                      className="tap-pop flex items-center gap-1 font-semibold text-rose-700 hover:text-rose-900 underline"
                    >
                      <span>Open Incident 360</span>
                      <ArrowUpRight size={12} />
                    </Link>
                  </div>
                )}

                <div className="rounded-xl border border-[var(--divider)] p-3.5 bg-[var(--surface)]">
                  <h3 className="text-xs font-bold text-[var(--text-heading)] mb-2">Rate Limit Saturation Gauge</h3>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Active Load: {selectedIntegration.activeTps} TPS</span>
                      <span className="font-bold text-slate-800">Ceiling: {selectedIntegration.maxTps} TPS</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          selectedIntegration.activeTps / selectedIntegration.maxTps > 0.8
                            ? "bg-rose-500"
                            : selectedIntegration.activeTps / selectedIntegration.maxTps > 0.6
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, (selectedIntegration.activeTps / selectedIntegration.maxTps) * 100)}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 pt-0.5">
                      {selectedIntegration.rateLimitUsage}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TELEMETRY */}
            {activeTab === "telemetry" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)] text-xs">
                    <span className="text-[11px] text-[var(--text-muted)] block">p50 Latency</span>
                    <strong className="text-base text-[var(--text-heading)] font-mono">14ms</strong>
                  </div>
                  <div className="p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)] text-xs">
                    <span className="text-[11px] text-[var(--text-muted)] block">p95 Latency</span>
                    <strong className="text-base text-[var(--text-heading)] font-mono">{selectedIntegration.p95Latency}</strong>
                  </div>
                  <div className="p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)] text-xs">
                    <span className="text-[11px] text-[var(--text-muted)] block">Error Rate</span>
                    <strong className={`text-base font-mono ${selectedIntegration.errorRate !== "0.01%" ? "text-rose-600" : "text-emerald-700 dark:text-emerald-400"}`}>
                      {selectedIntegration.errorRate}
                    </strong>
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--divider)] p-3.5 bg-[var(--surface)]">
                  <h4 className="text-xs font-bold text-[var(--text-heading)] mb-2">Round-Trip Latency Trend (Last 60 Minutes)</h4>
                  <div className="h-24 flex items-end gap-1.5 pt-4">
                    {[18, 19, 18, 20, 22, 19, 21, 24, 20, 19, 23, 22, 35, 42, 68, 120, 310, 480, 840].map((val, idx) => {
                      const heightPct = Math.min(100, Math.max(10, (val / 840) * 100));
                      const isHigh = val > 100;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                          <div
                            className={`w-full rounded-t ${isHigh ? "bg-rose-500" : "bg-indigo-500"} transition-all`}
                            style={{ height: `${heightPct}%` }}
                          />
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-7 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
                            {val}ms
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                    <span>60m ago</span>
                    <span>30m ago</span>
                    <span>Current</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: QUOTAS */}
            {activeTab === "quotas" && (
              <div className="space-y-3 text-xs">
                <div className="rounded-xl border border-[var(--divider)] p-3.5 bg-[var(--surface)]">
                  <h4 className="text-xs font-bold text-[var(--text-heading)] mb-2">Upstream Quota Tier &amp; Rate-Limiting Policy</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between py-1.5 border-b border-[var(--divider)]">
                      <span className="text-slate-600">Contracted Base Tier</span>
                      <strong className="text-slate-800 font-mono">{selectedIntegration.maxTps} TPS Committed</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[var(--divider)]">
                      <span className="text-slate-600">Burst Multiplier</span>
                      <strong className="text-slate-800 font-mono">1.5x (up to 120 seconds)</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[var(--divider)]">
                      <span className="text-slate-600">Rate Limiting Algorithm</span>
                      <strong className="text-slate-800">Token Bucket / Sliding Window (Redis Cluster)</strong>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-600">Throttling Response Code</span>
                      <strong className="text-slate-800 font-mono">HTTP 429 Too Many Requests (Retry-After header)</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CIRCUIT BREAKER */}
            {activeTab === "circuit-breaker" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-[var(--divider)] p-4 bg-[var(--surface)]">
                  <h4 className="text-xs font-bold text-[var(--text-heading)] mb-3">Circuit Breaker Finite State Machine</h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className={`p-3 rounded-xl border ${
                      selectedIntegration.circuitBreaker.includes("Closed")
                        ? "border-emerald-500 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/20"
                        : "border-[var(--divider)] bg-[var(--search-bg)]/60 dark:bg-slate-900/40 text-[var(--text-muted)]"
                    }`}>
                      <div className="text-sm mb-1">Closed</div>
                      <div className="text-[10px]">Normal traffic passing 100%</div>
                    </div>

                    <div className={`p-3 rounded-xl border ${
                      selectedIntegration.circuitBreaker.includes("Half")
                        ? "border-amber-500 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 font-bold ring-2 ring-amber-500/20"
                        : "border-[var(--divider)] bg-[var(--search-bg)]/60 dark:bg-slate-900/40 text-[var(--text-muted)]"
                    }`}>
                      <div className="text-sm mb-1">Half-Open</div>
                      <div className="text-[10px]">5% Canary testing recovery</div>
                    </div>

                    <div className={`p-3 rounded-xl border ${
                      selectedIntegration.circuitBreaker.includes("Open")
                        ? "border-rose-500 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 font-bold ring-2 ring-rose-500/20"
                        : "border-[var(--divider)] bg-[var(--search-bg)]/60 dark:bg-slate-900/40 text-[var(--text-muted)]"
                    }`}>
                      <div className="text-sm mb-1">Open</div>
                      <div className="text-[10px]">Traffic halted / Short-circuiting</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--divider)] text-xs text-[var(--text-muted)] space-y-1.5">
                    <div className="flex justify-between">
                      <span>Trip Threshold:</span>
                      <strong className="font-mono text-[var(--text-heading)]">&gt; 5% errors over 30s rolling window</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Auto-Reset Probe Interval:</span>
                      <strong className="font-mono text-[var(--text-heading)]">120s cooldown</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: WEBHOOKS */}
            {activeTab === "webhooks" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>OUTBOUND WEBHOOK DELIVERY DISPATCH</span>
                  <span>DELIVERY SLA: 99.9%</span>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--divider)] bg-[var(--surface)] text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Success Rate:</span>
                    <strong className="font-mono text-emerald-700">{selectedIntegration.webhookDeliveryPct}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Retry Buffer Depth:</span>
                    <strong className="font-mono text-slate-800">{selectedIntegration.dlqDepth} messages</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Dead-Letter Queue (DLQ):</span>
                    <strong className={`font-mono ${selectedIntegration.dlqDepth > 0 ? "text-rose-600 font-bold" : "text-slate-800"}`}>
                      {selectedIntegration.dlqDepth > 0 ? `${selectedIntegration.dlqDepth} in DLQ (Action required)` : "0 in DLQ"}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: BLAST RADIUS */}
            {activeTab === "blast-radius" && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-[var(--text-muted)]">
                  <span>CUSTOMER WORKSPACES EXPOSED ({selectedIntegration.affectedWorkspacesCount})</span>
                  <span>SEVERITY: {selectedIntegration.affectedWorkspacesCount > 0 ? "HIGH IMPACT" : "NONE"}</span>
                </div>

                {selectedIntegration.affectedWorkspacesCount > 0 ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 space-y-2">
                    <div className="font-bold text-rose-900">
                      Primary Tenant Anchor: Sharma Traders (WS-94812)
                    </div>
                    <p className="text-rose-800 text-[11px] leading-relaxed">
                      All 48 enterprise tenants utilizing WhatsApp Egress messaging are experiencing queued or failing outbound notifications. Correlated to Incident INC-1042.
                    </p>
                    <div className="pt-2 flex justify-between items-center border-t border-rose-200 text-[11px]">
                      <span>Open Customer Support Tickets: <strong>14 escalated</strong></span>
                      <Link href="/devops-sre/incidents" className="text-rose-700 font-bold underline">
                        View in Incident 360
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900">
                    <strong>Zero Customer Exposure:</strong> This rail is fully healthy and delivering 100% of customer payloads within agreed SLAs.
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: AUDIT */}
            {activeTab === "audit" && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-[var(--text-muted)]">
                  <span>GOVERNED RECONNECT &amp; CONFIG AUDIT</span>
                  <span>MERKLE ANCHORED</span>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                    <div className="flex justify-between text-slate-500 text-[11px] mb-1">
                      <span>2026-09-26 12:35 UTC</span>
                      <span className="font-mono">Leaf #10493</span>
                    </div>
                    <div className="font-semibold text-[var(--text-heading)]">
                      Circuit Breaker Transition: Open (Tripped)
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Trigger: SRE Auto-Sentinel &middot; Error rate exceeded 4.5%
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
                    <div className="flex justify-between text-slate-500 text-[11px] mb-1">
                      <span>2026-09-24 09:12 UTC</span>
                      <span className="font-mono">Leaf #10410</span>
                    </div>
                    <div className="font-semibold text-slate-800">
                      TPS Quota Cap Increased: 800 -&gt; 1,000 TPS
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Actor: Priyanka Rao [Eng Lead] &middot; Approval: Change CAB-8790
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* ── GOVERNED RECONNECT REQUEST MODAL ─────────────────────────── */}
      {modalIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[var(--surface)] p-5 shadow-2xl border border-[var(--divider)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--divider)]">
              <h3 className="text-base font-bold text-[var(--text-heading)]">
                Submit Reconnect Request
              </h3>
              <button
                type="button"
                onClick={() => setModalIntegration(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 my-4 text-xs">
              <div className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/70 dark:bg-indigo-950/40 p-3 text-indigo-950 dark:text-indigo-200">
                <strong>Governance Rule:</strong> Upstream credential mutation is restricted to Platform Operations. SRE request initiates an approval ticket with linked incident telemetry.
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-heading)] mb-1">
                  Target Upstream Provider
                </label>
                <div className="p-2.5 rounded-xl bg-[var(--search-bg)] border border-[var(--divider)] font-semibold text-[var(--text-heading)]">
                  {modalIntegration.provider} ({modalIntegration.id})
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-heading)] mb-1">
                  Incident Link / Justification
                </label>
                <div className="p-2.5 rounded-xl bg-[var(--search-bg)] border border-[var(--divider)] font-semibold text-[var(--text-heading)]">
                  {modalIntegration.linkedIncident
                    ? `Correlated to ${modalIntegration.linkedIncident} (Active Degradation)`
                    : "Routine credential verification and health re-check"}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--divider)]">
              <button
                type="button"
                onClick={() => setModalIntegration(null)}
                className="tap-pop rounded-xl border border-[var(--divider)] px-3.5 py-1.5 text-xs font-semibold text-[var(--text-heading)] hover:bg-[var(--search-bg)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRequestReconnect(modalIntegration)}
                className="tap-pop flex items-center gap-1.5 rounded-xl bg-[var(--icon-btn-navy)] px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                <Send size={12} />
                <span>Submit to Ops Queue</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

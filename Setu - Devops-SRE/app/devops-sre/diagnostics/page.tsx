"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  Server,
  Database,
  Globe,
  Activity,
  Filter,
  Search,
  ChevronRight,
  Download,
  ExternalLink,
  Clock,
  ArrowUpRight,
  Check,
  Copy,
  FileText,
  Layers,
  Radio,
  Zap,
  RotateCcw,
  Sliders,
  X,
  Code
} from "lucide-react";
import Card from "@/components/shared/Card";
import StatusBadge from "@/components/shared/StatusBadge";
import FilterDropdown from "@/components/shared/FilterDropdown";
import { sreDiagnosticProbes, type SreDiagnosticProbe } from "@/lib/mock-data/devops-sre";
import { triggerRefresh } from "@/lib/events/refresh";

type InspectorTab = "overview" | "console" | "assertions" | "history" | "remediation" | "audit";

interface AssertionItem {
  id: string;
  name: string;
  condition: string;
  expected: string;
  actual: string;
  passed: boolean;
}

const probeAssertionsMap: Record<string, AssertionItem[]> = {
  "PRB-FLEET-01": [
    { id: "ast-01", name: "HTTP Status Code Validation", condition: "== 200 OK", expected: "200", actual: "47x 200, 1x 401", passed: false },
    { id: "ast-02", name: "HMAC Signature Verification", condition: "valid_signature == true", expected: "true", actual: "false on WS-94812", passed: false },
    { id: "ast-03", name: "Round-Trip Handshake Latency", condition: "< 250ms", expected: "< 250ms", actual: "84ms (p95)", passed: true },
    { id: "ast-04", name: "Payload Serialization Integrity", condition: "sha256_match == true", expected: "true", actual: "true", passed: true },
    { id: "ast-05", name: "Tenant Route Resolution", condition: "tenant_resolved == true", expected: "true", actual: "48/48 resolved", passed: true }
  ],
  "PRB-FLEET-02": [
    { id: "ast-11", name: "Anycast BGP Path Health", condition: "peers_healthy >= 3", expected: ">= 3", actual: "4 active peers", passed: true },
    { id: "ast-12", name: "DNS Authoritative Resolution", condition: "ttl_remaining > 60s", expected: "> 60s", actual: "284s", passed: true },
    { id: "ast-13", name: "Edge POP Ingress RTT (BOM)", condition: "< 35ms", expected: "< 35ms", actual: "18ms", passed: true },
    { id: "ast-14", name: "Edge POP Ingress RTT (DEL)", condition: "< 35ms", expected: "< 35ms", actual: "24ms", passed: true },
    { id: "ast-15", name: "Edge POP Ingress RTT (BLR)", condition: "< 35ms", expected: "< 35ms", actual: "22ms", passed: true }
  ],
  "PRB-FLEET-03": [
    { id: "ast-21", name: "Certificate Expiration Window", condition: "days_remaining > 30", expected: "> 30 days", actual: "48 days (api.setu.co)", passed: true },
    { id: "ast-22", name: "TLS Protocol Minimum", condition: ">= TLS 1.3", expected: "TLS 1.3", actual: "TLS 1.3 enforced", passed: true },
    { id: "ast-23", name: "Cipher Suite Strength", condition: "AEAD_256 == true", expected: "true", actual: "AES-256-GCM", passed: true },
    { id: "ast-24", name: "OCSP Stapling Validation", condition: "ocsp_response == successful", expected: "successful", actual: "successful", passed: true }
  ],
  "PRB-FLEET-04": [
    { id: "ast-31", name: "Read Replica Replication Lag", condition: "< 50ms", expected: "< 50ms", actual: "14ms", passed: true },
    { id: "ast-32", name: "Connection Pool Saturation", condition: "< 70%", expected: "< 70%", actual: "34% pool load", passed: true },
    { id: "ast-33", name: "Deadlock Detection Sweep", condition: "deadlocks == 0", expected: "0", actual: "0 detected", passed: true },
    { id: "ast-34", name: "Slow Query Threshold (>500ms)", condition: "count == 0", expected: "0", actual: "0 queries", passed: true }
  ],
  "PRB-FLEET-05": [
    { id: "ast-41", name: "Meta Graph API Inbound Handshake", condition: "== 200 OK", expected: "200", actual: "401 Unauthorized", passed: false },
    { id: "ast-42", name: "OAuth Token Refresh Grant", condition: "grant_valid == true", expected: "true", actual: "token_revoked / expired", passed: false },
    { id: "ast-43", name: "Egress Webhook Buffer Health", condition: "queue_depth < 100", expected: "< 100", actual: "420 buffered", passed: false },
    { id: "ast-44", name: "Circuit Breaker Tripped", condition: "state == Closed", expected: "Closed", actual: "Open (Failing)", passed: false }
  ]
};

const probeConsoleLogsMap: Record<string, string[]> = {
  "PRB-FLEET-01": [
    "[13:50:02 UTC] Initiating fleet-wide probe: PRB-FLEET-01 (Webhook Handshake)",
    "[13:50:02 UTC] Scope: 48 Monitored Customer Workspaces across prod-bom-01",
    "[13:50:03 UTC] Batch 1/3 (16 endpoints): 16 ACK received (200 OK) · avg 62ms",
    "[13:50:03 UTC] Batch 2/3 (16 endpoints): 16 ACK received (200 OK) · avg 74ms",
    "[13:50:04 UTC] Batch 3/3 (16 endpoints): 15 ACK received (200 OK) · avg 88ms",
    "[13:50:04 UTC] WARN: Endpoint WS-94812 (Sharma Traders) failed HMAC authentication (HTTP 401)",
    "[13:50:04 UTC] Cross-reference: Failure correlated to active incident INC-1042",
    "[13:50:04 UTC] SUMMARY: 47/48 endpoints healthy. Status: WARNING. Sweep duration: 84ms."
  ],
  "PRB-FLEET-02": [
    "[13:52:10 UTC] Starting Edge Route & Anycast DNS Probe: PRB-FLEET-02",
    "[13:52:10 UTC] Target: POP-BOM-01, POP-DEL-02, POP-BLR-01",
    "[13:52:11 UTC] Ingress ping BOM: 18ms · 0% loss · Route: AS13335 -> AS55836",
    "[13:52:11 UTC] Ingress ping DEL: 24ms · 0% loss · Route: AS13335 -> AS55836",
    "[13:52:11 UTC] Ingress ping BLR: 22ms · 0% loss · Route: AS13335 -> AS55836",
    "[13:52:12 UTC] DNS Geo-steering health: 100% resolution consistency across 12 name servers.",
    "[13:52:12 UTC] SUMMARY: All edge POPs optimal. Status: PASSED. Duration: 24ms."
  ],
  "PRB-FLEET-03": [
    "[13:36:00 UTC] TLS & Certificate Verification Probe: PRB-FLEET-03",
    "[13:36:01 UTC] Inspecting domain: api.setu.co (DigiCert Global Root G2)",
    "[13:36:01 UTC] Expiry date: 2026-11-22T00:00:00Z · 48 days remaining",
    "[13:36:02 UTC] Inspecting domain: auth.sahayogi.in (Let's Encrypt R3)",
    "[13:36:02 UTC] Expiry date: 2026-12-14T12:00:00Z · 70 days remaining",
    "[13:36:02 UTC] Protocol negotiation: TLS 1.3 negotiated, 0-RTT enabled, HSTS valid (max-age=31536000)",
    "[13:36:03 UTC] SUMMARY: All certificates in safe policy window (>30d). Status: PASSED."
  ],
  "PRB-FLEET-04": [
    "[13:54:12 UTC] Aurora PostgreSQL Storage & Read Pool Probe: PRB-FLEET-04",
    "[13:54:12 UTC] Target: prod-aurora-cluster-pg16 (1 Primary, 3 Read Replicas)",
    "[13:54:13 UTC] Replica replica-01 lag: 12ms · Connections: 48/200",
    "[13:54:13 UTC] Replica replica-02 lag: 14ms · Connections: 52/200",
    "[13:54:13 UTC] Replica replica-03 lag: 11ms · Connections: 39/200",
    "[13:54:13 UTC] Deadlock telemetry: 0 in last 3600s. Table bloat index: < 3.2%.",
    "[13:54:14 UTC] SUMMARY: Replication within tight 50ms envelope. Status: PASSED."
  ],
  "PRB-FLEET-05": [
    "[13:53:20 UTC] Meta Cloud API Integration Probe: PRB-FLEET-05",
    "[13:53:20 UTC] Checking OAuth token validity for WhatsApp Business Cloud API...",
    "[13:53:21 UTC] Request: GET https://graph.facebook.com/v19.0/me?access_token=EAAG...[MASKED]",
    "[13:53:21 UTC] Inbound response: HTTP 401 Unauthorized",
    "[13:53:21 UTC] Response payload: { error: { message: 'Session has expired or token revoked', type: 'OAuthException', code: 190, error_subcode: 463 } }",
    "[13:53:22 UTC] ALERT: Token expired on tenant WS-94812 (Sharma Traders).",
    "[13:53:22 UTC] Action taken: Escalated to P1 incident INC-1042. Circuit breaker set to OPEN.",
    "[13:53:22 UTC] SUMMARY: Probe FAILED. Immediate credential re-authentication required."
  ]
};

const probeHistoryMap: Record<string, Array<{ time: string; duration: string; status: "passed" | "failed" | "warning"; trigger: string; hash: string }>> = {
  "PRB-FLEET-01": [
    { time: "45s ago", duration: "84ms", status: "warning", trigger: "Cron (Every 60s)", hash: "b9e14a" },
    { time: "1m 45s ago", duration: "86ms", trigger: "Cron (Every 60s)", status: "warning", hash: "a812cf" },
    { time: "2m 45s ago", duration: "82ms", trigger: "Cron (Every 60s)", status: "warning", hash: "9f33b1" },
    { time: "3m 45s ago", duration: "68ms", trigger: "Arjun Mehta [SRE]", status: "passed", hash: "8e22cd" },
    { time: "4m 45s ago", duration: "71ms", trigger: "Cron (Every 60s)", status: "passed", hash: "7c11ba" }
  ],
  "PRB-FLEET-02": [
    { time: "2m ago", duration: "24ms", status: "passed", trigger: "Cron (Every 5m)", hash: "1a89ef" },
    { time: "7m ago", duration: "25ms", status: "passed", trigger: "Cron (Every 5m)", hash: "2b90ff" },
    { time: "12m ago", duration: "23ms", status: "passed", trigger: "Cron (Every 5m)", hash: "3c01aa" },
    { time: "17m ago", duration: "24ms", status: "passed", trigger: "Cron (Every 5m)", hash: "4d12bb" }
  ],
  "PRB-FLEET-03": [
    { time: "18m ago", duration: "42ms", status: "passed", trigger: "Cron (Every 1h)", hash: "5e23cc" },
    { time: "1h 18m ago", duration: "41ms", status: "passed", trigger: "Cron (Every 1h)", hash: "6f34dd" }
  ],
  "PRB-FLEET-04": [
    { time: "12s ago", duration: "12ms", status: "passed", trigger: "Cron (Continuous 30s)", hash: "7a45ee" },
    { time: "42s ago", duration: "13ms", status: "passed", trigger: "Cron (Continuous 30s)", hash: "8b56ff" }
  ],
  "PRB-FLEET-05": [
    { time: "1m ago", duration: "340ms", status: "failed", trigger: "Cron (Every 10m)", hash: "9c6700" },
    { time: "11m ago", duration: "338ms", status: "failed", trigger: "Cron (Every 10m)", hash: "0d7811" },
    { time: "21m ago", duration: "342ms", status: "failed", trigger: "Alert Auto-trigger", hash: "1e8922" },
    { time: "31m ago", duration: "82ms", status: "passed", trigger: "Cron (Every 10m)", hash: "2f9033" }
  ]
};

function statusPillClass(status: "passed" | "failed" | "warning") {
  if (status === "passed") return "bg-emerald-50 text-emerald-800 border border-emerald-200";
  if (status === "warning") return "bg-amber-50 text-amber-800 border border-amber-200";
  return "bg-rose-50 text-rose-800 border border-rose-200";
}

function statusDotClass(status: "passed" | "failed" | "warning") {
  if (status === "passed") return "bg-emerald-500";
  if (status === "warning") return "bg-amber-500 animate-pulse";
  return "bg-rose-500 animate-ping";
}

export default function SreDiagnosticsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [selectedProbeId, setSelectedProbeId] = useState<string>("PRB-FLEET-01");
  const [activeTab, setActiveTab] = useState<InspectorTab>("overview");
  const [isRunningProbe, setIsRunningProbe] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showRunModal, setShowRunModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filtered probes
  const filteredProbes = useMemo(() => {
    return sreDiagnosticProbes.filter((p) => {
      const matchSearch =
        searchQuery === "" ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.targetScope.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        categoryFilter === "all" || p.category.toLowerCase().includes(categoryFilter.toLowerCase());

      const matchStatus = statusFilter === "all" || p.status === statusFilter;

      const matchScope =
        scopeFilter === "all" || p.targetScope.toLowerCase().includes(scopeFilter.toLowerCase());

      return matchSearch && matchCategory && matchStatus && matchScope;
    });
  }, [searchQuery, categoryFilter, statusFilter, scopeFilter]);

  const selectedProbe = useMemo(() => {
    return (
      sreDiagnosticProbes.find((p) => p.id === selectedProbeId) ||
      sreDiagnosticProbes[0]
    );
  }, [selectedProbeId]);

  const assertions = probeAssertionsMap[selectedProbe.id] || probeAssertionsMap["PRB-FLEET-01"];
  const consoleLogs = probeConsoleLogsMap[selectedProbe.id] || probeConsoleLogsMap["PRB-FLEET-01"];
  const runHistory = probeHistoryMap[selectedProbe.id] || probeHistoryMap["PRB-FLEET-01"];

  const passedCount = assertions.filter((a) => a.passed).length;
  const failedCount = assertions.filter((a) => !a.passed).length;

  function handleTriggerRun() {
    setIsRunningProbe(true);
    setToastMessage(`Executing diagnostic probe ${selectedProbe.id} across ${selectedProbe.targetScope}...`);
    setTimeout(() => {
      setIsRunningProbe(false);
      setToastMessage(`Probe ${selectedProbe.id} sweep finished with status: ${selectedProbe.status.toUpperCase()}`);
      triggerRefresh({ source: `probe-${selectedProbe.id}` });
      setTimeout(() => setToastMessage(null), 4000);
    }, 1200);
  }

  function handleRefreshTelemetry() {
    setIsRefreshing(true);
    setToastMessage("Refreshing fleet diagnostic telemetry across all 48 tenant nodes...");
    setTimeout(() => {
      setIsRefreshing(false);
      triggerRefresh({ source: "manual-diagnostics-refresh" });
      setToastMessage("Telemetry refreshed: 18 probes active, 16 healthy, 1 warning, 1 failing.");
      setTimeout(() => setToastMessage(null), 4000);
    }, 800);
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard?.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  }

  function clearAllFilters() {
    setSearchQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setScopeFilter("all");
  }

  const hasActiveFilters =
    searchQuery !== "" || categoryFilter !== "all" || statusFilter !== "all" || scopeFilter !== "all";

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
                Automated Diagnostics &amp; Fleet Probes
              </h1>
              <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300">
                Fleet Verification
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Synthetic assertions, 48-tenant verification, edge latency sweeps, and automated remediation runs
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
            <span>{isRefreshing ? "Refreshing..." : "Refresh Telemetry"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRunModal(true)}
            className="tap-pop flex items-center gap-1.5 rounded-xl bg-[var(--accent-solid)] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:brightness-110 transition-all cursor-pointer"
          >
            <Play size={13} className="fill-white" />
            <span>Run Diagnostic Sweep</span>
          </button>
        </div>
      </div>

      {/* ── SECTION 5: 6 KPI SUMMARY CARDS ───────────────────────────── */}
      <div className="grid grid-cols-2 screen-sm:grid-cols-3 screen-lg:grid-cols-6 lg:grid-cols-6 gap-2 sm:gap-2.5 lg:gap-3 px-1 sm:px-2 mb-3">
        {/* KPI 1: Total Probes */}
        <div
          onClick={clearAllFilters}
          className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3 cursor-pointer hover:border-[var(--divider)] transition-all"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Total Probes</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--text-heading)] leading-none">18</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 text-[10px] font-semibold">
              All active
            </span>
          </div>
        </div>

        {/* KPI 2: Passing Rate */}
        <button
          type="button"
          onClick={() => { setStatusFilter("passed"); setSearchQuery(""); }}
          className={`bg-[var(--surface)] rounded-xl border p-2.5 sm:p-3 text-left transition-all cursor-pointer ${
            statusFilter === "passed"
              ? "border-[var(--status-healthy-fg)] ring-2 ring-[var(--status-healthy-fg)]/20"
              : "border-[var(--card-border)] hover:border-[var(--divider)]"
          }`}
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Passing Probes</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--kpi-good)] leading-none">16</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 text-[10px] font-semibold">
              88.9%
            </span>
          </div>
        </button>

        {/* KPI 3: Warning Probes */}
        <button
          type="button"
          onClick={() => { setStatusFilter("warning"); setSearchQuery(""); }}
          className={`bg-[var(--surface)] rounded-xl border p-2.5 sm:p-3 text-left transition-all cursor-pointer ${
            statusFilter === "warning"
              ? "border-[var(--status-warning-fg)] ring-2 ring-[var(--status-warning-fg)]/20"
              : "border-[var(--card-border)] hover:border-[var(--divider)]"
          }`}
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Degraded / Warning</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--kpi-warn)] leading-none">1</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 text-[10px] font-semibold">
              HMAC Anomaly
            </span>
          </div>
        </button>

        {/* KPI 4: Critical / Failing */}
        <button
          type="button"
          onClick={() => { setStatusFilter("failed"); setSearchQuery(""); }}
          className={`bg-[var(--surface)] rounded-xl border p-2.5 sm:p-3 text-left transition-all cursor-pointer ${
            statusFilter === "failed"
              ? "border-[var(--status-critical-fg)] ring-2 ring-[var(--status-critical-fg)]/20"
              : "border-[var(--card-border)] hover:border-[var(--divider)]"
          }`}
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Critical / Failing</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--kpi-bad)] leading-none">1</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 text-[10px] font-semibold animate-pulse">
              P1 Anchor
            </span>
          </div>
        </button>

        {/* KPI 5: Avg Sweep Latency */}
        <div
          className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Avg Sweep Latency</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--text-heading)] leading-none">38ms</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 text-[10px] font-semibold">
              p95
            </span>
          </div>
        </div>

        {/* KPI 6: Fleet Monitored */}
        <div
          className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-2.5 sm:p-3"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Tenants Verified</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span className="text-lg sm:text-xl font-bold text-[var(--text-heading)] leading-none">48</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 text-[10px] font-semibold">
              100% Reach
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
              placeholder="Search probes by name, ID, target scope, category..."
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
            label="Category"
            value={categoryFilter}
            options={[
              { label: "All Categories", value: "all" },
              { label: "Health", value: "Health" },
              { label: "Integrations", value: "Integrations" },
              { label: "Security", value: "Security" },
              { label: "Workspaces", value: "Workspaces" },
              { label: "Network", value: "Network" }
            ]}
            onChange={setCategoryFilter}
          />

          <FilterDropdown
            label="Status"
            value={statusFilter}
            options={[
              { label: "All Statuses", value: "all" },
              { label: "Passed", value: "passed" },
              { label: "Warning", value: "warning" },
              { label: "Failed", value: "failed" }
            ]}
            onChange={setStatusFilter}
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
        {/* LEFT 45%: PROBE QUEUE */}
        <div
          className="w-full lg:w-[45%] shrink-0 bg-[var(--surface)] rounded-2xl border border-[var(--card-border)] shadow-xs flex flex-col p-3 sm:p-3.5 max-h-[520px] lg:max-h-none lg:h-[calc(100dvh-17rem)] overflow-hidden"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--divider)]">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-heading)] leading-tight">
                Probe Queue ({filteredProbes.length})
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Synthetic assertions, 48-tenant verification sweeps
              </p>
            </div>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              SORT: FREQUENCY
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pt-2 space-y-2 pr-0.5">
            {filteredProbes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--divider)] p-8 text-center text-xs text-[var(--text-muted)]">
                No diagnostic probes match your active filters.
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="block mx-auto mt-2 text-[var(--sidebar-active)] font-semibold underline cursor-pointer"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredProbes.map((probe) => {
                const isSelected = probe.id === selectedProbe.id;
                const assertionsList = probeAssertionsMap[probe.id] || [];
                const passed = assertionsList.filter((a) => a.passed).length;
                const total = assertionsList.length;

                return (
                  <button
                    key={probe.id}
                    type="button"
                    onClick={() => setSelectedProbeId(probe.id)}
                    className={`tap-pop text-left rounded-xl border p-3 transition-all relative overflow-hidden w-full cursor-pointer ${
                      isSelected
                        ? "border-[var(--sidebar-active)] bg-[var(--sidebar-active)]/[0.04] shadow-xs ring-1 ring-[var(--sidebar-active)]"
                        : "border-[var(--divider)] bg-[var(--surface)] hover:border-[var(--divider)]/80 hover:bg-[var(--search-bg)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-bold text-[var(--text-heading)] bg-[var(--search-bg)] px-2 py-0.5 rounded border border-[var(--divider)]/40">
                          {probe.id}
                        </span>
                        <span className="text-[10.5px] font-semibold text-[var(--text-secondary)] bg-[var(--surface)] border border-[var(--divider)] px-2 py-0.5 rounded">
                          {probe.category}
                        </span>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-bold ${statusPillClass(probe.status)}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(probe.status)}`} />
                        {probe.status.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-[var(--text-heading)] mt-2 leading-snug">
                      {probe.name}
                    </h4>

                    <p className="text-[11px] text-[var(--text-muted)] mt-1 truncate">
                      Scope: <strong className="text-[var(--text-heading)]">{probe.targetScope}</strong>
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-[var(--divider)] flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2 text-[var(--text-muted)]">
                        <Clock size={11} />
                        <span>{probe.frequency}</span>
                        <span>&middot;</span>
                        <span className="font-mono text-[var(--text-secondary)]">{probe.durationMs}ms</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10.5px] font-semibold text-[var(--text-secondary)]">
                        <span>Assertions:</span>
                        <span className={failedCount > 0 && probe.id === selectedProbe.id ? "text-rose-600 font-bold" : "text-emerald-700 dark:text-emerald-400"}>
                          {total > 0 ? `${passed}/${total}` : "5/5"} OK
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT 55%: DEEP PROBE INSPECTOR */}
        <div
          className="flex-1 min-w-0 bg-[var(--surface)] rounded-2xl border border-[var(--card-border)] shadow-xs flex flex-col p-3.5 sm:p-5 overflow-hidden lg:h-[calc(100dvh-17rem)]"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <div className="flex flex-col h-full overflow-y-auto pr-0.5">
            {/* Header */}
            <div className="pb-3 border-b border-[var(--divider)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded">
                      {selectedProbe.id}
                    </span>
                    <span className="text-xs font-semibold text-[var(--text-secondary)] bg-[var(--surface)] border border-[var(--divider)] px-2 py-0.5 rounded">
                      {selectedProbe.category}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${statusPillClass(selectedProbe.status)}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(selectedProbe.status)}`} />
                      {selectedProbe.status.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-[var(--text-heading)]">
                    {selectedProbe.name}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Target Scope: <strong className="text-[var(--text-heading)]">{selectedProbe.targetScope}</strong> &middot; Last run: <span className="font-mono text-[var(--text-muted)]">{selectedProbe.lastExecuted}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTriggerRun}
                    disabled={isRunningProbe}
                    className="tap-pop flex items-center gap-1.5 rounded-xl bg-[var(--accent-solid)] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:brightness-110 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Play size={12} className={isRunningProbe ? "animate-spin" : "fill-white"} />
                    <span>{isRunningProbe ? "Running Probe..." : "Run This Probe"}</span>
                  </button>
                </div>
              </div>

              {/* Inspector Tabs */}
              <div className="flex space-x-1 border-b border-[var(--divider)] -mb-3 mt-4 overflow-x-auto scrollbar-none">
                {(
                  [
                    { id: "overview", label: "Overview" },
                    { id: "console", label: "Live Console" },
                    { id: "assertions", label: `Assertions (${assertions.length})` },
                    { id: "history", label: "Run History" },
                    { id: "remediation", label: "Remediation" },
                    { id: "audit", label: "Audit Log" }
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
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
                  <h3 className="text-xs font-bold text-[var(--text-heading)] mb-2">Probe Execution Spec</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-[var(--text-muted)] block">Frequency</span>
                      <strong className="text-slate-800 font-mono">{selectedProbe.frequency}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-[var(--text-muted)] block">p95 Latency</span>
                      <strong className="text-slate-800 font-mono">{selectedProbe.durationMs}ms</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-[var(--text-muted)] block">Timeout Threshold</span>
                      <strong className="text-slate-800 font-mono">1,500ms</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-[var(--text-muted)] block">Execution Agent</span>
                      <strong className="text-slate-800">sre-probe-runner-bom-01</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-[var(--text-muted)] block">Protocol</span>
                      <strong className="text-slate-800 font-mono">gRPC / HTTPS Sweep</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-[var(--text-muted)] block">Result Cryptographic Seal</span>
                      <strong className="text-slate-800 font-mono text-[10px]">sha256:7f4a...9b12</strong>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--divider)] p-3.5 bg-[var(--surface)]">
                  <h3 className="text-xs font-bold text-[var(--text-heading)] mb-2">Telemetry Summary</h3>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedProbe.outputSummary}
                  </p>
                  {selectedProbe.status === "failed" && (
                    <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-900 flex items-center justify-between">
                      <div>
                        <strong>Correlated Incident:</strong> INC-1042 (Meta WhatsApp Egress Failure)
                      </div>
                      <Link
                        href="/devops-sre/incidents"
                        className="tap-pop flex items-center gap-1 font-semibold text-rose-700 hover:text-rose-900 underline"
                      >
                        <span>View Incident 360</span>
                        <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-[var(--divider)] p-3.5 bg-[var(--surface)]">
                  <h3 className="text-xs font-bold text-[var(--text-heading)] mb-2">Assertion Breakdown</h3>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                      <CheckCircle2 size={14} />
                      <span>{passedCount} Passed</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-rose-700 font-semibold">
                      <AlertTriangle size={14} />
                      <span>{failedCount} Failed</span>
                    </div>
                    <div className="text-[var(--text-muted)]">
                      Coverage: <strong>100%</strong> of required SLA conditions
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LIVE CONSOLE */}
            {activeTab === "console" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-xs text-slate-600 font-semibold">LIVE TTY / EMULATOR STREAM</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(consoleLogs.join("\n"), "Console Logs")}
                    className="tap-pop flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    {copiedText === "Console Logs" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>{copiedText === "Console Logs" ? "Copied!" : "Copy Output"}</span>
                  </button>
                </div>

                <div className="rounded-xl bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-slate-300 border border-slate-800 shadow-inner max-h-[380px] overflow-y-auto scrollbar-thin">
                  {consoleLogs.map((line, idx) => {
                    const isWarn = line.includes("WARN");
                    const isAlert = line.includes("ALERT") || line.includes("FAILED");
                    const isPass = line.includes("PASSED") || line.includes("healthy");

                    return (
                      <div
                        key={idx}
                        className={`py-0.5 ${
                          isAlert
                            ? "text-rose-400 font-semibold bg-rose-950/30 px-1 rounded"
                            : isWarn
                            ? "text-amber-300 font-semibold bg-amber-950/30 px-1 rounded"
                            : isPass
                            ? "text-emerald-400"
                            : "text-slate-300"
                        }`}
                      >
                        {line}
                      </div>
                    );
                  })}
                  {isRunningProbe && (
                    <div className="text-indigo-400 animate-pulse py-1">
                      &gt;&gt; Running fresh assertion sweep across {selectedProbe.targetScope}...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: ASSERTIONS */}
            {activeTab === "assertions" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>ASSERTION CRITERIA MATRIX</span>
                  <span>{passedCount}/{assertions.length} CRITERIA SATISFIED</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[var(--divider)]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-[11px] font-semibold text-[var(--text-muted)] border-b border-[var(--divider)]">
                      <tr>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Assertion Rule</th>
                        <th className="py-2.5 px-3">Expected</th>
                        <th className="py-2.5 px-3">Actual Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--divider)] bg-[var(--surface)]">
                      {assertions.map((ast) => (
                        <tr key={ast.id} className="hover:bg-[var(--search-bg)]/50">
                          <td className="py-2 px-3 whitespace-nowrap">
                            {ast.passed ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded text-[10px]">
                                <CheckCircle2 size={11} /> PASS
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-300 font-bold bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 px-2 py-0.5 rounded text-[10px]">
                                <AlertTriangle size={11} /> FAIL
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-semibold text-[var(--text-heading)]">
                            <div>{ast.name}</div>
                            <div className="font-mono text-[10px] text-[var(--text-muted)]">{ast.condition}</div>
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-[var(--text-muted)]">
                            {ast.expected}
                          </td>
                          <td className={`py-2 px-3 font-mono text-[11px] font-bold ${ast.passed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                            {ast.actual}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: HISTORY */}
            {activeTab === "history" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>LAST 5 SWEEPS</span>
                  <span>RETENTION: 30 DAYS</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[var(--divider)]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-[11px] font-semibold text-[var(--text-muted)] border-b border-[var(--divider)]">
                      <tr>
                        <th className="py-2.5 px-3">Time</th>
                        <th className="py-2.5 px-3">Result</th>
                        <th className="py-2.5 px-3">Duration</th>
                        <th className="py-2.5 px-3">Trigger / Actor</th>
                        <th className="py-2.5 px-3">Merkle Hash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--divider)] bg-[var(--surface)]">
                      {runHistory.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[var(--search-bg)]/50">
                          <td className="py-2 px-3 whitespace-nowrap text-[var(--text-heading)] font-medium">{item.time}</td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${statusPillClass(item.status)}`}>
                              {item.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-[var(--text-heading)]">{item.duration}</td>
                          <td className="py-2 px-3 text-[var(--text-muted)]">{item.trigger}</td>
                          <td className="py-2 px-3 font-mono text-[10.5px] text-[var(--text-muted)]">{item.hash}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: REMEDIATION */}
            {activeTab === "remediation" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-indigo-950">Automated Remediation Playbook</h4>
                      <p className="text-xs text-indigo-800 mt-0.5">
                        Rules attached to this probe if assertions fail repeatedly (&gt; 2 cycles)
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-semibold">
                      Auto-Remediation Active
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface)] border border-[var(--divider)]">
                      <span>1. Drain unhealthy tenant ingress traffic</span>
                      <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">CONFIGURED</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface)] border border-[var(--divider)]">
                      <span>2. Page SRE on-call via PagerDuty</span>
                      <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">CONFIGURED</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface)] border border-[var(--divider)]">
                      <span>3. Open P1 incident bridge if &gt; 1 tenant impacted</span>
                      <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">CONFIGURED</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--divider)] p-3.5 bg-[var(--surface)]">
                  <h4 className="text-xs font-bold text-[var(--text-heading)] mb-2">Emergency Manual Intervention</h4>
                  <p className="text-xs text-[var(--text-muted)] mb-3">
                    Bypass automated triggers and execute immediate remediation playbook via Platform Ops gate.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setToastMessage("Emergency remediation playbook dished to Platform Ops approval queue.");
                      setTimeout(() => setToastMessage(null), 4000);
                    }}
                    className="tap-pop rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition-colors"
                  >
                    Trigger Emergency Remediation
                  </button>
                </div>
              </div>
            )}

            {/* TAB 6: AUDIT LOG */}
            {activeTab === "audit" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>PROBE CONFIGURATION AUDIT TRAIL</span>
                  <span>TAMPER-RESISTANT MERKLE CHAIN</span>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)] text-xs">
                    <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                      <span>2026-09-26 12:45:10 UTC</span>
                      <span className="font-mono">Leaf #10492</span>
                    </div>
                    <div className="font-semibold text-[var(--text-heading)]">
                      Probe Sweep Executed by SRE Engine
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Actor: system-cron-daemon &middot; Result: {selectedProbe.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-[var(--divider)] bg-[var(--surface)] text-xs">
                    <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                      <span>2026-09-25 18:20:00 UTC</span>
                      <span className="font-mono">Leaf #10488</span>
                    </div>
                    <div className="font-semibold text-slate-800">
                      Assertion Threshold Updated: latency limit raised to 250ms
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Actor: Arjun Mehta [Lead SRE] &middot; Approval: Change CAB-8812
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* ── RUN PROBE SWEEP MODAL ─────────────────────────────────────── */}
      {showRunModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[var(--surface)] p-5 shadow-2xl border border-[var(--divider)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--divider)]">
              <h3 className="text-base font-bold text-[var(--text-heading)]">
                Launch Diagnostic Sweep
              </h3>
              <button
                type="button"
                onClick={() => setShowRunModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 my-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-heading)] mb-1">
                  Probe Selection
                </label>
                <select
                  value={selectedProbeId}
                  onChange={(e) => setSelectedProbeId(e.target.value)}
                  className="w-full rounded-xl border border-[var(--divider)] bg-[var(--search-bg)] p-2 text-xs font-semibold text-[var(--text-heading)] focus:outline-none"
                >
                  {sreDiagnosticProbes.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[var(--surface)] text-[var(--text-heading)]">
                      [{p.id}] {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-heading)] mb-1">
                  Target Scope
                </label>
                <div className="p-2.5 rounded-xl bg-[var(--search-bg)] border border-[var(--divider)] font-semibold text-[var(--text-heading)]">
                  {selectedProbe.targetScope}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="verboseLogs" defaultChecked className="rounded border-[var(--divider)]" />
                <label htmlFor="verboseLogs" className="text-[var(--text-heading)] font-medium">
                  Stream verbose telemetry to Live Console
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--divider)]">
              <button
                type="button"
                onClick={() => setShowRunModal(false)}
                className="tap-pop rounded-xl border border-[var(--divider)] px-3.5 py-1.5 text-xs font-semibold text-[var(--text-heading)] hover:bg-[var(--search-bg)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRunModal(false);
                  handleTriggerRun();
                }}
                className="tap-pop flex items-center gap-1.5 rounded-xl bg-[var(--icon-btn-navy)] px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                <Play size={12} className="fill-white" />
                <span>Execute Sweep</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

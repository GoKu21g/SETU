"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Terminal, CheckCircle2, AlertCircle, Copy, Play } from "lucide-react";
import Card from "@/components/shared/Card";
import StatusBadge from "@/components/shared/StatusBadge";
import type { StatusLevel } from "@/components/shared/StatusBadge";

type ApiLogEntry = {
  id: string;
  traceId: string;
  timestamp: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  endpoint: string;
  status: number;
  statusLevel: StatusLevel;
  durationMs: number;
  workspaceId: string;
  workspaceName: string;
  error?: string;
  curl: string;
};

const MOCK_LOGS: ApiLogEntry[] = [
  {
    id: "log-1",
    traceId: "trc_94812_01j8m4k",
    timestamp: "12:54:18.421",
    method: "POST",
    endpoint: "/v2/whatsapp/messages/webhook",
    status: 401,
    statusLevel: "critical",
    durationMs: 342,
    workspaceId: "WS-94812",
    workspaceName: "Sharma Traders",
    error: "HMAC signature verification failed: registered Meta WABA access token has expired",
    curl: "curl -X POST https://api.setu.co/v2/whatsapp/messages/webhook -H 'X-Setu-Trace-ID: trc_94812_01j8m4k' -H 'X-Hub-Signature-256: sha256=a1b2c3d4...' -d '{\"event\":\"message_status\"}'",
  },
  {
    id: "log-2",
    traceId: "trc_10842_02k9p1x",
    timestamp: "12:53:50.118",
    method: "POST",
    endpoint: "/v1/payments/razorpay/callback",
    status: 504,
    statusLevel: "warning",
    durationMs: 1240,
    workspaceId: "WS-10842",
    workspaceName: "Bharat Agro",
    error: "Gateway Timeout: upstream payment aggregator took >1200ms to respond",
    curl: "curl -X POST https://api.setu.co/v1/payments/razorpay/callback -H 'X-Setu-Trace-ID: trc_10842_02k9p1x' -d '{\"payment_id\":\"pay_K9z...\"}'",
  },
  {
    id: "log-3",
    traceId: "trc_33910_03m7q9z",
    timestamp: "12:52:14.882",
    method: "POST",
    endpoint: "/v1/upi/deep-links/create",
    status: 200,
    statusLevel: "healthy",
    durationMs: 48,
    workspaceId: "WS-33910",
    workspaceName: "Rajdhani Fleet",
    curl: "curl -X POST https://api.setu.co/v1/upi/deep-links/create -H 'X-Setu-Trace-ID: trc_33910_03m7q9z' -d '{\"amount\":45000}'",
  },
  {
    id: "log-4",
    traceId: "trc_77104_04p2r5a",
    timestamp: "12:51:02.049",
    method: "GET",
    endpoint: "/v2/gst/verify/27AAACS1429B1ZB",
    status: 200,
    statusLevel: "healthy",
    durationMs: 38,
    workspaceId: "WS-77104",
    workspaceName: "Kalyan Logistics",
    curl: "curl -X GET https://api.setu.co/v2/gst/verify/27AAACS1429B1ZB -H 'X-Setu-Trace-ID: trc_77104_04p2r5a'",
  },
  {
    id: "log-5",
    traceId: "trc_55219_05q1s8b",
    timestamp: "12:50:33.729",
    method: "POST",
    endpoint: "/v1/bbps/fetch-bill",
    status: 200,
    statusLevel: "healthy",
    durationMs: 64,
    workspaceId: "WS-55219",
    workspaceName: "Deccan Retail",
    curl: "curl -X POST https://api.setu.co/v1/bbps/fetch-bill -H 'X-Setu-Trace-ID: trc_55219_05q1s8b' -d '{\"biller_id\":\"MSEB001\"}'",
  },
];

export default function ApiLogsPage() {
  const [selectedLog, setSelectedLog] = useState<ApiLogEntry>(MOCK_LOGS[0]);
  const [filterQuery, setFilterQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "errors" | "success">("all");

  const filteredLogs = MOCK_LOGS.filter((log) => {
    const matchesQuery =
      log.endpoint.toLowerCase().includes(filterQuery.toLowerCase()) ||
      log.traceId.toLowerCase().includes(filterQuery.toLowerCase()) ||
      log.workspaceName.toLowerCase().includes(filterQuery.toLowerCase());
    if (statusFilter === "errors") return matchesQuery && log.status >= 400;
    if (statusFilter === "success") return matchesQuery && log.status < 400;
    return matchesQuery;
  });

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/technical-support/dashboard"
            className="tap-pop flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--divider)] bg-white text-[var(--role-text)] shadow-2xs hover:bg-[var(--search-bg)]"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-heading)]">
              API Telemetry & Request Tracing
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Real-time HTTP ingress/egress logs across monitored customer workspaces
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-[var(--surface-muted)] p-0.5">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                statusFilter === "all" ? "bg-white text-[var(--text-heading)] shadow-sm font-semibold" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              All Statuses
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("errors")}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                statusFilter === "errors" ? "bg-white text-[var(--text-heading)] shadow-sm font-semibold text-red-600" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              Errors (4xx / 5xx)
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("success")}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                statusFilter === "success" ? "bg-white text-[var(--text-heading)] shadow-sm font-semibold text-emerald-600" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              2xx Success
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-[var(--space-md)] screen-xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* Stream Table */}
        <Card
          title="Live Request Stream"
          description="Click any trace to inspect full HTTP request and root-cause analysis"
          action={
            <div className="relative w-64">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Filter by trace ID or endpoint..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full rounded-lg border border-[var(--divider)] bg-[var(--search-bg)] py-1 pl-8 pr-2 text-xs outline-none focus:border-[var(--icon-btn-navy)]"
              />
            </div>
          }
        >
          <div className="flex flex-col divide-y divide-[var(--divider)] overflow-y-auto max-h-[36rem]">
            {filteredLogs.map((log) => {
              const isSelected = selectedLog.id === log.id;
              return (
                <button
                  key={log.id}
                  type="button"
                  onClick={() => setSelectedLog(log)}
                  className={`flex items-center justify-between p-3 text-left transition-colors ${
                    isSelected ? "bg-blue-50/60 border-l-2 border-[var(--icon-btn-navy)]" : "hover:bg-[var(--search-bg)]/60"
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono-id text-[11px] font-bold px-1.5 py-0.5 rounded ${
                        log.method === "POST" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {log.method}
                      </span>
                      <span className="font-semibold text-xs text-[var(--text-heading)] truncate">
                        {log.endpoint}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] mt-1">
                      <span className="font-mono-id">{log.traceId}</span>
                      <span>·</span>
                      <span>{log.workspaceName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono-id text-xs text-[var(--text-muted)]">
                      {log.durationMs}ms
                    </span>
                    <StatusBadge status={log.statusLevel} label={`${log.status}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Deep Inspection Drawer */}
        <Card
          title="Diagnostic Trace Inspector"
          description={`Inspecting ${selectedLog.traceId}`}
          action={
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(selectedLog.curl)}
              className="tap-pop flex items-center gap-1.5 rounded-lg border border-[var(--divider)] bg-white px-2.5 py-1 text-xs font-medium text-[var(--icon-btn-navy)] shadow-2xs hover:bg-[var(--search-bg)]"
            >
              <Copy size={12} />
              Copy cURL
            </button>
          }
        >
          <div className="flex flex-col gap-4 overflow-y-auto max-h-[36rem] p-1">
            {selectedLog.error && (
              <div className="rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs">
                <p className="font-bold text-red-900 mb-0.5 flex items-center gap-1">
                  <AlertCircle size={14} className="text-red-600" />
                  Diagnostic Root Cause:
                </p>
                <p className="text-red-700 leading-relaxed">{selectedLog.error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-[var(--divider)] p-2 bg-slate-50">
                <span className="text-[var(--text-muted)] block text-[11px]">Workspace</span>
                <span className="font-bold text-[var(--text-heading)]">{selectedLog.workspaceName} ({selectedLog.workspaceId})</span>
              </div>
              <div className="rounded-lg border border-[var(--divider)] p-2 bg-slate-50">
                <span className="text-[var(--text-muted)] block text-[11px]">Timestamp & Latency</span>
                <span className="font-bold text-[var(--text-heading)]">{selectedLog.timestamp} · {selectedLog.durationMs}ms</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-[var(--text-heading)] mb-1">Reproduce via cURL:</p>
              <pre className="rounded-xl bg-slate-900 p-3 font-mono-id text-[11px] text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                {selectedLog.curl}
              </pre>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[var(--divider)] pt-3">
              <Link
                href={`/technical-support/workspaces?id=${selectedLog.workspaceId}`}
                className="tap-pop rounded-lg border border-[var(--divider)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--icon-btn-navy)] hover:bg-[var(--search-bg)]"
              >
                Inspect Workspace 360 &rarr;
              </Link>
              <Link
                href={`/technical-support/diagnostics?target=${selectedLog.workspaceId}`}
                className="tap-pop rounded-lg bg-[var(--icon-btn-navy)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Run Diagnostics &rarr;
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

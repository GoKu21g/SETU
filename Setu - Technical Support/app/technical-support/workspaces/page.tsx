"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Layers, ShieldCheck, Play, RefreshCw, Key, Network, CheckCircle2, AlertOctagon } from "lucide-react";
import Card from "@/components/shared/Card";
import StatusBadge from "@/components/shared/StatusBadge";
import { customerWorkspaces } from "@/lib/mock-data/technical-support";

export default function Workspace360Page() {
  const [selectedId, setSelectedId] = useState("WS-94812");
  const [activeTab, setActiveTab] = useState<"matrix" | "integrations" | "traces" | "alerts">("integrations");

  const workspace = customerWorkspaces.find((w) => w.id === selectedId) || customerWorkspaces[0];

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      {/* Header */}
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
              Workspace 360 Dossier
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Unified tenant telemetry, credentials validation, and progressive diagnostic state
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-lg border border-[var(--divider)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--icon-btn-navy)] shadow-2xs outline-none"
          >
            {customerWorkspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Matrix Strip */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--card-radius)] border border-[var(--divider)] bg-white p-4"
        style={{ boxShadow: "var(--card-shadow)" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[var(--icon-btn-navy)] font-bold text-lg">
            {workspace.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[var(--text-heading)]">{workspace.name}</h2>
              <span className="font-mono-id rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-[var(--text-muted)]">
                {workspace.id}
              </span>
              <StatusBadge status={workspace.healthLevel} label={workspace.health} />
            </div>
            <p className="text-xs text-[var(--text-muted)]">{workspace.orgName} · Plan: {workspace.plan}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="border-l border-[var(--divider)] pl-4">
            <span className="text-[var(--text-muted)] block text-[11px]">Primary Rail</span>
            <strong className="text-[var(--text-heading)]">{workspace.primaryService}</strong>
          </div>
          <div className="border-l border-[var(--divider)] pl-4">
            <span className="text-[var(--text-muted)] block text-[11px]">API Success</span>
            <strong className="text-emerald-700 font-mono-id">{workspace.apiSuccessRate}</strong>
          </div>
          <div className="border-l border-[var(--divider)] pl-4">
            <span className="text-[var(--text-muted)] block text-[11px]">Open Alerts</span>
            <strong className="text-red-700 font-mono-id">{workspace.openIncidents} Incidents</strong>
          </div>
          <div className="border-l border-[var(--divider)] pl-4">
            <Link
              href={`/technical-support/diagnostics?target=${workspace.id}`}
              className="tap-pop inline-flex items-center gap-1.5 rounded-lg bg-[var(--icon-btn-navy)] px-3 py-1.5 font-semibold text-white shadow-2xs hover:bg-slate-800"
            >
              <Play size={12} />
              Run Probe
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--divider)] gap-6 text-sm font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("integrations")}
          className={`pb-2.5 transition-colors border-b-2 ${
            activeTab === "integrations"
              ? "border-[var(--icon-btn-navy)] font-semibold text-[var(--icon-btn-navy)]"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          }`}
        >
          Integrations & Credentials
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("matrix")}
          className={`pb-2.5 transition-colors border-b-2 ${
            activeTab === "matrix"
              ? "border-[var(--icon-btn-navy)] font-semibold text-[var(--icon-btn-navy)]"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          }`}
        >
          Product Matrix
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("traces")}
          className={`pb-2.5 transition-colors border-b-2 ${
            activeTab === "traces"
              ? "border-[var(--icon-btn-navy)] font-semibold text-[var(--icon-btn-navy)]"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          }`}
        >
          Diagnostic Traces
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("alerts")}
          className={`pb-2.5 transition-colors border-b-2 ${
            activeTab === "alerts"
              ? "border-[var(--icon-btn-navy)] font-semibold text-[var(--icon-btn-navy)]"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          }`}
        >
          Active Incidents ({workspace.openIncidents})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "integrations" && (
        <div className="grid grid-cols-1 items-stretch gap-[var(--space-md)] screen-sm:grid-cols-2">
          <Card title="Webhook Endpoints & HMAC" description="Customer-provided delivery URLs">
            <div className="flex flex-col gap-3">
              <div className="rounded-xl border border-[var(--divider)] p-3 bg-slate-50/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[var(--text-heading)]">WhatsApp Events Ingestion</span>
                  <StatusBadge status={workspace.id === "WS-94812" ? "critical" : "healthy"} label={workspace.id === "WS-94812" ? "401 HMAC Failed" : "200 Active"} />
                </div>
                <p className="font-mono-id text-xs text-[var(--text-muted)]">https://api.sharmatraders.in/webhooks/setu</p>
                <div className="mt-2 text-[11px] text-[var(--role-text)] flex justify-between">
                  <span>Secret: ••••••••••42f9</span>
                  <span>p95 Latency: 148ms</span>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--divider)] p-3 bg-slate-50/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[var(--text-heading)]">Payment Reconciliation</span>
                  <StatusBadge status="healthy" label="200 Active" />
                </div>
                <p className="font-mono-id text-xs text-[var(--text-muted)]">https://api.sharmatraders.in/payments/callback</p>
                <div className="mt-2 text-[11px] text-[var(--role-text)] flex justify-between">
                  <span>Secret: ••••••••••88bc</span>
                  <span>p95 Latency: 44ms</span>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Third-Party Provider Tokens" description="Upstream authentication keys and OAuth credentials">
            <div className="flex flex-col gap-3">
              <div className={`rounded-xl border p-3 ${
                workspace.id === "WS-94812" ? "border-red-200 bg-red-50/60" : "border-[var(--divider)] bg-slate-50/50"
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[var(--text-heading)]">Meta Cloud API (WABA)</span>
                  <StatusBadge status={workspace.id === "WS-94812" ? "critical" : "healthy"} label={workspace.id === "WS-94812" ? "Token Expired" : "Valid"} />
                </div>
                <p className="text-xs text-[var(--text-muted)]">OAuth App: Sahayogi WhatsApp Production Bridge</p>
                <p className="text-[11px] text-red-700 mt-1">
                  {workspace.id === "WS-94812" ? "Expired 14h ago. Customer action required to refresh long-lived token via Meta Developer Console." : "Expires in 42 days."}
                </p>
              </div>

              <div className="rounded-xl border border-[var(--divider)] p-3 bg-slate-50/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[var(--text-heading)]">Razorpay Aggregator Keys</span>
                  <StatusBadge status="healthy" label="Valid" />
                </div>
                <p className="text-xs text-[var(--text-muted)]">Key ID: rzp_live_••••••••39a1</p>
                <p className="text-[11px] text-emerald-700 mt-1">All signature checks nominal.</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "matrix" && (
        <Card title="Active Product Capabilities" description="Subscribed services and provisioned quotas">
          <div className="grid grid-cols-1 gap-3 screen-sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--divider)] p-3 bg-white">
              <h3 className="font-bold text-xs text-[var(--text-heading)]">Pay with Sahayogi (UPI & QR)</h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">Quota: 50,000 tx/mo · Consumed: 34,120</p>
              <div className="mt-2"><StatusBadge status="healthy" label="Nominal" /></div>
            </div>
            <div className="rounded-xl border border-[var(--divider)] p-3 bg-white">
              <h3 className="font-bold text-xs text-[var(--text-heading)]">Chat with Sahayogi (WhatsApp)</h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">Tier: Enterprise Multi-Agent · Messages: 120,400</p>
              <div className="mt-2"><StatusBadge status={workspace.id === "WS-94812" ? "critical" : "healthy"} label={workspace.id === "WS-94812" ? "Degraded" : "Nominal"} /></div>
            </div>
            <div className="rounded-xl border border-[var(--divider)] p-3 bg-white">
              <h3 className="font-bold text-xs text-[var(--text-heading)]">Tax Sahayogi (GST Ingestion)</h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">Entities: 12 GSTINs · Auto-reconciliation: ON</p>
              <div className="mt-2"><StatusBadge status="healthy" label="Nominal" /></div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "traces" && (
        <Card title="Recent Diagnostic Executions" description="Probe outputs targeting this tenant">
          <div className="flex flex-col gap-2">
            <div className="rounded-lg border border-[var(--divider)] p-2.5 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-[var(--text-heading)]">Ping Webhook SSL & Handshake</p>
                <p className="text-[11px] text-[var(--text-muted)]">Endpoint: https://api.sharmatraders.in/webhooks/setu · 84ms</p>
              </div>
              <StatusBadge status="healthy" label="TLS 1.3 PASS" />
            </div>
            <div className="rounded-lg border border-[var(--divider)] p-2.5 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-[var(--text-heading)]">HMAC Payload Signature Validation</p>
                <p className="text-[11px] text-[var(--text-muted)]">Verified with registered tenant secret key</p>
              </div>
              <StatusBadge status={workspace.id === "WS-94812" ? "critical" : "healthy"} label={workspace.id === "WS-94812" ? "HMAC FAIL" : "PASS"} />
            </div>
          </div>
        </Card>
      )}

      {activeTab === "alerts" && (
        <Card title="Active Incidents & Correlated Cases" description="Customer support escalation tickets">
          {workspace.openIncidents > 0 ? (
            <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold font-mono-id text-red-900">INC-1042 · CS-49201</span>
                <StatusBadge status="critical" label="Investigating" />
              </div>
              <p className="font-bold text-red-900">Customer reports automated invoice broadcasts failing over WhatsApp</p>
              <p className="text-[11px] text-red-700 mt-1 leading-relaxed">
                Correlated with Meta OAuth token expiration on 2026-09-25. Operator runbook: Request customer workspace admin re-authenticate via Settings &gt; Integrations.
              </p>
            </div>
          ) : (
            <p className="text-xs text-[var(--text-muted)] p-4 text-center">No active alerts or open incidents for this workspace.</p>
          )}
        </Card>
      )}
    </div>
  );
}

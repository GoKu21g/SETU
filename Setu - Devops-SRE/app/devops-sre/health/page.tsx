"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Server, Activity, Search, ShieldCheck, Network, Layers, AlertTriangle } from "lucide-react";
import Card from "@/components/shared/Card";
import StatusBadge from "@/components/shared/StatusBadge";
import { criticalServices, type CriticalServiceSlo } from "@/lib/mock-data/devops-sre";

export default function SrePlatformHealthPage() {
  const [selectedService, setSelectedService] = useState<CriticalServiceSlo>(criticalServices[1]); // WABA by default
  const [activeTab, setActiveTab] = useState<"metrics" | "dependency" | "traces" | "uptime">("metrics");
  const [filterQuery, setFilterQuery] = useState("");

  const filteredServices = criticalServices.filter((s) =>
    s.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/devops-sre/dashboard"
            className="tap-pop flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--divider)] bg-white text-[var(--role-text)] shadow-2xs hover:bg-[var(--search-bg)]"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-heading)]">
              Platform Health &amp; Observability Deep-Dive
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Metrics percentiles (p50–p99), 30-day uptime strips, traces, and dependency blast-radius graph
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status="critical" label="1 Critical Degraded" />
          <StatusBadge status="warning" label="1 SLO Burn Risk" />
          <StatusBadge status="healthy" label="14 Nominal" />
        </div>
      </div>

      {/* Main Grid: Service Selector on Left, Deep Observability on Right */}
      <div className="grid grid-cols-1 items-stretch gap-[var(--space-md)] screen-xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        {/* Services List */}
        <Card
          title="Monitored Microservices"
          description="Select service to inspect telemetry layers"
          action={
            <div className="relative w-44">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Filter services..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full rounded-lg border border-[var(--divider)] bg-[var(--search-bg)] py-1 pl-7 pr-2 text-xs outline-none"
              />
            </div>
          }
        >
          <div className="flex flex-col divide-y divide-[var(--divider)] overflow-y-auto max-h-[38rem]">
            {filteredServices.map((svc) => {
              const isSelected = selectedService.id === svc.id;
              return (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => setSelectedService(svc)}
                  className={`flex flex-col gap-1 p-3 text-left transition-colors ${
                    isSelected ? "bg-blue-50/70 border-l-4 border-[var(--icon-btn-navy)]" : "hover:bg-[var(--search-bg)]/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[var(--text-heading)]">{svc.name}</span>
                    <StatusBadge status={svc.statusLevel} label={svc.status} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono-id">
                    <span>SLO: {svc.targetSlo} ({svc.currentAvailability})</span>
                    <span>p95: {svc.p95Latency}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>RPS: {svc.throughputRps}</span>
                    <span>Queue: {svc.queueDepth}</span>
                    <span className={svc.errorBudgetBurnPct > 100 ? "text-red-700 font-bold" : ""}>
                      Burn: {svc.errorBudgetBurnPct}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Selected Service Deep-Dive */}
        <div className="flex flex-col gap-[var(--space-md)]">
          {/* Service Banner */}
          <div
            className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--card-radius)] border border-[var(--divider)] bg-white p-4"
            style={{ boxShadow: "var(--card-shadow)" }}
          >
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[var(--text-heading)]">{selectedService.name}</h2>
                <StatusBadge status={selectedService.statusLevel} label={selectedService.status} />
                <span className="text-xs text-[var(--text-muted)] font-mono-id">ID: {selectedService.id}</span>
              </div>
              <p className="text-xs text-[var(--role-text)] mt-0.5">
                Category: {selectedService.category} · Target SLO: {selectedService.targetSlo} · Current: {selectedService.currentAvailability}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/devops-sre/diagnostics?service=${selectedService.id}`}
                className="tap-pop rounded-lg bg-[var(--icon-btn-navy)] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800"
              >
                Run Fleet Probe &rarr;
              </Link>
            </div>
          </div>

          {/* 30-Day Uptime History Strip */}
          <Card
            title="30-Day Aggregate Uptime History Strip"
            description="Daily reliability health records from Prometheus / Datadog aggregator"
          >
            <div className="flex flex-col gap-2 py-1">
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
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
                      className={`h-8 w-full min-w-[0.75rem] rounded-xs cursor-pointer transition-colors ${dayColor}`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
                <span>30 Days Ago</span>
                <span className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Healthy</span>
                  <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> Degraded</span>
                  <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Outage</span>
                </span>
                <span>Today</span>
              </div>
            </div>
          </Card>

          {/* Tabs for Metrics, Dependencies, Traces */}
          <div className="flex border-b border-[var(--divider)] gap-6 text-sm font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("metrics")}
              className={`pb-2 transition-colors border-b-2 ${
                activeTab === "metrics"
                  ? "border-[var(--icon-btn-navy)] font-semibold text-[var(--icon-btn-navy)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              Latency Percentiles &amp; Golden Signals
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("dependency")}
              className={`pb-2 transition-colors border-b-2 ${
                activeTab === "dependency"
                  ? "border-[var(--icon-btn-navy)] font-semibold text-[var(--icon-btn-navy)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              Dependency Graph &amp; Blast Radius
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("traces")}
              className={`pb-2 transition-colors border-b-2 ${
                activeTab === "traces"
                  ? "border-[var(--icon-btn-navy)] font-semibold text-[var(--icon-btn-navy)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              Cross-Service Trace Path
            </button>
          </div>

          {/* Tab 1: Metrics */}
          {activeTab === "metrics" && (
            <div className="grid grid-cols-2 gap-3 screen-sm:grid-cols-4">
              <div className="rounded-xl border border-[var(--divider)] bg-white p-3">
                <span className="text-xs text-[var(--text-muted)]">p50 Median Latency</span>
                <p className="font-mono-id text-lg font-bold text-[var(--text-heading)] mt-0.5">
                  {selectedService.id === "svc-waba" ? "140ms" : "8ms"}
                </p>
                <span className="text-[10px] text-emerald-600">Nominal 50th percentile</span>
              </div>
              <div className="rounded-xl border border-[var(--divider)] bg-white p-3">
                <span className="text-xs text-[var(--text-muted)]">p90 Latency</span>
                <p className="font-mono-id text-lg font-bold text-[var(--text-heading)] mt-0.5">
                  {selectedService.id === "svc-waba" ? "420ms" : "14ms"}
                </p>
                <span className="text-[10px] text-amber-600">Elevated threshold</span>
              </div>
              <div className="rounded-xl border border-[var(--divider)] bg-white p-3">
                <span className="text-xs text-[var(--text-muted)]">p95 Latency</span>
                <p className={`font-mono-id text-lg font-bold mt-0.5 ${
                  selectedService.statusLevel === "critical" ? "text-red-600" : "text-[var(--text-heading)]"
                }`}>
                  {selectedService.p95Latency}
                </p>
                <span className="text-[10px] text-slate-500">Service SLA criteria</span>
              </div>
              <div className="rounded-xl border border-[var(--divider)] bg-white p-3">
                <span className="text-xs text-[var(--text-muted)]">p99 Tail Latency</span>
                <p className="font-mono-id text-lg font-bold text-red-700 mt-0.5">
                  {selectedService.id === "svc-waba" ? "1,840ms" : "42ms"}
                </p>
                <span className="text-[10px] text-red-600">Timeout trigger window</span>
              </div>
            </div>
          )}

          {/* Tab 2: Dependency Graph */}
          {activeTab === "dependency" && (
            <Card
              title="Upstream &amp; Downstream Dependency Topology"
              description="Visual mapping of services to trace cascade failures and blast radius"
            >
              <div className="flex flex-col gap-3 py-2">
                <p className="text-xs text-[var(--role-text)]">
                  When <strong>{selectedService.name}</strong> degrades, the following upstream dependencies and downstream consumers are affected:
                </p>

                <div className="grid grid-cols-1 gap-2 screen-sm:grid-cols-3">
                  <div className="rounded-xl border border-[var(--divider)] p-3 bg-slate-50">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                      Upstream Ingress
                    </span>
                    <p className="text-xs font-semibold text-[var(--text-heading)]">Client API Gateways</p>
                    <p className="text-[11px] text-slate-500">Cloudflare Edge &gt; Envoy Ingress</p>
                  </div>

                  <div className="rounded-xl border-2 border-[var(--icon-btn-navy)] p-3 bg-blue-50/50">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--icon-btn-navy)] block mb-1">
                      Target Service
                    </span>
                    <p className="text-xs font-bold text-[var(--text-heading)]">{selectedService.name}</p>
                    <StatusBadge status={selectedService.statusLevel} label={selectedService.status} />
                  </div>

                  <div className="rounded-xl border border-[var(--divider)] p-3 bg-slate-50">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                      Dependencies ({selectedService.dependencies.length})
                    </span>
                    <ul className="text-xs text-slate-700 list-disc list-inside">
                      {selectedService.dependencies.map((dep) => (
                        <li key={dep} className="truncate">{dep}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Tab 3: Trace Path */}
          {activeTab === "traces" && (
            <Card
              title="Cross-Service Distributed Trace Sample"
              description="OpenTelemetry trace span timing across microservice boundaries"
            >
              <div className="flex flex-col gap-2 font-mono-id text-xs py-1">
                <div className="p-2.5 rounded-lg border border-[var(--divider)] bg-slate-50 flex justify-between items-center">
                  <span>1. envoy-ingress (GET /v2/whatsapp/messages)</span>
                  <span className="text-slate-500">4ms (Span: sp_01)</span>
                </div>
                <div className="p-2.5 rounded-lg border border-[var(--divider)] bg-blue-50/50 ml-4 flex justify-between items-center">
                  <span>2. setu-waba-bridge (HMAC Verification)</span>
                  <span className="text-red-600 font-bold">342ms (FAIL: 401 Unauthorized)</span>
                </div>
                <div className="p-2.5 rounded-lg border border-[var(--divider)] bg-slate-50 ml-8 flex justify-between items-center">
                  <span>3. graph.facebook.com (Token Auth Check)</span>
                  <span className="text-red-700 font-bold">494ms (Token Expired)</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

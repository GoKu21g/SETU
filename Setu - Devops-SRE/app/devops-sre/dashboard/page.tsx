"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HeartPulse,
  AlertTriangle,
  Rocket,
  Terminal,
  Activity,
  AlertOctagon,
  Clock,
  ShieldCheck,
  CreditCard,
  Layers,
  ArrowRight,
  Server,
  Zap,
  ExternalLink,
  Flame,
} from "lucide-react";
import Card from "@/components/shared/Card";
import CalendarCard from "@/components/shared/CalendarCard";
import GreetingCard from "@/components/shared/GreetingCard";
import KPITile from "@/components/shared/KPITile";
import DataTable, { type Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import type { StatusLevel } from "@/components/shared/StatusBadge";
import DrillLink from "@/components/shared/DrillLink";
import DonutChart from "@/components/shared/charts/DonutChart";
import AreaTrendChart from "@/components/shared/charts/AreaTrendChart";
import { useEventRefresh } from "@/lib/hooks/use-event-refresh";
import {
  sreKpiData,
  sreFailureCategories,
  criticalServices,
  sreIncidents,
  sreReleases,
  sreDiagnosticProbes,
  buildSreTelemetryTrend,
  type TrendRangeDays,
  type Incident360,
  type CriticalServiceSlo,
} from "@/lib/mock-data/devops-sre";



const TREND_RANGE_OPTIONS: { label: string; value: TrendRangeDays }[] = [
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
];

export default function SreControlRoomPage() {
  const router = useRouter();
  const { updatedAt, stale } = useEventRefresh();
  const [trendRange, setTrendRange] = useState<TrendRangeDays>(30);
  const telemetryTrend = useMemo(() => buildSreTelemetryTrend(trendRange), [trendRange]);

  // Incidents sorted strictly by severity (P1 > P2 > P3 > P4)
  const severityRank: Record<string, number> = {
    "P1-Critical": 1,
    "P2-High": 2,
    "P3-Medium": 3,
    "P4-Low": 4,
  };

  const sortedIncidents = useMemo(() => {
    return [...sreIncidents].sort(
      (a, b) => (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9)
    );
  }, []);

  const incidentColumns: Column<Incident360>[] = [
    {
      key: "id",
      header: "Incident ID & Title",
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-semibold text-xs text-[var(--icon-btn-navy)] cursor-pointer hover:underline">
            {r.id}: {r.title}
          </span>
          <span className="text-[11px] text-[var(--text-muted)] font-mono-id">
            Source: {r.detectionSource}
          </span>
        </div>
      ),
      sortValue: (r) => r.id,
    },
    {
      key: "severity",
      header: "Severity",
      render: (r) => (
        <span
          className={`font-mono-id text-xs font-bold px-2 py-0.5 rounded-full ${r.severity === "P1-Critical"
              ? "bg-red-100 text-red-800"
              : "bg-amber-100 text-amber-800"
            }`}
        >
          {r.severity}
        </span>
      ),
      sortValue: (r) => severityRank[r.severity] ?? 9,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.statusLevel} label={r.status} />,
      sortValue: (r) => r.status,
    },
    {
      key: "impact",
      header: "Blast Radius",
      render: (r) => (
        <div className="text-xs">
          <span className="font-semibold text-red-700">{r.affectedWorkspacesCount} Workspaces</span>
          <p className="text-[11px] text-[var(--text-muted)] truncate max-w-[12rem]">
            {r.affectedServices.join(", ")}
          </p>
        </div>
      ),
    },
    {
      key: "commander",
      header: "Incident Commander",
      render: (r) => <span className="text-xs text-[var(--role-text)]">{r.commander}</span>,
    },
    {
      key: "linkedRelease",
      header: "Linked Change",
      render: (r) =>
        r.linkedRelease ? (
          <span className="rounded bg-red-50 border border-red-200 px-1.5 py-0.5 text-[11px] font-semibold text-red-700 font-mono-id">
            {r.linkedRelease.split(" ")[0]}
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      key: "actions",
      header: "Action",
      className: "text-right",
      render: (r) => (
        <button
          type="button"
          onClick={() => router.push(`/devops-sre/incidents?id=${r.id}`)}
          className="tap-pop rounded-lg bg-[var(--icon-btn-navy)] px-2.5 py-1 text-[11px] font-semibold text-white shadow-2xs hover:bg-slate-800"
        >
          Incident 360 &rarr;
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      {/* 1. Row 1: KPI Grid (Greeting + 7 KPIs) + CalendarCard */}
      <div className="grid grid-cols-1 items-stretch gap-[var(--space-md)] screen-xl:grid-cols-[minmax(0,4.2fr)_minmax(0,1fr)]">
        <div className="grid min-w-0 grid-cols-2 gap-[var(--space-md)] screen-sm:grid-cols-4">
          <div className="min-w-0">
            <GreetingCard name="Arjun Mehta" />
          </div>

          <div className="min-w-0">
            <KPITile
              title="Fleet service health"
              value={sreKpiData.fleetServiceHealth.uptimePct}
              note="14 healthy · 1 critical"
              status={sreKpiData.fleetServiceHealth.critical > 0 ? "critical" : "healthy"}
              drillHref="/devops-sre/health"
              updatedAt={updatedAt}
              stale={stale}
              icon={<HeartPulse size={22} />}
              iconBg="var(--status-blue-bg)"
              iconFg="var(--status-blue-fg)"
              trendDirection="up"
              trendValue="18/18 Nom"
            />
          </div>

          <div className="min-w-0">
            <KPITile
              title="Active incidents"
              value={`${sreKpiData.activeIncidents.total}`}
              note="sorted by severity"
              status={sreKpiData.activeIncidents.p1 > 0 ? "critical" : "warning"}
              drillHref="/devops-sre/incidents"
              updatedAt={updatedAt}
              stale={stale}
              icon={<AlertTriangle size={22} />}
              iconBg="var(--status-critical-bg)"
              iconFg="var(--status-critical-fg)"
              secondary={[
                { label: "P1 Critical", value: sreKpiData.activeIncidents.p1, color: "var(--status-critical-fg)" },
                { label: "P2 High", value: sreKpiData.activeIncidents.p2, color: "var(--status-warning-fg)" },
              ]}
            />
          </div>

          <div className="min-w-0">
            <KPITile
              title="MTTA (Detect → Ack)"
              value={sreKpiData.mtta.value}
              note={`target ${sreKpiData.mtta.target}`}
              status="healthy"
              drillHref="/devops-sre/incidents"
              updatedAt={updatedAt}
              stale={stale}
              icon={<Zap size={22} />}
              iconBg="var(--status-healthy-bg)"
              iconFg="var(--status-healthy-fg)"
              trendDirection="down"
              trendValue={sreKpiData.mtta.delta}
            />
          </div>

          <div className="min-w-0">
            <KPITile
              title="MTTR (Ack → Mitigate)"
              value={sreKpiData.mttr.value}
              note={`target ${sreKpiData.mttr.target}`}
              status="healthy"
              drillHref="/devops-sre/incidents"
              updatedAt={updatedAt}
              stale={stale}
              icon={<Clock size={22} />}
              iconBg="var(--status-cyan-bg)"
              iconFg="var(--status-cyan-fg)"
              trendDirection="down"
              trendValue={sreKpiData.mttr.delta}
            />
          </div>

          <div className="min-w-0">
            <KPITile
              title="Releases (last 48h)"
              value={`${sreKpiData.deploymentsLast48h.count}`}
              note={sreKpiData.deploymentsLast48h.note}
              status={sreKpiData.deploymentsLast48h.incidentCorrelatedCount > 0 ? "warning" : "healthy"}
              drillHref="/devops-sre/releases"
              updatedAt={updatedAt}
              stale={stale}
              icon={<Rocket size={22} />}
              iconBg="var(--status-purple-bg)"
              iconFg="var(--status-purple-fg)"
              secondary={[
                { label: "Correlated", value: sreKpiData.deploymentsLast48h.incidentCorrelatedCount, color: "var(--status-critical-fg)" },
                { label: "Pipeline", value: "ArgoCD", color: "var(--status-info-fg)" },
              ]}
            />
          </div>

          <div className="min-w-0">
            <KPITile
              title="SLO error budgets"
              value={`${sreKpiData.sloErrorBudget.exhaustedCount} Outage`}
              note="WhatsApp Gateway 142% burn"
              status={sreKpiData.sloErrorBudget.exhaustedCount > 0 ? "critical" : "healthy"}
              drillHref="/devops-sre/health"
              updatedAt={updatedAt}
              stale={stale}
              icon={<Flame size={22} />}
              iconBg="var(--status-critical-bg)"
              iconFg="var(--status-critical-fg)"
              secondary={[
                { label: "At Risk", value: sreKpiData.sloErrorBudget.atRiskCount, color: "var(--status-warning-fg)" },
                { label: "Healthy", value: sreKpiData.sloErrorBudget.healthyCount, color: "var(--status-healthy-fg)" },
              ]}
            />
          </div>

          <div className="min-w-0">
            <KPITile
              title="Synthetic checks"
              value={sreKpiData.syntheticChecks.rate}
              note="17.2k runs / 24h"
              status="healthy"
              drillHref="/devops-sre/diagnostics"
              updatedAt={updatedAt}
              stale={stale}
              icon={<Terminal size={22} />}
              iconBg="var(--status-cyan-bg)"
              iconFg="var(--status-cyan-fg)"
              trendDirection="up"
              trendValue="Fleet Mode"
            />
          </div>
        </div>

        <div className="hidden screen-xl:block">
          <CalendarCard />
        </div>
      </div>

      {/* 2. Row 2: Error Budget Breakdown + Telemetry Trend Chart */}
      <div className="grid grid-cols-1 items-stretch gap-[var(--space-md)] screen-sm:grid-cols-2">
        <Card
          title="Error budget & root-cause breakdown"
          description="Aggregated failure categories consuming service error budgets"
          className="min-h-[clamp(11rem,28vh,22rem)]"
        >
          <div className="flex flex-col items-center gap-[var(--space-md)] screen-sm:flex-row screen-sm:items-center">
            <div className="flex w-full justify-center screen-sm:w-auto screen-sm:flex-1">
              <DonutChart
                data={sreFailureCategories}
                size={112}
                centerLabel="burn %"
                legend={false}
              />
            </div>

            <ul className="flex w-full flex-col gap-2.5 screen-sm:flex-1">
              {sreFailureCategories.map((cat) => {
                const status: StatusLevel = cat.value > 30 ? "critical" : cat.value > 15 ? "warning" : "healthy";
                return (
                  <li key={cat.label} className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2 text-[var(--role-text)]">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-xs font-medium text-[var(--text-heading)]">{cat.label}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--text-secondary)]">{cat.value}%</span>
                      <StatusBadge status={status} label={status === "critical" ? "Severe" : "Tracked"} />
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-[var(--space-md)] border-t border-[var(--divider)] pt-[var(--space-md)]">
            <h3 className="mb-[var(--space-sm)] text-sm font-semibold text-[var(--text-heading)]">Active SLO burn alerts</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-red-50 border border-red-200 text-xs">
                <div>
                  <p className="font-bold text-red-900">WhatsApp Cloud Gateway — 142% Budget Burned</p>
                  <p className="text-[11px] text-red-700">p95 Latency 840ms · 5xx rate 4.8% (Target: 99.90%)</p>
                </div>
                <StatusBadge status="critical" label="EXHAUSTED" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                <div>
                  <p className="font-bold text-amber-900">GSTN Ingestion & E-Way — 85% Budget Burned</p>
                  <p className="text-[11px] text-amber-700">Upstream NIC gateway throttling · Queue depth 64</p>
                </div>
                <StatusBadge status="warning" label="AT RISK" />
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="Fleet telemetry & incident window correlation"
          description="p95 Latency (ms) vs. Throughput (RPS) with incident anomaly markers"
          className="min-h-[clamp(11rem,28vh,22rem)]"
          action={
            <div className="flex items-center gap-0.5 rounded-full bg-[var(--surface-muted)] p-0.5">
              {TREND_RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTrendRange(opt.value)}
                  aria-pressed={trendRange === opt.value}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${trendRange === opt.value
                      ? "bg-[var(--surface)] text-[var(--text-heading)] shadow-sm font-semibold"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          }
        >
          <AreaTrendChart
            className="min-h-0 flex-1"
            heightClassName="h-full min-h-[14rem]"
            series={[
              {
                key: "throughputRps",
                label: "Throughput (RPS)",
                color: "var(--chart-1)",
                data: telemetryTrend.map((d) => d.throughputRps),
              },
              {
                key: "p95Latency",
                label: "p95 Latency (ms ×10)",
                color: "var(--chart-4)",
                data: telemetryTrend.map((d) => d.p95Latency * 10),
              },
            ]}
            xLabels={telemetryTrend.map((d) => d.label)}
          />

          <dl className="mt-[var(--space-sm)] grid grid-cols-2 gap-[var(--space-sm)] border-t border-[var(--divider)] pt-[var(--space-sm)] screen-sm:grid-cols-4">
            <div>
              <dt className="text-xs text-[var(--role-text)]">Fleet RPS</dt>
              <dd className="font-mono-id text-lg font-semibold text-[var(--text-secondary)]">2,140</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--role-text)]">Fleet p95 Latency</dt>
              <dd className="font-mono-id text-lg font-semibold text-red-600">34ms (Spike)</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--role-text)]">Synthetic Runs</dt>
              <dd className="font-mono-id text-lg font-semibold text-[var(--text-secondary)]">17.2k</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--role-text)]">Incident Markers</dt>
              <dd className="font-mono-id text-lg font-semibold text-amber-600">2 Correlated</dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* 3. Row 3: Critical Services SLO Radar (3x3 matching Nine Areas at a Glance) */}
      <Card
        title="Critical Platform Services & Error Budget Radar"
        description="Real-time SLO burn status and health across all core microservices"
        action={
          <button
            type="button"
            onClick={() => router.push("/devops-sre/health")}
            className="flex items-center gap-1 text-xs font-semibold text-[var(--icon-btn-navy)] hover:underline"
          >
            Deep Observability & Dependencies &rarr;
          </button>
        }
      >
        <div className="flex flex-wrap gap-[var(--space-sm)]">
          {criticalServices.map((svc) => {
            const isDegraded = svc.statusLevel !== "healthy";
            const toneBg = isDegraded ? "var(--status-critical-bg)" : "var(--status-healthy-bg)";
            const toneFg = isDegraded ? "var(--status-critical-fg)" : "var(--status-healthy-fg)";

            return (
              <DrillLink
                key={svc.id}
                href={`/devops-sre/health?service=${svc.id}`}
                className="card-interactive tap-pop group relative flex min-w-0 grow basis-full items-center gap-2.5 rounded-[var(--card-radius)] border border-[var(--divider)] bg-[var(--surface)] p-[var(--card-pad)] screen-sm:basis-[calc((100%-var(--space-sm))/2)] screen-lg:basis-[calc((100%-(var(--space-sm)*2))/3)]"
                style={{ boxShadow: "var(--card-shadow)" }}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: toneBg, color: toneFg }}
                >
                  <Server size={18} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-[var(--text-heading)]">
                      {svc.name}
                    </span>
                    <StatusBadge
                      status={svc.statusLevel}
                      label={svc.status === "Exhausted" ? "Exhausted" : svc.status === "At Risk" ? "At Risk" : "Healthy"}
                    />
                  </span>
                  <span className="truncate text-xs text-[var(--text-muted)] font-mono-id">
                    SLO: {svc.targetSlo} · p95: {svc.p95Latency} · Burn: {svc.errorBudgetBurnPct}%
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                  style={{ color: toneFg }}
                >
                  <ArrowRight size={14} />
                </span>
              </DrillLink>
            );
          })}
        </div>
      </Card>

      {/* 4. Row 4: Active Incidents Table (Sorted by Severity) */}
      <Card
        title="Active Platform Incidents (Severity Ordered)"
        description="Live incident command, blast radius triage, and probable cause change linkage"
        action={
          <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">
            {sortedIncidents.length} Active Incidents
          </span>
        }
      >
        <DataTable
          columns={incidentColumns}
          rows={sortedIncidents}
          getRowKey={(r) => r.id}
          pageSize={5}
          textClassName="text-xs"
          onRowClick={(r) => router.push(`/devops-sre/incidents?id=${r.id}`)}
        />
      </Card>

      {/* 5. Row 5: Deployments & Diagnostic Probes */}
      <div className="grid grid-cols-1 items-stretch gap-[var(--space-md)] screen-sm:grid-cols-2">
        <Card
          title="Recent Releases & Deployments (Last 48h)"
          description="Pipeline deploy history with 2h incident correlation flags"
          action={
            <button
              type="button"
              onClick={() => router.push("/devops-sre/releases")}
              className="text-xs font-semibold text-[var(--icon-btn-navy)] hover:underline"
            >
              Release 360 &rarr;
            </button>
          }
        >
          <div className="flex flex-col gap-2.5">
            {sreReleases.map((rel) => (
              <div
                key={rel.id}
                className={`rounded-xl border p-3 transition-colors ${rel.status === "Correlated to Incident"
                    ? "border-red-300 bg-red-50/70 dark:bg-red-950/40 dark:border-red-800"
                    : "border-[var(--divider)] bg-[var(--surface)] hover:bg-[var(--search-bg)]"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-id text-xs font-bold text-[var(--text-heading)]">
                      {rel.version}
                    </span>
                    <span className="text-xs font-semibold text-[var(--icon-btn-navy)]">
                      {rel.service}
                    </span>
                  </div>
                  <StatusBadge
                    status={rel.statusLevel}
                    label={rel.status === "Correlated to Incident" ? "⚠️ CORRELATED" : "Nominal"}
                  />
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[var(--text-muted)]">
                  <span>{rel.deployedAt}</span>
                  <span>·</span>
                  <span className="font-mono-id">git #{rel.commitHash}</span>
                  <span>·</span>
                  <span>Cohort: {rel.rolloutCohort}</span>
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-[var(--divider)] pt-1.5 text-[11px]">
                  <span className="text-slate-500 italic">{rel.managedByPipelineNote}</span>
                  {rel.correlatedIncidentId && (
                    <span className="font-bold text-red-700">
                      Linked: {rel.correlatedIncidentId}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Fleet Diagnostic Probes Status"
          description="Non-mutating automated verification checks across fleet infrastructure"
          action={
            <button
              type="button"
              onClick={() => router.push("/devops-sre/diagnostics")}
              className="text-xs font-semibold text-[var(--icon-btn-navy)] hover:underline"
            >
              Diagnostic Runner &rarr;
            </button>
          }
        >
          <div className="flex flex-col gap-2">
            {sreDiagnosticProbes.map((prb) => (
              <div
                key={prb.id}
                className="flex items-center justify-between rounded-xl border border-[var(--divider)] p-2.5 hover:bg-[var(--search-bg)] transition-colors"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[var(--text-heading)]">
                      {prb.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono-id">
                      {prb.frequency}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                    {prb.outputSummary}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono-id text-[11px] text-slate-400">
                    {prb.durationMs}ms
                  </span>
                  <StatusBadge
                    status={prb.statusLevel}
                    label={prb.status === "passed" ? "PASS" : prb.status === "failed" ? "FAIL" : "WARN"}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

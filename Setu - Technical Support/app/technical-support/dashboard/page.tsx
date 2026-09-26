"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HeartPulse,
  Layers,
  AlertTriangle,
  Terminal,
  Network,
  Activity,
  AlertOctagon,
  ArrowRight,
  Play,
  CreditCard,
  ShieldCheck,
  UserCheck,
  Rocket,
  Wallet,
  Circle,
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
import {
  technicalSupportKpis,
  rootCausesData,
  serviceRadarTiles,
  topBlockers,
  customerWorkspaces,
  platformIncidents,
  recentDiagnosticLogs,
  buildTelemetryTrend,
  getTelemetryStats,
  type TrendRangeDays,
  type CustomerWorkspace,
  type ServiceRadarTile,
} from "@/lib/mock-data/technical-support";

const REFRESH_MS = 60_000;
const FAILURE_RATE = 0.2;

function useKpiSnapshot() {
  const [updatedAt, setUpdatedAt] = useState<Date>(() => new Date());
  const [stale, setStale] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      const failed = Math.random() < FAILURE_RATE;
      if (failed) {
        setStale(true);
        return;
      }
      setUpdatedAt(new Date());
      setStale(false);
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return { updatedAt, stale };
}

const TREND_RANGE_OPTIONS: { label: string; value: TrendRangeDays }[] = [
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
];

const AREA_TONE: Record<StatusLevel, { bg: string; fg: string }> = {
  healthy: { bg: "var(--status-healthy-bg)", fg: "var(--status-healthy-fg)" },
  warning: { bg: "var(--status-warning-bg)", fg: "var(--status-warning-fg)" },
  critical: { bg: "var(--status-critical-bg)", fg: "var(--status-critical-fg)" },
  info: { bg: "var(--status-info-bg)", fg: "var(--status-info-fg)" },
  neutral: { bg: "var(--status-neutral-bg)", fg: "var(--status-neutral-fg)" },
};

const AREA_STATUS_LABEL: Record<StatusLevel, string> = {
  healthy: "Healthy",
  warning: "Attention",
  critical: "Critical",
  info: "Info",
  neutral: "—",
};

function ServiceIcon({ id }: { id: string }) {
  const props = { size: 18 };
  switch (id) {
    case "upi":
      return <CreditCard {...props} />;
    case "bbps":
      return <Layers {...props} />;
    case "waba":
      return <Terminal {...props} />;
    case "gstn":
      return <ShieldCheck {...props} />;
    case "kyc":
      return <UserCheck {...props} />;
    case "fasttag":
      return <Rocket {...props} />;
    case "imps":
      return <Wallet {...props} />;
    case "webhooks":
      return <Network {...props} />;
    case "sms":
      return <Activity {...props} />;
    default:
      return <Circle {...props} />;
  }
}

export default function TechnicalSupportDashboardPage() {
  const router = useRouter();
  const { updatedAt, stale } = useKpiSnapshot();
  const [trendRange, setTrendRange] = useState<TrendRangeDays>(30);
  const telemetryTrend = useMemo(() => buildTelemetryTrend(trendRange), [trendRange]);
  const telemetryStats = useMemo(() => getTelemetryStats(trendRange), [trendRange]);
  const totalProbes = telemetryTrend.reduce((sum, d) => sum + d.probes, 0);

  const workspaceColumns: Column<CustomerWorkspace>[] = [
    {
      key: "workspace",
      header: "Workspace & Organization",
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-semibold text-[var(--icon-btn-navy)] cursor-pointer hover:underline">
            {r.name}
          </span>
          <span className="font-mono-id text-[11px] text-[var(--text-muted)]">
            {r.id} · {r.orgName}
          </span>
        </div>
      ),
      sortValue: (r) => r.name,
    },
    {
      key: "primaryService",
      header: "Primary Integration Rail",
      render: (r) => <span className="text-xs text-[var(--role-text)]">{r.primaryService}</span>,
      sortValue: (r) => r.primaryService,
    },
    {
      key: "health",
      header: "Tenant Health",
      render: (r) => <StatusBadge status={r.healthLevel} label={r.health} />,
      sortValue: (r) => r.health,
    },
    {
      key: "apiSuccessRate",
      header: "API Success",
      render: (r) => (
        <span className="font-mono-id text-xs font-semibold text-[var(--text-heading)]">
          {r.apiSuccessRate}
        </span>
      ),
      sortValue: (r) => parseFloat(r.apiSuccessRate),
    },
    {
      key: "lastDiagnostic",
      header: "Last Diagnostic Probe",
      render: (r) => <span className="text-xs text-[var(--text-muted)]">{r.lastDiagnostic}</span>,
      sortValue: (r) => r.lastDiagnostic,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => router.push(`/technical-support/workspaces?id=${r.id}`)}
            className="tap-pop rounded-lg border border-[var(--divider)] bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--icon-btn-navy)] shadow-2xs hover:bg-[var(--search-bg)]"
          >
            Workspace 360
          </button>
          <button
            type="button"
            onClick={() => router.push(`/technical-support/api-logs?ws=${r.id}`)}
            className="tap-pop rounded-lg border border-[var(--divider)] bg-white px-2 py-1 text-[11px] font-medium text-[var(--role-text)] shadow-2xs hover:bg-[var(--search-bg)]"
          >
            Logs
          </button>
          <button
            type="button"
            onClick={() => router.push(`/technical-support/diagnostics?target=${r.id}`)}
            className="tap-pop rounded-lg bg-[var(--icon-btn-navy)] px-2 py-1 text-[11px] font-semibold text-white shadow-2xs hover:bg-slate-800"
          >
            <Play size={10} className="inline mr-1" />
            Ping
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      {/* 1. Row 1: 8-item KPI Tile Grid (Greeting + 7 KPIs) + Calendar Card */}
      <div className="grid grid-cols-1 items-stretch gap-[var(--space-md)] screen-xl:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
        <div className="grid min-w-0 grid-cols-2 gap-[var(--space-md)] screen-sm:grid-cols-4">
          <div className="min-w-0">
            <GreetingCard name="Dhruv Singla" />
          </div>

          <div className="min-w-0">
            <KPITile
              title="Platform status"
              value="99.98%"
              note="18/18 active endpoints"
              status="healthy"
              drillHref="/technical-support/health"
              updatedAt={updatedAt}
              stale={stale}
              icon={<HeartPulse size={22} />}
              iconBg="#EFF6FF"
              iconFg="#0058DD"
              trendDirection="up"
              trendValue="+0.02%"
            />
          </div>

          <div className="min-w-0">
            <KPITile
              title="Monitored workspaces"
              value="5"
              note="Tier-2 high priority fleet"
              status="healthy"
              drillHref="/technical-support/workspaces"
              updatedAt={updatedAt}
              stale={stale}
              icon={<Layers size={22} />}
              iconBg="#F5F3FF"
              iconFg="#7C3AED"
              secondary={[
                { label: "Healthy", value: 3, color: "var(--status-healthy-fg)" },
                { label: "Degraded", value: 1, color: "var(--status-critical-fg)" },
              ]}
            />
          </div>

          <div className="min-w-0">
            <KPITile
              title="Active alert queue"
              value="2"
              note="unaddressed anomalies"
              status="warning"
              drillHref="/technical-support/incidents"
              updatedAt={updatedAt}
              stale={stale}
              icon={<AlertTriangle size={22} />}
              iconBg="#FEE2E2"
              iconFg="#DC2626"
              secondary={[
                { label: "P1 Blocker", value: 1, color: "var(--status-critical-fg)" },
                { label: "P2 Degraded", value: 1, color: "var(--status-warning-fg)" },
              ]}
            />
          </div>

          <div className="min-w-0">
            <KPITile
              title="Diagnostics run"
              value="142"
              note="avg latency 4.2ms"
              status="healthy"
              drillHref="/technical-support/diagnostics"
              updatedAt={updatedAt}
              stale={stale}
              icon={<Terminal size={22} />}
              iconBg="#ECFDF5"
              iconFg="#059669"
              trendDirection="up"
              trendValue="+18%"
            />
          </div>

          <div className="min-w-0">
            <KPITile
              title="Webhook delivery"
              value="99.94%"
              note="p95 latency 142ms"
              status="healthy"
              drillHref="/technical-support/integrations"
              updatedAt={updatedAt}
              stale={stale}
              icon={<Network size={22} />}
              iconBg="#CCFBF1"
              iconFg="#0D9488"
              trendDirection="up"
              trendValue="99.9% SLA"
            />
          </div>

          <div className="min-w-0">
            <KPITile
              title="API error rate"
              value="0.02%"
              note="4xx/5xx across fleet"
              status="healthy"
              drillHref="/technical-support/api-logs"
              updatedAt={updatedAt}
              stale={stale}
              icon={<Activity size={22} />}
              iconBg="#CFFAFE"
              iconFg="#0891B2"
              trendDirection="down"
              trendValue="-0.01%"
            />
          </div>

          <div className="min-w-0">
            <KPITile
              title="Critical exceptions"
              value="1"
              note="Meta WABA OAuth token"
              status="critical"
              drillHref="/technical-support/incidents"
              updatedAt={updatedAt}
              stale={stale}
              icon={<AlertOctagon size={22} />}
              iconBg="#FEE2E2"
              iconFg="#DC2626"
              secondary={[
                { label: "Blast radius", value: "1 workspace", color: "var(--status-critical-fg)" },
                { label: "Severity", value: "P2 High", color: "var(--status-warning-fg)" },
              ]}
            />
          </div>
        </div>

        <div className="hidden screen-xl:block">
          <CalendarCard />
        </div>
      </div>

      {/* 2. Row 2: Donut Chart + Area Trend Chart */}
      <div className="grid grid-cols-1 items-stretch gap-[var(--space-md)] screen-sm:grid-cols-2">
        <Card
          title="Root cause & failure breakdown"
          description="Isolated technical failure categories across monitored customer fleet"
          className="min-h-[clamp(11rem,28vh,22rem)]"
        >
          <div className="flex flex-col items-center gap-[var(--space-md)] screen-sm:flex-row screen-sm:items-center">
            <div className="flex w-full justify-center screen-sm:w-auto screen-sm:flex-1">
              <DonutChart
                data={rootCausesData}
                size={112}
                centerLabel="anomalies"
                legend={false}
              />
            </div>

            <ul className="flex w-full flex-col gap-2.5 screen-sm:flex-1">
              {rootCausesData.map((rc) => {
                const pct = Math.round((rc.value / 142) * 100);
                const status: StatusLevel = rc.value > 40 ? "critical" : rc.value > 20 ? "warning" : "healthy";
                const bandWord = rc.value > 40 ? "Critical" : rc.value > 20 ? "Needs attention" : "Normal";
                return (
                  <li key={rc.label} className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2 text-[var(--role-text)]">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: rc.color }} />
                      <span className="text-xs font-medium text-[var(--text-heading)]">{rc.label}</span>
                      <span className="text-xs text-[var(--text-muted)]">({rc.value}/142)</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--text-secondary)]">{pct}%</span>
                      <StatusBadge status={status} label={bandWord} />
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-[var(--space-md)] border-t border-[var(--divider)] pt-[var(--space-md)]">
            <h3 className="mb-[var(--space-sm)] text-sm font-semibold text-[var(--text-heading)]">Top active blockers</h3>
            <ul className="flex flex-col gap-[var(--space-sm)]">
              {topBlockers.map((blocker) => (
                <li key={blocker.id} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-secondary)]">{blocker.label}</p>
                    <p className="text-xs text-[var(--role-text)]">{blocker.workspace} · {blocker.impact}</p>
                  </div>
                  <StatusBadge
                    status={blocker.severity}
                    label={blocker.badge}
                  />
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card
          title="Diagnostic volume & telemetry"
          description="Monthly executed diagnostic probes vs. external webhook ingestion"
          className="min-h-[clamp(11rem,28vh,22rem)]"
          action={
            <div className="flex items-center gap-0.5 rounded-full bg-[var(--surface-muted)] p-0.5">
              {TREND_RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTrendRange(opt.value)}
                  aria-pressed={trendRange === opt.value}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    trendRange === opt.value
                      ? "bg-white text-[var(--text-heading)] shadow-sm font-semibold"
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
                key: "probes",
                label: "Diagnostic probes",
                color: "var(--chart-1)",
                data: telemetryTrend.map((d) => d.probes),
              },
              {
                key: "webhooks",
                label: "Webhook ingestion (÷5)",
                color: "var(--chart-3)",
                data: telemetryTrend.map((d) => d.webhooks),
              },
            ]}
            xLabels={telemetryTrend.map((d) => d.label)}
          />

          <dl className="mt-[var(--space-sm)] grid grid-cols-2 gap-[var(--space-sm)] border-t border-[var(--divider)] pt-[var(--space-sm)] screen-sm:grid-cols-4">
            <div>
              <dt className="text-xs text-[var(--role-text)]">Total probes</dt>
              <dd className="font-mono-id text-lg font-semibold text-[var(--text-secondary)]">
                {totalProbes}
              </dd>
            </div>
            {telemetryStats.map((s) => (
              <div key={s.label}>
                <dt className="text-xs text-[var(--role-text)]">{s.label}</dt>
                <dd className="font-mono-id text-lg font-semibold text-[var(--text-secondary)]">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      {/* 3. Row 3: Platform Services Observability Radar (3x3 grid matching Nine Areas at a Glance) */}
      <Card
        title="Platform Services Observability Radar"
        description="Real-time telemetry across internal microservices & third-party payment/messaging rails"
        action={
          <button
            type="button"
            onClick={() => router.push("/technical-support/health")}
            className="flex items-center gap-1 text-xs font-semibold text-[var(--icon-btn-navy)] hover:underline"
          >
            Full health telemetry &rarr;
          </button>
        }
      >
        <div className="flex flex-wrap gap-[var(--space-sm)]">
          {serviceRadarTiles.map((area) => {
            const tone = AREA_TONE[area.status];
            return (
              <DrillLink
                key={area.id}
                href={area.href}
                className="card-interactive tap-pop group relative flex min-w-0 grow basis-full items-center gap-2.5 rounded-[var(--card-radius)] border border-[var(--divider)] bg-white p-[var(--card-pad)] screen-sm:basis-[calc((100%-var(--space-sm))/2)] screen-lg:basis-[calc((100%-(var(--space-sm)*2))/3)]"
                style={{ boxShadow: "var(--card-shadow)" }}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: tone.bg, color: tone.fg }}
                >
                  <ServiceIcon id={area.id} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-[var(--text-heading)]">{area.label}</span>
                    <StatusBadge status={area.status} label={AREA_STATUS_LABEL[area.status]} />
                  </span>
                  <span className="truncate text-xs text-[var(--text-muted)]">{area.cause}</span>
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                  style={{ color: tone.fg }}
                >
                  <ArrowRight size={14} />
                </span>
              </DrillLink>
            );
          })}
        </div>
      </Card>

      {/* 4. Row 4: Assigned Customer Workspaces Telemetry Table */}
      <Card
        title="Assigned Customer Workspaces Telemetry"
        description="Live API success rate, last executed diagnostic probe, and progressive tenant status"
        action={
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-[var(--role-text)]">
              {customerWorkspaces.length} Monitored
            </span>
          </div>
        }
      >
        <DataTable
          columns={workspaceColumns}
          rows={customerWorkspaces}
          getRowKey={(r) => r.id}
          pageSize={5}
          textClassName="text-xs"
          onRowClick={(r) => router.push(`/technical-support/workspaces?id=${r.id}`)}
        />
      </Card>

      {/* 5. Row 5: Incidents and Recent Diagnostic Probes */}
      <div className="grid grid-cols-1 items-stretch gap-[var(--space-md)] screen-sm:grid-cols-2">
        <Card
          title="Active platform incidents & blast radius"
          description="High-severity platform outages with support runbooks"
          action={
            <button
              type="button"
              onClick={() => router.push("/technical-support/incidents")}
              className="text-xs font-semibold text-red-600 hover:underline"
            >
              Incident Command &rarr;
            </button>
          }
        >
          <div className="flex flex-col gap-3">
            {platformIncidents.map((inc) => (
              <div
                key={inc.id}
                className="flex flex-col gap-2 rounded-xl border border-red-200/80 bg-red-50/40 p-3.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono-id text-xs font-bold text-red-700">
                    {inc.id} · {inc.severity}
                  </span>
                  <StatusBadge status={inc.statusLevel} label={inc.status} />
                </div>
                <p className="text-xs font-bold text-[var(--text-heading)]">{inc.title}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--text-muted)]">
                  <span>
                    Blast Radius: <strong className="text-[var(--text-heading)]">{inc.workspaceCount} workspaces</strong>
                  </span>
                  <span>·</span>
                  <span>Commander: {inc.commander}</span>
                  <span>·</span>
                  <span>{inc.firstSeen}</span>
                </div>
                <div className="mt-1 rounded-lg bg-white/80 border border-red-100 p-2 text-[11px] text-slate-700 leading-relaxed">
                  <strong>Support Guidance:</strong> {inc.supportGuidance}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Recent diagnostic probe logs"
          description="Live stream of automated and operator-triggered diagnostic probes"
          action={
            <button
              type="button"
              onClick={() => router.push("/technical-support/diagnostics")}
              className="text-xs font-semibold text-[var(--icon-btn-navy)] hover:underline"
            >
              Open Workbench &rarr;
            </button>
          }
        >
          <div className="flex flex-col gap-2">
            {recentDiagnosticLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-xl border border-[var(--divider)] p-2.5 transition-colors hover:bg-[var(--search-bg)]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[var(--text-heading)]">
                      {log.diagnosticType}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] truncate">
                      {log.targetWorkspace}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                    {log.summary}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="font-mono-id text-[11px] text-slate-400">
                    {log.durationMs}ms
                  </span>
                  <StatusBadge
                    status={log.statusLevel}
                    label={log.status === "passed" ? "PASS" : log.status === "failed" ? "FAIL" : "WARN"}
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

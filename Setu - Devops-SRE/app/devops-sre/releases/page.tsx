"use client";

import Link from "next/link";
import { ArrowLeft, Rocket, AlertTriangle, CheckCircle2, GitCommit, ShieldAlert, Layers } from "lucide-react";
import Card from "@/components/shared/Card";
import StatusBadge from "@/components/shared/StatusBadge";
import { sreReleases } from "@/lib/mock-data/devops-sre";

export default function SreReleasesPage() {
  return (
    <div className="flex flex-col gap-[var(--space-lg)]">
      {/* Header */}
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
              Release 360 &amp; Deployment Governance
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Deployment pipeline visibility, before/after health metrics, and automated incident correlation window
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            Pipeline Visibility Mode (Read-Only)
          </span>
        </div>
      </div>

      {/* Governance & Constraint Banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3.5 text-xs text-blue-900 leading-relaxed flex items-center justify-between">
        <div>
          <strong>System Boundary Note:</strong> Setu provides observability and telemetry correlation for production deployments. Production rollbacks, canary pauses, and artifact promotions are managed exclusively via upstream CI/CD (ArgoCD / GitHub Actions).
        </div>
        <span className="shrink-0 font-bold ml-4 text-[11px] uppercase tracking-wider text-blue-800">
          No Console Execution
        </span>
      </div>

      {/* Releases List */}
      <div className="flex flex-col gap-4">
        {sreReleases.map((rel) => {
          const isCorrelated = rel.status === "Correlated to Incident";
          return (
            <Card
              key={rel.id}
              title={`${rel.version} — ${rel.service}`}
              description={`Deployed: ${rel.deployedAt} · Environment: ${rel.environment}`}
              action={
                <StatusBadge
                  status={rel.statusLevel}
                  label={isCorrelated ? "⚠️ CORRELATED TO INCIDENT" : "Nominal Deployment"}
                />
              }
            >
              <div className="flex flex-col gap-4 py-1">
                {/* 2-Hour Incident Correlation Callout */}
                {isCorrelated && (
                  <div className="rounded-xl border border-red-300 bg-red-50/80 p-3.5 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-red-900 flex items-center gap-1.5">
                        <AlertTriangle size={14} className="text-red-600" />
                        UC-06 Bad Release Correlation (2-Hour Window Rule):
                      </span>
                      <Link
                        href={`/devops-sre/incidents?id=${rel.correlatedIncidentId}`}
                        className="font-bold text-red-800 underline"
                      >
                        Inspect {rel.correlatedIncidentId} &rarr;
                      </Link>
                    </div>
                    <p className="text-red-700 leading-relaxed">
                      Incident <strong>{rel.correlatedIncidentId}</strong> was detected within 42 minutes of this deployment. Error rates surged from <strong>{rel.healthBefore.errorRate}</strong> to <strong>{rel.healthAfter.errorRate}</strong>, and p95 latency spiked to <strong>{rel.healthAfter.latency}</strong>.
                    </p>
                  </div>
                )}

                {/* Release Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 screen-sm:grid-cols-4 text-xs">
                  <div className="rounded-lg border border-[var(--divider)] p-2.5 bg-slate-50">
                    <span className="text-[var(--text-muted)] block text-[11px]">Git Commit Hash</span>
                    <span className="font-mono-id font-bold text-[var(--text-heading)]">#{rel.commitHash}</span>
                  </div>
                  <div className="rounded-lg border border-[var(--divider)] p-2.5 bg-slate-50">
                    <span className="text-[var(--text-muted)] block text-[11px]">Initiator</span>
                    <strong className="text-[var(--text-heading)]">{rel.initiator}</strong>
                  </div>
                  <div className="rounded-lg border border-[var(--divider)] p-2.5 bg-slate-50">
                    <span className="text-[var(--text-muted)] block text-[11px]">Rollout Cohort</span>
                    <strong className="text-[var(--text-heading)]">{rel.rolloutCohort}</strong>
                  </div>
                  <div className="rounded-lg border border-[var(--divider)] p-2.5 bg-slate-50">
                    <span className="text-[var(--text-muted)] block text-[11px]">CI/CD Pipeline</span>
                    <strong className="text-[var(--text-heading)] font-mono-id">{rel.pipelineRef}</strong>
                  </div>
                </div>

                {/* Before vs After Telemetry Diff */}
                <div className="rounded-xl border border-[var(--divider)] p-3 bg-white">
                  <span className="text-xs font-bold text-[var(--text-heading)] block mb-2">
                    Pre vs. Post-Deployment Telemetry Comparison:
                  </span>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="border-r border-[var(--divider)] pr-4">
                      <span className="text-[11px] font-semibold text-slate-500 block">Pre-Deploy Health (T - 1h)</span>
                      <div className="mt-1 flex items-center gap-3">
                        <span>p95 Latency: <strong className="font-mono-id">{rel.healthBefore.latency}</strong></span>
                        <span>Error Rate: <strong className="font-mono-id">{rel.healthBefore.errorRate}</strong></span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block">Post-Deploy Health (T + 1h)</span>
                      <div className="mt-1 flex items-center gap-3">
                        <span>p95 Latency: <strong className={`font-mono-id ${isCorrelated ? "text-red-700" : ""}`}>{rel.healthAfter.latency}</strong></span>
                        <span>Error Rate: <strong className={`font-mono-id ${isCorrelated ? "text-red-700" : ""}`}>{rel.healthAfter.errorRate}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer with Pipeline Note */}
                <div className="flex items-center justify-between border-t border-[var(--divider)] pt-2.5 text-xs">
                  <span className="text-slate-500 italic flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-slate-400" />
                    {rel.managedByPipelineNote}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-mono-id text-slate-600">
                    Target: {rel.environment}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { ArrowLeft, AlertOctagon, CheckCircle2, ShieldAlert } from "lucide-react";
import Card from "@/components/shared/Card";
import StatusBadge from "@/components/shared/StatusBadge";
import { platformIncidents } from "@/lib/mock-data/technical-support";

export default function IncidentsPage() {
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
              Incident Command & Blast Radius
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              High-severity platform outages, tenant impact tracking, and support triage runbooks
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {platformIncidents.map((inc) => (
          <Card key={inc.id} title={`${inc.id}: ${inc.title}`} description={`Reported at ${inc.firstSeen}`}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div>
                  <span className="text-[var(--text-muted)] block text-[11px]">Severity</span>
                  <StatusBadge status={inc.statusLevel} label={inc.severity} />
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[11px]">Status</span>
                  <StatusBadge status={inc.statusLevel} label={inc.status} />
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[11px]">Blast Radius</span>
                  <strong className="text-[var(--text-heading)]">{inc.workspaceCount} Workspaces</strong>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[11px]">Incident Commander</span>
                  <strong className="text-[var(--text-heading)]">{inc.commander}</strong>
                </div>
              </div>

              <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 text-xs">
                <h3 className="font-bold text-red-900 mb-1">Customer Support Runbook & Guidance:</h3>
                <p className="text-red-800 leading-relaxed">{inc.supportGuidance}</p>
              </div>

              <div className="flex justify-end gap-2 border-t border-[var(--divider)] pt-3">
                <Link
                  href="/technical-support/workspaces?id=WS-94812"
                  className="tap-pop rounded-lg border border-[var(--divider)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--icon-btn-navy)] hover:bg-[var(--search-bg)]"
                >
                  Inspect Sharma Traders (WS-94812) &rarr;
                </Link>
                <Link
                  href="/technical-support/api-logs"
                  className="tap-pop rounded-lg bg-[var(--icon-btn-navy)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  View Incident Traces &rarr;
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

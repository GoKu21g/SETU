"use client";

import Link from "next/link";
import { ArrowLeft, History, ShieldCheck, Search, Filter } from "lucide-react";
import Card from "@/components/shared/Card";
import { sreAuditTrail } from "@/lib/mock-data/devops-sre";

export default function SreAuditPage() {
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
              Audit Explorer &amp; Timeline Ledger
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Immutable audit log capturing all incident status transitions, mitigation notes, deployments, and diagnostic checks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            Immutable Audit Trail Active
          </span>
        </div>
      </div>

      {/* Audit Log Table */}
      <Card
        title="Operational Action &amp; Event Ledger"
        description="Non-repudiable log of actions performed by SREs, automation webhooks, and CI/CD pipelines"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--divider)] bg-[var(--search-bg)]/70 text-[var(--role-text)]">
                <th className="px-3 py-2.5 font-semibold">Event ID &amp; Timestamp</th>
                <th className="px-3 py-2.5 font-semibold">Actor Identity</th>
                <th className="px-3 py-2.5 font-semibold">Action Performed</th>
                <th className="px-3 py-2.5 font-semibold">Target Object</th>
                <th className="px-3 py-2.5 font-semibold">Before / After State Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--divider)] font-mono-id">
              {sreAuditTrail.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--search-bg)]/60 transition-colors">
                  <td className="px-3 py-3">
                    <strong className="text-[var(--text-heading)] block">{log.id}</strong>
                    <span className="text-[11px] text-[var(--text-muted)]">{log.timestamp}</span>
                  </td>
                  <td className="px-3 py-3 text-[var(--text-heading)] font-semibold font-sans">
                    {log.actor}
                  </td>
                  <td className="px-3 py-3">
                    <span className="font-sans font-bold text-xs text-[var(--icon-btn-navy)]">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-700">
                    {log.targetObject}
                  </td>
                  <td className="px-3 py-3 text-[11px]">
                    <div className="text-red-700 line-through truncate max-w-xs">{log.beforeState}</div>
                    <div className="text-emerald-700 font-bold truncate max-w-xs">{log.afterState}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

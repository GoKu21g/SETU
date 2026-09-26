"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, CheckCircle2, ShieldAlert, Plus, Save, Clock, ArrowRight, UserCheck, Flame } from "lucide-react";
import Card from "@/components/shared/Card";
import StatusBadge from "@/components/shared/StatusBadge";
import type { StatusLevel } from "@/components/shared/StatusBadge";
import {
  sreIncidents,
  type Incident360,
  type IncidentStatus,
} from "@/lib/mock-data/devops-sre";

const STATUS_PIPELINE: IncidentStatus[] = [
  "Detected",
  "Triaged",
  "Investigating",
  "Mitigating",
  "Monitoring",
  "Resolved",
  "Closed",
];

export default function SreIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident360[]>(sreIncidents);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>("INC-1042");
  const [newNote, setNewNote] = useState("");
  const [auditFeedback, setAuditFeedback] = useState<string | null>(null);

  const activeIncident = incidents.find((inc) => inc.id === selectedIncidentId) || incidents[0];

  function handleStatusChange(newStatus: IncidentStatus) {
    const beforeStatus = activeIncident.status;
    const updatedLevel: StatusLevel =
      newStatus === "Resolved" || newStatus === "Closed"
        ? "healthy"
        : newStatus === "Monitoring"
        ? "info"
        : "critical";

    const updatedIncidents = incidents.map((inc) => {
      if (inc.id === activeIncident.id) {
        return {
          ...inc,
          status: newStatus,
          statusLevel: updatedLevel,
          timeline: [
            ...inc.timeline,
            {
              time: new Date().toLocaleTimeString() + " UTC",
              actor: "Arjun Mehta [Lead SRE]",
              action: `Transitioned status from ${beforeStatus} → ${newStatus}.`,
              type: "status" as const,
            },
          ],
        };
      }
      return inc;
    });

    setIncidents(updatedIncidents);
    setAuditFeedback(`Recorded in Audit Trail: Status transitioned from "${beforeStatus}" to "${newStatus}" by Arjun Mehta.`);
    setTimeout(() => setAuditFeedback(null), 4000);
  }

  function handleAddMitigationNote() {
    if (!newNote.trim()) return;

    const noteText = newNote.trim();
    const updatedIncidents = incidents.map((inc) => {
      if (inc.id === activeIncident.id) {
        return {
          ...inc,
          mitigationNotes: `${inc.mitigationNotes} | [${new Date().toLocaleTimeString()}]: ${noteText}`,
          timeline: [
            ...inc.timeline,
            {
              time: new Date().toLocaleTimeString() + " UTC",
              actor: "Arjun Mehta [Lead SRE]",
              action: `Mitigation Note: ${noteText}`,
              type: "mitigation" as const,
            },
          ],
        };
      }
      return inc;
    });

    setIncidents(updatedIncidents);
    setNewNote("");
    setAuditFeedback(`Recorded in Audit Trail: Mitigation note appended by Arjun Mehta.`);
    setTimeout(() => setAuditFeedback(null), 4000);
  }

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
              Reliability &amp; Incident 360 Command
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Authoritative Setu Incident lifecycle: status state machine, blast radius, mitigation timeline, and PIR
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedIncidentId}
            onChange={(e) => setSelectedIncidentId(e.target.value)}
            className="rounded-lg border border-[var(--divider)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--icon-btn-navy)] shadow-2xs outline-none"
          >
            {incidents.map((inc) => (
              <option key={inc.id} value={inc.id}>
                {inc.id} · {inc.severity} ({inc.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Feedback Banner */}
      {auditFeedback && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/90 p-3 text-xs text-blue-900 font-medium flex items-center justify-between shadow-2xs transition-all">
          <span>✓ {auditFeedback}</span>
          <Link href="/devops-sre/audit" className="underline font-bold text-blue-700">
            View Audit Log &rarr;
          </Link>
        </div>
      )}

      {/* Interactive Incident State Machine Pipeline */}
      <Card
        title="Incident Lifecycle State Machine (SRE Write Authority)"
        description="Transition incident state across the authoritative lifecycle"
      >
        <div className="flex flex-wrap items-center gap-2 py-1">
          {STATUS_PIPELINE.map((step, idx) => {
            const isCurrent = activeIncident.status === step;
            return (
              <div key={step} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange(step)}
                  className={`tap-pop px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isCurrent
                      ? "bg-[var(--icon-btn-navy)] text-white shadow-md ring-2 ring-blue-500/40"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <span className="opacity-70 mr-1.5">{idx + 1}.</span>
                  {step}
                  {isCurrent && <span className="ml-1.5 text-[10px] text-emerald-300">● CURRENT</span>}
                </button>
                {idx < STATUS_PIPELINE.length - 1 && (
                  <ArrowRight size={12} className="text-slate-300 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Main Incident Details & Mitigation Grid */}
      <div className="grid grid-cols-1 items-stretch gap-[var(--space-md)] screen-xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Left Column: Full Incident Dossier */}
        <div className="flex flex-col gap-[var(--space-md)]">
          <Card title={`${activeIncident.id}: ${activeIncident.title}`} description={`First seen: ${activeIncident.firstSeen}`}>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3 screen-sm:grid-cols-4 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-[var(--divider)]">
                  <span className="text-[var(--text-muted)] block text-[11px]">Severity</span>
                  <span className="font-bold text-red-700 font-mono-id">{activeIncident.severity}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-[var(--divider)]">
                  <span className="text-[var(--text-muted)] block text-[11px]">Lifecycle Status</span>
                  <StatusBadge status={activeIncident.statusLevel} label={activeIncident.status} />
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-[var(--divider)]">
                  <span className="text-[var(--text-muted)] block text-[11px]">Incident Commander</span>
                  <strong className="text-[var(--text-heading)]">{activeIncident.commander}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-[var(--divider)]">
                  <span className="text-[var(--text-muted)] block text-[11px]">Blast Radius</span>
                  <strong className="text-red-700">{activeIncident.affectedWorkspacesCount} Workspaces</strong>
                </div>
              </div>

              {/* Linked Release / Config Change */}
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs">
                <span className="font-bold text-amber-900 block mb-0.5">Linked Probable Cause Release:</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono-id font-bold text-amber-800">{activeIncident.linkedRelease}</span>
                  <span className="text-[11px] text-amber-700">{activeIncident.linkedReleaseWindow}</span>
                  <Link href="/devops-sre/releases" className="underline font-semibold text-amber-900">
                    Inspect Release &rarr;
                  </Link>
                </div>
              </div>

              {/* Affected Customer Workspaces (Read-only context) */}
              <div className="rounded-xl border border-[var(--divider)] p-3">
                <span className="text-xs font-bold text-[var(--text-heading)] block mb-1">
                  Affected Customer Fleet Sample (Read-Only Context):
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {activeIncident.sampleWorkspaces.map((ws) => (
                    <Link
                      key={ws}
                      href={`/devops-sre/workspaces?target=${ws.split(" ")[0]}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[var(--icon-btn-navy)] font-semibold transition-colors"
                    >
                      {ws}
                    </Link>
                  ))}
                  <span className="text-xs text-[var(--text-muted)] self-center">
                    + {activeIncident.affectedWorkspacesCount - activeIncident.sampleWorkspaces.length} more workspaces
                  </span>
                </div>
              </div>

              {/* Post-Incident Review (PIR) */}
              <div className="rounded-xl border border-[var(--divider)] p-3.5 bg-slate-50/60">
                <h3 className="text-xs font-bold text-[var(--text-heading)] uppercase tracking-wider mb-2">
                  Post-Incident Review (PIR)
                </h3>
                <div className="flex flex-col gap-2 text-xs">
                  <div>
                    <strong className="text-slate-800">Root Cause: </strong>
                    <span className="text-slate-700">{activeIncident.pir.rootCause}</span>
                  </div>
                  <div>
                    <strong className="text-slate-800">Contributing Factors: </strong>
                    <span className="text-slate-700">{activeIncident.pir.contributingFactors}</span>
                  </div>
                  <div>
                    <strong className="text-slate-800">Action Items:</strong>
                    <ul className="list-disc list-inside mt-1 text-slate-700 space-y-0.5">
                      {activeIncident.pir.actionItems.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Timeline & SRE Mitigation Notes Writing Panel */}
        <div className="flex flex-col gap-[var(--space-md)]">
          {/* Mitigation Notes Append Box */}
          <Card
            title="Append Mitigation Notes (SRE Authority)"
            description="All additions are immutably timestamped in the Setu audit log"
          >
            <div className="flex flex-col gap-3 py-1">
              <textarea
                rows={3}
                placeholder="Add mitigation actions taken, command runbook steps, or status updates..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full rounded-xl border border-[var(--divider)] bg-[var(--search-bg)] p-3 text-xs outline-none focus:border-[var(--icon-btn-navy)] font-mono-id"
              />
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-[var(--text-muted)]">Author: Arjun Mehta (Lead SRE)</span>
                <button
                  type="button"
                  onClick={handleAddMitigationNote}
                  disabled={!newNote.trim()}
                  className="tap-pop flex items-center gap-1.5 rounded-lg bg-[var(--icon-btn-navy)] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 disabled:opacity-50"
                >
                  <Plus size={12} />
                  Append Note
                </button>
              </div>
            </div>
          </Card>

          {/* Incident Timeline */}
          <Card title="Incident Event Timeline" description="Chronological log of detections, status changes, and mitigation">
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[28rem] pr-1 py-1">
              {activeIncident.timeline.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs">
                  <span className="mt-1 h-2 w-2 rounded-full shrink-0 bg-blue-600" />
                  <div className="flex-1 rounded-lg border border-[var(--divider)] p-2.5 bg-white">
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-[var(--text-heading)]">{item.actor}</strong>
                      <span className="text-[10px] text-slate-400 font-mono-id">{item.time}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{item.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

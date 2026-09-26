"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Network, ShieldAlert, CheckCircle2, AlertTriangle, Send } from "lucide-react";
import Card from "@/components/shared/Card";
import StatusBadge from "@/components/shared/StatusBadge";
import { sreIntegrations, type SreIntegration } from "@/lib/mock-data/devops-sre";

export default function SreIntegrationsPage() {
  const [modalIntegration, setModalIntegration] = useState<SreIntegration | null>(null);
  const [requestSubmitted, setRequestSubmitted] = useState<string | null>(null);

  function handleRequestReconnect(integration: SreIntegration) {
    setModalIntegration(null);
    setRequestSubmitted(`Reconnect request for "${integration.provider}" submitted to Platform Operations approval queue (REQ-REC-${Date.now().toString().slice(-4)}).`);
    setTimeout(() => setRequestSubmitted(null), 5000);
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
              Integration 360 &amp; Third-Party Providers
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Provider telemetry, rate-limit consumption, webhook delivery SLAs, and incident correlation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            Read-Only Telemetry (No Direct Reconnect)
          </span>
        </div>
      </div>

      {/* Role Boundary Notice */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3.5 text-xs text-blue-900 leading-relaxed">
        <strong>Permission Boundary:</strong> Third-party credential mutation, revalidation, and webhook replay actions are owned by <em>Platform Operations</em>. SRE has full visibility to correlate provider outages to incidents, and can submit a governed <em>Reconnect Request</em> to the operations approval queue.
      </div>

      {/* Confirmation Banner */}
      {requestSubmitted && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          {requestSubmitted}
        </div>
      )}

      {/* Integrations Table */}
      <Card
        title="Active Ecosystem Integrations"
        description="Real-time provider connection health and quota usage"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--divider)] bg-[var(--search-bg)]/70 text-[var(--role-text)]">
                <th className="px-3 py-2.5 font-semibold">Provider &amp; Rail</th>
                <th className="px-3 py-2.5 font-semibold">Service Function</th>
                <th className="px-3 py-2.5 font-semibold">State</th>
                <th className="px-3 py-2.5 font-semibold">Webhook Delivery</th>
                <th className="px-3 py-2.5 font-semibold">Rate Limit Usage</th>
                <th className="px-3 py-2.5 font-semibold">Linked Incident</th>
                <th className="px-3 py-2.5 font-semibold text-right">Governed Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--divider)]">
              {sreIntegrations.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--search-bg)]/60 transition-colors">
                  <td className="px-3 py-3">
                    <strong className="text-[var(--text-heading)] block">{item.provider}</strong>
                    <span className="text-[11px] text-[var(--text-muted)] font-mono-id">{item.id}</span>
                  </td>
                  <td className="px-3 py-3 text-[var(--role-text)]">{item.service}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={item.statusLevel} label={item.connectionState} />
                  </td>
                  <td className="px-3 py-3 font-mono-id font-semibold text-[var(--text-heading)]">
                    {item.webhookDeliveryPct}
                  </td>
                  <td className="px-3 py-3 font-mono-id text-[var(--text-muted)]">
                    {item.rateLimitUsage}
                  </td>
                  <td className="px-3 py-3">
                    {item.linkedIncident ? (
                      <Link
                        href={`/devops-sre/incidents?id=${item.linkedIncident}`}
                        className="font-bold text-red-700 underline font-mono-id"
                      >
                        {item.linkedIncident}
                      </Link>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setModalIntegration(item)}
                      className="tap-pop rounded-lg border border-[var(--divider)] bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--icon-btn-navy)] shadow-2xs hover:bg-[var(--search-bg)]"
                    >
                      Request Reconnect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Governed Reconnect Request Modal */}
      {modalIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-[var(--divider)]">
            <h3 className="text-base font-bold text-[var(--text-heading)] mb-1">
              Request Provider Reconnect
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Submit a formal request to Platform Operations to initiate credential refresh or connection retry for <strong>{modalIntegration.provider}</strong>.
            </p>

            <div className="space-y-3 text-xs mb-4">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-[var(--divider)]">
                <span className="text-slate-500 block text-[11px]">Provider / ID:</span>
                <strong>{modalIntegration.provider} ({modalIntegration.id})</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-[var(--divider)]">
                <span className="text-slate-500 block text-[11px]">Reason / Case Anchor:</span>
                <strong>Correlated to incident triage ({modalIntegration.linkedIncident || "Operational Degradation"})</strong>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalIntegration(null)}
                className="tap-pop rounded-lg border border-[var(--divider)] px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRequestReconnect(modalIntegration)}
                className="tap-pop flex items-center gap-1.5 rounded-lg bg-[var(--icon-btn-navy)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                <Send size={12} />
                Submit Request to Ops
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

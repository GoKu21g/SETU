"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Layers, ShieldCheck, AlertOctagon, UserCheck, Lock } from "lucide-react";
import Card from "@/components/shared/Card";
import StatusBadge from "@/components/shared/StatusBadge";
import type { StatusLevel } from "@/components/shared/StatusBadge";

type WorkspaceDossier = {
  id: string;
  name: string;
  orgName: string;
  tier: "Enterprise (Tier-1 SLA)" | "Growth (Tier-2)" | "Starter";
  health: "Degraded" | "Healthy" | "Attention";
  healthLevel: StatusLevel;
  activeProducts: string[];
  affectedByIncident?: string;
  lastDiagnostic: string;
  apiSuccessRate: string;
};

const SAMPLE_WORKSPACES: WorkspaceDossier[] = [
  {
    id: "WS-94812",
    name: "Sharma Traders Operations",
    orgName: "Sharma Traders Private Limited",
    tier: "Enterprise (Tier-1 SLA)",
    health: "Degraded",
    healthLevel: "critical",
    activeProducts: ["Chat with Sahayogi (WABA)", "Pay with Sahayogi (UPI)", "Tax Sahayogi"],
    affectedByIncident: "INC-1042 (Meta WABA OAuth Token Expired)",
    lastDiagnostic: "12 min ago (401 Unauthorized)",
    apiSuccessRate: "88.4%",
  },
  {
    id: "WS-10842",
    name: "Bharat Agro Primary",
    orgName: "Bharat Agro Exporters Ltd",
    tier: "Growth (Tier-2)",
    health: "Degraded",
    healthLevel: "critical",
    activeProducts: ["Pay with Sahayogi (Razorpay)", "Tax Sahayogi"],
    affectedByIncident: "INC-1039 (NIC GST Portal Throttling)",
    lastDiagnostic: "45 min ago (Gateway Timeout 504)",
    apiSuccessRate: "92.1%",
  },
  {
    id: "WS-64019",
    name: "QuickPay Retail Network",
    orgName: "QuickPay Solutions Ltd",
    tier: "Enterprise (Tier-1 SLA)",
    health: "Attention",
    healthLevel: "warning",
    activeProducts: ["Chat with Sahayogi (WABA)", "Pay with Sahayogi (UPI)"],
    affectedByIncident: "INC-1042 (Meta WABA OAuth Token Expired)",
    lastDiagnostic: "25 min ago (Warning)",
    apiSuccessRate: "94.2%",
  },
];

export default function SreWorkspace360Page() {
  const [selectedId, setSelectedId] = useState<string>("WS-94812");

  const ws = SAMPLE_WORKSPACES.find((w) => w.id === selectedId) || SAMPLE_WORKSPACES[0];

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
              Workspace 360 (SRE Blast Radius Context Panel)
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Read-only tenant dossier for customer blast radius analysis and SLA prioritization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            <Lock size={12} className="text-slate-500" />
            Read-Only Context Panel
          </span>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-lg border border-[var(--divider)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--icon-btn-navy)] shadow-2xs outline-none"
          >
            {SAMPLE_WORKSPACES.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Matrix Bar */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--card-radius)] border border-[var(--divider)] bg-white p-4"
        style={{ boxShadow: "var(--card-shadow)" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[var(--icon-btn-navy)] font-bold text-lg">
            {ws.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[var(--text-heading)]">{ws.name}</h2>
              <span className="font-mono-id rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-[var(--text-muted)]">
                {ws.id}
              </span>
              <StatusBadge status={ws.healthLevel} label={ws.health} />
            </div>
            <p className="text-xs text-[var(--text-muted)]">{ws.orgName}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="border-l border-[var(--divider)] pl-4">
            <span className="text-[var(--text-muted)] block text-[11px]">Subscription Tier / SLA</span>
            <strong className="text-[var(--text-heading)]">{ws.tier}</strong>
          </div>
          <div className="border-l border-[var(--divider)] pl-4">
            <span className="text-[var(--text-muted)] block text-[11px]">API Success Rate</span>
            <strong className="text-red-700 font-mono-id">{ws.apiSuccessRate}</strong>
          </div>
          <div className="border-l border-[var(--divider)] pl-4">
            <span className="text-[var(--text-muted)] block text-[11px]">Last Probe Status</span>
            <span className="text-slate-700 font-mono-id">{ws.lastDiagnostic}</span>
          </div>
        </div>
      </div>

      {/* Incident Blast Radius Card */}
      {ws.affectedByIncident && (
        <Card title="Active Incident Blast Radius Impact" description="Why this workspace is degraded">
          <div className="p-3.5 rounded-xl bg-red-50/80 border border-red-200 text-xs flex items-center justify-between">
            <div>
              <p className="font-bold text-red-900 mb-0.5">Affected by {ws.affectedByIncident}</p>
              <p className="text-red-700 leading-relaxed">
                Tenant is actively experiencing automated invoice dispatch failures. Customer Support has been alerted.
              </p>
            </div>
            <Link
              href="/devops-sre/incidents?id=INC-1042"
              className="tap-pop rounded-lg bg-red-700 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-red-800"
            >
              Incident 360 &rarr;
            </Link>
          </div>
        </Card>
      )}

      {/* Products & Integrations View Only */}
      <div className="grid grid-cols-1 items-stretch gap-[var(--space-md)] screen-sm:grid-cols-2">
        <Card title="Provisioned Products (Read-Only)" description="Active services on this tenant">
          <ul className="flex flex-col gap-2 py-1 text-xs">
            {ws.activeProducts.map((p) => (
              <li key={p} className="p-2.5 rounded-lg border border-[var(--divider)] bg-slate-50 flex items-center justify-between">
                <span className="font-semibold text-[var(--text-heading)]">{p}</span>
                <span className="text-[11px] text-slate-500">Read-Only</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="SRE Action Boundary" description="Permissions strictly scoped to observation">
          <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700 space-y-2">
            <p>
              ✓ <strong>SRE can:</strong> Observe telemetry, correlate errors to active platform incidents, and verify network latency.
            </p>
            <p className="text-slate-500">
              ✗ <strong>SRE cannot:</strong> Modify subscription tiers, change provisioning state, edit credentials, or trigger customer-facing overrides (reserved for Customer Ops &amp; Platform Admin).
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

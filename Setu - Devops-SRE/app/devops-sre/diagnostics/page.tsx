"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Terminal, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Server, Database, Globe } from "lucide-react";
import Card from "@/components/shared/Card";
import StatusBadge from "@/components/shared/StatusBadge";
import { sreDiagnosticProbes, type SreDiagnosticProbe } from "@/lib/mock-data/devops-sre";

export default function SreDiagnosticsPage() {
  const [targetScope, setTargetScope] = useState<string>("fleet-wide");
  const [selectedProbeId, setSelectedProbeId] = useState<string>("PRB-FLEET-01");
  const [isRunning, setIsRunning] = useState(false);
  const [lastOutput, setLastOutput] = useState<{
    status: "passed" | "failed" | "warning" | "running" | null;
    durationMs?: number;
    logs: string[];
  }>({
    status: "warning",
    durationMs: 84,
    logs: [
      "[13:50:02 UTC] Initiating fleet-wide probe: Fleet Webhook Handshake & Delivery ACK",
      "[13:50:02 UTC] Scope: 48 Monitored Customer Tenants",
      "[13:50:03 UTC] Batch 1/3 (16 endpoints): 16 ACK received (200 OK)",
      "[13:50:03 UTC] Batch 2/3 (16 endpoints): 16 ACK received (200 OK)",
      "[13:50:04 UTC] Batch 3/3 (16 endpoints): 15 ACK received (200 OK) · 1 FAILED (401 Unauthorized)",
      "[13:50:04 UTC] RESULT: 47/48 endpoints healthy. WS-94812 (Sharma Traders) failing HMAC auth (Correlated to INC-1042).",
    ],
  });

  function handleRun() {
    setIsRunning(true);
    setLastOutput({
      status: "running",
      logs: [`[${new Date().toLocaleTimeString()} UTC] Executing ${selectedProbeId} across ${targetScope}...`],
    });

    setTimeout(() => {
      setIsRunning(false);
      if (selectedProbeId === "PRB-FLEET-05") {
        setLastOutput({
          status: "failed",
          durationMs: 340,
          logs: [
            `[${new Date().toLocaleTimeString()} UTC] Starting Meta Cloud API Token Validity Probe`,
            `[${new Date().toLocaleTimeString()} UTC] Testing OAuth credentials across all WABA registered tenants...`,
            `[${new Date().toLocaleTimeString()} UTC] Inbound Graph API response: HTTP 401 Unauthorized`,
            `[${new Date().toLocaleTimeString()} UTC] ERROR: Long-lived token has expired on tenant WS-94812.`,
            `[${new Date().toLocaleTimeString()} UTC] PROBE FAILED: Action required in Customer Support queue.`,
          ],
        });
      } else {
        setLastOutput({
          status: "passed",
          durationMs: 32,
          logs: [
            `[${new Date().toLocaleTimeString()} UTC] Starting probe ${selectedProbeId} across ${targetScope}`,
            `[${new Date().toLocaleTimeString()} UTC] Edge nodes (Mumbai, Delhi, Bangalore) verified: 0% packet loss.`,
            `[${new Date().toLocaleTimeString()} UTC] Cross-region DNS resolution confirmed (TTL: 300s).`,
            `[${new Date().toLocaleTimeString()} UTC] PROBE PASSED. All fleet infrastructure nominal.`,
          ],
        });
      }
    }, 1100);
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
              Fleet-Wide Diagnostic Execution Workbench
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Non-mutating verification probes defaulting to fleet-wide scope to distinguish systemic outages from isolated tenant issues
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            Read-Only Verification Probes
          </span>
        </div>
      </div>

      {/* Main Runner Grid */}
      <div className="grid grid-cols-1 items-stretch gap-[var(--space-md)] screen-xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        {/* Probe Configuration */}
        <Card title="Diagnostic Probe Configuration" description="Defaulting to Fleet-Wide scope for systemic analysis">
          <div className="flex flex-col gap-4 py-1">
            {/* Target Scope Selector (Defaulting to Fleet-Wide) */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-heading)] mb-1">
                Target Scope (SRE Lens Default: Fleet-Wide)
              </label>
              <select
                value={targetScope}
                onChange={(e) => setTargetScope(e.target.value)}
                className="w-full rounded-xl border border-[var(--divider)] bg-[var(--search-bg)] p-2.5 text-xs font-semibold text-[var(--text-heading)] outline-none"
              >
                <option value="fleet-wide">● All Monitored Workspaces (Fleet-Wide: 48 Tenants)</option>
                <option value="core-services">● Core Financial Infrastructure (UPI &amp; BBPS Switches)</option>
                <option value="edge-nodes">● Global Anycast Edge &amp; DNS Ingress Clusters</option>
                <option value="ws-94812">Sharma Traders (WS-94812 — Isolated Tenant)</option>
                <option value="ws-10842">Bharat Agro (WS-10842 — Isolated Tenant)</option>
              </select>
            </div>

            {/* Probe Type Selection */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-heading)] mb-1">
                Select Verification Probe Tool
              </label>
              <div className="grid grid-cols-1 gap-2">
                {sreDiagnosticProbes.map((prb) => {
                  const isSelected = selectedProbeId === prb.id;
                  return (
                    <button
                      key={prb.id}
                      type="button"
                      onClick={() => setSelectedProbeId(prb.id)}
                      className={`p-3 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${
                        isSelected
                          ? "border-[var(--icon-btn-navy)] bg-blue-50/70 font-semibold text-[var(--icon-btn-navy)] ring-1 ring-blue-500/30"
                          : "border-[var(--divider)] hover:bg-[var(--search-bg)] text-slate-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[var(--text-heading)]">{prb.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono-id">{prb.id}</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{prb.category} · {prb.frequency}</p>
                      </div>
                      <StatusBadge status={prb.statusLevel} label={prb.status.toUpperCase()} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Execution Button */}
            <button
              type="button"
              onClick={handleRun}
              disabled={isRunning}
              className="tap-pop flex items-center justify-center gap-2 rounded-xl bg-[var(--icon-btn-navy)] py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 disabled:opacity-50"
            >
              {isRunning ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
              {isRunning ? "Running Fleet Probe..." : "Run Fleet Verification Probe Now"}
            </button>
          </div>
        </Card>

        {/* Live Execution Output Console */}
        <Card
          title="Diagnostic Console Output (SRE Live Telemetry)"
          description={lastOutput.durationMs ? `Probe execution completed in ${lastOutput.durationMs}ms` : "Console idle"}
          action={
            lastOutput.status && (
              <StatusBadge
                status={
                  lastOutput.status === "passed"
                    ? "healthy"
                    : lastOutput.status === "failed"
                    ? "critical"
                    : lastOutput.status === "warning"
                    ? "warning"
                    : "info"
                }
                label={lastOutput.status.toUpperCase()}
              />
            )
          }
        >
          <div className="rounded-xl bg-slate-950 p-4 font-mono-id text-xs leading-relaxed text-slate-200 min-h-[22rem] flex flex-col justify-between">
            <div className="flex flex-col gap-1.5 overflow-y-auto">
              {lastOutput.logs.map((log, idx) => {
                const isFail = log.includes("FAIL") || log.includes("401");
                const isPass = log.includes("PASS") || log.includes("healthy") || log.includes("nominal");
                return (
                  <div
                    key={idx}
                    className={
                      isFail
                        ? "text-red-400 font-bold"
                        : isPass
                        ? "text-emerald-400 font-bold"
                        : "text-slate-300"
                    }
                  >
                    {log}
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-800 pt-2 text-[11px] text-slate-500 flex justify-between">
              <span>Target: {targetScope}</span>
              <span>Operator: Arjun Mehta [SRE]</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

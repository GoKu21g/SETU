"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Terminal, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";
import Card from "@/components/shared/Card";
import StatusBadge from "@/components/shared/StatusBadge";
import { customerWorkspaces } from "@/lib/mock-data/technical-support";

type ProbeType = "webhook_ping" | "ssl_cert" | "dns_resolve" | "payload_trace";

export default function DiagnosticsPage() {
  const [selectedTarget, setSelectedTarget] = useState("WS-94812");
  const [selectedProbe, setSelectedProbe] = useState<ProbeType>("webhook_ping");
  const [isRunning, setIsRunning] = useState(false);
  const [lastOutput, setLastOutput] = useState<{
    status: "passed" | "failed" | "running" | null;
    logs: string[];
    durationMs?: number;
  }>({
    status: "failed",
    logs: [
      "[12:54:12] Initiating diagnostic probe: Webhook Ping & SSL Handshake",
      "[12:54:12] Target: https://api.sharmatraders.in/webhooks/setu",
      "[12:54:13] DNS Resolution: 104.21.48.192 (Cloudflare CDN) - 12ms",
      "[12:54:13] TLS Handshake: TLS 1.3, ECDHE-RSA-AES128-GCM-SHA256 - 42ms",
      "[12:54:13] HTTP POST /webhooks/setu with test payload...",
      "[12:54:14] Response HTTP 401 Unauthorized (342ms)",
      "[12:54:14] FAIL: Registered Meta OAuth signature validation failed. Access token expired.",
    ],
    durationMs: 396,
  });

  function handleRun() {
    setIsRunning(true);
    setLastOutput({
      status: "running",
      logs: [`[${new Date().toLocaleTimeString()}] Running probe: ${selectedProbe} targeting ${selectedTarget}...`],
    });
    setTimeout(() => {
      setIsRunning(false);
      if (selectedTarget === "WS-94812" && selectedProbe === "webhook_ping") {
        setLastOutput({
          status: "failed",
          durationMs: 384,
          logs: [
            `[${new Date().toLocaleTimeString()}] Initiating probe: ${selectedProbe}`,
            `[${new Date().toLocaleTimeString()}] Target: Sharma Traders (${selectedTarget})`,
            `[${new Date().toLocaleTimeString()}] TLS Handshake: 1.3 PASS`,
            `[${new Date().toLocaleTimeString()}] Sending probe payload...`,
            `[${new Date().toLocaleTimeString()}] HTTP 401 Unauthorized received.`,
            `[${new Date().toLocaleTimeString()}] Root-cause: Meta Cloud API Bearer Token Expired.`,
          ],
        });
      } else {
        setLastOutput({
          status: "passed",
          durationMs: 44,
          logs: [
            `[${new Date().toLocaleTimeString()}] Initiating probe: ${selectedProbe}`,
            `[${new Date().toLocaleTimeString()}] Target: ${selectedTarget}`,
            `[${new Date().toLocaleTimeString()}] DNS & TLS Handshake: 24ms`,
            `[${new Date().toLocaleTimeString()}] HTTP 200 OK received (44ms total latency).`,
            `[${new Date().toLocaleTimeString()}] Diagnostic check PASSED. All parameters nominal.`,
          ],
        });
      }
    }, 1200);
  }

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
              Diagnostic Execution Workbench
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Automated and operator-triggered network probes, HMAC validation, and SSL cert checks
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-[var(--space-md)] screen-xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        {/* Probe Config */}
        <Card title="Configure Diagnostic Probe" description="Select target tenant and diagnostic action">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-heading)] mb-1">Target Customer Workspace</label>
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="w-full rounded-lg border border-[var(--divider)] bg-[var(--search-bg)] p-2 text-xs font-medium text-[var(--text-heading)] outline-none"
              >
                {customerWorkspaces.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.id}) · {w.primaryService}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-heading)] mb-1">Diagnostic Probe Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProbe("webhook_ping")}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-colors ${
                    selectedProbe === "webhook_ping"
                      ? "border-[var(--icon-btn-navy)] bg-blue-50/60 font-semibold text-[var(--icon-btn-navy)]"
                      : "border-[var(--divider)] hover:bg-[var(--search-bg)] text-[var(--role-text)]"
                  }`}
                >
                  <p className="font-bold">Webhook Ping & ACK</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Tests end-to-end receipt</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedProbe("ssl_cert")}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-colors ${
                    selectedProbe === "ssl_cert"
                      ? "border-[var(--icon-btn-navy)] bg-blue-50/60 font-semibold text-[var(--icon-btn-navy)]"
                      : "border-[var(--divider)] hover:bg-[var(--search-bg)] text-[var(--role-text)]"
                  }`}
                >
                  <p className="font-bold">Verify SSL/TLS Cert</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Expiry and cipher chain</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedProbe("dns_resolve")}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-colors ${
                    selectedProbe === "dns_resolve"
                      ? "border-[var(--icon-btn-navy)] bg-blue-50/60 font-semibold text-[var(--icon-btn-navy)]"
                      : "border-[var(--divider)] hover:bg-[var(--search-bg)] text-[var(--role-text)]"
                  }`}
                >
                  <p className="font-bold">Validate DNS & Edge</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">IP routing & TTL checks</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedProbe("payload_trace")}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-colors ${
                    selectedProbe === "payload_trace"
                      ? "border-[var(--icon-btn-navy)] bg-blue-50/60 font-semibold text-[var(--icon-btn-navy)]"
                      : "border-[var(--divider)] hover:bg-[var(--search-bg)] text-[var(--role-text)]"
                  }`}
                >
                  <p className="font-bold">HMAC Signature Check</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Key agreement & hash</p>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRun}
              disabled={isRunning}
              className="tap-pop flex items-center justify-center gap-2 rounded-xl bg-[var(--icon-btn-navy)] py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 disabled:opacity-50"
            >
              {isRunning ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
              {isRunning ? "Executing Diagnostic Probe..." : "Run Diagnostic Probe Now"}
            </button>
          </div>
        </Card>

        {/* Live Execution Console */}
        <Card
          title="Diagnostic Console Output"
          description={lastOutput.durationMs ? `Executed in ${lastOutput.durationMs}ms` : "Ready"}
          action={
            lastOutput.status && (
              <StatusBadge
                status={lastOutput.status === "passed" ? "healthy" : lastOutput.status === "failed" ? "critical" : "warning"}
                label={lastOutput.status === "passed" ? "PROBE PASS" : lastOutput.status === "failed" ? "PROBE FAIL" : "RUNNING"}
              />
            )
          }
        >
          <div className="rounded-xl bg-slate-950 p-4 font-mono-id text-xs leading-relaxed text-slate-200 min-h-[18rem] flex flex-col justify-between">
            <div className="flex flex-col gap-1.5 overflow-y-auto">
              {lastOutput.logs.map((log, idx) => {
                const isFail = log.includes("FAIL") || log.includes("401");
                const isPass = log.includes("PASS") || log.includes("200");
                return (
                  <div key={idx} className={isFail ? "text-red-400 font-bold" : isPass ? "text-emerald-400 font-bold" : "text-slate-300"}>
                    {log}
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-800 pt-2 text-[11px] text-slate-500 flex justify-between">
              <span>Probe ID: prb_auto_{selectedTarget}</span>
              <span>Operator: Dhruv Singla (Tier-2 Support)</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

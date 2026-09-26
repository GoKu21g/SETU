"use client";

import Link from "next/link";
import { ArrowLeft, Network, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import Card from "@/components/shared/Card";
import StatusBadge from "@/components/shared/StatusBadge";

const INTEGRATIONS_LIST = [
  { name: "NPCI UPI Switch", category: "Payment Rail", status: "healthy", sla: "99.99%", latency: "18ms", note: "All regional gateways nominal" },
  { name: "NPCI Bharat BillPay (BBPS)", category: "Biller Network", status: "healthy", sla: "99.95%", latency: "24ms", note: "Direct switch connection active" },
  { name: "Meta WhatsApp Cloud API", category: "Messaging Bridge", status: "critical", sla: "97.40%", latency: "840ms", note: "OAuth token expiration alert on WS-94812" },
  { name: "NIC GSTN Ingestion Portal", category: "Tax Government API", status: "healthy", sla: "99.80%", latency: "42ms", note: "E-Way bill & invoice generation active" },
  { name: "UIDAI Aadhaar / DigiLocker", category: "Identity & KYC", status: "warning", sla: "98.90%", latency: "320ms", note: "OTP dispatch latency elevated in Maharashtra region" },
  { name: "NETC FastTag Transit Rail", category: "Toll Network", status: "healthy", sla: "99.98%", latency: "29ms", note: "Toll plaza clearance sync nominal" },
  { name: "Razorpay Aggregator Rail", category: "Payment Gateway", status: "healthy", sla: "99.92%", latency: "74ms", note: "Webhook delivery SLA met" },
];

export default function IntegrationsPage() {
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
              External Rails & Ecosystem Integrations
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Operational status and webhook delivery SLA across third-party financial and messaging networks
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 screen-sm:grid-cols-2 screen-lg:grid-cols-3">
        {INTEGRATIONS_LIST.map((item) => (
          <div
            key={item.name}
            className="flex flex-col justify-between rounded-[var(--card-radius)] border border-[var(--divider)] bg-white p-4"
            style={{ boxShadow: "var(--card-shadow)" }}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-[var(--text-heading)]">{item.name}</span>
                <StatusBadge status={item.status as any} label={item.status === "healthy" ? "Healthy" : item.status === "warning" ? "Attention" : "Degraded"} />
              </div>
              <p className="text-xs text-[var(--role-text)] font-medium">{item.category}</p>
              <p className="text-xs text-[var(--text-muted)] mt-2">{item.note}</p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[var(--divider)] pt-2 text-[11px] text-[var(--role-text)]">
              <span>SLA: <strong className="text-[var(--text-heading)]">{item.sla}</strong></span>
              <span>p95: <strong className="text-[var(--text-heading)] font-mono-id">{item.latency}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

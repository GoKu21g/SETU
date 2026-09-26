"use client";

import Link from "next/link";
import { ArrowLeft, Server, CheckCircle2, AlertOctagon, HeartPulse } from "lucide-react";
import Card from "@/components/shared/Card";
import StatusBadge from "@/components/shared/StatusBadge";
import { serviceRadarTiles, platformServices } from "@/lib/mock-data/technical-support";

export default function PlatformHealthPage() {
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
              Platform & Microservice Telemetry
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Real-time infrastructure health, uptime tracking, and upstream dependency health
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status="healthy" label="99.98% System Uptime" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 screen-sm:grid-cols-3">
        {serviceRadarTiles.map((tile) => (
          <div
            key={tile.id}
            className="flex flex-col justify-between rounded-[var(--card-radius)] border border-[var(--divider)] bg-white p-4"
            style={{ boxShadow: "var(--card-shadow)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-[var(--text-heading)]">{tile.label}</span>
              <StatusBadge status={tile.status} label={tile.status === "healthy" ? "Nominal" : "Degraded"} />
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-3">{tile.cause}</p>
            <div className="flex items-center justify-between border-t border-[var(--divider)] pt-2 text-[11px] text-[var(--role-text)]">
              <span>SLA Target: 99.9%</span>
              <Link href="/technical-support/api-logs" className="font-semibold text-[var(--icon-btn-navy)] hover:underline">
                View logs &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

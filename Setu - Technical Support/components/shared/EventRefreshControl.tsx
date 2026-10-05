"use client";

import { RefreshCw } from "lucide-react";
import { triggerRefresh } from "@/lib/events/refresh";

export default function EventRefreshControl({
  isRefreshing = false,
  lastSource = "init",
}: {
  isRefreshing?: boolean;
  lastSource?: string;
  updatedAt?: Date;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Live Event Indicator */}
      <div className="flex items-center gap-2 rounded-lg border border-[var(--divider)] bg-[var(--surface)] px-2.5 py-1 text-xs text-[var(--text-muted)] shadow-2xs">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="font-semibold text-[var(--text-heading)]">Live Telemetry</span>
        <span className="hidden screen-sm:inline border-l border-[var(--divider)] pl-2 text-[11px] text-[var(--text-muted)]">
          Event-driven
        </span>
        {lastSource && lastSource !== "init" && (
          <span className="hidden screen-md:inline rounded bg-[var(--search-bg)] px-1.5 py-0.2 font-mono-id text-[10px] text-[var(--text-muted)]">
            {lastSource}
          </span>
        )}
      </div>

      {/* Manual Refresh Event Trigger Button */}
      <button
        type="button"
        onClick={() => triggerRefresh({ source: "manual-btn" })}
        disabled={isRefreshing}
        title="Dispatch custom refresh event (setu:refresh)"
        className="
          tap-pop
          flex
          h-[1.95rem]
          items-center
          gap-1.5
          rounded-lg
          border
          border-[var(--divider)]
          bg-[var(--surface)]
          px-2.5
          text-xs
          font-semibold
          text-[var(--icon-btn-navy)]
          shadow-2xs
          transition-all
          hover:bg-[var(--search-bg)]
          active:scale-95
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        <RefreshCw
          size={12}
          className={`text-[var(--icon-btn-navy)] transition-transform duration-300 ${
            isRefreshing ? "animate-spin" : ""
          }`}
        />
        <span>{isRefreshing ? "Updating..." : "Refresh"}</span>
      </button>
    </div>
  );
}

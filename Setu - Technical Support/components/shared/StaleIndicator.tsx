"use client";

import { triggerRefresh } from "@/lib/events/refresh";
import { RefreshCw } from "lucide-react";

export default function StaleIndicator({ lastGoodAt }: { lastGoodAt: Date }) {
  const seconds = Math.max(0, Math.round((Date.now() - lastGoodAt.getTime()) / 1000));
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        triggerRefresh({ source: "stale-retry", force: true });
      }}
      title={`Live refresh failed — showing last known value from ${seconds}s ago. Click to retry.`}
      className="
        tap-pop
        inline-flex
        items-center
        gap-1
        rounded-full
        bg-[var(--status-warning-bg)]
        px-2
        py-0.5
        text-[0.625rem]
        font-medium
        text-[var(--status-warning-fg)]
        transition-all
        hover:opacity-85
        hover:scale-[1.02]
        active:scale-95
        cursor-pointer
      "
    >
      <RefreshCw size={9} />
      <span>Stale &middot; click to retry</span>
    </button>
  );
}

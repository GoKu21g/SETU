"use client";

export type RefreshEventDetail = {
  source?: string;
  timestamp?: number;
  force?: boolean;
};

export const REFRESH_EVENT = "setu:refresh";
const CHANNEL_NAME = "setu-refresh-channel";

/**
 * Dispatch an event-based refresh across the application and to other open tabs.
 */
export function triggerRefresh(detail?: RefreshEventDetail) {
  if (typeof window === "undefined") return;

  const payload: RefreshEventDetail = {
    source: detail?.source || "manual",
    timestamp: detail?.timestamp || Date.now(),
    force: detail?.force ?? false,
  };

  // 1. Dispatch in-window CustomEvent
  window.dispatchEvent(
    new CustomEvent(REFRESH_EVENT, { detail: payload })
  );

  // 2. Broadcast across tabs via BroadcastChannel
  if ("BroadcastChannel" in window) {
    try {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage(payload);
      channel.close();
    } catch {
      // Ignore broadcast errors in restricted browser contexts
    }
  }
}

/**
 * Subscribe to the event-based refresh system (both in-window and cross-tab).
 */
export function subscribeToRefresh(callback: (detail: RefreshEventDetail) => void) {
  if (typeof window === "undefined") return () => {};

  const handleCustomEvent = (event: Event) => {
    const customEvent = event as CustomEvent<RefreshEventDetail>;
    callback(customEvent.detail || { source: "custom-event", timestamp: Date.now() });
  };

  window.addEventListener(REFRESH_EVENT, handleCustomEvent);

  let channel: BroadcastChannel | null = null;
  if ("BroadcastChannel" in window) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (msg: MessageEvent<RefreshEventDetail>) => {
        callback(msg.data || { source: "cross-tab", timestamp: Date.now() });
      };
    } catch {
      channel = null;
    }
  }

  return () => {
    window.removeEventListener(REFRESH_EVENT, handleCustomEvent);
    if (channel) {
      try {
        channel.close();
      } catch {
        // no-op
      }
    }
  };
}

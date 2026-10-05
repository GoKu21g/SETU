"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { subscribeToRefresh, triggerRefresh, type RefreshEventDetail } from "@/lib/events/refresh";

interface UseEventRefreshOptions {
  onRefresh?: (detail: RefreshEventDetail) => void;
  enableVisibilityChange?: boolean;
  enableFocus?: boolean;
  enableOnline?: boolean;
}

export function useEventRefresh(options: UseEventRefreshOptions = {}) {
  const {
    onRefresh,
    enableVisibilityChange = true,
    enableFocus = true,
    enableOnline = true,
  } = options;

  const [updatedAt, setUpdatedAt] = useState<Date>(() => new Date());
  const [stale, setStale] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSource, setLastSource] = useState<string>("init");
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const executeRefresh = useCallback((detail: RefreshEventDetail) => {
    setIsRefreshing(true);
    setUpdatedAt(new Date(detail.timestamp || Date.now()));
    setStale(false);
    setLastSource(detail.source || "event");

    if (onRefreshRef.current) {
      onRefreshRef.current(detail);
    }

    const timer = setTimeout(() => {
      setIsRefreshing(false);
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // 1. Listen to Setu Event Bus (custom events & cross-tab broadcasts)
    const unsubscribe = subscribeToRefresh((detail) => {
      executeRefresh(detail);
    });

    // 2. Browser Tab Visibility Change Event
    const handleVisibility = () => {
      if (enableVisibilityChange && document.visibilityState === "visible") {
        triggerRefresh({ source: "tab-visible" });
      }
    };

    // 3. Window Focus Event
    const handleFocus = () => {
      if (enableFocus) {
        triggerRefresh({ source: "window-focus" });
      }
    };

    // 4. Network Online Event
    const handleOnline = () => {
      if (enableOnline) {
        triggerRefresh({ source: "network-online" });
      }
    };

    if (enableVisibilityChange) {
      document.addEventListener("visibilitychange", handleVisibility);
    }
    if (enableFocus) {
      window.addEventListener("focus", handleFocus);
    }
    if (enableOnline) {
      window.addEventListener("online", handleOnline);
    }

    return () => {
      unsubscribe();
      if (enableVisibilityChange) {
        document.removeEventListener("visibilitychange", handleVisibility);
      }
      if (enableFocus) {
        window.removeEventListener("focus", handleFocus);
      }
      if (enableOnline) {
        window.removeEventListener("online", handleOnline);
      }
    };
  }, [executeRefresh, enableVisibilityChange, enableFocus, enableOnline]);

  const trigger = useCallback((source: string = "manual") => {
    triggerRefresh({ source, timestamp: Date.now() });
  }, []);

  return {
    updatedAt,
    stale,
    isRefreshing,
    lastSource,
    trigger,
    setStale,
  };
}

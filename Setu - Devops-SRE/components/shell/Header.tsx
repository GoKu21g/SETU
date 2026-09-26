"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Plus, Bell, ExternalLink, History, Settings } from "lucide-react";
import { personaConfigFromPathname } from "@/lib/personas";
import AppsLauncher from "@/components/shell/AppsLauncher";

const SRE_NOTIFICATIONS = [
  {
    id: "n1",
    title: "[P1] INC-1042: WhatsApp Cloud Gateway elevated 504s & OAuth failures",
    time: "12m ago",
    unread: true,
  },
  {
    id: "n2",
    title: "[SLO Alert] Tax Engine burn-rate exceeded 2.5x window",
    time: "34m ago",
    unread: true,
  },
  {
    id: "n3",
    title: "[Canary] v3.4.2-patch deployed to 25% cohort in prod-east",
    time: "1h ago",
    unread: false,
  },
];

export default function Header() {
  const [openMenu, setOpenMenu] = useState<
    "profile" | "notifications" | "apps" | null
  >(null);
  const pathname = usePathname();
  const persona = personaConfigFromPathname(pathname);

  function toggle(menu: "profile" | "notifications" | "apps") {
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  return (
    <header
      className="
        relative z-30 flex shrink-0 items-center
        h-[var(--header-h)]
        gap-2
        bg-[var(--shell-bg)]
        pl-3

        screen-lg:pl-4
        screen-2xl:pl-5

        screen-sm:mr-[2.1rem]
        screen-2xl:mr-[2.5rem]
      "
    >
      {/* Backdrop to close menus */}
      {openMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenMenu(null)}
        />
      )}

      {/* Search — centered on viewport */}
      <div className="pointer-events-none fixed left-1/2 top-0 z-20 flex h-[var(--header-h)] w-[min(30rem,90vw)] -translate-x-1/2 items-center px-1 screen-sm:px-2">
        <div
          className="
            pointer-events-auto
            flex h-[3.125rem] w-full
            max-w-[30rem]
            items-center
            gap-2
            rounded-lg
            border
            border-transparent
            bg-[var(--search-bg)]
            px-3

            screen-sm:border-[var(--divider)]
          "
        >
          <span className="shrink-0">
            <Search size={20} className="shrink-0" color="#9CA3AF" />
          </span>

          <input
            type="text"
            placeholder="Search services, incidents, releases, traces..."
            className="
              min-w-0 w-full
              bg-transparent
              text-xs
              text-[var(--text-secondary)]
              outline-none
              placeholder:text-[var(--search-placeholder)]

              screen-sm:text-sm
            "
          />


        </div>
      </div>

      {/* Right side actions */}
      <div className="relative ml-auto flex h-full shrink-0 items-center gap-1.5 screen-sm:gap-2">
        {/* Declare Incident / Action */}
        <Link
          href={`${persona.routeBase}/incidents`}
          title="Incident Command"
          className="
            tap-pop
            flex
            h-[2.5rem]
            items-center
            gap-1.5
            rounded-lg
            border
            border-red-200
            bg-red-50/80
            px-2.5
            text-xs
            font-semibold
            text-red-700
            transition-colors
            hover:bg-red-100
          "
        >
          <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
          <span className="hidden screen-sm:inline">Incidents</span>
        </Link>

        {/* Notifications */}
        <div className="flex h-full items-center">
          <IconButton
            label="SRE Notifications"
            bg="transparent"
            onClick={() => toggle("notifications")}
          >
            <span className="relative">
              <Bell color="#4A5565" size={20} />
              <span
                className="
                  absolute
                  -right-0.5
                  -top-0.5
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-[var(--status-critical-fg)]
                "
              />
            </span>
          </IconButton>

          {/* Notification dropdown */}
          {openMenu === "notifications" && (
            <div
              className="
                absolute
                right-0
                top-[calc(100%+var(--page-pad-y))]
                z-50
                flex
                w-[22rem]
                max-w-[calc(100vw-1.5rem)]
                flex-col
                overflow-hidden
                rounded-xl
                border
                border-[var(--divider)]
                bg-white
                shadow-xl

                screen-2xl:w-[26rem]
              "
            >
              <div className="flex shrink-0 items-center justify-between px-4 py-3.5">
                <p className="text-base font-semibold text-[var(--text-heading)]">
                  Reliability Alerts
                </p>
                <button
                  type="button"
                  className="text-xs font-medium text-[var(--icon-btn-navy)] hover:underline"
                >
                  Acknowledge all
                </button>
              </div>

              <div className="divide-y divide-[var(--divider)] overflow-y-auto border-t border-[var(--divider)] max-h-80">
                {SRE_NOTIFICATIONS.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className="tap-pop flex w-full items-start gap-2 px-4 py-3 text-left transition-colors hover:bg-[var(--search-bg)]"
                  >
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        n.unread ? "bg-red-600" : "bg-transparent"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[var(--text-heading)] leading-snug">
                        {n.title}
                      </p>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {n.time}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sahayogi Apps launcher */}
        <IconButton
          label="Sahayogi Apps"
          bg="transparent"
          onClick={() => toggle("apps")}
        >
          <AppsGridIcon color="#4A5565" />
        </IconButton>

        {openMenu === "apps" && <AppsLauncher onClose={() => setOpenMenu(null)} />}

        {/* Profile */}
        <div>
          <button
            type="button"
            onClick={() => toggle("profile")}
            title={persona.identity.name}
            className="
              tap-pop
              flex
              h-[3.25rem]
              w-[3.25rem]
              shrink-0
              items-center
              justify-center
              rounded-full
              transition-all
              duration-150
              hover:bg-[var(--search-bg)]
            "
          >
            <span
              className="
                flex
                h-[2.6rem]
                w-[2.6rem]
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-gradient-to-tr
                from-[#0B1B3B]
                via-[#1E3A8A]
                to-[#2563EB]
                p-[0.1875rem]
              "
            >
              <span
                className="
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                  rounded-full
                  bg-[var(--avatar-bg)]
                  text-sm
                  font-semibold
                  text-[var(--avatar-text)]
                "
              >
                {persona.identity.initials}
              </span>
            </span>
          </button>

          {openMenu === "profile" && (
            <div
              className="
                absolute
                right-0
                top-[calc(100%+var(--page-pad-y))]
                z-50
                w-[22rem]
                max-w-[calc(100vw-1.5rem)]
                overflow-hidden
                rounded-xl
                border
                border-[var(--divider)]
                bg-white
                shadow-xl
              "
            >
              <div className="flex items-center justify-between px-4 py-3.5">
                <p className="text-base font-semibold text-[var(--text-heading)]">
                  DevOps / SRE Console
                </p>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  On-Call Primary
                </span>
              </div>

              <div className="flex items-start gap-3 border-t border-[var(--divider)] px-4 py-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--avatar-bg)] text-base font-semibold text-[var(--avatar-text)]">
                  {persona.identity.initials}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[var(--text-heading)]">
                    {persona.identity.name}
                  </p>
                  <p className="truncate text-xs text-[var(--text-muted)]">
                    {persona.identity.role}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    arjun.mehta@setu.in · Tier-3 Escalation
                  </p>
                </div>
              </div>

              <div className="border-t border-[var(--divider)] p-2 bg-slate-50 text-[11px] text-[var(--text-muted)]">
                <span>Setu Observability &amp; Reliability Layer (V2.1)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function IconButton({
  children,
  onClick,
  label,
  bg = "var(--icon-btn-bg)",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  label: string;
  bg?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{ backgroundColor: bg }}
      className="
        tap-pop
        flex
        h-[2.5rem]
        w-[2.5rem]
        items-center
        justify-center
        rounded-lg
        border
        border-[var(--divider)]
        transition-colors
        hover:bg-[var(--search-bg)]
      "
    >
      {children}
    </button>
  );
}

function AppsGridIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="3.5" height="3.5" rx="1" fill={color} />
      <rect x="8.25" y="3" width="3.5" height="3.5" rx="1" fill={color} />
      <rect x="13.5" y="3" width="3.5" height="3.5" rx="1" fill={color} />
      <rect x="3" y="8.25" width="3.5" height="3.5" rx="1" fill={color} />
      <rect x="8.25" y="8.25" width="3.5" height="3.5" rx="1" fill={color} />
      <rect x="13.5" y="8.25" width="3.5" height="3.5" rx="1" fill={color} />
      <rect x="3" y="13.5" width="3.5" height="3.5" rx="1" fill={color} />
      <rect x="8.25" y="13.5" width="3.5" height="3.5" rx="1" fill={color} />
      <rect x="13.5" y="13.5" width="3.5" height="3.5" rx="1" fill={color} />
    </svg>
  );
}

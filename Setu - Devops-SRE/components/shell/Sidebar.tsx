"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  HeartPulse,
  AlertTriangle,
  Rocket,
  Terminal,
  Network,
  History,
  ClipboardCheck,
  Settings,
  TrendingUp,
  ShieldCheck,
  FileSearch,
  Box,
} from "lucide-react";
import { personaConfigFromPathname, type Persona } from "@/lib/personas";

type NavItem = {
  label: string;
  slug: string;
  bg: string;
  fg: string;
  icon: (color: string) => ReactNode;
};

// SRE / DevOps Navigation Items — 6 core modules below the clickable logo
const DEVOPS_SRE_NAV_ITEMS: NavItem[] = [
  {
    label: "Platform Health",
    slug: "health",
    bg: "#EFF6FF",
    fg: "#0058DD",
    icon: (color) => <HeartPulse color={color} size={20} />,
  },
  {
    label: "Incidents",
    slug: "incidents",
    bg: "#FEE2E2",
    fg: "#DC2626",
    icon: (color) => <AlertTriangle color={color} size={20} />,
  },
  {
    label: "Releases",
    slug: "releases",
    bg: "#EDE9FE",
    fg: "#7C3AED",
    icon: (color) => <Rocket color={color} size={20} />,
  },
  {
    label: "Diagnostics",
    slug: "diagnostics",
    bg: "#CCFBF1",
    fg: "#0D9488",
    icon: (color) => <Terminal color={color} size={20} />,
  },
  {
    label: "Integrations",
    slug: "integrations",
    bg: "#FFEDD5",
    fg: "#EA580C",
    icon: (color) => <Network color={color} size={20} />,
  },
  {
    label: "Audit",
    slug: "audit",
    bg: "#F3F4F6",
    fg: "#374151",
    icon: (color) => <History color={color} size={20} />,
  },
];

// Fallback navigation items for other personas if switched
const OPERATOR_NAV_ITEMS: NavItem[] = [
  {
    label: "Approvals",
    slug: "approvals",
    bg: "#D1FAE5",
    fg: "#059669",
    icon: (color) => <ClipboardCheck color={color} size={20} />,
  },
  {
    label: "Operations",
    slug: "operations",
    bg: "#DBEAFE",
    fg: "#2563EB",
    icon: (color) => <Settings color={color} size={20} />,
  },
  {
    label: "Analytics",
    slug: "cost-analytics",
    bg: "#CCFBF1",
    fg: "#0D9488",
    icon: (color) => <TrendingUp color={color} size={20} />,
  },
  {
    label: "Compliance",
    slug: "compliance-risk",
    bg: "#CFFAFE",
    fg: "#0891B2",
    icon: (color) => <ShieldCheck color={color} size={20} />,
  },
  {
    label: "Audit",
    slug: "audit-explorer",
    bg: "#FFEDD5",
    fg: "#EA580C",
    icon: (color) => <FileSearch color={color} size={20} />,
  },
  {
    label: "Products",
    slug: "products",
    bg: "#EDE9FE",
    fg: "#7C3AED",
    icon: (color) => <Box color={color} size={20} />,
  },
];

const NAV_ITEMS_BY_PERSONA: Record<Persona, NavItem[]> = {
  "devops-sre": DEVOPS_SRE_NAV_ITEMS,
  "technical-support": DEVOPS_SRE_NAV_ITEMS,
  founder: OPERATOR_NAV_ITEMS,
  "engineering-lead": OPERATOR_NAV_ITEMS,
  "compliance-officer": OPERATOR_NAV_ITEMS,
};

const INDICATOR_COLOR = "#0B1B3B";
const INACTIVE_ICON_COLOR = "#475569";

export default function Sidebar() {
  const pathname = usePathname();
  const persona = personaConfigFromPathname(pathname);
  const navItems = NAV_ITEMS_BY_PERSONA[persona.id] ?? DEVOPS_SRE_NAV_ITEMS;
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [indicator, setIndicator] = useState<{ top: number; height: number } | null>(null);

  const activeIndex = navItems.findIndex((item) => {
    const href = `${persona.routeBase}/${item.slug}`;
    return pathname === href || pathname.startsWith(`${href}/`);
  });

  useEffect(() => {
    function measure() {
      const el = iconRefs.current[activeIndex];
      setIndicator(el ? { top: el.offsetTop, height: el.offsetHeight } : null);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeIndex]);

  return (
    <aside
      className="
        fixed inset-x-0 bottom-0 z-40
        flex h-[4rem] w-full
        flex-row items-center justify-around
        gap-1 overflow-x-auto
        bg-[var(--shell-bg)]
        px-1 py-1

        screen-sm:relative
        screen-sm:h-full
        screen-sm:w-[var(--sidebar-w)]
        screen-sm:flex-col
        screen-sm:items-center
        screen-sm:justify-start
        screen-sm:gap-1
        screen-sm:overflow-visible
        screen-sm:px-0
        screen-sm:py-0
      "
      aria-label="Primary navigation"
    >
      {/* Active indicator */}
      {indicator && (
        <span
          aria-hidden="true"
          className="hidden screen-sm:block absolute left-0 w-1 rounded-full transition-all duration-300 ease-out"
          style={{ top: indicator.top, height: indicator.height, backgroundColor: INDICATOR_COLOR }}
        />
      )}

      {/* Setu Logo — clicking navigates to SRE Dashboard / Control Room */}
      <Link
        href={`${persona.routeBase}/dashboard`}
        aria-label="Go to dashboard"
        title="Setu Control Room (Home)"
        className="
          flex
          shrink-0
          items-center
          justify-center
          h-[3.25rem]
          w-[3.25rem]
          tap-pop
          transition-transform
          duration-150
          hover:scale-105

          screen-sm:h-[var(--header-h)]
          screen-sm:w-full
        "
      >
        <Image
          src="/logo.svg"
          alt="Setu"
          width={63}
          height={77}
          className="h-[2.5rem] w-[2rem]"
          priority
        />
      </Link>

      {/* Navigation */}
      <nav
        className="
          flex
          w-full
          flex-row
          items-center
          justify-around
          gap-1

          screen-sm:flex-1
          screen-sm:flex-col
          screen-sm:justify-start
          screen-sm:gap-1.5
          screen-sm:overflow-y-auto
          screen-sm:overflow-x-hidden
          screen-sm:px-1
          screen-sm:pt-1
        "
      >
        {navItems.map((item, index) => {
          const href = `${persona.routeBase}/${item.slug}`;
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          const iconColor = isActive ? item.fg : INACTIVE_ICON_COLOR;

          return (
            <Link
              key={item.slug}
              href={href}
              title={item.label}
              aria-current={isActive ? "page" : undefined}
              className="
                group
                tap-pop
                flex
                shrink-0
                flex-col
                items-center
                gap-1
              "
            >
              {/* Icon */}
              <span
                ref={(el) => {
                  iconRefs.current[index] = el;
                }}
                className="
                  flex
                  h-[2.75rem] w-[2.75rem]
                  items-center
                  justify-center
                  rounded-lg
                  transition-all
                  duration-200
                  group-hover:scale-105
                  group-hover:bg-[var(--search-bg)]
                "
              >
                {item.icon(iconColor)}
              </span>

              {/* Label */}
              <span
                className={`
                  hidden
                  min-h-[1.5rem]
                  max-w-full
                  text-center
                  text-[0.75rem]
                  font-medium
                  leading-[0.875rem]
                  tracking-tight

                  screen-sm:block

                  ${isActive ? "font-semibold text-[#0B1B3B]" : "text-slate-600"}
                `}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

"use client";

import { useState } from "react";
import {
  MessageSquare,
  Cloud,
  FileText,
  TrendingUp,
  Sparkles,
  Layers,
  Shield,
  Stethoscope,
  Briefcase,
} from "lucide-react";

/**
 * ProductIcon — renders the official Sahayogi product brand mark for each of the
 * 9 Sahayogi products from the official CDN brand assets with vector brand fallbacks.
 * 
 * CRITICAL RULE: "Product identity != Integration identity".
 * Chat with Sahayogi MUST ALWAYS render the Chat with Sahayogi brand mark (never WhatsApp).
 */

type ProductMeta = {
  label: string;
  slug: string;
  localUrl: string;
  logoUrl: string;
  initials: string;
  bg: string;
  fg: string;
  badgeType: "chat" | "boss" | "cloud" | "office" | "investor" | "tax" | "one" | "my" | "studio" | "generic";
};

export const SAHAYOGI_PRODUCTS_MAP: Record<string, ProductMeta> = {
  "chat-with-sahayogi": {
    label: "Chat with Sahayogi",
    slug: "chat-with-sahayogi",
    localUrl: "/brand-assets/products/chat-with-sahayogi.png",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Chat%20With%20Sahayogi.png",
    initials: "CS",
    bg: "#0B1B3B",
    fg: "#FFFFFF",
    badgeType: "chat",
  },
  "boss": {
    label: "BoSS",
    slug: "boss",
    localUrl: "/brand-assets/products/boss.png",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/BoSS.png",
    initials: "BoSS",
    bg: "#0A2540",
    fg: "#FFFFFF",
    badgeType: "boss",
  },
  "sahayogi-cloud": {
    label: "Sahayogi Cloud",
    slug: "sahayogi-cloud",
    localUrl: "/brand-assets/products/sahayogi-cloud.png",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Sahayogi%20Cloud.png",
    initials: "SC",
    bg: "#0284C7",
    fg: "#FFFFFF",
    badgeType: "cloud",
  },
  "office-sahayogi": {
    label: "Office Sahayogi",
    slug: "office-sahayogi",
    localUrl: "/brand-assets/products/office-sahayogi.png",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Office%20Sahayogi.png",
    initials: "OS",
    bg: "#2563EB",
    fg: "#FFFFFF",
    badgeType: "office",
  },
  "investor-sahayogi": {
    label: "Investor Sahayogi",
    slug: "investor-sahayogi",
    localUrl: "/brand-assets/products/investor-sahayogi.png",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Investor%20Sahayogi.png",
    initials: "IS",
    bg: "#154228",
    fg: "#FFFFFF",
    badgeType: "investor",
  },
  "tax-sahayogi": {
    label: "Tax Sahayogi",
    slug: "tax-sahayogi",
    localUrl: "/brand-assets/products/tax-sahayogi.png",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Tax%20Sahayogi.png",
    initials: "TS",
    bg: "#16336B",
    fg: "#FFFFFF",
    badgeType: "tax",
  },
  "sahayogi-one": {
    label: "Sahayogi One",
    slug: "sahayogi-one",
    localUrl: "/brand-assets/products/sahayogi-one.png",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Sahayogi%20One.png",
    initials: "S1",
    bg: "#0B1B3B",
    fg: "#FFFFFF",
    badgeType: "one",
  },
  "my-sahayogi": {
    label: "My Sahayogi",
    slug: "my-sahayogi",
    localUrl: "/brand-assets/products/my-sahayogi.png",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/My%20Sahayogi.png",
    initials: "my",
    bg: "#074B5A",
    fg: "#FFFFFF",
    badgeType: "my",
  },
  "studio-sahayogi": {
    label: "Studio Sahayogi",
    slug: "studio-sahayogi",
    localUrl: "/brand-assets/products/studio-sahayogi.png",
    logoUrl: "https://cdn.sahayogi.in/brand-assets/v1/linkedin/Studio%20Sahayogi.png",
    initials: "ST",
    bg: "#002B33",
    fg: "#FFFFFF",
    badgeType: "studio",
  },
};

export function normalizeProductKey(input: string): string {
  if (!input) return "chat-with-sahayogi";
  const clean = input.toLowerCase().trim();
  if (clean.includes("chat")) return "chat-with-sahayogi";
  if (clean === "boss") return "boss";
  if (clean.includes("cloud")) return "sahayogi-cloud";
  if (clean.includes("office")) return "office-sahayogi";
  if (clean.includes("investor")) return "investor-sahayogi";
  if (clean.includes("tax")) return "tax-sahayogi";
  if (clean.includes("one")) return "sahayogi-one";
  if (clean.includes("my")) return "my-sahayogi";
  if (clean.includes("studio")) return "studio-sahayogi";
  return clean.replace(/\s+/g, "-");
}

type Props = {
  product: string;
  size?: number;
  className?: string;
};

export default function ProductIcon({ product, size = 20, className = "" }: Props) {
  const [srcIndex, setSrcIndex] = useState(0);
  const key = normalizeProductKey(product);
  const meta = SAHAYOGI_PRODUCTS_MAP[key] ?? {
    label: product,
    slug: key,
    localUrl: `/brand-assets/products/${key}.png`,
    logoUrl: `https://cdn.sahayogi.in/brand-assets/v1/linkedin/${encodeURIComponent(product)}.png`,
    initials: product.slice(0, 2).toUpperCase(),
    bg: "#0B1B3B",
    fg: "#FFFFFF",
    badgeType: "generic" as const,
  };

  const borderRadius = Math.max(4, Math.round(size * 0.24));
  const iconSize = Math.max(10, Math.round(size * 0.58));

  // Available image sources in order of preference:
  // 1. High-resolution, zero-margin optimized local asset
  // 2. Official CDN asset
  const imageSources = [meta.localUrl, meta.logoUrl].filter(Boolean);
  const currentSrc = srcIndex < imageSources.length ? imageSources[srcIndex] : null;

  // Render official vector brand badge when image cannot be loaded
  const renderVectorBadge = () => {
    switch (meta.badgeType) {
      case "chat":
        // Official Chat with Sahayogi emblem: smiling speech bubble mark
        return (
          <svg
            viewBox="0 0 24 24"
            width={iconSize}
            height={iconSize}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" fill="currentColor" fillOpacity="0.15" />
            <path d="M8 12h.01M12 12h.01M16 12h.01" strokeWidth="3" />
          </svg>
        );

      case "boss":
        // Official BoSS chevron polygon in SVG
        return (
          <svg viewBox="0 0 40 40" width={iconSize} height={iconSize} fill="none">
            <path d="M12 10L32 20L20 25L12 10Z" fill="#0A2540" />
            <path d="M12 25L20 25L32 20L12 34V25Z" fill="#0066FF" />
          </svg>
        );

      case "cloud":
        return <Cloud size={iconSize} strokeWidth={2.2} />;

      case "office":
        return <Briefcase size={iconSize} strokeWidth={2.2} />;

      case "investor":
        return <TrendingUp size={iconSize} strokeWidth={2.2} />;

      case "tax":
        return (
          <svg
            viewBox="0 0 24 24"
            width={iconSize}
            height={iconSize}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L15 7H21L18 12L21 17H15L12 22L9 17H3L6 12L3 7H9L12 2Z" />
          </svg>
        );

      case "one":
        return (
          <span
            className="font-black tracking-tight select-none leading-none"
            style={{ fontSize: Math.max(9, Math.round(size * 0.38)) }}
          >
            ONE
          </span>
        );

      case "my":
        return (
          <span
            className="font-bold tracking-tight lowercase select-none leading-none"
            style={{ fontSize: Math.max(9, Math.round(size * 0.42)) }}
          >
            my
          </span>
        );

      case "studio":
        return <Sparkles size={iconSize} strokeWidth={2.2} />;

      default:
        return (
          <span
            className="font-bold select-none leading-none"
            style={{ fontSize: Math.max(8, Math.round(size * 0.38)) }}
          >
            {meta.initials.slice(0, 2)}
          </span>
        );
    }
  };

  return (
    <span
      title={meta.label}
      aria-label={meta.label}
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden font-sans select-none bg-white dark:bg-gray-900 border border-black/[0.07] dark:border-white/[0.1] shadow-2xs ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius,
      }}
    >
      {currentSrc ? (
        <img
          src={currentSrc}
          alt={meta.label}
          width={Math.round(size * 2)}
          height={Math.round(size * 2)}
          className="w-full h-full object-cover select-none pointer-events-none"
          style={{
            imageRendering: "auto",
            transform: "translateZ(0)",
          }}
          loading="eager"
          decoding="async"
          draggable={false}
          onError={() => {
            // Cascade to next available source (e.g. CDN fallback)
            setSrcIndex((prev) => prev + 1);
          }}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center font-bold"
          style={{ background: meta.bg, color: meta.fg, borderRadius }}
        >
          {renderVectorBadge()}
        </div>
      )}
    </span>
  );
}


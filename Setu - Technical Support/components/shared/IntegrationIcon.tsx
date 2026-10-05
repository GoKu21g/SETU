"use client";

import React from "react";
import {
  MessageSquare,
  CreditCard,
  Grid,
  FileCheck,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
} from "lucide-react";

type IntegrationMeta = {
  label: string;
  slug: string;
  bg: string;
  fg: string;
  iconName: string;
};

const INTEGRATIONS_MAP: Record<string, IntegrationMeta> = {
  "npci-upi": {
    label: "NPCI UPI Switch",
    slug: "npci-upi",
    bg: "#0A1426",
    fg: "#FFFFFF",
    iconName: "upi",
  },
  "upi": {
    label: "NPCI UPI Switch",
    slug: "npci-upi",
    bg: "#0A1426",
    fg: "#FFFFFF",
    iconName: "upi",
  },
  "bbps": {
    label: "NPCI Bharat BillPay (BBPS)",
    slug: "bbps",
    bg: "#E67E22",
    fg: "#FFFFFF",
    iconName: "bbps",
  },
  "npci-bbps": {
    label: "NPCI Bharat BillPay (BBPS)",
    slug: "bbps",
    bg: "#E67E22",
    fg: "#FFFFFF",
    iconName: "bbps",
  },
  "meta-waba": {
    label: "Meta WhatsApp Cloud API",
    slug: "meta-waba",
    bg: "#10B981",
    fg: "#FFFFFF",
    iconName: "meta",
  },
  "meta": {
    label: "Meta WhatsApp Cloud API",
    slug: "meta-waba",
    bg: "#10B981",
    fg: "#FFFFFF",
    iconName: "meta",
  },
  "whatsapp": {
    label: "WhatsApp Business Platform",
    slug: "whatsapp",
    bg: "#10B981",
    fg: "#FFFFFF",
    iconName: "whatsapp",
  },
  "nic-gst": {
    label: "NIC GSTN Ingestion Portal",
    slug: "nic-gst",
    bg: "#047857",
    fg: "#FFFFFF",
    iconName: "gstn",
  },
  "gstn": {
    label: "NIC GSTN Ingestion Portal",
    slug: "nic-gst",
    bg: "#047857",
    fg: "#FFFFFF",
    iconName: "gstn",
  },
  "uidai": {
    label: "UIDAI Aadhaar / DigiLocker",
    slug: "uidai",
    bg: "#FFF1F2",
    fg: "#E11D48",
    iconName: "uidai",
  },
  "aadhaar": {
    label: "UIDAI Aadhaar / DigiLocker",
    slug: "uidai",
    bg: "#FFF1F2",
    fg: "#E11D48",
    iconName: "uidai",
  },
  "netc": {
    label: "NETC FastTag Transit Rail",
    slug: "netc",
    bg: "#0284C7",
    fg: "#FFFFFF",
    iconName: "netc",
  },
  "netc-fasttag": {
    label: "NETC FastTag Transit Rail",
    slug: "netc",
    bg: "#0284C7",
    fg: "#FFFFFF",
    iconName: "netc",
  },
  "fasttag": {
    label: "NETC FastTag Transit Rail",
    slug: "netc",
    bg: "#0284C7",
    fg: "#FFFFFF",
    iconName: "netc",
  },
  "razorpay": {
    label: "Razorpay Aggregator Rail",
    slug: "razorpay",
    bg: "#0A192F",
    fg: "#3395FF",
    iconName: "razorpay",
  },
  "sms-gateway": {
    label: "SMS & OTP Gateway",
    slug: "sms-gateway",
    bg: "#F97316",
    fg: "#FFFFFF",
    iconName: "sms",
  },
  "sms": {
    label: "SMS & OTP Gateway",
    slug: "sms-gateway",
    bg: "#F97316",
    fg: "#FFFFFF",
    iconName: "sms",
  },
  "nsdl-pan": {
    label: "NSDL PAN Verification Gateway",
    slug: "nsdl-pan",
    bg: "#1E3A8A",
    fg: "#FFFFFF",
    iconName: "nsdl",
  },
  "nsdl": {
    label: "NSDL PAN Verification Gateway",
    slug: "nsdl-pan",
    bg: "#1E3A8A",
    fg: "#FFFFFF",
    iconName: "nsdl",
  },
  "microsoft-365": {
    label: "Microsoft Graph / 365 API",
    slug: "microsoft-365",
    bg: "#F8FAFC",
    fg: "#0F172A",
    iconName: "m365",
  },
  "tally": {
    label: "Tally on Cloud",
    slug: "tally",
    bg: "#0F172A",
    fg: "#FFFFFF",
    iconName: "tally",
  },
  "income-tax": {
    label: "Income Tax Department API",
    slug: "income-tax",
    bg: "#0F766E",
    fg: "#FFFFFF",
    iconName: "incometax",
  },
  "income-tax-api": {
    label: "Income Tax Department API",
    slug: "income-tax",
    bg: "#0F766E",
    fg: "#FFFFFF",
    iconName: "incometax",
  },
  "cams": {
    label: "CAMS / KFintech Statement Feed",
    slug: "cams",
    bg: "#047857",
    fg: "#A7F3D0",
    iconName: "cams",
  },
  "setu-aa": {
    label: "Setu Account Aggregator",
    slug: "setu-aa",
    bg: "#1D4ED8",
    fg: "#DBEAFE",
    iconName: "aa",
  },
  "sop-engine": {
    label: "SOP Engine / LLM Worker",
    slug: "sop-engine",
    bg: "#6D28D9",
    fg: "#EDE9FE",
    iconName: "sop",
  },
};

function normalizeIntegrationKey(input: string): string {
  const clean = input.toLowerCase().trim();
  if (clean.includes("upi") || clean.includes("npci upi")) return "npci-upi";
  if (clean.includes("bbps") || clean.includes("billpay")) return "bbps";
  if (clean.includes("aadhaar") || clean.includes("uidai") || clean.includes("digilocker")) return "uidai";
  if (clean.includes("fasttag") || clean.includes("netc") || clean.includes("toll")) return "netc";
  if (clean.includes("sms") || clean.includes("airtel") || clean.includes("otp")) return "sms-gateway";
  if (clean.includes("whatsapp") || clean.includes("meta") || clean.includes("waba")) return "meta-waba";
  if (clean.includes("razorpay")) return "razorpay";
  if (clean.includes("tally")) return "tally";
  if (clean.includes("microsoft") || clean.includes("365") || clean.includes("azure") || clean.includes("graph")) return "microsoft-365";
  if (clean.includes("income") || clean.includes("tax")) return "income-tax-api";
  if (clean.includes("nic") || clean.includes("gst")) return "nic-gst";
  if (clean.includes("cams") || clean.includes("kfin") || clean.includes("mutual")) return "cams";
  if (clean.includes("nsdl") || clean.includes("pan")) return "nsdl-pan";
  if (clean.includes("setu") || clean.includes("aa") || clean.includes("aggregator")) return "setu-aa";
  if (clean.includes("sop") || clean.includes("blueprint") || clean.includes("llm")) return "sop-engine";
  return clean.replace(/\s+/g, "-");
}

type Props = {
  integration: string;
  size?: number;
  className?: string;
};

export default function IntegrationIcon({ integration, size = 18, className = "" }: Props) {
  const key = normalizeIntegrationKey(integration);
  const meta = INTEGRATIONS_MAP[key] ?? {
    label: integration,
    slug: key,
    bg: "#1E293B",
    fg: "#FFFFFF",
    iconName: "default",
  };

  const borderRadius = Math.max(5, Math.round(size * 0.22));

  return (
    <span
      title={meta.label}
      aria-label={meta.label}
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden select-none border border-black/[0.08] dark:border-white/[0.08] ${className}`}
      style={{
        width: size,
        height: size,
        background: meta.bg,
        color: meta.fg,
        borderRadius,
      }}
    >
      {/* 1. UPI SWITCH — Authentic pure vector UPI typography with twin orange/green chevrons */}
      {meta.iconName === "upi" && (
        <svg
          viewBox="0 0 46 20"
          width={Math.round(size * 0.88)}
          height={Math.round(size * 0.44)}
          fill="none"
          className="shrink-0 overflow-visible"
        >
          {/* UPI italic vector letters */}
          <g transform="skewX(-13)">
            {/* U */}
            <path
              d="M4 3.5h3.2v7c0 1.9 1 2.8 2.6 2.8 1.6 0 2.6-.9 2.6-2.8v-7h3.2v7c0 3.6-2.1 5.5-5.8 5.5s-5.8-1.9-5.8-5.5v-7z"
              fill="#FFFFFF"
            />
            {/* P */}
            <path
              d="M17.8 3.5h5.4c2.8 0 4.5 1.4 4.5 3.8 0 2.4-1.7 3.8-4.5 3.8h-2.2v4.8h-3.2V3.5zm3.2 5.1h2.2c1 0 1.6-.5 1.6-1.3 0-.8-.6-1.3-1.6-1.3H21v2.6z"
              fill="#FFFFFF"
            />
            {/* I */}
            <path d="M30 3.5h3.2v12.4H30V3.5z" fill="#FFFFFF" />
          </g>
          {/* Dual forward chevrons */}
          <path d="M35.5 4.5L39.5 10L35.5 15.5H38L42 10L38 4.5H35.5Z" fill="#F47920" />
          <path d="M39.8 4.5L43.8 10L39.8 15.5H42.3L46.3 10L42.3 4.5H39.8Z" fill="#00A551" />
        </svg>
      )}

      {/* 2. BHARAT BILLPAY — Authentic white IB stylized monogram */}
      {meta.iconName === "bbps" && (
        <svg
          viewBox="0 0 32 26"
          width={Math.round(size * 0.74)}
          height={Math.round(size * 0.56)}
          fill="none"
          className="shrink-0"
        >
          {/* Vertical Pill Bar */}
          <rect x="2.5" y="2.5" width="6.5" height="21" rx="3.25" fill="#FFFFFF" />
          {/* B Lobe Geometry */}
          <path
            d="M11 2.5H21C25.2 2.5 28 5 28 8.6C28 11.2 26.2 13 23.8 13.7C26.7 14.4 28.6 16.5 28.6 19.8C28.6 23.5 25.4 26 21 26H11V2.5ZM17 7V10.8H20.8C22.2 10.8 23 10 23 8.9C23 7.8 22.2 7 20.8 7H17ZM17 17.5V21.5H21.2C22.8 21.5 23.8 20.7 23.8 19.5C23.8 18.3 22.8 17.5 21.2 17.5H17Z"
            fill="#FFFFFF"
          />
        </svg>
      )}

      {/* 3. META / WHATSAPP CLOUD API — Official white Meta infinity loop on emerald green */}
      {meta.iconName === "meta" && (
        <svg
          viewBox="0 0 28 20"
          width={Math.round(size * 0.75)}
          height={Math.round(size * 0.54)}
          fill="none"
          className="shrink-0"
        >
          <path
            d="M19.2 3.8C17.2 3.8 15.3 5 14 6.8C12.7 5 10.8 3.8 8.8 3.8C4.8 3.8 2 7 2 11.4C2 16.4 6 19.4 9 19.4C11.5 19.4 13.2 17.9 14 16.1C14.8 17.9 16.5 19.4 19 19.4C22 19.4 26 16.4 26 11.4C26 7 23.2 3.8 19.2 3.8ZM8.8 16.6C6.6 16.6 4.6 14.5 4.6 11.4C4.6 8.4 6.4 6.6 8.8 6.6C10.8 6.6 12.2 8.1 13.1 10.1C12.3 12.7 10.8 16.6 8.8 16.6ZM19.2 16.6C17.2 16.6 15.7 12.7 14.9 10.1C15.8 8.1 17.2 6.6 19.2 6.6C21.6 6.6 23.4 8.4 23.4 11.4C23.4 14.5 21.4 16.6 19.2 16.6Z"
            fill="#FFFFFF"
          />
        </svg>
      )}

      {/* WHATSAPP APP — Authentic WhatsApp handset & speech bubble */}
      {meta.iconName === "whatsapp" && (
        <svg
          viewBox="0 0 24 24"
          width={Math.round(size * 0.68)}
          height={Math.round(size * 0.68)}
          fill="currentColor"
          className="shrink-0"
        >
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24h.22zm-3.5 4.35c-.19 0-.49.07-.75.35-.26.27-1 1-1 2.43 0 1.44 1.03 2.82 1.18 3.02.14.2 2.01 3.16 4.94 4.39.69.29 1.23.47 1.66.6.7.22 1.34.19 1.84.12.57-.09 1.74-.71 1.98-1.4.24-.69.24-1.28.17-1.4-.07-.12-.26-.19-.55-.33-.29-.15-1.74-.86-2.01-.96-.27-.1-.47-.15-.67.15-.2.29-.77.96-.94 1.16-.18.19-.35.22-.64.07-.29-.15-1.24-.46-2.37-1.46-.87-.78-1.47-1.75-1.64-2.04-.17-.29-.02-.45.13-.59.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.08-.15-.67-1.63-.92-2.23-.24-.6-.49-.51-.67-.52l-.57-.01z" />
        </svg>
      )}

      {/* 4. NIC GSTN — Authentic circular GST emblem with 3 dynamic pinwheel swooshes */}
      {meta.iconName === "gstn" && (
        <svg
          viewBox="0 0 28 28"
          width={Math.round(size * 0.78)}
          height={Math.round(size * 0.78)}
          fill="none"
          className="shrink-0"
        >
          {/* Outer Ring */}
          <circle cx="14" cy="14" r="11.5" stroke="#FFFFFF" strokeWidth="2.2" />
          {/* Tri-Blade GST Pinwheel Swooshes */}
          <path
            d="M14 14L14 3.5C19.8 3.5 24.5 8.2 24.5 14C24.5 15.6 24 17.1 23.2 18.5L14 14Z"
            fill="#FFFFFF"
          />
          <path
            d="M14 14L4.8 19.3C2.8 15.8 3.4 11.2 6.5 8.5L14 14Z"
            fill="#FFFFFF"
            fillOpacity="0.82"
          />
          <path
            d="M14 14L23.2 18.5C21 22.5 16.2 24.5 11.8 23.2L14 14Z"
            fill="#FFFFFF"
            fillOpacity="0.65"
          />
          {/* Central Hub */}
          <circle cx="14" cy="14" r="2.8" fill="#047857" />
        </svg>
      )}

      {/* 5. UIDAI AADHAAR — Authentic crimson sunburst with biometric fingerprint arches */}
      {meta.iconName === "uidai" && (
        <svg
          viewBox="0 0 32 32"
          width={Math.round(size * 0.84)}
          height={Math.round(size * 0.84)}
          fill="none"
          className="shrink-0"
        >
          {/* Saffron & Red Solar Rays */}
          <g stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round">
            <line x1="16" y1="2" x2="16" y2="5.5" />
            <line x1="16" y1="26.5" x2="16" y2="30" />
            <line x1="2" y1="16" x2="5.5" y2="16" />
            <line x1="26.5" y1="16" x2="30" y2="16" />
            <line x1="6.1" y1="6.1" x2="8.8" y2="8.8" />
            <line x1="23.2" y1="23.2" x2="25.9" y2="25.9" />
            <line x1="6.1" y1="25.9" x2="8.8" y2="23.2" />
            <line x1="23.2" y1="8.8" x2="25.9" y2="6.1" />
            {/* Secondary Interstitial Rays */}
            <line x1="10.8" y1="3.5" x2="12.5" y2="6.5" strokeWidth="1.3" />
            <line x1="21.2" y1="3.5" x2="19.5" y2="6.5" strokeWidth="1.3" />
            <line x1="10.8" y1="28.5" x2="12.5" y2="25.5" strokeWidth="1.3" />
            <line x1="21.2" y1="28.5" x2="19.5" y2="25.5" strokeWidth="1.3" />
            <line x1="3.5" y1="10.8" x2="6.5" y2="12.5" strokeWidth="1.3" />
            <line x1="3.5" y1="21.2" x2="6.5" y2="19.5" strokeWidth="1.3" />
            <line x1="28.5" y1="10.8" x2="25.5" y2="12.5" strokeWidth="1.3" />
            <line x1="28.5" y1="21.2" x2="25.5" y2="19.5" strokeWidth="1.3" />
          </g>
          {/* Crimson Sun Disc */}
          <circle cx="16" cy="16" r="6.8" fill="#DC2626" />
          {/* Fingerprint Biometric Arches */}
          <path
            d="M13 18C13 15 14.3 13.5 16 13.5C17.7 13.5 19 15 19 18M11.5 19.5C11.5 14.5 13.5 11.8 16 11.8C18.5 11.8 20.5 14.5 20.5 19.5"
            stroke="#FFFFFF"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* 6. NETC FASTAG — Authentic highway perspective arrowhead with amber road lane */}
      {meta.iconName === "netc" && (
        <svg
          viewBox="0 0 28 28"
          width={Math.round(size * 0.78)}
          height={Math.round(size * 0.78)}
          fill="none"
          className="shrink-0"
        >
          {/* Highway Road Borders */}
          <path d="M5 23L12 4H16L23 23H18.5L16 16H12L9.5 23H5Z" fill="#FFFFFF" />
          {/* Amber FASTag Speed Wave / Center Lane */}
          <path d="M12.5 13H15.5L17 17.5H11L12.5 13Z" fill="#F59E0B" />
          <path d="M9.8 20.5H18.2L18.8 22.5H9.2L9.8 20.5Z" fill="#F59E0B" />
        </svg>
      )}

      {/* 7. RAZORPAY — Official 3D Razor blade and lightning slash */}
      {meta.iconName === "razorpay" && (
        <svg
          viewBox="0 0 28 28"
          width={Math.round(size * 0.76)}
          height={Math.round(size * 0.76)}
          fill="none"
          className="shrink-0"
        >
          {/* Deep Navy Left Stem */}
          <path d="M8 24L17 3H12L3 24H8Z" fill="#0C2340" />
          {/* Vibrant Electric Cyan/Blue Razor Slash */}
          <path d="M14.5 14.5L18.5 3H23.5L19 14.5H14.5Z" fill="#3395FF" />
          <path d="M19 14.5L15 24H10.5L14.5 14.5H19Z" fill="#2563EB" />
        </svg>
      )}

      {/* 8. SMS & OTP GATEWAY — Vibrant orange with clean white 3-dot speech bubble */}
      {meta.iconName === "sms" && (
        <svg
          viewBox="0 0 26 26"
          width={Math.round(size * 0.72)}
          height={Math.round(size * 0.72)}
          fill="none"
          className="shrink-0"
        >
          <rect x="2.5" y="3" width="21" height="15.5" rx="3.5" fill="#FFFFFF" />
          <path d="M6.5 18.5L3 22.5V18.5H6.5Z" fill="#FFFFFF" />
          <circle cx="8" cy="10.8" r="1.8" fill="#F97316" />
          <circle cx="13" cy="10.8" r="1.8" fill="#F97316" />
          <circle cx="18" cy="10.8" r="1.8" fill="#F97316" />
        </svg>
      )}

      {/* 9. NSDL PAN GATEWAY — Official NSDL financial star & security shield */}
      {meta.iconName === "nsdl" && (
        <svg
          viewBox="0 0 28 28"
          width={Math.round(size * 0.76)}
          height={Math.round(size * 0.76)}
          fill="none"
          className="shrink-0"
        >
          <circle cx="14" cy="14" r="11.5" stroke="#38BDF8" strokeWidth="1.8" />
          <path
            d="M14 4.5L16.5 11.2H23.2L17.8 15.2L19.8 22L14 17.8L8.2 22L10.2 15.2L4.8 11.2H11.5L14 4.5Z"
            fill="#F97316"
          />
          <circle cx="14" cy="14" r="3.8" fill="#10B981" />
        </svg>
      )}

      {/* 10. MICROSOFT GRAPH / 365 — Official Microsoft 4-color Quad tile */}
      {meta.iconName === "m365" && (
        <svg
          viewBox="0 0 22 22"
          width={Math.round(size * 0.7)}
          height={Math.round(size * 0.7)}
          className="shrink-0"
        >
          <rect x="1" y="1" width="9.2" height="9.2" fill="#F25022" />
          <rect x="11.8" y="1" width="9.2" height="9.2" fill="#7FBA00" />
          <rect x="1" y="11.8" width="9.2" height="9.2" fill="#00A4EF" />
          <rect x="11.8" y="11.8" width="9.2" height="9.2" fill="#FFB900" />
        </svg>
      )}

      {/* 11. TALLY ON CLOUD — Official Tally red & amber dual brackets */}
      {meta.iconName === "tally" && (
        <svg
          viewBox="0 0 28 28"
          width={Math.round(size * 0.78)}
          height={Math.round(size * 0.78)}
          fill="none"
          className="shrink-0"
        >
          {/* Tally Red Left Bracket */}
          <path d="M6 7C6 4.8 7.8 3.5 10 3.5V7.5H7.8V16.5H10V20.5C7.8 20.5 6 19.2 6 17V7Z" fill="#EF4444" />
          {/* Tally Amber Right Bracket */}
          <path d="M22 7C22 4.8 20.2 3.5 18 3.5V7.5H20.2V16.5H18V20.5C20.2 20.5 22 19.2 22 17V7Z" fill="#F59E0B" />
          {/* Center T */}
          <path d="M11.5 8.5H16.5V11H14.8V18.5H13.2V11H11.5V8.5Z" fill="#FFFFFF" />
        </svg>
      )}

      {/* 12. INCOME TAX DEPARTMENT — Official ITD seal with national emblem shield */}
      {meta.iconName === "incometax" && (
        <svg
          viewBox="0 0 28 28"
          width={Math.round(size * 0.78)}
          height={Math.round(size * 0.78)}
          fill="none"
          className="shrink-0"
        >
          <rect x="2" y="3" width="24" height="22" rx="3" fill="#044E47" />
          <path
            d="M14 5.5L21.5 10.5V16C21.5 20.2 18.2 23 14 24.5C9.8 23 6.5 20.2 6.5 16V10.5L14 5.5Z"
            fill="#0F766E"
            stroke="#F59E0B"
            strokeWidth="1.2"
          />
          <circle cx="14" cy="14" r="3.5" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
          <line x1="14" y1="10.5" x2="14" y2="17.5" stroke="#FFFFFF" strokeWidth="1" />
          <line x1="10.5" y1="14" x2="17.5" y2="14" stroke="#FFFFFF" strokeWidth="1" />
        </svg>
      )}

      {/* 13. SETU ACCOUNT AGGREGATOR — Official Setu "S" Bridge */}
      {meta.iconName === "aa" && (
        <svg
          viewBox="0 0 28 28"
          width={Math.round(size * 0.76)}
          height={Math.round(size * 0.76)}
          fill="none"
          className="shrink-0"
        >
          <path
            d="M18.5 6C15.5 6 13 8 13 11C13 14.5 19 14.5 19 18C19 20 17 21.5 14.5 21.5C12 21.5 9.8 20.2 9 18.5L6.5 20C7.8 22.5 11 24.5 14.5 24.5C18.5 24.5 22 22 22 18C22 14 16 14 16 11C16 9.5 17.5 8.5 19 8.5C21 8.5 22.5 9.5 23.2 11L25.5 9.5C24.2 7.2 21.5 6 18.5 6Z"
            fill="#FFFFFF"
          />
        </svg>
      )}

      {/* 14. CAMS — Financial growth trend mark */}
      {meta.iconName === "cams" && (
        <svg
          viewBox="0 0 28 28"
          width={Math.round(size * 0.76)}
          height={Math.round(size * 0.76)}
          fill="none"
          className="shrink-0"
        >
          <path d="M5 21L11.5 13.5L15.5 17.5L22.5 7" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 7H22.5V12.5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="22.5" cy="7" r="2.5" fill="#34D399" />
        </svg>
      )}

      {/* 15. DEFAULT FALLBACK */}
      {(meta.iconName === "default" || meta.iconName === "sop") && (
        <Layers size={Math.round(size * 0.6)} />
      )}
    </span>
  );
}

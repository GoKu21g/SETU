"use client";

import React from "react";

export type ProviderType =
  | "npci"
  | "bbps"
  | "meta"
  | "nic"
  | "uidai"
  | "netc"
  | "razorpay"
  | "airtel"
  | "nsdl"
  | "microsoft"
  | "tally"
  | "cams"
  | "setu"
  | "incometax";

interface ProviderLogoProps {
  provider: ProviderType | string;
  name?: string;
  size?: number;
  showText?: boolean;
  className?: string;
}

export function normalizeProvider(input: string): ProviderType {
  const clean = input.toLowerCase();
  if (clean.includes("npci") || clean.includes("upi")) return "npci";
  if (clean.includes("bbps") || clean.includes("billpay")) return "bbps";
  if (clean.includes("meta") || clean.includes("waba") || clean.includes("whatsapp")) return "meta";
  if (clean.includes("nic") || clean.includes("gst")) return "nic";
  if (clean.includes("uidai") || clean.includes("aadhaar") || clean.includes("digilocker")) return "uidai";
  if (clean.includes("netc") || clean.includes("fasttag")) return "netc";
  if (clean.includes("razorpay")) return "razorpay";
  if (clean.includes("airtel") || clean.includes("sms")) return "airtel";
  if (clean.includes("nsdl") || clean.includes("pan")) return "nsdl";
  if (clean.includes("microsoft") || clean.includes("365")) return "microsoft";
  if (clean.includes("tally")) return "tally";
  if (clean.includes("cams") || clean.includes("kfin")) return "cams";
  if (clean.includes("setu") || clean.includes("aa")) return "setu";
  if (clean.includes("income") || clean.includes("tax")) return "incometax";
  return "npci";
}

export default function ProviderLogo({
  provider,
  name,
  size = 16,
  showText = true,
  className = "",
}: ProviderLogoProps) {
  const type = normalizeProvider(provider);

  const renderIconAndText = () => {
    switch (type) {
      // 1. NPCI — Dual forward-angled parallelograms (Orange & Green) + bold "NPCI"
      case "npci":
        return (
          <div className="flex items-center gap-1.5 shrink-0 select-none">
            <svg
              viewBox="0 0 22 14"
              width={Math.round(size * 1.2)}
              height={Math.round(size * 0.76)}
              className="shrink-0"
              fill="none"
            >
              {/* Slanted parallelograms tilted ~22 degrees */}
              <path d="M4 13L10 1H6L0 13H4Z" fill="#F97316" />
              <path d="M11 13L17 1H13L7 13H11Z" fill="#10B981" />
            </svg>
            {showText && (
              <span className="font-extrabold text-[11px] text-[var(--text-heading)] tracking-tight">
                NPCI
              </span>
            )}
          </div>
        );

      // 2. BHARAT BILLPAY — Orange emblem with white IB monogram + stacked Bharat / BillPay
      case "bbps":
        return (
          <div className="flex items-center gap-1.5 shrink-0 select-none">
            <div
              className="flex items-center justify-center rounded-sm bg-[#EA580C] text-white shrink-0 p-0.5 shadow-2xs"
              style={{ width: size, height: size }}
            >
              <svg viewBox="0 0 24 20" width={size * 0.75} height={size * 0.65} fill="none">
                <rect x="2" y="2" width="5" height="16" rx="2.5" fill="#FFFFFF" />
                <path
                  d="M9 2H17C20.5 2 23 4.2 23 7C23 9 21.5 10.4 19.5 11C22 11.5 23.5 13.2 23.5 16C23.5 19 21 20 17 20H9V2Z"
                  fill="#FFFFFF"
                />
              </svg>
            </div>
            {showText && (
              <div className="flex flex-col leading-[1.05] shrink-0">
                <span className="text-[10px] font-bold text-[var(--text-heading)]">Bharat</span>
                <span className="text-[9.5px] font-medium text-[var(--text-muted)]">BillPay</span>
              </div>
            )}
          </div>
        );

      // 3. META — Official Meta Blue #0064E0 continuous infinity loop + "Meta"
      case "meta":
        return (
          <div className="flex items-center gap-1.5 shrink-0 select-none">
            <svg
              viewBox="0 0 26 18"
              width={Math.round(size * 1.15)}
              height={Math.round(size * 0.8)}
              className="text-[#0064E0] shrink-0"
              fill="currentColor"
            >
              <path d="M18.2 3C16.3 3 14.6 4.1 13.3 5.7 12 4.1 10.3 3 8.4 3 4.6 3 1.9 6 1.9 10.2c0 4.8 3.8 7.8 6.7 7.8 2.4 0 4-1.5 4.7-3.2.7 1.7 2.3 3.2 4.7 3.2 2.9 0 6.7-3 6.7-7.8C24.7 6 22 3 18.2 3zm-9.8 12.2C6.3 15.2 4.4 13.2 4.4 10.2c0-2.8 1.7-4.5 4-4.5 1.9 0 3.2 1.4 4.1 3.4-.8 2.5-2.2 6.1-4.1 6.1zm9.8 0c-1.9 0-3.3-3.6-4.1-6.1.9-2 2.2-3.4 4.1-3.4 2.3 0 4 1.7 4 4.5 0 3-1.9 5-4 5z" />
            </svg>
            {showText && (
              <span className="font-bold text-[11px] text-[var(--text-heading)]">
                Meta
              </span>
            )}
          </div>
        );

      // 4. NIC — Official solid blue rectangular badge with bold white "NIC"
      case "nic":
        return (
          <div className="flex items-center gap-1.5 shrink-0 select-none">
            <span
              className="inline-flex items-center justify-center font-bold tracking-wider rounded bg-[#1D4ED8] text-white px-1.5 py-0.5 shadow-2xs"
              style={{ height: Math.max(14, size * 0.95), fontSize: Math.max(8.5, Math.round(size * 0.58)) }}
            >
              NIC
            </span>
          </div>
        );

      // 5. UIDAI — Authentic crimson Aadhaar sunburst + bold "UIDAI"
      case "uidai":
        return (
          <div className="flex items-center gap-1.5 shrink-0 select-none">
            <svg
              viewBox="0 0 24 24"
              width={size * 1.1}
              height={size * 1.1}
              className="text-[#DC2626] shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="3.6" fill="#DC2626" stroke="none" />
              <path d="M12 2v2.5M12 19.5v2.5M2 12h2.5M19.5 12h2.5M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77" />
            </svg>
            {showText && (
              <span className="font-extrabold text-[11px] text-[var(--text-heading)] tracking-tight">
                UIDAI
              </span>
            )}
          </div>
        );

      // 6. NETC — Solid sky blue pill badge with white "NETC"
      case "netc":
        return (
          <div className="flex items-center gap-1.5 shrink-0 select-none">
            <span
              className="inline-flex items-center justify-center font-extrabold tracking-wider rounded bg-[#0284C7] text-white px-1.5 py-0.5 shadow-2xs"
              style={{ height: Math.max(14, size * 0.95), fontSize: Math.max(8, Math.round(size * 0.52)) }}
            >
              NETC
            </span>
          </div>
        );

      // 7. RAZORPAY — Official electric neon blue razor blade + "Razorpay"
      case "razorpay":
        return (
          <div className="flex items-center gap-1.5 shrink-0 select-none">
            <svg
              viewBox="0 0 24 24"
              width={size * 1.05}
              height={size * 1.05}
              className="shrink-0"
              fill="none"
            >
              <path d="M6 21L14.2 2.5h4.3L10.5 21H6z" fill="#0C2340" />
              <path d="M12.5 13L16 2.5h4.5L16.2 13h-3.7z" fill="#3395FF" />
            </svg>
            {showText && (
              <span className="font-bold text-[11px] text-[var(--text-heading)] tracking-tight">
                Razorpay
              </span>
            )}
          </div>
        );

      // 8. AIRTEL — Official red circular badge with white cursive script "a" + "airtel"
      case "airtel":
        return (
          <div className="flex items-center gap-1.5 shrink-0 select-none">
            <span
              className="inline-flex items-center justify-center rounded-full bg-[#EF4444] text-white shrink-0 shadow-2xs"
              style={{ width: size, height: size }}
            >
              <span className="font-black text-[9px] leading-none mb-0.5">a</span>
            </span>
            {showText && (
              <span className="font-bold text-[11px] text-[var(--text-heading)] tracking-tight">
                airtel
              </span>
            )}
          </div>
        );

      // 9. NSDL — Solid navy rounded badge with white "NSDL"
      case "nsdl":
        return (
          <div className="flex items-center gap-1.5 shrink-0 select-none">
            <span
              className="inline-flex items-center justify-center font-bold tracking-wider rounded bg-[#1E3A8A] text-white px-1.5 py-0.5 shadow-2xs"
              style={{ height: Math.max(14, size * 0.95), fontSize: Math.max(8, Math.round(size * 0.52)) }}
            >
              NSDL
            </span>
          </div>
        );

      // 10. MICROSOFT — Official 4-color quad tile + "Microsoft"
      case "microsoft":
        return (
          <div className="flex items-center gap-1.5 shrink-0 select-none">
            <svg viewBox="0 0 20 20" width={size * 0.95} height={size * 0.95} className="shrink-0">
              <rect x="1" y="1" width="8.2" height="8.2" fill="#F25022" />
              <rect x="10.8" y="1" width="8.2" height="8.2" fill="#7FBA00" />
              <rect x="1" y="10.8" width="8.2" height="8.2" fill="#00A4EF" />
              <rect x="10.8" y="10.8" width="8.2" height="8.2" fill="#FFB900" />
            </svg>
            {showText && (
              <span className="font-semibold text-[11px] text-[var(--text-heading)]">
                Microsoft
              </span>
            )}
          </div>
        );

      // 11. TALLY — Dual red & amber quotation brackets + "Tally"
      case "tally":
        return (
          <div className="flex items-center gap-1.5 shrink-0 select-none">
            <svg viewBox="0 0 24 20" width={size} height={size * 0.85} fill="none" className="shrink-0">
              <path d="M4 5C4 3.5 5.5 2 7 2V6H5.5V14H7V18C5.5 18 4 16.5 4 15V5Z" fill="#EF4444" />
              <path d="M19 5C19 3.5 17.5 2 16 2V6H17.5V14H16V18C17.5 18 19 16.5 19 15V5Z" fill="#F59E0B" />
            </svg>
            {showText && (
              <span className="font-bold text-[11px] text-[var(--text-heading)]">
                Tally
              </span>
            )}
          </div>
        );

      // 12. CAMS — Financial growth mark + "CAMS"
      case "cams":
        return (
          <div className="flex items-center gap-1.5 shrink-0 select-none">
            <span
              className="inline-flex items-center justify-center font-bold tracking-wider rounded bg-[#047857] text-white px-1.5 py-0.5 shadow-2xs"
              style={{ height: Math.max(14, size * 0.95), fontSize: Math.max(8, Math.round(size * 0.52)) }}
            >
              CAMS
            </span>
          </div>
        );

      // 13. SETU AA — Setu "S" Bridge mark + "Setu AA"
      case "setu":
        return (
          <div className="flex items-center gap-1.5 shrink-0 select-none">
            <svg viewBox="0 0 24 24" width={size} height={size} fill="none" className="shrink-0 text-[#1D4ED8]">
              <path
                d="M17 5C14.5 5 12.5 6.8 12.5 9.2C12.5 12.2 17.5 12.2 17.5 15.2C17.5 17 15.8 18.2 13.8 18.2C11.5 18.2 9.8 17 9 15.5L7 16.8C8.2 19 10.8 20.8 13.8 20.8C17.2 20.8 20 18.8 20 15.2C20 11.8 15 11.8 15 9.2C15 7.8 16.2 7 17.5 7C19.2 7 20.5 8 21.2 9.2L23 8C21.8 6 19.5 5 17 5Z"
                fill="currentColor"
              />
            </svg>
            {showText && (
              <span className="font-bold text-[11px] text-[var(--text-heading)]">
                Setu AA
              </span>
            )}
          </div>
        );

      // 14. INCOME TAX — Forest green badge with "Income Tax"
      case "incometax":
        return (
          <div className="flex items-center gap-1.5 shrink-0 select-none">
            <span
              className="inline-flex items-center justify-center font-bold tracking-wider rounded bg-[#0F766E] text-white px-1.5 py-0.5 shadow-2xs"
              style={{ height: Math.max(14, size * 0.95), fontSize: Math.max(8, Math.round(size * 0.52)) }}
            >
              ITD
            </span>
            {showText && (
              <span className="font-bold text-[11px] text-[var(--text-heading)]">
                Income Tax
              </span>
            )}
          </div>
        );

      default:
        return (
          <span className="font-semibold text-xs text-[var(--text-heading)]">
            {name ?? provider}
          </span>
        );
    }
  };

  return (
    <div className={`inline-flex items-center whitespace-nowrap ${className}`}>
      {renderIconAndText()}
    </div>
  );
}

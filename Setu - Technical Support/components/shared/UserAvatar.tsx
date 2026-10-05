"use client";

import React from "react";

const PERSONA_COLORS: Record<string, { bg: string; fg: string }> = {
  "DS": { bg: "#5B6FA8", fg: "#FFFFFF" }, // Dhruv Singla (Soft slate-blue)
  "PR": { bg: "#707EAE", fg: "#FFFFFF" }, // Priyanka Rao (Soft periwinkle/slate-purple)
  "AK": { bg: "#6B7F96", fg: "#FFFFFF" }, // Amit Kumar (Soft slate-gray)
  "RP": { bg: "#8E9BB5", fg: "#FFFFFF" }, // Riya Patel (Soft muted lavender-slate)
  "NS": { bg: "#5A948C", fg: "#FFFFFF" }, // Neeraj Sharma (Soft sage-teal)
};

const PALETTE = [
  { bg: "#5B6FA8", fg: "#FFFFFF" },
  { bg: "#707EAE", fg: "#FFFFFF" },
  { bg: "#6B7F96", fg: "#FFFFFF" },
  { bg: "#8E9BB5", fg: "#FFFFFF" },
  { bg: "#5A948C", fg: "#FFFFFF" },
  { bg: "#6366F1", fg: "#FFFFFF" },
  { bg: "#0D9488", fg: "#FFFFFF" },
  { bg: "#475569", fg: "#FFFFFF" },
];

export function getAssigneeColor(initials: string, name?: string): { bg: string; fg: string } {
  const cleanInitials = (initials || "").toUpperCase().trim();
  if (PERSONA_COLORS[cleanInitials]) {
    return PERSONA_COLORS[cleanInitials];
  }

  const str = name || initials || "User";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

type Props = {
  name?: string;
  initials?: string;
  size?: number;
  className?: string;
};

export default function UserAvatar({
  name = "",
  initials = "",
  size = 22,
  className = "",
}: Props) {
  const cleanInitials =
    initials.trim() ||
    name
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    "U";

  const color = getAssigneeColor(cleanInitials, name);
  const fontSize = Math.max(9, Math.round(size * 0.44));

  return (
    <span
      title={name || cleanInitials}
      aria-label={name || cleanInitials}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none shadow-2xs ring-1.5 ring-white/90 dark:ring-gray-900 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color.bg,
        color: color.fg,
        fontSize,
        lineHeight: 1,
      }}
    >
      {cleanInitials}
    </span>
  );
}

"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function buildGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { day: number; inMonth: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true });
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    cells.push({ day: cells.length - (firstDay + daysInMonth) + 1, inMonth: false });
  }
  return cells;
}

export default function CalendarCard() {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const cells = buildGrid(cursor.getFullYear(), cursor.getMonth());
  const isCurrentMonth =
    cursor.getFullYear() === today.getFullYear() &&
    cursor.getMonth() === today.getMonth();

  return (
    <div
      className="flex h-full w-full min-w-0 flex-col rounded-[1.25rem] border border-[var(--divider)] bg-white p-5 screen-xl:max-w-[28rem]"
      style={{ boxShadow: "var(--card-shadow)" }}
    >
      {/* Header */}
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <div>
          <p className="text-[1rem] font-bold leading-tight tracking-tight text-[var(--text-heading)]">
            {MONTH_NAMES[cursor.getMonth()]}
          </p>
          <p className="mt-0.5 text-[0.75rem] font-medium text-[var(--text-muted)]">
            {cursor.getFullYear()}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
              className="tap-pop mr-1 rounded-full bg-[var(--icon-chip-bg)] px-2.5 py-1 text-[0.6875rem] font-semibold text-[var(--icon-chip-fg)] transition-colors hover:brightness-95"
            >
              Today
            </button>
          )}
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
            className="tap-pop flex h-7 w-7 items-center justify-center rounded-[0.625rem] text-[var(--text-muted)] transition-colors hover:bg-[var(--search-bg)] hover:text-[var(--text-heading)]"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
            className="tap-pop flex h-7 w-7 items-center justify-center rounded-[0.625rem] text-[var(--text-muted)] transition-colors hover:bg-[var(--search-bg)] hover:text-[var(--text-heading)]"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Weekday headers + hairline divider */}
      <div className="grid shrink-0 grid-cols-7 text-center">
        {WEEKDAYS.map((w, i) => (
          <span
            key={w}
            className={`pb-1.5 pt-0.5 text-[0.6875rem] font-semibold uppercase tracking-widest ${
              i === 0 || i === 6
                ? "text-[var(--text-muted)]/50"
                : "text-[var(--text-muted)]"
            }`}
          >
            {w}
          </span>
        ))}
      </div>
      <div className="mb-1 h-px shrink-0 bg-[var(--divider)]" />

      {/* Day grid — no extra gap, cells are self-contained */}
      <div className="grid flex-1 grid-cols-7 text-center">
        {cells.map((cell, i) => {
          const col = i % 7;
          const isToday = isCurrentMonth && cell.inMonth && cell.day === today.getDate();
          const isWeekend = col === 0 || col === 6;

          return (
            <div key={i} className="flex items-center justify-center">
              <span
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-full text-[0.9375rem] transition-colors",
                  isToday
                    ? "bg-[var(--icon-btn-navy)] font-bold text-white shadow"
                    : cell.inMonth
                      ? [
                          "cursor-pointer font-medium hover:bg-[var(--search-bg)]",
                          isWeekend
                            ? "text-[var(--text-muted)]"
                            : "text-[var(--text-heading)]",
                        ].join(" ")
                      : "font-normal text-[var(--divider)]",
                ].join(" ")}
              >
                {cell.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

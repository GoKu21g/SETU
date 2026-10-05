"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X, Search } from "lucide-react";

export interface FilterDropdownOption {
  value: string;
  label: string;
  sub?: string;
  icon?: React.ReactNode;
}

interface FilterDropdownProps {
  label?: string; // Optional prefix label, e.g. "Sort by:"
  title?: string; // Menu header title, e.g. "Select Product"
  value: string;
  onChange: (value: string) => void;
  options: FilterDropdownOption[];
  placeholder?: string;
  align?: "left" | "right";
  className?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  showClear?: boolean;
  clearValue?: string;
}

export default function FilterDropdown({
  label,
  title,
  value,
  onChange,
  options,
  placeholder = "Select option",
  align = "left",
  className = "",
  searchable = false,
  searchPlaceholder = "Search...",
  showClear = false,
  clearValue = "all",
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const isFiltered = value !== clearValue && value !== "" && value !== undefined;

  // Handle outside clicks
  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFilterSearch("");
      }
    }

    if (open) {
      document.addEventListener("mousedown", handlePointerDown);
      return () => document.removeEventListener("mousedown", handlePointerDown);
    }
  }, [open]);

  // Focus search input when opened
  useEffect(() => {
    if (open && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [open, searchable]);

  // Handle Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        setOpen(false);
        setFilterSearch("");
      }
    }
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [open]);

  const displayedOptions = searchable && filterSearch.trim()
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(filterSearch.toLowerCase()) ||
          (o.sub && o.sub.toLowerCase().includes(filterSearch.toLowerCase()))
      )
    : options;

  const isFullWidth = className.includes("w-full");

  return (
    <div ref={containerRef} className={`relative inline-block text-xs ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          if (!open) setFilterSearch("");
        }}
        aria-expanded={open}
        aria-label={label || title || placeholder}
        className={`group flex items-center gap-1.5 rounded-xl border py-1.5 sm:py-2 px-2.5 sm:px-3 text-xs font-medium transition-all cursor-pointer select-none shadow-xs active:scale-[0.98] ${
          isFullWidth ? "w-full justify-between" : ""
        } ${
          open
            ? "border-indigo-400 bg-indigo-50/40 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 ring-2 ring-indigo-100 dark:ring-indigo-900"
            : isFiltered
            ? "border-indigo-300 bg-indigo-50/50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300 font-semibold hover:border-indigo-400"
            : "border-[var(--divider)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--search-bg)]"
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {label && <span className="text-[var(--text-muted)] font-normal mr-0.5 shrink-0">{label}</span>}
          <span className={`truncate ${isFullWidth ? "text-left" : "max-w-[140px] sm:max-w-[200px]"}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Clear badge button if active and configured */}
          {showClear && isFiltered && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange(clearValue);
              }}
              className="rounded-full p-0.5 text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:text-indigo-700 transition-colors"
              title="Clear filter"
            >
              <X size={11} />
            </span>
          )}

          <ChevronDown
            size={12}
            className={`transition-transform duration-200 ${
              open ? "rotate-180 text-indigo-600 dark:text-indigo-400" : isFiltered ? "text-indigo-500" : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"
            }`}
          />
        </div>
      </button>

      {/* Popover Menu */}
      {open && (
        <div
          className={`absolute top-[calc(100%+6px)] z-40 ${
            isFullWidth ? "w-full min-w-full" : "min-w-[210px] max-w-[280px]"
          } rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-1.5 shadow-xl shadow-slate-900/10 animate-in fade-in zoom-in-95 duration-100 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {/* Header */}
          {(title || options.length > 5) && (
            <div className="flex items-center justify-between px-2.5 py-1 mb-1 border-b border-[var(--divider)]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {title ?? "Options"}
              </p>
              {isFiltered && (
                <button
                  type="button"
                  onClick={() => {
                    onChange(clearValue);
                    setOpen(false);
                  }}
                  className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          )}

          {/* Search box if searchable */}
          {searchable && options.length > 5 && (
            <div className="p-1 mb-1">
              <div className="relative flex items-center">
                <Search size={12} className="absolute left-2.5 text-[var(--text-muted)] pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-lg border border-[var(--divider)] bg-[var(--search-bg)] py-1 pl-7 pr-2.5 text-xs text-[var(--text-heading)] placeholder:text-[var(--search-placeholder)] outline-none focus:border-indigo-400 focus:bg-[var(--surface)]"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto space-y-0.5 py-0.5">
            {displayedOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-[var(--text-muted)]">
                No matching options
              </div>
            ) : (
              displayedOptions.map((opt) => {
                const isSelected = value === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                      setFilterSearch("");
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold"
                        : "text-[var(--text-secondary)] hover:bg-[var(--search-bg)] font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <div className="min-w-0">
                        <p className="truncate leading-tight">{opt.label}</p>
                        {opt.sub && (
                          <p
                            className={`text-[10px] mt-0.5 font-normal truncate ${
                              isSelected ? "text-blue-500/80" : "text-slate-400"
                            }`}
                          >
                            {opt.sub}
                          </p>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check size={14} className="text-blue-600 shrink-0 ml-1" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

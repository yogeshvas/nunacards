"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { COUNTRIES } from "@/data/constants";
import { flag } from "@/utils/flag";

export function CountryCodeDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string, country: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = COUNTRIES.find((c) => c.code === value) ?? COUNTRIES[19];
  const filtered = query
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.code.includes(query),
      )
    : COUNTRIES;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
    else setQuery("");
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-white transition hover:border-zinc-700 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20"
      >
        <span className="text-base leading-none">{flag(selected.iso)}</span>
        <span className="text-zinc-300">{selected.code}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-11 z-50 w-64 rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/60">
          <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country…"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-zinc-500">No results</li>
            ) : (
              filtered.map((c) => (
                <li key={c.iso + c.code}>
                  <button
                    type="button"
                    onClick={() => { onChange(c.code, c.name); setOpen(false); }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    <span className="text-base leading-none">{flag(c.iso)}</span>
                    <span className="flex-1 text-left">{c.name}</span>
                    <span className="text-zinc-500">{c.code}</span>
                    {c.code === value && selected.name === c.name && (
                      <Check className="h-3.5 w-3.5 text-white" />
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

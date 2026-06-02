"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Users, Target, Download, Search, X,
  ChevronLeft, ChevronRight, Filter, Calendar,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/custom/WhatsAppIcon";

// ── types ─────────────────────────────────────────────────────────────────────

type Employee = {
  id: string; name: string; designation: string | null;
  profileImage: string | null; employeeCode: string;
};

type Lead = {
  id: string; name: string; phoneNumber: string; countryCode: string;
  createdAt: string;
  scannedEmp: Employee;
};

// ── date presets ──────────────────────────────────────────────────────────────

function toDateStr(d: Date) { return d.toISOString().slice(0, 10); }

const now = new Date();
const DATE_PRESETS = [
  { label: "All Time",   start: "",                                    end: "" },
  { label: "Today",      start: toDateStr(now),                        end: toDateStr(now) },
  { label: "This Week",  start: toDateStr(new Date(Date.now() - 6 * 86400000)), end: toDateStr(now) },
  { label: "This Month", start: toDateStr(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))), end: toDateStr(now) },
  { label: "Last 30d",   start: toDateStr(new Date(Date.now() - 29 * 86400000)), end: toDateStr(now) },
];

// ── helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return "just now";
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30)  return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function Avatar({ src, name, size = 9 }: { src: string | null; name: string; size?: number }) {
  const url = src ?? `https://api.dicebear.com/10.x/micah/svg?seed=${encodeURIComponent(name)}`;
  return (
    <img src={url} alt={name}
      className={`h-${size} w-${size} shrink-0 rounded-full object-cover bg-zinc-800`}
    />
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

export default function LeadsPage() {
  const today = toDateStr(new Date());

  // ── filters ──────────────────────────────────────────────────────────────
  const [search,      setSearch]      = useState("");
  const [dSearch,     setDSearch]     = useState("");  // debounced
  const [empFilter,   setEmpFilter]   = useState("");
  const [startDate,   setStartDate]   = useState("");
  const [endDate,     setEndDate]     = useState("");
  const [activePreset, setActivePreset] = useState("All Time");
  const [page,        setPage]        = useState(1);

  // ── data ─────────────────────────────────────────────────────────────────
  const [leads,      setLeads]      = useState<Lead[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats,      setStats]      = useState<{ totalAllTime: number; totalThisMonth: number } | null>(null);
  const [employees,  setEmployees]  = useState<Employee[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [exporting,  setExporting]  = useState(false);

  // ── debounce search ───────────────────────────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDSearch(search); setPage(1); }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchLeads = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page:  String(page),
      limit: String(PAGE_SIZE),
      ...(dSearch    ? { search: dSearch }        : {}),
      ...(empFilter  ? { employeeId: empFilter }  : {}),
      ...(startDate  ? { startDate }              : {}),
      ...(endDate    ? { endDate }                : {}),
    });
    fetch(`/api/leads?${params}`)
      .then(r => r.json())
      .then(d => {
        setLeads(d.leads ?? []);
        setTotal(d.total ?? 0);
        setTotalPages(d.totalPages ?? 1);
        setStats(d.stats ?? null);
        if (d.employees?.length) setEmployees(d.employees);
      })
      .finally(() => setLoading(false));
  }, [page, dSearch, empFilter, startDate, endDate]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // reset page when filters change
  useEffect(() => { setPage(1); }, [dSearch, empFilter, startDate, endDate]);

  // ── export ────────────────────────────────────────────────────────────────
  async function handleExport() {
    setExporting(true);
    try {
      const params = new URLSearchParams({
        export: "true",
        ...(dSearch   ? { search: dSearch }       : {}),
        ...(empFilter ? { employeeId: empFilter } : {}),
        ...(startDate ? { startDate }             : {}),
        ...(endDate   ? { endDate }               : {}),
      });
      const res  = await fetch(`/api/leads?${params}`);
      const data = await res.json();
      const rows: Lead[] = data.leads ?? [];

      const csv = [
        ["Lead Name", "Country Code", "Phone", "Employee", "Designation", "Employee Code", "Date"],
        ...rows.map(l => [
          l.name, l.countryCode, l.phoneNumber,
          l.scannedEmp.name, l.scannedEmp.designation ?? "",
          l.scannedEmp.employeeCode,
          formatDate(l.createdAt),
        ]),
      ].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = "leads.csv"; a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  // ── preset handler ────────────────────────────────────────────────────────
  function applyPreset(p: typeof DATE_PRESETS[0]) {
    setActivePreset(p.label);
    setStartDate(p.start);
    setEndDate(p.end);
  }

  const hasFilters = !!dSearch || !!empFilter || !!startDate || !!endDate;

  function clearFilters() {
    setSearch(""); setDSearch(""); setEmpFilter("");
    setStartDate(""); setEndDate(""); setActivePreset("All Time"); setPage(1);
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Leads</h1>
          <p className="mt-1 text-sm text-zinc-400">All contacts captured across your team's digital cards.</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || total === 0}
          className="flex items-center gap-2 h-9 rounded-xl border border-zinc-700 px-4 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors disabled:opacity-40"
        >
          <Download className="h-4 w-4" />
          {exporting ? "Exporting…" : "Export CSV"}
        </button>
      </div>

      {/* ── stat cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
            <Target className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-4 text-2xl font-bold text-white">{stats?.totalAllTime ?? "—"}</p>
          <p className="mt-0.5 text-xs uppercase tracking-wider text-zinc-500">Total Leads</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10">
            <Calendar className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-4 text-2xl font-bold text-white">{stats?.totalThisMonth ?? "—"}</p>
          <p className="mt-0.5 text-xs uppercase tracking-wider text-zinc-500">This Month</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 col-span-2 sm:col-span-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
            <Users className="h-4 w-4 text-violet-400" />
          </div>
          <p className="mt-4 text-2xl font-bold text-white">{employees.length}</p>
          <p className="mt-0.5 text-xs uppercase tracking-wider text-zinc-500">Active Employees</p>
        </div>
      </div>

      {/* ── filters ── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">

        {/* row 1: search + employee dropdown */}
        <div className="flex flex-col gap-2 sm:flex-row">
          {/* search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name or phone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 rounded-xl border border-zinc-700 bg-zinc-950 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <X className="h-3.5 w-3.5 text-zinc-500 hover:text-zinc-300" />
              </button>
            )}
          </div>

          {/* employee filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
            <select
              value={empFilter}
              onChange={e => setEmpFilter(e.target.value)}
              className="h-9 appearance-none rounded-xl border border-zinc-700 bg-zinc-950 pl-9 pr-8 text-sm text-zinc-300 focus:border-zinc-500 focus:outline-none min-w-[180px]"
            >
              <option value="">All Employees</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* row 2: date range presets + custom pickers */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {DATE_PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className={`h-7 rounded-lg px-2.5 text-xs font-medium transition-colors ${
                  activePreset === p.label
                    ? "bg-zinc-700 text-white"
                    : "border border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <input type="date" value={startDate} max={endDate || today}
              onChange={e => { setActivePreset(""); setStartDate(e.target.value); }}
              className="h-7 rounded-lg border border-zinc-700 bg-zinc-950 px-2 text-xs text-zinc-300 focus:border-zinc-500 focus:outline-none"
            />
            <span className="text-xs text-zinc-600">–</span>
            <input type="date" value={endDate} min={startDate} max={today}
              onChange={e => { setActivePreset(""); setEndDate(e.target.value); }}
              className="h-7 rounded-lg border border-zinc-700 bg-zinc-950 px-2 text-xs text-zinc-300 focus:border-zinc-500 focus:outline-none"
            />
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              <X className="h-3 w-3" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── leads table ── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">

        {/* table header */}
        <div className="hidden sm:grid grid-cols-[1fr_160px_200px_100px_48px] gap-4 px-5 py-3 border-b border-zinc-800 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          <span>Lead</span>
          <span>Phone</span>
          <span>Captured by</span>
          <span>Date</span>
          <span />
        </div>

        {/* loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
          </div>
        )}

        {/* empty */}
        {!loading && leads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800">
              <Target className="h-6 w-6 text-zinc-500" />
            </div>
            <p className="mt-4 text-sm font-medium text-white">No leads found</p>
            <p className="mt-1 text-xs text-zinc-500">
              {hasFilters ? "Try adjusting your filters." : "Leads will appear here when someone saves a contact via a digital card."}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* rows */}
        {!loading && leads.length > 0 && (
          <div className="divide-y divide-zinc-800/60">
            {leads.map(lead => {
              const waPhone = `${lead.countryCode.replace(/^\+/, "")}${lead.phoneNumber}`;
              const initial = lead.name && lead.name !== "Unknown"
                ? lead.name[0].toUpperCase() : "?";

              return (
                <div
                  key={lead.id}
                  className="grid grid-cols-1 gap-3 px-5 py-4 hover:bg-zinc-800/30 transition-colors
                             sm:grid-cols-[1fr_160px_200px_100px_48px] sm:gap-4 sm:items-center"
                >
                  {/* lead avatar + name */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold text-zinc-300">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{lead.name}</p>
                      {/* mobile: show phone inline */}
                      <p className="text-xs text-zinc-500 sm:hidden">{lead.countryCode} {lead.phoneNumber}</p>
                    </div>
                  </div>

                  {/* phone — desktop */}
                  <p className="hidden sm:block text-sm text-zinc-400">
                    {lead.countryCode} {lead.phoneNumber}
                  </p>

                  {/* employee badge */}
                  <Link href={`/employees/${lead.scannedEmp.id}`}
                    className="flex items-center gap-2.5 group min-w-0"
                  >
                    <Avatar src={lead.scannedEmp.profileImage} name={lead.scannedEmp.name} size={7} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors truncate">
                        {lead.scannedEmp.name}
                      </p>
                      <p className="text-[10px] text-zinc-600 truncate">
                        {lead.scannedEmp.designation ?? lead.scannedEmp.employeeCode}
                      </p>
                    </div>
                  </Link>

                  {/* date */}
                  <div className="hidden sm:block">
                    <p className="text-xs text-zinc-400">{formatDate(lead.createdAt)}</p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">{timeAgo(lead.createdAt)}</p>
                  </div>
                  {/* mobile date */}
                  <p className="text-[10px] text-zinc-600 sm:hidden">{timeAgo(lead.createdAt)}</p>

                  {/* WA action */}
                  <div className="flex justify-end">
                    <a
                      href={`https://wa.me/${waPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Chat with ${lead.name} on WhatsApp`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600/10 text-green-500 hover:bg-green-600/20 transition-colors"
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-800 px-5 py-4">
            <p className="text-xs text-zinc-500">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} leads
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {/* page pills */}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = totalPages <= 5 ? i + 1
                  : page <= 3   ? i + 1
                  : page >= totalPages - 2 ? totalPages - 4 + i
                  : page - 2 + i;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                      p === page
                        ? "bg-zinc-700 text-white"
                        : "border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Users, UserCheck, Target, Eye, Fingerprint,
  QrCode, TrendingUp, TrendingDown, Minus,
  UserPlus, Archive,
} from "lucide-react";

// ── types ─────────────────────────────────────────────────────────────────────

type TopEmployee = {
  id: string; name: string; designation: string;
  profileImage: string | null; count: number;
};

type DashboardData = {
  employees: { total: number; active: number; archived: number; new: number };
  leads:     { total: number; byDate: Record<string, number>; prevTotal: number };
  views:     { total: number; unique: number; repeat: number; byDate: Record<string, number>; prevTotal: number };
  scans:     { total: number; byDate: Record<string, number>; prevTotal: number };
  topByScans: TopEmployee[];
  topByLeads: TopEmployee[];
};

// ── helpers ───────────────────────────────────────────────────────────────────

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

function buildRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cur = new Date(start + "T00:00:00Z");
  const last = new Date(end + "T00:00:00Z");
  while (cur <= last) { dates.push(toDateStr(cur)); cur.setUTCDate(cur.getUTCDate() + 1); }
  return dates;
}

function delta(current: number, prev: number) {
  if (prev === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - prev) / prev) * 100);
}

function fmtLabel(d: string) { return d.slice(5).replace("-", "/"); }

// ── preset ranges ─────────────────────────────────────────────────────────────

const now = new Date();

const PRESETS = [
  {
    label: "This Month",
    start: () => toDateStr(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))),
    end:   () => toDateStr(now),
  },
  {
    label: "Last 7 days",
    start: () => toDateStr(new Date(Date.now() - 6 * 86400000)),
    end:   () => toDateStr(now),
  },
  {
    label: "Last 30 days",
    start: () => toDateStr(new Date(Date.now() - 29 * 86400000)),
    end:   () => toDateStr(now),
  },
  {
    label: "Last 3 months",
    start: () => toDateStr(new Date(Date.now() - 89 * 86400000)),
    end:   () => toDateStr(now),
  },
  {
    label: "Last 6 months",
    start: () => toDateStr(new Date(Date.now() - 179 * 86400000)),
    end:   () => toDateStr(now),
  },
  {
    label: "This Year",
    start: () => toDateStr(new Date(Date.UTC(now.getUTCFullYear(), 0, 1))),
    end:   () => toDateStr(now),
  },
];

// ── sub-components ────────────────────────────────────────────────────────────

function Delta({ current, prev }: { current: number; prev: number }) {
  const pct = delta(current, prev);
  if (prev === 0 && current === 0) return null;
  const up = pct >= 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${up ? "text-emerald-400" : "text-red-400"}`}>
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {up ? "+" : ""}{pct}%
    </span>
  );
}

function StatCard({
  label, value, sub, icon, accent, current, prev,
}: {
  label: string; value: number | string; sub?: string;
  icon: React.ReactNode; accent?: string;
  current?: number; prev?: number;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-start justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent ?? "bg-zinc-800"}`}>
          {icon}
        </div>
        {current !== undefined && prev !== undefined && (
          <Delta current={current} prev={prev} />
        )}
      </div>
      <p className="mt-4 text-2xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
      {sub && <p className="mt-1 text-xs text-zinc-600">{sub}</p>}
    </div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <p className="text-sm font-semibold text-white">{title}</p>
      {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  );
}

const CHART_TOOLTIP_STYLE = {
  contentStyle: { background: "#18181b", border: "1px solid #3f3f46", borderRadius: 10, fontSize: 12 },
  labelStyle:   { color: "#a1a1aa", marginBottom: 4 },
  itemStyle:    { color: "#fff" },
  cursor:       { fill: "rgba(255,255,255,0.04)" },
};

const AXIS_TICK = { fill: "#71717a", fontSize: 11 };

function EmptyChart({ message = "No data for this period" }: { message?: string }) {
  return (
    <div className="flex h-48 flex-col items-center justify-center text-center">
      <Minus className="h-8 w-8 text-zinc-700 mb-2" />
      <p className="text-sm text-zinc-500">{message}</p>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const today = toDateStr(new Date());
  const [startDate, setStartDate] = useState(PRESETS[0].start());
  const [endDate, setEndDate]     = useState(PRESETS[0].end());
  const [activePreset, setActivePreset] = useState("This Month");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  function applyPreset(p: typeof PRESETS[0]) {
    setActivePreset(p.label);
    setStartDate(p.start());
    setEndDate(p.end());
  }

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard?startDate=${startDate}&endDate=${endDate}`)
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  // ── build daily chart data ──────────────────────────────────────────────────
  const allDates = buildRange(startDate, endDate);

  // If range > 45 days, aggregate by week to avoid overcrowding
  const aggregate = allDates.length > 45;

  const dailyData = allDates.map(d => ({
    date: fmtLabel(d),
    Views:  data?.views.byDate[d]  ?? 0,
    Scans:  data?.scans.byDate[d]  ?? 0,
    Leads:  data?.leads.byDate[d]  ?? 0,
  }));

  // weekly aggregation when range is long
  const chartData = !aggregate ? dailyData : (() => {
    const weeks: typeof dailyData = [];
    for (let i = 0; i < dailyData.length; i += 7) {
      const chunk = dailyData.slice(i, i + 7);
      weeks.push({
        date: chunk[0].date,
        Views:  chunk.reduce((s, x) => s + x.Views, 0),
        Scans:  chunk.reduce((s, x) => s + x.Scans, 0),
        Leads:  chunk.reduce((s, x) => s + x.Leads, 0),
      });
    }
    return weeks;
  })();

  const hasAnyActivity = chartData.some(d => d.Views > 0 || d.Scans > 0 || d.Leads > 0);

  // pie data
  const pieData = [
    { name: "Unique",  value: data?.views.unique  ?? 0, color: "#0ea5e9" },
    { name: "Repeat",  value: data?.views.repeat  ?? 0, color: "#f59e0b" },
  ].filter(d => d.value > 0);

  // horizontal bar data
  const topScansData = (data?.topByScans ?? []).map(e => ({
    name: e.name.split(" ")[0],
    fullName: e.name,
    Scans: e.count,
  }));

  const topLeadsData = (data?.topByLeads ?? []).map(e => ({
    name: e.name.split(" ")[0],
    fullName: e.name,
    Leads: e.count,
  }));

  const CustomTooltipName = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const full = payload[0]?.payload?.fullName ?? label;
    return (
      <div style={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
        <p style={{ color: "#a1a1aa", marginBottom: 4 }}>{full}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.fill }}>{p.dataKey}: <strong style={{ color: "#fff" }}>{p.value}</strong></p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* ── header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Analytics overview · {startDate} → {endDate}
          </p>
        </div>
        {/* time range controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className={`h-8 rounded-lg px-3 text-xs font-medium transition-colors ${
                  activePreset === p.label
                    ? "bg-indigo-600 text-white"
                    : "border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <input type="date" value={startDate} max={endDate}
              onChange={e => { setActivePreset(""); setStartDate(e.target.value); }}
              className="h-8 rounded-lg border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-300 focus:border-zinc-500 focus:outline-none"
            />
            <span className="text-xs text-zinc-600">–</span>
            <input type="date" value={endDate} min={startDate} max={today}
              onChange={e => { setActivePreset(""); setEndDate(e.target.value); }}
              className="h-8 rounded-lg border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-300 focus:border-zinc-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* ── stat cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Total Employees"  value={data?.employees.total   ?? "—"} icon={<Users       className="h-4 w-4 text-zinc-400"/>} />
        <StatCard label="Active Employees" value={data?.employees.active  ?? "—"} icon={<UserCheck    className="h-4 w-4 text-emerald-400"/>} accent="bg-emerald-500/10" />
        <StatCard label="Archived"         value={data?.employees.archived ?? "—"} icon={<Archive      className="h-4 w-4 text-amber-400"/>} accent="bg-amber-500/10" />
        <StatCard label="New This Period"  value={data?.employees.new     ?? "—"} icon={<UserPlus     className="h-4 w-4 text-indigo-400"/>} accent="bg-indigo-500/10" />

        <StatCard label="Card Views"       value={data?.views.total  ?? "—"}
          icon={<Eye         className="h-4 w-4 text-violet-400"/>} accent="bg-violet-500/10"
          current={data?.views.total} prev={data?.views.prevTotal} />
        <StatCard label="Unique Viewers"   value={data?.views.unique ?? "—"}
          icon={<Fingerprint className="h-4 w-4 text-sky-400"/>} accent="bg-sky-500/10"
          current={data?.views.unique} prev={undefined} />
        <StatCard label="Leads Captured"   value={data?.leads.total  ?? "—"}
          icon={<Target      className="h-4 w-4 text-emerald-400"/>} accent="bg-emerald-500/10"
          current={data?.leads.total} prev={data?.leads.prevTotal} />
        <StatCard label="QR Scans"         value={data?.scans.total  ?? "—"}
          icon={<QrCode      className="h-4 w-4 text-indigo-400"/>} accent="bg-indigo-500/10"
          current={data?.scans.total} prev={data?.scans.prevTotal} />
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
        </div>
      )}

      {!loading && (
        <>
          {/* ── views + scans trend ── */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <SectionHeader title="Views & Scans over time" sub={aggregate ? "Aggregated weekly" : "Daily"} />
            {!hasAnyActivity ? <EmptyChart /> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} barCategoryGap="35%" barGap={3}>
                  <CartesianGrid vertical={false} stroke="#27272a" />
                  <XAxis dataKey="date" tick={AXIS_TICK} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} width={28} />
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#71717a", paddingTop: 10 }} />
                  <Bar dataKey="Views" fill="#7c3aed" radius={[4,4,0,0]} opacity={0.85} />
                  <Bar dataKey="Scans" fill="#4f46e5" radius={[4,4,0,0]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── leads trend + unique/repeat split ── */}
          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            {/* leads area chart */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <SectionHeader title="Leads captured over time" sub={aggregate ? "Aggregated weekly" : "Daily"} />
              {chartData.every(d => d.Leads === 0) ? <EmptyChart /> : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#059669" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#27272a" />
                    <XAxis dataKey="date" tick={AXIS_TICK} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} width={28} />
                    <Tooltip {...CHART_TOOLTIP_STYLE} />
                    <Area type="monotone" dataKey="Leads" stroke="#059669" strokeWidth={2} fill="url(#leadsGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* unique vs repeat donut */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <SectionHeader title="View Breakdown" />
              {pieData.length === 0 ? <EmptyChart /> : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                        dataKey="value" paddingAngle={3} startAngle={90} endAngle={-270}>
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, fontSize: 12 }}
                        itemStyle={{ color: "#fff" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-1">
                    {pieData.map(d => (
                      <div key={d.name} className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
                        <div>
                          <p className="text-xs text-zinc-400">{d.name}</p>
                          <p className="text-sm font-semibold text-white">{d.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── combined views + leads + scans ── */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <SectionHeader title="Views · Leads · Scans — combined" sub="Overlay of all three metrics" />
            {!hasAnyActivity ? <EmptyChart /> : (
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={chartData}>
                  <defs>
                    <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#27272a" />
                  <XAxis dataKey="date" tick={AXIS_TICK} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} width={28} />
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#71717a", paddingTop: 10 }} />
                  <Area type="monotone" dataKey="Views" fill="url(#viewsGrad)" stroke="#7c3aed" strokeWidth={2} dot={false} />
                  <Bar dataKey="Scans" fill="#4f46e5" opacity={0.7} radius={[3,3,0,0]} barSize={8} />
                  <Line type="monotone" dataKey="Leads" stroke="#059669" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── top 5 by scans + top 5 by leads ── */}
          <div className="grid gap-4 lg:grid-cols-2">

            {/* top by scans */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <SectionHeader title="Top 5 — QR Scans" sub="Most card scans in this period" />
              {topScansData.length === 0 ? (
                <EmptyChart message="No scans recorded yet" />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={topScansData} layout="vertical" barCategoryGap="25%">
                      <CartesianGrid horizontal={false} stroke="#27272a" />
                      <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} width={60} />
                      <Tooltip content={<CustomTooltipName />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                      <Bar dataKey="Scans" fill="#4f46e5" radius={[0,4,4,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-3 space-y-2">
                    {(data?.topByScans ?? []).map((e, i) => (
                      <div key={e.id} className="flex items-center gap-3">
                        <span className="w-4 text-xs text-zinc-600 font-mono">{i + 1}</span>
                        <img
                          src={e.profileImage ?? `https://api.dicebear.com/10.x/micah/svg?seed=${encodeURIComponent(e.name)}`}
                          className="h-7 w-7 rounded-full object-cover bg-zinc-800"
                          alt={e.name}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">{e.name}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{e.designation}</p>
                        </div>
                        <span className="text-xs font-semibold text-indigo-400">{e.count} scans</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* top by leads */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <SectionHeader title="Top 5 — Leads Captured" sub="Most leads generated in this period" />
              {topLeadsData.length === 0 ? (
                <EmptyChart message="No leads recorded yet" />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={topLeadsData} layout="vertical" barCategoryGap="25%">
                      <CartesianGrid horizontal={false} stroke="#27272a" />
                      <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} width={60} />
                      <Tooltip content={<CustomTooltipName />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                      <Bar dataKey="Leads" fill="#059669" radius={[0,4,4,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-3 space-y-2">
                    {(data?.topByLeads ?? []).map((e, i) => (
                      <div key={e.id} className="flex items-center gap-3">
                        <span className="w-4 text-xs text-zinc-600 font-mono">{i + 1}</span>
                        <img
                          src={e.profileImage ?? `https://api.dicebear.com/10.x/micah/svg?seed=${encodeURIComponent(e.name)}`}
                          className="h-7 w-7 rounded-full object-cover bg-zinc-800"
                          alt={e.name}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">{e.name}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{e.designation}</p>
                        </div>
                        <span className="text-xs font-semibold text-emerald-400">{e.count} leads</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── summary footer ── */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
              {[
                { label: "Views / Lead",   value: data && data.leads.total > 0 ? (data.views.total / data.leads.total).toFixed(1) : "—" },
                { label: "Scan → Lead %",  value: data && data.scans.total > 0 ? `${Math.round((data.leads.total / data.scans.total) * 100)}%` : "—" },
                { label: "Unique Rate",    value: data && data.views.total > 0  ? `${Math.round((data.views.unique / data.views.total) * 100)}%` : "—" },
                { label: "Avg Leads / Employee", value: data && data.employees.active > 0 ? (data.leads.total / data.employees.active).toFixed(1) : "—" },
              ].map(m => (
                <div key={m.label}>
                  <p className="text-xl font-bold text-white">{m.value}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5 uppercase tracking-wide">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

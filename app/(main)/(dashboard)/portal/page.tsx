"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Eye, Fingerprint, Target, QrCode,
  ChevronLeft, ChevronRight, Download, PhoneCall,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { EmployeeQR } from "@/components/custom/EmployeeQR";
import toast from "react-hot-toast";

// ── types ─────────────────────────────────────────────────────────────────────

type Employee = {
  id: string; name: string; email: string | null;
  designation: string | null; phone: string;
  countryCode: string; employeeCode: string;
  profileImage: string | null; slug: string;
};

type ScanData = {
  totalScans: number; scansByDate: Record<string, number>;
  totalViews: number; uniqueViews: number; repeatViews: number;
  viewsByDate: Record<string, number>;
};

type Lead = {
  id: string; name: string; phoneNumber: string;
  countryCode: string; createdAt: string;
};

// ── helpers ───────────────────────────────────────────────────────────────────

function toDateStr(d: Date) { return d.toISOString().slice(0, 10); }

function buildDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cur = new Date(start + "T00:00:00Z");
  const last = new Date(end + "T00:00:00Z");
  while (cur <= last) { dates.push(toDateStr(cur)); cur.setUTCDate(cur.getUTCDate() + 1); }
  return dates;
}

const LEADS_PER_PAGE = 20;

// ── sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, accent }: {
  label: string; value: number; icon: React.ReactNode; accent: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent} mb-4`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function PortalPage() {
  const { data: session } = useSession();
  const empId = session?.user?.id;

  const [emp, setEmp] = useState<Employee | null>(null);
  const [scanData, setScanData] = useState<ScanData | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsTotal, setLeadsTotal] = useState(0);
  const [leadsTotalPages, setLeadsTotalPages] = useState(1);
  const [leadsPage, setLeadsPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = toDateStr(new Date());
  const start14 = toDateStr(new Date(Date.now() - 13 * 86400000));

  // fetch employee profile
  useEffect(() => {
    if (!empId) return;
    fetch(`/api/employees/${empId}`)
      .then(r => r.json())
      .then(d => setEmp(d.employee ?? null));
  }, [empId]);

  // fetch engagement stats (last 14 days)
  useEffect(() => {
    if (!empId) return;
    setLoading(true);
    fetch(`/api/employees/${empId}/scans?startDate=${start14}&endDate=${today}`)
      .then(r => r.json())
      .then(d => setScanData(d))
      .finally(() => setLoading(false));
  }, [empId]);

  // fetch leads (paginated)
  useEffect(() => {
    if (!empId) return;
    fetch(`/api/employees/${empId}/leads?page=${leadsPage}&limit=${LEADS_PER_PAGE}`)
      .then(r => r.json())
      .then(d => {
        setLeads(d.leads ?? []);
        setLeadsTotal(d.total ?? 0);
        setLeadsTotalPages(d.totalPages ?? 1);
      });
  }, [empId, leadsPage]);

  async function handleExport() {
    if (!empId) return;
    setExporting(true);
    try {
      const res = await fetch(`/api/employees/${empId}/leads?export=true`);
      const data = await res.json();
      const allLeads: Lead[] = data.leads ?? [];
      const rows = [
        ["Name", "Country Code", "Phone", "Date"],
        ...allLeads.map(l => [
          l.name, l.countryCode, l.phoneNumber,
          new Date(l.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        ]),
      ];
      const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "my-leads.csv"; a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  const chartData = buildDateRange(start14, today).map(d => ({
    date: d.slice(5).replace("-", "/"),
    Views: scanData?.viewsByDate[d] ?? 0,
    Scans: scanData?.scansByDate[d] ?? 0,
  }));

  const hasActivity = chartData.some(d => d.Views > 0 || d.Scans > 0);

  if (!emp && !loading) return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <p className="text-zinc-500 text-sm">Card not found. Please contact your admin.</p>
    </div>
  );

  return (
    <div className="space-y-8">

      {/* ── profile header ── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {emp ? (
            <>
              {emp.profileImage
                ? <img src={emp.profileImage} alt={emp.name} className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-zinc-700"/>
                : <img src={`https://api.dicebear.com/10.x/micah/svg?seed=${encodeURIComponent(emp.name)}`} alt={emp.name} className="h-16 w-16 shrink-0 rounded-full bg-zinc-800 ring-2 ring-zinc-700"/>
              }
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-white">{emp.name}</h1>
                <p className="text-sm text-zinc-400 mt-0.5">{emp.designation ?? "—"}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400">{emp.employeeCode}</span>
                  <a
                    href={`/card/${emp.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    View my card ↗
                  </a>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 shrink-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">My QR</p>
                <EmployeeQR employeeCode={emp.employeeCode} size={88} />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4 w-full">
              <div className="h-16 w-16 rounded-full bg-zinc-800 animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-40 rounded bg-zinc-800 animate-pulse" />
                <div className="h-3 w-24 rounded bg-zinc-800 animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── stats grid ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Card Views"    value={scanData?.totalViews  ?? 0} icon={<Eye         className="h-4 w-4 text-violet-400"/>}  accent="bg-violet-500/10" />
        <StatCard label="Unique Viewers" value={scanData?.uniqueViews ?? 0} icon={<Fingerprint className="h-4 w-4 text-sky-400"/>}    accent="bg-sky-500/10" />
        <StatCard label="Leads Captured" value={leadsTotal}                 icon={<Target      className="h-4 w-4 text-emerald-400"/>} accent="bg-emerald-500/10" />
        <StatCard label="QR Scans"       value={scanData?.totalScans  ?? 0} icon={<QrCode      className="h-4 w-4 text-indigo-400"/>}  accent="bg-indigo-500/10" />
      </div>

      {/* ── activity chart (last 14 days) ── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <p className="text-sm font-semibold text-white mb-1">Activity — last 14 days</p>
        <p className="text-xs text-zinc-500 mb-5">Views and QR scans on your card</p>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-white"/>
          </div>
        ) : !hasActivity ? (
          <div className="flex flex-col items-center py-12 text-center">
            <PhoneCall className="h-8 w-8 text-zinc-700 mb-2"/>
            <p className="text-sm text-zinc-500">No activity in the last 14 days.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barCategoryGap="30%" barGap={4}>
              <CartesianGrid vertical={false} stroke="#27272a" />
              <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: "#a1a1aa", marginBottom: 4 }}
                itemStyle={{ color: "#fff" }}
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
              />
              <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#71717a", paddingTop: 12 }} />
              <Bar dataKey="Views" fill="#7c3aed" radius={[4, 4, 0, 0]} opacity={0.85} />
              <Bar dataKey="Scans" fill="#4f46e5" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── leads ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-white">My Leads</p>
            <p className="text-xs text-zinc-500 mt-0.5">People who saved your contact via your card</p>
          </div>
          {leadsTotal > 0 && (
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-1.5 h-8 rounded-lg border border-zinc-700 px-3 text-xs font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5"/>
              {exporting ? "Exporting…" : "Export CSV"}
            </button>
          )}
        </div>

        {leadsTotal === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 mb-3">
              <Target className="h-5 w-5 text-zinc-400"/>
            </div>
            <p className="text-sm font-medium text-white">No leads yet</p>
            <p className="mt-1 text-xs text-zinc-500">Share your QR code to start capturing leads.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
            <div className="divide-y divide-zinc-800">
              {leads.map(lead => {
                const waPhone = `${lead.countryCode.replace(/^\+/, "")}${lead.phoneNumber}`;
                const initial = lead.name && lead.name !== "Unknown" ? lead.name[0].toUpperCase() : "?";
                return (
                  <div key={lead.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold text-zinc-300">
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{lead.name}</p>
                      <p className="text-xs text-zinc-500">{lead.countryCode} {lead.phoneNumber}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer"
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600/10 text-green-500 hover:bg-green-600/20 transition-colors">
                        <span className="text-sm">💬</span>
                      </a>
                      <p className="text-xs text-zinc-500 w-16 text-right">
                        {new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {leadsTotalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-500">Page {leadsPage} of {leadsTotalPages} · {leadsTotal} total</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setLeadsPage(p => Math.max(1, p - 1))} disabled={leadsPage === 1}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors disabled:opacity-30">
                    <ChevronLeft className="h-3.5 w-3.5"/>
                  </button>
                  <button onClick={() => setLeadsPage(p => Math.min(leadsTotalPages, p + 1))} disabled={leadsPage === leadsTotalPages}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors disabled:opacity-30">
                    <ChevronRight className="h-3.5 w-3.5"/>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

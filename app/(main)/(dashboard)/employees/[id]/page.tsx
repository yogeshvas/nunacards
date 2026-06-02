"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Mail, Phone, Tag, QrCode,
  Pencil, Archive, Users, BarChart2,
  UserCheck, Calendar, PhoneCall,
  Send, ChevronDown, Download, ChevronLeft, ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { EmployeeQR } from "@/components/custom/EmployeeQR";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

// ── types ─────────────────────────────────────────────────────────────────────

type Label = { key: string; value: string };
type Employee = {
  id: string; name: string; email: string | null; designation: string | null;
  phone: string; countryCode: string; country: string; employeeCode: string;
  profileImage: string | null; labels: Label[]; slug: string; createdAt: string;
};
type Lead = { id: string; name: string; phoneNumber: string; countryCode: string; createdAt: string };
type ScanData = {
  totalScans: number;
  scansByDate: Record<string, number>;
  totalViews: number;
  uniqueViews: number;
  repeatViews: number;
  viewsByDate: Record<string, number>;
};

type Tab = "info" | "leads" | "engagement";

// ── QR ───────────────────────────────────────────────────────────────────────


// ── phone mockup ──────────────────────────────────────────────────────────────

function PhoneMockup({ emp }: { emp: Employee }) {
  const labels: Label[] = Array.isArray(emp.labels) ? emp.labels : [];
  return (
    <div className="relative mx-auto" style={{ width: 300 }}>
      <div className="absolute rounded-l-full bg-zinc-700" style={{ left:-8, top:75, width:5, height:21 }}/>
      <div className="absolute rounded-l-full bg-zinc-700" style={{ left:-8, top:104, width:5, height:33 }}/>
      <div className="absolute rounded-l-full bg-zinc-700" style={{ left:-8, top:148, width:5, height:33 }}/>
      <div className="absolute rounded-r-full bg-zinc-700" style={{ right:-8, top:129, width:5, height:63 }}/>
      <div className="overflow-hidden" style={{ borderRadius:52, border:"10px solid #27272a", background:"#18181b", boxShadow:"0 0 0 1px #3f3f46, 0 32px 64px -16px rgba(0,0,0,0.8)" }}>
        <div className="relative overflow-hidden bg-zinc-950" style={{ borderRadius:44, minHeight:608 }}>
          <div className="relative flex items-center justify-between px-6 pt-3 pb-1">
            <span className="text-[11px] font-semibold text-white">9:41</span>
            <div className="absolute left-1/2 -translate-x-1/2 bg-black" style={{ top:10, width:112, height:28, borderRadius:22 }}/>
            <div className="flex items-center gap-1">
              <svg width="13" height="10" viewBox="0 0 13 10" fill="white"><rect x="0" y="6" width="2" height="4" rx="0.5" opacity="0.4"/><rect x="3.5" y="4" width="2" height="6" rx="0.5" opacity="0.6"/><rect x="7" y="2" width="2" height="8" rx="0.5" opacity="0.8"/><rect x="10.5" y="0" width="2" height="10" rx="0.5"/></svg>
              <svg width="13" height="10" viewBox="0 0 16 12" fill="none"><circle cx="8" cy="11" r="1.5" fill="white"/><path d="M4 7.5a5.5 5.5 0 018 0" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><path d="M1 4.5a10 10 0 0114 0" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <svg width="22" height="11" viewBox="0 0 22 11" fill="none"><rect x="0.5" y="0.5" width="17" height="10" rx="2.5" stroke="white" strokeOpacity="0.35"/><rect x="2" y="2" width="13" height="7" rx="1.5" fill="white"/><path d="M18.5 3.5v4" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight:564 }}>
            <div className="relative flex flex-col items-center pt-10 pb-8 px-4" style={{ background:"linear-gradient(160deg,#312e81 0%,#1e1b4b 50%,#09090b 100%)" }}>
              {emp.profileImage
                ? <img src={emp.profileImage} alt={emp.name} className="h-20 w-20 rounded-full object-cover ring-4 ring-white/10"/>
                : <img src={`https://api.dicebear.com/10.x/micah/svg?seed=${encodeURIComponent(emp.name)}`} alt={emp.name} className="h-20 w-20 rounded-full bg-zinc-800 ring-4 ring-white/10"/>
              }
              <h2 className="mt-3 text-base font-bold text-white text-center">{emp.name}</h2>
              <p className="mt-0.5 text-xs text-indigo-300 font-medium">{emp.designation ?? ""}</p>
            </div>
            <div className="bg-zinc-950 px-4 pt-4 pb-2">
              <div className="rounded-2xl bg-zinc-900 p-4 space-y-3">
                <Row icon={<Phone className="h-3.5 w-3.5 text-indigo-400"/>} bg="bg-indigo-500/10" label="Phone">{emp.countryCode} {emp.phone}</Row>
                {emp.email && <><div className="h-px bg-zinc-800"/><Row icon={<Mail className="h-3.5 w-3.5 text-violet-400"/>} bg="bg-violet-500/10" label="Email"><span className="truncate block">{emp.email}</span></Row></>}
                {labels.filter(l=>l.key&&l.value).map((l,i)=>(
                  <div key={i}><div className="h-px bg-zinc-800 mb-3"/>
                    <Row icon={<span className="text-[10px] font-bold text-zinc-400">{l.key.slice(0,2).toUpperCase()}</span>} bg="bg-zinc-700/40" label={l.key}>{l.value}</Row>
                  </div>
                ))}
              </div>
              <button className="mt-3 w-full rounded-2xl bg-white py-3 text-xs font-bold text-black">Save Contact</button>
              <div className="mt-4 flex flex-col items-center gap-2 pb-2">
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Scan to connect</p>
                <EmployeeQR employeeCode={emp.employeeCode} size={88}/>
              </div>
            </div>
          </div>
          <div className="flex justify-center py-2"><div className="h-1 w-24 rounded-full bg-white/25"/></div>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, bg, label, children }: { icon: React.ReactNode; bg: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${bg}`}>{icon}</div>
      <div className="min-w-0"><p className="text-[10px] text-zinc-600 uppercase tracking-wide">{label}</p><p className="text-xs font-medium text-white">{children}</p></div>
    </div>
  );
}

// ── tab content ───────────────────────────────────────────────────────────────

function InfoTab({ emp }: { emp: Employee }) {
  const labels: Label[] = Array.isArray(emp.labels) ? emp.labels : [];
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 divide-y divide-zinc-800">
        <div className="px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-4">Contact</p>
          <div className="space-y-4">
            <InfoRow icon={<Phone className="h-4 w-4 text-zinc-500"/>} label="Phone">{emp.countryCode} {emp.phone}</InfoRow>
            {emp.email && <InfoRow icon={<Mail className="h-4 w-4 text-zinc-500"/>} label="Email">{emp.email}</InfoRow>}
          </div>
        </div>
        {labels.filter(l=>l.key&&l.value).length > 0 && (
          <div className="px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-4">Labels</p>
            <div className="space-y-4">
              {labels.filter(l=>l.key&&l.value).map((l,i)=>(
                <InfoRow key={i} icon={<Tag className="h-4 w-4 text-zinc-500"/>} label={l.key}>{l.value}</InfoRow>
              ))}
            </div>
          </div>
        )}
        <div className="px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-4">Card</p>
          <div className="space-y-4">
            <InfoRow icon={<QrCode className="h-4 w-4 text-zinc-500"/>} label="Card URL">/card/{emp.slug}</InfoRow>
            <InfoRow icon={<Calendar className="h-4 w-4 text-zinc-500"/>} label="Added">
              {new Date(emp.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}
            </InfoRow>
          </div>
        </div>
        <div className="px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-4">QR Code</p>
          <div className="flex items-center gap-6">
            <EmployeeQR employeeCode={emp.employeeCode} size={96}/>
            <div className="space-y-1">
              <p className="text-xs font-medium text-white">Scan to open WhatsApp</p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Scans this QR → opens WhatsApp chat with&nbsp;
                <span className="font-medium text-zinc-300">{emp.employeeCode}</span>&nbsp;
                pre-filled.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const LEADS_PER_PAGE = 20;

function LeadsTab({ empId }: { empId: string }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/employees/${empId}/leads?page=${page}&limit=${LEADS_PER_PAGE}`)
      .then(r => r.json())
      .then(d => {
        setLeads(d.leads ?? []);
        setTotal(d.total ?? 0);
        setTotalPages(d.totalPages ?? 1);
      })
      .finally(() => setLoading(false));
  }, [empId, page]);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch(`/api/employees/${empId}/leads?export=true`);
      const data = await res.json();
      const allLeads: Lead[] = data.leads ?? [];

      const rows = [
        ["Name", "Country Code", "Phone", "Date"],
        ...allLeads.map(l => [
          l.name,
          l.countryCode,
          l.phoneNumber,
          new Date(l.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        ]),
      ];
      const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-${empId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  if (loading) return <div className="flex justify-center py-16"><div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-white"/></div>;

  if (total === 0) return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800"><Users className="h-5 w-5 text-zinc-400"/></div>
      <p className="mt-3 text-sm font-medium text-white">No leads yet</p>
      <p className="mt-1 text-xs text-zinc-500">Leads will appear here when someone saves a contact via this card.</p>
    </div>
  );

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-white">Leads captured</p>
          <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-400">{total}</span>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-1.5 h-8 rounded-lg border border-zinc-700 px-3 text-xs font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5"/>
          {exporting ? "Exporting…" : "Export CSV"}
        </button>
      </div>
      <div className="divide-y divide-zinc-800">
        {leads.map(lead => {
          const waPhone = `${lead.countryCode.replace(/^\+/, "")}${lead.phoneNumber}`;
          const initial = lead.name && lead.name !== "Unknown"
            ? lead.name[0].toUpperCase() : "?";
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
                <a
                  href={`https://wa.me/${waPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open in WhatsApp"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600/10 text-green-500 hover:bg-green-600/20 transition-colors"
                >
                  <span className="text-sm">💬</span>
                </a>
                <p className="text-xs text-zinc-500 w-16 text-right">
                  {new Date(lead.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-500">
            Page {page} of {totalPages} · {total} total
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5"/>
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors disabled:opacity-30"
            >
              <ChevronRight className="h-3.5 w-3.5"/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

function buildDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cur = new Date(start + "T00:00:00Z");
  const last = new Date(end + "T00:00:00Z");
  while (cur <= last) {
    dates.push(toDateStr(cur));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return dates;
}

const PRESETS = [
  { label: "7d", days: 7 },
  { label: "14d", days: 14 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

function EngagementTab({ empId }: { empId: string }) {
  const today = toDateStr(new Date());
  const default14 = toDateStr(new Date(Date.now() - 13 * 86400000));

  const [startDate, setStartDate] = useState(default14);
  const [endDate, setEndDate] = useState(today);
  const [data, setData] = useState<ScanData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/employees/${empId}/scans?startDate=${startDate}&endDate=${endDate}`)
      .then(r => r.json()).then(d => setData(d))
      .finally(() => setLoading(false));
  }, [empId, startDate, endDate]);

  function applyPreset(days: number) {
    const end = new Date();
    const start = new Date(Date.now() - (days - 1) * 86400000);
    setStartDate(toDateStr(start));
    setEndDate(toDateStr(end));
  }

  const totalScans  = data?.totalScans ?? 0;
  const totalViews  = data?.totalViews ?? 0;
  const uniqueViews = data?.uniqueViews ?? 0;
  const repeatViews = data?.repeatViews ?? 0;
  const viewsByDate  = data?.viewsByDate ?? {};
  const scansByDate  = data?.scansByDate ?? {};

  const chartData = buildDateRange(startDate, endDate).map(d => ({
    date: d.slice(5).replace("-", "/"),
    Views: viewsByDate[d] ?? 0,
    Scans: scansByDate[d] ?? 0,
  }));

  return (
    <div className="space-y-4">
      {/* stat grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Views" value={totalViews} />
        <StatCard label="Unique Viewers" value={uniqueViews} accent />
        <StatCard label="Repeat Views" value={repeatViews} />
        <StatCard label="QR Scans" value={totalScans} />
      </div>

      {/* card views chart */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-zinc-500"/>
            <p className="text-sm font-semibold text-white">Card views</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p.days)}
                  className="h-7 rounded-lg px-2.5 text-[11px] font-medium border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={startDate}
                max={endDate}
                onChange={e => setStartDate(e.target.value)}
                className="h-7 rounded-lg border border-zinc-700 bg-zinc-900 px-2 text-[11px] text-zinc-300 focus:border-zinc-500 focus:outline-none"
              />
              <span className="text-xs text-zinc-600">–</span>
              <input
                type="date"
                value={endDate}
                min={startDate}
                max={today}
                onChange={e => setEndDate(e.target.value)}
                className="h-7 rounded-lg border border-zinc-700 bg-zinc-900 px-2 text-[11px] text-zinc-300 focus:border-zinc-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-white"/></div>
        ) : chartData.every(d => d.Views === 0 && d.Scans === 0) ? (
          <div className="flex flex-col items-center py-12 text-center">
            <PhoneCall className="h-8 w-8 text-zinc-700 mb-2"/>
            <p className="text-sm text-zinc-500">No activity in this period.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barCategoryGap="30%" barGap={4}>
              <CartesianGrid vertical={false} stroke="#27272a" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#71717a", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#71717a", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: "#a1a1aa", marginBottom: 4 }}
                itemStyle={{ color: "#fff" }}
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
              />
              <Legend
                iconType="square"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, color: "#71717a", paddingTop: 12 }}
              />
              <Bar dataKey="Views" fill="#7c3aed" radius={[4, 4, 0, 0]} opacity={0.85} />
              <Bar dataKey="Scans" fill="#4f46e5" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-xs text-zinc-500 uppercase tracking-widest leading-none">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${accent ? "text-violet-400" : "text-white"}`}>{value}</p>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [emp, setEmp] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendMenuOpen, setSendMenuOpen] = useState(false);
  const [sendingCard, setSendingCard] = useState(false);
  const sendMenuRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<Tab>("info");

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sendMenuRef.current && !sendMenuRef.current.contains(e.target as Node)) {
        setSendMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    fetch(`/api/employees/${id}`)
      .then(r => r.json()).then(d => setEmp(d.employee ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSendQr(channel: "whatsapp" | "email" | "both") {
    setSendMenuOpen(false);
    setSending(true);
    const tid = toast.loading(
      channel === "both" ? "Sending via WhatsApp & Email…"
      : channel === "whatsapp" ? "Sending via WhatsApp…"
      : "Sending via Email…"
    );
    try {
      const res = await fetch(`/api/employees/${id}/send-qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to send", { id: tid }); return; }
      const parts = Object.entries(data.results as Record<string,string>)
        .map(([ch, status]) => `${ch}: ${status}`).join(" · ");
      toast.success(`QR sent — ${parts}`, { id: tid });
    } catch {
      toast.error("Network error", { id: tid });
    } finally {
      setSending(false);
    }
  }

  async function handleSendCard() {
    setSendingCard(true);
    const tid = toast.loading("Sending card to employee…");
    try {
      const res = await fetch(`/api/employees/${id}/send-card`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to send", { id: tid }); return; }
      toast.success("Card sent to employee's WhatsApp!", { id: tid });
    } catch {
      toast.error("Network error", { id: tid });
    } finally {
      setSendingCard(false);
    }
  }

  async function handleArchive() {
    if (!confirm(`Archive ${emp?.name}? They will be hidden from the employee list.`)) return;
    setArchiving(true);
    const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Employee archived"); router.push("/employees"); }
    else { toast.error("Failed to archive"); setArchiving(false); }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-white"/>
    </div>
  );

  if (!emp) return (
    <div className="py-24 text-center">
      <p className="text-zinc-500">Employee not found.</p>
      <Link href="/employees" className="mt-4 inline-block text-sm text-white underline">Back to employees</Link>
    </div>
  );

  const TABS: { id: Tab; label: string }[] = [
    { id: "info", label: "Personal Info" },
    { id: "leads", label: "Leads" },
    { id: "engagement", label: "Engagement" },
  ];

  return (
    <div>
      {/* header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/employees" className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4"/> Employees
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-sm font-medium text-white">{emp.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Send Card button */}
          <button
            onClick={handleSendCard}
            disabled={sendingCard}
            className="flex items-center gap-1.5 h-9 rounded-lg bg-green-600 px-3 text-sm font-medium text-white transition hover:bg-green-500 disabled:opacity-50"
          >
            <span className="text-sm">💬</span>
            {sendingCard ? "Sending…" : "Send Card"}
          </button>

          {/* Send QR dropdown */}
          <div className="relative" ref={sendMenuRef}>
            <button
              onClick={() => setSendMenuOpen(v => !v)}
              disabled={sending}
              className="flex items-center gap-1.5 h-9 rounded-lg bg-indigo-600 px-3 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5"/>
              {sending ? "Sending…" : "Send QR"}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${sendMenuOpen ? "rotate-180" : ""}`}/>
            </button>
            {sendMenuOpen && (
              <div className="absolute right-0 top-10 z-20 w-48 rounded-xl border border-zinc-800 bg-zinc-950 py-1 shadow-2xl shadow-black/60">
                <button onClick={() => handleSendQr("whatsapp")}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
                  <span className="text-base">💬</span> via WhatsApp
                </button>
                <button onClick={() => handleSendQr("email")}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
                  <Mail className="h-4 w-4 text-zinc-500"/> via Email
                </button>
                <div className="my-1 h-px bg-zinc-800"/>
                <button onClick={() => handleSendQr("both")}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-white font-medium hover:bg-zinc-800 transition-colors">
                  <Send className="h-4 w-4 text-indigo-400"/> Both channels
                </button>
              </div>
            )}
          </div>

          <Link href={`/employees/${id}/edit`}
            className="flex items-center gap-1.5 h-9 rounded-lg border border-zinc-700 px-3 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white">
            <Pencil className="h-3.5 w-3.5"/> Edit
          </Link>
          <button onClick={handleArchive} disabled={archiving}
            className="flex items-center gap-1.5 h-9 rounded-lg border border-amber-500/30 px-3 text-sm text-amber-400 transition hover:border-amber-500/60 hover:text-amber-300 disabled:opacity-50">
            <Archive className="h-3.5 w-3.5"/> {archiving ? "Archiving…" : "Archive"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-12 items-start">

        {/* ── left ── */}
        <div>
          {/* identity */}
          <div className="flex items-center gap-5 mb-6">
            {emp.profileImage
              ? <img src={emp.profileImage} alt={emp.name} className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-zinc-700"/>
              : <img src={`https://api.dicebear.com/10.x/micah/svg?seed=${encodeURIComponent(emp.name)}`} alt={emp.name} className="h-16 w-16 shrink-0 rounded-full bg-zinc-800 ring-2 ring-zinc-700"/>
            }
            <div>
              <h2 className="text-xl font-bold text-white">{emp.name}</h2>
              <p className="text-sm text-zinc-400">{emp.designation ?? "—"}</p>
              <span className="mt-1.5 inline-flex items-center rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400">{emp.employeeCode}</span>
            </div>
          </div>

          {/* tabs */}
          <div className="flex gap-1 rounded-xl bg-zinc-950 p-1 mb-6">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${tab === t.id ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === "info"       && <InfoTab emp={emp}/>}
          {tab === "leads"      && <LeadsTab empId={id}/>}
          {tab === "engagement" && <EngagementTab empId={id}/>}
        </div>

        {/* ── right: phone preview ── */}
        <div className="hidden lg:flex flex-col items-center gap-4 sticky top-24">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">Card Preview</p>
          <PhoneMockup emp={emp}/>
        </div>

      </div>
    </div>
  );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-zinc-600">{label}</p>
        <p className="text-sm font-medium text-white break-all">{children}</p>
      </div>
    </div>
  );
}

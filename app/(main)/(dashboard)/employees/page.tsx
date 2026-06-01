"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Users, Mail, Phone, Pencil, Archive, ArchiveRestore } from "lucide-react";
import toast from "react-hot-toast";

type Employee = {
  id: string;
  name: string;
  email: string | null;
  designation: string | null;
  phone: string;
  countryCode: string;
  employeeCode: string;
  profileImage: string | null;
};

type Tab = "active" | "archived";

function avatarUrl(name: string) {
  return `https://api.dicebear.com/10.x/micah/svg?seed=${encodeURIComponent(name)}`;
}

function CardBody({ emp, archived }: { emp: Employee; archived: boolean }) {
  return (
    <>
      <div className="flex items-center gap-3 pr-16">
        {emp.profileImage
          ? <img src={emp.profileImage} alt={emp.name} className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-zinc-700"/>
          : <img src={avatarUrl(emp.name)} alt={emp.name} className="h-12 w-12 shrink-0 rounded-full bg-zinc-800 ring-2 ring-zinc-700"/>
        }
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{emp.name}</p>
          <p className="truncate text-xs text-zinc-400">{emp.designation ?? "—"}</p>
        </div>
      </div>

      <div className="h-px bg-zinc-800" />

      <div className="space-y-1.5">
        {emp.email && (
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{emp.email}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Phone className="h-3.5 w-3.5 shrink-0" />
          <span>{emp.countryCode} {emp.phone}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
          {emp.employeeCode}
        </span>
        {archived && (
          <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-500">
            Archived
          </span>
        )}
      </div>
    </>
  );
}

function EmployeeGrid({
  employees,
  archived,
  onUnarchive,
  onArchive,
}: {
  employees: Employee[];
  archived: boolean;
  onUnarchive?: (id: string) => void;
  onArchive?: (id: string) => void;
}) {
  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/50 py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800">
          <Users className="h-6 w-6 text-zinc-400" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-white">
          {archived ? "No archived employees" : "No employees yet"}
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          {archived ? "Archived employees will appear here." : "Create a digital card for your first team member."}
        </p>
        {!archived && (
          <Link href="/employees/new"
            className="mt-6 flex items-center gap-2 h-9 rounded-lg bg-white px-4 text-sm font-semibold text-black transition hover:bg-zinc-100 active:scale-[0.98]">
            <Plus className="h-4 w-4" /> Add Employee
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {employees.map(emp => (
        <div key={emp.id} className="group relative rounded-2xl border border-zinc-800 bg-zinc-900 transition hover:border-zinc-700 hover:bg-zinc-800/60">

          {/* action buttons — z-10, pointer-events controlled so they never block clicks when hidden */}
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1 pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 transition-opacity">
            {archived ? (
              <button onClick={() => onUnarchive?.(emp.id)}
                className="flex h-7 items-center gap-1.5 rounded-lg bg-zinc-800 px-2.5 text-xs font-medium text-zinc-300 ring-1 ring-zinc-700 hover:bg-amber-500/20 hover:text-amber-400 hover:ring-amber-500/30 transition-colors">
                <ArchiveRestore className="h-3.5 w-3.5" /> Restore
              </button>
            ) : (
              <>
                <Link href={`/employees/${emp.id}/edit`}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 ring-1 ring-zinc-700 hover:bg-zinc-700 hover:text-white transition-colors">
                  <Pencil className="h-3.5 w-3.5" />
                </Link>
                <button onClick={() => onArchive?.(emp.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 ring-1 ring-zinc-700 hover:bg-amber-500/20 hover:text-amber-400 hover:ring-amber-500/30 transition-colors">
                  <Archive className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>

          {/* card body — full-card link for active, plain div for archived */}
          {archived ? (
            <div className="flex flex-col gap-4 p-5 opacity-60">
              <CardBody emp={emp} archived />
            </div>
          ) : (
            <Link href={`/employees/${emp.id}`} className="flex flex-col gap-4 p-5">
              <CardBody emp={emp} archived={false} />
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

export default function EmployeesPage() {
  const [tab, setTab] = useState<Tab>("active");
  const [active, setActive] = useState<Employee[]>([]);
  const [archived, setArchived] = useState<Employee[]>([]);
  const [loadingActive, setLoadingActive] = useState(true);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const [fetchedArchived, setFetchedArchived] = useState(false);

  useEffect(() => {
    fetch("/api/employees")
      .then(r => r.json())
      .then(d => setActive(d.employees ?? []))
      .finally(() => setLoadingActive(false));
  }, []);

  // lazy-load archived only when tab is first opened
  useEffect(() => {
    if (tab !== "archived" || fetchedArchived) return;
    setLoadingArchived(true);
    fetch("/api/employees?archived=true")
      .then(r => r.json())
      .then(d => setArchived(d.employees ?? []))
      .finally(() => { setLoadingArchived(false); setFetchedArchived(true); });
  }, [tab, fetchedArchived]);

  async function handleArchive(id: string) {
    const emp = active.find(e => e.id === id);
    if (!confirm(`Archive ${emp?.name ?? "this employee"}? They will be hidden from the active list.`)) return;
    const tid = toast.loading("Archiving…");
    const res = await fetch(`/api/employees/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: true }),
    });
    if (res.ok) {
      toast.success(`${emp?.name ?? "Employee"} archived`, { id: tid });
      setActive(a => a.filter(e => e.id !== id));
      setFetchedArchived(false); // re-fetch archived list next time tab opens
    } else {
      toast.error("Failed to archive", { id: tid });
    }
  }

  async function handleUnarchive(id: string) {
    const emp = archived.find(e => e.id === id);
    const tid = toast.loading("Restoring…");
    const res = await fetch(`/api/employees/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: false }),
    });
    if (res.ok) {
      toast.success(`${emp?.name ?? "Employee"} restored`, { id: tid });
      setArchived(a => a.filter(e => e.id !== id));
      fetch("/api/employees").then(r => r.json()).then(d => setActive(d.employees ?? []));
    } else {
      toast.error("Failed to restore", { id: tid });
    }
  }

  const loading = tab === "active" ? loadingActive : loadingArchived;
  const employees = tab === "active" ? active : archived;

  return (
    <div>
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Employees</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {loadingActive ? "Loading…" : `${active.length} active member${active.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link href="/employees/new"
          className="flex items-center gap-2 h-9 rounded-lg bg-white px-4 text-sm font-semibold text-black transition hover:bg-zinc-100 active:scale-[0.98]">
          <Plus className="h-4 w-4" /> Add Employee
        </Link>
      </div>

      {/* tabs */}
      <div className="flex gap-1 rounded-xl bg-zinc-950 p-1 mb-6 w-fit">
        {(["active", "archived"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${tab === t ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
            {t}
            {t === "active" && !loadingActive && (
              <span className="ml-2 rounded-full bg-zinc-700 px-1.5 py-0.5 text-[11px] text-zinc-300">{active.length}</span>
            )}
            {t === "archived" && fetchedArchived && (
              <span className="ml-2 rounded-full bg-zinc-700 px-1.5 py-0.5 text-[11px] text-zinc-300">{archived.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* loading skeleton */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-zinc-800/50 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && (
        <EmployeeGrid
          employees={employees}
          archived={tab === "archived"}
          onArchive={handleArchive}
          onUnarchive={handleUnarchive}
        />
      )}
    </div>
  );
}

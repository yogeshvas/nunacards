"use client";

import Link from "next/link";
import { Users, Plus } from "lucide-react";

export default function EmployeesPage() {
  return (
    <div>
      {/* page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Employees</h1>
          <p className="mt-1 text-sm text-zinc-400">Manage your team&apos;s digital business cards.</p>
        </div>
        <Link
          href="/employees/new"
          className="flex items-center gap-2 h-9 rounded-lg bg-white px-4 text-sm font-semibold text-black transition hover:bg-zinc-100 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add Employee
        </Link>
      </div>

      {/* empty state */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/50 py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800">
          <Users className="h-6 w-6 text-zinc-400" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-white">No employees yet</h3>
        <p className="mt-1 text-sm text-zinc-500">Create a digital card for your first team member.</p>
        <Link
          href="/employees/new"
          className="mt-6 flex items-center gap-2 h-9 rounded-lg bg-white px-4 text-sm font-semibold text-black transition hover:bg-zinc-100 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add Employee
        </Link>
      </div>
    </div>
  );
}

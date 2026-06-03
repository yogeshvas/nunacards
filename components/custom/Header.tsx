"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
    LayoutDashboard,
    Users,
    Contact,
    Settings,
    LogOut,
    User,
    Bell,
    ChevronDown,
    Zap,
} from "lucide-react";
import { usePlan } from "@/components/providers/PlanProvider";

const ADMIN_NAV = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Employees", href: "/employees", icon: Users },
    { label: "Leads", href: "/leads", icon: Contact },
    { label: "Settings", href: "/settings", icon: Settings },
];

const EMPLOYEE_NAV = [
    { label: "My Card", href: "/portal", icon: LayoutDashboard },
];

function avatarUrl(name?: string | null) {
    const seed = encodeURIComponent(name ?? "default");
    return `https://api.dicebear.com/10.x/micah/svg?seed=${seed}`;
}

export default function Header() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isEmployee = session?.user?.role === "EMPLOYEE";
    const NAV = isEmployee ? EMPLOYEE_NAV : ADMIN_NAV;
    const { isPro, planExpiresAt } = usePlan();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
            <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 md:px-6">

                {/* logo */}
                <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5 mr-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white">
                        <span className="text-[11px] font-black text-black">N</span>
                    </div>
                    <span className="hidden text-sm font-semibold tracking-wide text-white sm:block">
                        NunaCards
                    </span>
                </Link>

                {/* nav links */}
                <nav className="flex flex-1 items-center gap-1">
                    {NAV.map(({ label, href, icon: Icon }) => {
                        const active = pathname === href || pathname.startsWith(href + "/");
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${active
                                    ? "bg-zinc-800 text-white"
                                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                                    }`}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                <span className="hidden md:block">{label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* right actions */}
                <div className="flex shrink-0 items-center gap-2">

                    {/* plan badge — admin only */}
                    {!isEmployee && (
                        isPro ? (
                            <div className="hidden md:flex items-center gap-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1">
                                <Zap className="h-3 w-3 text-indigo-400" />
                                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wide">PRO</span>
                            </div>
                        ) : (
                            <Link
                                href="/settings"
                                className="hidden md:flex items-center gap-1.5 rounded-lg bg-zinc-800 border border-zinc-700 px-2.5 py-1 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-colors group"
                            >
                                <Zap className="h-3 w-3 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                                <span className="text-[11px] font-semibold text-zinc-500 group-hover:text-indigo-300 transition-colors uppercase tracking-wide">Upgrade</span>
                            </Link>
                        )
                    )}

                    {/* notifications */}
                    <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-800 hover:text-white">
                        <Bell className="h-4 w-4" />
                        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    </button>

                    {/* profile dropdown */}
                    <div ref={dropdownRef} className="relative">
                        <button
                            onClick={() => setDropdownOpen((v) => !v)}
                            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-zinc-800"
                        >
                            <img
                                src={avatarUrl(session?.user?.name)}
                                alt={session?.user?.name ?? "avatar"}
                                className="h-7 w-7 rounded-full bg-zinc-800 object-cover"
                            />
                            <div className="hidden text-left md:block">
                                <p className="text-xs font-medium leading-none text-white">
                                    {session?.user?.name ?? "User"}
                                </p>
                                <p className="mt-0.5 text-[11px] leading-none text-zinc-500">
                                    {session?.user?.email ?? ""}
                                </p>
                            </div>
                            <ChevronDown
                                className={`hidden h-3.5 w-3.5 text-zinc-500 transition-transform md:block ${dropdownOpen ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 top-10 w-52 rounded-xl border border-zinc-800 bg-zinc-950 py-1 shadow-2xl shadow-black/60">
                                <div className="flex items-center gap-3 border-b border-zinc-800 px-3 py-3">
                                    <img
                                        src={avatarUrl(session?.user?.name)}
                                        alt={session?.user?.name ?? "avatar"}
                                        className="h-9 w-9 rounded-full bg-zinc-800 object-cover shrink-0"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-white">
                                            {session?.user?.name ?? "User"}
                                        </p>
                                        <p className="mt-0.5 text-[11px] text-zinc-500 truncate">
                                            {session?.user?.email ?? ""}
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href="/settings"
                                    onClick={() => setDropdownOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                                >
                                    <User className="h-3.5 w-3.5" />
                                    Profile &amp; Settings
                                </Link>

                                <button
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 transition-colors"
                                >
                                    <LogOut className="h-3.5 w-3.5" />
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </header>
    );
}

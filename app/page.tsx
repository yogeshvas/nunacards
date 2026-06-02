"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  QrCode, Users, BarChart2, MessageCircle, ChevronRight,
  Check, Zap, Shield, Star, ArrowRight, Phone, Mail,
  ExternalLink, PhoneCall, ChevronLeft,
} from "lucide-react";

// ── demo data ─────────────────────────────────────────────────────────────────

const DEMO_EMP = {
  name: "Arjun Sharma",
  designation: "Senior Business Development Manager",
  phone: "9876543210",
  countryCode: "+91",
  email: "arjun@globalventures.in",
  profileImage: null,
};

// ── parallax hook ─────────────────────────────────────────────────────────────

function useParallax() {
  const scrollY = useRef(0);
  useEffect(() => {
    const onScroll = () => { scrollY.current = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrollY;
}

// ── intersection observer hook ─────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ── nav ───────────────────────────────────────────────────────────────────────

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/5" : ""}`}>
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
            <span className="text-xs font-black text-black">N</span>
          </div>
          <span className="text-sm font-bold tracking-wide text-white">NunaCards</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link href="/signup" className="text-sm font-semibold bg-white text-black px-4 py-2 rounded-xl hover:bg-zinc-100 transition-colors">
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ── hero phone mockup (card view) ─────────────────────────────────────────────

function HeroPhoneMockup() {
  const name = DEMO_EMP.name;
  const avatarSrc = `https://api.dicebear.com/10.x/micah/svg?seed=${encodeURIComponent(name)}`;
  return (
    <div className="relative mx-auto select-none" style={{ width: 270 }}>
      {/* floating badges */}
      <div className="absolute -left-16 top-20 z-10 animate-pulse">
        <div className="rounded-2xl bg-zinc-900 border border-zinc-700/50 px-3 py-2 shadow-xl shadow-black/60">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-green-400" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-white">Card Opened</p>
              <p className="text-[9px] text-zinc-500">via WhatsApp</p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -right-14 bottom-32 z-10">
        <div className="rounded-2xl bg-zinc-900 border border-zinc-700/50 px-3 py-2 shadow-xl shadow-black/60">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <BarChart2 className="h-3 w-3 text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-white">128 views</p>
              <p className="text-[9px] text-zinc-500">this week</p>
            </div>
          </div>
        </div>
      </div>

      {/* hardware buttons */}
      <div className="absolute rounded-l-full bg-zinc-700" style={{ left: -6, top: 68, width: 4, height: 18 }} />
      <div className="absolute rounded-l-full bg-zinc-700" style={{ left: -6, top: 94, width: 4, height: 30 }} />
      <div className="absolute rounded-l-full bg-zinc-700" style={{ left: -6, top: 133, width: 4, height: 30 }} />
      <div className="absolute rounded-r-full bg-zinc-700" style={{ right: -6, top: 116, width: 4, height: 56 }} />

      <div className="overflow-hidden" style={{ borderRadius: 46, border: "9px solid #27272a", background: "#18181b", boxShadow: "0 0 0 1px #3f3f46, 0 40px 80px -20px rgba(0,0,0,0.9), 0 0 60px -10px rgba(99,102,241,0.15)" }}>
        <div className="relative overflow-hidden bg-zinc-950" style={{ borderRadius: 38, minHeight: 548 }}>
          {/* status bar */}
          <div className="relative flex items-center justify-between px-5 pt-2.5 pb-1">
            <span className="text-[10px] font-semibold text-white">9:41</span>
            <div className="absolute left-1/2 -translate-x-1/2 bg-black" style={{ top: 9, width: 100, height: 24, borderRadius: 20 }} />
            <div className="flex items-center gap-1">
              <svg width="12" height="9" viewBox="0 0 13 10" fill="white"><rect x="0" y="6" width="2" height="4" rx="0.5" opacity="0.4"/><rect x="3.5" y="4" width="2" height="6" rx="0.5" opacity="0.6"/><rect x="7" y="2" width="2" height="8" rx="0.5" opacity="0.8"/><rect x="10.5" y="0" width="2" height="10" rx="0.5"/></svg>
              <svg width="20" height="10" viewBox="0 0 22 11" fill="none"><rect x="0.5" y="0.5" width="17" height="10" rx="2.5" stroke="white" strokeOpacity="0.35"/><rect x="2" y="2" width="13" height="7" rx="1.5" fill="white"/><path d="M18.5 3.5v4" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 508 }}>
            {/* header gradient */}
            <div className="relative flex flex-col items-center pt-8 pb-7 px-4" style={{ background: "linear-gradient(160deg,#312e81 0%,#1e1b4b 50%,#09090b 100%)" }}>
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.2), transparent)" }} />
              <img src={avatarSrc} alt={name} className="h-16 w-16 rounded-full bg-zinc-800 ring-4 ring-white/10 relative z-10" />
              <h2 className="mt-2.5 text-[13px] font-bold text-white text-center relative z-10">{name}</h2>
              <p className="mt-0.5 text-[10px] text-indigo-300 font-medium text-center relative z-10">{DEMO_EMP.designation}</p>
            </div>
            {/* contact section */}
            <div className="bg-zinc-950 px-3 pt-3 pb-2">
              <div className="rounded-2xl bg-zinc-900 p-3 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
                    <Phone className="h-3 w-3 text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-zinc-600 uppercase tracking-wide">Phone</p>
                    <p className="text-[11px] font-medium text-white">{DEMO_EMP.countryCode} {DEMO_EMP.phone}</p>
                  </div>
                </div>
                <div className="h-px bg-zinc-800" />
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                    <Mail className="h-3 w-3 text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-zinc-600 uppercase tracking-wide">Email</p>
                    <p className="text-[11px] font-medium text-white truncate">{DEMO_EMP.email}</p>
                  </div>
                </div>
              </div>
              <button className="mt-2.5 w-full rounded-2xl bg-white py-2.5 text-[11px] font-bold text-black">Save Contact</button>
              <div className="mt-3 flex flex-col items-center gap-1.5 pb-1">
                <p className="text-[8px] text-zinc-600 uppercase tracking-widest">Scan to connect</p>
                <div className="h-16 w-16 rounded-xl bg-zinc-800 flex items-center justify-center">
                  <QrCode className="h-8 w-8 text-zinc-600" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center py-1.5"><div className="h-1 w-20 rounded-full bg-white/20" /></div>
        </div>
      </div>
    </div>
  );
}

// ── whatsapp phone mockup ─────────────────────────────────────────────────────

function WhatsAppPhoneMockup() {
  const name = DEMO_EMP.name;
  const firstName = name.split(" ")[0];
  const avatarSrc = `https://api.dicebear.com/10.x/micah/svg?seed=${encodeURIComponent(name)}`;

  return (
    <div className="relative mx-auto select-none" style={{ width: 280 }}>
      {/* hardware buttons */}
      <div className="absolute rounded-l-full bg-zinc-700" style={{ left: -6, top: 68, width: 4, height: 18 }} />
      <div className="absolute rounded-l-full bg-zinc-700" style={{ left: -6, top: 94, width: 4, height: 30 }} />
      <div className="absolute rounded-l-full bg-zinc-700" style={{ left: -6, top: 133, width: 4, height: 30 }} />
      <div className="absolute rounded-r-full bg-zinc-700" style={{ right: -6, top: 116, width: 4, height: 56 }} />

      <div style={{ borderRadius: 46, border: "9px solid #27272a", background: "#18181b", boxShadow: "0 0 0 1px #3f3f46, 0 40px 80px -20px rgba(0,0,0,0.9), 0 0 60px -10px rgba(0,168,132,0.12)" }}>
        <div style={{ borderRadius: 38, overflow: "hidden" }}>
          {/* WA header */}
          <div style={{ background: "#075E54" }}>
            <div className="relative flex items-center justify-between px-4 pt-2.5 pb-1">
              <span className="text-[10px] font-semibold text-white">9:41</span>
              <div className="absolute left-1/2 -translate-x-1/2 bg-black" style={{ top: 8, width: 100, height: 24, borderRadius: 20 }} />
              <div className="flex items-center gap-1">
                <svg width="12" height="9" viewBox="0 0 13 10" fill="white"><rect x="0" y="6" width="2" height="4" rx="0.5" opacity="0.4"/><rect x="3.5" y="4" width="2" height="6" rx="0.5" opacity="0.6"/><rect x="7" y="2" width="2" height="8" rx="0.5" opacity="0.8"/><rect x="10.5" y="0" width="2" height="10" rx="0.5"/></svg>
                <svg width="20" height="10" viewBox="0 0 22 11" fill="none"><rect x="0.5" y="0.5" width="17" height="10" rx="2.5" stroke="white" strokeOpacity="0.35"/><rect x="2" y="2" width="13" height="7" rx="1.5" fill="white"/><path d="M18.5 3.5v4" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 pb-2.5 pt-1">
              <ChevronLeft className="h-4 w-4 shrink-0 text-white/80" />
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-700">
                <span className="text-[10px] font-bold text-white">C</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold leading-tight text-white">ConnectCard</p>
                <p className="text-[9px] leading-tight text-green-200/70">online</p>
              </div>
              <PhoneCall className="h-3.5 w-3.5 text-white/70" />
            </div>
          </div>

          {/* chat area */}
          <div className="overflow-y-auto" style={{ height: 390, background: "#e5ddd5", backgroundImage: "radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
            <div className="flex justify-center py-2.5">
              <span className="rounded-full px-2.5 py-0.5 text-[9px] text-zinc-600" style={{ background: "rgba(225,218,210,0.95)" }}>TODAY</span>
            </div>
            {/* message bubble */}
            <div className="mx-2 mb-2.5 overflow-hidden rounded-lg shadow-sm" style={{ background: "#fff", maxWidth: "92%" }}>
              {/* mini card preview */}
              <div style={{ display: "flex", height: 128, background: "#09090b", borderRadius: "6px 6px 0 0", overflow: "hidden" }}>
                <div style={{ width: 72, flexShrink: 0, background: "linear-gradient(160deg,#4f46e5 0%,#7c3aed 60%,#312e81 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "12px 8px", position: "relative" }}>
                  <div style={{ position: "absolute", top: -25, left: -25, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    <img src={avatarSrc} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} alt="" />
                  </div>
                  <div style={{ textAlign: "center", position: "relative" }}>
                    <div style={{ fontSize: 5.5, color: "rgba(255,255,255,0.5)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 2 }}>Digital Card</div>
                    <div style={{ fontSize: 7, color: "white", fontWeight: 700 }}>NunaCards</div>
                  </div>
                </div>
                <div style={{ flex: 1, padding: "12px", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "white", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
                    <div style={{ fontSize: 7.5, color: "#a78bfa", marginTop: 3 }}>{DEMO_EMP.designation}</div>
                    <div style={{ width: 16, height: 2, background: "#4f46e5", margin: "6px 0", borderRadius: 2 }} />
                    <div style={{ fontSize: 7.5, color: "#d4d4d8", marginBottom: 2 }}>📱 {DEMO_EMP.countryCode} {DEMO_EMP.phone}</div>
                    <div style={{ fontSize: 7.5, color: "#d4d4d8" }}>✉️ {DEMO_EMP.email}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <div style={{ width: 3.5, height: 3.5, borderRadius: "50%", background: "#4f46e5" }} />
                    <div style={{ fontSize: 5.5, color: "#52525b", textTransform: "uppercase", letterSpacing: 1 }}>NunaCards · Connect</div>
                  </div>
                </div>
              </div>
              {/* message text */}
              <div className="px-2.5 pt-2.5 pb-1" style={{ color: "#111b21", fontSize: 10, lineHeight: 1.6 }}>
                <p>Hi <strong>{firstName}</strong>,</p>
                <p className="mt-1.5">It was great connecting with you today! 🤝</p>
                <p className="mt-1.5">Here is my <strong>Digital Visiting Card</strong>. Tap below to view and save my contact.</p>
                <p className="mt-1.5">Best regards, <strong>{name}</strong></p>
              </div>
              <p className="px-2.5 pb-2 text-[8.5px]" style={{ color: "#8696a0" }}>Powered By NunaCards</p>
              <div style={{ borderTop: "1px solid #e9edef" }} />
              <div className="flex items-center justify-center gap-1.5 py-2" style={{ color: "#00a884" }}>
                <ExternalLink className="h-3 w-3" />
                <span className="text-[11px] font-medium">View Card</span>
              </div>
            </div>
          </div>

          {/* input bar */}
          <div className="flex items-center gap-1.5 px-2.5 py-2" style={{ background: "#f0f2f5" }}>
            <div className="flex flex-1 items-center gap-1.5 rounded-full px-2.5 py-1" style={{ background: "#fff" }}>
              <span className="text-[11px]">😊</span>
              <span className="flex-1 text-[10px] text-zinc-400">Message</span>
              <span className="text-[11px]">📎</span>
            </div>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: "#00a884" }}>
              <span className="text-[11px]">🎤</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── login mockup ──────────────────────────────────────────────────────────────

function LoginMockup() {
  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-black/80 ring-1 ring-white/10 select-none">
      <div className="grid grid-cols-[1fr_1.1fr]">
        {/* left */}
        <div className="relative flex flex-col justify-between p-7 bg-zinc-950 overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="relative flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white">
              <span className="text-[11px] font-black text-black">N</span>
            </div>
            <span className="text-xs font-semibold tracking-wide text-white">NunaCards</span>
          </div>
          <div className="relative space-y-4">
            <h2 className="text-2xl font-bold leading-tight tracking-tight text-white">
              Welcome back to<br /><span className="text-zinc-400">your workspace.</span>
            </h2>
            <ul className="space-y-2.5">
              {["Instant QR-powered card sharing", "Lead capture via WhatsApp", "Real-time scan analytics"].map(f => (
                <li key={f} className="flex items-start gap-2.5 text-xs text-zinc-400">
                  <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <Check className="h-2 w-2 text-white" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <p className="relative text-[10px] text-zinc-600">Secure login for your organization.</p>
        </div>
        {/* right */}
        <div className="flex flex-col justify-center bg-zinc-900 px-6 py-7">
          <div className="mb-5 flex rounded-xl bg-zinc-950 p-1">
            <div className="flex-1 rounded-lg py-1.5 text-[11px] font-medium bg-white text-black text-center">Owner</div>
            <div className="flex-1 rounded-lg py-1.5 text-[11px] font-medium text-zinc-400 text-center">Employee</div>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Sign in</h3>
          <p className="text-xs text-zinc-400 mb-4">Access your NunaCards dashboard.</p>
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-medium text-zinc-400 mb-1">Email address</label>
              <div className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 flex items-center">
                <span className="text-xs text-zinc-600">you@company.com</span>
              </div>
            </div>
            <div className="h-9 w-full rounded-xl bg-white flex items-center justify-center">
              <span className="text-xs font-semibold text-black">Send verification code →</span>
            </div>
            <p className="text-center text-[10px] text-zinc-500">
              <span className="font-medium text-white">Use password to login</span>
            </p>
          </div>
          <p className="mt-4 text-center text-[10px] text-zinc-500">
            Don't have an account?{" "}
            <span className="font-medium text-white">Create one</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── dashboard mockup ──────────────────────────────────────────────────────────

function DashboardMockup() {
  const employees = [
    { name: "Arjun Sharma", role: "Sr. Business Dev.", scans: 128, leads: 34, avatar: "Arjun Sharma" },
    { name: "Priya Mehta", role: "Product Designer", scans: 96, leads: 21, avatar: "Priya Mehta" },
    { name: "Rahul Gupta", role: "Software Engineer", scans: 64, leads: 12, avatar: "Rahul Gupta" },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-black/80 ring-1 ring-white/10 bg-zinc-950 select-none">
      {/* top bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/60">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        </div>
        <div className="flex-1 h-5 rounded-md bg-zinc-900 mx-4" />
      </div>
      <div className="flex" style={{ minHeight: 300 }}>
        {/* sidebar */}
        <div className="w-44 shrink-0 border-r border-zinc-800/60 p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white">
              <span className="text-[9px] font-black text-black">N</span>
            </div>
            <span className="text-[11px] font-bold text-white">NunaCards</span>
          </div>
          {[
            { label: "Dashboard", active: false },
            { label: "Employees", active: true },
            { label: "Leads", active: false },
            { label: "Settings", active: false },
          ].map(item => (
            <div key={item.label} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${item.active ? "bg-zinc-800 text-white" : "text-zinc-500"}`}>
              {item.label}
            </div>
          ))}
        </div>
        {/* main content */}
        <div className="flex-1 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Employees</h3>
              <p className="text-[10px] text-zinc-500">3 active members</p>
            </div>
            <div className="h-7 rounded-lg bg-white px-3 flex items-center justify-center">
              <span className="text-[10px] font-semibold text-black">+ Add Employee</span>
            </div>
          </div>
          <div className="space-y-2">
            {employees.map(emp => (
              <div key={emp.name} className="flex items-center gap-3 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2.5">
                <img src={`https://api.dicebear.com/10.x/micah/svg?seed=${encodeURIComponent(emp.avatar)}`} alt={emp.name} className="h-8 w-8 rounded-full bg-zinc-800 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-white">{emp.name}</p>
                  <p className="text-[9px] text-zinc-500">{emp.role}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[11px] font-semibold text-white">{emp.scans} <span className="text-zinc-600 font-normal text-[9px]">scans</span></p>
                  <p className="text-[9px] text-violet-400">{emp.leads} leads</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── animated blob ─────────────────────────────────────────────────────────────

function ParallaxBlob({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const speed = parseFloat(el.dataset.speed ?? "0.15");
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (el) el.style.transform = `translateY(${window.scrollY * speed}px)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} data-speed="0.12" className={`absolute pointer-events-none rounded-full blur-3xl ${className}`} style={style} />;
}

// ── section wrapper with fade-in ──────────────────────────────────────────────

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}>
      {children}
    </div>
  );
}

// ── stats ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: "10k+", label: "Cards shared" },
  { value: "98%", label: "WhatsApp delivery" },
  { value: "3x", label: "More leads captured" },
  { value: "<1s", label: "Card load time" },
];

// ── features ──────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: QrCode,
    title: "Instant QR Sharing",
    desc: "Each employee gets a unique QR code. Scan → WhatsApp opens with their card ready to send.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Delivery",
    desc: "Send beautiful digital cards directly to employees via WhatsApp. No app download needed.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: Users,
    title: "Team Management",
    desc: "Add, edit, and manage all employee cards from one centralized dashboard.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: BarChart2,
    title: "Real-time Analytics",
    desc: "Track card views, QR scans, and leads captured per employee in real time.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: Zap,
    title: "Instant Lead Capture",
    desc: "Contacts saved via your card automatically appear in your leads dashboard.",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
  },
  {
    icon: Shield,
    title: "Enterprise Ready",
    desc: "OTP and password auth, role-based access, and secure cloud infrastructure.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
  },
];

// ── how it works ──────────────────────────────────────────────────────────────

const STEPS = [
  { n: "01", title: "Add your employees", desc: "Create digital cards for each team member with their contact details, designation, and photo." },
  { n: "02", title: "Send via WhatsApp", desc: "Hit 'Send Card' — a beautiful WhatsApp message is delivered to the employee instantly." },
  { n: "03", title: "Share & track", desc: "Employees share their QR at events. You see every scan, view, and lead captured in real time." },
];

// ── page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Nav />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* background blobs */}
        <ParallaxBlob className="h-[600px] w-[600px] bg-indigo-600/10" style={{ top: -100, left: -200 }} />
        <ParallaxBlob className="h-[400px] w-[400px] bg-violet-600/10" style={{ top: 200, right: -100 }} />
        <ParallaxBlob className="h-[300px] w-[300px] bg-fuchsia-600/8" style={{ bottom: 50, left: "40%" }} />

        {/* grid overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="relative mx-auto max-w-6xl px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* left */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-xs font-medium text-indigo-300">Digital Business Cards for Teams</span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-black leading-[1.05] tracking-tight">
                Your team's card,<br />
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  delivered via
                </span>
                <br />WhatsApp.
              </h1>
              <p className="text-lg text-zinc-400 leading-relaxed max-w-md">
                NunaCards turns every employee into a networker. Create digital visiting cards, share via QR or WhatsApp, and capture leads — all from one dashboard.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/signup" className="inline-flex items-center gap-2 h-12 rounded-2xl bg-white px-6 text-sm font-bold text-black hover:bg-zinc-100 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Start for free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/login" className="inline-flex items-center gap-2 h-12 rounded-2xl border border-zinc-700 px-6 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-all">
                  Sign in to dashboard
                </Link>
              </div>
              <div className="flex items-center gap-6">
                {[{ icon: "✓", text: "No credit card required" }, { icon: "✓", text: "Setup in 2 minutes" }].map(b => (
                  <div key={b.text} className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <span className="text-green-400 font-bold">{b.icon}</span> {b.text}
                  </div>
                ))}
              </div>
            </div>
            {/* right: phone */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* glow behind phone */}
                <div className="absolute inset-0 blur-3xl rounded-full" style={{ background: "radial-gradient(ellipse at center, rgba(99,102,241,0.3) 0%, transparent 70%)", transform: "scale(1.2)" }} />
                <HeroPhoneMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ──────────────────────────────────────────────────── */}
      <Section>
        <div className="border-y border-zinc-800/60 bg-zinc-950/50">
          <div className="mx-auto max-w-6xl px-6 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-3xl font-black text-white">{s.value}</p>
                  <p className="text-xs text-zinc-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── WHATSAPP SECTION ─────────────────────────────────────────────── */}
      <section className="relative py-28 overflow-hidden">
        <ParallaxBlob className="h-[500px] w-[500px] bg-green-600/8" style={{ top: -50, right: -150 }} />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* phone mockup */}
            <Section className="flex justify-center lg:justify-start order-last lg:order-first">
              <div className="relative">
                <div className="absolute inset-0 blur-3xl rounded-full" style={{ background: "radial-gradient(ellipse at center, rgba(0,168,132,0.2) 0%, transparent 70%)", transform: "scale(1.3)" }} />
                <WhatsAppPhoneMockup />
              </div>
            </Section>
            {/* text */}
            <Section className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5">
                <span className="text-sm">💬</span>
                <span className="text-xs font-medium text-green-300">WhatsApp First</span>
              </div>
              <h2 className="text-4xl font-black leading-tight tracking-tight">
                One tap to send.<br />
                <span className="text-zinc-400">Beautiful every time.</span>
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                Hit "Send Card" on any employee profile and a stunning digital card message is delivered to their WhatsApp instantly — complete with a mini card preview, their contact details, and a tap-to-view link.
              </p>
              <ul className="space-y-3">
                {[
                  "Rich card preview inside the WhatsApp bubble",
                  "Personalized greeting with employee name",
                  "Direct 'View Card' link to their digital profile",
                  "Powered by NunaCards branding",
                ].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-zinc-400">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-500/20">
                      <Check className="h-2.5 w-2.5 text-green-400" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────────────────── */}
      <section className="relative py-24 bg-zinc-950/40">
        <div className="mx-auto max-w-6xl px-6">
          <Section className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-black tracking-tight">Everything your team needs</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">From card creation to lead capture — NunaCards handles the full networking workflow for modern sales teams.</p>
          </Section>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <Section key={f.title}>
                  <div
                    className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 h-full hover:border-zinc-600 transition-all duration-300 hover:-translate-y-0.5 group"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${f.bg} mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-5 w-5 ${f.color}`} />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
                  </div>
                </Section>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="relative py-28 overflow-hidden">
        <ParallaxBlob className="h-[400px] w-[400px] bg-indigo-600/8" style={{ bottom: 0, left: -100 }} />
        <div className="relative mx-auto max-w-6xl px-6">
          <Section className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-black tracking-tight">Up and running in minutes</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">No technical setup. No app to install. Just create, send, and grow.</p>
          </Section>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <Section key={step.n}>
                <div className="relative">
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-5 left-full w-full h-px bg-gradient-to-r from-zinc-700 to-transparent z-0" style={{ width: "calc(100% - 20px)", left: "calc(50% + 20px)" }} />
                  )}
                  <div className="relative z-10 space-y-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-900">
                      <span className="text-xs font-bold text-zinc-400">{step.n}</span>
                    </div>
                    <h3 className="text-base font-bold text-white">{step.title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOGIN PREVIEW ─────────────────────────────────────────────────── */}
      <section className="relative py-28 bg-zinc-950/40 overflow-hidden">
        <ParallaxBlob className="h-[500px] w-[500px] bg-violet-600/8" style={{ top: 50, right: -200 }} />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <Section className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5">
                <Shield className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-xs font-medium text-violet-300">Secure Access</span>
              </div>
              <h2 className="text-4xl font-black leading-tight tracking-tight">
                Beautifully secure<br />
                <span className="text-zinc-400">login experience.</span>
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                Role-based access for owners and employees. Login with OTP via email or password — your workspace is always protected.
              </p>
              <ul className="space-y-3">
                {["OTP and password login options", "Separate owner and employee portals", "Session management built-in", "Instant redirects based on role"].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-zinc-400">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-500/20">
                      <Check className="h-2.5 w-2.5 text-violet-400" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-zinc-300 transition-colors">
                Go to login <ChevronRight className="h-4 w-4" />
              </Link>
            </Section>
            <Section>
              <div className="relative">
                <div className="absolute inset-0 blur-3xl rounded-full" style={{ background: "radial-gradient(ellipse at center, rgba(139,92,246,0.15) 0%, transparent 70%)", transform: "scale(1.2)" }} />
                <LoginMockup />
              </div>
            </Section>
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ─────────────────────────────────────────────── */}
      <section className="relative py-28 overflow-hidden">
        <ParallaxBlob className="h-[450px] w-[450px] bg-indigo-600/8" style={{ top: 0, left: -150 }} />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <Section className="order-last lg:order-first">
              <div className="relative">
                <div className="absolute inset-0 blur-3xl rounded-full" style={{ background: "radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 70%)", transform: "scale(1.2)" }} />
                <DashboardMockup />
              </div>
            </Section>
            <Section className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5">
                <Users className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-xs font-medium text-indigo-300">Team Dashboard</span>
              </div>
              <h2 className="text-4xl font-black leading-tight tracking-tight">
                Your whole team,<br />
                <span className="text-zinc-400">one dashboard.</span>
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                Add employees, send their digital cards, track which cards are performing best, and export leads — all from your NunaCards owner dashboard.
              </p>
              <ul className="space-y-3">
                {["Per-employee scan and view analytics", "Lead list with WhatsApp quick-open", "CSV export for CRM import", "Employee code & QR management"].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-zinc-400">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/20">
                      <Check className="h-2.5 w-2.5 text-indigo-400" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-zinc-300 transition-colors">
                Get your dashboard <ChevronRight className="h-4 w-4" />
              </Link>
            </Section>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF / TESTIMONIAL ────────────────────────────────────── */}
      <section className="py-24 bg-zinc-950/40">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Section className="space-y-6">
            <div className="flex justify-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />)}
            </div>
            <blockquote className="text-2xl font-bold text-white leading-snug">
              "We replaced paper business cards for 40 employees. Our lead capture rate went up 3x in the first month. The WhatsApp delivery is instant and the cards look stunning."
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <img src={`https://api.dicebear.com/10.x/micah/svg?seed=TarunPatel`} alt="" className="h-10 w-10 rounded-full bg-zinc-800" />
              <div className="text-left">
                <p className="text-sm font-semibold text-white">Tarun Patel</p>
                <p className="text-xs text-zinc-500">VP Sales, GlobalVentures India</p>
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="relative py-32 overflow-hidden">
        <ParallaxBlob className="h-[600px] w-[600px] bg-indigo-600/15" style={{ top: "10%", left: "20%" }} />
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <Section className="space-y-8">
            <h2 className="text-5xl font-black leading-tight tracking-tight">
              Ready to modernize<br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                your team's networking?
              </span>
            </h2>
            <p className="text-lg text-zinc-400 max-w-xl mx-auto">
              Join teams that have ditched paper cards. Set up NunaCards in minutes — no technical knowledge needed.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/signup" className="inline-flex items-center gap-2 h-13 rounded-2xl bg-white px-8 py-3.5 text-base font-bold text-black hover:bg-zinc-100 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/10">
                Create your account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 h-13 rounded-2xl border border-zinc-700 px-8 py-3.5 text-base font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-all">
                Sign in
              </Link>
            </div>
            <p className="text-xs text-zinc-600">No credit card required · Free to start · Cancel anytime</p>
          </Section>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800/60 py-10">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white">
              <span className="text-[11px] font-black text-black">N</span>
            </div>
            <span className="text-sm font-bold text-white">NunaCards</span>
          </div>
          <p className="text-xs text-zinc-600">© 2026 NunaCards. Digital business cards for modern teams.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors">Login</Link>
            <Link href="/signup" className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

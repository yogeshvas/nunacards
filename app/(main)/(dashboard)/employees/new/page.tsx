"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Plus, X, Upload, Phone, Mail } from "lucide-react";
import { CountryCodeDropdown } from "@/components/custom/CountryCodeDropdown";
import { QrSvg } from "@/utils/qr";
import { DESIGNATIONS } from "@/data/constants";

// ── constants ─────────────────────────────────────────────────────────────────


function randomCode() {
  return "EMP-" + Math.random().toString(36).substring(2, 7).toUpperCase();
}


// ── phone mockup ──────────────────────────────────────────────────────────────

function PhoneMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto" style={{ width: 300 }}>

      {/* volume up */}
      <div className="absolute rounded-l-full bg-zinc-700"
        style={{ left: -8, top: 104, width: 5, height: 33 }} />
      {/* volume down */}
      <div className="absolute rounded-l-full bg-zinc-700"
        style={{ left: -8, top: 148, width: 5, height: 33 }} />
      {/* silent toggle */}
      <div className="absolute rounded-l-full bg-zinc-700"
        style={{ left: -8, top: 75, width: 5, height: 21 }} />
      {/* power */}
      <div className="absolute rounded-r-full bg-zinc-700"
        style={{ right: -8, top: 129, width: 5, height: 63 }} />

      {/* outer shell */}
      <div
        className="overflow-hidden shadow-2xl shadow-black/70"
        style={{
          borderRadius: 52,
          border: "10px solid #27272a",
          background: "#18181b",
          boxShadow: "0 0 0 1px #3f3f46, 0 32px 64px -16px rgba(0,0,0,0.8)",
        }}
      >
        {/* screen */}
        <div
          className="relative overflow-hidden bg-zinc-950"
          style={{ borderRadius: 44, minHeight: 608 }}
        >
          {/* status bar */}
          <div className="relative flex items-center justify-between px-6 pt-3 pb-1 shrink-0">
            <span className="text-[11px] font-semibold text-white">9:41</span>
            {/* dynamic island */}
            <div
              className="absolute left-1/2 -translate-x-1/2 bg-black"
              style={{ top: 10, width: 112, height: 28, borderRadius: 22 }}
            />
            <div className="flex items-center gap-1">
              {/* signal */}
              <svg width="13" height="10" viewBox="0 0 13 10" fill="white">
                <rect x="0" y="6" width="2" height="4" rx="0.5" opacity="0.4" />
                <rect x="3.5" y="4" width="2" height="6" rx="0.5" opacity="0.6" />
                <rect x="7" y="2" width="2" height="8" rx="0.5" opacity="0.8" />
                <rect x="10.5" y="0" width="2" height="10" rx="0.5" />
              </svg>
              {/* wifi */}
              <svg width="13" height="10" viewBox="0 0 16 12" fill="none">
                <circle cx="8" cy="11" r="1.5" fill="white" />
                <path d="M4 7.5a5.5 5.5 0 018 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M1 4.5a10 10 0 0114 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {/* battery */}
              <svg width="22" height="11" viewBox="0 0 22 11" fill="none">
                <rect x="0.5" y="0.5" width="17" height="10" rx="2.5" stroke="white" strokeOpacity="0.35" />
                <rect x="2" y="2" width="13" height="7" rx="1.5" fill="white" />
                <path d="M18.5 3.5v4" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* scrollable card content */}
          <div className="overflow-y-auto" style={{ maxHeight: 564 }}>
            {children}
          </div>

          {/* home indicator */}
          <div className="flex justify-center py-2">
            <div className="h-1 w-24 rounded-full bg-white/25" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── card screen (inside phone) ────────────────────────────────────────────────

function CardScreen({
  name, email, designation, phone, profilePic, labels, orgName, countryCode,
}: {
  name: string; email: string; designation: string; phone: string;
  profilePic: string | null; labels: { key: string; value: string }[]; orgName: string;
  countryCode: string;
}) {
  const displayName = name || "Full Name";
  const displayDesignation = designation || "Designation";
  const displayOrg = orgName || "Organization";
  const displayPhone = phone ? `${countryCode} ${phone}` : `${countryCode} 98765 43210`;
  const displayEmail = email || "email@company.com";

  return (
    <div>
      {/* gradient hero */}
      <div
        className="relative flex flex-col items-center pt-10 pb-8 px-4"
        style={{ background: "linear-gradient(160deg,#312e81 0%,#1e1b4b 50%,#09090b 100%)" }}
      >
        {/* avatar */}
        {profilePic ? (
          <img
            src={profilePic}
            alt="profile"
            className="h-20 w-20 rounded-full object-cover ring-4 ring-white/10 shadow-lg"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800 ring-4 ring-white/10">
            <span className="text-2xl font-bold text-zinc-400">
              {name ? name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "?"}
            </span>
          </div>
        )}
        <h2 className="mt-3 text-base font-bold text-white leading-tight text-center">
          {displayName}
        </h2>
        <p className="mt-0.5 text-xs text-indigo-300 font-medium">{displayDesignation}</p>
        <p className="mt-0.5 text-[11px] text-zinc-500">{displayOrg}</p>
      </div>

      {/* contact card */}
      <div className="bg-zinc-950 px-4 pt-4 pb-2">
        <div className="rounded-2xl bg-zinc-900 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
              <Phone className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-wide">Phone</p>
              <p className="text-xs font-medium text-white">{displayPhone}</p>
            </div>
          </div>

          <div className="h-px bg-zinc-800" />

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
              <Mail className="h-3.5 w-3.5 text-violet-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-wide">Email</p>
              <p className="text-xs font-medium text-white truncate">{displayEmail}</p>
            </div>
          </div>

          {labels.filter(l => l.key && l.value).map((l, i) => (
            <div key={i}>
              <div className="h-px bg-zinc-800 mb-3" />
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-700/40">
                  <span className="text-[10px] font-bold text-zinc-400">
                    {l.key.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-wide">{l.key}</p>
                  <p className="text-xs font-medium text-white">{l.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* save contact */}
        <button className="mt-3 w-full rounded-2xl bg-white py-3 text-xs font-bold text-black transition active:scale-[0.98]">
          Save Contact
        </button>

        {/* QR section */}
        <div className="mt-4 flex flex-col items-center gap-2 pb-2">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-medium">
            Scan to connect
          </p>
          <div className="h-24 w-24 rounded-xl bg-zinc-900 p-2 border border-zinc-800">
            <QrSvg dark="#3f3f46" light="#18181b" dot="#71717a" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function NewEmployeePage() {
  const fileRef = useRef<HTMLInputElement>(null);

  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("");
  const [customDesignation, setCustomDesignation] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [country, setCountry] = useState("India");
  const [phone, setPhone] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [labels, setLabels] = useState<{ key: string; value: string }[]>([]);

  const orgName = "Your Organization";
  const [dragging, setDragging] = useState(false);

  function applyFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setProfilePic(URL.createObjectURL(file));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) applyFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) applyFile(file);
  }

  function addLabel() {
    setLabels(l => [...l, { key: "", value: "" }]);
  }
  function removeLabel(i: number) {
    setLabels(l => l.filter((_, idx) => idx !== i));
  }
  function updateLabel(i: number, field: "key" | "value", val: string) {
    setLabels(l => l.map((lbl, idx) => idx === i ? { ...lbl, [field]: val } : lbl));
  }

  return (
    <div>
      {/* breadcrumb */}
      <div className="mb-8 flex items-center gap-3">
        <Link href="/employees" className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Employees
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-sm font-medium text-white">New Employee</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-16 items-start">

        {/* ── form ── */}
        <div className="max-w-lg space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Create Employee</h1>
            <p className="mt-1 text-sm text-zinc-400">Fill in the details to generate a digital card.</p>
          </div>

          {/* profile pic upload */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-8 transition-colors ${
              dragging
                ? "border-indigo-500 bg-indigo-500/5"
                : profilePic
                ? "border-zinc-700 bg-zinc-950"
                : "border-zinc-800 bg-zinc-950 hover:border-zinc-600 hover:bg-zinc-900"
            }`}
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

            {profilePic ? (
              <div className="flex items-center gap-5">
                <img src={profilePic} alt="profile"
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-zinc-700" />
                <div>
                  <p className="text-sm font-medium text-white">Photo uploaded</p>
                  <p className="mt-0.5 text-xs text-zinc-500">Click or drag to replace</p>
                </div>
              </div>
            ) : (
              <>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${dragging ? "bg-indigo-500/20" : "bg-zinc-800"}`}>
                  <Upload className={`h-5 w-5 transition-colors ${dragging ? "text-indigo-400" : "text-zinc-400"}`} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white">
                    {dragging ? "Drop to upload" : "Upload profile photo"}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-600">
                    Drag &amp; drop or <span className="text-zinc-400 underline underline-offset-2">browse</span> · PNG, JPG up to 4MB
                  </p>
                </div>
              </>
            )}
          </div>

          {/* fields */}
          <div className="space-y-4">
            <Field label="Full name">
              <input type="text" placeholder="Yogesh Vashisth" value={name}
                onChange={e => setName(e.target.value)} className={inputCls} />
            </Field>

            <Field label="Email address">
              <input type="email" placeholder="yogesh@company.com" value={email}
                onChange={e => setEmail(e.target.value)} className={inputCls} />
            </Field>

            <Field label="Designation">
              {customDesignation ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Head of Growth"
                    value={designation}
                    onChange={e => setDesignation(e.target.value)}
                    className={`${inputCls} flex-1`}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => { setCustomDesignation(false); setDesignation(""); }}
                    className="flex shrink-0 items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-400 transition hover:border-zinc-600 hover:text-white"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> List
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={designation}
                    onChange={e => {
                      if (e.target.value === "__other__") {
                        setCustomDesignation(true);
                        setDesignation("");
                      } else {
                        setDesignation(e.target.value);
                      }
                    }}
                    className={`${inputCls} appearance-none pr-8`}
                  >
                    <option value="" disabled>Select designation</option>
                    {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    <option value="__other__">✏️ Add other…</option>
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}
            </Field>

            <Field label="Phone number">
              <div className="flex gap-2">
                <CountryCodeDropdown
                  value={countryCode}
                  onChange={(code, c) => { setCountryCode(code); setCountry(c); }}
                />
                <input type="tel" placeholder="98765 43210" value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                  className={`${inputCls} flex-1`} />
              </div>
            </Field>

            <Field label="Employee code">
              <div className="flex gap-2">
                <input type="text" placeholder="EMP-XXXXX" value={employeeCode}
                  onChange={e => setEmployeeCode(e.target.value)}
                  className={`${inputCls} flex-1`} />
                <button type="button" onClick={() => setEmployeeCode(randomCode())}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-xs font-medium text-zinc-400 transition hover:border-zinc-600 hover:text-white">
                  <RefreshCw className="h-3.5 w-3.5" /> Generate
                </button>
              </div>
            </Field>
          </div>

          {/* dynamic labels */}
          {labels.length > 0 && (
            <div className="space-y-2">
              {labels.map((lbl, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="text" placeholder="Label (e.g. YOE)" value={lbl.key}
                    onChange={e => updateLabel(i, "key", e.target.value)}
                    className={`${inputCls} flex-1`} />
                  <input type="text" placeholder="Value (e.g. 4 Years)" value={lbl.value}
                    onChange={e => updateLabel(i, "value", e.target.value)}
                    className={`${inputCls} flex-1`} />
                  <button type="button" onClick={() => removeLabel(i)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 text-zinc-600 transition hover:border-red-500/40 hover:text-red-400">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button type="button" onClick={addLabel}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors">
            <Plus className="h-4 w-4" /> Add label
          </button>

          <button type="button"
            className="mt-2 h-11 w-full rounded-xl bg-white text-sm font-semibold text-black transition hover:bg-zinc-100 active:scale-[0.98]">
            Create Employee
          </button>
        </div>

        {/* ── phone preview ── */}
        <div className="hidden lg:flex flex-col items-center gap-2 sticky top-24">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-600">
            Preview
          </p>
          <PhoneMockup>
            <CardScreen
              name={name} email={email} designation={designation}
              phone={phone} profilePic={profilePic} labels={labels} orgName={orgName}
              countryCode={countryCode}
            />
          </PhoneMockup>
        </div>

      </div>
    </div>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────────

const inputCls =
  "h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-zinc-600 focus:ring-2 focus:ring-zinc-600/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-zinc-400">{label}</label>
      {children}
    </div>
  );
}

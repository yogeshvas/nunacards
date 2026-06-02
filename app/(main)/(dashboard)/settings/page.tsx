"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Building2, User, Shield, AlertTriangle,
  Upload, Plus, X, Eye, EyeOff, Monitor,
  LogOut, Trash2, ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { CountryCodeDropdown } from "@/components/custom/CountryCodeDropdown";
import { DESIGNATIONS } from "@/data/constants";

// ── types ─────────────────────────────────────────────────────────────────────

type Label = { key: string; value: string };
type OrgData = { id: string; name: string; slug: string; logo: string | null; plan: "BASIC" | "PRO"; planExpiresAt: string | null };
type AdminData = {
  id: string; name: string; email: string | null; designation: string | null;
  phone: string; countryCode: string; country: string;
  employeeCode: string; profileImage: string | null; labels: Label[];
};
type LoginSession = { id: string; ip: string | null; userAgent: string | null; createdAt: string };

type Tab = "organization" | "profile" | "security" | "danger";

// ── helpers ───────────────────────────────────────────────────────────────────

function parseDevice(ua: string | null): string {
  if (!ua) return "Unknown device";
  if (/iPhone|iPad|iOS/i.test(ua)) return "iPhone / iPad";
  if (/Android/i.test(ua)) return "Android";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Mac/i.test(ua)) return "Mac";
  if (/Linux/i.test(ua)) return "Linux";
  return "Unknown device";
}

const inputCls = "h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-zinc-600 focus:ring-2 focus:ring-zinc-600/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-zinc-400">{label}</label>
      {children}
    </div>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-6">{children}</div>;
}

function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <p className="mt-0.5 text-sm text-zinc-500">{sub}</p>
    </div>
  );
}

// ── Organization section ──────────────────────────────────────────────────────

function OrgSection({ org, onUpdate }: { org: OrgData; onUpdate: (o: OrgData) => void }) {
  const [name, setName] = useState(org.name);
  const [logo, setLogo] = useState<string | null>(org.logo);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function applyLogo(file: File) {
    if (!file.type.startsWith("image/")) return;
    setLogoFile(file);
    setLogo(URL.createObjectURL(file));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const tid = toast.loading("Saving…");
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      if (logoFile) fd.append("logo", logoFile);
      const res = await fetch("/api/settings/organization", { method: "PATCH", body: fd });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed", { id: tid }); return; }
      toast.success("Organization updated", { id: tid });
      onUpdate(data.org);
    } catch { toast.error("Network error", { id: tid }); }
    finally { setSaving(false); }
  }

  const isPro = org.plan === "PRO";
  const expiresAt = org.planExpiresAt ? new Date(org.planExpiresAt) : null;

  return (
    <div className="space-y-6">
      {/* Plan badge */}
      <SectionCard>
        <SectionTitle title="Plan" sub="Your current subscription plan." />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-semibold ${isPro ? "bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20" : "bg-zinc-800 text-zinc-400"}`}>
              {isPro ? "PRO" : "BASIC"}
            </span>
            {isPro && expiresAt && (
              <p className="text-xs text-zinc-500">
                Expires {expiresAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}
            {!isPro && <p className="text-xs text-zinc-500">Upgrade to PRO for advanced features.</p>}
          </div>
          {!isPro && (
            <button className="h-9 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
              Upgrade to PRO
            </button>
          )}
        </div>
      </SectionCard>

      {/* Org details */}
      <SectionCard>
        <SectionTitle title="Organization" sub="Update your organization name and logo." />
        <form onSubmit={handleSave} className="space-y-5">
          {/* Logo upload */}
          <div>
            <p className="text-xs font-medium text-zinc-400 mb-2">Logo</p>
            <div className="flex items-center gap-4">
              <div
                onClick={() => fileRef.current?.click()}
                className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-950 hover:border-zinc-500 transition-colors overflow-hidden"
              >
                {logo
                  ? <img src={logo} alt="logo" className="h-full w-full object-cover" />
                  : <Upload className="h-5 w-5 text-zinc-600" />
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) applyLogo(f); }} />
              <div>
                <p className="text-sm text-zinc-300">Click to upload your logo</p>
                <p className="text-xs text-zinc-600 mt-0.5">PNG, JPG up to 4MB</p>
              </div>
            </div>
          </div>

          <Field label="Organization name">
            <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls} required />
          </Field>

          <Field label="Organization slug">
            <input type="text" value={org.slug} disabled className={`${inputCls} opacity-40 cursor-not-allowed`} />
          </Field>

          <button type="submit" disabled={saving} className="h-10 rounded-lg bg-white px-5 text-sm font-semibold text-black hover:bg-zinc-100 transition disabled:opacity-50">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </SectionCard>
    </div>
  );
}

// ── My Profile section ────────────────────────────────────────────────────────

function ProfileSection({ admin, onUpdate }: { admin: AdminData; onUpdate: (a: AdminData) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const imageFileRef = useRef<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(admin.profileImage);
  const [name, setName] = useState(admin.name);
  const [email, setEmail] = useState(admin.email ?? "");
  const [designation, setDesignation] = useState(admin.designation ?? "");
  const [customDes, setCustomDes] = useState(admin.designation ? !DESIGNATIONS.includes(admin.designation) : false);
  const [countryCode, setCountryCode] = useState(admin.countryCode);
  const [country, setCountry] = useState(admin.country);
  const [phone, setPhone] = useState(admin.phone);
  const [labels, setLabels] = useState<Label[]>(Array.isArray(admin.labels) ? admin.labels : []);

  function applyFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    imageFileRef.current = file;
    setProfilePic(URL.createObjectURL(file));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    const tid = toast.loading("Saving profile…");
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("email", email.trim());
      fd.append("designation", designation.trim());
      fd.append("countryCode", countryCode);
      fd.append("country", country);
      fd.append("phone", phone.trim());
      fd.append("labels", JSON.stringify(labels.filter(l => l.key && l.value)));
      if (imageFileRef.current) fd.append("profileImage", imageFileRef.current);
      const res = await fetch("/api/settings/profile", { method: "PATCH", body: fd });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed", { id: tid }); return; }
      toast.success("Profile updated", { id: tid });
      onUpdate(data.admin);
    } catch { toast.error("Network error", { id: tid }); }
    finally { setSaving(false); }
  }

  return (
    <SectionCard>
      <SectionTitle title="My Card Profile" sub="This is your own digital card shown to contacts." />
      <form onSubmit={handleSave} className="space-y-5">
        {/* photo */}
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) applyFile(f); }}
          className="flex cursor-pointer items-center gap-5 rounded-xl border border-dashed border-zinc-700 bg-zinc-950 p-4 hover:border-zinc-500 transition-colors"
        >
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) applyFile(f); }} />
          {profilePic
            ? <img src={profilePic} alt="profile" className="h-14 w-14 rounded-full object-cover ring-2 ring-zinc-700 shrink-0" />
            : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-zinc-800"><Upload className="h-5 w-5 text-zinc-500" /></div>
          }
          <div>
            <p className="text-sm font-medium text-white">{profilePic ? "Photo uploaded" : "Upload profile photo"}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Click or drag &amp; drop · PNG, JPG up to 4MB</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full name">
            <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Email">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} />
          </Field>
        </div>

        <Field label="Designation">
          {customDes ? (
            <div className="flex gap-2">
              <input type="text" value={designation} onChange={e => setDesignation(e.target.value)} className={`${inputCls} flex-1`} placeholder="e.g. Head of Growth" autoFocus />
              <button type="button" onClick={() => { setCustomDes(false); setDesignation(""); }}
                className="flex shrink-0 items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-400 hover:text-white transition">
                <ArrowLeft className="h-3.5 w-3.5" /> List
              </button>
            </div>
          ) : (
            <div className="relative">
              <select value={designation}
                onChange={e => { if (e.target.value === "__other__") { setCustomDes(true); setDesignation(""); } else setDesignation(e.target.value); }}
                className={`${inputCls} appearance-none pr-8`}>
                <option value="">Select designation</option>
                {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                <option value="__other__">✏️ Add other…</option>
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          )}
        </Field>

        <Field label="Phone number">
          <div className="flex gap-2">
            <CountryCodeDropdown value={countryCode} onChange={(c, cn) => { setCountryCode(c); setCountry(cn); }} />
            <input type="tel" placeholder="98765 43210" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ""))} className={`${inputCls} flex-1`} />
          </div>
        </Field>

        {/* Labels */}
        {labels.length > 0 && (
          <div className="space-y-2">
            {labels.map((lbl, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="text" placeholder="Label" value={lbl.key} onChange={e => setLabels(l => l.map((x, idx) => idx === i ? { ...x, key: e.target.value } : x))} className={`${inputCls} flex-1`} />
                <input type="text" placeholder="Value" value={lbl.value} onChange={e => setLabels(l => l.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x))} className={`${inputCls} flex-1`} />
                <button type="button" onClick={() => setLabels(l => l.filter((_, idx) => idx !== i))}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 text-zinc-600 hover:border-red-500/40 hover:text-red-400 transition">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <button type="button" onClick={() => setLabels(l => [...l, { key: "", value: "" }])}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition">
          <Plus className="h-4 w-4" /> Add label
        </button>

        <button type="submit" disabled={saving} className="h-10 rounded-lg bg-white px-5 text-sm font-semibold text-black hover:bg-zinc-100 transition disabled:opacity-50">
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </form>
    </SectionCard>
  );
}

// ── Security section ──────────────────────────────────────────────────────────

function SecuritySection() {
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [loadingSess, setLoadingSess] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    fetch("/api/settings/sessions")
      .then(r => r.json())
      .then(d => setSessions(d.sessions ?? []))
      .finally(() => setLoadingSess(false));
  }, []);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) { toast.error("Passwords do not match"); return; }
    if (newPw.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setSavingPw(true);
    const tid = toast.loading("Updating password…");
    try {
      const res = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed", { id: tid }); return; }
      toast.success("Password updated", { id: tid });
      setCurrent(""); setNewPw(""); setConfirmPw("");
    } catch { toast.error("Network error", { id: tid }); }
    finally { setSavingPw(false); }
  }

  async function handleSignOutAll() {
    if (!window.confirm("This will sign you out of all devices including this one.")) return;
    setSigningOut(true);
    try {
      await fetch("/api/settings/sessions", { method: "DELETE" });
      await signOut({ callbackUrl: "/login" });
    } catch {
      toast.error("Failed to sign out");
      setSigningOut(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Change password */}
      <SectionCard>
        <SectionTitle title="Change Password" sub="Use a strong password you don't use elsewhere." />
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Field label="Current password">
            <div className="relative">
              <input type={showCurrent ? "text" : "password"} value={current} onChange={e => setCurrent(e.target.value)} className={`${inputCls} pr-11`} required placeholder="••••••••" />
              <button type="button" tabIndex={-1} onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>
          <Field label="New password">
            <div className="relative">
              <input type={showNew ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)} className={`${inputCls} pr-11`} required placeholder="Min. 8 characters" />
              <button type="button" tabIndex={-1} onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>
          <Field label="Confirm new password">
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className={inputCls} required placeholder="Repeat new password" />
          </Field>
          <button type="submit" disabled={savingPw} className="h-10 rounded-lg bg-white px-5 text-sm font-semibold text-black hover:bg-zinc-100 transition disabled:opacity-50">
            {savingPw ? "Updating…" : "Update Password"}
          </button>
        </form>
      </SectionCard>

      {/* Sessions */}
      <SectionCard>
        <div className="flex items-center justify-between">
          <SectionTitle title="Active Sessions" sub="Devices that have signed in to your account." />
          <button onClick={handleSignOutAll} disabled={signingOut}
            className="flex items-center gap-1.5 h-9 rounded-lg border border-red-500/30 px-3 text-sm text-red-400 hover:border-red-500/60 hover:text-red-300 transition disabled:opacity-50">
            <LogOut className="h-3.5 w-3.5" />
            {signingOut ? "Signing out…" : "Sign out all"}
          </button>
        </div>

        {loadingSess ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-14 rounded-xl bg-zinc-800/50 animate-pulse" />)}
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-zinc-500">No sessions recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {sessions.map(s => (
              <div key={s.id} className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-800">
                  <Monitor className="h-4 w-4 text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{parseDevice(s.userAgent)}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">IP: {s.ip ?? "Unknown"}</p>
                </div>
                <p className="text-xs text-zinc-600 shrink-0">
                  {new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ── Danger Zone section ───────────────────────────────────────────────────────

function DangerSection({ orgName }: { orgName: string }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    if (confirmation !== orgName) { toast.error("Organization name does not match"); return; }
    setDeleting(true);
    const tid = toast.loading("Deleting organization…");
    try {
      const res = await fetch("/api/settings/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmation }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed", { id: tid }); setDeleting(false); return; }
      toast.success("Organization deleted", { id: tid });
      await signOut({ callbackUrl: "/login" });
    } catch { toast.error("Network error", { id: tid }); setDeleting(false); }
  }

  return (
    <div className="rounded-2xl border border-red-500/20 bg-zinc-900 p-6 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-red-400">Danger Zone</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Irreversible and destructive actions.</p>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-red-500/10 bg-zinc-950 p-4">
        <div>
          <p className="text-sm font-medium text-white">Delete this organization</p>
          <p className="text-xs text-zinc-500 mt-0.5">Permanently deletes all employees, leads, scans and your account.</p>
        </div>
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 h-9 rounded-lg border border-red-500/40 px-3 text-sm text-red-400 hover:bg-red-500/10 transition shrink-0 ml-4">
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => !deleting && setOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-white">Delete organization</h3>
              <p className="mt-1 text-sm text-zinc-400">
                This will permanently delete <span className="font-semibold text-white">{orgName}</span> and all its data. This cannot be undone.
              </p>
            </div>
            <form onSubmit={handleDelete} className="space-y-4">
              <Field label={`Type "${orgName}" to confirm`}>
                <input type="text" value={confirmation} onChange={e => setConfirmation(e.target.value)} className={inputCls} placeholder={orgName} />
              </Field>
              <Field label="Your password">
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputCls} placeholder="Enter your password" />
              </Field>
              <div className="flex gap-3">
                <button type="button" onClick={() => setOpen(false)} disabled={deleting}
                  className="flex-1 h-10 rounded-xl border border-zinc-700 text-sm text-zinc-300 hover:text-white transition disabled:opacity-40">
                  Cancel
                </button>
                <button type="submit" disabled={deleting || confirmation !== orgName}
                  className="flex-1 h-10 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-500 transition disabled:opacity-50">
                  {deleting ? "Deleting…" : "Delete forever"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "profile", label: "My Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("organization");
  const [org, setOrg] = useState<OrgData | null>(null);
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(d => { setOrg(d.org ?? null); setAdmin(d.admin ?? null); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
        <p className="mt-1 text-sm text-zinc-400">Manage your organization and account.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* sidebar */}
        <nav className="w-full lg:w-52 shrink-0 lg:sticky lg:top-24">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
            {TABS.map(t => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-colors w-full text-left ${active
                      ? t.id === "danger"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-zinc-800 text-white"
                      : t.id === "danger"
                        ? "text-red-500/60 hover:text-red-400 hover:bg-red-500/5"
                        : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                    }`}>
                  <Icon className="h-4 w-4 shrink-0" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* content */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="h-40 rounded-2xl bg-zinc-800/50 animate-pulse" />)}
            </div>
          ) : (
            <>
              {tab === "organization" && org && <OrgSection org={org} onUpdate={setOrg} />}
              {tab === "profile" && admin && <ProfileSection admin={admin} onUpdate={setAdmin} />}
              {tab === "security" && <SecuritySection />}
              {tab === "danger" && org && <DangerSection orgName={org.name} />}
            </>
          )}
        </div>

      </div>
    </div>
  );
}

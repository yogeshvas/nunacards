"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Plus, X, Upload, Phone, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { CountryCodeDropdown } from "@/components/custom/CountryCodeDropdown";
import { DESIGNATIONS } from "@/data/constants";

type Label = { key: string; value: string };

function randomCode() {
  return "EMP-" + Math.random().toString(36).substring(2, 7).toUpperCase();
}

// ── phone preview (compact) ───────────────────────────────────────────────────

function MiniCard({ name, designation, profilePic, phone, countryCode, email, labels }: {
  name: string; designation: string; profilePic: string | null;
  phone: string; countryCode: string; email: string; labels: Label[];
}) {
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
              <svg width="22" height="11" viewBox="0 0 22 11" fill="none"><rect x="0.5" y="0.5" width="17" height="10" rx="2.5" stroke="white" strokeOpacity="0.35"/><rect x="2" y="2" width="13" height="7" rx="1.5" fill="white"/></svg>
            </div>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight:564 }}>
            <div className="relative flex flex-col items-center pt-10 pb-8 px-4" style={{ background:"linear-gradient(160deg,#312e81 0%,#1e1b4b 50%,#09090b 100%)" }}>
              {profilePic
                ? <img src={profilePic} alt={name} className="h-20 w-20 rounded-full object-cover ring-4 ring-white/10"/>
                : <img src={`https://api.dicebear.com/10.x/micah/svg?seed=${encodeURIComponent(name||"?")}`} alt="" className="h-20 w-20 rounded-full bg-zinc-800 ring-4 ring-white/10"/>
              }
              <h2 className="mt-3 text-base font-bold text-white text-center">{name||"Full Name"}</h2>
              <p className="mt-0.5 text-xs text-indigo-300">{designation||"Designation"}</p>
            </div>
            <div className="bg-zinc-950 px-4 pt-4 pb-4">
              <div className="rounded-2xl bg-zinc-900 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10"><Phone className="h-3.5 w-3.5 text-indigo-400"/></div>
                  <div><p className="text-[10px] text-zinc-600 uppercase tracking-wide">Phone</p><p className="text-xs font-medium text-white">{countryCode} {phone||"98765 43210"}</p></div>
                </div>
                {email && <><div className="h-px bg-zinc-800"/><div className="flex items-center gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/10"><Mail className="h-3.5 w-3.5 text-violet-400"/></div><div><p className="text-[10px] text-zinc-600 uppercase tracking-wide">Email</p><p className="text-xs font-medium text-white truncate">{email}</p></div></div></>}
                {labels.filter(l=>l.key&&l.value).map((l,i)=>(
                  <div key={i}><div className="h-px bg-zinc-800 mb-3"/><div className="flex items-center gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-700/40"><span className="text-[10px] font-bold text-zinc-400">{l.key.slice(0,2).toUpperCase()}</span></div><div><p className="text-[10px] text-zinc-600 uppercase tracking-wide">{l.key}</p><p className="text-xs font-medium text-white">{l.value}</p></div></div></div>
                ))}
              </div>
              <button className="mt-3 w-full rounded-2xl bg-white py-3 text-xs font-bold text-black">Save Contact</button>
            </div>
          </div>
          <div className="flex justify-center py-2"><div className="h-1 w-24 rounded-full bg-white/25"/></div>
        </div>
      </div>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function EditEmployeePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const imageFileRef = useRef<File | null>(null);

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("");
  const [customDesignation, setCustomDesignation] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [country, setCountry] = useState("India");
  const [phone, setPhone] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [labels, setLabels] = useState<Label[]>([]);

  // pre-populate from API
  useEffect(() => {
    fetch(`/api/employees/${id}`)
      .then(r => r.json())
      .then(({ employee: e }) => {
        if (!e) return;
        setName(e.name ?? "");
        setEmail(e.email ?? "");
        setDesignation(e.designation ?? "");
        setCountryCode(e.countryCode ?? "+91");
        setCountry(e.country ?? "India");
        setPhone(e.phone ?? "");
        setEmployeeCode(e.employeeCode ?? "");
        setLabels(Array.isArray(e.labels) ? e.labels : []);
        setProfilePic(e.profileImage ?? null);
        if (e.designation && !DESIGNATIONS.includes(e.designation)) setCustomDesignation(true);
      })
      .finally(() => setFetching(false));
  }, [id]);

  function applyFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    imageFileRef.current = file;
    setProfilePic(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Name is required"); return; }
    if (!phone.trim()) { toast.error("Phone is required"); return; }

    setLoading(true);
    const tid = toast.loading("Saving changes…");
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("email", email.trim());
      fd.append("designation", designation.trim());
      fd.append("countryCode", countryCode);
      fd.append("country", country);
      fd.append("phone", phone.trim());
      fd.append("employeeCode", employeeCode.trim());
      fd.append("labels", JSON.stringify(labels.filter(l => l.key && l.value)));
      if (imageFileRef.current) fd.append("profileImage", imageFileRef.current);

      const res = await fetch(`/api/employees/${id}`, { method: "PATCH", body: fd });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to save", { id: tid }); return; }
      toast.success("Changes saved!", { id: tid });
      router.push(`/employees/${id}`);
    } catch {
      toast.error("Network error.", { id: tid });
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return (
    <div className="flex items-center justify-center py-32">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-white"/>
    </div>
  );

  const inputCls = "h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-zinc-600 focus:ring-2 focus:ring-zinc-600/20";

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <Link href={`/employees/${id}`} className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4"/> Back
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-sm font-medium text-white">Edit Employee</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-16 items-start">

        <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Edit Employee</h1>
            <p className="mt-1 text-sm text-zinc-400">Update the details for this digital card.</p>
          </div>

          {/* photo upload */}
          <div onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); const f=e.dataTransfer.files?.[0]; if(f) applyFile(f); }}
            className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-8 transition-colors ${dragging ? "border-indigo-500 bg-indigo-500/5" : profilePic ? "border-zinc-700 bg-zinc-950" : "border-zinc-800 bg-zinc-950 hover:border-zinc-600 hover:bg-zinc-900"}`}
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f=e.target.files?.[0]; if(f) applyFile(f); }}/>
            {profilePic ? (
              <div className="flex items-center gap-5">
                <img src={profilePic} alt="profile" className="h-16 w-16 rounded-full object-cover ring-2 ring-zinc-700"/>
                <div><p className="text-sm font-medium text-white">Photo uploaded</p><p className="mt-0.5 text-xs text-zinc-500">Click or drag to replace</p></div>
              </div>
            ) : (
              <>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${dragging ? "bg-indigo-500/20" : "bg-zinc-800"}`}>
                  <Upload className={`h-5 w-5 ${dragging ? "text-indigo-400" : "text-zinc-400"}`}/>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white">{dragging ? "Drop to upload" : "Upload profile photo"}</p>
                  <p className="mt-0.5 text-xs text-zinc-600">Drag &amp; drop or <span className="text-zinc-400 underline underline-offset-2">browse</span> · PNG, JPG up to 4MB</p>
                </div>
              </>
            )}
          </div>

          <div className="space-y-4">
            <Field label="Full name">
              <input type="text" placeholder="Yogesh Vashisth" value={name} onChange={e=>setName(e.target.value)} className={inputCls}/>
            </Field>
            <Field label="Email address">
              <input type="email" placeholder="yogesh@company.com" value={email} onChange={e=>setEmail(e.target.value)} className={inputCls}/>
            </Field>
            <Field label="Designation">
              {customDesignation ? (
                <div className="flex gap-2">
                  <input type="text" placeholder="e.g. Head of Growth" value={designation} onChange={e=>setDesignation(e.target.value)} className={`${inputCls} flex-1`} autoFocus/>
                  <button type="button" onClick={() => { setCustomDesignation(false); setDesignation(""); }}
                    className="flex shrink-0 items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-400 transition hover:border-zinc-600 hover:text-white">
                    <ArrowLeft className="h-3.5 w-3.5"/> List
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <select value={designation} onChange={e => { if(e.target.value==="__other__"){setCustomDesignation(true);setDesignation("");}else setDesignation(e.target.value); }}
                    className={`${inputCls} appearance-none pr-8`}>
                    <option value="" disabled>Select designation</option>
                    {DESIGNATIONS.map(d=><option key={d} value={d}>{d}</option>)}
                    <option value="__other__">✏️ Add other…</option>
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                </div>
              )}
            </Field>
            <Field label="Phone number">
              <div className="flex gap-2">
                <CountryCodeDropdown value={countryCode} onChange={(c,cn)=>{setCountryCode(c);setCountry(cn);}}/>
                <input type="tel" placeholder="98765 43210" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,""))} className={`${inputCls} flex-1`}/>
              </div>
            </Field>
            <Field label="Employee code">
              <div className="flex gap-2">
                <input type="text" placeholder="EMP-XXXXX" value={employeeCode} onChange={e=>setEmployeeCode(e.target.value)} className={`${inputCls} flex-1`}/>
                <button type="button" onClick={()=>setEmployeeCode(randomCode())}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-xs font-medium text-zinc-400 transition hover:border-zinc-600 hover:text-white">
                  <RefreshCw className="h-3.5 w-3.5"/> Generate
                </button>
              </div>
            </Field>
          </div>

          {labels.length > 0 && (
            <div className="space-y-2">
              {labels.map((lbl,i)=>(
                <div key={i} className="flex items-center gap-2">
                  <input type="text" placeholder="Label" value={lbl.key} onChange={e=>setLabels(l=>l.map((x,idx)=>idx===i?{...x,key:e.target.value}:x))} className={`${inputCls} flex-1`}/>
                  <input type="text" placeholder="Value" value={lbl.value} onChange={e=>setLabels(l=>l.map((x,idx)=>idx===i?{...x,value:e.target.value}:x))} className={`${inputCls} flex-1`}/>
                  <button type="button" onClick={()=>setLabels(l=>l.filter((_,idx)=>idx!==i))}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 text-zinc-600 transition hover:border-red-500/40 hover:text-red-400">
                    <X className="h-4 w-4"/>
                  </button>
                </div>
              ))}
            </div>
          )}

          <button type="button" onClick={()=>setLabels(l=>[...l,{key:"",value:""}])}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors">
            <Plus className="h-4 w-4"/> Add label
          </button>

          <button type="submit" disabled={loading}
            className="mt-2 h-11 w-full rounded-xl bg-white text-sm font-semibold text-black transition hover:bg-zinc-100 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </form>

        <div className="hidden lg:flex flex-col items-center gap-2 sticky top-24">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-600">Preview</p>
          <MiniCard name={name} designation={designation} profilePic={profilePic} phone={phone} countryCode={countryCode} email={email} labels={labels}/>
        </div>

      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-zinc-400">{label}</label>
      {children}
    </div>
  );
}

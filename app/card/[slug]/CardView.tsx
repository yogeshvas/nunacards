"use client";

import { useState, useEffect } from "react";
import { Phone, Mail, Download, ExternalLink, Share2, CheckCheck, Building2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmployeeQR } from "@/components/custom/EmployeeQR";

// ── types ─────────────────────────────────────────────────────────────────────

type Label = { key: string; value: string };
export type EmployeeCard = {
  name: string;
  designation: string | null;
  email: string | null;
  phone: string;
  countryCode: string;
  profileImage: string | null;
  labels: unknown;
  employeeCode: string;
  slug: string;
  organization: { name: string; logo: string | null };
};

// ── vCard ─────────────────────────────────────────────────────────────────────

function downloadVCard(emp: EmployeeCard) {
  const phone = `${emp.countryCode}${emp.phone}`;
  const vcf = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${emp.name}`,
    `N:${emp.name.split(" ").slice(1).join(" ")};${emp.name.split(" ")[0]};;;`,
    `ORG:${emp.organization.name}`,
    emp.designation ? `TITLE:${emp.designation}` : null,
    `TEL;TYPE=WORK,VOICE:${phone}`,
    emp.email ? `EMAIL;TYPE=WORK:${emp.email}` : null,
    emp.profileImage ? `PHOTO;VALUE=URL:${emp.profileImage}` : null,
    "END:VCARD",
  ].filter(Boolean).join("\r\n");

  const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), {
    href: url,
    download: `${emp.name.replace(/\s+/g, "_")}.vcf`,
  });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function CardView({ employee: emp }: { employee: EmployeeCard }) {
  const [copied, setCopied] = useState(false);

  // track card view on mount
  useEffect(() => {
    const key = `nc_viewed_${emp.slug}`;
    const alreadyViewed = localStorage.getItem(key) === "1";
    fetch(`/api/card/${emp.slug}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isUnique: !alreadyViewed }),
    }).then(() => {
      if (!alreadyViewed) localStorage.setItem(key, "1");
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const labels = (Array.isArray(emp.labels) ? (emp.labels as Label[]) : []).filter(l => l.key && l.value);
  const waNum = `${emp.countryCode.replace(/^\+/, "")}${emp.phone}`;
  const initials = emp.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: emp.name, url }).catch(() => {});
    else await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    // force dark CSS variables for shadcn components
    <div className="dark" style={{ minHeight: "100svh", backgroundColor: "#0f1117", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>

      <div className="w-full max-w-[400px] space-y-3">

        {/* ── main card ── */}
        <Card className="bg-zinc-900 border-zinc-800 gap-0 py-0 rounded-2xl overflow-hidden">

          {/* header strip */}
          <div className="h-10 bg-zinc-800/60 border-b border-zinc-800 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-zinc-600" />
              <span className="text-[11px] font-medium text-zinc-500 tracking-wide uppercase">Digital Card</span>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {copied
                ? <><CheckCheck className="h-3.5 w-3.5 text-emerald-400" /><span className="text-emerald-400">Copied</span></>
                : <><Share2 className="h-3.5 w-3.5" />Share</>
              }
            </button>
          </div>

          {/* ── profile section ── */}
          <CardContent className="px-4 pt-4 pb-4">
            <div className="flex items-center gap-3">
              {/* avatar */}
              <div className="shrink-0">
                {emp.profileImage ? (
                  <img src={emp.profileImage} alt={emp.name}
                    className="h-14 w-14 rounded-xl object-cover ring-1 ring-zinc-700" />
                ) : (
                  <div className="h-14 w-14 rounded-xl bg-zinc-800 ring-1 ring-zinc-700 flex items-center justify-center text-base font-bold text-zinc-400">
                    {initials}
                  </div>
                )}
              </div>

              {/* identity */}
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-semibold text-zinc-100 leading-snug">{emp.name}</h1>
                {emp.designation && (
                  <p className="text-sm text-zinc-400">{emp.designation}</p>
                )}
                <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                  <Building2 className="h-3 w-3 shrink-0" />
                  <span className="truncate">{emp.organization.name}</span>
                </div>
              </div>

              {/* employee code */}
              <span className="shrink-0 inline-flex items-center rounded-md bg-zinc-800 px-2 py-1 text-[11px] font-medium text-zinc-500 ring-1 ring-zinc-700/80">
                {emp.employeeCode}
              </span>
            </div>
          </CardContent>

          {/* ── contact rows ── */}
          <div className="border-t border-zinc-800">
            <ContactRow
              icon={<Phone className="h-3.5 w-3.5 text-zinc-400" />}
              label="Phone"
              value={`${emp.countryCode} ${emp.phone}`}
              href={`tel:${emp.countryCode}${emp.phone}`}
            />
            {emp.email && (
              <ContactRow
                icon={<Mail className="h-3.5 w-3.5 text-zinc-400" />}
                label="Email"
                value={emp.email}
                href={`mailto:${emp.email}`}
              />
            )}
            {labels.map((l, i) => (
              <ContactRow
                key={i}
                icon={<span className="text-[10px] font-bold text-zinc-500">{l.key.slice(0, 2).toUpperCase()}</span>}
                label={l.key}
                value={l.value}
              />
            ))}
          </div>

          {/* ── action buttons ── */}
          <div className="border-t border-zinc-800 px-4 py-3 flex items-center gap-2">
            <a href={`tel:${emp.countryCode}${emp.phone}`} className="flex-1">
              <Button variant="outline" className="w-full h-8 text-xs font-medium border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700 hover:text-white hover:border-zinc-600 gap-1.5">
                <Phone className="h-3.5 w-3.5" /> Call
              </Button>
            </a>
            <a href={`https://wa.me/${waNum}`} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="outline" className="w-full h-8 text-xs font-medium border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700 hover:text-white hover:border-zinc-600 gap-1.5">
                <span className="text-sm leading-none">💬</span> WhatsApp
              </Button>
            </a>
            {emp.email && (
              <a href={`mailto:${emp.email}`} className="flex-1">
                <Button variant="outline" className="w-full h-8 text-xs font-medium border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700 hover:text-white hover:border-zinc-600 gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email
                </Button>
              </a>
            )}
          </div>

          {/* ── save contact CTA ── */}
          <div className="border-t border-zinc-800 px-4 py-3">
            <Button
              className="w-full h-9 text-sm font-semibold bg-zinc-100 text-zinc-900 hover:bg-white gap-2"
              onClick={() => downloadVCard(emp)}
            >
              <Download className="h-4 w-4" />
              Save to Contacts
            </Button>
          </div>
        </Card>

        {/* ── QR card ── */}
        <Card className="bg-zinc-900 border-zinc-800 rounded-2xl gap-0 py-0">
          <CardContent className="px-4 py-3 flex items-center gap-3">
            <div className="shrink-0 rounded-lg overflow-hidden border border-zinc-800">
              <EmployeeQR employeeCode={emp.employeeCode} size={64} bg="#09090b" fg="#d4d4d8" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <QrCode className="h-3.5 w-3.5 text-zinc-500" />
                <p className="text-xs font-semibold text-zinc-300">Scan to share</p>
              </div>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                Opens this card instantly on any device via WhatsApp.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* footer */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <div className="h-5 w-5 rounded-md bg-white flex items-center justify-center">
            <span className="text-[9px] font-black text-black">N</span>
          </div>
          <span className="text-xs text-zinc-600">
            Powered by <span className="text-zinc-500 font-medium">NunaCards</span>
          </span>
        </div>

      </div>
    </div>
  );
}

// ── sub-components ────────────────────────────────────────────────────────────

function ContactRow({ icon, label, value, href }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-zinc-800/60 last:border-0 hover:bg-zinc-800/30 transition-colors">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-wider leading-none mb-0.5">{label}</p>
        <p className="text-sm text-zinc-300 font-medium truncate leading-snug">{value}</p>
      </div>
      {href && <ExternalLink className="h-3.5 w-3.5 text-zinc-700 shrink-0" />}
    </div>
  );

  return href
    ? <a href={href} className="block no-underline">{inner}</a>
    : <div>{inner}</div>;
}

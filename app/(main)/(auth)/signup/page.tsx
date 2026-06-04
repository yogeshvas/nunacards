"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CountryCodeDropdown } from "@/components/custom/CountryCodeDropdown";


const OTP_LEN = 8;

function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = value.toUpperCase().padEnd(OTP_LEN, " ").split("").slice(0, OTP_LEN);

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !chars[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  function handleChange(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(-1);
    const next = chars.map((c, idx) => (idx === i ? val : c)).join("").replace(/ /g, "");
    onChange(next);
    if (val && i < OTP_LEN - 1) inputs.current[i + 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, OTP_LEN);
    if (pasted) {
      onChange(pasted);
      inputs.current[Math.min(pasted.length, OTP_LEN - 1)]?.focus();
    }
    e.preventDefault();
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: OTP_LEN }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="text"
          autoCapitalize="characters"
          maxLength={1}
          value={chars[i]?.trim() || ""}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="h-12 w-11 rounded-xl border border-zinc-800 bg-zinc-950 text-center text-base font-bold text-white outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 caret-transparent uppercase"
        />
      ))}
    </div>
  );
}

// ── left panel features ───────────────────────────────────────────────────────

const features = [
  "Instant QR-powered card sharing",
  "Lead capture via WhatsApp",
  "Centralized employee card management",
  "Real-time scan analytics",
];

// ── steps ─────────────────────────────────────────────────────────────────────

type Step = "identity" | "otp" | "profile";

// ── page ──────────────────────────────────────────────────────────────────────

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("identity");

  // step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // step 2
  const [otp, setOtp] = useState("");

  // step 3
  const [profile, setProfile] = useState({
    orgName: "",
    countryCode: "+91",
    phone: "",
    country: "India",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function profileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  // ── step 1: send OTP ──────────────────────────────────────────────────────

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to send OTP"); return; }
      setStep("otp");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── step 2: verify OTP ────────────────────────────────────────────────────

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length < OTP_LEN) { setError(`Please enter all ${OTP_LEN} characters`); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Verification failed"); return; }
      setStep("profile");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── step 3: complete profile ──────────────────────────────────────────────

  async function handleCompleteProfile(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...profile }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong"); return; }
      router.push("/login");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-[1fr_1.1fr] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">

        {/* left panel */}
        <div className="relative hidden lg:flex flex-col justify-between p-10 bg-zinc-950 overflow-hidden">
          <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
              <span className="text-xs font-black text-black">N</span>
            </div>
            <span className="text-sm font-semibold tracking-wide">NunaCards</span>
          </div>

          <div className="relative space-y-6">
            <h1 className="text-4xl font-bold leading-[1.15] tracking-tight">
              Digital business cards
              <br />
              <span className="text-zinc-400">for modern teams.</span>
            </h1>
            <ul className="space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-zinc-400">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <Check className="h-2.5 w-2.5 text-white" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* step indicators */}
          <div className="relative flex items-center gap-3">
            {(["identity", "otp", "profile"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${step === s
                    ? "bg-white text-black"
                    : ["identity", "otp", "profile"].indexOf(step) > i
                      ? "bg-zinc-700 text-zinc-300"
                      : "border border-zinc-700 text-zinc-600"
                    }`}
                >
                  {["identity", "otp", "profile"].indexOf(step) > i ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 2 && <div className="h-px w-6 bg-zinc-800" />}
              </div>
            ))}
            <span className="ml-2 text-xs text-zinc-500">
              {step === "identity" && "Your details"}
              {step === "otp" && "Verify email"}
              {step === "profile" && "Complete setup"}
            </span>
          </div>
        </div>

        {/* right panel */}
        <div className="flex flex-col justify-center bg-zinc-900 px-8 py-10 md:px-12">
          <div className="mx-auto w-full max-w-sm">

            {/* ── Step 1: identity ── */}
            {step === "identity" && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
                  <p className="mt-1.5 text-sm text-zinc-400">
                    We'll send a verification code to your email.
                  </p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <Field label="Full name">
                    <input
                      type="text" placeholder="Yogesh Vashisth" value={name} required
                      onChange={(e) => setName(e.target.value)} className={inputCls}
                    />
                  </Field>

                  <Field label="Email address">
                    <input
                      type="email" placeholder="you@company.com" value={email} required
                      onChange={(e) => setEmail(e.target.value)} className={inputCls}
                    />
                  </Field>

                  {error && <ErrorBox>{error}</ErrorBox>}

                  <button type="submit" disabled={loading} className={submitCls}>
                    {loading ? "Sending code…" : "Send verification code →"}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-zinc-500">
                  Already have an account?{" "}
                  <Link href="/login" className="font-medium text-white hover:underline">
                    Sign in
                  </Link>
                </p>
              </>
            )}

            {/* ── Step 2: OTP ── */}
            {step === "otp" && (
              <>
                <button
                  onClick={() => { setStep("identity"); setOtp(""); setError(""); }}
                  className="mb-6 flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold tracking-tight">Check your email</h2>
                  <p className="mt-1.5 text-sm text-zinc-400">
                    We sent a 6-digit code to{" "}
                    <span className="font-medium text-white">{email}</span>.
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <OtpInput value={otp} onChange={(v) => { setOtp(v); setError(""); }} />

                  {error && <ErrorBox>{error}</ErrorBox>}

                  <button type="submit" disabled={loading || otp.length < OTP_LEN} className={submitCls}>
                    {loading ? "Verifying…" : "Verify code →"}
                  </button>
                </form>

                <p className="mt-4 text-center text-sm text-zinc-500">
                  Didn't receive it?{" "}
                  <button
                    onClick={handleSendOtp as any}
                    className="font-medium text-white hover:underline"
                  >
                    Resend
                  </button>
                </p>
              </>
            )}

            {/* ── Step 3: profile ── */}
            {step === "profile" && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold tracking-tight">Complete your profile</h2>
                  <p className="mt-1.5 text-sm text-zinc-400">
                    Just a few more details to set up your organization.
                  </p>
                </div>

                <form onSubmit={handleCompleteProfile} className="space-y-4">
                  <Field label="Organization name">
                    <input
                      name="orgName" type="text" placeholder="Acme Inc."
                      value={profile.orgName} onChange={profileChange} required
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Phone number">
                    <div className="flex gap-2">
                      <CountryCodeDropdown
                        value={profile.countryCode}
                        onChange={(code, country) =>
                          setProfile((p) => ({ ...p, countryCode: code, country }))
                        }
                      />
                      <input
                        name="phone" type="tel" placeholder="98765 43210"
                        value={profile.phone} onChange={profileChange} required
                        className={`${inputCls} flex-1`}
                      />
                    </div>
                  </Field>

                  <Field label="Password">
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={profile.password} onChange={profileChange} required
                        className={`${inputCls} pr-11`}
                      />
                      <button
                        type="button" tabIndex={-1}
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>

                  {error && <ErrorBox>{error}</ErrorBox>}

                  <button type="submit" disabled={loading} className={submitCls}>
                    {loading ? "Creating your account…" : "Create organization →"}
                  </button>
                </form>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// ── shared helpers ────────────────────────────────────────────────────────────

const inputCls =
  "h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20";

const submitCls =
  "mt-2 h-11 w-full rounded-xl bg-white text-sm font-semibold text-black transition hover:bg-zinc-100 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-zinc-400">{label}</label>
      {children}
    </div>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400 ring-1 ring-red-500/20">
      {children}
    </p>
  );
}

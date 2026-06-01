"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { features } from "@/data/constants";
import toast from "react-hot-toast";

function OtpInput({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const inputs = useRef<(HTMLInputElement | null)[]>([]);
    const digits = value.padEnd(6, " ").split("").slice(0, 6);

    function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Backspace" && !digits[i].trim() && i > 0) {
            inputs.current[i - 1]?.focus();
        }
    }

    function handleChange(i: number, e: React.ChangeEvent<HTMLInputElement>) {
        const val = e.target.value.replace(/\D/g, "").slice(-1);
        const next = digits.map((d, idx) => (idx === i ? val : d)).join("").replace(/ /g, "");
        onChange(next);
        if (val && i < 5) inputs.current[i + 1]?.focus();
    }

    function handlePaste(e: React.ClipboardEvent) {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted) {
            onChange(pasted);
            inputs.current[Math.min(pasted.length, 5)]?.focus();
        }
        e.preventDefault();
    }

    return (
        <div className="flex gap-3 justify-center">
            {Array.from({ length: 6 }).map((_, i) => (
                <input
                    key={i}
                    ref={(el) => { inputs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digits[i] === " " ? "" : digits[i]}
                    onChange={(e) => handleChange(i, e)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className="h-12 w-12 rounded-xl border border-zinc-800 bg-zinc-950 text-center text-lg font-semibold text-white outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 caret-transparent"
                />
            ))}
        </div>
    );
}



// ── page ──────────────────────────────────────────────────────────────────────

export default function LoginPage() {
    const router = useRouter();

    const [mode, setMode] = useState<"password" | "otp">("password");
    const [otpSent, setOtpSent] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function switchMode(next: "password" | "otp") {
        setMode(next);
        setOtpSent(false);
        setOtp("");
        setError("");
    }

    // ── password login ────────────────────────────────────────────────────────

    async function handlePasswordLogin(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const result = await signIn("credentials", { email, password, redirect: false });
            if (result?.error) { setError("Invalid email or password."); return; }

            toast.success("Login successful!");
            router.push("/dashboard");
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    // ── send OTP ──────────────────────────────────────────────────────────────

    async function handleSendOtp(e?: React.FormEvent) {
        e?.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/otp/send-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error ?? "Failed to send OTP"); return; }
            setOtpSent(true);
            toast.success("OTP sent to your email");
            setOtp("");
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    // ── OTP login ─────────────────────────────────────────────────────────────

    async function handleOtpLogin(e: React.FormEvent) {
        e.preventDefault();
        if (otp.length < 6) { setError("Please enter all 6 digits"); return; }
        setError("");
        setLoading(true);
        try {
            const result = await signIn("otp", { email, otp, redirect: false });
            if (result?.error) { setError("Invalid or expired OTP. Please try again."); return; }
            toast.success("Login successful!");
            router.push("/dashboard");
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
                            Welcome back to
                            <br />
                            <span className="text-zinc-400">your workspace.</span>
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

                    <p className="relative text-xs text-zinc-600">
                        Secure login for your organization.
                    </p>
                </div>

                {/* right panel */}
                <div className="flex flex-col justify-center bg-zinc-900 px-8 py-10 md:px-12">
                    <div className="mx-auto w-full max-w-sm">

                        {/* back button when OTP code was sent */}
                        {otpSent && (
                            <button
                                onClick={() => { setOtpSent(false); setOtp(""); setError(""); }}
                                className="mb-6 flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" /> Back
                            </button>
                        )}

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold tracking-tight">
                                {otpSent ? "Check your email" : "Sign in"}
                            </h2>
                            <p className="mt-1.5 text-sm text-zinc-400">
                                {otpSent
                                    ? <>We sent a 6-digit code to <span className="font-medium text-white">{email}</span>.</>
                                    : "Access your NunaCards dashboard."}
                            </p>
                        </div>

                        {/* mode toggle — hidden once OTP is sent */}
                        {!otpSent && (
                            <div className="mb-6 flex rounded-xl bg-zinc-950 p-1">
                                <button
                                    type="button"
                                    onClick={() => switchMode("password")}
                                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${mode === "password" ? "bg-white text-black" : "text-zinc-400 hover:text-zinc-200"}`}
                                >
                                    Password
                                </button>
                                <button
                                    type="button"
                                    onClick={() => switchMode("otp")}
                                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${mode === "otp" ? "bg-white text-black" : "text-zinc-400 hover:text-zinc-200"}`}
                                >
                                    OTP
                                </button>
                            </div>
                        )}

                        {/* ── password form ── */}
                        {mode === "password" && !otpSent && (
                            <form onSubmit={handlePasswordLogin} className="space-y-4">
                                <Field label="Email address">
                                    <input
                                        type="email"
                                        placeholder="you@company.com"
                                        value={email}
                                        required
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={inputCls}
                                    />
                                </Field>

                                <Field label="Password">
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter password"
                                            value={password}
                                            required
                                            onChange={(e) => setPassword(e.target.value)}
                                            className={`${inputCls} pr-11`}
                                        />
                                        <button
                                            type="button"
                                            tabIndex={-1}
                                            onClick={() => setShowPassword((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </Field>

                                {error && <ErrorBox>{error}</ErrorBox>}

                                <button type="submit" disabled={loading} className={submitCls}>
                                    {loading ? "Signing in…" : "Sign in →"}
                                </button>
                            </form>
                        )}

                        {/* ── OTP: send step ── */}
                        {mode === "otp" && !otpSent && (
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <Field label="Email address">
                                    <input
                                        type="email"
                                        placeholder="you@company.com"
                                        value={email}
                                        required
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={inputCls}
                                    />
                                </Field>

                                {error && <ErrorBox>{error}</ErrorBox>}

                                <button type="submit" disabled={loading} className={submitCls}>
                                    {loading ? "Sending code…" : "Send verification code →"}
                                </button>
                            </form>
                        )}

                        {/* ── OTP: verify step ── */}
                        {mode === "otp" && otpSent && (
                            <form onSubmit={handleOtpLogin} className="space-y-6">
                                <OtpInput value={otp} onChange={(v) => { setOtp(v); setError(""); }} />

                                {error && <ErrorBox>{error}</ErrorBox>}

                                <button type="submit" disabled={loading || otp.length < 6} className={submitCls}>
                                    {loading ? "Verifying…" : "Verify & sign in →"}
                                </button>

                                <p className="text-center text-sm text-zinc-500">
                                    Didn&apos;t receive it?{" "}
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        className="font-medium text-white hover:underline"
                                    >
                                        Resend
                                    </button>
                                </p>
                            </form>
                        )}

                        <p className="mt-6 text-center text-sm text-zinc-500">
                            Don&apos;t have an account?{" "}
                            <Link href="/signup" className="font-medium text-white hover:underline">
                                Create one
                            </Link>
                        </p>

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

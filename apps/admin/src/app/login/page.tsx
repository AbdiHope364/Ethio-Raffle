"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, User, KeyRound, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"CREDENTIALS" | "MFA">("CREDENTIALS");
  const [identifier, setIdentifier] = useState("+251911000000");
  const [password, setPassword] = useState("admin123");
  const [tempToken, setTempToken] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed.");
      }

      if (data.requiresMfa) {
        setTempToken(data.tempToken);
        setMaskedPhone(data.maskedPhone);
        if (data.debugOtp) {
          setDebugOtp(data.debugOtp);
          setOtpCode(data.debugOtp);
        }
        setStep("MFA");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken, otpCode }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid MFA verification code.");
      }

      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-950 border border-indigo-700/60 text-indigo-400 flex items-center justify-center mx-auto">
            {step === "CREDENTIALS" ? <Lock className="w-7 h-7" /> : <KeyRound className="w-7 h-7" />}
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">
            LuckyEthio Admin Governance Console
          </h1>
          <p className="text-xs text-slate-400">
            {step === "CREDENTIALS"
              ? "Enterprise authentication with granular Role-Based Access Control (RBAC)"
              : `Enter the 6-digit MFA OTP sent to your registered terminal (${maskedPhone})`}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === "CREDENTIALS" ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Administrator Identifier (Phone / Email)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="+251911000000"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              {loading ? <span>Verifying Credentials...</span> : <span>Proceed to Step 2 (MFA) &rarr;</span>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMfaSubmit} className="space-y-4">
            {debugOtp && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between">
                <span>Sandbox Simulated OTP:</span>
                <span className="font-mono font-bold tracking-widest text-emerald-200">{debugOtp}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 text-center">
                6-Digit MFA Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full text-center py-3 rounded-xl border border-slate-700 bg-slate-800 text-xl font-mono tracking-widest text-white focus:outline-none focus:border-indigo-500 font-black"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
            >
              {loading ? <span>Verifying OTP...</span> : <span>Confirm &amp; Access Admin Console</span>}
            </button>

            <button
              type="button"
              onClick={() => setStep("CREDENTIALS")}
              className="w-full text-xs text-slate-400 hover:text-slate-200 py-1"
            >
              &larr; Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}


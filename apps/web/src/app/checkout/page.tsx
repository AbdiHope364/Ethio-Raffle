"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import {
  Smartphone,
  Building,
  CreditCard,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Ticket,
  ArrowRight,
  Sparkles,
  Clock,
  AlertTriangle,
} from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";

function CheckoutContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();

  const txRef = searchParams.get("tx_ref");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1-Hour countdown state
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number }>({
    minutes: 59,
    seconds: 59,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const target = Date.now() + 60 * 60 * 1000;
    const interval = setInterval(() => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0 });
        setIsExpired(true);
      } else {
        setTimeLeft({
          minutes: Math.floor(diff / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSimulate = async (status: "SUCCESS" | "FAILED") => {
    if (!txRef) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/payments/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txRef, simulateStatus: status }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || data.message || "Payment simulation failed");
      } else {
        setResult(data.result);
        confetti({ particleCount: 80, spread: 70 });
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  if (!txRef) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-slate-900">Invalid Checkout Session</h2>
        <p className="text-xs text-slate-500">Missing transaction reference.</p>
        <Link
          href="/"
          className="inline-flex px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Secure Ethiopian Payment Gateway</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t.checkout.title}
        </h1>
        <p className="text-xs text-slate-500 font-mono">Reference: {txRef}</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {!result ? (
          <div className="space-y-6">
            {/* Live 1-Hour Hold Countdown */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                isExpired
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isExpired ? (
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-600 animate-pulse shrink-0" />
                )}
                <div>
                  <span className="text-xs font-extrabold block">
                    {isExpired ? "Booking Expired" : "1-Hour Hold Active"}
                  </span>
                  <span className="text-[11px] opacity-80 block">
                    {isExpired
                      ? "Hold has expired. Numbers returned to pool."
                      : "Your numbers are reserved until countdown ends."}
                  </span>
                </div>
              </div>

              <div className="font-mono">
                <span
                  className={`text-base font-black px-2.5 py-1 rounded-xl ${
                    isExpired ? "bg-red-200 text-red-900" : "bg-amber-200 text-amber-950"
                  }`}
                >
                  {String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-700">
                <span>Transaction Ref:</span>
                <span className="font-mono text-emerald-700">{txRef}</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                In a live environment, you are redirected to the selected gateway (Telebirr USSD push, CBE Birr mobile app, or Chapa card portal). In sandbox mode, click below to simulate the instant payment callback.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                disabled={loading || isExpired}
                onClick={() => handleSimulate("SUCCESS")}
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? "Confirming..." : isExpired ? "Expired" : "Simulate Payment Success"}</span>
              </button>

              <button
                disabled={loading}
                onClick={() => handleSimulate("FAILED")}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <XCircle className="w-4 h-4 text-red-500" />
                <span>Simulate Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-black text-xl text-slate-900">
                Payment Received & Tickets Minted!
              </h3>
              <p className="text-xs text-slate-500">
                Official ticket SMS confirmation has been dispatched.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Assigned Ticket Numbers
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {result.tickets?.map((tkt: any) => (
                  <div
                    key={tkt.ticketNumber}
                    className="bg-white p-2.5 rounded-xl border border-emerald-200 text-center shadow-xs"
                  >
                    <span className="text-lg font-black text-emerald-700 font-mono">
                      #{tkt.ticketNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {tkt.verificationCode}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => router.push("/my-tickets")}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-md"
            >
              <Ticket className="w-4 h-4 text-emerald-400" />
              <span>Go to My Tickets Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-400">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}

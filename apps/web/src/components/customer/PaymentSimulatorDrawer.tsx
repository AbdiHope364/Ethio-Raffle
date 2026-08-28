"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import {
  CheckCircle2,
  XCircle,
  Smartphone,
  ShieldCheck,
  QrCode,
  Ticket,
  Copy,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import confetti from "canvas-confetti";

interface PaymentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  txRef: string;
  amount: number;
  paymentMethod: string;
  raffleTitle: string;
  customerPhone: string;
  ticketCount: number;
}

export default function PaymentSimulatorDrawer({
  isOpen,
  onClose,
  txRef,
  amount,
  paymentMethod,
  raffleTitle,
  customerPhone,
  ticketCount,
}: PaymentDrawerProps) {
  const { t } = useI18n();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulatePayment = async (status: "SUCCESS" | "FAILED") => {
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
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-8 shadow-2xl border border-slate-200 space-y-5 sm:space-y-6 relative overflow-y-auto max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {paymentMethod} Gateway
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Ref: {txRef}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1"
          >
            ×
          </button>
        </div>

        {/* Not Completed State */}
        {!result && (
          <div className="space-y-5">
            {/* Payment Summary Box */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Raffle:</span>
                <span className="font-bold text-slate-900 text-right">{raffleTitle}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Tickets:</span>
                <span className="font-bold text-slate-900">{ticketCount} Ticket(s)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Customer Mobile:</span>
                <span className="font-bold text-slate-900 font-mono">{customerPhone}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-700">Amount Due:</span>
                <span className="text-2xl font-black text-emerald-700 font-mono">
                  {amount.toLocaleString()} ETB
                </span>
              </div>
            </div>

            {/* Gateway UI Simulation Notice */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Simulated Ethiopian Payment Flow</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                In production, customer receives a Telebirr USSD push or Chapa checkout prompt. Click below to simulate the instant payment callback & ticket minting.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs border border-red-200 flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Simulator Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                disabled={loading}
                onClick={() => handleSimulatePayment("SUCCESS")}
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? "Processing..." : "Approve & Mint"}</span>
              </button>

              <button
                disabled={loading}
                onClick={() => handleSimulatePayment("FAILED")}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <XCircle className="w-4 h-4 text-red-500" />
                <span>Simulate Failure</span>
              </button>
            </div>
          </div>
        )}

        {/* Success State */}
        {result && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-black text-xl text-slate-900">
                Payment & Ticketing Complete!
              </h4>
              <p className="text-xs text-slate-500">
                Official ticket confirmation has been minted and dispatched to <strong className="text-slate-800">{customerPhone}</strong>.
              </p>
            </div>

            {/* Ticket Numbers Cards */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Minted Ticket(s)</span>
                <span className="text-emerald-700 font-mono">Status: CONFIRMED</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {result.tickets?.map((tkt: any) => (
                  <div
                    key={tkt.id || tkt.ticketNumber}
                    className="bg-white p-2.5 rounded-xl border border-emerald-200 shadow-xs flex flex-col items-center justify-center text-center"
                  >
                    <span className="text-lg font-black text-emerald-700">
                      #{tkt.ticketNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {tkt.verificationCode}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Button */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  onClose();
                  router.push("/my-tickets");
                }}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-md"
              >
                <Ticket className="w-4 h-4 text-emerald-400" />
                <span>View in My Tickets Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import {
  Store,
  Wallet,
  Percent,
  TrendingUp,
  Ticket,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ArrowRight,
  RefreshCw,
  PlusCircle,
} from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";

export default function AgentPOSPage() {
  const { t, language } = useI18n();

  const [agent, setAgent] = useState<any>(null);
  const [raffles, setRaffles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedRaffleId, setSelectedRaffleId] = useState("");
  const [customerPhone, setCustomerPhone] = useState("+2519");
  const [ticketCount, setTicketCount] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [saleResult, setSaleResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchAgentData();
  }, []);

  const fetchAgentData = async () => {
    try {
      setLoading(true);
      const [agentRes, rafflesRes] = await Promise.all([
        fetch("/api/agents"),
        fetch("/api/raffles?status=ACTIVE"),
      ]);

      const agentData = await agentRes.json();
      const rafflesData = await rafflesRes.json();

      if (agentData.agent) {
        setAgent(agentData.agent);
      }
      if (rafflesData.raffles) {
        setRaffles(rafflesData.raffles);
        if (rafflesData.raffles.length > 0) {
          setSelectedRaffleId(rafflesData.raffles[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSaleResult(null);

    try {
      const res = await fetch("/api/agents/pos-sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raffleId: selectedRaffleId,
          customerPhone,
          ticketCount,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to complete ticket sale");
      } else {
        setSaleResult(data);
        confetti({ particleCount: 70, spread: 60 });
        // Refresh agent balance
        fetchAgentData();
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRaffle = raffles.find((r) => r.id === selectedRaffleId);
  const totalCost = selectedRaffle ? selectedRaffle.ticketPrice * ticketCount : 0;
  const estimatedCommission = agent
    ? (totalCost * agent.commissionRate) / 100
    : 0;

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-semibold">Loading Agent POS Terminal...</p>
      </div>
    );
  }

  // If user is pending agent approval
  if (agent && agent.status === "PENDING") {
    return (
      <div className="bg-white rounded-3xl border border-amber-200 p-8 max-w-lg mx-auto text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">
          Agent Account Pending Approval
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          {t.agent.pendingApproval} An Admin must review your national ID and signed agreement before sales can be unlocked.
        </p>
        <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 font-mono">
          Agent Phone: {agent.user?.phone || agent.fullName}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner: Metrics & Float */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Authorized Kiosk POS
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {agent?.id?.substring(0, 8)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {agent?.businessName || agent?.fullName || "Agent POS Terminal"}
            </h1>
            <p className="text-xs text-slate-400">
              Region: <strong className="text-slate-200">{agent?.region || "Addis Ababa"}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/agent/wallet"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition shadow-md flex items-center gap-1.5"
            >
              <Wallet className="w-4 h-4" />
              <span>{t.agent.topUpFloat}</span>
            </Link>

            <Link
              href="/agent/ussd-simulator"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5"
            >
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>USSD Offline Mode</span>
            </Link>
          </div>
        </div>

        {/* Float & Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                {t.agent.floatBalance}
              </span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {agent?.floatBalance ? agent.floatBalance.toLocaleString() : "0"} ETB
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                {t.agent.commissionRate}
              </span>
              <span className="text-xl font-black text-blue-300">
                {agent?.commissionRate || 5}% / sale
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Daily Sales Limit
              </span>
              <span className="text-xl font-black text-purple-300 font-mono">
                {agent?.dailySalesLimit ? agent.dailySalesLimit.toLocaleString() : "50,000"} ETB
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* POS Quick Sale Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-black text-slate-900">
                {t.agent.quickSale}
              </h2>
            </div>
            <span className="text-xs text-slate-400">Cash Payment on Behalf</span>
          </div>

          <form onSubmit={handleSale} className="space-y-5">
            {/* Raffle Picker */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {t.agent.selectRaffle}
              </label>
              <select
                value={selectedRaffleId}
                onChange={(e) => setSelectedRaffleId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
              >
                {raffles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.ticketPrice} ETB / ticket) — {r.totalTickets - r.soldTickets} left
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Phone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {t.agent.customerPhone}
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+251911223344"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Customer receives instant verification SMS with ticket codes & draw rules.
              </p>
            </div>

            {/* Ticket Count Buttons */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                {t.agent.ticketCount}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 5, 10].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setTicketCount(qty)}
                    className={`py-2 rounded-xl text-xs font-black transition ${
                      ticketCount === qty
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {qty}
                  </button>
                ))}
              </div>
            </div>

            {/* Price & Float Preview Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Cash to Collect from Customer:</span>
                <span className="font-bold text-slate-900 text-sm">{totalCost.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Agent Commission to Earn ({agent?.commissionRate || 5}%):</span>
                <span>+ {estimatedCommission.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                <span>Float Deduction from Agent Balance:</span>
                <span className="font-mono text-red-600 font-bold">- {totalCost.toLocaleString()} ETB</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? "Minting Tickets..." : t.agent.collectCash}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Instant Sale Receipt */}
        <div className="lg:col-span-5 space-y-6">
          {saleResult ? (
            <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-7 shadow-lg space-y-5 animate-in fade-in">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-black text-lg text-slate-900">
                  Sale Successful & Dispatched!
                </h3>
                <p className="text-xs text-slate-500">
                  SMS Ticket confirmation dispatched to {customerPhone}.
                </p>
              </div>

              {/* Minted Tickets */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Minted Ticket Numbers
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {saleResult.tickets?.map((tkt: any) => (
                    <div
                      key={tkt.ticketNumber}
                      className="bg-white p-2.5 rounded-xl border border-slate-200 text-center shadow-xs"
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

              {/* Actions */}
              <button
                onClick={() => {
                  setSaleResult(null);
                  setCustomerPhone("+2519");
                }}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
              >
                Sell Next Customer
              </button>
            </div>
          ) : (
            <div className="bg-slate-100/70 rounded-3xl border border-slate-200 p-8 text-center space-y-3">
              <QrCode className="w-12 h-12 text-slate-400 mx-auto" />
              <h4 className="font-extrabold text-slate-700 text-sm">
                Ready for Walk-in Customer
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter the customer's phone number, select ticket quantity, collect cash, and mint tickets instantly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


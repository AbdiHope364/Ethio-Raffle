"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  Smartphone,
  FileText,
  RotateCcw,
} from "lucide-react";

export default function AgentWalletPage() {
  const { t, language } = useI18n();

  const [agent, setAgent] = useState<any>(null);
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Top-Up Modal State
  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState("5000");
  const [topupRef, setTopupRef] = useState("");
  const [topupMethod, setTopupMethod] = useState("CBE_BIRR");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/agents/wallet");
      const data = await res.json();
      if (data.agent) {
        setAgent(data.agent);
        setLedger(data.ledger || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/agents/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(topupAmount),
          actionType: "TOPUP",
          referenceId: topupRef || `BANK-DEP-${Date.now().toString().slice(-6)}`,
          note: `Agent float top-up via ${topupMethod}`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsTopupOpen(false);
        setTopupRef("");
        fetchWallet();
      } else {
        alert(data.error || "Top-up failed");
      }
    } catch (e: any) {
      alert(e.message || "Failed to submit top-up");
    } finally {
      setSubmitting(false);
    }
  };

  const getEntryBadge = (type: string) => {
    switch (type) {
      case "TOPUP":
        return <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-200 dark:border-emerald-800"><ArrowDownLeft className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> TOPUP</span>;
      case "SALE_DEDUCTION":
        return <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1 border border-slate-200 dark:border-slate-700"><ArrowUpRight className="w-3 h-3 text-slate-500" /> SALE</span>;
      case "COMMISSION_ACCRUED":
        return <span className="bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-[10px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1 border border-blue-200 dark:border-blue-800"><CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400" /> COMMISSION</span>;
      case "PAYOUT":
        return <span className="bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 text-[10px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1 border border-purple-200 dark:border-purple-800"><Wallet className="w-3 h-3 text-purple-600 dark:text-purple-400" /> PAYOUT</span>;
      default:
        return <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold px-2 py-0.5 rounded">{type}</span>;
    }
  };

  return (
    <div className="space-y-8 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Wallet className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>{t.agent.ledgerTitle}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time audit ledger of all float top-ups, customer ticket sales deductions, and accrued commissions.
          </p>
        </div>

        <button
          onClick={() => setIsTopupOpen(true)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition shadow-md flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.agent.topUpFloat}</span>
        </button>
      </div>

      {/* Float Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-2 transition-colors">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {t.agent.floatBalance}
          </span>
          <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono tracking-tight">
            {agent?.floatBalance ? agent.floatBalance.toLocaleString() : "0"} <span className="text-base text-slate-600 dark:text-slate-400">ETB</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
            Mode: <strong className="text-slate-800 dark:text-slate-200">{agent?.walletMode || "PREPAID"}</strong>
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-2 transition-colors">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {t.agent.commissionRate}
          </span>
          <div className="text-3xl font-black text-blue-700 dark:text-blue-400 tracking-tight">
            {agent?.commissionRate || 5.0}%
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
            Auto-accrued per customer sale
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-2 transition-colors">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Daily Exposure Limit
          </span>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            {agent?.dailySalesLimit ? agent.dailySalesLimit.toLocaleString() : "50,000"} <span className="text-base text-slate-600 dark:text-slate-400">ETB</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
            Admin configured risk ceiling
          </span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            Transaction Activity History
          </h3>
          <span className="text-xs text-slate-400">{ledger.length} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">{t.agent.entryType}</th>
                <th className="py-3 px-4">{t.agent.amount}</th>
                <th className="py-3 px-4">{t.agent.balanceAfter}</th>
                <th className="py-3 px-4">{t.agent.reference}</th>
                <th className="py-3 px-4">Note</th>
                <th className="py-3 px-4 text-right">{t.agent.date}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading ledger...
                  </td>
                </tr>
              ) : ledger.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                ledger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4">{getEntryBadge(entry.entryType)}</td>
                    <td className={`py-3.5 px-4 font-mono font-bold ${
                      entry.amount > 0 ? "text-emerald-700 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                    }`}>
                      {entry.amount > 0 ? `+${entry.amount.toLocaleString()}` : entry.amount.toLocaleString()} ETB
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {entry.balanceAfter.toLocaleString()} ETB
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {entry.referenceId || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {entry.note || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400 text-[11px]">
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top-up Float Modal */}
      {isTopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 relative transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Top-up Agent Float</span>
              </h3>
              <button
                onClick={() => setIsTopupOpen(false)}
                className="text-slate-400 hover:text-slate-800 dark:hover:text-white text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleTopup} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Deposit Amount (ETB)
                </label>
                <input
                  type="number"
                  required
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm font-mono font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Payment Source
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTopupMethod("CBE_BIRR")}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      topupMethod === "CBE_BIRR"
                        ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-600 dark:border-emerald-500 ring-1 ring-emerald-600"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <Building className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>CBE Birr</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTopupMethod("TELEBIRR")}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      topupMethod === "TELEBIRR"
                        ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-600 dark:border-emerald-500 ring-1 ring-emerald-600"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Telebirr</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Bank / Telebirr Transaction Reference
                </label>
                <input
                  type="text"
                  value={topupRef}
                  onChange={(e) => setTopupRef(e.target.value)}
                  placeholder="e.g. FT2608... or CBE-DEP-889"
                  className="w-full px-3 py-2.5 text-xs font-mono rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition shadow-md"
              >
                {submitting ? "Crediting Float..." : "Confirm Top-Up"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

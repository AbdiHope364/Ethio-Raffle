"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@raffle/shared";
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Building,
  Smartphone,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

export default function AdminFinancialsPage() {
  const { t, language } = useI18n();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"TX" | "AGENT">("TX");

  useEffect(() => {
    fetchFinancials();
  }, []);

  const fetchFinancials = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/financials");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Wallet className="w-7 h-7 text-purple-400" />
            <span>{t.admin.financialLedger}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System-wide cash reconciliation, payment gateway transactions, and agent commission settlement ledger.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Gross Ticket Revenue
          </span>
          <div className="text-2xl font-black text-white font-mono">
            {data?.summary?.totalGrossRevenue.toLocaleString() || "0"} <span className="text-sm font-bold text-slate-500">ETB</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold block">
            All gateway receipts
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Commission Liabilities
          </span>
          <div className="text-2xl font-black text-blue-400 font-mono">
            {data?.summary?.totalCommissionLiabilities.toLocaleString() || "0"} <span className="text-sm font-bold text-slate-500">ETB</span>
          </div>
          <span className="text-[11px] text-blue-400 font-semibold block">
            Accrued to agent kiosks
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Agent Float in Circulation
          </span>
          <div className="text-2xl font-black text-purple-400 font-mono">
            {data?.summary?.totalFloatInCirculation.toLocaleString() || "0"} <span className="text-sm font-bold text-slate-500">ETB</span>
          </div>
          <span className="text-[11px] text-purple-400 font-semibold block">
            Active pre-paid balances
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Net Platform Margins
          </span>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {data?.summary?.netPlatformProfit.toLocaleString() || "0"} <span className="text-sm font-bold text-slate-500">ETB</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold block">
            Gross minus agent payout
          </span>
        </div>
      </div>

      {/* Ledger Tables Toggle */}
      <div className="space-y-4">
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold w-fit">
          <button
            onClick={() => setActiveTab("TX")}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === "TX"
                ? "bg-purple-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Payment Gateway Transactions ({data?.transactions?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("AGENT")}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === "AGENT"
                ? "bg-purple-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Agent Float & Commission Ledger ({data?.agentLedgers?.length || 0})
          </button>
        </div>

        {activeTab === "TX" ? (
          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">TX Ref</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Raffle</th>
                    <th className="py-3 px-4">Gateway</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        Loading transactions...
                      </td>
                    </tr>
                  ) : (
                    data?.transactions?.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-purple-300">
                          {tx.txRef}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {tx.customerPhone || tx.user?.phone || "—"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                          {tx.raffle?.title}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold text-[10px]">
                            {tx.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                          {tx.amount.toLocaleString()} ETB
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-400 font-mono text-[11px]">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Agent Name</th>
                    <th className="py-3 px-4">Entry Type</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Balance After</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Note</th>
                    <th className="py-3 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data?.agentLedgers?.map((entry: any) => (
                    <tr key={entry.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {entry.agent?.fullName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-slate-700">
                          {entry.entryType}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 font-mono font-bold ${
                        entry.amount > 0 ? "text-emerald-400" : "text-slate-300"
                      }`}>
                        {entry.amount > 0 ? `+${entry.amount.toLocaleString()}` : entry.amount.toLocaleString()} ETB
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                        {entry.balanceAfter.toLocaleString()} ETB
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                        {entry.referenceId || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                        {entry.note || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400 font-mono text-[11px]">
                        {new Date(entry.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


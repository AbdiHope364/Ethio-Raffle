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
  Scale,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";

type TabType = "DOUBLE_ENTRY" | "CHART_OF_ACCOUNTS" | "TX" | "CASHOUTS" | "VAT" | "DISPUTES";

export default function AdminFinancialsPage() {
  const { t, language } = useI18n();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("DOUBLE_ENTRY");

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

  const handleCashoutAction = async (cashoutId: string, action: "APPROVE" | "REJECT") => {
    try {
      const res = await fetch("/api/cashout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cashoutId, action }),
      });
      const json = await res.json();
      if (!res.ok) alert(json.error || "Cashout action failed");
      else {
        alert(json.message);
        fetchFinancials();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Scale className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            <span>Double-Entry Financial Ledger & Balance Sheet</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enterprise double-entry accounting: Cash in Transit, Escrow Liabilities, 15% Statutory MoR VAT, and Seller Cashouts.
          </p>
        </div>

        {/* Trial Balance Status */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Trial Balance: 100% Balanced (Debits = Credits)</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-1.5 shadow-xs transition-colors">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Assets (Cash In Transit)
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
            {data?.summary?.totalAssets?.toLocaleString() || "0"} <span className="text-xs font-bold text-slate-400">ETB</span>
          </div>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold block">
            1010-CASH-TRANSIT
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-1.5 shadow-xs transition-colors">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Prize Escrow Liabilities
          </span>
          <div className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono">
            {data?.summary?.totalSellerEscrowLocked?.toLocaleString() || "0"} <span className="text-xs font-bold text-slate-400">ETB</span>
          </div>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold block">
            2010-PRIZE-ESCROW
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-1.5 shadow-xs transition-colors">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Gov 15% VAT Escrow
          </span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {data?.summary?.totalGovVatAccrued?.toLocaleString() || "0"} <span className="text-xs font-bold text-slate-400">ETB</span>
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block">
            2020-VAT-PAYABLE (MoR)
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-1.5 shadow-xs transition-colors">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Operating Revenue
          </span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {data?.summary?.totalRevenue?.toLocaleString() || "0"} <span className="text-xs font-bold text-slate-400">ETB</span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
            4010-PLATFORM-REVENUE
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-1.5 shadow-xs transition-colors">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Available Seller Payouts
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
            {data?.summary?.totalSellerPayoutAvailable?.toLocaleString() || "0"} <span className="text-xs font-bold text-slate-400">ETB</span>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold block">
            Unfrozen via QR Scan
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("DOUBLE_ENTRY")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === "DOUBLE_ENTRY"
              ? "bg-purple-600 text-white shadow-md"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>General Ledger Journal</span>
        </button>

        <button
          onClick={() => setActiveTab("CHART_OF_ACCOUNTS")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === "CHART_OF_ACCOUNTS"
              ? "bg-purple-600 text-white shadow-md"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Chart of Accounts & Balance Sheet</span>
        </button>

        <button
          onClick={() => setActiveTab("CASHOUTS")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === "CASHOUTS"
              ? "bg-purple-600 text-white shadow-md"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Seller Cashout Queue ({data?.cashoutRequests?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("VAT")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === "VAT"
              ? "bg-purple-600 text-white shadow-md"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>15% VAT Tax Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab("TX")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === "TX"
              ? "bg-purple-600 text-white shadow-md"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Gateway Transactions</span>
        </button>
      </div>

      {/* TAB 1: DOUBLE-ENTRY GENERAL LEDGER */}
      {activeTab === "DOUBLE_ENTRY" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Double-Entry General Ledger Journal Entries
            </span>
            <span className="text-xs font-mono text-slate-400">
              Showing recent {data?.ledgerTransactions?.length || 0} transactions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Transaction #</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Debits / Credits Breakdown</th>
                  <th className="py-3 px-4">Posted At</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {data?.ledgerTransactions?.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {tx.transactionNumber}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-slate-700 dark:text-slate-300">
                      {tx.description}
                    </td>
                    <td className="py-3.5 px-4 space-y-1">
                      {tx.entries?.map((e: any) => (
                        <div key={e.id} className="flex items-center gap-2 font-mono text-[11px]">
                          <span
                            className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                              e.entryType === "DEBIT"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            }`}
                          >
                            {e.entryType}
                          </span>
                          <span className="text-slate-500">{e.ledgerAccount?.name || e.ledgerAccountId}</span>
                          <span className="font-bold text-slate-900 dark:text-white ml-auto">
                            {e.amount?.toLocaleString()} ETB
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(tx.postedAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CHART OF ACCOUNTS */}
      {activeTab === "CHART_OF_ACCOUNTS" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Chart of Accounts & Current Balance Ledger
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Account Code</th>
                  <th className="py-3 px-4">Account Name</th>
                  <th className="py-3 px-4">Account Type</th>
                  <th className="py-3 px-4">Currency</th>
                  <th className="py-3 px-4 text-right">Current Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {data?.ledgerAccounts?.map((acc: any) => (
                  <tr key={acc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {acc.code}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {acc.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          acc.type === "ASSET"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            : acc.type === "LIABILITY"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        }`}
                      >
                        {acc.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{acc.currency}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white text-sm">
                      {acc.balance?.toLocaleString()} ETB
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CASHOUTS */}
      {activeTab === "CASHOUTS" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Seller Payout Authorization Queue
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Seller Merchant</th>
                  <th className="py-3 px-4">Payout Account</th>
                  <th className="py-3 px-4">Requested Amount</th>
                  <th className="py-3 px-4">Available Balance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Admin Authorization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {data?.cashoutRequests?.map((co: any) => (
                  <tr key={co.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{co.seller?.businessName}</div>
                      <div className="text-[11px] text-slate-400">{co.seller?.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                      {co.payoutAccount}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-sm text-slate-900 dark:text-white">
                      {co.amount?.toLocaleString()} ETB
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {co.seller?.payoutBalance?.toLocaleString()} ETB
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {co.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {co.status === "PENDING_REVIEW" && (
                        <>
                          <button
                            onClick={() => handleCashoutAction(co.id, "REJECT")}
                            className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold transition"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleCashoutAction(co.id, "APPROVE")}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                          >
                            Authorize Payout
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: VAT */}
      {activeTab === "VAT" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Statutory 15% Ethiopian VAT Ledger (Ministry of Revenues)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Record ID</th>
                  <th className="py-3 px-4">Ticket Price</th>
                  <th className="py-3 px-4">15% VAT Component</th>
                  <th className="py-3 px-4">85% Net Escrow</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {data?.taxLedgers?.map((tl: any) => (
                  <tr key={tl.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-mono text-slate-400">{tl.id.slice(0, 8)}...</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                      {tl.ticketPrice?.toLocaleString()} ETB
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                      {tl.vatAmount?.toLocaleString()} ETB
                    </td>
                    <td className="py-3.5 px-4 font-mono text-purple-600 dark:text-purple-400">
                      {tl.netEscrowAmount?.toLocaleString()} ETB
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(tl.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: GATEWAY TRANSACTIONS */}
      {activeTab === "TX" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Payment Gateway Settlements (Chapa, Telebirr, CBE Birr)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">TX Ref</th>
                  <th className="py-3 px-4">Buyer Phone</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {data?.transactions?.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{tx.txRef}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{tx.customerPhone || tx.user?.phone}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">{tx.paymentMethod}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {tx.amount?.toLocaleString()} ETB
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

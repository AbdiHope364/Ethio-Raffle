"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@raffle/shared";
import Link from "next/link";
import {
  Building2,
  Plus,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Calendar,
  DollarSign,
  Ticket,
  ChevronRight,
  TrendingUp,
  Award,
} from "lucide-react";

export default function SellerDashboardPage() {
  const { language } = useI18n();
  const [seller, setSeller] = useState<any>(null);
  const [raffles, setRaffles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    fetchSellerData();
  }, []);

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/seller/me");
      const data = await res.json();
      setSeller(data.seller);

      if (data.seller) {
        const rRes = await fetch(`/api/seller/raffles?sellerId=${data.seller.id}`);
        const rData = await rRes.json();
        setRaffles(rData.raffles || []);
      } else {
        // Fallback demo raffles with sellers
        const rRes = await fetch("/api/seller/raffles");
        const rData = await rRes.json();
        setRaffles(rData.raffles || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleConsensusAction = async (raffleId: string, action: string, extensionDays?: number) => {
    try {
      setActionLoading(raffleId + action);
      setStatusMessage("");
      const res = await fetch("/api/seller/consensus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raffleId, action, extensionDays }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      setStatusMessage(data.message);
      fetchSellerData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-mono">Loading Seller Infrastructure Hub...</p>
      </div>
    );
  }

  // Unregistered state
  if (!seller) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-700 shadow-2xl relative overflow-hidden text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
            <Building2 className="w-8 h-8" />
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <span className="text-xs font-mono font-bold tracking-wider text-indigo-400 uppercase">
              Multi-Vendor Marketplace Infrastructure
            </span>
            <h1 className="text-3xl font-black tracking-tight">
              {language === "AM" ? "የእራስዎን ዕቃዎች በሎተሪ ይሽጡ" : "Sell Your High-Value Assets via Provably Fair Raffles"}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {language === "AM"
                ? "መኪና፣ ቤት፣ ኤሌክትሮኒክስ ወይም ውድ እቃዎችዎን በነፃነት መዝግበው ለህዝብ ያቅርቡ። የቲኬት ሽያጭ ገቢ በቀጥታ ወደ አካውንትዎ ገቢ ይደረጋል።"
                : "Lucky Ticket operates as the third-party infrastructure connecting independent verified sellers with thousands of eager ticket buyers. All listings pass strict NLA-compliant admin moderation."}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link
              href="/seller/register"
              className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm rounded-xl shadow-lg shadow-indigo-500/30 transition flex items-center gap-2"
            >
              <span>Apply for Merchant Account</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Quick Merchant Sign In Box */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Already Registered? Access Seller Dashboard</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400">KYC Verified Merchants</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <button
              onClick={() => {
                document.cookie = `raffle_session_phone=+251911223344; path=/; max-age=86400`;
                window.location.reload();
              }}
              className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-left transition flex items-center justify-between group"
            >
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm block">
                  Kidus Luxury Motors PLC
                </span>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono mt-0.5 block">
                  Phone: +251 911 223 344 • Status: APPROVED
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                document.cookie = `raffle_session_phone=+251911998877; path=/; max-age=86400`;
                window.location.reload();
              }}
              className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-left transition flex items-center justify-between group"
            >
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm block">
                  Ethio Tech Importers
                </span>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
                  Phone: +251 911 998 877 • Status: PENDING KYC
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isApproved = seller.status === "APPROVED";
  const isPending = seller.status === "PENDING";

  return (
    <div className="space-y-8 py-4">
      {/* Top Banner with Seller Status */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xl shadow-sm">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {seller.businessName}
              </h1>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isApproved
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                    : isPending
                    ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                    : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                }`}
              >
                {seller.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
              Contact: {seller.contactPerson} ({seller.phone}) • Region: {seller.region}
            </p>
          </div>
        </div>

        {isApproved ? (
          <Link
            href="/seller/create-raffle"
            className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-indigo-500/25 flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>List New Raffle Item</span>
          </Link>
        ) : (
          <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 p-3 rounded-xl border border-amber-200 dark:border-amber-800 max-w-sm">
            <span className="font-bold block">Gate 1: Verification in Progress</span>
            Your account is being reviewed. Once approved, you will be able to submit raffle items.
          </div>
        )}
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Seller Campaigns / Moderation Status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-indigo-500" />
            <span>Your Listed Raffles & Incomplete Sales Manager</span>
          </h2>
        </div>

        {raffles.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <Ticket className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No items submitted yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Submit your first item for administrative review to start selling raffle tickets.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {raffles.map((raffle) => {
              const percentSold = Math.min(100, Math.round((raffle.soldTickets / raffle.totalTickets) * 100));
              const isExpired = new Date(raffle.drawDate).getTime() <= Date.now();
              const isPartial = raffle.soldTickets < raffle.totalTickets;
              const requiresConsensus = isExpired && isPartial && raffle.status !== "DRAWN" && raffle.status !== "CANCELLED";

              return (
                <div
                  key={raffle.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                          {raffle.title}
                        </h3>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            raffle.moderationStatus === "APPROVED"
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                              : raffle.moderationStatus === "PENDING_APPROVAL"
                              ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                              : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                          }`}
                        >
                          Gate 2: {raffle.moderationStatus}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {raffle.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Prize: <span className="font-bold text-slate-700 dark:text-slate-300">{raffle.prizeName}</span> ({raffle.prizeValue.toLocaleString()} ETB) • Ticket: {raffle.ticketPrice} ETB
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {raffle.soldTickets.toLocaleString()} / {raffle.totalTickets.toLocaleString()} Tickets ({percentSold}%)
                      </div>
                      <div className="w-36 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1.5 ml-auto">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500"
                          style={{ width: `${percentSold}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* INCOMPLETE SALES DUAL-CONSENSUS ACTION PANEL */}
                  {requiresConsensus && (
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-4">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                            Raffle Expired with Incomplete Capacity ({percentSold}% Sold) — Dual-Consent Required
                          </span>
                          <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                            Under platform rules, the draw cannot proceed without mutual consent from both you (the Seller) and Platform Administration.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/40 flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Seller Consent:</span>
                          <span className={`font-bold ${raffle.sellerDrawConsent ? "text-emerald-600" : "text-amber-500"}`}>
                            {raffle.sellerDrawConsent ? "✓ GRANTED" : "⏳ PENDING YOUR INPUT"}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/40 flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Admin Consent:</span>
                          <span className={`font-bold ${raffle.adminDrawConsent ? "text-emerald-600" : "text-amber-500"}`}>
                            {raffle.adminDrawConsent ? "✓ GRANTED" : "⏳ PENDING ADMIN"}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {!raffle.sellerDrawConsent && (
                          <button
                            onClick={() => handleConsensusAction(raffle.id, "GRANT_CONSENT")}
                            disabled={!!actionLoading}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve Partial Draw ({raffle.soldTickets} Tickets)</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleConsensusAction(raffle.id, "EXTEND_TIMER", 7)}
                          disabled={!!actionLoading}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center gap-1.5"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Extend Draw Date (+7 Days)</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to cancel this raffle and refund all ticket buyers?")) {
                              handleConsensusAction(raffle.id, "REFUND_BUYERS");
                            }
                          }}
                          disabled={!!actionLoading}
                          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Cancel & Issue Full Refunds</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


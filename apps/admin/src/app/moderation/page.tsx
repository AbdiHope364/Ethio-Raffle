"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@raffle/shared";
import {
  Building2,
  Ticket,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  FileText,
  Phone,
  User,
  MapPin,
  ExternalLink,
  Award,
  AlertCircle,
  Search,
} from "lucide-react";

export default function ModerationHubPage() {
  const { language } = useI18n();
  const [activeTab, setActiveTab] = useState<"SELLERS" | "RAFFLES">("SELLERS");
  const [sellers, setSellers] = useState<any[]>([]);
  const [raffles, setRaffles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sRes, rRes] = await Promise.all([
        fetch("/api/moderation/sellers"),
        fetch("/api/moderation/raffles"),
      ]);
      const sData = await sRes.json();
      const rData = await rRes.json();
      setSellers(sData.sellers || []);
      setRaffles(rData.raffles || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSellerAction = async (sellerId: string, status: string) => {
    try {
      setActionLoading(sellerId);
      const res = await fetch("/api/moderation/sellers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      setToastMessage(data.message);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRaffleAction = async (raffleId: string, moderationStatus: string) => {
    try {
      setActionLoading(raffleId);
      const res = await fetch("/api/moderation/raffles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raffleId, moderationStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      setToastMessage(data.message);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingSellersCount = sellers.filter((s) => s.status === "PENDING").length;
  const pendingRafflesCount = raffles.filter((r) => r.moderationStatus === "PENDING_APPROVAL").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Shield className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            <span>Platform Moderation & Verification Hub</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Two-Tier Governance: Gate 1 (Seller Onboarding KYC) & Gate 2 (Raffle Listing Moderation)
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1 bg-slate-200 dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("SELLERS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "SELLERS"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Seller Onboarding</span>
            {pendingSellersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                {pendingSellersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("RAFFLES")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "RAFFLES"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Raffle Listings</span>
            {pendingRafflesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                {pendingRafflesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-mono">Loading Moderation Queue...</p>
        </div>
      ) : activeTab === "SELLERS" ? (
        /* GATE 1: SELLER ONBOARDING QUEUE */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Gate 1: Merchant KYC Verification Queue ({sellers.length} registered)
            </h2>
          </div>

          {sellers.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
              No seller applications found.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {sellers.map((s) => {
                const isPending = s.status === "PENDING";
                const isApproved = s.status === "APPROVED";

                return (
                  <div
                    key={s.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                              {s.businessName}
                            </h3>
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                                isApproved
                                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                  : isPending
                                  ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                                  : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                              }`}
                            >
                              {s.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Representative: <span className="font-bold text-slate-700 dark:text-slate-300">{s.contactPerson}</span> ({s.phone}) • Region: {s.region}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleSellerAction(s.id, "APPROVED")}
                              disabled={actionLoading === s.id}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve Seller</span>
                            </button>
                            <button
                              onClick={() => handleSellerAction(s.id, "REJECTED")}
                              disabled={actionLoading === s.id}
                              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                        {isApproved && (
                          <button
                            onClick={() => handleSellerAction(s.id, "SUSPENDED")}
                            disabled={actionLoading === s.id}
                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-lg transition"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Metadata chips */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 block text-[10px]">TIN NUMBER</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{s.tinNumber || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">LICENSE REF</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{s.licenseRef || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">PAYOUT ACCOUNT</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{s.payoutAccount || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">LISTED RAFFLES</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{s.raffles?.length || 0} items</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* GATE 2: RAFFLE LISTINGS MODERATION QUEUE */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Gate 2: Seller Item Listings Moderation ({raffles.length} items)
            </h2>
          </div>

          {raffles.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
              No raffle listings found.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {raffles.map((r) => {
                const isPending = r.moderationStatus === "PENDING_APPROVAL";
                const isApproved = r.moderationStatus === "APPROVED";

                return (
                  <div
                    key={r.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <img
                          src={r.prizeImage}
                          alt={r.prizeName}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                              {r.title}
                            </h3>
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                                isApproved
                                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                  : isPending
                                  ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                                  : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                              }`}
                            >
                              Gate 2: {r.moderationStatus}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Seller: <span className="font-bold text-purple-600 dark:text-purple-400">{r.seller?.businessName || "Platform Listing"}</span> • Category: {r.category}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleRaffleAction(r.id, "APPROVED")}
                              disabled={actionLoading === r.id}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve & Publish</span>
                            </button>
                            <button
                              onClick={() => handleRaffleAction(r.id, "REJECTED")}
                              disabled={actionLoading === r.id}
                              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                        {isApproved && (
                          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Live in Catalog</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata chips */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 block text-[10px]">VALUATION</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{r.prizeValue.toLocaleString()} ETB</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">TICKET PRICE</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{r.ticketPrice} ETB</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">CAPACITY</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{r.soldTickets} / {r.totalTickets} Tickets</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">COMMIT HASH</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300 truncate block">
                          {r.commitHash?.substring(0, 10)}...
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


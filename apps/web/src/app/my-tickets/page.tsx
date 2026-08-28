"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import {
  Ticket as TicketIcon,
  Trophy,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  QrCode,
  Download,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function MyTicketsPage() {
  const { t, language } = useI18n();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "DRAWN">("ACTIVE");
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tickets/my");
      const data = await res.json();
      if (data.tickets) {
        setTickets(data.tickets);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter((tkt) => {
    if (activeTab === "ACTIVE") {
      return tkt.raffle.status === "ACTIVE" || tkt.raffle.status === "CLOSED";
    } else {
      return tkt.raffle.status === "DRAWN";
    }
  });

  return (
    <div className="space-y-8 transition-colors">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>{t.common.myTickets}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === "AM"
              ? "የቆረጧቸውን ቲኬቶች፣ የማረጋገጫ ኮዶች እና የዕጣ ውጤቶችን እዚህ ይመልከቱ።"
              : "Track all your purchased tickets, verification codes, and check live winning status."}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === "ACTIVE"
                ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Active Tickets ({tickets.filter((t) => t.raffle.status !== "DRAWN").length})
          </button>
          <button
            onClick={() => setActiveTab("DRAWN")}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === "DRAWN"
                ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Drawn / Past ({tickets.filter((t) => t.raffle.status === "DRAWN").length})
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Loading your ticket history...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4 max-w-md mx-auto transition-colors">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
            <TicketIcon className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
            No {activeTab.toLowerCase()} tickets found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === "AM"
              ? "እስካሁን ምንም ቲኬት አልቆረጡም። ንቁ ዕጣዎችን ይመልከቱና እድልዎን ይሞክሩ!"
              : "You have not purchased any tickets in this category yet. Pick a raffle to enter the next draw!"}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md"
          >
            <span>{t.raffles.activeRaffles}</span>
          </Link>
        </div>
      ) : (
        /* Ticket Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTickets.map((ticket) => {
            const isWinner =
              ticket.raffle.status === "DRAWN" &&
              ticket.ticketNumber === ticket.raffle.winningTicketNumber;

            const displayTitle =
              language === "AM" && ticket.raffle.titleAm
                ? ticket.raffle.titleAm
                : ticket.raffle.title;

            return (
              <div
                key={ticket.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 p-5 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden ${
                  isWinner
                    ? "border-purple-400 dark:border-purple-600 bg-purple-50/40 dark:bg-purple-950/40 ring-2 ring-purple-500/50"
                    : "border-slate-200 dark:border-slate-800 hover:shadow-md"
                }`}
              >
                {/* Winner Ribbon */}
                {isWinner && (
                  <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-xs">
                    <Trophy className="w-3 h-3 text-amber-300" /> WINNER!
                  </div>
                )}

                {/* Top Section */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={ticket.raffle.prizeImage}
                    alt={displayTitle}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="space-y-1 flex-1">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">
                      {displayTitle}
                    </h3>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>
                        Draw: {new Date(ticket.raffle.drawDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {ticket.purchaseMethod}
                      </span>
                      {ticket.soldByAgent && (
                        <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 truncate max-w-[120px]">
                          via {ticket.soldByAgent.fullName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ticket Number & Code Box */}
                <div className="bg-slate-50 dark:bg-slate-950/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Ticket Number
                    </span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                      #{ticket.ticketNumber}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Verification Code
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800">
                      {ticket.verificationCode}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    onClick={() => setSelectedReceipt(ticket)}
                    className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold flex items-center gap-1.5 transition"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>View Digital Ticket Receipt</span>
                  </button>

                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Digital Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 relative text-center max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 dark:hover:text-white text-xl font-bold"
            >
              ×
            </button>

            <div className="space-y-1">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Official Digital Ticket
              </h3>
              <p className="text-[11px] text-slate-400">
                National Lottery Administration Verified Ticket
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 text-left">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Raffle</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {selectedReceipt.raffle.title}
                </span>
              </div>

              <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Ticket No</span>
                  <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                    #{selectedReceipt.ticketNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Security Code</span>
                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 inline-block">
                    {selectedReceipt.verificationCode}
                  </span>
                </div>
              </div>

              <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2 text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Method: {selectedReceipt.purchaseMethod}</span>
                <span className="text-slate-500 dark:text-slate-400">Status: CONFIRMED</span>
              </div>
            </div>

            {/* Mock QR Representation */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col items-center justify-center space-y-1.5 border border-slate-800">
              <QrCode className="w-20 h-20 text-emerald-400" />
              <span className="text-[9px] font-mono text-slate-400">
                SCAN TO VERIFY AUTHENTICITY
              </span>
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  ExternalLink,
  Copy,
  Check,
  Phone,
  Building2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

function MyTicketsContent() {
  const { t, language } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "DRAWN">("ACTIVE");
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Phone / Code Lookup state
  const [lookupInput, setLookupInput] = useState("");
  const [queriedIdentifier, setQueriedIdentifier] = useState<string | null>(null);

  useEffect(() => {
    const queryPhone = searchParams.get("phone");
    const queryCode = searchParams.get("code");
    const savedPhone = typeof window !== "undefined" ? localStorage.getItem("raffle_buyer_phone") : null;

    const initialQuery = queryPhone || queryCode || savedPhone || "";
    if (initialQuery) {
      setLookupInput(initialQuery);
      fetchTickets(initialQuery);
    } else {
      fetchTickets();
    }
  }, [searchParams]);

  const fetchTickets = async (queryParam?: string) => {
    try {
      setLoading(true);
      let url = "/api/tickets/my";
      if (queryParam) {
        if (queryParam.startsWith("TKT-") || queryParam.length > 15) {
          url += `?code=${encodeURIComponent(queryParam)}`;
        } else {
          url += `?phone=${encodeURIComponent(queryParam)}`;
        }
      }
      const res = await fetch(url);
      const data = await res.json();
      setTickets(data.tickets || []);
      setQueriedIdentifier(data.queriedPhone || data.queriedCode || queryParam || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (lookupInput.trim()) {
      if (typeof window !== "undefined" && !lookupInput.startsWith("TKT-")) {
        localStorage.setItem("raffle_buyer_phone", lookupInput.trim());
      }
      fetchTickets(lookupInput.trim());
    } else {
      fetchTickets();
    }
  };

  const copyVerificationCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
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
              ? "የቆረጧቸውን ቲኬቶች፣ የማረጋገጫ ኮዶች እና የዕጣ ውጤቶችን እዚህ ይመልከቱ (ምንም አይነት ምዝገባ አያስፈልግም)።"
              : "No account registration required for buyers. Look up all your booked tickets and cryptographic verification codes instantly by phone number."}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold self-start sm:self-auto">
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

      {/* Frictionless Buyer Phone / Code Lookup Bar */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-800/40 rounded-2xl p-4 sm:p-5">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Phone className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter your phone number (e.g. 0911223344) or ticket verification code..."
              value={lookupInput}
              onChange={(e) => setLookupInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition shadow-md flex items-center justify-center gap-2 shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search My Tickets</span>
          </button>
        </form>

        {queriedIdentifier && (
          <div className="mt-2.5 text-[11px] text-slate-400 flex items-center gap-2 font-mono">
            <span>Showing tickets registered under:</span>
            <span className="text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {queriedIdentifier}
            </span>
          </div>
        )}
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
              ? "ለዚህ ስልክ ቁጥር ምንም ቲኬት አልተገኘም። እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ ወይም ንቁ ዕጣዎችን ይቁረጡ!"
              : "No tickets found for this query. Enter the mobile phone number used during checkout or browse active raffles to pick your numbers."}
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm line-clamp-1">
                      {displayTitle}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                      <Building2 className="w-3 h-3 shrink-0" />
                      <span className="truncate">{ticket.raffle.seller?.businessName || "Verified Platform Merchant"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>Draw: {new Date(ticket.raffle.drawDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Middle Ticket Badge */}
                <div className="bg-slate-50 dark:bg-slate-950/80 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                      Ticket Number
                    </span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      #{ticket.ticketNumber}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                      Verification Code
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {ticket.verificationCode}
                      </span>
                      <button
                        onClick={() => copyVerificationCode(ticket.verificationCode)}
                        className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition"
                        title="Copy code"
                      >
                        {copiedCode === ticket.verificationCode ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
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
                    {ticket.purchaseMethod}
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
                Official Digital Ticket Receipt
              </h3>
              <p className="text-[11px] text-slate-400">
                National Lottery Administration Verified Platform Ticket
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 text-left">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Raffle Prize</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {selectedReceipt.raffle.title}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Merchant Provider</span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedReceipt.raffle.seller?.businessName || "Platform Verified Merchant"}
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
                <span className="text-slate-500 dark:text-slate-400">Customer Phone: {selectedReceipt.customerPhone}</span>
                <span className="text-slate-500 dark:text-slate-400">Status: CONFIRMED</span>
              </div>
            </div>

            {/* Verifier Link */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col items-center justify-center space-y-2 border border-slate-800">
              <QrCode className="w-16 h-16 text-emerald-400" />
              <span className="text-[10px] font-mono text-slate-300">
                Code: {selectedReceipt.verificationCode}
              </span>
              <Link
                href={`/verifier?code=${encodeURIComponent(selectedReceipt.verificationCode)}&raffleId=${selectedReceipt.raffle.id}&commit=${selectedReceipt.raffle.commitHash}`}
                target="_blank"
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 pt-1"
              >
                <span>Open in Public SHA-256 Verifier</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyTicketsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs font-mono text-slate-500">Loading Tickets...</div>}>
      <MyTicketsContent />
    </Suspense>
  );
}

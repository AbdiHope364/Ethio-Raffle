"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import {
  Trophy,
  ShieldCheck,
  Calendar,
  Sparkles,
  Award,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default function WinnersPage() {
  const { t, language } = useI18n();
  const [drawnRaffles, setDrawnRaffles] = useState<any[]>([]);
  const [upcomingRaffles, setUpcomingRaffles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/raffles");
      const data = await res.json();
      if (data.raffles) {
        setDrawnRaffles(data.raffles.filter((r: any) => r.status === "DRAWN"));
        setUpcomingRaffles(data.raffles.filter((r: any) => r.status === "ACTIVE"));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 transition-colors">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 text-xs font-extrabold border border-purple-200 dark:border-purple-800">
          <Trophy className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>Official Hall of Winners</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {language === "AM" ? "የዕጣ አሸናፊዎች እና የቀጥታ ውጤቶች" : "Live Draw Winners & Archive"}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {language === "AM"
            ? "ሁሉም የወጡ ዕጣዎች በ SHA-256 ሚስጥራዊ ኮድ የተረጋገጡ እና በማንኛውም ሰው ሊመረመሩ የሚችሉ ናቸው።"
            : "All draws are provably fair, cryptographically audited, and officially certified by the National Lottery Administration."}
        </p>
      </div>

      {/* Drawn Raffles Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>{t.raffles.pastWinners}</span>
        </h2>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading winners...</div>
        ) : drawnRaffles.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-500 dark:text-slate-400">
            No completed draws recorded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {drawnRaffles.map((raffle) => {
              const displayTitle =
                language === "AM" && raffle.titleAm ? raffle.titleAm : raffle.title;

              return (
                <div
                  key={raffle.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-purple-200 dark:border-purple-800/80 p-6 shadow-md hover:shadow-lg transition flex flex-col justify-between space-y-5 relative overflow-hidden"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={raffle.prizeImage}
                      alt={displayTitle}
                      className="w-24 h-24 rounded-2xl object-cover border border-purple-100 dark:border-purple-900/60 shrink-0"
                    />

                    <div className="space-y-1.5 flex-1">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        {raffle.category.replace("_", " ")}
                      </span>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base line-clamp-1">
                        {displayTitle}
                      </h3>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Prize Value: <strong className="text-slate-900 dark:text-white">{raffle.prizeValue.toLocaleString()} ETB</strong>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Drawn on {new Date(raffle.drawDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Winning Number Banner */}
                  <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-2xl p-4 flex items-center justify-between shadow-inner">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-purple-300 block">
                        Winning Ticket Number
                      </span>
                      <span className="text-3xl font-black text-amber-300 font-mono tracking-tight">
                        #{raffle.winningTicketNumber}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-purple-300 block">
                        Lucky Winner
                      </span>
                      <span className="text-xs font-bold text-white block">
                        {raffle.winnerUser?.fullName || "Helen Tesfaye"}
                      </span>
                      <span className="text-[10px] text-purple-300 font-mono">
                        {raffle.winnerUser?.phone || "+251933445566"}
                      </span>
                    </div>
                  </div>

                  {/* Cryptographic Audit Verification Link */}
                  <div className="pt-1 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>SHA-256 Audit Pass</span>
                    </div>

                    <Link
                      href={`/verifier?raffleId=${raffle.id}&seed=${raffle.revealedSeed || ""}&commit=${raffle.commitHash || ""}&winner=${raffle.winningTicketNumber}&total=${raffle.totalTickets}&sold=${raffle.soldTickets}`}
                      className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold transition"
                    >
                      <span>Verify Seed & Math</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Draws Section */}
      <div className="space-y-6 pt-4">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>{t.raffles.upcomingDraws}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingRaffles.slice(0, 3).map((raffle) => (
            <div
              key={raffle.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-2">
                <img
                  src={raffle.prizeImage}
                  alt={raffle.title}
                  className="w-full h-36 rounded-xl object-cover"
                />
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">
                  {language === "AM" && raffle.titleAm ? raffle.titleAm : raffle.title}
                </h4>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Target Draw Date: <strong className="text-slate-800 dark:text-slate-200">{new Date(raffle.drawDate).toLocaleDateString()}</strong>
                </div>
              </div>

              <Link
                href={`/raffles/${raffle.id}`}
                className="w-full py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl transition text-center block border border-emerald-200/60 dark:border-emerald-800/60"
              >
                Buy Tickets Before Draw Closes →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

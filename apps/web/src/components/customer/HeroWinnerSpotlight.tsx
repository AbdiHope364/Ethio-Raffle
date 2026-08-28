"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import {
  Trophy,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Award,
  Flame,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function HeroWinnerSpotlight() {
  const { t, language } = useI18n();
  const [spotlight, setSpotlight] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/raffles/hero-spotlight")
      .then((r) => r.json())
      .then((d) => {
        if (d.spotlight) {
          setSpotlight(d.spotlight);
          try {
            confetti({
              particleCount: 50,
              spread: 80,
              origin: { y: 0.3 },
            });
          } catch (e) {}
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !spotlight) return null;

  const displayTitle =
    language === "AM" && spotlight.titleAm ? spotlight.titleAm : spotlight.title;
  const displayPrize =
    language === "AM" && spotlight.prizeNameAm ? spotlight.prizeNameAm : spotlight.prizeName;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-amber-950 border-2 border-amber-400/40 p-4 sm:p-6 lg:p-8 text-white shadow-2xl animate-in fade-in slide-in-from-top-3">
      {/* Background Glows */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/10 pb-3.5 mb-4 sm:mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-md shadow-amber-500/30">
            <Flame className="w-3.5 h-3.5" />
            <span>24-Hour Winner Spotlight</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-amber-200/80 font-semibold bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Provably Fair Draw</span>
          </span>
        </div>

        {/* Spotlight Active Timer */}
        <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-amber-300 font-mono bg-amber-950/80 px-2.5 sm:px-3 py-1 rounded-xl border border-amber-500/40 w-fit">
          <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
          <span>
            Spotlight: {spotlight.remainingHours}h {spotlight.remainingMinutes}m remaining
          </span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-center">
        {/* Left Column: Winner Credentials & Prize Info */}
        <div className="lg:col-span-8 space-y-3.5 sm:space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-extrabold text-amber-400 uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>Grand Prize Winner Declared!</span>
            </div>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white line-clamp-2">
              {displayTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Prize: <strong className="text-amber-300 font-bold">{displayPrize}</strong> valued at{" "}
              <strong className="text-emerald-400 font-mono">
                {spotlight.prizeValue.toLocaleString()} ETB
              </strong>
            </p>
          </div>

          {/* Winner Hero Callout Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
            {/* Winner Profile */}
            <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-3.5 flex items-center gap-3 backdrop-blur-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-lg shadow-amber-500/30">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] text-amber-300/80 font-bold uppercase tracking-wider block">
                  Verified Winner
                </span>
                <span className="text-sm sm:text-base font-black text-white truncate block">
                  {spotlight.winnerName}
                </span>
                <span className="text-[11px] sm:text-xs text-slate-400 font-mono">
                  {spotlight.maskedPhone}
                </span>
              </div>
            </div>

            {/* Winning Ticket Box */}
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center justify-between backdrop-blur-sm">
              <div>
                <span className="text-[9px] sm:text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                  Winning Ticket #
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
                  #{spotlight.winningTicketNumber}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-400 block font-mono">Code</span>
                <span className="text-[11px] font-mono font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded">
                  {spotlight.verificationCode}
                </span>
              </div>
            </div>
          </div>

          {/* Provably Fair Cryptographic Hash Badge */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] sm:text-xs font-mono">
            <div className="flex items-center gap-1.5 truncate">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-400 shrink-0">SHA-256:</span>
              <span className="text-amber-200 truncate select-all">
                {spotlight.revealedSeed || spotlight.commitHash}
              </span>
            </div>

            <Link
              href={`/verifier?raffleId=${spotlight.id}&seed=${spotlight.revealedSeed}&winner=${spotlight.winningTicketNumber}`}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold shrink-0 transition"
            >
              <span>Verify Mathematical Proof</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Right Column: Prize Image & Action */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-3">
          <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-2xl bg-slate-900 group">
            <img
              src={spotlight.prizeImage}
              alt={displayTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
              <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black text-[10px] uppercase">
                Awarded
              </span>
              <span className="text-slate-200 font-mono text-[11px]">
                {new Date(spotlight.drawnAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <Link
            href="/winners"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition"
          >
            <Trophy className="w-4 h-4 text-slate-950" />
            <span>View All Winners History</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

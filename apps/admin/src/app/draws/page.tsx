"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@raffle/shared";
import {
  Trophy,
  ShieldCheck,
  Play,
  RotateCcw,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Award,
} from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";

function AdminDrawsConsoleContent() {
  const { t, language } = useI18n();
  const searchParams = useSearchParams();

  const [raffles, setRaffles] = useState<any[]>([]);
  const [selectedRaffleId, setSelectedRaffleId] = useState("");
  const [loading, setLoading] = useState(true);

  // Draw State
  const [isDrawing, setIsDrawing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [drawResult, setDrawResult] = useState<any | null>(null);
  const [animatedNumber, setAnimatedNumber] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveRaffles();
  }, []);

  const fetchActiveRaffles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/raffles?status=ACTIVE");
      const data = await res.json();
      if (data.raffles) {
        setRaffles(data.raffles);
        const queryRaffleId = searchParams.get("raffleId");
        if (queryRaffleId) {
          setSelectedRaffleId(queryRaffleId);
        } else if (data.raffles.length > 0) {
          setSelectedRaffleId(data.raffles[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectedRaffle = raffles.find((r) => r.id === selectedRaffleId);

  const handleStartLiveDraw = async () => {
    if (!selectedRaffle) return;
    setErrorMsg(null);
    setDrawResult(null);
    setIsDrawing(true);
    setCountdown(5);

    let count = 5;
    const countTimer = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(countTimer);
        setCountdown(null);
        executeDrawApi();
      }
    }, 1000);

    const shuffleTimer = setInterval(() => {
      const randomTicket = Math.floor(Math.random() * (selectedRaffle.soldTickets || 100)) + 1;
      setAnimatedNumber(randomTicket);
    }, 80);

    const executeDrawApi = async () => {
      try {
        const res = await fetch("/api/draws/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ raffleId: selectedRaffle.id }),
        });

        const data = await res.json();
        clearInterval(shuffleTimer);

        if (!res.ok || !data.success) {
          setErrorMsg(data.error || "Draw execution failed.");
          setIsDrawing(false);
          return;
        }

        setDrawResult(data);
        setIsDrawing(false);

        try {
          confetti({
            particleCount: 120,
            spread: 100,
            origin: { y: 0.4 },
          });
        } catch (e) {}

        fetchActiveRaffles();
      } catch (e: any) {
        clearInterval(shuffleTimer);
        setErrorMsg(e.message || "Failed to execute live draw.");
        setIsDrawing(false);
      }
    };
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto transition-colors">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-500/30">
          <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Live Provably Fair RNG Console</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {t.admin.liveDrawRoom}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Execute cryptographically authentic live draws with full seed reveal, deterministic winner derivation, and instant broadcast.
        </p>
      </div>

      {/* Raffle Selector & Commitment Status */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 lg:p-8 shadow-xs space-y-6 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-center">
          <div className="md:col-span-6 space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Select Active Raffle to Draw
            </label>
            <select
              value={selectedRaffleId}
              onChange={(e) => {
                setSelectedRaffleId(e.target.value);
                setDrawResult(null);
              }}
              disabled={isDrawing}
              className="w-full px-3 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white font-bold"
            >
              {raffles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} — ({r.soldTickets} / {r.totalTickets} sold)
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-6 bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Published SHA-256 Pre-Commitment</span>
            </div>
            <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate" title={selectedRaffle?.commitHash}>
              {selectedRaffle?.commitHash || "Loading commitment hash..."}
            </p>
          </div>
        </div>

        {/* Selected Raffle Preview Card */}
        {selectedRaffle && (
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 text-white rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-800 shadow-xl relative overflow-hidden space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
                <img
                  src={selectedRaffle.prizeImage}
                  alt={selectedRaffle.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-800 shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {selectedRaffle.category.replace("_", " ")}
                  </span>
                  <h3 className="text-base sm:text-xl font-extrabold text-white mt-1 line-clamp-1">
                    {selectedRaffle.title}
                  </h3>
                  <span className="text-[11px] sm:text-xs text-purple-300 font-mono block">
                    Sold: {selectedRaffle.soldTickets} / {selectedRaffle.totalTickets} ({selectedRaffle.ticketPrice} ETB each)
                  </span>
                </div>
              </div>

              {!drawResult && (
                <button
                  disabled={isDrawing || selectedRaffle.soldTickets <= 0}
                  onClick={handleStartLiveDraw}
                  className="w-full sm:w-auto px-5 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-purple-600/40 transition transform active:scale-95 flex items-center justify-center gap-2 shrink-0"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  <span>{isDrawing ? "Executing Live Draw..." : t.admin.startDraw}</span>
                </button>
              )}
            </div>

            {/* Live Animation / Countdown Stage */}
            {isDrawing && (
              <div className="bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-purple-700/50 text-center space-y-4 animate-in fade-in">
                {countdown !== null ? (
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-purple-300">
                      Live Draw Starting in:
                    </span>
                    <div className="text-5xl sm:text-6xl font-black text-amber-300 font-mono animate-bounce">
                      {countdown}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-purple-300">
                      RNG Cryptographic Seed Extraction in Progress...
                    </span>
                    <div className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono tracking-widest">
                      #{animatedNumber}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Winner Announcement Card */}
            {drawResult && (
              <div className="bg-gradient-to-r from-purple-900/90 to-indigo-900/90 rounded-2xl p-6 sm:p-8 border border-purple-500 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Trophy className="w-9 h-9" />
                  </div>
                  <h4 className="text-2xl font-black text-amber-300 tracking-tight">
                    Winner Confirmed & Provably Verified!
                  </h4>
                  <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight pt-1">
                    Ticket #{drawResult.winningTicketNumber}
                  </div>
                </div>

                <div className="bg-slate-950/70 rounded-xl p-4 border border-purple-500/40 text-xs space-y-2 font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span>Winner Name:</span>
                    <strong className="text-white">{drawResult.winner?.winnerName || "Helen Tesfaye"}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Winner Phone:</span>
                    <strong className="text-white">{drawResult.winner?.customerPhone || "+251933445566"}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Purchase Channel:</span>
                    <strong className="text-white">{drawResult.winner?.soldByAgent || "Self-Service Online"}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Revealed Secret Seed:</span>
                    <span className="text-emerald-300 truncate max-w-[200px]" title={drawResult.raffle.revealedSeed}>
                      {drawResult.raffle.revealedSeed}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Cryptographic Audit ID: {drawResult.drawAudit?.id?.substring(0, 8)}</span>
                  </div>

                  <a
                    href={`http://localhost:3000/verifier?raffleId=${drawResult.raffle.id}&seed=${drawResult.raffle.revealedSeed}&commit=${drawResult.raffle.commitHash}&winner=${drawResult.winningTicketNumber}&total=${drawResult.raffle.totalTickets}&sold=${drawResult.raffle.soldTickets}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md"
                  >
                    <span>Open Public Verifier (Web)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 bg-red-950/80 border border-red-700 text-red-200 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDrawsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-400">Loading draw room...</div>}>
      <AdminDrawsConsoleContent />
    </Suspense>
  );
}


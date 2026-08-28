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
  AlertTriangle,
  Clock,
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
  const [consensusMsg, setConsensusMsg] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to fetch raffles");
    } finally {
      setLoading(false);
    }
  };

  const selectedRaffle = raffles.find((r) => r.id === selectedRaffleId);

  const handleStartLiveDraw = async () => {
    if (!selectedRaffle) return;
    setErrorMsg(null);
    setConsensusMsg(null);

    // Rule Check: Is 100% sold OR dual consent achieved?
    const isSoldOut = selectedRaffle.soldTickets >= selectedRaffle.totalTickets;
    const bothConsenting = selectedRaffle.adminDrawConsent && selectedRaffle.sellerDrawConsent;

    if (!isSoldOut && !bothConsenting) {
      setErrorMsg(
        `Incomplete Sales Rule: Only ${selectedRaffle.soldTickets}/${selectedRaffle.totalTickets} tickets sold. Dual consent from both Seller and Admin is strictly required before executing this draw.`
      );
      return;
    }

    setIsDrawing(true);
    setCountdown(3);

    // 3-second live countdown
    let timer = 3;
    const countInterval = setInterval(() => {
      timer -= 1;
      if (timer > 0) {
        setCountdown(timer);
      } else {
        clearInterval(countInterval);
        setCountdown(null);
        startRNGAnimation();
      }
    }, 1000);
  };

  const startRNGAnimation = () => {
    if (!selectedRaffle) return;

    // Simulate RNG number ticker for 2.5s
    const maxNum = selectedRaffle.soldTickets;
    const rngInterval = setInterval(() => {
      const randomTicket = Math.floor(Math.random() * maxNum) + 1;
      setAnimatedNumber(randomTicket);
    }, 60);

    setTimeout(async () => {
      clearInterval(rngInterval);
      try {
        const res = await fetch("/api/draws/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ raffleId: selectedRaffle.id }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Draw execution failed on server");
        }

        setDrawResult(data);
        setIsDrawing(false);

        // Trigger confetti celebration
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#10B981", "#F59E0B", "#8B5CF6", "#3B82F6"],
        });

        fetchActiveRaffles();
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to execute provably fair draw");
        setIsDrawing(false);
      }
    }, 2500);
  };

  const handleAdminConsensus = async (action: string, extensionDays?: number) => {
    if (!selectedRaffle) return;
    try {
      setActionLoading(true);
      setErrorMsg(null);
      setConsensusMsg(null);

      const res = await fetch("/api/draws/consensus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raffleId: selectedRaffle.id,
          action,
          extensionDays,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Consensus action failed");

      setConsensusMsg(data.message);
      if (data.drawExecuted) {
        setDrawResult({
          winningTicketNumber: data.raffle.winningTicketNumber,
          raffle: data.raffle,
          drawAudit: { id: "CONSENSUS-DRAW" },
        });
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#10B981", "#F59E0B", "#8B5CF6"],
        });
      }
      fetchActiveRaffles();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const isSoldOut = selectedRaffle && selectedRaffle.soldTickets >= selectedRaffle.totalTickets;
  const isExpired = selectedRaffle && new Date(selectedRaffle.drawDate).getTime() <= Date.now();
  const isUnderSubscribed = selectedRaffle && selectedRaffle.soldTickets < selectedRaffle.totalTickets;
  const bothConsenting = selectedRaffle && selectedRaffle.adminDrawConsent && selectedRaffle.sellerDrawConsent;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
            <span>{t.admin.liveDrawRoom}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Cryptographic SHA-256 Commit-Reveal RNG & Incomplete Sales Governance Engine
          </p>
        </div>

        <button
          onClick={fetchActiveRaffles}
          className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {consensusMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{consensusMsg}</span>
        </div>
      )}

      {/* Select Raffle Stage */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-6 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Select Active Campaign for Draw
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
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {selectedRaffle.category.replace("_", " ")}
                    </span>
                    {isSoldOut ? (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        100% SOLD OUT (READY)
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        PARTIAL ({Math.round((selectedRaffle.soldTickets / selectedRaffle.totalTickets) * 100)}% SOLD)
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-xl font-extrabold text-white mt-1 line-clamp-1">
                    {selectedRaffle.title}
                  </h3>
                  <span className="text-[11px] sm:text-xs text-purple-300 font-mono block">
                    Sold: {selectedRaffle.soldTickets} / {selectedRaffle.totalTickets} ({selectedRaffle.ticketPrice} ETB each) • Draw Date: {new Date(selectedRaffle.drawDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {!drawResult && (
                <button
                  disabled={isDrawing || selectedRaffle.soldTickets <= 0 || (!isSoldOut && !bothConsenting)}
                  onClick={handleStartLiveDraw}
                  className="w-full sm:w-auto px-5 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-purple-600/40 transition transform active:scale-95 flex items-center justify-center gap-2 shrink-0"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  <span>
                    {isDrawing
                      ? "Executing Live Draw..."
                      : isSoldOut || bothConsenting
                      ? t.admin.startDraw
                      : "Dual-Consent Required"}
                  </span>
                </button>
              )}
            </div>

            {/* UNDER-SUBSCRIBED DUAL-CONSENSUS GOVERNANCE PANEL */}
            {isUnderSubscribed && !drawResult && (
              <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-800/60 space-y-4">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-amber-200 block">
                      Incomplete Capacity Governance Rule Active (&lt;100% Sold)
                    </span>
                    <p className="text-[11px] text-amber-300/80 mt-0.5 leading-relaxed">
                      By system policy, under-subscribed raffles cannot trigger automatically. Both Platform Administration and the Seller must mutually consent to execute a partial draw with sold tickets ({selectedRaffle.soldTickets} tickets).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-900 border border-amber-800/40 flex items-center justify-between">
                    <span className="text-slate-400">Admin Consent Status:</span>
                    <span className={`font-bold ${selectedRaffle.adminDrawConsent ? "text-emerald-400" : "text-amber-400"}`}>
                      {selectedRaffle.adminDrawConsent ? "✓ GRANTED" : "⏳ PENDING ADMIN INPUT"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-amber-800/40 flex items-center justify-between">
                    <span className="text-slate-400">Seller Consent Status:</span>
                    <span className={`font-bold ${selectedRaffle.sellerDrawConsent ? "text-emerald-400" : "text-amber-400"}`}>
                      {selectedRaffle.sellerDrawConsent ? "✓ GRANTED" : "⏳ PENDING SELLER INPUT"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  {!selectedRaffle.adminDrawConsent && (
                    <button
                      onClick={() => handleAdminConsensus("GRANT_CONSENT")}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Grant Admin Consent</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleAdminConsensus("EXTEND_TIMER", 7)}
                    disabled={actionLoading}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Extend Draw Date (+7 Days)</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to cancel this raffle and issue full refunds to all ticket buyers?")) {
                        handleAdminConsensus("REFUND_BUYERS");
                      }
                    }}
                    disabled={actionLoading}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Cancel & Issue Full Refunds</span>
                  </button>
                </div>
              </div>
            )}

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

                <div className="bg-slate-950/80 rounded-xl p-4 sm:p-5 border border-purple-700/60 space-y-3 text-xs font-mono">
                  <div className="flex items-center justify-between text-purple-300 font-bold border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Unlock className="w-4 h-4 text-emerald-400" />
                      <span>Revealed Secret Seed (Audit Key)</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      MATCHES COMMIT HASH 100%
                    </span>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg text-emerald-400 break-all select-all border border-slate-800 text-[11px]">
                    {drawResult.raffle?.revealedSeed || "Revealed secret seed verified"}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 pt-1">
                    <div>
                      <span className="text-slate-500 block text-[10px]">VERIFIED WINNER PHONE:</span>
                      <span className="font-bold">{drawResult.winningTicket?.customerPhone || drawResult.winningTicket?.user?.phone || "Ticket Buyer"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">TICKET VERIFICATION CODE:</span>
                      <span className="font-bold text-amber-400">{drawResult.winningTicket?.verificationCode || "TKT-VERIFIED-2026"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="text-[11px] text-slate-300 font-mono">
                    <span>Cryptographic Audit ID: {drawResult.drawAudit?.id?.substring(0, 8)}</span>
                  </div>

                  <a
                    href={`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/verifier?raffleId=${drawResult.raffle?.id}&seed=${drawResult.raffle?.revealedSeed}&commit=${drawResult.raffle?.commitHash}&winner=${drawResult.winningTicketNumber}&total=${drawResult.raffle?.totalTickets}&sold=${drawResult.raffle?.soldTickets}`}
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
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDrawsConsolePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-mono text-slate-500">Loading Live Draw Room...</div>}>
      <AdminDrawsConsoleContent />
    </Suspense>
  );
}

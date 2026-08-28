"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Hash,
  Key,
  Calculator,
  RotateCcw,
  Sparkles,
  Info,
  ExternalLink,
} from "lucide-react";

function VerifierContent() {
  const { t, language } = useI18n();
  const searchParams = useSearchParams();

  const [seed, setSeed] = useState("");
  const [commitHash, setCommitHash] = useState("");
  const [raffleId, setRaffleId] = useState("");
  const [totalTickets, setTotalTickets] = useState("1000");
  const [soldTickets, setSoldTickets] = useState("1000");
  const [declaredWinner, setDeclaredWinner] = useState("427");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [drawnList, setDrawnList] = useState<any[]>([]);

  useEffect(() => {
    const querySeed = searchParams.get("seed");
    const queryCommit = searchParams.get("commit");
    const queryRaffleId = searchParams.get("raffleId");
    const queryWinner = searchParams.get("winner");
    const queryTotal = searchParams.get("total");
    const querySold = searchParams.get("sold");

    if (querySeed) setSeed(querySeed);
    if (queryCommit) setCommitHash(queryCommit);
    if (queryRaffleId) setRaffleId(queryRaffleId);
    if (queryWinner) setDeclaredWinner(queryWinner);
    if (queryTotal) setTotalTickets(queryTotal);
    if (querySold) setSoldTickets(querySold);

    fetchCompletedRaffles();
  }, [searchParams]);

  const fetchCompletedRaffles = async () => {
    try {
      const res = await fetch("/api/raffles?status=DRAWN");
      const data = await res.json();
      if (data.raffles) {
        setDrawnList(data.raffles);
        if (!searchParams.get("seed") && data.raffles.length > 0) {
          loadRaffleToVerifier(data.raffles[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadRaffleToVerifier = (raffle: any) => {
    setSeed(raffle.revealedSeed || raffle.secretSeed || "");
    setCommitHash(raffle.commitHash || "");
    setRaffleId(raffle.id);
    setTotalTickets(raffle.totalTickets.toString());
    setSoldTickets(raffle.soldTickets.toString());
    setDeclaredWinner(raffle.winningTicketNumber ? raffle.winningTicketNumber.toString() : "1");
    setResult(null);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/draws/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raffleId: raffleId || "test-raffle",
          revealedSeed: seed,
          commitHash,
          totalTickets,
          totalSoldTickets: soldTickets,
          winningTicketNumber: declaredWinner,
        }),
      });

      const data = await res.json();
      if (data.verification) {
        setResult(data.verification);
      } else {
        alert(data.error || "Verification failed");
      }
    } catch (err: any) {
      alert(err.message || "Failed to execute cryptographic verification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 transition-colors">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Zero-Trust Cryptographic Verification</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {t.verifier.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {t.verifier.subtitle}
        </p>
      </div>

      {/* Preset Quick Loader */}
      {drawnList.length > 0 && (
        <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Quick Load Completed Draw to Verify:
          </span>
          <div className="flex flex-wrap gap-2">
            {drawnList.map((r) => (
              <button
                key={r.id}
                onClick={() => loadRaffleToVerifier(r)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition flex items-center gap-1.5 shadow-xs"
              >
                <span>{r.title}</span>
                <span className="text-purple-600 dark:text-purple-400 font-mono">#{r.winningTicketNumber}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Verification Form */}
      <form onSubmit={handleVerify} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.verifier.revealedSeedLabel}
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="64-character hex seed (e.g. 7f8b9c2a1d4e...)"
                className="w-full pl-9 pr-3 py-2.5 text-xs font-mono rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.verifier.commitHashLabel}
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={commitHash}
                onChange={(e) => setCommitHash(e.target.value)}
                placeholder="SHA-256 pre-committed hash"
                className="w-full pl-9 pr-3 py-2.5 text-xs font-mono rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Raffle ID
              </label>
              <input
                type="text"
                required
                value={raffleId}
                onChange={(e) => setRaffleId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.verifier.totalTicketsLabel}
              </label>
              <input
                type="number"
                required
                value={totalTickets}
                onChange={(e) => setTotalTickets(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.verifier.soldTicketsLabel}
              </label>
              <input
                type="number"
                required
                value={soldTickets}
                onChange={(e) => setSoldTickets(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.verifier.winningTicketLabel}
            </label>
            <input
              type="number"
              required
              value={declaredWinner}
              onChange={(e) => setDeclaredWinner(e.target.value)}
              className="w-full px-3 py-2.5 text-sm font-bold font-mono rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-purple-700 dark:text-purple-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
        >
          <Calculator className="w-4 h-4" />
          <span>{loading ? "Computing Proof..." : t.verifier.verifyButton}</span>
        </button>
      </form>

      {/* Verification Results Panel */}
      {result && (
        <div
          className={`rounded-3xl p-6 sm:p-8 border shadow-md space-y-6 animate-in fade-in slide-in-from-bottom-2 ${
            result.isValid
              ? "bg-emerald-950 text-emerald-100 border-emerald-800"
              : "bg-red-950 text-red-100 border-red-800"
          }`}
        >
          <div className="flex items-center gap-3">
            {result.isValid ? (
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0">
                <XCircle className="w-7 h-7" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-black">
                {result.isValid ? t.verifier.resultValid : t.verifier.resultInvalid}
              </h3>
              <p className="text-xs opacity-90">{result.details}</p>
            </div>
          </div>

          {/* Mathematical Proof Breakdown */}
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Cryptographic Proof Breakdown
            </div>

            {/* Check 1: Commit Hash Match */}
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800">
              <div>
                <span className="text-slate-400 block">
                  1. SHA-256(RevealedSeed : RaffleID : TotalTickets)
                </span>
                <span className="text-emerald-300 break-all text-[11px]">
                  Computed: {result.computedCommitHash}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                  result.hashesMatch
                    ? "bg-emerald-800 text-emerald-200"
                    : "bg-red-800 text-red-200"
                }`}
              >
                {result.hashesMatch ? "HASH MATCH ✓" : "HASH MISMATCH ✗"}
              </span>
            </div>

            {/* Check 2: Winner Math Derivation */}
            <div className="flex items-start justify-between gap-2 pt-1">
              <div>
                <span className="text-slate-400 block">
                  2. Formula: (BigInt(SHA256(RevealedSeed)) % TotalSold) + 1
                </span>
                <span className="text-amber-300 text-sm font-bold">
                  Derived Winning Ticket: #{result.derivedWinningTicket}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                  result.ticketsMatch
                    ? "bg-emerald-800 text-emerald-200"
                    : "bg-red-800 text-red-200"
                }`}
              >
                {result.ticketsMatch ? "WINNER MATCH ✓" : "WINNER MISMATCH ✗"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifierPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-400">Loading verifier...</div>}>
      <VerifierContent />
    </Suspense>
  );
}

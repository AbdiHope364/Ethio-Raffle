"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  QrCode,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Star,
  Clock,
  X,
  Building2,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface WinnerClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: any;
  winnerPhone: string;
}

export function WinnerClaimModal({
  isOpen,
  onClose,
  ticket,
  winnerPhone,
}: WinnerClaimModalProps) {
  const { language } = useI18n();

  const [loading, setLoading] = useState(false);
  const [redemption, setRedemption] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Dispute state
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen && ticket?.raffle?.id) {
      loadRedemptionState();
    }
  }, [isOpen, ticket]);

  const loadRedemptionState = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(
        `/api/winner/claim?raffleId=${ticket.raffle.id}&phone=${encodeURIComponent(winnerPhone)}`
      );
      const data = await res.json();
      if (data.redemption) {
        setRedemption(data.redemption);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChoice = async (choice: "ITEM" | "CASH") => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/winner/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raffleId: ticket.raffle.id,
          winnerPhone,
          choice,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit choice.");
      }

      setRedemption(data.redemption);
      setSuccessMsg(data.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redemption?.id || !disputeReason.trim()) return;

    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/redemption/dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redemptionId: redemption.id,
          winnerPhone,
          disputeReason,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit dispute.");
      }

      setRedemption(data.redemption);
      setDisputeOpen(false);
      setSuccessMsg("Dispute logged. Escrow payout halted and routed to Admin Arbitration.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raffleId: ticket.raffle.id,
          winnerPhone,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit review.");
      }

      setReviewSubmitted(true);
      setSuccessMsg("Verified winner review submitted!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !ticket) return null;

  const raffle = ticket.raffle;
  const cashValue =
    raffle.cashEquivalentAmount > 0
      ? raffle.cashEquivalentAmount
      : Math.round(raffle.prizeValue * 0.9);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold font-mono w-fit mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>CERTIFIED WINNER SETTLEMENT CONSOLE</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black">
            {language === "AM" ? "እንኳን ደስ አለዎት! ሽልማትዎን ይምረጡ" : "Congratulations! Claim Your Prize"}
          </h2>
          <p className="text-xs text-purple-200 mt-1">
            Winning Ticket #{ticket.ticketNumber} • {raffle.title}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-900 dark:text-white">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* If Choice is not yet made */}
          {!redemption || redemption.choice === "PENDING_SELECTION" ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {language === "AM"
                  ? "እንደ አሸናፊነትዎ መጠን ዋናውን እቃ በአካል መረከብ ወይም የጥሬ ገንዘብ ክፍያ በቀጥታ ወደ አካውንትዎ ማስገባት ይችላሉ።"
                  : "As the verified winner under National Lottery Authority compliance, you have two autonomous settlement options:"}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Option 1: Physical Item */}
                <div className="p-5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/40 dark:bg-indigo-950/30 flex flex-col justify-between space-y-4 hover:border-indigo-500 transition group">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Option 1: Receive Physical Prize
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Receive the physical item directly from <strong>{raffle.seller?.businessName || "the Merchant"}</strong>. A dynamic, encrypted Claim QR code will be generated for handover.
                    </p>
                  </div>

                  <button
                    onClick={() => handleSelectChoice("ITEM")}
                    disabled={loading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
                  >
                    <span>Claim Physical Item (QR)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Option 2: Cash Equivalent */}
                <div className="p-5 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/30 flex flex-col justify-between space-y-4 hover:border-emerald-500 transition group">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Option 2: Cash Equivalent Payout
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Receive <strong>{cashValue.toLocaleString()} ETB</strong> certified cash directly into your platform wallet / bank account. Item remains with seller.
                    </p>
                  </div>

                  <button
                    onClick={() => handleSelectChoice("CASH")}
                    disabled={loading}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                  >
                    <span>Receive {cashValue.toLocaleString()} ETB</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : redemption.choice === "ITEM" ? (
            /* Option 1 Active: Dynamic QR Code Handover Console */
            <div className="space-y-6 text-center">
              <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 inline-block mx-auto shadow-inner">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(redemption.claimQrCode)}`}
                  alt="Dynamic Handover QR Code"
                  className="w-48 h-48 mx-auto rounded-lg"
                />
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block mt-3 uppercase tracking-widest font-bold">
                  {redemption.claimQrCode}
                </span>
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Dynamic Encrypted Handover QR</span>
                </div>
                <h4 className="text-sm font-extrabold">
                  Present this QR Code to the Merchant upon Handover
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  The merchant will scan this QR code via their Seller App to certify successful physical handover and unfreeze escrow funds.
                </p>
              </div>

              {/* Delivery Status & 7-Day Grace Countdown */}
              <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-600 dark:text-slate-400">Delivery Status:</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 uppercase font-mono text-[10px]">
                    {redemption.deliveryStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-600 dark:text-slate-400">7-Day Auto-Release Deadline:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                    {new Date(redemption.autoReleaseDeadline).toLocaleDateString()}
                  </span>
                </div>

                {redemption.deliveryStatus !== "VERIFIED_COMPLETE" && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setDisputeOpen(!disputeOpen)}
                      className="text-rose-600 dark:text-rose-400 hover:underline font-bold text-[11px] flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Report Non-Receipt Issue (Dispute)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Dispute Form */}
              {disputeOpen && (
                <form onSubmit={handleDispute} className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-left space-y-3">
                  <h5 className="font-bold text-xs text-rose-800 dark:text-rose-200">
                    File Non-Receipt Dispute to Admin Arbitration
                  </h5>
                  <textarea
                    rows={3}
                    required
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="Describe the issue (e.g. Seller refused handover or item condition differs)..."
                    className="w-full p-2.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Submit Dispute (Freeze Escrow)
                  </button>
                </form>
              )}

              {/* Verified Review & Rating (Enabled on Handover Complete) */}
              {(redemption.deliveryStatus === "VERIFIED_COMPLETE" ||
                redemption.deliveryStatus === "AUTO_APPROVED") &&
                !reviewSubmitted && (
                  <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-5 text-left space-y-4">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold text-sm">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>Rate & Review Merchant Service (Verified Winner)</span>
                    </div>

                    <form onSubmit={handleSubmitReview} className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                          Star Rating (1 - 5)
                        </label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setReviewRating(star)}
                              className={`p-1.5 rounded-lg transition ${
                                star <= reviewRating
                                  ? "text-amber-500"
                                  : "text-slate-300 dark:text-slate-700"
                              }`}
                            >
                              <Star className={`w-6 h-6 ${star <= reviewRating ? "fill-amber-400" : ""}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                          Winner Testimonial / Feedback
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Share your experience receiving this prize..."
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-xs"
                      >
                        Submit Verified Review
                      </button>
                    </form>
                  </div>
                )}
            </div>
          ) : (
            /* Option 2 Active: Cash Settlement Completed */
            <div className="text-center space-y-4 py-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black">Cash Settlement Completed</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                <strong>{cashValue.toLocaleString()} ETB</strong> has been credited to your verified winner account. The physical item remains in seller inventory.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


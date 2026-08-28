"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import TicketSelector from "@/components/customer/TicketSelector";
import PaymentSimulatorDrawer from "@/components/customer/PaymentSimulatorDrawer";
import {
  ShieldCheck,
  Clock,
  Ticket,
  Trophy,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Lock,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function RaffleDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { t, language } = useI18n();

  const [raffle, setRaffle] = useState<any>(null);
  const [soldNumbers, setSoldNumbers] = useState<number[]>([]);
  const [bookedNumbers, setBookedNumbers] = useState<Array<number | { number: number; expiresAt: string }>>([]);
  const [takenNumbers, setTakenNumbers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  // Copy state
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRaffleDetails(id);
    }
  }, [id]);

  const fetchRaffleDetails = async (raffleId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/raffles/${raffleId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load raffle");
      }

      setRaffle(data.raffle);
      setSoldNumbers(data.soldNumbers || []);
      setBookedNumbers(data.bookedNumbers || []);
      setTakenNumbers(data.takenNumbers || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedCheckout = async (formData: {
    ticketCount: number;
    specificNumbers?: number[];
    paymentMethod: "TELEBIRR" | "CBE_BIRR" | "CHAPA" | "SANTIMPAY";
    customerPhone: string;
  }) => {
    try {
      const res = await fetch("/api/payments/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raffleId: raffle.id,
          ticketCount: formData.ticketCount,
          specificNumbers: formData.specificNumbers,
          paymentMethod: formData.paymentMethod,
          customerPhone: formData.customerPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || "Failed to initialize booking.");
        return;
      }

      setPaymentData({
        txRef: data.txRef,
        amount: data.amount,
        paymentMethod: formData.paymentMethod,
        customerPhone: formData.customerPhone,
        ticketCount: formData.ticketCount,
        expiresAt: data.expiresAt,
      });

      setIsDrawerOpen(true);
    } catch (e) {
      console.error(e);
      alert("Error initializing payment.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading raffle details...</p>
      </div>
    );
  }

  if (error || !raffle) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Raffle Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{error || "Could not retrieve details."}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
        </Link>
      </div>
    );
  }

  const displayTitle = language === "AM" && raffle.titleAm ? raffle.titleAm : raffle.title;
  const displayDescription =
    language === "AM" && raffle.descriptionAm ? raffle.descriptionAm : raffle.description;

  const percentageSold = Math.min(
    100,
    Math.round((raffle.soldTickets / raffle.totalTickets) * 100)
  );

  return (
    <div className="space-y-8 transition-colors">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to All Raffles
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Prize Media & Info */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Image */}
          <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800">
            <img
              src={raffle.prizeImage}
              alt={displayTitle}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

            <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur text-slate-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xs">
              {raffle.category.replace("_", " ")}
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
              <div>
                <span className="text-xs text-slate-300 block">
                  {t.common.pricePerTicket}
                </span>
                <span className="text-3xl font-black text-emerald-400">
                  {raffle.ticketPrice} <span className="text-base font-bold text-white">{t.common.etb}</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-300 block">
                  {t.common.prizeValue}
                </span>
                <span className="text-lg font-black text-amber-300">
                  {raffle.prizeValue.toLocaleString()} {t.common.etb}
                </span>
              </div>
            </div>
          </div>

          {/* Title & Description */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs transition-colors">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {displayTitle}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {displayDescription}
            </p>

            {/* Progress Bar Details */}
            <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>
                  {raffle.soldTickets.toLocaleString()} / {raffle.totalTickets.toLocaleString()} {t.raffles.ticketsSold}
                </span>
                <span className="text-emerald-700 dark:text-emerald-400">{percentageSold}% Confirmed</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full"
                  style={{ width: `${percentageSold}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
                <span>
                  {Math.max(0, raffle.totalTickets - (soldNumbers.length + bookedNumbers.length)).toLocaleString()} {t.common.ticketsRemaining}
                  {bookedNumbers.length > 0 && ` (${bookedNumbers.length} held in-flight)`}
                </span>
                <span>Draw Date: {new Date(raffle.drawDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Provably Fair Commitment Box */}
          <div className="bg-emerald-950 text-emerald-100 rounded-2xl p-6 border border-emerald-800/80 shadow-md space-y-3">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>{t.raffles.publishedHash} (Provably Fair)</span>
            </div>
            <p className="text-xs text-emerald-200/80 leading-relaxed">
              Before selling any tickets, this raffle's secret seed was hashed using SHA-256 and committed publicly. When the draw concludes, the plain-text seed is revealed, allowing anyone to verify the winner with zero trust.
            </p>

            {raffle.commitHash && (
              <div className="flex items-center justify-between gap-2 bg-slate-900/90 p-3 rounded-xl border border-emerald-700/50 font-mono text-xs">
                <span className="truncate text-emerald-300 font-semibold select-all">
                  {raffle.commitHash}
                </span>
                <button
                  onClick={() => copyToClipboard(raffle.commitHash)}
                  className="p-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white shrink-0 transition"
                  title="Copy SHA-256 Hash"
                >
                  {copiedHash ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}

            <div className="flex justify-between items-center text-[11px] text-emerald-300/80 pt-1">
              <span>National Lottery Administration Verified</span>
              <Link
                href={`/verifier?raffleId=${raffle.id}`}
                className="underline hover:text-white font-bold"
              >
                Open Independent Verifier →
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Selector & Purchase Box */}
        <div className="lg:col-span-5 space-y-6">
          <TicketSelector
            raffleId={raffle.id}
            ticketPrice={raffle.ticketPrice}
            totalTickets={raffle.totalTickets}
            soldTickets={raffle.soldTickets}
            soldNumbers={soldNumbers}
            bookedNumbers={bookedNumbers}
            takenNumbers={takenNumbers}
            onProceed={handleProceedCheckout}
          />
        </div>
      </div>

      {/* Payment Drawer Modal */}
      {paymentData && (
        <PaymentSimulatorDrawer
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            fetchRaffleDetails(raffle.id);
          }}
          txRef={paymentData.txRef}
          amount={paymentData.amount}
          paymentMethod={paymentData.paymentMethod}
          raffleTitle={displayTitle}
          customerPhone={paymentData.customerPhone}
          ticketCount={paymentData.ticketCount}
          expiresAt={paymentData.expiresAt}
        />
      )}
    </div>
  );
}


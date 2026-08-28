"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { Clock, ShieldCheck, Ticket, Trophy, ArrowRight, CheckCircle2, Building2 } from "lucide-react";

export interface RaffleData {
  id: string;
  sellerId?: string | null;
  seller?: {
    businessName: string;
    region?: string;
  } | null;
  title: string;
  titleAm?: string | null;
  description: string;
  descriptionAm?: string | null;
  category: string;
  prizeName: string;
  prizeNameAm?: string | null;
  prizeImage: string;
  prizeValue: number;
  ticketPrice: number;
  totalTickets: number;
  soldTickets: number;
  maxTicketsPerUser?: number;
  status: string;
  drawDate: string;
  commitHash?: string | null;
  revealedSeed?: string | null;
  winningTicketNumber?: number | null;
  winnerUser?: {
    fullName: string;
    phone: string;
  } | null;
}

export default function RaffleCard({ raffle }: { raffle: RaffleData }) {
  const { t, language } = useI18n();
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(raffle.drawDate).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft(raffle.status === "DRAWN" ? "Drawn" : "Closing Soon");
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [raffle.drawDate, raffle.status]);

  const percentageSold = Math.min(
    100,
    Math.round((raffle.soldTickets / raffle.totalTickets) * 100)
  );

  const displayTitle =
    language === "AM" && raffle.titleAm ? raffle.titleAm : raffle.title;
  const displayPrize =
    language === "AM" && raffle.prizeNameAm ? raffle.prizeNameAm : raffle.prizeName;

  const isDrawn = raffle.status === "DRAWN";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group">
      {/* Image & Badges */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={raffle.prizeImage}
          alt={displayTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur text-slate-800 dark:text-slate-200 text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
          {raffle.category.replace("_", " ")}
        </div>

        {/* Status / Countdown Badge */}
        <div className="absolute top-3 right-3">
          {isDrawn ? (
            <span className="bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
              <Trophy className="w-3 h-3" /> Winner Picked
            </span>
          ) : (
            <span className="bg-emerald-600/90 backdrop-blur text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
              <Clock className="w-3 h-3" /> {timeLeft}
            </span>
          )}
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
          <div>
            <span className="text-[11px] text-slate-300 block font-medium">
              {t.common.pricePerTicket}
            </span>
            <span className="text-2xl font-black tracking-tight text-emerald-400">
              {raffle.ticketPrice} <span className="text-sm font-bold text-white">{t.common.etb}</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-300 block font-medium">
              {t.common.prizeValue}
            </span>
            <span className="text-sm font-extrabold text-amber-300">
              {raffle.prizeValue.toLocaleString()} {t.common.etb}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {displayTitle}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-bold font-mono">
            <Building2 className="w-3 h-3 shrink-0" />
            <span className="truncate">
              {raffle.seller?.businessName || "Verified Platform Merchant"}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
            {language === "AM" && raffle.descriptionAm ? raffle.descriptionAm : raffle.description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <Ticket className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {raffle.soldTickets.toLocaleString()} / {raffle.totalTickets.toLocaleString()} {t.raffles.ticketsSold}
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">{percentageSold}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-700"
              style={{ width: `${percentageSold}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between pt-0.5">
            <span>
              {raffle.totalTickets - raffle.soldTickets > 0
                ? `${(raffle.totalTickets - raffle.soldTickets).toLocaleString()} ${t.common.ticketsRemaining}`
                : "Sold Out"}
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">
              Max: {raffle.maxTicketsPerUser || 100} / user
            </span>
          </div>
        </div>

        {/* Provably Fair Commit Hash Snippet */}
        {raffle.commitHash && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate font-mono">
              SHA-256: {raffle.commitHash.substring(0, 16)}...
            </span>
          </div>
        )}

        {/* Winner Announcement if Drawn */}
        {isDrawn && raffle.winningTicketNumber && (
          <div className="bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 rounded-xl p-3 text-xs">
            <div className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Winner: Ticket #{raffle.winningTicketNumber}
            </div>
            <div className="text-purple-700 dark:text-purple-300 text-[11px] mt-0.5">
              {raffle.winnerUser?.fullName ? `${raffle.winnerUser.fullName}` : "Provably Fair Draw Completed"}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div>
          {isDrawn ? (
            <Link
              href={`/verifier?raffleId=${raffle.id}`}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-sm rounded-xl transition shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {t.common.verifier}
            </Link>
          ) : (
            <Link
              href={`/raffles/${raffle.id}`}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-emerald-600/20 group-hover:bg-emerald-500"
            >
              <span>{t.common.buyTickets}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

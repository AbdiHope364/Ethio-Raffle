"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@raffle/shared";
import {
  LayoutDashboard,
  Ticket,
  Users,
  Trophy,
  TrendingUp,
  Store,
  ShieldCheck,
  ArrowRight,
  PlusCircle,
  Clock,
  Sparkles,
  Wallet,
  Activity,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { t, language } = useI18n();

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTicketsSold: 0,
    activeRafflesCount: 0,
    activeAgentsCount: 0,
    pendingAgentsCount: 0,
    totalAgentFloat: 0,
  });
  const [recentRaffles, setRecentRaffles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [rafflesRes, agentsRes] = await Promise.all([
        fetch("/api/raffles"),
        fetch("/api/agents"),
      ]);

      const rafflesData = await rafflesRes.json();
      const agentsData = await agentsRes.json();

      let revenue = 0;
      let soldCount = 0;
      let activeCount = 0;

      if (rafflesData.raffles) {
        setRecentRaffles(rafflesData.raffles);
        rafflesData.raffles.forEach((r: any) => {
          revenue += r.soldTickets * r.ticketPrice;
          soldCount += r.soldTickets;
          if (r.status === "ACTIVE") activeCount++;
        });
      }

      let activeAgents = 0;
      let pendingAgents = 0;
      let floatSum = 0;
      if (agentsData.agents) {
        agentsData.agents.forEach((a: any) => {
          if (a.status === "ACTIVE") activeAgents++;
          if (a.status === "PENDING") pendingAgents++;
          floatSum += a.floatBalance || 0;
        });
      }

      setStats({
        totalRevenue: revenue,
        totalTicketsSold: soldCount,
        activeRafflesCount: activeCount,
        activeAgentsCount: activeAgents,
        pendingAgentsCount: pendingAgents,
        totalAgentFloat: floatSum,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 transition-colors">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Mission Control
            </span>
            <span className="text-xs text-slate-400 font-mono">Port 3001</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            LuckyEthio Operations Dashboard
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Real-time sales velocity, verifiable random draw controls, agent KYC onboarding, and national lottery regulatory audit streams.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/privacy"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-purple-300 font-extrabold text-xs rounded-xl border border-purple-500/30 transition shadow-md flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Data Privacy (PDPP)</span>
          </Link>

          <Link
            href="/raffles"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.admin.createRaffle}</span>
          </Link>

          <Link
            href="/draws"
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl transition shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>{t.admin.liveDrawRoom}</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-2 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t.admin.totalRevenue}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            {stats.totalRevenue.toLocaleString()} <span className="text-sm font-bold text-slate-400">ETB</span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
            Across online & agent channels
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-2 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t.admin.totalTicketsSold}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            {stats.totalTicketsSold.toLocaleString()}
          </div>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold block">
            Zero duplicate allocations
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-2 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Certified Agents
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            {stats.activeAgentsCount}
          </div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block">
            {stats.pendingAgentsCount} pending KYC approval
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-2 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Agent Float Pool
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            {stats.totalAgentFloat.toLocaleString()} <span className="text-sm font-bold text-slate-400">ETB</span>
          </div>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold block">
            Pre-funded kiosk collateral
          </span>
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods Share */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 transition-colors">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Channel Payment Velocity</span>
          </h3>

          <div className="space-y-3 pt-1 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>Telebirr (Mobile / USSD)</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono">48%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "48%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>Agent Cash POS</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono">28%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "28%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>CBE Birr</span>
                <span className="text-purple-600 dark:text-purple-400 font-mono">16%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: "16%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>Chapa & SantimPay</span>
                <span className="text-amber-600 dark:text-amber-400 font-mono">8%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: "8%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Active Campaigns Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Live Campaigns & Commitments
            </h3>
            <Link
              href="/raffles"
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentRaffles.slice(0, 4).map((r) => (
              <div key={r.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={r.prizeImage}
                    alt={r.title}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{r.title}</h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {r.soldTickets} / {r.totalTickets} tickets ({r.ticketPrice} ETB)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      r.status === "ACTIVE"
                        ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30"
                        : r.status === "DRAWN"
                        ? "bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {r.status}
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Draw: {new Date(r.drawDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

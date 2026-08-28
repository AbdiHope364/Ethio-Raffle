"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import {
  LayoutDashboard,
  Ticket,
  Users,
  Trophy,
  TrendingUp,
  DollarSign,
  Store,
  ShieldCheck,
  ArrowRight,
  PlusCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function AdminOverviewPage() {
  const { t, language } = useI18n();

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTicketsSold: 0,
    activeRafflesCount: 0,
    activeAgentsCount: 0,
    pendingAgentsCount: 0,
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
      if (agentsData.agents) {
        agentsData.agents.forEach((a: any) => {
          if (a.status === "ACTIVE") activeAgents++;
          if (a.status === "PENDING") pendingAgents++;
        });
      }

      setStats({
        totalRevenue: revenue,
        totalTicketsSold: soldCount,
        activeRafflesCount: activeCount,
        activeAgentsCount: activeAgents,
        pendingAgentsCount: pendingAgents,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-purple-200">
              Admin Console
            </span>
            <span className="text-xs text-slate-400">LuckyEthio Ops</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            {t.admin.consoleTitle}
          </h1>
          <p className="text-xs text-slate-500">
            Real-time telemetry, revenue velocity, agent KYC reviews, and provably fair draw controls.
          </p>
        </div>

        {/* Quick Admin Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/raffles"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.admin.createRaffle}</span>
          </Link>

          <Link
            href="/admin/agents"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
          >
            <Store className="w-4 h-4 text-emerald-400" />
            <span>{t.admin.manageAgents}</span>
            {stats.pendingAgentsCount > 0 && (
              <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                {stats.pendingAgentsCount}
              </span>
            )}
          </Link>

          <Link
            href="/admin/draws"
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>{t.admin.liveDrawRoom}</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t.admin.totalRevenue}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {stats.totalRevenue.toLocaleString()} <span className="text-sm font-bold text-slate-500">ETB</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            Across online & agent channels
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t.admin.totalTicketsSold}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {stats.totalTicketsSold.toLocaleString()}
          </div>
          <span className="text-[11px] text-blue-600 font-semibold block">
            Zero duplicate allocations
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t.admin.activeAgents}
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {stats.activeAgentsCount}
          </div>
          <span className="text-[11px] text-amber-600 font-semibold block">
            {stats.pendingAgentsCount} pending review
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t.admin.activeRaffles}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {stats.activeRafflesCount}
          </div>
          <span className="text-[11px] text-purple-600 font-semibold block">
            With SHA-256 pre-commitments
          </span>
        </div>
      </div>

      {/* Breakdown Channels & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods Mix */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900">
            Payment Gateways Volume Share
          </h3>

          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Telebirr (Mobile / USSD)</span>
                <span>48%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "48%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Agent Cash POS</span>
                <span>28%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: "28%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>CBE Birr</span>
                <span>16%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: "16%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Chapa & SantimPay</span>
                <span>8%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: "8%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Live Active Raffles Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">
              Active Campaigns & Commitments
            </h3>
            <Link
              href="/admin/raffles"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentRaffles.slice(0, 4).map((r) => (
              <div key={r.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={r.prizeImage}
                    alt={r.title}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{r.title}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {r.soldTickets} / {r.totalTickets} tickets ({r.ticketPrice} ETB)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      r.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-800"
                        : r.status === "DRAWN"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-slate-100 text-slate-700"
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


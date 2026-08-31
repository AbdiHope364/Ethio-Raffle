"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Server,
  Database,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Clock,
  Layers,
  Zap,
} from "lucide-react";

export default function MonitoringPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/monitoring/metrics");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Health & Telemetry</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
              LIVE AUTO-POLL (10s)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time infrastructure health, database latency, payment success rates, and anomaly detection.
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-extrabold hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-600" : ""}`} />
          <span>Refresh Now</span>
        </button>
      </div>

      {loading && !data ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading cluster telemetry...</div>
      ) : (
        <>
          {/* Service Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">PostgreSQL Core</span>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-base font-extrabold text-slate-900">{data?.services?.database?.status}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Latency: <strong className="text-emerald-700">{data?.services?.database?.latencyMs}ms</strong>
                </div>
              </div>
              <Database className="w-8 h-8 text-emerald-600/20" />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Payment Gateway</span>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-base font-extrabold text-slate-900">{data?.services?.chapaGateway?.status}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Success: <strong className="text-emerald-700">{data?.services?.chapaGateway?.successRate}</strong>
                </div>
              </div>
              <CreditCard className="w-8 h-8 text-emerald-600/20" />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Telecom SMS Queue</span>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-base font-extrabold text-slate-900">{data?.services?.smsGateway?.status}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Queue Pending: <strong className="text-slate-800">{data?.services?.smsGateway?.queueSize} msgs</strong>
                </div>
              </div>
              <MessageSquare className="w-8 h-8 text-indigo-600/20" />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Memory & Uptime</span>
                <div className="text-base font-extrabold text-slate-900 font-mono">
                  {Math.floor((data?.system?.uptimeSeconds || 0) / 3600)}h {Math.floor(((data?.system?.uptimeSeconds || 0) % 3600) / 60)}m
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  RAM RSS: <strong className="text-slate-800">{data?.system?.memoryUsageMB} MB</strong>
                </div>
              </div>
              <Cpu className="w-8 h-8 text-amber-600/20" />
            </div>
          </div>

          {/* Operational Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-extrabold uppercase text-slate-700 tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span>Ticketing & Inventory</span>
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Total Tickets Minted</span>
                  <span className="font-extrabold text-slate-900 font-mono">{data?.metrics?.totalTicketsSold?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Active Reservation Holds</span>
                  <span className="font-extrabold text-amber-600 font-mono">{data?.metrics?.activeReservationsHold} holds</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Open Live Raffles</span>
                  <span className="font-extrabold text-indigo-600 font-mono">{data?.metrics?.openActiveRaffles}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-extrabold uppercase text-slate-700 tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Financial Transactions</span>
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Settled Payments</span>
                  <span className="font-extrabold text-emerald-600 font-mono">{data?.metrics?.successfulPayments}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Failed Payment Attempts</span>
                  <span className="font-extrabold text-rose-600 font-mono">{data?.metrics?.failedPayments}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Transaction Conversion</span>
                  <span className="font-extrabold text-slate-900 font-mono">{data?.metrics?.paymentSuccessRate}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-extrabold uppercase text-slate-700 tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Security & Auditing</span>
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Audit Events (24h)</span>
                  <span className="font-extrabold text-slate-900 font-mono">{data?.metrics?.auditEventsLast24h} logs</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Two-Person Rule Enforced</span>
                  <span className="font-extrabold text-emerald-700 font-mono">ACTIVE (&gt;50k ETB)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Draw Engine Protocol</span>
                  <span className="font-extrabold text-indigo-700 font-mono">SHA-256-v2</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


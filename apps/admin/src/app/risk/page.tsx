"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@raffle/shared";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Phone,
  Clock,
  ArrowUpRight,
} from "lucide-react";

export default function AdminRiskPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchRiskEvents();
  }, []);

  const fetchRiskEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/risk");
      const json = await res.json();
      if (json.riskEvents) setEvents(json.riskEvents);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string, isResolved: boolean) => {
    try {
      const res = await fetch("/api/risk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riskEventId: id, isResolved }),
      });
      const data = await res.json();
      if (data.success) {
        setEvents(events.map((e) => (e.id === id ? { ...e, isResolved } : e)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredEvents = events.filter((e) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.customerPhone?.toLowerCase().includes(q) ||
      e.reasonCode?.toLowerCase().includes(q) ||
      e.riskLevel?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-red-600 dark:text-red-400" />
            <span>Fraud & Risk Monitoring Engine</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time heuristic risk scoring (0-100), velocity anomaly detection, and automated transaction hold triggers.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Low Risk Transactions (0-30)
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {events.filter((e) => e.riskLevel === "LOW").length}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
            Auto-approved
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Under Review (31-70)
          </span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {events.filter((e) => e.riskLevel === "REVIEW").length}
          </div>
          <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
            Velocity or volume flags
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Blocked Transactions (71-100)
          </span>
          <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">
            {events.filter((e) => e.riskLevel === "BLOCK").length}
          </div>
          <span className="text-[10px] text-red-600 font-semibold block mt-0.5">
            Immediate block & dispute hold
          </span>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Risk & Fraud Telemetry Stream
          </span>
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search phone, reason code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Customer Phone</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Reason Code</th>
                <th className="py-3 px-4">Recorded At</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {evt.customerPhone || "—"}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-sm">
                    <span
                      className={
                        evt.riskScore >= 70
                          ? "text-red-600 dark:text-red-400"
                          : evt.riskScore >= 30
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }
                    >
                      {evt.riskScore} / 100
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        evt.riskLevel === "BLOCK"
                          ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                          : evt.riskLevel === "REVIEW"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      }`}
                    >
                      {evt.riskLevel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300 text-[11px]">
                    {evt.reasonCode}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {new Date(evt.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleResolve(evt.id, !evt.isResolved)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        evt.isResolved
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-400"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                      }`}
                    >
                      {evt.isResolved ? "Resolved" : "Mark Resolved"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


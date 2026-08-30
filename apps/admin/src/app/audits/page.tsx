"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@raffle/shared";
import {
  ShieldCheck,
  FileCheck,
  Lock,
  UserCheck,
  ExternalLink,
  Search,
  Key,
  Users,
  Terminal,
  Clock,
} from "lucide-react";

type AuditTabType = "EVENT_LOGS" | "DRAW_SNAPSHOTS" | "TWO_PERSON" | "AGENT_ACCESS";

export default function AdminAuditsPage() {
  const { t, language } = useI18n();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AuditTabType>("EVENT_LOGS");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/audits");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = data?.auditLogs?.filter((log: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.action?.toLowerCase().includes(q) ||
      log.entityType?.toLowerCase().includes(q) ||
      log.actorType?.toLowerCase().includes(q) ||
      log.ipAddress?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Immutable Audit & Security Telemetry</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tamper-evident log of administrative actions, cryptographic draw snapshots, and two-person rule authorizations.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("EVENT_LOGS")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === "EVENT_LOGS"
              ? "bg-purple-600 text-white shadow-md"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>System Audit Log ({data?.auditLogs?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("DRAW_SNAPSHOTS")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === "DRAW_SNAPSHOTS"
              ? "bg-purple-600 text-white shadow-md"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Cryptographic Draw Snapshots ({data?.drawSnapshots?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("TWO_PERSON")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === "TWO_PERSON"
              ? "bg-purple-600 text-white shadow-md"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Two-Person Approvals ({data?.twoPersonApprovals?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("AGENT_ACCESS")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === "AGENT_ACCESS"
              ? "bg-purple-600 text-white shadow-md"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Agent Access Logs</span>
        </button>
      </div>

      {/* TAB 1: IMMUTABLE AUDIT LOGS */}
      {activeTab === "EVENT_LOGS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search audit actions, actors, IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <span className="text-xs font-mono text-slate-400">Append-Only Audit Stream</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Entity</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">Payload Snapshot</th>
                    <th className="py-3 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredLogs?.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-700 dark:text-purple-300">
                        {log.action}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {log.actorType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {log.entityType}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                        {log.ipAddress || "127.0.0.1"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500 dark:text-slate-400 max-w-xs truncate" title={log.afterState}>
                        {log.afterState || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DRAW SNAPSHOTS */}
      {activeTab === "DRAW_SNAPSHOTS" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Immutable Cryptographic Draw Snapshots
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Snapshot #</th>
                  <th className="py-3 px-4">Raffle Campaign</th>
                  <th className="py-3 px-4">Eligible Tickets</th>
                  <th className="py-3 px-4">Ticket Universe Hash</th>
                  <th className="py-3 px-4">Snapshot Master Hash</th>
                  <th className="py-3 px-4 text-right">Frozen At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {data?.drawSnapshots?.map((snap: any) => (
                  <tr key={snap.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {snap.snapshotNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                      {snap.raffle?.title}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {snap.eligibleTicketCount} / {snap.totalTickets}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-purple-600 dark:text-purple-400 max-w-[140px] truncate" title={snap.ticketUniverseHash}>
                      {snap.ticketUniverseHash}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-amber-600 dark:text-amber-400 max-w-[140px] truncate" title={snap.snapshotHash}>
                      {snap.snapshotHash}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400 font-mono text-[11px]">
                      {new Date(snap.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TWO-PERSON APPROVALS */}
      {activeTab === "TWO_PERSON" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Two-Person Rule Authorization History
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Operation</th>
                  <th className="py-3 px-4">Initiator</th>
                  <th className="py-3 px-4">Authorized Approver</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Approval Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {data?.twoPersonApprovals?.map((app: any) => (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-700 dark:text-purple-300">
                      {app.operationType}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {app.initiator?.fullName} ({app.initiator?.role})
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                      {app.approver?.fullName || "Pending Approval"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          app.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400 font-mono text-[11px]">
                      {app.approvedAt ? new Date(app.approvedAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AGENT ACCESS */}
      {activeTab === "AGENT_ACCESS" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Target Agent</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Authorized Admin</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {data?.accessLogs?.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {log.agent?.fullName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-purple-700 dark:text-purple-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px] max-w-sm truncate">
                      {log.details}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {log.adminUser?.fullName || "Super Admin"}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

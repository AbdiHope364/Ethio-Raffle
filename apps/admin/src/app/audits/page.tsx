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
} from "lucide-react";

export default function AdminAuditsPage() {
  const { t, language } = useI18n();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-8 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Security & Regulatory Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Immutable log of all provably fair RNG draws, National Lottery Administration verifications, and agent permission changes.
          </p>
        </div>
      </div>

      {/* Draw Audits Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs transition-colors">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Provably Fair Draw Audits</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Audit ID</th>
                <th className="py-3 px-4">Raffle Name</th>
                <th className="py-3 px-4">Revealed Seed</th>
                <th className="py-3 px-4">Winner Ticket</th>
                <th className="py-3 px-4">Auditor / Verified By</th>
                <th className="py-3 px-4 text-right">Revealed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Loading audit trail...
                  </td>
                </tr>
              ) : (
                data?.drawAudits?.map((da: any) => (
                  <tr key={da.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-700 dark:text-purple-300">
                      {da.id.substring(0, 8)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                      {da.raffle?.title}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-emerald-600 dark:text-emerald-400 max-w-[140px] truncate" title={da.secretSeed}>
                      {da.secretSeed}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-amber-600 dark:text-amber-300">
                      #{da.winningTicketNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-[11px]">
                      {da.verifiedBy || "NLA Compliance Officer"}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {new Date(da.revealedAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agent Permission & Access Changes */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs transition-colors">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Agent Permissions & Status Change Log</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Target Agent</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Details / Parameters</th>
                <th className="py-3 px-4">Authorized Admin</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data?.accessLogs?.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {log.agent?.fullName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-slate-200 dark:border-slate-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 text-[11px] max-w-sm truncate">
                    {log.details}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    {log.adminUser?.fullName || "System Super Admin"}
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
  );
}

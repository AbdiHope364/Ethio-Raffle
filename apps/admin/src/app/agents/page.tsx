"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@raffle/shared";
import {
  Store,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sliders,
  Wallet,
  Percent,
  FileText,
  Clock,
} from "lucide-react";

export default function AdminAgentsPage() {
  const { t, language } = useI18n();

  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Onboard Modal State
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [onboardForm, setOnboardForm] = useState({
    fullName: "",
    phone: "+2519",
    businessName: "",
    nationalIdRef: "",
    region: "Addis Ababa (Bole)",
    commissionRate: "5.0",
    dailySalesLimit: "50000",
    walletMode: "PREPAID",
    initialFloat: "10000",
  });
  const [submittingOnboard, setSubmittingOnboard] = useState(false);

  // Edit / Action Modal State
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
  const [editStatus, setEditStatus] = useState("ACTIVE");
  const [editCommission, setEditCommission] = useState("5.0");
  const [editDailyLimit, setEditDailyLimit] = useState("50000");
  const [editWalletMode, setEditWalletMode] = useState("PREPAID");
  const [editReason, setEditReason] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/agents");
      const data = await res.json();
      if (data.agents) {
        setAgents(data.agents);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingOnboard(true);

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(onboardForm),
      });

      const data = await res.json();
      if (data.success) {
        setIsOnboardOpen(false);
        setOnboardForm({
          fullName: "",
          phone: "+2519",
          businessName: "",
          nationalIdRef: "",
          region: "Addis Ababa (Bole)",
          commissionRate: "5.0",
          dailySalesLimit: "50000",
          walletMode: "PREPAID",
          initialFloat: "10000",
        });
        fetchAgents();
      } else {
        alert(data.error || "Failed to onboard agent");
      }
    } catch (e: any) {
      alert(e.message || "Network error");
    } finally {
      setSubmittingOnboard(false);
    }
  };

  const handleUpdateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;
    setSubmittingEdit(true);

    try {
      const res = await fetch("/api/agents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          status: editStatus,
          commissionRate: parseFloat(editCommission),
          dailySalesLimit: parseFloat(editDailyLimit),
          walletMode: editWalletMode,
          reason: editReason || "Admin permission adjustment",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedAgent(null);
        fetchAgents();
      } else {
        alert(data.error || "Failed to update agent");
      }
    } catch (e: any) {
      alert(e.message || "Network error");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const openEditModal = (agent: any) => {
    setSelectedAgent(agent);
    setEditStatus(agent.status);
    setEditCommission(agent.commissionRate.toString());
    setEditDailyLimit(agent.dailySalesLimit.toString());
    setEditWalletMode(agent.walletMode);
    setEditReason("");
  };

  return (
    <div className="space-y-8 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Store className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            <span>{t.admin.manageAgents}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Admin-controlled agent onboarding, KYC verification, commission schedules, float limits, and fraud lockouts.
          </p>
        </div>

        <button
          onClick={() => setIsOnboardOpen(true)}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl transition shadow-lg shadow-purple-600/30 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Onboard New Certified Agent</span>
        </button>
      </div>

      {/* Agents Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">{t.admin.agentName}</th>
                <th className="py-3 px-4">{t.admin.business}</th>
                <th className="py-3 px-4">{t.admin.region}</th>
                <th className="py-3 px-4">Float Balance</th>
                <th className="py-3 px-4">Comm %</th>
                <th className="py-3 px-4">Daily Limit</th>
                <th className="py-3 px-4">{t.admin.status}</th>
                <th className="py-3 px-4 text-right">{t.admin.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Loading agent roster...
                  </td>
                </tr>
              ) : (
                agents.map((ag) => (
                  <tr key={ag.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 dark:text-white">{ag.fullName}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {ag.user?.phone || ag.nationalIdRef}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {ag.businessName || "Authorized Kiosk"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {ag.region}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {ag.floatBalance.toLocaleString()} ETB
                    </td>
                    <td className="py-3.5 px-4 font-bold text-purple-700 dark:text-purple-300">
                      {ag.commissionRate}%
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400">
                      {ag.dailySalesLimit.toLocaleString()} ETB
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          ag.status === "ACTIVE"
                            ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30"
                            : ag.status === "PENDING"
                            ? "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30"
                            : "bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30"
                        }`}
                      >
                        {ag.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openEditModal(ag)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] border border-slate-200 dark:border-slate-700 transition inline-flex items-center gap-1"
                      >
                        <Sliders className="w-3 h-3 text-purple-600 dark:text-purple-400" /> Edit / KYC
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Agent Modal */}
      {isOnboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 relative max-h-[90vh] overflow-y-auto text-slate-900 dark:text-white transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Onboard Certified Agent</span>
              </h3>
              <button
                onClick={() => setIsOnboardOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleOnboard} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Full Name (KYC)</label>
                <input
                  type="text"
                  required
                  value={onboardForm.fullName}
                  onChange={(e) => setOnboardForm({ ...onboardForm, fullName: e.target.value })}
                  placeholder="e.g. Almaz Bekele"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number (MSISDN)</label>
                  <input
                    type="tel"
                    required
                    value={onboardForm.phone}
                    onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">National ID Reference</label>
                  <input
                    type="text"
                    required
                    value={onboardForm.nationalIdRef}
                    onChange={(e) => setOnboardForm({ ...onboardForm, nationalIdRef: e.target.value })}
                    placeholder="ETH-NAT-..."
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Business / Kiosk Name</label>
                  <input
                    type="text"
                    required
                    value={onboardForm.businessName}
                    onChange={(e) => setOnboardForm({ ...onboardForm, businessName: e.target.value })}
                    placeholder="e.g. Kazanchis Electronics"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Region / Subcity</label>
                  <input
                    type="text"
                    required
                    value={onboardForm.region}
                    onChange={(e) => setOnboardForm({ ...onboardForm, region: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Commission Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={onboardForm.commissionRate}
                    onChange={(e) => setOnboardForm({ ...onboardForm, commissionRate: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Daily Sales Limit</label>
                  <input
                    type="number"
                    required
                    value={onboardForm.dailySalesLimit}
                    onChange={(e) => setOnboardForm({ ...onboardForm, dailySalesLimit: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Initial Float (ETB)</label>
                  <input
                    type="number"
                    required
                    value={onboardForm.initialFloat}
                    onChange={(e) => setOnboardForm({ ...onboardForm, initialFloat: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingOnboard}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm rounded-xl transition shadow-lg shadow-purple-600/30"
              >
                {submittingOnboard ? "Registering Agent..." : "Grant Certified Agent Access"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Agent Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 relative text-slate-900 dark:text-white transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Configure Agent: {selectedAgent.fullName}
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{selectedAgent.nationalIdRef}</span>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateAgent} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Account Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white font-bold"
                >
                  <option value="ACTIVE">ACTIVE (Approved & Sales Enabled)</option>
                  <option value="PENDING">PENDING (Awaiting Review)</option>
                  <option value="SUSPENDED">SUSPENDED (Fraud / Exposure Hold)</option>
                  <option value="REVOKED">REVOKED (Contract Terminated)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Commission Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editCommission}
                    onChange={(e) => setEditCommission(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Daily Sales Limit</label>
                  <input
                    type="number"
                    required
                    value={editDailyLimit}
                    onChange={(e) => setEditDailyLimit(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Audit Reason / Justification</label>
                <input
                  type="text"
                  required
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="e.g. KYC verified, adjusted commission tier"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={submittingEdit}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm rounded-xl transition shadow-md"
              >
                {submittingEdit ? "Updating..." : "Save Changes & Log Audit Entry"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

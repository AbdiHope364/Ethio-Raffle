"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Edit2,
  CheckCircle2,
  Lock,
  Key,
  DollarSign,
  Ticket,
  Store,
  FileText,
  Search,
  ChevronDown,
} from "lucide-react";

const ROLE_INFO: Record<string, { label: string; color: string; desc: string; icon: any }> = {
  SUPER_ADMIN: {
    label: "Super Admin",
    color: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800",
    desc: "Full unrestricted platform access, killswitches, and role granting.",
    icon: ShieldAlert,
  },
  FINANCE_ADMIN: {
    label: "Finance Admin",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800",
    desc: "Escrow settlements, payouts, refunds, VAT reconciliation, and ledger.",
    icon: DollarSign,
  },
  RAFFLE_ADMIN: {
    label: "Raffle Admin",
    color: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800",
    desc: "Campaign creation, draw scheduling, snapshot verification, and live draws.",
    icon: Ticket,
  },
  SELLER_ADMIN: {
    label: "Seller Admin",
    color: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800",
    desc: "Merchant KYC onboarding, shop approvals, and compliance suspension.",
    icon: Store,
  },
  COMPLIANCE_ADMIN: {
    label: "Compliance Admin",
    color: "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800",
    desc: "PDPP citizen data requests, regulatory reporting, and telemetry audits.",
    icon: ShieldCheck,
  },
  SUPPORT_ADMIN: {
    label: "Support Admin",
    color: "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/80 dark:text-teal-300 dark:border-teal-800",
    desc: "Ticket lookups, customer dispute resolution, and SMS dispatch.",
    icon: FileText,
  },
  AUDITOR: {
    label: "Auditor (Read-Only)",
    color: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    desc: "Independent read-only verification of ledger journals and draw proofs.",
    icon: Lock,
  },
};

export default function TeamManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [roleMatrix, setRoleMatrix] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  // New Sub-Admin Form
  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState("SUPPORT_ADMIN");
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
        setAvailableRoles(data.availableRoles || Object.keys(ROLE_INFO));
        setRoleMatrix(data.roleMatrix || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleGrantRole = async (userId: string, targetRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newRole: targetRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, role: targetRole } : u)));
        setFeedback(`Role successfully granted: ${ROLE_INFO[targetRole]?.label || targetRole}`);
        setTimeout(() => setFeedback(""), 3500);
      } else {
        alert(data.error || "Failed to grant role");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newFullName,
          phone: newPhone,
          role: newRole,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers([data.user, ...users]);
        setModalOpen(false);
        setNewFullName("");
        setNewPhone("");
        setFeedback(`Sub-admin ${newFullName} added with role ${newRole}`);
        setTimeout(() => setFeedback(""), 3500);
      } else {
        alert(data.error || "Failed to create sub-admin");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search) ||
      u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-[10px] font-black font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Role-Based Access Control (RBAC)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Team & Sub-Admin Roles
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Grant granular permissions to sub-admins following the principle of least privilege. Prevent single-point administrative compromise.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl transition shadow-lg shadow-purple-600/30 flex items-center gap-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Grant New Sub-Admin Role</span>
        </button>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Role Definitions Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(ROLE_INFO).slice(0, 4).map(([roleKey, info]) => {
          const Icon = info.icon;
          const count = users.filter((u) => u.role === roleKey).length;
          return (
            <div
              key={roleKey}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${info.color}`}>
                    {info.label}
                  </span>
                  <Icon className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{info.desc}</p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Assigned Staff</span>
                <strong className="text-slate-900 dark:text-white font-mono">{count}</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Personnel Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            <span>Administrative Roster & Active Roles</span>
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search admin name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading administrative personnel...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No sub-admins match your filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Name & Officer</th>
                  <th className="py-3 px-4">Phone (MFA Channel)</th>
                  <th className="py-3 px-4">Current Granted Role</th>
                  <th className="py-3 px-4">Change / Grant Role</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => {
                  const roleConfig = ROLE_INFO[u.role] || {
                    label: u.role,
                    color: "bg-slate-100 text-slate-800 border-slate-200",
                  };
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-black text-[11px] flex items-center justify-center">
                            {u.fullName?.charAt(0) || "A"}
                          </div>
                          <span>{u.fullName || "Admin Officer"}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">{u.phone}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${roleConfig.color}`}>
                          {roleConfig.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleGrantRole(u.id, e.target.value)}
                          className="px-2.5 py-1 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:outline-hidden focus:border-purple-500"
                        >
                          {availableRoles.map((r) => (
                            <option key={r} value={r}>
                              {ROLE_INFO[r]?.label || r}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>ACTIVE</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grant New Sub-Admin Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Grant Sub-Admin Role</h3>
                <p className="text-xs text-slate-500">Assign specific operational duties and MFA authentication.</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubAdmin} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Officer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dawit Tadesse"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Ethiopian Phone (+251...)</label>
                <input
                  type="text"
                  required
                  placeholder="+251911223344"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Administrative Role Scope</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                >
                  {availableRoles.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_INFO[r]?.label || r} — {ROLE_INFO[r]?.desc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition shadow-md disabled:opacity-50"
                >
                  {creating ? "Granting..." : "Grant Sub-Admin Access"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


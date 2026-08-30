"use client";

import React, { useState, useEffect } from "react";
import AdminShell from "@/components/AdminShell";
import {
  ShieldCheck,
  FileText,
  Trash2,
  Edit3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  User,
  Phone,
  Calendar,
  Lock,
} from "lucide-react";

export default function PrivacyAdminPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/privacy/requests");
      const data = await res.json();
      if (data.requests) setRequests(data.requests);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/privacy/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          status: newStatus,
          resolutionNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRequests(
          requests.map((r) =>
            r.id === requestId
              ? { ...r, status: newStatus, resolutionNotes, resolvedAt: new Date().toISOString() }
              : r
          )
        );
        setSelectedRequest(null);
        setResolutionNotes("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filterType !== "ALL" && r.requestType !== filterType) return false;
    if (filterStatus !== "ALL" && r.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchPhone = r.phoneNumber?.toLowerCase().includes(q);
      const matchName = r.fullName?.toLowerCase().includes(q);
      const matchDetails = r.details?.toLowerCase().includes(q);
      if (!matchPhone && !matchName && !matchDetails) return false;
    }
    return true;
  });

  const getBadgeForType = (type: string) => {
    switch (type) {
      case "ACCESS":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800";
      case "CORRECTION":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
      case "DELETION":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800";
      case "OBJECTION":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getBadgeForStatus = (status: string) => {
    switch (status) {
      case "RECEIVED":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200";
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Statutory Data Governance
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Data Subject Requests (PDPP No. 1321/2024)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Fulfill customer statutory rights regarding personal data access, correction, erasure, and objection under Ethiopian Communications Authority guidelines.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-400 uppercase">Total Requests</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{requests.length}</div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by phone, name, details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Request Types</option>
              <option value="ACCESS">Access (Export)</option>
              <option value="CORRECTION">Correction (Rectify)</option>
              <option value="DELETION">Deletion (Erasure)</option>
              <option value="OBJECTION">Objection</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="RECEIVED">Received</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">Loading statutory requests...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">No data subject requests found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Applicant</th>
                    <th className="py-3.5 px-4">Request Type</th>
                    <th className="py-3.5 px-4">Details / Justification</th>
                    <th className="py-3.5 px-4">Submitted</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {req.fullName || "Unregistered Applicant"}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-emerald-500" />
                          <span>{req.phoneNumber}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono border ${getBadgeForType(req.requestType)}`}>
                          {req.requestType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                          {req.details}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(req.submittedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getBadgeForStatus(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setResolutionNotes(req.resolutionNotes || "");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition"
                        >
                          Review & Act
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Resolution Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    Fulfill Data Subject Request
                  </h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-mono border ${getBadgeForType(selectedRequest.requestType)}`}>
                  {selectedRequest.requestType}
                </span>
              </div>

              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <span className="text-slate-400 block font-bold uppercase text-[10px]">Applicant</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedRequest.fullName || "Unregistered"} ({selectedRequest.phoneNumber})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold uppercase text-[10px]">Submitted Explanation</span>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {selectedRequest.details}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Resolution Notes / Action Record
                </label>
                <textarea
                  rows={3}
                  placeholder="Record fulfillment action (e.g. 'Data export sent via secure SMS link', 'Deleted all KYC records and phone associations')..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selectedRequest.id, "REJECTED")}
                    className="px-3.5 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-bold transition disabled:opacity-50"
                  >
                    Reject Request
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selectedRequest.id, "COMPLETED")}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md disabled:opacity-50"
                  >
                    {actionLoading ? "Saving..." : "Mark Completed"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}


"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@raffle/shared";
import {
  Ticket,
  PlusCircle,
  ShieldCheck,
  Trophy,
  Lock,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function AdminRafflesPage() {
  const { t, language } = useI18n();

  const [raffles, setRaffles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    titleAm: "",
    description: "",
    descriptionAm: "",
    category: "VEHICLE",
    prizeName: "",
    prizeNameAm: "",
    prizeImage: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80",
    prizeValue: "1500000",
    ticketPrice: "100",
    totalTickets: "5000",
    maxTicketsPerUser: "50",
    drawDays: "7",
  });

  useEffect(() => {
    fetchRaffles();
  }, []);

  const fetchRaffles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/raffles");
      const data = await res.json();
      if (data.raffles) {
        setRaffles(data.raffles);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRaffle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/raffles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setIsCreateOpen(false);
        setFormData({
          title: "",
          titleAm: "",
          description: "",
          descriptionAm: "",
          category: "VEHICLE",
          prizeName: "",
          prizeNameAm: "",
          prizeImage: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80",
          prizeValue: "1500000",
          ticketPrice: "100",
          totalTickets: "5000",
          maxTicketsPerUser: "50",
          drawDays: "7",
        });
        fetchRaffles();
      } else {
        alert(data.error || "Failed to create raffle");
      }
    } catch (e: any) {
      alert(e.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Ticket className="w-7 h-7 text-purple-400" />
            <span>{t.admin.manageRaffles}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create campaigns, configure ticket caps, and auto-generate SHA-256 pre-commitments.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl transition shadow-lg shadow-purple-600/30 flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.admin.createRaffle}</span>
        </button>
      </div>

      {/* Raffles Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Raffle / Prize</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Ticket Price</th>
                <th className="py-3 px-4">Sold / Total</th>
                <th className="py-3 px-4">SHA-256 Pre-Commitment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Loading campaigns...
                  </td>
                </tr>
              ) : (
                raffles.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.prizeImage}
                          alt={r.title}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-800 shrink-0"
                        />
                        <div>
                          <div className="font-extrabold text-white line-clamp-1">{r.title}</div>
                          <div className="text-[10px] text-slate-400">{r.prizeName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-300">
                      {r.category.replace("_", " ")}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {r.ticketPrice} ETB
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <div className="font-bold">
                        {r.soldTickets} / {r.totalTickets}
                      </div>
                      <div className="text-[10px] text-emerald-400">
                        {Math.round((r.soldTickets / r.totalTickets) * 100)}% sold
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {r.commitHash ? (
                        <span className="font-mono text-[10px] text-purple-300 bg-purple-950/60 px-2 py-1 rounded border border-purple-800 block truncate max-w-[120px]" title={r.commitHash}>
                          {r.commitHash.substring(0, 10)}...
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          r.status === "ACTIVE"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : r.status === "DRAWN"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {r.status === "ACTIVE" && (
                        <Link
                          href={`/draws?raffleId=${r.id}`}
                          className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] transition shadow-xs inline-flex items-center gap-1"
                        >
                          <Trophy className="w-3 h-3" /> Live Draw
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Raffle Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-6 relative max-h-[90vh] overflow-y-auto text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-purple-400" />
                <span>{t.admin.createRaffle}</span>
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateRaffle} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">Title (English)</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. 2025 Hyundai Tucson 4WD"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-purple-500 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">Title (Amharic - አማርኛ)</label>
                  <input
                    type="text"
                    value={formData.titleAm}
                    onChange={(e) => setFormData({ ...formData, titleAm: e.target.value })}
                    placeholder="ለምሳሌ፡ 2025 ሂዩንዳይ ቱክሰን"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-purple-500 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">Prize Name</label>
                  <input
                    type="text"
                    required
                    value={formData.prizeName}
                    onChange={(e) => setFormData({ ...formData, prizeName: e.target.value })}
                    placeholder="Hyundai Tucson 2025"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-purple-500 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-purple-500 text-white"
                  >
                    <option value="VEHICLE">Vehicles & Cars</option>
                    <option value="REAL_ESTATE">Real Estate & Condos</option>
                    <option value="ELECTRONICS">Electronics & Phones</option>
                    <option value="CASH">Cash Jackpot</option>
                    <option value="LUXURY">Luxury Goods</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">Prize Photo URL</label>
                <input
                  type="url"
                  required
                  value={formData.prizeImage}
                  onChange={(e) => setFormData({ ...formData, prizeImage: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-purple-500 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">Ticket Price (ETB)</label>
                  <input
                    type="number"
                    required
                    value={formData.ticketPrice}
                    onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-purple-500 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">Total Ticket Cap</label>
                  <input
                    type="number"
                    required
                    value={formData.totalTickets}
                    onChange={(e) => setFormData({ ...formData, totalTickets: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-purple-500 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">Draw Duration (Days)</label>
                  <input
                    type="number"
                    required
                    value={formData.drawDays}
                    onChange={(e) => setFormData({ ...formData, drawDays: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-purple-500 text-white"
                  />
                </div>
              </div>

              <div className="bg-purple-950/60 p-3 rounded-xl border border-purple-800/80 text-xs text-purple-200 flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400 shrink-0" />
                <span>
                  The system will automatically generate a cryptographically strong 256-bit secret seed and publish its SHA-256 hash upon creation.
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm rounded-xl transition shadow-lg shadow-purple-600/30"
              >
                {submitting ? "Creating & Publishing Commitment..." : "Create & Launch Raffle"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@raffle/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Image,
  DollarSign,
  Ticket,
  Calendar,
  Lock,
} from "lucide-react";

export default function CreateRafflePage() {
  const { language } = useI18n();
  const router = useRouter();

  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    titleAm: "",
    description: "",
    descriptionAm: "",
    category: "VEHICLE",
    prizeName: "",
    prizeNameAm: "",
    prizeImage: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80",
    prizeValue: "1800000",
    ticketPrice: "200",
    totalTickets: "10000",
    maxTicketsPerUser: "100",
    drawDays: "7",
  });

  useEffect(() => {
    fetch("/api/seller/me")
      .then((r) => r.json())
      .then((d) => {
        setSeller(d.seller);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/seller/raffles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sellerId: seller?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Submission failed.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/seller");
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <Link
        href="/seller"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Seller Dashboard</span>
      </Link>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {language === "AM" ? "አዲስ የዕጣ እቃ ያስገቡ" : "Submit New Raffle Item"}
            </h1>
            <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold block">
              Gate 2 Moderation: Starts as PENDING_APPROVAL
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Listing submitted to Admin Moderation Queue. Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title EN */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Raffle Campaign Title (English) *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. 2026 Suzuki Dzire Premium Edition"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Title AM */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Raffle Campaign Title (Amharic)
              </label>
              <input
                type="text"
                value={formData.titleAm}
                onChange={(e) => setFormData({ ...formData, titleAm: e.target.value })}
                placeholder="ለምሳሌ፡ የ 2026 ሱዙኪ ዲዛይር አዲስ መኪና"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Prize Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Grand Prize Name *
              </label>
              <input
                type="text"
                required
                value={formData.prizeName}
                onChange={(e) => setFormData({ ...formData, prizeName: e.target.value })}
                placeholder="e.g. Suzuki Dzire 2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Prize Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="VEHICLE">Vehicles & Automotive</option>
                <option value="REAL_ESTATE">Real Estate & Apartments</option>
                <option value="ELECTRONICS">Electronics & Smart Devices</option>
                <option value="CASH">Cash Prizes & Vouchers</option>
                <option value="LUXURY">Luxury & Jewelry</option>
              </select>
            </div>

            {/* Estimated Value */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Estimated Asset Value (ETB) *
              </label>
              <input
                type="number"
                required
                value={formData.prizeValue}
                onChange={(e) => setFormData({ ...formData, prizeValue: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Ticket Price */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Ticket Price (ETB) *
              </label>
              <input
                type="number"
                required
                value={formData.ticketPrice}
                onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Total Tickets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Total Tickets Cap *
              </label>
              <input
                type="number"
                required
                value={formData.totalTickets}
                onChange={(e) => setFormData({ ...formData, totalTickets: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Duration Days */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Campaign Duration (Days)
              </label>
              <input
                type="number"
                value={formData.drawDays}
                onChange={(e) => setFormData({ ...formData, drawDays: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Prize Image URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              High-Resolution Item Image URL *
            </label>
            <input
              type="url"
              required
              value={formData.prizeImage}
              onChange={(e) => setFormData({ ...formData, prizeImage: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 font-mono">
            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>SHA-256 Pre-Commitment Protocol</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              Upon submission, our system will generate a cryptographic secret seed and publish the pre-draw commitment hash to the blockchain ledger.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || success}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm rounded-xl transition shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span>Generating Cryptographic Pre-Commitments...</span>
            ) : (
              <span>Submit Item for Administrative Moderation</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}


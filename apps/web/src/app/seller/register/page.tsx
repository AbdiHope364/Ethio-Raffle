"use client";

import React, { useState } from "react";
import { useI18n } from "@raffle/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  FileText,
  Phone,
  User,
  MapPin,
  CreditCard,
  Sparkles,
} from "lucide-react";

export default function SellerRegisterPage() {
  const { language } = useI18n();
  const router = useRouter();

  const [formData, setFormData] = useState({
    businessName: "",
    contactPerson: "",
    phone: "",
    tinNumber: "",
    faydaIdNumber: "",
    licenseRef: "",
    region: "Addis Ababa",
    payoutAccount: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/seller/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit application.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-8 sm:p-10 border border-slate-700 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold font-mono">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>PLATFORM PROVIDER MULTI-VENDOR</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {language === "AM" ? "የነጋዴ እና ሻጭ ምዝገባ" : "Become an Authorized Seller"}
          </h1>

          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            {language === "AM"
              ? "እቃዎችዎን በ Lucky Ticket ፍትሃዊ የዕጣ መድረክ ላይ በማቅረብ ለሽያጭ ያቅርቡ። ሁሉም ዝርዝሮች በአስተዳዳሪ ከተረጋገጡ በኋላ ወዲያውኑ ለህዝብ ይፋ ይሆናሉ።"
              : "List your high-value vehicles, real estate, electronics, or luxury products on Ethiopia's licensed provably fair raffle infrastructure. Reach thousands of buyers across digital and agent channels."}
          </p>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/15 to-transparent pointer-events-none" />
      </div>

      {submitted ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {language === "AM" ? "ማመልከቻዎ በተሳካ ሁኔታ ቀርቧል!" : "Application Submitted Successfully!"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {language === "AM"
                ? "የእርስዎ መረጃ እና የንግድ ፈቃድ በአስተዳዳሪው እየተገመገመ ነው። ሲረጋገጥ የዕጣ እቃዎችን መዘርዘር ይችላሉ።"
                : "Your merchant details and trade documents are in the Administrative Review Queue (Gate 1). Once verified, you will be authorized to submit raffle item listings."}
            </p>
          </div>

          <div className="pt-4 flex justify-center gap-4">
            <Link
              href="/seller"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition flex items-center gap-2"
            >
              <span>Go to Seller Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Business Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Business / Company Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="e.g. Addis Motors Trading PLC"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Authorized Representative *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="e.g. Eyob Bekele"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Official Contact Phone *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+251911..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* TIN Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Tax Identification Number (TIN)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.tinNumber}
                    onChange={(e) => setFormData({ ...formData, tinNumber: e.target.value })}
                    placeholder="0012345678"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* National ID (Fayda ID) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  National ID (Fayda ID Number) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.faydaIdNumber}
                    onChange={(e) => setFormData({ ...formData, faydaIdNumber: e.target.value })}
                    placeholder="e.g. FAN-9821-4421-90"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500 transition"
                  />
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Trade License Ref */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Trade License / Registration Ref
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.licenseRef}
                    onChange={(e) => setFormData({ ...formData, licenseRef: e.target.value })}
                    placeholder="LIC-AA-2026-9812"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Region */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Operational Region
                </label>
                <div className="relative">
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value="Addis Ababa">Addis Ababa</option>
                    <option value="Dire Dawa">Dire Dawa</option>
                    <option value="Oromia / Adama">Oromia / Adama</option>
                    <option value="Amhara / Bahir Dar">Amhara / Bahir Dar</option>
                    <option value="Hawassa / Sidama">Hawassa / Sidama</option>
                    <option value="Tigray / Mekelle">Tigray / Mekelle</option>
                  </select>
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>
            </div>

            {/* Payout Account */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Settlement Payout Account (Telebirr / CBE Account)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.payoutAccount}
                  onChange={(e) => setFormData({ ...formData, payoutAccount: e.target.value })}
                  placeholder="e.g. Telebirr 0911... or CBE 1000..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
                />
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm rounded-xl transition shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Submitting KYC Credentials...</span>
              ) : (
                <>
                  <span>Submit Merchant Onboarding Application</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}


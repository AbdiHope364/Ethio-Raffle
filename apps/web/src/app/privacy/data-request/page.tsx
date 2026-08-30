"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useI18n } from "@raffle/shared";
import {
  ShieldCheck,
  FileText,
  Trash2,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Building2,
  Lock,
} from "lucide-react";

export default function DataPrivacyRequestPage() {
  const { language } = useI18n();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [requestType, setRequestType] = useState<"ACCESS" | "CORRECTION" | "DELETION" | "OBJECTION">("ACCESS");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/privacy/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          fullName,
          requestType,
          details,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit request");

      setSubmittedResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestOptions = [
    {
      id: "ACCESS",
      title: language === "AM" ? "የመረጃ ቅጂ ማግኘት (Access)" : "Right of Access",
      desc: language === "AM" ? "በሲስተሙ የተመዘገቡትን ግብይቶች እና የቲኬት መረጃዎች ቅጂ ማግኘት" : "Request a full export of your personal data, ticket purchases, and transaction history.",
      icon: FileText,
      color: "text-blue-500",
    },
    {
      id: "CORRECTION",
      title: language === "AM" ? "መረጃ ማረም (Correction)" : "Right to Rectification",
      desc: language === "AM" ? "የተሳሳተ ስም፣ ስልክ ቁጥር ወይም አድራሻ ማስተካከል" : "Update or rectify incorrect identity, contact, or settlement details.",
      icon: Edit3,
      color: "text-amber-500",
    },
    {
      id: "DELETION",
      title: language === "AM" ? "መረጃ መሰረዝ (Deletion)" : "Right to Erasure / Deletion",
      desc: language === "AM" ? "የተጠናቀቁ ጨዋታዎች መረጃዎችን ከዳታቤዝ እንዲሰረዙ መጠየቅ" : "Request permanent removal of your account, KYC records, and identifiers.",
      icon: Trash2,
      color: "text-red-500",
    },
    {
      id: "OBJECTION",
      title: language === "AM" ? "መቃወም (Objection)" : "Right to Object / Restrict",
      desc: language === "AM" ? "መረጃዎን ለሌሎች አገልግሎቶች እንዳይውል መቃወም" : "Object to processing or automated decisions regarding your account.",
      icon: AlertTriangle,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === "AM" ? "ወደ ዋናው ገጽ ተመለስ" : "Back to Home"}</span>
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider text-emerald-600 dark:text-emerald-400">
                PROCLAMATION NO. 1321/2024
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {language === "AM" ? "የግል መረጃ ጥበቃ እና የመብት መጠየቂያ" : "Data Privacy & Data Subject Rights"}
              </h1>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {language === "AM"
              ? "በኢትዮጵያ ፌዴራላዊ ዴሞክራሲያዊ ሪፐብሊክ የግል መረጃ ጥበቃ አዋጅ ቁጥር 1321/2016 መሰረት ተጠቃሚዎች መረጃቸውን የመመልከት፣ የማረም እና የመሰረዝ ሙሉ ህጋዊ መብት አላቸው።"
              : "In accordance with the Ethiopian Personal Data Protection Proclamation No. 1321/2024, you have full statutory rights regarding your personal information, KYC records, and transaction logs stored on Idil."}
          </p>
        </div>

        {submittedResult ? (
          /* Success Screen */
          <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-8 shadow-sm text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {language === "AM" ? "ጥያቄዎ በተሳካ ሁኔታ ተመዝግቧል" : "Request Submitted Successfully"}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              {language === "AM"
                ? "የመረጃ ጥበቃ ኃላፊዎቻችን ጥያቄዎን መርምረው በህጉ በተቀመጠው የጊዜ ገደብ ውስጥ ምላሽ ይሰጣሉ።"
                : "Our Data Governance team will review and process your statutory request in compliance with ECA guidelines."}
            </p>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 max-w-sm mx-auto">
              <div className="text-slate-400 mb-1">REFERENCE TICKET ID</div>
              <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400 select-all">
                {submittedResult.requestId}
              </div>
            </div>
            <div className="pt-4">
              <button
                onClick={() => {
                  setSubmittedResult(null);
                  setDetails("");
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 font-semibold">
                {error}
              </div>
            )}

            {/* Select Right */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {language === "AM" ? "1. የመብት አይነት ይምረጡ" : "1. Select Statutory Request Type"}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {requestOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = requestType === opt.id;
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setRequestType(opt.id as any)}
                      className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-emerald-50/70 dark:bg-emerald-950/60 border-emerald-500 shadow-xs"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon className={`w-4 h-4 ${opt.color}`} />
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {opt.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                        {opt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {language === "AM" ? "2. የተጠቃሚ መረጃ" : "2. Applicant Identifier"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Phone Number (ስልክ ቁጥር) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+2519..."
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Full Legal Name (ሙሉ ስም)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Abebe Kebede"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Request Explanation / Specifications *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe specifically which transactions, personal records, or deletion action you are requesting..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Legal Notice & Submit */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All requests logged under Ethiopian Communications Authority (ECA) Data Protection mandate.</span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 shrink-0"
              >
                {loading ? "Submitting..." : "Submit Statutory Request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


"use client";

import React, { useState } from "react";
import { useI18n } from "@raffle/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Phone,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Lock,
} from "lucide-react";

export default function SellerLoginPage() {
  const { language } = useI18n();
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setError("");

    try {
      // Set session cookie
      document.cookie = `raffle_session_phone=${encodeURIComponent(phone.trim())}; path=/; max-age=604800`;
      document.cookie = `raffle_user_phone=${encodeURIComponent(phone.trim())}; path=/; max-age=604800`;

      router.push("/seller");
    } catch (err: any) {
      setError(err.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-8 border border-slate-700 shadow-xl text-center space-y-4 relative overflow-hidden">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
          <Building2 className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
            MERCHANT VENDOR PORTAL
          </span>
          <h1 className="text-2xl font-black">
            {language === "AM" ? "የነጋዴ መግቢያ" : "Seller Sign In"}
          </h1>
          <p className="text-xs text-slate-300">
            {language === "AM"
              ? "የተመዘገቡበትን ስልክ ቁጥር ያስገቡና ወደ ዳሽቦርድዎ ይግቡ።"
              : "Enter your registered merchant mobile phone number to access your seller dashboard."}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Registered Phone Number
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+251 911 223 344 or 0911223344"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500 transition"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <span>{loading ? "Signing In..." : "Access Seller Dashboard"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Don't have an approved merchant account?{" "}
            <Link
              href="/seller/register"
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              Apply with Fayda ID
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


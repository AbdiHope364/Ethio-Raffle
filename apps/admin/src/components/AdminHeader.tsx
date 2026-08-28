"use client";

import React, { useState, useEffect } from "react";
import { useI18n, DEMO_ACCOUNTS } from "@raffle/shared";
import {
  Shield,
  Globe,
  RefreshCw,
  ChevronDown,
  UserCheck,
  Award,
} from "lucide-react";

export default function AdminHeader() {
  const { t, language, setLanguage } = useI18n();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setCurrentUser(d.user);
      })
      .catch(console.error);
  }, []);

  const switchUser = async (phone: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setIsOpen(false);
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const adminPersonas = DEMO_ACCOUNTS.filter(
    (a) => a.role === "ADMIN" || a.role === "SUPER_ADMIN"
  );

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-xs text-slate-300 font-bold bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>National Lottery Admin Certified</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Language Switcher */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
          <Globe className="w-3.5 h-3.5 text-slate-400 ml-1 mr-1.5" />
          <button
            onClick={() => setLanguage("EN")}
            className={`px-2 py-0.5 rounded-lg transition ${
              language === "EN"
                ? "bg-purple-600 text-white font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage("AM")}
            className={`px-2 py-0.5 rounded-lg transition ${
              language === "AM"
                ? "bg-purple-600 text-white font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            አማርኛ
          </button>
        </div>

        {/* Persona Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-white transition"
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-bold">
              {currentUser?.fullName || "Sara Haile (Admin)"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Switch Admin Operator
              </div>
              <div className="divide-y divide-slate-800 mt-1">
                {adminPersonas.map((acc) => (
                  <button
                    key={acc.phone}
                    onClick={() => switchUser(acc.phone)}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-800 text-xs transition"
                  >
                    <div className="font-bold text-white">{acc.name}</div>
                    <div className="text-[11px] text-purple-400 font-mono">{acc.role}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


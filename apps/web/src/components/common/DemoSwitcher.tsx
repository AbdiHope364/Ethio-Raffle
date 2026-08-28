"use client";

import React, { useState, useEffect } from "react";
import { UserCheck, Shield, Store, User, RefreshCw, ChevronDown, Wallet } from "lucide-react";
import { DEMO_ACCOUNTS } from "@/lib/auth-types";

export default function DemoSwitcher() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUser();
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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <span className="bg-purple-700 text-purple-100 text-xs px-2 py-0.5 rounded font-semibold flex items-center gap-1"><Shield className="w-3 h-3" /> Super Admin</span>;
      case "ADMIN":
        return <span className="bg-blue-700 text-blue-100 text-xs px-2 py-0.5 rounded font-semibold flex items-center gap-1"><Shield className="w-3 h-3" /> Admin</span>;
      case "AGENT":
        return <span className="bg-emerald-700 text-emerald-100 text-xs px-2 py-0.5 rounded font-semibold flex items-center gap-1"><Store className="w-3 h-3" /> Agent</span>;
      default:
        return <span className="bg-slate-700 text-slate-100 text-xs px-2 py-0.5 rounded font-semibold flex items-center gap-1"><User className="w-3 h-3" /> Customer</span>;
    }
  };

  return (
    <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 border-b border-slate-800 relative z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            Active Demo Persona:
          </span>
          <span className="font-bold text-white flex items-center gap-1.5">
            {currentUser?.fullName || "Helen Tesfaye"} ({currentUser?.phone || "+251933445566"})
          </span>
          {getRoleBadge(currentUser?.role || "CUSTOMER")}
          {currentUser?.role === "AGENT" && currentUser?.floatBalance !== undefined && (
            <span className="bg-emerald-950 border border-emerald-700/50 text-emerald-300 text-xs px-2 py-0.5 rounded flex items-center gap-1">
              <Wallet className="w-3 h-3 text-emerald-400" />
              Float: <strong className="text-white">{currentUser.floatBalance.toLocaleString()} ETB</strong>
            </span>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors"
          >
            {loading ? (
              <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
            ) : (
              <RefreshCw className="w-3 h-3 text-emerald-400" />
            )}
            <span>Switch Persona / Role</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-2 z-50">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Select Persona to Test Roles
              </div>
              <div className="divide-y divide-slate-800 max-h-72 overflow-y-auto mt-1">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.phone}
                    onClick={() => switchUser(acc.phone)}
                    className={`w-full text-left p-2 rounded hover:bg-slate-800 transition flex items-start justify-between gap-2 ${
                      currentUser?.phone === acc.phone ? "bg-slate-800/80 border-l-2 border-emerald-500" : ""
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        {acc.name}
                      </div>
                      <div className="text-slate-400 text-[11px] font-mono">{acc.phone}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{acc.description}</div>
                    </div>
                    <div>{getRoleBadge(acc.role)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

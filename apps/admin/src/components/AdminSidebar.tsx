"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@raffle/shared";
import {
  LayoutDashboard,
  Ticket,
  Users,
  Trophy,
  Wallet,
  ShieldCheck,
  FileText,
  Settings,
  ExternalLink,
  Store,
  Sparkles,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { t, language } = useI18n();

  const links = [
    { href: "/", label: "Overview & Telemetry", icon: LayoutDashboard },
    { href: "/raffles", label: t.admin.manageRaffles, icon: Ticket },
    { href: "/agents", label: t.admin.manageAgents, icon: Store },
    { href: "/draws", label: t.admin.liveDrawRoom, icon: Trophy },
    { href: "/financials", label: t.admin.financialLedger, icon: Wallet },
    { href: "/audits", label: "Security & Audit Trail", icon: ShieldCheck },
    { href: "/settings", label: "NLA & Gateways Config", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-purple-600/30">
            <Ticket className="w-5 h-5 -rotate-12" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5">
              Lucky<span className="text-purple-400">Ethio</span>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Admin
              </span>
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              Operations Console
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-3 space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 font-extrabold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Switch to Web Client Footer link */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-bold text-slate-300 border border-slate-700 transition group"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Open Web Client (3000)</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
        </a>

        <div className="text-[10px] text-slate-500 text-center font-mono">
          NLA Permit: NLA/ETH/2026/89
        </div>
      </div>
    </aside>
  );
}


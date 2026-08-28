"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n, useTheme, DEMO_ACCOUNTS, LuckyTicketIcon } from "@raffle/shared";
import {
  LayoutDashboard,
  Ticket,
  Users,
  Trophy,
  Wallet,
  ShieldCheck,
  Settings,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Menu,
  X,
  Globe,
  Sun,
  Moon,
  Shield,
  Award,
} from "lucide-react";

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const { t, language, setLanguage } = useI18n();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [personaOpen, setPersonaOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(DEMO_ACCOUNTS[0]); // Default to Super Admin

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const switchUser = (phone: string) => {
    const acc = DEMO_ACCOUNTS.find((a) => a.phone === phone);
    if (acc) {
      document.cookie = `raffle_session_phone=${acc.phone}; path=/; max-age=86400`;
      setCurrentUser(acc);
      setPersonaOpen(false);
      window.location.reload();
    }
  };

  const links = [
    { href: "/", label: t.admin.overview, icon: LayoutDashboard },
    { href: "/raffles", label: t.admin.manageRaffles, icon: Ticket },
    { href: "/agents", label: t.admin.manageAgents, icon: Users },
    { href: "/draws", label: t.admin.liveDrawRoom, icon: Trophy },
    { href: "/financials", label: t.admin.financialLedger, icon: Wallet },
    { href: "/audits", label: t.admin.securityAudits, icon: ShieldCheck },
    { href: "/settings", label: t.admin.systemSettings, icon: Settings },
  ];

  const adminPersonas = DEMO_ACCOUNTS.filter(
    (a) => a.role === "ADMIN" || a.role === "SUPER_ADMIN"
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar (Desktop + Mobile Slide-over) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <LuckyTicketIcon size={36} />
              <div>
                <div className="font-black text-sm text-amber-500 dark:text-amber-400 tracking-tight flex items-center leading-none">
                  <span>LUCKY</span>
                  <span className="text-amber-400 dark:text-amber-300 ml-1">TICKET</span>
                  <span className="text-[8px] uppercase font-black px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 ml-1.5">
                    Admin
                  </span>
                </div>
                <span className="text-[9px] text-purple-600 dark:text-purple-400 font-extrabold uppercase font-mono tracking-wider block mt-0.5 leading-none">
                  OPERATIONS CONSOLE
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
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
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Switch to Web Client Footer link */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900 transition-colors">
          <a
            href={process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition group"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Customer Web Portal</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
          </a>

          <div className="text-[10px] text-slate-400 dark:text-slate-500 text-center font-mono">
            NLA Permit: NLA/ETH/2026/89
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Responsive Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>

            <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <Award className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>National Lottery Authority Certified</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
              title={resolvedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-slate-600" />
              )}
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-1 mr-1 hidden sm:inline-block" />
              <button
                onClick={() => setLanguage("EN")}
                className={`px-2 py-0.5 rounded-lg transition text-[11px] sm:text-xs ${
                  language === "EN"
                    ? "bg-purple-600 text-white font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("AM")}
                className={`px-2 py-0.5 rounded-lg transition text-[11px] sm:text-xs ${
                  language === "AM"
                    ? "bg-purple-600 text-white font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                አማርኛ
              </button>
            </div>

            {/* Persona Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPersonaOpen(!personaOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white transition max-w-[140px] sm:max-w-none"
              >
                <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                <span className="font-bold truncate text-[11px] sm:text-xs">
                  {currentUser?.fullName ? currentUser.fullName.split(" ")[0] : "Admin"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {personaOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    Switch Admin Operator
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-1">
                    {adminPersonas.map((acc) => (
                      <button
                        key={acc.phone}
                        onClick={() => switchUser(acc.phone)}
                        className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition"
                      >
                        <div className="font-bold text-slate-900 dark:text-white">{acc.name}</div>
                        <div className="text-[11px] text-purple-600 dark:text-purple-400 font-mono">{acc.role}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

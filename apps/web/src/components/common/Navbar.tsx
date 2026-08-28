"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n, useTheme, LuckyTicketIcon } from "@raffle/shared";
import AdminStealthAuthModal from "@/components/auth/AdminStealthAuthModal";
import {
  Ticket,
  Trophy,
  ShieldCheck,
  Store,
  LayoutDashboard,
  Smartphone,
  Globe,
  Menu,
  X,
  Sparkles,
  Bell,
  Check,
  Sun,
  Moon,
  Building2,
} from "lucide-react";

export default function Navbar() {
  const { t, language, setLanguage } = useI18n();
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stealthModalOpen, setStealthModalOpen] = useState(false);

  // Stealth Hotkey Listener: Ctrl + Shift + A (or Cmd + Shift + A)
  useEffect(() => {
    const handleHotkey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        setStealthModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleHotkey);
    return () => window.removeEventListener("keydown", handleHotkey);
  }, []);

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    fetchUserSession();
    fetchNotifications();
  }, []);

  const fetchUserSession = async () => {
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

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: any) => !n.read).length);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const isAgent = currentUser?.role === "AGENT" || currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN";

  const navLinks: { href: string; label: string; icon: any; badge?: string; external?: boolean }[] = [
    { href: "/", label: t.common.raffles, icon: Ticket },
    { href: "/my-tickets", label: t.common.myTickets, icon: Sparkles },
    { href: "/winners", label: t.common.winners, icon: Trophy },
    { href: "/verifier", label: t.common.verifier, icon: ShieldCheck },
    ...(isAgent ? [{ href: "/agent", label: t.common.agentPortal, icon: Store, badge: "POS" }] : []),
    { href: "/agent/ussd-simulator", label: t.common.ussdSimulator, icon: Smartphone },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      <AdminStealthAuthModal isOpen={stealthModalOpen} onClose={() => setStealthModalOpen(false)} />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="relative group-hover:scale-105 transition-transform duration-200">
              <LuckyTicketIcon size={42} />
            </div>
            <div>
              <div className="font-black text-base sm:text-lg text-amber-500 dark:text-amber-400 tracking-tight flex items-center leading-none">
                <span>LUCKY</span>
                <span className="text-amber-400 dark:text-amber-300 ml-1">TICKET</span>
              </div>
              <span className="text-[8px] sm:text-[9px] text-blue-600 dark:text-blue-400 font-extrabold uppercase font-mono tracking-wider block mt-0.5 leading-none">
                {language === "AM" ? "ዲጂታል የዕጣ መድረክ" : "DIGITAL RAFFLE PLATFORM"}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200/60 dark:border-purple-800/60"
                >
                  <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>{item.label}</span>
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] uppercase font-bold rounded bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100">
                    {item.badge}
                  </span>
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs border border-emerald-200/60 dark:border-emerald-800/60"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] uppercase font-bold rounded bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions: Theme Toggle + Notification Bell + Language Toggle */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Theme Toggle Button (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-800"
              title={resolvedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-800"
                title="Buyer Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{language === "AM" ? "ማሳወቂያዎች" : "Buyer Alerts & Draws"}</span>
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline font-bold"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 mt-1">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No recent notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl text-xs transition ${
                            !n.isRead
                              ? "bg-emerald-50/60 dark:bg-emerald-950/40 font-semibold"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {language === "AM" && n.titleAm ? n.titleAm : n.title}
                            </span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 leading-snug">
                            {language === "AM" && n.messageAm ? n.messageAm : n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ml-1 mr-1.5" />
              <button
                onClick={() => setLanguage("EN")}
                className={`px-2 py-1 rounded transition-colors ${
                  language === "EN"
                    ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("AM")}
                className={`px-2 py-1 rounded transition-colors ${
                  language === "AM"
                    ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                አማርኛ
              </button>
            </div>
          </div>

          {/* Mobile Actions: Theme + Lang + Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              title="Toggle theme"
            >
              {resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
            <button
              onClick={() => setLanguage(language === "EN" ? "AM" : "EN")}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700"
            >
              {language === "EN" ? "አማ" : "EN"}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span>{item.label}</span>
                </div>
                <span className="px-2 py-0.5 text-xs font-bold rounded bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100">
                  {item.badge}
                </span>
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}

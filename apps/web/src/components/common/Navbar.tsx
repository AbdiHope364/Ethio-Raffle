"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
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
} from "lucide-react";

export default function Navbar() {
  const { t, language, setLanguage } = useI18n();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setCurrentUser(d.user);
          fetchNotifications(d.user.phone);
        } else {
          fetchNotifications();
        }
      })
      .catch(console.error);
  }, []);

  const fetchNotifications = async (phone?: string) => {
    try {
      const url = phone ? `/api/notifications?phone=${encodeURIComponent(phone)}` : "/api/notifications";
      const res = await fetch(url);
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    try {
      if (currentUser?.phone) {
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markAllRead: true, phone: currentUser.phone }),
        });
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isAdmin = currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN";
  const isAgent = currentUser?.role === "AGENT" || isAdmin;

  const navLinks = [
    { href: "/", label: t.common.raffles, icon: Ticket },
    { href: "/my-tickets", label: t.common.myTickets, icon: Sparkles },
    { href: "/winners", label: t.common.winners, icon: Trophy },
    { href: "/verifier", label: t.common.verifier, icon: ShieldCheck },
    ...(isAgent ? [{ href: "/agent", label: t.common.agentPortal, icon: Store, badge: "POS" }] : []),
    ...(isAdmin ? [{ href: "http://localhost:3001", label: t.common.adminDashboard, icon: LayoutDashboard, badge: "Admin", external: true }] : []),
    { href: "/agent/ussd-simulator", label: t.common.ussdSimulator, icon: Smartphone },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Ticket className="w-5 h-5 -rotate-12" />
              {/* Ethiopian Mini Tricolor indicator */}
              <div className="absolute -bottom-1 -right-1 flex h-2 w-4 rounded overflow-hidden shadow-xs border border-white">
                <div className="w-1/3 bg-[#009A44]" />
                <div className="w-1/3 bg-[#FEDD00]" />
                <div className="w-1/3 bg-[#EF3340]" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1">
                Lucky<span className="text-emerald-600">Ethio</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium block leading-none">
                {language === "AM" ? "የኢትዮጵያ ፍትሃዊ ሎተሪ" : "Licensed Ethiopian Raffle"}
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
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-purple-700 bg-purple-50 hover:bg-purple-100"
                >
                  <Icon className="w-4 h-4 text-purple-600" />
                  <span>{item.label}</span>
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] uppercase font-bold rounded bg-purple-200 text-purple-900">
                    {item.badge}
                  </span>
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] uppercase font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions: Notification Bell + Language Toggle */}
          <div className="hidden md:flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                title="Buyer Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-emerald-600" />
                      <span>{language === "AM" ? "ማሳወቂያዎች" : "Buyer Alerts & Draws"}</span>
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[11px] text-emerald-700 hover:underline font-bold"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 mt-1">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No recent notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl text-xs transition ${
                            !n.isRead ? "bg-emerald-50/60 font-semibold" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-bold text-slate-900">
                              {language === "AM" && n.titleAm ? n.titleAm : n.title}
                            </span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
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
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1 mr-1.5" />
              <button
                onClick={() => setLanguage("EN")}
                className={`px-2 py-1 rounded transition-colors ${
                  language === "EN"
                    ? "bg-white text-emerald-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("AM")}
                className={`px-2 py-1 rounded transition-colors ${
                  language === "AM"
                    ? "bg-white text-emerald-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                አማርኛ
              </button>
            </div>
          </div>

          {/* Mobile Actions Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setLanguage(language === "EN" ? "AM" : "EN")}
              className="p-1.5 rounded-lg bg-slate-100 text-xs font-bold text-emerald-700 border border-slate-200"
            >
              {language === "EN" ? "አማ" : "EN"}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium text-purple-700 bg-purple-50"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-purple-600" />
                  <span>{item.label}</span>
                </div>
                <span className="px-2 py-0.5 text-xs font-bold rounded bg-purple-200 text-purple-900">
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
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-slate-500" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-100 text-emerald-800">
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

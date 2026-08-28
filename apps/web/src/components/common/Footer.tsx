"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { ShieldCheck, Lock, Smartphone, Award, HelpCircle } from "lucide-react";

export default function Footer() {
  const { t, language } = useI18n();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Col 1: Platform & License */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold">
                LE
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                Lucky<span className="text-emerald-400">Ethio</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.common.tagline}. Every single raffle draw is backed by cryptographically verifiable SHA-256 pre-commitments.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-800 text-[11px] text-emerald-300 font-medium">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>NLA Permit No: NLA/ETH/2026/89</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              {t.common.raffles}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition">
                  {t.raffles.activeRaffles}
                </Link>
              </li>
              <li>
                <Link href="/winners" className="hover:text-emerald-400 transition">
                  {t.common.winners}
                </Link>
              </li>
              <li>
                <Link href="/verifier" className="hover:text-emerald-400 transition">
                  {t.common.verifier}
                </Link>
              </li>
              <li>
                <Link href="/my-tickets" className="hover:text-emerald-400 transition">
                  {t.common.myTickets}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Channels & Offline Access */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Channels & Offline
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <Link href="/agent/ussd-simulator" className="hover:text-emerald-400 transition">
                  USSD Dial <strong className="text-white">*804#</strong>
                </Link>
              </li>
              <li>
                <Link href="/agent" className="hover:text-emerald-400 transition">
                  Agent POS Kiosk Terminal
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-emerald-400 transition">
                  Admin Control Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Payments & Security */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Supported Payment Methods
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-[11px]">
                Telebirr
              </span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-[11px]">
                CBE Birr
              </span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-[11px]">
                Chapa
              </span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-[11px]">
                SantimPay
              </span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-[11px]">
                Agent Cash
              </span>
            </div>

            <div className="mt-4 flex items-center gap-2 text-[11px] text-amber-400 font-semibold bg-amber-950/40 border border-amber-800/60 p-2 rounded">
              <div className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center font-extrabold text-xs shrink-0">
                18+
              </div>
              <span>{t.common.ageWarning}</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>
              {language === "AM"
                ? "በኢትዮጵያ የግል መረጃ ጥበቃ አዋጅ እና በሎተሪ ህግ መሰረት የተጠበቀ።"
                : "Compliant with Ethiopian Personal Data Protection Proclamation & NLA Gaming Code."}
            </span>
          </div>
          <div>
            © {new Date().getFullYear()} LuckyEthio Raffle Platform. {t.common.allRightsReserved}
          </div>
        </div>
      </div>
    </footer>
  );
}


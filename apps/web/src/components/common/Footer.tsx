"use client";

import React from "react";
import Link from "next/link";
import { useI18n, LuckyTicketIcon } from "@raffle/shared";
import { ShieldCheck, Smartphone, Award } from "lucide-react";

import { useState } from "react";
import AdminStealthAuthModal from "@/components/auth/AdminStealthAuthModal";

export default function Footer() {
  const { t, language } = useI18n();
  const [stealthModalOpen, setStealthModalOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const handlePermitClick = () => {
    const next = clickCount + 1;
    if (next >= 3) {
      setStealthModalOpen(true);
      setClickCount(0);
    } else {
      setClickCount(next);
      setTimeout(() => setClickCount(0), 1200);
    }
  };

  return (
    <footer className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 mt-16 pt-12 pb-8 transition-colors">
      <AdminStealthAuthModal isOpen={stealthModalOpen} onClose={() => setStealthModalOpen(false)} />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-100 dark:border-slate-800">
          {/* Col 1: Platform & License */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <LuckyTicketIcon size={38} />
              <div>
                <div className="font-black text-lg text-amber-500 dark:text-amber-400 tracking-tight flex items-center leading-none">
                  <span>LUCKY</span>
                  <span className="text-amber-400 dark:text-amber-300 ml-1">TICKET</span>
                </div>
                <span className="text-[9px] text-blue-600 dark:text-blue-400 font-extrabold uppercase font-mono tracking-wider block mt-0.5 leading-none">
                  {language === "AM" ? "ዲጂታል የዕጣ መድረክ" : "DIGITAL RAFFLE PLATFORM"}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.common.tagline}. Every single raffle draw is backed by cryptographically verifiable SHA-256 pre-commitments.
            </p>
            <button
              onClick={handlePermitClick}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium cursor-default focus:outline-none select-none text-left"
            >
              <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Regulatory Status: NLA & MoR Tax Escrow Framework Ready</span>
            </button>
          </div>

          {/* Col 2 & 3: Raffles and Channels side-by-side on mobile in a single row */}
          <div className="grid grid-cols-2 gap-6 md:contents">
            {/* Col 2: Quick Links */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                {t.common.raffles}
              </h4>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <li>
                  <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                    {t.raffles.activeRaffles}
                  </Link>
                </li>
                <li>
                  <Link href="/winners" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                    {t.common.winners}
                  </Link>
                </li>
                <li>
                  <Link href="/verifier" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                    {t.common.verifier}
                  </Link>
                </li>
                <li>
                  <Link href="/my-tickets" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                    {t.common.myTickets}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Channels & Offline Access */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Channels & Offline
              </h4>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <Link href="/agent/ussd-simulator" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                    USSD <strong className="text-slate-900 dark:text-white">*157#</strong>
                  </Link>
                </li>
                <li>
                  <Link href="/agent" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                    Agent POS Kiosk
                  </Link>
                </li>
                <li>
                  <Link href="/seller/login" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                    Merchant Portal
                  </Link>
                </li>
                <li>
                  <Link href="/privacy/data-request" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Data Privacy (PDPP)</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 4: Payments & Security */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Supported Payment Methods
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-[11px]">
                Telebirr
              </span>
              <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-[11px]">
                CBE Birr
              </span>
              <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-[11px]">
                Chapa
              </span>
              <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-[11px]">
                SantimPay
              </span>
              <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-[11px]">
                Agent Cash
              </span>
            </div>

            <div className="mt-4 flex items-center gap-2 text-[11px] text-amber-800 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-2 rounded">
              <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-xs shrink-0">
                18+
              </div>
              <span>{t.common.ageWarning}</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
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

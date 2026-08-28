"use client";

import React, { useState, useEffect } from "react";
import { useI18n, LuckyTicketIcon } from "@raffle/shared";
import RaffleCard, { RaffleData } from "@/components/customer/RaffleCard";
import HeroWinnerSpotlight from "@/components/customer/HeroWinnerSpotlight";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Smartphone,
  Trophy,
  Filter,
  CheckCircle2,
  Lock,
  ArrowRight,
  Building2,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { t, language } = useI18n();
  const [raffles, setRaffles] = useState<RaffleData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRaffles();
  }, []);

  const fetchRaffles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/raffles");
      const data = await res.json();
      if (data.raffles) {
        setRaffles(data.raffles);
      }
    } catch (e) {
      console.error("Failed to fetch raffles", e);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "ALL", label: language === "AM" ? "ሁሉም" : "All Raffles" },
    { id: "VEHICLE", label: language === "AM" ? "መኪኖች" : "Vehicles" },
    { id: "REAL_ESTATE", label: language === "AM" ? "አፓርትመንትና ቤት" : "Real Estate" },
    { id: "ELECTRONICS", label: language === "AM" ? "ኤሌክትሮኒክስ" : "Electronics" },
    { id: "CASH", label: language === "AM" ? "ጥሬ ገንዘብ" : "Cash Prizes" },
  ];

  const filteredRaffles = raffles.filter((r) =>
    selectedCategory === "ALL" ? true : r.category === selectedCategory
  );

  return (
    <div className="space-y-10 sm:space-y-12 transition-colors">
      {/* 24-Hour Live Winner Spotlight (Shown when draw was executed within 24h) */}
      <HeroWinnerSpotlight />

      {/* Hero Banner with Ethiopian Accent */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-8 sm:p-12 shadow-2xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="max-w-2xl space-y-6">
            {/* Header Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {t.raffles.provablyFairBadge}
              </span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur">
                <Trophy className="w-4 h-4 text-amber-400" />
                Over 38,000,000 ETB in Prizes
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {language === "AM" ? (
                <>
                  በታማኝነት ይቁረጡ፤ <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200">
                    ትልቅ ሽልማት አሸንፈው ይውጡ!
                  </span>
                </>
              ) : (
                <>
                  Play with Confidence. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200">
                    Win Life-Changing Prizes!
                  </span>
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              {language === "AM"
                ? "በብሔራዊ ሎተሪ አስተዳደር ፈቃድ የተሰጠው የመጀመሪያው የኢትዮጵያ ፍትሃዊ የሎተሪ መድረክ። ክፍያ በቴሌብር፣ በሲቢኢ ብር ወይም በአቅራቢያዎ በሚገኙ ወኪሎች መቁረጥ ይችላሉ።"
                : "Ethiopia's licensed, tamper-proof raffle platform. Buy tickets instantly with Telebirr, CBE Birr, Chapa, or visit authorized Kiosk Agents across Addis Ababa and regional cities."}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="#raffles-catalog"
                className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-xl transition shadow-lg shadow-amber-500/30 flex items-center gap-2"
              >
                <span>{t.common.buyTickets}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/verifier"
                className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl border border-slate-700 transition flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>{t.common.verifier}</span>
              </Link>

              <Link
                href="/agent/ussd-simulator"
                className="px-4 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5"
              >
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>USSD Dial *804#</span>
              </Link>
            </div>
          </div>

          {/* Floating 3D Glowing Ticket Star Emblem */}
          <div className="hidden lg:flex flex-col items-center justify-center relative p-8">
            <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="relative animate-pulse duration-1000">
              <LuckyTicketIcon size={180} />
            </div>
            <div className="text-center mt-3">
              <span className="text-[11px] font-mono font-bold tracking-widest text-amber-300 uppercase block">
                NATIONAL VERIFIED RAFFLE
              </span>
            </div>
          </div>
        </div>

        {/* Decorative Grid Background Glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-600/15 to-transparent pointer-events-none" />
      </div>

      {/* Value Proposition Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-start gap-4 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
              {language === "AM" ? "100% ፍትሃዊና ያልተበረዘ (SHA-256)" : "Provably Fair RNG"}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {language === "AM"
                ? "የዕጣው ሚስጥራዊ ቁጥር ከዕጣው በፊት አስቀድሞ በኮድ ተመዝግቦ ለህዝብ ይፋ ይደረጋል።"
                : "Every draw seed is pre-committed with SHA-256 cryptographic hashes prior to sales closing."}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-start gap-4 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
              {language === "AM" ? "የስርዓት አቅራቢና የሻጮች መድረክ" : "System Provider & Escrow"}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {language === "AM"
                ? "ገለልተኛ የቴክኖሎጂ አቅራቢ በመሆን የተረጋገጡ ሻጮችን ከቲኬት ገዢዎች ጋር በታማኝነት እናገናኛለን።"
                : "We operate as the 3rd-party technology provider connecting audited sellers with buyers under full escrow."}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-start gap-4 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
              {language === "AM" ? "ፈጣን ክፍያ በቴሌብር እና ሲቢኢ" : "Instant Local Payments"}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {language === "AM"
                ? "በቀጥታ በቴሌብር፣ በንግድ ባንክ ወይም በቻፓ በደቂቃዎች ውስጥ ክፍያ ፈጽመው የቲኬት SMS ይደርስዎታል።"
                : "Checkout seamlessly via Telebirr, CBE Birr, or Chapa. SMS ticket delivery sent straight to your phone."}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-start gap-4 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
              {language === "AM" ? "በወኪል እና በ USSD (*804#)" : "Agent Kiosks & USSD"}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {language === "AM"
                ? "ኢንተርኔት በሌለበት ሰዓት በባለ ኪቦርድ ስልክ *804# በመደወል ወይም በወኪሎች በኩል በጥሬ ገንዘብ መቁረጥ ይቻላል።"
                : "No smartphone or internet required. Dial *804# on feature phones or visit certified kiosk agents."}
            </p>
          </div>
        </div>
      </div>

      {/* Raffles Catalog Section */}
      <section id="raffles-catalog" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t.raffles.activeRaffles}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === "AM"
                ? "የመረጡትን ሽልማት ይምረጡና እድልዎን ይሞክሩ"
                : "Browse active campaigns, select your numbers, and enter the live draw."}
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedCategory === cat.id
                    ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 h-96 animate-pulse p-4 space-y-4"
              >
                <div className="bg-slate-200 dark:bg-slate-800 rounded-xl h-48 w-full" />
                <div className="bg-slate-200 dark:bg-slate-800 h-6 w-3/4 rounded" />
                <div className="bg-slate-200 dark:bg-slate-800 h-4 w-1/2 rounded" />
                <div className="bg-slate-200 dark:bg-slate-800 h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredRaffles.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
            <Trophy className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300">No raffles found in this category.</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Please check back soon for new prize launches.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {filteredRaffles.map((raffle) => (
              <RaffleCard key={raffle.id} raffle={raffle} />
            ))}
          </div>
        )}
      </section>

      {/* How it Works Section */}
      <section className="bg-slate-100/70 dark:bg-slate-900/60 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 space-y-8 transition-colors">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            {language === "AM" ? "እንዴት እንደሚሰራ (በ 3 ቀላል ደረጃዎች)" : "How It Works in 3 Easy Steps"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === "AM"
              ? "ቲኬት ከመቁረጥ ጀምሮ እስከ ሽልማት አሰጣጥ ድረስ ሁሉም ነገር ግልጽና ፍትሃዊ ነው።"
              : "From selecting numbers to transparent live verification, we make raffle ticketing simple."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3 text-center transition-colors">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center justify-center font-black text-lg mx-auto">
              1
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
              {language === "AM" ? "1. ዕጣ ይምረጡና ቁጥር ይቁረጡ" : "1. Pick Raffle & Select Numbers"}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === "AM"
                ? "የሚወዱትን መኪና፣ ቤት ወይም ጥሬ ገንዘብ መርጠው በራስ-ሰር (Quick Pick) ወይም የራስዎን እድለኛ ቁጥር ይቁረጡ።"
                : "Choose your desired prize and pick custom numbers or use 1-click Quick Pick with multi-ticket discounts."}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3 text-center transition-colors">
            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 rounded-2xl flex items-center justify-center font-black text-lg mx-auto">
              2
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
              {language === "AM" ? "2. በቴሌብር ወይም ንግድ ባንክ ይክፈሉ" : "2. Instant Local Payment"}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === "AM"
                ? "በቴሌብር፣ በሲቢኢ ብር ወይም በአቅራቢያዎ ለሚገኝ ወኪል በጥሬ ገንዘብ ከፍለው የቲኬት SMS ወዲያውኑ ይቀበሉ።"
                : "Pay effortlessly using Telebirr, CBE Birr, or cash at an authorized agent. Instant SMS receipt guaranteed."}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3 text-center transition-colors">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 rounded-2xl flex items-center justify-center font-black text-lg mx-auto">
              3
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
              {language === "AM" ? "3. የቀጥታ ዕጣውን ይከታተሉ" : "3. Watch Live Provably Fair Draw"}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === "AM"
                ? "ዕጣው በቀጥታ ስርጭት ሲወጣ የ SHA-256 ሚስጥር ይፋ ተደርጎ አሸናፊው በሂሳባዊ ስሌት ይረጋገጣል።"
                : "Watch the draw live! Pre-committed cryptographic seeds are revealed and mathematically verifiable by anyone."}
            </p>
          </div>
        </div>
      </section>

      {/* System Provider Multi-Vendor Merchant Banner */}
      <section className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 rounded-3xl p-8 sm:p-12 text-white border border-indigo-800/50 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold font-mono">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>PLATFORM PROVIDER INFRASTRUCTURE</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              {language === "AM"
                ? "መኪና፣ ቤት ወይም የኤሌክትሮኒክስ እቃዎችን መሸጥ ይፈልጋሉ?"
                : "Are You a Car Dealership, Real Estate Developer, or Tech Importer?"}
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">
              {language === "AM"
                ? "እቃዎችዎን በ Lucky Ticket ፍትሃዊ የዕጣ መድረክ ላይ በማቅረብ ለሺዎች ደንበኞች ይሽጡ። የቴክኖሎጂ አሰራሩን፣ የቴሌብር ክፍያዎችን እና የብሔራዊ ሎተሪ ፍቃድ ህጋዊነት እኛ እንመራለን።"
                : "Lucky Ticket operates as the third-party infrastructure connecting certified independent merchants with ticket buyers. We manage the provably fair RNG, escrow settlement, and payment gateway."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              href="/seller/register"
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              <span>{language === "AM" ? "የነጋዴ ፈቃድ ያመልክቱ" : "Apply as Merchant"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/seller"
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm rounded-xl border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <span>{language === "AM" ? "የሻጮች ማዕከል ግባ" : "Merchant Dashboard"}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

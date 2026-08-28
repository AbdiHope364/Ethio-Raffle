"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import {
  Ticket,
  Zap,
  Hash,
  Sparkles,
  Check,
  Smartphone,
  ShieldCheck,
  Search,
  Lock,
  Clock,
  Flame,
} from "lucide-react";

interface TicketSelectorProps {
  raffleId: string;
  ticketPrice: number;
  totalTickets: number;
  soldTickets?: number;
  soldNumbers?: number[];
  bookedNumbers?: Array<number | { number: number; expiresAt: string }>;
  takenNumbers?: number[];
  onProceed: (data: {
    ticketCount: number;
    specificNumbers?: number[];
    paymentMethod: "TELEBIRR" | "CBE_BIRR" | "CHAPA" | "SANTIMPAY";
    customerPhone: string;
  }) => void;
}

export default function TicketSelector({
  raffleId,
  ticketPrice,
  totalTickets,
  soldTickets,
  soldNumbers = [],
  bookedNumbers = [],
  takenNumbers = [],
  onProceed,
}: TicketSelectorProps) {
  const { t, language } = useI18n();

  const [mode, setMode] = useState<"QUICK" | "CUSTOM">("QUICK");
  const [quickCount, setQuickCount] = useState<number>(1);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [customerPhone, setCustomerPhone] = useState<string>("+251933445566");
  const [paymentMethod, setPaymentMethod] = useState<
    "TELEBIRR" | "CBE_BIRR" | "CHAPA" | "SANTIMPAY"
  >("TELEBIRR");
  const [searchNumber, setSearchNumber] = useState<string>("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user?.phone) setCustomerPhone(d.user.phone);
      })
      .catch(console.error);
  }, []);

  const soldSet = new Set(soldNumbers);
  const bookedSet = new Set(bookedNumbers.map((b) => (typeof b === "number" ? b : b.number)));
  const combinedTakenSet = new Set([...soldNumbers, ...bookedNumbers.map((b) => (typeof b === "number" ? b : b.number)), ...takenNumbers]);

  const activeCount = mode === "QUICK" ? quickCount : selectedNumbers.length;
  const rawSubtotal = activeCount * ticketPrice;

  // Multi-ticket volume bonus/discount (e.g. 10% off for 5+ tickets)
  const discountRate = activeCount >= 10 ? 0.15 : activeCount >= 5 ? 0.10 : 0;
  const discountAmount = rawSubtotal * discountRate;
  const finalTotal = rawSubtotal - discountAmount;

  const handleToggleNumber = (num: number) => {
    if (soldSet.has(num) || bookedSet.has(num)) return;
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      if (selectedNumbers.length >= 20) {
        alert("Maximum 20 custom numbers per single checkout.");
        return;
      }
      setSelectedNumbers([...selectedNumbers, num]);
    }
  };

  const handleQuickAdd = (count: number) => {
    setMode("QUICK");
    setQuickCount(count);
  };

  const handleBuy = () => {
    if (activeCount <= 0) {
      alert("Please select at least 1 ticket.");
      return;
    }
    if (!customerPhone || customerPhone.length < 9) {
      alert("Please enter a valid customer phone number.");
      return;
    }

    onProceed({
      ticketCount: activeCount,
      specificNumbers: mode === "CUSTOM" ? selectedNumbers : undefined,
      paymentMethod,
      customerPhone,
    });
  };

  // Visible slots for custom picker (displaying up to first 200 for smooth rendering with search)
  const filteredNumbers = Array.from({ length: Math.min(200, totalTickets) }, (_, i) => i + 1).filter((n) =>
    searchNumber ? n.toString().includes(searchNumber) : true
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-6 transition-colors">
      {/* Mode Selector Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setMode("QUICK")}
          className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition ${
            mode === "QUICK"
              ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{t.common.quickPick}</span>
        </button>

        <button
          onClick={() => setMode("CUSTOM")}
          className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition ${
            mode === "CUSTOM"
              ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Hash className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{t.common.customPick}</span>
          {selectedNumbers.length > 0 && (
            <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded-full">
              {selectedNumbers.length}
            </span>
          )}
        </button>
      </div>

      {/* QUICK PICK MODE */}
      {mode === "QUICK" && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="line-clamp-1">{t.raffles.autoAssignNotice}</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
            {[1, 3, 5, 10, 20].map((qty) => (
              <button
                key={qty}
                onClick={() => handleQuickAdd(qty)}
                className={`p-2.5 sm:p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-0.5 sm:gap-1 ${
                  quickCount === qty
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30"
                    : "bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                }`}
              >
                <span className="text-base sm:text-lg font-black">{qty}</span>
                <span className="text-[10px] uppercase font-bold opacity-80">
                  {qty === 1 ? "Ticket" : "Tickets"}
                </span>
                {qty >= 5 && (
                  <span className={`text-[8px] sm:text-[9px] font-extrabold px-1 rounded ${quickCount === qty ? "bg-emerald-800 text-emerald-200" : "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300"}`}>
                    {qty >= 10 ? "15% OFF" : "10% OFF"}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CUSTOM PICK MODE */}
      {mode === "CUSTOM" && (
        <div className="space-y-4">
          {/* 4-State Visual Legend Box */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
              {language === "AM" ? "የቲኬት ሁኔታ መለያ ምልክቶች" : "Ticket Status Color Legend"}:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 inline-block shadow-xs" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-600 inline-block shadow-xs" />
                <span className="font-bold text-emerald-700 dark:text-emerald-400">Selected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-amber-400 border border-amber-500 inline-flex items-center justify-center text-[8px] font-black text-slate-950 shadow-xs">
                  ⏳
                </span>
                <span className="font-bold text-amber-700 dark:text-amber-400">Booked (1hr)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-slate-300 dark:bg-slate-700 border border-slate-400 dark:border-slate-600 inline-flex items-center justify-center text-[8px] font-black text-slate-600 dark:text-slate-400 shadow-xs">
                  🔒
                </span>
                <span className="font-bold text-slate-500 dark:text-slate-400 line-through">Sold</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Click available numbers to choose your lucky tickets
            </div>
            <div className="relative w-full sm:w-40">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter #..."
                value={searchNumber}
                onChange={(e) => setSearchNumber(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Color-Coded Number Matrix */}
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5 max-h-60 overflow-y-auto p-2 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50">
            {filteredNumbers.map((num) => {
              const isSold = soldSet.has(num);
              const isBooked = bookedSet.has(num);
              const isSelected = selectedNumbers.includes(num);

              let buttonClass = "";
              let title = `Ticket #${num}`;
              let icon = null;

              if (isSold) {
                buttonClass = "bg-slate-200/90 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700 cursor-not-allowed line-through opacity-75";
                title = `Ticket #${num} is SOLD`;
                icon = <Lock className="w-2.5 h-2.5 absolute top-0.5 right-0.5 text-slate-400 dark:text-slate-500" />;
              } else if (isBooked) {
                buttonClass = "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 cursor-not-allowed font-extrabold animate-pulse";
                title = `Ticket #${num} is currently BOOKED (1-hr temporary hold)`;
                icon = <Clock className="w-2.5 h-2.5 absolute top-0.5 right-0.5 text-amber-600 dark:text-amber-400" />;
              } else if (isSelected) {
                buttonClass = "bg-emerald-600 text-white font-black shadow-md ring-2 ring-emerald-500 scale-105";
                title = `Ticket #${num} Selected`;
                icon = <Check className="w-2.5 h-2.5 absolute top-0.5 right-0.5 text-emerald-200" />;
              } else {
                buttonClass = "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 font-semibold";
                title = `Ticket #${num} Available`;
              }

              return (
                <button
                  key={num}
                  disabled={isSold || isBooked}
                  onClick={() => handleToggleNumber(num)}
                  title={title}
                  className={`h-9 rounded-xl text-xs transition relative flex items-center justify-center ${buttonClass}`}
                >
                  <span>{num}</span>
                  {icon}
                </button>
              );
            })}
          </div>

          {selectedNumbers.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Selected ({selectedNumbers.length}):</span>
              {selectedNumbers.map((n) => (
                <span
                  key={n}
                  className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 text-[11px] border border-emerald-300 dark:border-emerald-700"
                >
                  #{n}
                  <button
                    onClick={() => handleToggleNumber(n)}
                    className="text-emerald-900 dark:text-emerald-300 hover:text-red-600 ml-0.5 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Customer Phone Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {t.checkout.phoneNumber}
        </label>
        <div className="relative">
          <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="+251911..."
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
          />
        </div>
        <p className="text-[11px] text-slate-400">{t.checkout.phoneNumberHelp}</p>
      </div>

      {/* Payment Gateway Options */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {t.common.paymentMethod}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Telebirr */}
          <label
            onClick={() => setPaymentMethod("TELEBIRR")}
            className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition ${
              paymentMethod === "TELEBIRR"
                ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20"
                : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0">
              TB
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs text-slate-900 dark:text-white truncate">Telebirr</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Instant USSD & QR</div>
            </div>
            {paymentMethod === "TELEBIRR" && (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
          </label>

          {/* CBE Birr */}
          <label
            onClick={() => setPaymentMethod("CBE_BIRR")}
            className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition ${
              paymentMethod === "CBE_BIRR"
                ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20"
                : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center font-black text-xs shrink-0">
              CBE
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs text-slate-900 dark:text-white truncate">CBE Birr</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Commercial Bank of Eth.</div>
            </div>
            {paymentMethod === "CBE_BIRR" && (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
          </label>

          {/* Chapa */}
          <label
            onClick={() => setPaymentMethod("CHAPA")}
            className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition ${
              paymentMethod === "CHAPA"
                ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20"
                : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">
              CH
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs text-slate-900 dark:text-white truncate">Chapa</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Cards, Telebirr, Banks</div>
            </div>
            {paymentMethod === "CHAPA" && (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
          </label>

          {/* SantimPay */}
          <label
            onClick={() => setPaymentMethod("SANTIMPAY")}
            className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition ${
              paymentMethod === "SANTIMPAY"
                ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20"
                : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-xs shrink-0">
              SP
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs text-slate-900 dark:text-white truncate">SantimPay</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Direct Bank Transfer</div>
            </div>
            {paymentMethod === "SANTIMPAY" && (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
          </label>
        </div>
      </div>

      {/* 1-Hour Hold Guarantee Notice */}
      <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
        <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">1-Hour Ticket Hold Guarantee:</span>
          <span>
            Your selected lucky numbers will be reserved exclusively for you for <strong>60 minutes</strong> while you complete payment. If unpaid after 1 hour, they automatically return to the public pool.
          </span>
        </div>
      </div>

      {/* Summary & Checkout Button */}
      <div className="bg-slate-50 dark:bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Ticket Quantity:</span>
            <span className="font-bold text-slate-900 dark:text-white">{activeCount} ticket(s)</span>
          </div>

          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Ticket Base Price:</span>
            <span className="font-mono text-slate-900 dark:text-white">{ticketPrice} ETB</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
              <span>Volume Discount ({discountRate * 100}%):</span>
              <span className="font-mono">-{discountAmount.toFixed(0)} ETB</span>
            </div>
          )}

          <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between items-baseline">
            <span className="font-extrabold text-sm text-slate-900 dark:text-white">Total Payable:</span>
            <span className="font-mono text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {finalTotal.toLocaleString()} <span className="text-xs font-bold text-slate-500 dark:text-slate-400">ETB</span>
            </span>
          </div>
        </div>

        <button
          onClick={handleBuy}
          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
        >
          <Ticket className="w-4 h-4" />
          <span>Book for 1 Hr & Pay {finalTotal.toLocaleString()} ETB</span>
        </button>
      </div>
    </div>
  );
}

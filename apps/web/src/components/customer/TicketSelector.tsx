"use client";

import React, { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import {
  Ticket,
  Zap,
  Check,
  Smartphone,
  CreditCard,
  Building,
  Store,
  Sparkles,
  AlertCircle,
  Hash,
  Search,
} from "lucide-react";

interface TicketSelectorProps {
  raffleId: string;
  ticketPrice: number;
  totalTickets: number;
  takenNumbers: number[];
  onProceed: (data: {
    ticketCount: number;
    specificNumbers?: number[];
    paymentMethod: "CHAPA" | "SANTIMPAY" | "TELEBIRR" | "CBE_BIRR" | "AGENT_CASH";
    customerPhone: string;
  }) => void;
}

export default function TicketSelector({
  raffleId,
  ticketPrice,
  totalTickets,
  takenNumbers,
  onProceed,
}: TicketSelectorProps) {
  const { t } = useI18n();

  const [mode, setMode] = useState<"QUICK" | "CUSTOM">("QUICK");
  const [quickCount, setQuickCount] = useState<number>(1);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [customerPhone, setCustomerPhone] = useState<string>("+251933445566");
  const [paymentMethod, setPaymentMethod] = useState<"TELEBIRR" | "CBE_BIRR" | "CHAPA" | "SANTIMPAY" | "AGENT_CASH">("TELEBIRR");
  const [searchNumber, setSearchNumber] = useState<string>("");

  const takenSet = new Set(takenNumbers);

  const activeCount = mode === "QUICK" ? quickCount : selectedNumbers.length;
  const rawSubtotal = activeCount * ticketPrice;

  // Multi-ticket volume bonus/discount (e.g. 10% off for 5+ tickets)
  const discountRate = activeCount >= 10 ? 0.15 : activeCount >= 5 ? 0.10 : 0;
  const discountAmount = rawSubtotal * discountRate;
  const finalTotal = rawSubtotal - discountAmount;

  const handleToggleNumber = (num: number) => {
    if (takenSet.has(num)) return;
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
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      {/* Mode Selector Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
        <button
          onClick={() => setMode("QUICK")}
          className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
            mode === "QUICK"
              ? "bg-white text-emerald-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Zap className="w-4 h-4 text-emerald-600" />
          <span>{t.common.quickPick}</span>
        </button>

        <button
          onClick={() => setMode("CUSTOM")}
          className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
            mode === "CUSTOM"
              ? "bg-white text-emerald-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Hash className="w-4 h-4 text-emerald-600" />
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
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.raffles.autoAssignNotice}</span>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {[1, 3, 5, 10, 20].map((qty) => (
              <button
                key={qty}
                onClick={() => handleQuickAdd(qty)}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                  quickCount === qty
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200"
                }`}
              >
                <span className="text-lg font-black">{qty}</span>
                <span className="text-[10px] uppercase font-bold opacity-80">
                  {qty === 1 ? "Ticket" : "Tickets"}
                </span>
                {qty >= 5 && (
                  <span className={`text-[9px] font-extrabold px-1 rounded ${quickCount === qty ? "bg-emerald-800 text-emerald-200" : "bg-emerald-100 text-emerald-800"}`}>
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
          <div className="flex items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Pick your lucky numbers below (Green = Selected, Gray = Taken)
            </div>
            <div className="relative w-40">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter #..."
                value={searchNumber}
                onChange={(e) => setSearchNumber(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5 max-h-56 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/50">
            {filteredNumbers.map((num) => {
              const isTaken = takenSet.has(num);
              const isSelected = selectedNumbers.includes(num);

              return (
                <button
                  key={num}
                  disabled={isTaken}
                  onClick={() => handleToggleNumber(num)}
                  className={`h-9 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                    isTaken
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed line-through"
                      : isSelected
                      ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600 scale-105"
                      : "bg-white text-slate-800 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50"
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {selectedNumbers.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
              <span className="font-semibold text-slate-600">Selected ({selectedNumbers.length}):</span>
              {selectedNumbers.map((n) => (
                <span
                  key={n}
                  className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                >
                  #{n}
                  <button
                    onClick={() => handleToggleNumber(n)}
                    className="text-emerald-900 hover:text-red-600 ml-0.5"
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
        <label className="block text-xs font-bold text-slate-700">
          {t.checkout.phoneNumber}
        </label>
        <div className="relative">
          <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="+251911..."
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
          />
        </div>
        <p className="text-[11px] text-slate-400">{t.checkout.phoneNumberHelp}</p>
      </div>

      {/* Payment Gateway Options */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700">
          {t.common.paymentMethod}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { id: "TELEBIRR", label: "Telebirr", icon: Smartphone, color: "text-blue-600" },
            { id: "CBE_BIRR", label: "CBE Birr", icon: Building, color: "text-purple-600" },
            { id: "CHAPA", label: "Chapa (Cards)", icon: CreditCard, color: "text-emerald-600" },
            { id: "SANTIMPAY", label: "SantimPay", icon: Zap, color: "text-amber-600" },
            { id: "AGENT_CASH", label: "Agent Cash POS", icon: Store, color: "text-teal-600" },
          ].map((pm) => {
            const Icon = pm.icon;
            const isSelected = paymentMethod === pm.id;
            return (
              <button
                key={pm.id}
                type="button"
                onClick={() => setPaymentMethod(pm.id as any)}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                  isSelected
                    ? "bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-600/30 text-emerald-900"
                    : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <Icon className={`w-4 h-4 ${pm.color}`} />
                <span className="text-xs font-bold truncate">{pm.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 ml-auto" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary & Price Breakdown */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
        <div className="flex justify-between text-xs text-slate-600">
          <span>Tickets:</span>
          <span className="font-bold text-slate-900">{activeCount} x {ticketPrice} ETB</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-xs text-emerald-700 font-semibold">
            <span>Multi-ticket Discount:</span>
            <span>- {discountAmount.toLocaleString()} ETB</span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
          <span className="font-bold text-sm text-slate-900">{t.common.subtotal}:</span>
          <div className="text-right">
            <span className="text-2xl font-black text-emerald-700 tracking-tight">
              {finalTotal.toLocaleString()} <span className="text-sm font-bold">{t.common.etb}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Proceed Button */}
      <button
        onClick={handleBuy}
        disabled={activeCount <= 0}
        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-base rounded-xl transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
      >
        <Ticket className="w-5 h-5" />
        <span>
          {t.checkout.payNow} {finalTotal.toLocaleString()} {t.common.etb}
        </span>
      </button>
    </div>
  );
}


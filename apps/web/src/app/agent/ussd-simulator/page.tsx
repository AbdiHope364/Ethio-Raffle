"use client";

import React, { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import {
  Smartphone,
  PhoneCall,
  RotateCcw,
  Delete,
  CornerDownLeft,
  Sparkles,
  ShieldCheck,
  Store,
} from "lucide-react";

export default function USSDSimulatorPage() {
  const { t, language } = useI18n();

  const [phoneNumber, setPhoneNumber] = useState("+251912345678"); // Default to active agent
  const [dialText, setDialText] = useState("*804#");
  const [screenText, setScreenText] = useState(
    "USSD Offline Gateway\nDial *804# and press SEND to begin session."
  );
  const [inputBuffer, setInputBuffer] = useState("");
  const [sessionActive, setSessionActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historyChain, setHistoryChain] = useState<string[]>([]);

  const handleDial = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ussd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          text: "", // initial dial
        }),
      });

      const data = await res.json();
      setScreenText(data.message);
      setSessionActive(data.continueSession);
      setHistoryChain([]);
      setInputBuffer("");
    } catch (e: any) {
      setScreenText("Network error: Could not reach USSD gateway.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendInput = async () => {
    if (!inputBuffer.trim()) return;

    setLoading(true);
    const newChain = [...historyChain, inputBuffer.trim()];
    const textParam = newChain.join("*");

    try {
      const res = await fetch("/api/ussd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          text: textParam,
        }),
      });

      const data = await res.json();
      setScreenText(data.message);
      setSessionActive(data.continueSession);
      setHistoryChain(newChain);
      setInputBuffer("");
    } catch (e: any) {
      setScreenText("USSD timeout or connection error.");
      setSessionActive(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (char: string) => {
    if (!sessionActive) {
      setDialText((prev) => prev + char);
    } else {
      setInputBuffer((prev) => prev + char);
    }
  };

  const handleClear = () => {
    if (!sessionActive) {
      setDialText("");
    } else {
      setInputBuffer("");
    }
  };

  const handleReset = () => {
    setSessionActive(false);
    setHistoryChain([]);
    setInputBuffer("");
    setDialText("*804#");
    setScreenText("USSD Offline Gateway\nDial *804# and press SEND to begin session.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
          <Smartphone className="w-4 h-4 text-amber-600" />
          <span>Feature Phone & Offline Kiosk Terminal</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          USSD Service Emulator (*804#)
        </h1>
        <p className="text-xs text-slate-500 max-w-xl mx-auto">
          Simulate how offline customers and kiosk agents without smartphones access the LuckyEthio raffle system over GSM USSD protocol.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Phone Settings & Quick Presets */}
        <div className="md:col-span-6 space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">
              SIM & Network Profile
            </h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Calling MSISDN (Phone Number)
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Quick Persona Buttons */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Switch SIM Identity:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setPhoneNumber("+251912345678");
                    handleReset();
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs transition ${
                    phoneNumber === "+251912345678"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-600 font-bold"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                >
                  <span className="block font-bold">Dawit (Agent)</span>
                  <span className="text-[10px] text-slate-400 font-mono">+251912345678</span>
                </button>

                <button
                  onClick={() => {
                    setPhoneNumber("+251933445566");
                    handleReset();
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs transition ${
                    phoneNumber === "+251933445566"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-600 font-bold"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                >
                  <span className="block font-bold">Helen (Customer)</span>
                  <span className="text-[10px] text-slate-400 font-mono">+251933445566</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 rounded-3xl border border-slate-200 p-5 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>USSD Architecture Highlights</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500">
              <li>Low bandwidth, 0kb data usage on 2G/3G networks.</li>
              <li>Agent POS mode unlocks automatically when an active agent SIM dials.</li>
              <li>Direct Telebirr & Agent Float deductions via USSD state machine.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Virtual Feature Phone */}
        <div className="md:col-span-6 flex justify-center w-full">
          <div className="w-full max-w-[320px] bg-slate-900 text-white rounded-[40px] p-5 sm:p-6 shadow-2xl border-4 border-slate-700 space-y-5">
            {/* Speaker Grille */}
            <div className="w-16 h-1.5 bg-slate-700 rounded-full mx-auto" />

            {/* LCD Screen */}
            <div className="bg-[#8bb492] text-slate-950 p-4 rounded-2xl h-60 shadow-inner font-mono text-xs flex flex-col justify-between overflow-hidden border-2 border-[#769b7c]">
              <div className="overflow-y-auto whitespace-pre-line leading-relaxed scrollbar-none font-semibold">
                {screenText}
              </div>

              {/* Live Input Prompt if Session is Active */}
              {sessionActive && (
                <div className="mt-2 pt-1 border-t border-[#769b7c] flex items-center gap-1">
                  <span className="font-bold">&gt;</span>
                  <input
                    type="text"
                    value={inputBuffer}
                    onChange={(e) => setInputBuffer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendInput();
                    }}
                    placeholder="Enter choice..."
                    className="w-full bg-transparent text-slate-950 font-bold focus:outline-none placeholder-[#6b8b70] text-xs font-mono"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Dial Input Bar (When not in session) */}
            {!sessionActive && (
              <div className="bg-slate-800 p-2.5 rounded-xl text-center font-mono font-bold text-sm tracking-widest text-emerald-400 border border-slate-700 flex items-center justify-between">
                <span className="truncate flex-1">{dialText || "Dial..."}</span>
                {dialText && (
                  <button
                    onClick={() => setDialText("")}
                    className="text-slate-400 hover:text-white text-xs px-1"
                  >
                    ×
                  </button>
                )}
              </div>
            )}

            {/* Action Bar (Send / End) */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={sessionActive ? handleSendInput : handleDial}
                disabled={loading}
                className="py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-0.5 shadow-md active:scale-95 transition"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{sessionActive ? "SEND" : "DIAL"}</span>
              </button>

              <button
                onClick={handleReset}
                className="py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-0.5 shadow-md active:scale-95 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>END</span>
              </button>

              <button
                onClick={handleClear}
                className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex flex-col items-center justify-center gap-0.5 border border-slate-700 active:scale-95 transition"
              >
                <Delete className="w-4 h-4" />
                <span>CLEAR</span>
              </button>
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-2 pt-1 font-bold font-mono">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((k) => (
                <button
                  key={k}
                  onClick={() => handleKeyPress(k)}
                  className="py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:bg-slate-600 text-slate-100 text-sm border border-slate-700 shadow-xs transition"
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


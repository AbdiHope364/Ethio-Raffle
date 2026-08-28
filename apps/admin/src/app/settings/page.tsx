"use client";

import React, { useState } from "react";
import { useI18n } from "@raffle/shared";
import {
  Settings,
  Shield,
  Key,
  CreditCard,
  Building,
  CheckCircle2,
  Save,
  Radio,
} from "lucide-react";

export default function AdminSettingsPage() {
  const { t, language } = useI18n();

  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    nlaLicenseNumber: "NLA/ETH/2026/89",
    nlaAuditorOfficer: "Ato Tadesse Worku (Senior Inspector)",
    minimumAgeLimit: "18",
    telebirrShortcode: "804",
    telebirrAppId: "TEL-PROD-APP-9988",
    cbeBirrMerchantId: "CBE-MERCHANT-4411",
    chapaSecretKey: "CHASECK_TEST-xxxxxxxxxxxxxxxx",
    santimpayMerchantId: "SAN-MERCHANT-8822",
    enableUssdChannel: true,
    enableWalkInAgentCash: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-purple-400" />
          <span>Platform & Regulatory Configuration</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          National Lottery Administration statutory credentials, payment gateway keys, and channel toggles.
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Configuration saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* NLA Section */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>National Lottery Administration (NLA) Compliance</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300">Statutory License Number</label>
              <input
                type="text"
                value={formData.nlaLicenseNumber}
                onChange={(e) => setFormData({ ...formData, nlaLicenseNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300">Designated NLA Inspector</label>
              <input
                type="text"
                value={formData.nlaAuditorOfficer}
                onChange={(e) => setFormData({ ...formData, nlaAuditorOfficer: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
          </div>
        </div>

        {/* Gateways Section */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-purple-400" />
            <span>Ethiopian Payment Gateway Credentials</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300">Telebirr App ID</label>
              <input
                type="text"
                value={formData.telebirrAppId}
                onChange={(e) => setFormData({ ...formData, telebirrAppId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300">CBE Birr Merchant ID</label>
              <input
                type="text"
                value={formData.cbeBirrMerchantId}
                onChange={(e) => setFormData({ ...formData, cbeBirrMerchantId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300">Chapa Secret Key</label>
              <input
                type="password"
                value={formData.chapaSecretKey}
                onChange={(e) => setFormData({ ...formData, chapaSecretKey: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300">SantimPay Merchant ID</label>
              <input
                type="text"
                value={formData.santimpayMerchantId}
                onChange={(e) => setFormData({ ...formData, santimpayMerchantId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Channel Toggles */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>Distribution Channel Controls</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableUssdChannel}
                onChange={(e) => setFormData({ ...formData, enableUssdChannel: e.target.checked })}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-950 border-slate-800"
              />
              <span className="text-xs font-bold text-slate-300">
                Enable Feature Phone USSD Gateway (*804#)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableWalkInAgentCash}
                onChange={(e) => setFormData({ ...formData, enableWalkInAgentCash: e.target.checked })}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-950 border-slate-800"
              />
              <span className="text-xs font-bold text-slate-300">
                Enable Physical Agent Kiosk Walk-in Cash Ticketing
              </span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl transition shadow-lg shadow-purple-600/30 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save System Settings</span>
        </button>
      </form>
    </div>
  );
}


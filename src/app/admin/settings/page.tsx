"use client";

import React from "react";
import { Settings, Save, Shield, Bell, DollarSign, Wine } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-luxury-border/30 pb-6">
        <div>
          <h2 className="font-serif text-3xl font-bold text-white">System Settings</h2>
          <p className="text-xs text-luxury-text-dark font-sans mt-1">
            Configure default business rules, tax rates, event budgets, and branch profiles.
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-5 py-2.5 bg-gold-500 text-luxury-black hover:bg-gold-400 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer">
          <Save className="w-3.5 h-3.5" /> Save Configuration
        </button>
      </div>

      {/* Settings Sections Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Tax and Discounts */}
        <div className="glass-panel rounded-2xl p-6 border border-luxury-border space-y-4 text-left">
          <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gold-500" /> Financial Settings
          </h3>
          <div className="h-px bg-luxury-border/30 my-2" />
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-luxury-text-dark uppercase tracking-wide mb-2">GST Rate (%)</label>
              <input 
                type="number" 
                defaultValue={9}
                className="w-full px-4 py-2.5 bg-luxury-black/60 border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-luxury-text-dark uppercase tracking-wide mb-2">Default Discount Cap (%)</label>
              <input 
                type="number" 
                defaultValue={20}
                className="w-full px-4 py-2.5 bg-luxury-black/60 border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Inventory settings */}
        <div className="glass-panel rounded-2xl p-6 border border-luxury-border space-y-4 text-left">
          <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Wine className="w-5 h-5 text-gold-500" /> Inventory Thresholds
          </h3>
          <div className="h-px bg-luxury-border/30 my-2" />
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-luxury-text-dark uppercase tracking-wide mb-2">Default Low-Stock Alert (Bottles)</label>
              <input 
                type="number" 
                defaultValue={10}
                className="w-full px-4 py-2.5 bg-luxury-black/60 border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-luxury-text-dark uppercase tracking-wide mb-2">Default Critical Threshold (Bottles)</label>
              <input 
                type="number" 
                defaultValue={3}
                className="w-full px-4 py-2.5 bg-luxury-black/60 border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Security / RBAC configs */}
        <div className="glass-panel rounded-2xl p-6 border border-luxury-border space-y-4 text-left">
          <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold-500" /> Security Policies
          </h3>
          <div className="h-px bg-luxury-border/30 my-2" />
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-luxury-text-dark uppercase tracking-wide mb-2">Session Expiry Timeout (Hours)</label>
              <input 
                type="number" 
                defaultValue={12}
                className="w-full px-4 py-2.5 bg-luxury-black/60 border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Notifications adapter config */}
        <div className="glass-panel rounded-2xl p-6 border border-luxury-border space-y-4 text-left">
          <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-gold-500" /> Notifications Integration
          </h3>
          <div className="h-px bg-luxury-border/30 my-2" />
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-luxury-border/20">
              <div>
                <p className="text-xs font-bold text-white">WhatsApp Customer Receipts</p>
                <p className="text-[10px] text-zinc-500">Dispatch transaction receipts via automated WhatsApp API</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-gold-500" />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-luxury-border/20">
              <div>
                <p className="text-xs font-bold text-white">Email Low-Stock Alerts</p>
                <p className="text-[10px] text-zinc-500">Email inventory managers daily for restock reports</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-gold-500" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

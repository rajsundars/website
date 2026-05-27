"use client";

import React, { useState } from "react";
import { 
  Wine, 
  Sparkles, 
  ChevronRight, 
  ShoppingBag, 
  TrendingUp, 
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";

export default function AdminDesignSystemPage() {
  const [activeTab, setActiveTab] = useState<"colors" | "typography" | "components" | "glassmorphism">("colors");

  return (
    <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-luxury-border/30 pb-6">
        <div>
          <h2 className="font-serif text-3xl font-bold text-white">Design Tokens & Style System</h2>
          <p className="text-xs text-luxury-text-dark font-sans mt-1">
            Guna Wines premium dark luxury design tokens, components, and glassmorphic panels.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-wine-950 border border-wine-700/50 text-wine-300">
            Tailwind v4
          </span>
          <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-gold-950 border border-gold-700/50 text-gold-300">
            Luxury Dark Theme
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-luxury-border gap-2 overflow-x-auto pb-1">
        {(["colors", "typography", "components", "glassmorphism"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-xs font-bold tracking-wider uppercase border-b-2 transition-all duration-300 whitespace-nowrap cursor-pointer ${
              activeTab === tab
                ? "border-gold-500 text-gold-500"
                : "border-transparent text-luxury-text-dark hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="animate-scale-up">
        {/* COLORS TAB */}
        {activeTab === "colors" && (
          <div className="space-y-12">
            <div>
              <h3 className="font-serif text-xl text-white mb-6 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-wine-700 rounded-full inline-block"></span>
                Primary Brand Palette
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {/* Deep Wine Red */}
                <div className="glass-panel rounded-xl overflow-hidden border border-luxury-border">
                  <div className="h-24 bg-wine-800" />
                  <div className="p-4">
                    <p className="font-medium text-white text-xs">Deep Wine Red</p>
                    <p className="text-[10px] text-luxury-text-dark mt-1">bg-wine-800</p>
                    <p className="text-[10px] text-gold-500/70 mt-1 font-mono">#4A0E17</p>
                  </div>
                </div>

                {/* Burgundy */}
                <div className="glass-panel rounded-xl overflow-hidden border border-luxury-border">
                  <div className="h-24 bg-wine-700" />
                  <div className="p-4">
                    <p className="font-medium text-white text-xs">Burgundy</p>
                    <p className="text-[10px] text-luxury-text-dark mt-1">bg-wine-700</p>
                    <p className="text-[10px] text-gold-500/70 mt-1 font-mono">#722F37</p>
                  </div>
                </div>

                {/* Luxury Black */}
                <div className="glass-panel rounded-xl overflow-hidden border border-luxury-border">
                  <div className="h-24 bg-luxury-black border-b border-luxury-border" />
                  <div className="p-4">
                    <p className="font-medium text-white text-xs">Luxury Black</p>
                    <p className="text-[10px] text-luxury-text-dark mt-1">bg-luxury-black</p>
                    <p className="text-[10px] text-gold-500/70 mt-1 font-mono">#090506</p>
                  </div>
                </div>

                {/* Luxury Dark */}
                <div className="glass-panel rounded-xl overflow-hidden border border-luxury-border">
                  <div className="h-24 bg-luxury-dark border-b border-luxury-border" />
                  <div className="p-4">
                    <p className="font-medium text-white text-xs">Luxury Dark</p>
                    <p className="text-[10px] text-luxury-text-dark mt-1">bg-luxury-dark</p>
                    <p className="text-[10px] text-gold-500/70 mt-1 font-mono">#120B0D</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-serif text-xl text-white mb-6 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-gold-500 rounded-full inline-block"></span>
                Secondary Accents & Light System
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {/* Luxury Gold */}
                <div className="glass-panel rounded-xl overflow-hidden border border-luxury-border">
                  <div className="h-24 bg-gold-500" />
                  <div className="p-4">
                    <p className="font-medium text-white text-xs">Luxury Gold</p>
                    <p className="text-[10px] text-luxury-text-dark mt-1">bg-gold-500</p>
                    <p className="text-[10px] text-gold-700 mt-1 font-mono">#D4AF37</p>
                  </div>
                </div>

                {/* Champagne Beige */}
                <div className="glass-panel rounded-xl overflow-hidden border border-luxury-border">
                  <div className="h-24 bg-champagne-100" />
                  <div className="p-4">
                    <p className="font-medium text-luxury-black text-xs">Champagne</p>
                    <p className="text-[10px] text-luxury-text-dark mt-1">bg-champagne-100</p>
                    <p className="text-[10px] text-gold-700 mt-1 font-mono">#F1E9D2</p>
                  </div>
                </div>

                {/* Silver Gray */}
                <div className="glass-panel rounded-xl overflow-hidden border border-luxury-border">
                  <div className="h-24 bg-zinc-500" />
                  <div className="p-4">
                    <p className="font-medium text-white text-xs">Silver Gray</p>
                    <p className="text-[10px] text-luxury-text-dark mt-1">bg-zinc-500</p>
                    <p className="text-[10px] text-gold-500/70 mt-1 font-mono">#8C8C8C</p>
                  </div>
                </div>

                {/* White Smoke */}
                <div className="glass-panel rounded-xl overflow-hidden border border-luxury-border">
                  <div className="h-24 bg-zinc-100" />
                  <div className="p-4">
                    <p className="font-medium text-luxury-black text-xs">White Smoke</p>
                    <p className="text-[10px] text-luxury-text-dark mt-1">bg-zinc-100</p>
                    <p className="text-[10px] text-gold-700 mt-1 font-mono">#F5F5F5</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TYPOGRAPHY TAB */}
        {activeTab === "typography" && (
          <div className="glass-panel rounded-2xl p-6 md:p-8 border border-luxury-border space-y-12">
            <div>
              <h4 className="text-gold-500 text-[10px] uppercase tracking-widest font-bold mb-4">Font Family Pairs</h4>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <span className="text-[10px] text-luxury-text-dark block mb-2 font-mono">Serif Typeface: Playfair Display</span>
                  <p className="font-serif text-2xl font-bold text-white mb-2">Classic Bordeaux Reservé</p>
                  <p className="font-serif text-lg italic text-champagne-200">Used for titles, headings, luxury statements, and wine names.</p>
                </div>
                <div>
                  <span className="text-[10px] text-luxury-text-dark block mb-2 font-mono">Sans-Serif Typeface: Inter</span>
                  <p className="font-sans text-2xl font-semibold text-white mb-2">POS Billing Checkout</p>
                  <p className="font-sans text-xs text-luxury-text-dark leading-relaxed">
                    Used for body copies, statistics grids, settings toggles, lists, and numbers readability.
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-luxury-border/30" />

            <div>
              <h4 className="text-gold-500 text-[10px] uppercase tracking-widest font-bold mb-6">Heading Scale Example</h4>
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] text-luxury-text-dark font-mono block mb-1">h1.font-serif.text-5xl</span>
                  <h1 className="font-serif text-4xl font-bold text-white">Château Margaux 2018</h1>
                </div>
                <div>
                  <span className="text-[10px] text-luxury-text-dark font-mono block mb-1">h2.font-serif.text-3xl</span>
                  <h2 className="font-serif text-2xl font-semibold text-white">Multi-Branch Stock Balance</h2>
                </div>
                <div>
                  <span className="text-[10px] text-luxury-text-dark font-mono block mb-1">h3.font-serif.text-xl</span>
                  <h3 className="font-serif text-lg font-medium text-gold-500">Gold Accent Heading Style</h3>
                </div>
                <div>
                  <span className="text-[10px] text-luxury-text-dark font-mono block mb-1">p.font-sans.text-sm</span>
                  <p className="font-sans text-xs text-luxury-text-dark leading-relaxed">
                    This is a standard body text paragraph designed using the Inter font family. It is easy to read, 
                    providing optimal contrast for internal operational workflows or invoice forms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMPONENTS TAB */}
        {activeTab === "components" && (
          <div className="space-y-12">
            {/* Buttons */}
            <div className="glass-panel rounded-2xl p-6 md:p-8 border border-luxury-border">
              <h4 className="text-gold-500 text-[10px] uppercase tracking-widest font-bold mb-6">Button Varieties</h4>
              <div className="flex flex-wrap gap-4 items-center">
                <button className="px-5 py-2.5 bg-gold-500 text-luxury-black font-bold uppercase text-[10px] tracking-wider rounded hover:bg-gold-400 active:bg-gold-600 transition-colors shadow-lg cursor-pointer">
                  Gold Solid (Primary Action)
                </button>

                <button className="px-5 py-2.5 bg-wine-700 text-white font-bold uppercase text-[10px] tracking-wider rounded hover:bg-wine-600 active:bg-wine-800 transition-colors shadow-lg cursor-pointer">
                  Wine Solid (Secondary Action)
                </button>

                <button className="px-5 py-2.5 border border-gold-500/40 text-gold-500 font-bold uppercase text-[10px] tracking-wider rounded hover:bg-gold-500/10 transition-colors cursor-pointer">
                  Glass Outline
                </button>

                <button className="px-5 py-2.5 bg-transparent text-luxury-text-dark font-bold uppercase text-[10px] tracking-wider rounded hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  Text Button <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Status Badges */}
            <div className="glass-panel rounded-2xl p-6 md:p-8 border border-luxury-border">
              <h4 className="text-gold-500 text-[10px] uppercase tracking-widest font-bold mb-6">Status Badges & Info Tags</h4>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
                  Active / Connected
                </span>
                <span className="px-3 py-0.5 text-[10px] font-semibold rounded-full bg-amber-950/80 border border-amber-500/30 text-amber-400">
                  Low Stock Alert
                </span>
                <span className="px-3 py-0.5 text-[10px] font-semibold rounded-full bg-rose-950/80 border border-rose-500/30 text-rose-400">
                  Critically Out of Stock
                </span>
                <span className="px-3 py-0.5 text-[10px] font-semibold rounded-full bg-sky-950/80 border border-sky-500/30 text-sky-400">
                  Shipment En Route
                </span>
                <span className="px-3 py-0.5 text-[10px] font-semibold rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-400">
                  Event Booked
                </span>
              </div>
            </div>

            {/* Form Controls */}
            <div className="glass-panel rounded-2xl p-6 md:p-8 border border-luxury-border">
              <h4 className="text-gold-500 text-[10px] uppercase tracking-widest font-bold mb-6">Form Elements</h4>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-luxury-text-dark mb-2 uppercase tracking-wide">
                    Select Wine Class
                  </label>
                  <select className="w-full px-4 py-2.5 bg-luxury-black/60 border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500 transition-colors">
                    <option>Cabernet Sauvignon</option>
                    <option>Chardonnay</option>
                    <option>Pinot Noir</option>
                    <option>Merlot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-luxury-text-dark mb-2 uppercase tracking-wide">
                    Wine SKU Code
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. WN-CAB-002"
                    className="w-full px-4 py-2.5 bg-luxury-black/60 border border-luxury-border rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-luxury-text-dark mb-2 uppercase tracking-wide">
                    Pricing (RM)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-zinc-500 text-xs">RM</span>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="w-full pl-12 pr-4 py-2.5 bg-luxury-black/60 border border-luxury-border rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-gold-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GLASSMORPHISM TAB */}
        {activeTab === "glassmorphism" && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Standard Glass Panel */}
              <div className="glass-panel rounded-2xl p-6 md:p-8 border border-luxury-border">
                <h4 className="text-gold-500 text-[10px] uppercase tracking-widest font-bold mb-2">Standard Glass Panel</h4>
                <p className="text-[10px] text-luxury-text-dark mb-4 font-mono">class: glass-panel</p>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Designed for standard widgets, container layouts, and sidebar frames. 
                  Uses a semi-transparent base background (`rgba(22, 14, 16, 0.65)`) combined with a 
                  backdrop blur of 12px and a thin borders.
                </p>
                <div className="mt-6 p-4 rounded bg-luxury-black/40 border border-luxury-border/30 text-[10px] font-mono text-zinc-400 leading-normal">
                  background: rgba(22, 14, 16, 0.65);<br />
                  backdrop-filter: blur(12px);<br />
                  border: 1px solid rgba(212, 175, 55, 0.1);
                </div>
              </div>

              {/* Heavy Glass Panel */}
              <div className="glass-panel-heavy rounded-2xl p-6 md:p-8 border border-luxury-border">
                <h4 className="text-gold-500 text-[10px] uppercase tracking-widest font-bold mb-2">Heavy Glass Panel</h4>
                <p className="text-[10px] text-luxury-text-dark mb-4 font-mono">class: glass-panel-heavy</p>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Designed for modals, navigation drawers, overlay dialogs, and main page layers requiring 
                  maximum content contrast over background glows. Uses 85% opacity background and 20px blur.
                </p>
                <div className="mt-6 p-4 rounded bg-luxury-black/60 border border-luxury-border/30 text-[10px] font-mono text-zinc-400 leading-normal">
                  background: rgba(18, 10, 12, 0.85);<br />
                  backdrop-filter: blur(20px);<br />
                  border: 1px solid rgba(212, 175, 55, 0.15);
                </div>
              </div>
            </div>

            {/* Glass Card Hover Animations */}
            <div>
              <h4 className="text-gold-500 text-[10px] uppercase tracking-widest font-bold mb-6">Interactive Glass Hover Cards</h4>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { title: "Inventory Status", count: "1,240 cases", icon: ShoppingBag, desc: "Total wine inventory across all active retail branches." },
                  { title: "Sales Revenue", count: "RM 42,850.50", icon: TrendingUp, desc: "Overall POS checkout earnings logged today." },
                  { title: "Upcoming Events", count: "8 events", icon: Calendar, desc: "Confirmed and reserved wedding / corporate bookings." }
                ].map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <div 
                      key={i} 
                      className="glass-panel glass-card-hover rounded-2xl p-6 cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="p-3 bg-wine-800/40 rounded-xl border border-gold-500/20 text-gold-500">
                          <Icon className="w-5 h-5" />
                        </span>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                          card {i+1}
                        </span>
                      </div>
                      <h5 className="text-zinc-400 text-[10px] uppercase tracking-wide font-sans">{card.title}</h5>
                      <p className="text-xl font-serif font-bold text-white mt-1 mb-2">{card.count}</p>
                      <p className="text-xs text-luxury-text-dark leading-relaxed">{card.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

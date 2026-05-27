"use client";

import React from "react";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import { Sparkles, Percent, Tag, Calendar } from "lucide-react";

export default function PromotionsPage() {
  const promos = [
    { title: "Grand Cru Selection Discount", desc: "Enjoy 10% off on all Grand Cru selections including Château Margaux when purchasing 3 or more bottles.", code: "CRU10", validity: "Valid until June 30, 2026", color: "border-gold-500/20 bg-gold-950/10 text-gold-400" },
    { title: "Corporate Tasting Package", desc: "Book a corporate event for 50+ guests and receive a complimentary case of Moët & Chandon Impérial.", code: "CORPCHAMP", validity: "Valid until July 15, 2026", color: "border-wine-500/20 bg-wine-950/10 text-wine-400" },
    { title: "Southkey Cellar Launch Promotion", desc: "Exclusive launch discount of 15% on Penfolds Bin 389 Cabernet Shiraz Blend at our Mid Valley Southkey branch.", code: "SOUTHKEYLAUNCH", validity: "Valid until June 15, 2026", color: "border-sky-500/20 bg-sky-950/10 text-sky-400" }
  ];

  return (
    <div className="min-h-screen bg-wine-gradient text-zinc-100 flex flex-col font-sans">
      <PublicHeader />

      <main className="max-w-4xl mx-auto px-6 py-12 flex-1 w-full space-y-10 animate-fade-in-up">
        {/* Title */}
        <div className="text-center space-y-3">
          <span className="text-gold-500 text-xs font-bold uppercase tracking-[0.2em]">Limited Offers</span>
          <h1 className="font-serif text-4xl font-bold text-white">Promotions & Campaigns</h1>
        </div>

        {/* Promotions List */}
        <div className="space-y-6">
          {promos.map((promo, idx) => (
            <div 
              key={idx} 
              className={`glass-panel border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-300 hover:border-gold-500/30`}
            >
              <div className="space-y-3 max-w-xl text-left">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded bg-wine-900/50 text-gold-500"><Sparkles className="w-4 h-4" /></span>
                  <h3 className="font-serif text-xl font-bold text-white leading-snug">{promo.title}</h3>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {promo.desc}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{promo.validity}</span>
                </div>
              </div>

              <div className="w-full md:w-auto shrink-0 flex flex-col items-stretch md:items-end gap-2">
                <div className="border border-dashed border-gold-500/35 bg-luxury-black/60 rounded-xl px-6 py-3.5 text-center">
                  <span className="text-[10px] text-zinc-500 block uppercase tracking-wider font-semibold mb-1">Coupon Code</span>
                  <span className="font-mono text-md font-bold tracking-widest text-gold-500">{promo.code}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

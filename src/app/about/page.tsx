"use client";

import React from "react";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import { Sparkles, Wine, Shield, Clock, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-wine-gradient text-zinc-100 flex flex-col font-sans">
      <PublicHeader />

      <main className="max-w-4xl mx-auto px-6 py-20 flex-1 space-y-16 animate-fade-in-up">
        {/* Page Title */}
        <div className="text-center space-y-4">
          <span className="text-gold-500 text-xs font-bold uppercase tracking-[0.25em]">Our Story</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white">Cultivating Elegance</h1>
          <div className="w-24 h-0.5 bg-gold-500/40 mx-auto mt-4" />
        </div>

        {/* Narrative Section */}
        <section className="glass-panel rounded-2xl p-8 md:p-12 border border-luxury-border space-y-6">
          <h2 className="font-serif text-2xl text-white">The Legacy of Guna Wines</h2>
          <p className="text-zinc-300 text-sm leading-relaxed">
            Founded in 2026, Guna Wines started with a simple, singular vision: to curate JB, Malaysia's most 
            refined selection of fine wines while digitizing the operational management of boutique cellars. 
            We believe that every bottle has a story, and the technology behind sourcing and supplying it 
            should be as elegant as the wine itself.
          </p>
          <p className="text-zinc-300 text-sm leading-relaxed">
            From our central reserves, we supply three state-of-the-art cellars situated at KSL City Mall, 
            Mid Valley Southkey, and Puteri Harbour. By leveraging our custom operational architecture, we ensure 
            complete real-time stock integrity, perfect temperature dispatch tracing, and white-glove event booking systems.
          </p>
        </section>

        {/* Core Pillars */}
        <section className="grid sm:grid-cols-3 gap-6">
          {[
            { title: "Curation", desc: "Sourcing verified Grand Cru estates from Bordeaux, Tuscany, and Napa.", icon: Wine },
            { title: "Integrity", desc: "Full tracking of logistics and cellar conditions from port to glass.", icon: Shield },
            { title: "Service", desc: "Tailoring masterclass events and private wedding tastings with precision.", icon: Sparkles }
          ].map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div key={i} className="glass-panel rounded-xl p-6 border border-luxury-border text-center space-y-3">
                <Icon className="w-8 h-8 text-gold-500 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-white">{pillar.title}</h3>
                <p className="text-xs text-luxury-text-dark leading-relaxed">{pillar.desc}</p>
              </div>
            );
          })}
        </section>

        {/* Luxury Standards Reassurance Section */}
        <section className="border-t border-luxury-border/30 pt-16 space-y-12">
          <div className="text-center">
            <span className="text-gold-500 text-xs font-bold uppercase tracking-widest block mb-2">Why Choose Guna Wines</span>
            <h2 className="font-serif text-2xl md:text-3xl text-white font-bold">Uncompromising Luxury Standards</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-3">
              <Clock className="w-8 h-8 text-gold-500 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Premium Cellarage</h4>
              <p className="text-[10px] text-luxury-text-dark leading-relaxed">Stored at constant 12°C temperature and 65% humidity levels.</p>
            </div>
            <div className="space-y-3">
              <ShieldCheck className="w-8 h-8 text-gold-500 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Authenticity Guaranteed</h4>
              <p className="text-[10px] text-luxury-text-dark leading-relaxed">Direct provenance with certified estate documents for every bottle.</p>
            </div>
            <div className="space-y-3">
              <Wine className="w-8 h-8 text-gold-500 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sommelier Concierge</h4>
              <p className="text-[10px] text-luxury-text-dark leading-relaxed">Dedicated expert support for private collections and dinner pairings.</p>
            </div>
            <div className="space-y-3">
              <Sparkles className="w-8 h-8 text-gold-500 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Corporate Privileges</h4>
              <p className="text-[10px] text-luxury-text-dark leading-relaxed">Private lounge access, corporate accounts, and customized luxury gifting.</p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

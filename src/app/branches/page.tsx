"use client";

import React from "react";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import { mockBranches } from "../../data/mockData";
import { MapPin, Phone, User, Clock } from "lucide-react";

export default function BranchesPage() {
  return (
    <div className="min-h-screen bg-wine-gradient text-zinc-100 flex flex-col font-sans">
      <PublicHeader />

      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full space-y-10 animate-fade-in-up">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-gold-500 text-xs font-bold uppercase tracking-[0.2em]">Retail cellars</span>
          <h1 className="font-serif text-4xl font-bold text-white">Our JB, Malaysia Outlets</h1>
          <p className="text-xs text-luxury-text-dark leading-relaxed">
            Visit any of our state-of-the-art branch outlets for sommelier assistance, immediate POS sales purchase, 
            or click-and-collect fulfillment.
          </p>
        </div>

        {/* Branches Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {mockBranches.map((branch) => (
            <div 
              key={branch.id} 
              className="glass-panel glass-card-hover rounded-2xl p-6 border border-luxury-border flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-serif text-xl font-bold text-white leading-snug">{branch.name}</h3>
                  <span className="p-2.5 bg-wine-800/40 rounded-xl border border-gold-500/20 text-gold-500">
                    <MapPin className="w-5 h-5" />
                  </span>
                </div>
                
                <p className="text-xs text-zinc-300 leading-relaxed min-h-[36px]">
                  {branch.location}
                </p>
              </div>

              <div className="border-t border-luxury-border/30 pt-4 space-y-3 text-xs text-luxury-text-dark font-medium">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gold-500/80 shrink-0" />
                  <span>{branch.contact}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gold-500/80 shrink-0" />
                  <span>Manager: <strong className="text-white">{branch.managerName}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gold-500/80 shrink-0" />
                  <span>Daily: 11:00 AM — 10:00 PM</span>
                </div>
              </div>

              <button className="w-full py-2.5 bg-wine-950/40 hover:bg-wine-900/60 border border-gold-500/20 text-gold-500 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer">
                View Cellar Inventory
              </button>
            </div>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

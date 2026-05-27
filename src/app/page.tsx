"use client";

import React from "react";
import Link from "next/link";
import { 
  Wine, 
  ChevronRight, 
  MapPin, 
  Calendar, 
  Compass, 
  Sparkles, 
  Award,
  ShieldCheck,
  Clock
} from "lucide-react";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import { mockBranches } from "../data/mockData";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-wine-gradient text-zinc-100 flex flex-col font-sans">
      <PublicHeader />

      {/* Hero Section with Wine Cellar Background Image */}
      <section 
        className="relative py-32 md:py-48 flex flex-col items-center justify-center text-center px-6 overflow-hidden bg-cover bg-center animate-fade-in"
        style={{ backgroundImage: "url('/images/wine-hero-bg.png')" }}
      >
        {/* Dark elegant overlay for maximum contrast and luxury feel */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-luxury-black/90 to-luxury-black/98" />

        <div className="max-w-4xl mx-auto z-10 animate-fade-in-up">
          <span className="text-gold-500 text-xs font-bold uppercase tracking-[0.35em] block mb-4">
            Est. 2026 — Johor, Malaysia
          </span>
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
            Exquisite Fine Wines, <span className="text-shimmer block mt-2">Curated for Connoisseurs</span>
          </h1>
          <p className="text-zinc-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-sans leading-relaxed">
            Welcome to Johor's premier sanctuary for fine wine enthusiasts. Explore our carefully curated reserves of legendary vintages, grand crus, and bespoke tasting events designed for the discerning palate.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/products" 
              className="w-full sm:w-auto px-8 py-4 bg-wine-700 text-white font-bold uppercase text-xs tracking-wider rounded-lg hover:bg-wine-600 active:bg-wine-800 transition-all duration-300 shadow-xl flex items-center justify-center gap-2 border border-wine-500/20"
            >
              Browse Collection <Compass className="w-4 h-4 text-gold-400" />
            </Link>
            <Link 
              href="/events" 
              className="w-full sm:w-auto px-8 py-4 border border-gold-500/40 text-gold-500 font-bold uppercase text-xs tracking-wider rounded-lg hover:bg-gold-500/10 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              Book Private Tasting <Calendar className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Consumer Pillars Section */}
      <section className="py-24 bg-luxury-dark/40 border-y border-luxury-border px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-gold-500 text-xs font-bold uppercase tracking-[0.2em] block mb-2">Our Philosophy</span>
            <h2 className="font-serif text-3xl md:text-4xl text-white font-bold">
              The Guna Wines Experience
            </h2>
            <p className="text-luxury-text-dark text-xs mt-3 leading-relaxed">
              We bring direct provenance and the finest vintage selections to Johor, accompanied by personalized sommelier-guided services.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="glass-panel rounded-2xl p-8 border border-luxury-border transition-all duration-300 hover:border-gold-500/30">
              <div className="w-12 h-12 bg-wine-800/40 border border-gold-500/20 text-gold-500 flex items-center justify-center rounded-xl mb-6">
                <Wine className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-white mb-3">Bespoke Curation</h3>
              <p className="text-xs text-luxury-text-dark leading-relaxed">
                Our sommeliers handpick each bottle from the world’s most prestigious Grand Cru estates in Bordeaux, Tuscany, and Napa Valley.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="glass-panel rounded-2xl p-8 border border-luxury-border transition-all duration-300 hover:border-gold-500/30">
              <div className="w-12 h-12 bg-wine-800/40 border border-gold-500/20 text-gold-500 flex items-center justify-center rounded-xl mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-white mb-3">Private Masterclasses</h3>
              <p className="text-xs text-luxury-text-dark leading-relaxed">
                Indulge in exclusive tasting sessions, private masterclasses, and custom food pairings led by expert sommeliers at our luxury cellars.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="glass-panel rounded-2xl p-8 border border-luxury-border transition-all duration-300 hover:border-gold-500/30">
              <div className="w-12 h-12 bg-wine-800/40 border border-gold-500/20 text-gold-500 flex items-center justify-center rounded-xl mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-white mb-3">Luxury Gifting & Events</h3>
              <p className="text-xs text-luxury-text-dark leading-relaxed">
                From corporate tasting galas and yacht charter pairings to custom wooden gift hampers, we orchestrate unforgettable wine memories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Branch Showcase */}
      <section id="branches" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-gold-500 text-xs font-bold uppercase tracking-widest block mb-2">Johor Outlets</span>
            <h2 className="font-serif text-3xl md:text-4xl text-white font-bold">Our Retail Cellars</h2>
          </div>
          <p className="text-luxury-text-dark text-xs max-w-md leading-relaxed">
            Visit any of our state-of-the-art branch cellars across Johor, Malaysia. Each location maintains perfect temperature-controlled cellarage and an active sommelier consultation desk.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockBranches.map((branch) => (
            <div key={branch.id} className="glass-panel glass-card-hover rounded-2xl p-6 border border-luxury-border flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-serif text-lg font-bold text-white">{branch.name}</h4>
                  <MapPin className="w-5 h-5 text-gold-500" />
                </div>
                <div className="space-y-2 text-xs text-luxury-text-dark border-t border-luxury-border/30 pt-4 mt-2">
                  <p><span className="text-zinc-500">Address:</span> {branch.location}</p>
                  <p><span className="text-zinc-500">Contact:</span> {branch.contact}</p>
                  <p><span className="text-zinc-500">Manager:</span> {branch.managerName}</p>
                </div>
              </div>
              <Link 
                href="/products"
                className="w-full mt-6 py-2.5 bg-wine-950/40 hover:bg-wine-900/60 border border-gold-500/20 text-gold-500 text-xs font-bold uppercase tracking-wider rounded-lg text-center transition-colors cursor-pointer block animate-pulse hover:animate-none"
              >
                Explore Cellar Portfolio
              </Link>
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { Wine } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="border-t border-luxury-border bg-luxury-black py-12 px-6 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left">
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-wine-800 border border-gold-500/30 flex items-center justify-center">
              <Wine className="w-5 h-5 text-gold-500" />
            </div>
            <span className="font-serif text-md font-bold tracking-wide text-gold-500">GUNA WINES</span>
          </div>
          <p className="text-xs text-luxury-text-dark leading-relaxed max-w-sm">
            JB, Malaysia's premier digital platform dedicated to fine wine logistics, multi-branch cellar operations, 
            interactive POS checkouts, and premium private wine event coordination.
          </p>
        </div>
        
        <div>
          <h4 className="text-xs uppercase tracking-widest font-bold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2 text-xs text-luxury-text-dark font-semibold">
            <li><Link href="/about" className="hover:text-gold-500 transition-colors">About Us</Link></li>
            <li><Link href="/products" className="hover:text-gold-500 transition-colors">Product Catalogue</Link></li>
            <li><Link href="/branches" className="hover:text-gold-500 transition-colors">Retail Cellars</Link></li>
            <li><Link href="/promotions" className="hover:text-gold-500 transition-colors">Special Offers</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest font-bold text-white mb-4">Services</h4>
          <ul className="space-y-2 text-xs text-luxury-text-dark font-semibold">
            <li><Link href="/events" className="hover:text-gold-500 transition-colors">Private Wine Tastings</Link></li>
            <li><Link href="/events" className="hover:text-gold-500 transition-colors">Corporate Events</Link></li>
            <li><Link href="/about" className="hover:text-gold-500 transition-colors">Cellar Consultation</Link></li>
            <li><Link href="/events" className="hover:text-gold-500 transition-colors">Sommelier Masterclass</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-luxury-border/30 pt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] text-luxury-text-dark gap-4">
        <p>© 2026 Guna Wines JB, Malaysia. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-gold-500 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-gold-500 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-gold-500 transition-colors">Corporate Enquiry</a>
        </div>
      </div>
    </footer>
  );
}

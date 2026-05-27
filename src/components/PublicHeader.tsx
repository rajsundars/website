"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wine, Layers, Menu, X } from "lucide-react";

export default function PublicHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "About", path: "/about" },
    { label: "Products", path: "/products" },
    { label: "Branches", path: "/branches" },
    { label: "Events", path: "/events" },
    { label: "Promotions", path: "/promotions" },
    { label: "Contact", path: "/contact" }
  ];

  return (
    <header className="border-b border-luxury-border bg-luxury-dark/70 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-wine-800 border border-gold-500/30 flex items-center justify-center">
            <Wine className="w-6 h-6 text-gold-500" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold tracking-wide text-gold-500 leading-none">GUNA WINES</h1>
            <p className="text-[10px] text-luxury-text-dark tracking-widest uppercase mt-0.5">JB, Malaysia</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 text-xs uppercase tracking-widest font-semibold text-zinc-300">
          {navLinks.map((link, idx) => (
            <Link 
              key={idx} 
              href={link.path} 
              className={`hover:text-gold-500 transition-colors ${
                pathname === link.path ? "text-gold-500 font-bold" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-4">
          <Link 
            href="/admin" 
            className="px-5 py-2.5 bg-gold-500 text-luxury-black font-bold uppercase text-[10px] tracking-wider rounded hover:bg-gold-400 active:bg-gold-600 transition-colors shadow-lg"
          >
            Admin Portal
          </Link>
        </div>

        {/* Mobile menu button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 md:hidden text-gold-500 hover:bg-wine-950/20 rounded-lg border border-luxury-border/50 cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-luxury-border bg-luxury-dark/95 backdrop-blur-lg px-6 py-6 space-y-4 animate-fade-in">
          <div className="flex flex-col gap-4 text-sm font-semibold uppercase tracking-wider">
            {navLinks.map((link, idx) => (
              <Link 
                key={idx} 
                href={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`hover:text-gold-500 transition-colors ${
                  pathname === link.path ? "text-gold-500 font-bold" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="h-px bg-luxury-border my-4" />
          <div className="flex flex-col gap-3">
            <Link 
              href="/admin" 
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 bg-gold-500 text-luxury-black font-bold uppercase text-xs tracking-wider rounded hover:bg-gold-400 transition-colors shadow-lg"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

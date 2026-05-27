"use client";

import React, { useState } from "react";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import { mockProducts } from "../../data/mockData";
import { Search, SlidersHorizontal, Wine, Globe, Package } from "lucide-react";

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.origin.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "all" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-wine-gradient text-zinc-100 flex flex-col font-sans">
      <PublicHeader />

      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full space-y-10 animate-fade-in-up">
        {/* Title */}
        <div className="text-center md:text-left">
          <span className="text-gold-500 text-xs font-bold uppercase tracking-[0.2em]">Curated Reserves</span>
          <h1 className="font-serif text-4xl font-bold text-white mt-1">Our Wine Portfolio</h1>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-y border-luxury-border/30 py-6">
          {/* Categories Tab selector */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {[
              { id: "all", label: "All Reserves" },
              { id: "red", label: "Red Wine" },
              { id: "white", label: "White Wine" },
              { id: "sparkling", label: "Champagne / Sparkling" },
              { id: "rose", label: "Rosé" }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-gold-500 text-luxury-black border-gold-500 shadow-md shadow-gold-500/10"
                    : "border-luxury-border/55 bg-luxury-black/30 text-zinc-400 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80 shrink-0">
            <span className="absolute left-3.5 top-3 text-zinc-500"><Search className="w-4 h-4" /></span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by estate, region, SKU..."
              className="w-full pl-10 pr-4 py-2.5 bg-luxury-black/60 border border-luxury-border rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="glass-panel glass-card-hover rounded-2xl overflow-hidden border border-luxury-border flex flex-col h-full"
              >
                {/* Visual placeholder */}
                <div className="h-48 bg-luxury-black/70 border-b border-luxury-border/40 relative flex items-center justify-center">
                  <div className="absolute top-3 left-3 px-2 py-0.5 text-[8px] font-mono tracking-wider bg-wine-900 border border-gold-500/20 text-gold-400 uppercase rounded">
                    {product.sku}
                  </div>
                  <Wine className="w-16 h-16 text-wine-700/60" />
                </div>

                <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] text-gold-500 font-bold uppercase tracking-wider font-sans block">
                      {product.variant}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-white leading-snug">{product.name}</h3>
                    <p className="text-xs text-luxury-text-dark line-clamp-3 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="border-t border-luxury-border/30 pt-4 mt-2 space-y-3">
                    <div className="flex justify-between items-center text-xs text-zinc-400 font-medium">
                      <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {product.origin}</span>
                      <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5" /> {product.bottleSize}</span>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <span className="text-lg font-serif font-bold text-white">RM {product.price.toFixed(2)}</span>
                      <button className="px-3 py-1.5 border border-gold-500/30 text-gold-500 hover:bg-gold-500 text-[10px] font-bold uppercase tracking-wider rounded transition-colors cursor-pointer hover:text-luxury-black">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-luxury-dark/20 border border-luxury-border/30 rounded-2xl">
            <Wine className="w-12 h-12 text-wine-900 mx-auto mb-4" />
            <p className="text-sm text-zinc-500">No wines found matching your filter criteria.</p>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}

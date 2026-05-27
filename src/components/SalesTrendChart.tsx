"use client";

import React from "react";

interface TrendBar {
  month: string;
  val: number;
  h: string;
}

interface SalesTrendChartProps {
  trendBars: TrendBar[];
}

export default function SalesTrendChart({ trendBars }: SalesTrendChartProps) {
  return (
    <div className="h-64 flex items-end justify-between gap-2 pt-6 border-b border-luxury-border/30 pb-2">
      {trendBars.map((bar, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
          <div className="w-full relative flex items-end justify-center h-52">
            {/* Bar Background */}
            <div className="w-4/5 sm:w-12 bg-wine-950/40 border border-luxury-border rounded-t-lg h-full absolute top-0 left-1/2 -translate-x-1/2" />
            {/* Bar Fill */}
            <div className={`w-4/5 sm:w-12 bg-gradient-to-t from-wine-800 to-wine-600 group-hover:to-gold-500 rounded-t-lg transition-all duration-300 ${bar.h} z-10 relative shadow-lg shadow-wine-900/30`} />
          </div>
          <span className="text-[9px] font-bold text-zinc-400 font-mono uppercase">{bar.month}</span>
          <span className="text-[8px] font-mono text-gold-500">RM {bar.val.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

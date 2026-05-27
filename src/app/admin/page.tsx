"use client";
import { API_BASE_URL } from "@/config";


import React, { useState, useEffect, useMemo } from "react";
import { useAdmin } from "../../context/AdminContext";
import { 
  TrendingUp, 
  Wine, 
  Truck, 
  Users, 
  RefreshCw, 
  AlertTriangle, 
  Eye, 
  FileText,
  Calendar,
  Activity,
  Download,
  Loader2,
  FileSpreadsheet
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const LazySalesTrendChart = dynamic(() => import("../../components/SalesTrendChart"), {
  loading: () => <div className="h-64 flex items-center justify-center text-xs text-zinc-500 font-mono">Loading chart analytics...</div>,
  ssr: false
});

const LazyAuditActivityLogs = dynamic(() => import("../../components/AuditActivityLogs"), {
  loading: () => <div className="py-10 flex items-center justify-center text-xs text-zinc-500 font-mono">Loading activity history...</div>,
  ssr: false
});

interface DashboardData {
  revenue: number;
  stockCount: number;
  staffCount: number;
  eventCount: number;
  lowStockItems: Array<{
    id: string;
    productName: string;
    branchName: string;
    quantity: number;
    minThreshold: number;
  }>;
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string;
    customerName: string;
    totalAmount: number;
    paymentMethod: string;
    date: string;
    status: string;
    branchName: string;
  }>;
  salesTrends: Array<{
    month: string;
    val: number;
  }>;
  activityLogs: Array<{
    id: string;
    userName: string;
    action: string;
    details: string;
    timestamp: string;
  }>;
}

const branchesConfig = [
  { id: "b1", name: "KSL City Cellar" },
  { id: "b2", name: "Mid Valley Cellar" },
  { id: "b3", name: "Puteri Harbour Cellar" }
];

export default function AdminDashboard() {
  const { activeBranch } = useAdmin();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const branchLabel = useMemo(() => {
    if (activeBranch === "all") return "All Branches (Global)";
    const found = branchesConfig.find((b) => b.id === activeBranch);
    return found ? found.name : "Active Cellar";
  }, [activeBranch]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = activeBranch === "all"
        ? API_BASE_URL + "/api/reports/dashboard"
        : `${API_BASE_URL}/api/reports/dashboard?branchId=${activeBranch}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load dashboard report.");
      const report = await res.json();
      setData(report);
    } catch (err: any) {
      setError(err.message || "Error loaded report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeBranch]);

  const handleExportCSV = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports/sales/csv?branchId=${activeBranch}`);
      if (!res.ok) throw new Error("Could not download CSV report.");
      const blob = await res.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.setAttribute("download", `Guna_Wines_Sales_Report_${activeBranch}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Error exporting CSV report.");
    }
  };

  const handleExportPDF = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports/sales/pdf?branchId=${activeBranch}`);
      if (!res.ok) throw new Error("Could not download PDF report.");
      const blob = await res.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.setAttribute("download", `Guna_Wines_Executive_Report_${activeBranch}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Error exporting PDF report.");
    }
  };

  const handleDownloadInvoice = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/invoice/${invoiceId}/pdf`);
      if (!res.ok) throw new Error("Could not stream invoice PDF.");
      const blob = await res.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.setAttribute("download", `Guna_Wines_Invoice_${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Failed to download invoice receipt.");
    }
  };

  // Convert monthly values into tailwind height markers
  const trendBars = useMemo(() => {
    if (!data) return [];
    
    // Find max value in dataset to scale heights
    const maxVal = Math.max(...data.salesTrends.map(t => t.val), 1000);

    return data.salesTrends.map((t) => {
      const percent = Math.max(10, Math.floor((t.val / maxVal) * 100));
      let heightClass = "h-[10%]";
      
      if (percent > 90) heightClass = "h-[90%]";
      else if (percent > 75) heightClass = "h-[75%]";
      else if (percent > 50) heightClass = "h-[50%]";
      else if (percent > 30) heightClass = "h-[30%]";
      else if (percent > 15) heightClass = "h-[18%]";

      return {
        month: t.month,
        val: t.val,
        h: heightClass
      };
    });
  }, [data]);

  return (
    <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto font-sans">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-luxury-border/30 pb-6 text-left">
        <div>
          <h2 className="font-serif text-3xl font-bold text-white">Executive Dashboard</h2>
          <p className="text-xs text-luxury-text-dark mt-1 font-medium">
            Displaying metrics for: <strong className="text-gold-500 font-bold">{branchLabel}</strong>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-luxury-border hover:border-gold-500/40 rounded-lg text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-all cursor-pointer bg-luxury-black/40"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export CSV
          </button>

          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-luxury-border hover:border-gold-500/40 rounded-lg text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-all cursor-pointer bg-luxury-black/40"
          >
            <Download className="w-4 h-4 text-gold-500" /> Executive PDF
          </button>

          <button 
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-3.5 py-2 bg-gold-500 text-luxury-black hover:bg-gold-400 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Sync Data
          </button>
        </div>
      </div>

      {loading || !data ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
          <p className="text-xs text-luxury-text-dark uppercase tracking-widest font-semibold">Consolidating system ledgers...</p>
        </div>
      ) : error ? (
        <div className="p-10 text-center text-rose-400 text-xs">
          {error}
        </div>
      ) : (
        <>
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {/* Revenue */}
            <div className="glass-panel rounded-xl p-6 border border-luxury-border">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Revenue (RM)</span>
                <span className="p-2 rounded-lg bg-wine-950/40 border border-luxury-border text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <h4 className="font-serif text-2xl font-bold text-white">RM {data.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
              <p className="text-[10px] text-zinc-500 font-medium mt-1">Sum of completed checkout payments</p>
            </div>

            {/* Inventory */}
            <div className="glass-panel rounded-xl p-6 border border-luxury-border">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">In-Stock Bottles</span>
                <span className="p-2 rounded-lg bg-wine-950/40 border border-luxury-border text-gold-500">
                  <Wine className="w-4 h-4" />
                </span>
              </div>
              <h4 className="font-serif text-2xl font-bold text-white">{data.stockCount} bottles</h4>
              <p className="text-[10px] text-zinc-500 font-medium mt-1">Total physical stock balance</p>
            </div>

            {/* Logistics */}
            <div className="glass-panel rounded-xl p-6 border border-luxury-border">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Event Bookings</span>
                <span className="p-2 rounded-lg bg-wine-950/40 border border-luxury-border text-sky-400">
                  <Calendar className="w-4 h-4" />
                </span>
              </div>
              <h4 className="font-serif text-2xl font-bold text-white">
                {data.eventCount} active
              </h4>
              <p className="text-[10px] text-zinc-500 font-medium mt-1">Booked & quoted private curation events</p>
            </div>

            {/* Staff */}
            <div className="glass-panel rounded-xl p-6 border border-luxury-border">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Staff On Duty</span>
                <span className="p-2 rounded-lg bg-wine-950/40 border border-luxury-border text-purple-400">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <h4 className="font-serif text-2xl font-bold text-white">{data.staffCount} active</h4>
              <p className="text-[10px] text-zinc-500 font-medium mt-1">Employees assigned to branch</p>
            </div>
          </div>

          {/* TRENDS AND ALERTS */}
          <div className="grid lg:grid-cols-3 gap-8 text-left">
            {/* Sales Trends Chart */}
            <div className="glass-panel rounded-2xl p-6 border border-luxury-border lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">Monthly Sales Performance</h3>
                  <p className="text-[10px] text-zinc-500 font-sans">Revenue distributions (RM)</p>
                </div>
                <span className="text-[10px] font-bold text-gold-500 bg-gold-950/60 border border-gold-700/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  2026 Year
                </span>
              </div>

              {/* Dynamic bar chart */}
              <LazySalesTrendChart trendBars={trendBars} />
            </div>

            {/* Alerts and low stock warnings */}
            <div className="glass-panel rounded-2xl p-6 border border-luxury-border flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" /> Low Stock Alerts
                  </h3>
                  <span className="px-2 py-0.5 text-[9px] bg-rose-950 text-rose-400 border border-rose-700/30 rounded-full font-bold uppercase tracking-wider">
                    Items ({data.lowStockItems.length})
                  </span>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {data.lowStockItems.length > 0 ? (
                    data.lowStockItems.map((alert) => (
                      <div key={alert.id} className="p-3 rounded-lg border border-amber-500/20 bg-amber-950/15 text-amber-300 text-xs flex flex-col gap-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold leading-tight">{alert.productName}</h4>
                          <span className="text-[9px] font-mono bg-amber-500/10 px-1.5 py-0.5 rounded text-amber-400 font-bold shrink-0">
                            {alert.quantity} Left
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500">{alert.branchName} (Min Threshold: {alert.minThreshold})</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 space-y-2">
                      <span className="text-2xl">🍷</span>
                      <p className="text-xs text-zinc-500 font-medium">All inventory levels are secure.</p>
                    </div>
                  )}
                </div>
              </div>

              <Link href="/admin/inventory" className="w-full">
                <button className="w-full mt-6 py-3 bg-wine-800 hover:bg-wine-700 transition-colors border border-gold-500/20 rounded-lg text-xs font-bold uppercase tracking-wider text-gold-500 cursor-pointer">
                  Manage Inventory Restock
                </button>
              </Link>
            </div>
          </div>

          {/* RECENT TRANSACTIONS */}
          <div className="glass-panel rounded-2xl p-6 border border-luxury-border text-left">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-wine-800/40 text-gold-500 border border-gold-500/10 rounded-lg"><Activity className="w-4 h-4" /></span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">Recent Transactions</h3>
                  <p className="text-[10px] text-zinc-500 font-sans">Recent billing activities at cashier POS desks</p>
                </div>
              </div>
              
              <Link href="/admin/billing">
                <button className="px-3 py-1.5 border border-luxury-border hover:border-gold-500/40 rounded-lg text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors cursor-pointer bg-luxury-black/30">
                  View Ledger
                </button>
              </Link>
            </div>

            <div className="overflow-x-auto">
              {data.recentInvoices.length > 0 ? (
                <table className="w-full text-left text-xs text-zinc-400">
                  <thead>
                    <tr className="border-b border-luxury-border text-zinc-500 uppercase tracking-widest text-[9px] font-bold">
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Branch</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Total Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentInvoices.map((row) => {
                      return (
                        <tr key={row.id} className="border-b border-luxury-border/20 hover:bg-wine-950/10 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-white">{row.invoiceNumber}</td>
                          <td className="py-3.5 px-4 font-semibold text-zinc-300">{row.branchName}</td>
                          <td className="py-3.5 px-4">{row.customerName}</td>
                          <td className="py-3.5 px-4 font-bold text-white font-mono">RM {row.totalAmount.toFixed(2)}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${
                              row.status === "paid" 
                                ? "text-emerald-400 bg-emerald-950/30 border-emerald-500/25"
                                : "text-rose-400 bg-rose-950/30 border-rose-500/25"
                            }`}>
                              {row.status} ({row.paymentMethod})
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button 
                              onClick={() => handleDownloadInvoice(row.id, row.invoiceNumber)}
                              className="p-1.5 hover:text-gold-500 text-zinc-500 hover:bg-wine-900/20 border border-transparent hover:border-gold-500/10 rounded-lg transition-all cursor-pointer inline-flex items-center"
                              title="Download Receipt PDF"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  No recent transactions recorded.
                </div>
              )}
            </div>
          </div>

          {/* DYNAMIC AUDIT LOGS */}
          <div className="glass-panel rounded-2xl p-6 border border-luxury-border text-left">
            <div className="flex items-center gap-2 mb-6">
              <span className="p-1.5 bg-wine-800/40 text-gold-500 border border-gold-500/10 rounded-lg"><Activity className="w-4 h-4" /></span>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Live Audit Activity Logs</h3>
                <p className="text-[10px] text-zinc-500 font-sans">Recent system adjustments, checkout operations and stock transfers</p>
              </div>
            </div>

            <LazyAuditActivityLogs activityLogs={data.activityLogs} />
          </div>
        </>
      )}
    </main>
  );
}

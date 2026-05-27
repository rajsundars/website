"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AdminProvider, useAdmin } from "../../context/AdminContext";
import { 
  Wine, 
  Layers, 
  TrendingUp, 
  Truck, 
  Users, 
  Calendar, 
  Settings, 
  Menu, 
  Bell, 
  User, 
  Search, 
  ArrowLeft
} from "lucide-react";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    activeBranch, 
    setActiveBranch, 
    isAuthenticated, 
    loading, 
    user, 
    logout 
  } = useAdmin();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { label: "Dashboard", icon: Layers, path: "/admin" },
    { label: "Inventory", icon: Wine, path: "/admin/inventory" },
    { label: "Billing & POS", icon: TrendingUp, path: "/admin/billing" },
    { label: "Logistics", icon: Truck, path: "/admin/logistics" },
    { label: "Employees", icon: Users, path: "/admin/employees" },
    { label: "Event Management", icon: Calendar, path: "/admin/events" },
    { label: "Customer CRM", icon: User, path: "/admin/customers" },
    { label: "Settings", icon: Settings, path: "/admin/settings" },
    { label: "Design System", icon: Layers, path: "/admin/design-system" }
  ];

  return (
    <div className="min-h-screen bg-admin-gradient text-zinc-100 flex font-sans">
      {/* SIDEBAR NAVIGATION */}
      <aside 
        className={`bg-luxury-dark/95 border-r border-luxury-border flex flex-col transition-all duration-300 z-30 shrink-0 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-20 border-b border-luxury-border flex items-center px-5 gap-3 justify-between">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-wine-800 border border-gold-500/30 flex items-center justify-center shrink-0">
              <Wine className="w-6 h-6 text-gold-500" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-serif text-sm font-bold tracking-wider text-gold-500">GUNA WINES</h1>
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest leading-none mt-0.5">Admin Core</p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={idx}
                href={item.path}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  isActive 
                    ? "bg-wine-900/60 border border-gold-500/20 text-gold-500" 
                    : "text-zinc-400 hover:bg-wine-950/20 hover:text-white border border-transparent"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-luxury-border text-center overflow-hidden">
          <button 
            onClick={logout}
            className="flex items-center justify-center gap-2 text-xs font-semibold text-zinc-500 hover:text-gold-500 transition-colors uppercase tracking-wider w-full cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* GLOBAL HEADER */}
        <header className="h-20 border-b border-luxury-border bg-luxury-dark/40 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-wine-950/30 rounded-lg border border-luxury-border/50 text-gold-500 transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-luxury-black/60 border border-luxury-border px-3.5 py-2 rounded-lg text-xs font-semibold">
              <span className="text-zinc-500 uppercase font-mono">Branch:</span>
              <select 
                value={activeBranch} 
                onChange={(e) => setActiveBranch(e.target.value)}
                className="bg-transparent border-none text-gold-500 font-bold focus:outline-none pr-2 cursor-pointer"
              >
                <option value="all" className="bg-luxury-black text-white">All Cellars (Global)</option>
                <option value="b1" className="bg-luxury-black text-white">KSL City Cellar</option>
                <option value="b2" className="bg-luxury-black text-white">Mid Valley Cellar</option>
                <option value="b3" className="bg-luxury-black text-white">Puteri Harbour Cellar</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <span className="absolute left-3 top-2.5 text-zinc-600"><Search className="w-4 h-4" /></span>
              <input 
                type="text" 
                placeholder="Search invoices, SKUs, employees..." 
                className="pl-9 pr-4 py-2 bg-luxury-black/50 border border-luxury-border rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-gold-500 w-64"
              />
            </div>
            
            <button className="p-2 bg-wine-950/20 border border-luxury-border rounded-lg text-zinc-400 hover:text-white transition-colors relative cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            </button>

            <div className="h-10 w-px bg-luxury-border" />

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-wine-800 border border-gold-500/20 flex items-center justify-center text-gold-500 font-bold text-xs">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="hidden lg:block text-left leading-none">
                <p className="text-xs font-bold text-white">{user?.name || "Admin Guna"}</p>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mt-0.5 block">
                  {user?.role ? user.role.replace("_", " ") : "Super Admin"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT */}
        <div className="flex-1 flex flex-col min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutInner>{children}</AdminLayoutInner>;
}

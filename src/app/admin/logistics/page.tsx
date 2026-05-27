"use client";
import { API_BASE_URL } from "@/config";


import React, { useMemo, useState, useEffect } from "react";
import { useAdmin } from "../../../context/AdminContext";
import { Truck, Plus, CheckCircle2, ArrowRight, X, Loader2, AlertTriangle, Shield, DollarSign } from "lucide-react";

interface ShipmentRow {
  id: string;
  origin: string;
  dest: string;
  date: string;
  status: "dispatched" | "delivered" | "damaged" | "pending";
  cost: number;
  carrier: string;
  notes: string;
  fromBranchId?: string;
  toBranchId?: string;
  productId?: string;
  quantity?: number;
  productName?: string;
}

interface ProductOption {
  id: string;
  name: string;
  sku: string;
}

export default function AdminLogisticsPage() {
  const { activeBranch, token } = useAdmin();

  const [shipments, setShipments] = useState<ShipmentRow[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalExpenses, setGlobalExpenses] = useState(0);

  // Modal State
  const [showLogModal, setShowLogModal] = useState(false);

  // Form State
  const [logOrigin, setLogOrigin] = useState("Quorum Logistics HQ");
  const [logDest, setLogDest] = useState("KSL City Cellar");
  const [logDate, setLogDate] = useState("");
  const [logCarrier, setLogCarrier] = useState("Speedy Cargo");
  const [logCost, setLogCost] = useState("120");
  const [logToBranchId, setLogToBranchId] = useState("b1");
  const [logProductId, setLogProductId] = useState("");
  const [logQty, setLogQty] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const [logSubmitting, setLogSubmitting] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);

  // Action status
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchShipments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE_URL + "/api/logistics/shipments");
      if (!res.ok) {
        throw new Error("Failed to load shipments history.");
      }
      const data = await res.json();
      setShipments(data);

      const expRes = await fetch(API_BASE_URL + "/api/logistics/expenses");
      if (expRes.ok) {
        const expData = await expRes.json();
        setGlobalExpenses(expData.totalExpense || 0);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred fetching logistics data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(API_BASE_URL + "/api/inventory/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        if (data.length > 0) {
          setLogProductId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  useEffect(() => {
    fetchShipments();
    fetchProducts();
    setLogDate(new Date().toISOString().split("T")[0]);
  }, []);

  const filteredShipments = useMemo(() => {
    if (activeBranch === "all") return shipments;
    
    const branchLabel = activeBranch === "b1" 
      ? "KSL City" 
      : activeBranch === "b2" 
        ? "Mid Valley" 
        : "Puteri Harbour";

    return shipments.filter(
      (s) => s.dest.includes(branchLabel) || s.origin.includes(branchLabel)
    );
  }, [activeBranch, shipments]);

  const handleDeliver = async (shipmentId: string) => {
    setActionLoadingId(shipmentId);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/logistics/shipments/${shipmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: "delivered" })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update shipment status.");
      }

      setSuccessMessage("Shipment delivered and stock added to target branch cellar!");
      fetchShipments();
      
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || "Error finalizing delivery.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logOrigin || !logDest || !logDate || !logCarrier) {
      setLogError("Origin, Destination, Date, and Carrier are required.");
      return;
    }

    setLogSubmitting(true);
    setLogError(null);

    try {
      const payload = {
        origin: logOrigin,
        dest: logDest,
        date: logDate,
        carrier: logCarrier,
        cost: parseFloat(logCost) || 0,
        notes: logNotes,
        toBranchId: logToBranchId,
        productId: logProductId || null,
        quantity: logQty ? parseInt(logQty) : null
      };

      const res = await fetch(API_BASE_URL + "/api/logistics/shipments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create shipment.");
      }

      setSuccessMessage("New stock shipment registered successfully!");
      setShowLogModal(false);
      setLogNotes("");
      setLogQty("");
      
      fetchShipments();

      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setLogError(err.message || "Error logging shipment.");
    } finally {
      setLogSubmitting(false);
    }
  };

  const handleBranchIdChange = (id: string) => {
    setLogToBranchId(id);
    const branchName = id === "b1" 
      ? "KSL City Cellar" 
      : id === "b2" 
        ? "Mid Valley Cellar" 
        : "Puteri Harbour Cellar";
    setLogDest(branchName);
  };

  return (
    <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
      {successMessage && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-emerald-950/90 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-2xl flex items-center gap-3 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-luxury-border/30 pb-6">
        <div>
          <h2 className="font-serif text-3xl font-bold text-white">Logistics & Shipments</h2>
          <p className="text-xs text-luxury-text-dark font-sans mt-1">
            Track stock transfers and Quorum warehouse dispatches.
          </p>
        </div>
        <button 
          onClick={() => setShowLogModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-gold-500 text-luxury-black hover:bg-gold-400 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Log Shipment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 border border-luxury-border rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold font-sans">Active Dispatches</span>
            <p className="font-serif text-2xl font-bold text-white mt-1">
              {filteredShipments.filter(s => s.status === "dispatched").length} Shipments
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-wine-950/40 border border-gold-500/25 flex items-center justify-center text-gold-500">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-6 border border-luxury-border rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold font-sans">Filtered Logistics Cost</span>
            <p className="font-serif text-2xl font-bold text-white mt-1">
              RM {filteredShipments.reduce((acc, curr) => acc + curr.cost, 0).toFixed(2)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-wine-950/40 border border-gold-500/25 flex items-center justify-center text-gold-500">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-6 border border-luxury-border rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold font-sans">Global Logistics Cost</span>
            <p className="font-serif text-2xl font-bold text-gold-500 mt-1">
              RM {globalExpenses.toFixed(2)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-gold-950/40 border border-gold-500/25 flex items-center justify-center text-gold-500">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-500/25 text-rose-300 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="glass-panel rounded-2xl p-6 border border-luxury-border relative min-h-[250px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-luxury-black/30 backdrop-blur-[2px] rounded-2xl">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-xs">
            No shipment logs found matching the filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-400">
              <thead>
                <tr className="border-b border-luxury-border text-zinc-500 uppercase tracking-widest text-[9px] font-bold">
                  <th className="py-3 px-4">Shipment ID</th>
                  <th className="py-3 px-4">Route Path</th>
                  <th className="py-3 px-4">Product Details</th>
                  <th className="py-3 px-4">Carrier</th>
                  <th className="py-3 px-4">Ship Date</th>
                  <th className="py-3 px-4">Cost</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.map((row) => (
                  <tr key={row.id} className="border-b border-luxury-border/20 hover:bg-wine-950/10 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{row.id.toUpperCase()}</td>
                    <td className="py-3.5 px-4 font-semibold">
                      <div className="flex items-center gap-2">
                        <span>{row.origin}</span>
                        <ArrowRight className="w-3 h-3 text-gold-500 shrink-0" />
                        <span>{row.dest}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {row.productName ? (
                        <div>
                          <span className="text-zinc-200 font-medium">{row.productName}</span>
                          <span className="text-[10px] text-zinc-500 block font-mono">Qty: {row.quantity} bottles</span>
                        </div>
                      ) : (
                        <span className="text-zinc-500 italic">Bulk / General Cargo</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">{row.carrier}</td>
                    <td className="py-3.5 px-4 font-mono">{row.date}</td>
                    <td className="py-3.5 px-4 font-mono">RM {row.cost.toFixed(2)}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${
                        row.status === "delivered" 
                          ? "text-emerald-400 bg-emerald-950/30 border-emerald-500/25"
                          : row.status === "damaged"
                            ? "text-rose-400 bg-rose-950/30 border-rose-500/25"
                            : "text-sky-400 bg-sky-950/30 border-sky-500/25"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {row.status === "dispatched" && (
                        <button
                          onClick={() => handleDeliver(row.id)}
                          disabled={actionLoadingId === row.id}
                          className="px-3 py-1 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-luxury-black font-bold uppercase tracking-wider rounded text-[9px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          {actionLoadingId === row.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Approve Delivery
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showLogModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel border border-luxury-border w-full max-w-md rounded-2xl p-6 relative shadow-2xl">
            <button 
              onClick={() => setShowLogModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Truck className="w-5 h-5 text-gold-500" /> Log Restock Shipment
            </h3>

            {logError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {logError}
              </div>
            )}

            <form onSubmit={handleLogSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  Origin Dispatch Point
                </label>
                <input
                  type="text"
                  value={logOrigin}
                  onChange={(e) => setLogOrigin(e.target.value)}
                  className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Destination Cellar
                  </label>
                  <select
                    value={logToBranchId}
                    onChange={(e) => handleBranchIdChange(e.target.value)}
                    className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                  >
                    <option value="b1">KSL City Cellar</option>
                    <option value="b2">Mid Valley Cellar</option>
                    <option value="b3">Puteri Harbour Cellar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Ship Date
                  </label>
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Transporter Carrier
                  </label>
                  <input
                    type="text"
                    value={logCarrier}
                    onChange={(e) => setLogCarrier(e.target.value)}
                    className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Delivery Cost (RM)
                  </label>
                  <input
                    type="number"
                    value={logCost}
                    onChange={(e) => setLogCost(e.target.value)}
                    className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="border-t border-luxury-border/30 pt-3">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Item Contents (For Restocking)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                      Wine Product
                    </label>
                    <select
                      value={logProductId}
                      onChange={(e) => setLogProductId(e.target.value)}
                      className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          [{p.sku}] {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                      Restock Quantity
                    </label>
                    <input
                      type="number"
                      value={logQty}
                      onChange={(e) => setLogQty(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  General Notes
                </label>
                <textarea
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="Additional dispatch instructions..."
                  rows={2}
                  className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={logSubmitting}
                  className="flex-1 py-3 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-luxury-black font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {logSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Register Shipment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

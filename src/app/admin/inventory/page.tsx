"use client";
import { API_BASE_URL } from "@/config";


import React, { useMemo, useState, useEffect } from "react";
import { useAdmin } from "../../../context/AdminContext";
import { Wine, AlertTriangle, Plus, ArrowUpDown, Shield, X, Loader2 } from "lucide-react";

interface InventoryRow {
  id: string;
  productId: string;
  branchId: string;
  quantity: number;
  reservedQuantity: number;
  minThreshold: number;
  sku: string;
  name: string;
  category: string;
  variant: string;
  price: number;
  branchName: string;
}

export default function AdminInventoryPage() {
  const { activeBranch, token } = useAdmin();
  
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Form states for Adjust
  const [adjustProductId, setAdjustProductId] = useState("");
  const [adjustQtyChange, setAdjustQtyChange] = useState("");
  const [adjustReason, setAdjustReason] = useState("Restock");
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);

  // Form states for Transfer
  const [transferProductId, setTransferProductId] = useState("");
  const [transferFromBranch, setTransferFromBranch] = useState("b1");
  const [transferToBranch, setTransferToBranch] = useState("b2");
  const [transferQty, setTransferQty] = useState("");
  const [transferCarrier, setTransferCarrier] = useState("Internal Dispatch");
  const [transferCost, setTransferCost] = useState("50");
  const [transferSubmitting, setTransferSubmitting] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  // Success notifications
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = activeBranch === "all" 
        ? API_BASE_URL + "/api/inventory"
        : `${API_BASE_URL}/api/inventory?branchId=${activeBranch}`;
        
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch inventory data.");
      }
      const data = await res.json();
      setInventory(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while loading inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [activeBranch]);

  // Set default product selection when modals open
  useEffect(() => {
    if (showAdjustModal && inventory.length > 0) {
      const uniqueProds = Array.from(new Set(inventory.map(i => i.productId)));
      if (uniqueProds.length > 0) {
        setAdjustProductId(uniqueProds[0]);
      }
    }
  }, [showAdjustModal, inventory]);

  useEffect(() => {
    if (showTransferModal && inventory.length > 0) {
      const uniqueProds = Array.from(new Set(inventory.map(i => i.productId)));
      if (uniqueProds.length > 0) {
        setTransferProductId(uniqueProds[0]);
      }
    }
  }, [showTransferModal, inventory]);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProductId || !adjustQtyChange || !adjustReason) {
      setAdjustError("All fields are required.");
      return;
    }

    const qty = parseInt(adjustQtyChange);
    if (isNaN(qty) || qty === 0) {
      setAdjustError("Quantity change must be a non-zero integer.");
      return;
    }

    let targetBranch = activeBranch;
    if (targetBranch === "all") {
      const matched = inventory.find(i => i.productId === adjustProductId);
      targetBranch = matched ? matched.branchId : "b1";
    }

    setAdjustSubmitting(true);
    setAdjustError(null);

    try {
      const res = await fetch(API_BASE_URL + "/api/inventory/adjust", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: adjustProductId,
          branchId: targetBranch,
          quantityChange: qty,
          reason: adjustReason
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to adjust stock.");
      }

      setSuccessMessage(`Stock adjusted successfully for ${data.name}!`);
      setShowAdjustModal(false);
      setAdjustQtyChange("");
      setAdjustReason("Restock");
      fetchInventory();
      
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setAdjustError(err.message || "Server connection error.");
    } finally {
      setAdjustSubmitting(false);
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferProductId || !transferFromBranch || !transferToBranch || !transferQty) {
      setTransferError("Please fill in all required fields.");
      return;
    }

    if (transferFromBranch === transferToBranch) {
      setTransferError("Source and destination branches must be different.");
      return;
    }

    const qty = parseInt(transferQty);
    if (isNaN(qty) || qty <= 0) {
      setTransferError("Quantity must be a positive integer.");
      return;
    }

    setTransferSubmitting(true);
    setTransferError(null);

    try {
      const res = await fetch(API_BASE_URL + "/api/inventory/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: transferProductId,
          fromBranchId: transferFromBranch,
          toBranchId: transferToBranch,
          quantity: qty,
          carrier: transferCarrier,
          cost: parseFloat(transferCost) || 0
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to transfer stock.");
      }

      setSuccessMessage("Stock transfer initiated and shipment dispatched!");
      setShowTransferModal(false);
      setTransferQty("");
      setTransferCarrier("Internal Dispatch");
      setTransferCost("50");
      fetchInventory();

      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setTransferError(err.message || "Server connection error.");
    } finally {
      setTransferSubmitting(false);
    }
  };

  const uniqueProducts = useMemo(() => {
    const prodsMap = new Map();
    inventory.forEach((i) => {
      prodsMap.set(i.productId, { id: i.productId, name: i.name, sku: i.sku });
    });
    return Array.from(prodsMap.values());
  }, [inventory]);

  return (
    <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
      {successMessage && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-emerald-950/90 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-2xl flex items-center gap-3 animate-slide-in">
          <Shield className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-luxury-border/30 pb-6">
        <div>
          <h2 className="font-serif text-3xl font-bold text-white">Inventory Management</h2>
          <p className="text-xs text-luxury-text-dark font-sans mt-1">
            Monitor and manage cellar stock levels across active retail branches.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 border border-gold-500/30 text-gold-500 hover:bg-gold-500/10 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5" /> Transfer Stock
          </button>
          <button 
            onClick={() => setShowAdjustModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gold-500 text-luxury-black hover:bg-gold-400 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Adjust Stock
          </button>
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
        ) : inventory.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-xs">
            No inventory items matching current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-400">
              <thead>
                <tr className="border-b border-luxury-border text-zinc-500 uppercase tracking-widest text-[9px] font-bold">
                  <th className="py-3 px-4">SKU Code</th>
                  <th className="py-3 px-4">Wine Name</th>
                  <th className="py-3 px-4">Branch Cellar</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Physical Stock</th>
                  <th className="py-3 px-4">Reserved Event</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((row) => {
                  const isLow = row.quantity <= row.minThreshold;
                  return (
                    <tr key={row.id} className="border-b border-luxury-border/20 hover:bg-wine-950/10 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-400">{row.sku}</td>
                      <td className="py-3.5 px-4 font-serif text-white font-semibold text-sm">
                        <div>
                          {row.name}
                          <span className="text-[10px] text-zinc-500 font-sans block mt-0.5">{row.variant}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium">{row.branchName}</td>
                      <td className="py-3.5 px-4 uppercase tracking-wider text-[10px] font-bold text-gold-500/70">{row.category}</td>
                      <td className="py-3.5 px-4 font-mono">RM {row.price.toFixed(2)}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white">{row.quantity} bottles</td>
                      <td className="py-3.5 px-4 font-mono text-zinc-500">{row.reservedQuantity} bottles</td>
                      <td className="py-3.5 px-4">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-medium text-amber-400 bg-amber-950/30 border-amber-500/25">
                            <AlertTriangle className="w-3 h-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-medium text-emerald-400 bg-emerald-950/30 border-emerald-500/25">
                            <Shield className="w-3 h-3" /> Healthy
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdjustModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel border border-luxury-border w-full max-w-md rounded-2xl p-6 relative shadow-2xl">
            <button 
              onClick={() => setShowAdjustModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-gold-500" /> Log Stock Adjustment
            </h3>

            {adjustError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {adjustError}
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  Select Product Wine
                </label>
                <select
                  value={adjustProductId}
                  onChange={(e) => setAdjustProductId(e.target.value)}
                  className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                >
                  {uniqueProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.sku}] {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  Quantity Change (bottles)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 12 to add, -3 to deduct"
                  value={adjustQtyChange}
                  onChange={(e) => setAdjustQtyChange(e.target.value)}
                  className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Positive values add to stock; negative values subtract stock for breakages/spills.
                </span>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  Reason / Audit Notes
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                >
                  <option value="Restock">Supplier Restock</option>
                  <option value="Spillage/Breakage">Spillage / Bottle Breakage</option>
                  <option value="Audit Correction">Audit Inventory Correction</option>
                  <option value="Event Allocation">Private Event Hold</option>
                  <option value="Other">Other Reason</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustSubmitting}
                  className="flex-1 py-3 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-luxury-black font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {adjustSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Apply Change"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTransferModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel border border-luxury-border w-full max-w-md rounded-2xl p-6 relative shadow-2xl">
            <button 
              onClick={() => setShowTransferModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-gold-500" /> Branch Stock Transfer
            </h3>

            {transferError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {transferError}
              </div>
            )}

            <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  Select Wine Product
                </label>
                <select
                  value={transferProductId}
                  onChange={(e) => setTransferProductId(e.target.value)}
                  className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                >
                  {uniqueProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.sku}] {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    From Branch
                  </label>
                  <select
                    value={transferFromBranch}
                    onChange={(e) => setTransferFromBranch(e.target.value)}
                    className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                  >
                    <option value="b1">KSL City Cellar</option>
                    <option value="b2">Mid Valley Cellar</option>
                    <option value="b3">Puteri Harbour Cellar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    To Branch
                  </label>
                  <select
                    value={transferToBranch}
                    onChange={(e) => setTransferToBranch(e.target.value)}
                    className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                  >
                    <option value="b1">KSL City Cellar</option>
                    <option value="b2">Mid Valley Cellar</option>
                    <option value="b3">Puteri Harbour Cellar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Transfer Qty (bottles)
                  </label>
                  <input
                    type="number"
                    value={transferQty}
                    onChange={(e) => setTransferQty(e.target.value)}
                    placeholder="e.g. 10"
                    className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Est. Cost (RM)
                  </label>
                  <input
                    type="number"
                    value={transferCost}
                    onChange={(e) => setTransferCost(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  Carrier / Transporter
                </label>
                <input
                  type="text"
                  value={transferCarrier}
                  onChange={(e) => setTransferCarrier(e.target.value)}
                  className="w-full bg-luxury-black border border-luxury-border text-white rounded-lg p-2.5 focus:border-gold-500 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferSubmitting}
                  className="flex-1 py-3 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-luxury-black font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {transferSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Initiate Transfer"
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

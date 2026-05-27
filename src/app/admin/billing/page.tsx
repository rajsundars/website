"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useAdmin } from "../../../context/AdminContext";
import { 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Trash2, 
  Loader2, 
  X, 
  Wine, 
  Coins, 
  CreditCard, 
  ArrowRightLeft, 
  Download, 
  User 
} from "lucide-react";

interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  branchId: string;
  cashierName: string;
  customerName: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  date: string;
  status: string;
  branchName: string;
}

interface ProductItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  category: string;
  variant: string;
  price: number;
  quantity: number;
  reservedQuantity: number;
}

interface CartItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  maxStock: number;
}

interface DiscountRule {
  id: string;
  code: string;
  description: string;
  type: "fixed" | "percent";
  value: number;
}

export default function AdminBillingPage() {
  const { activeBranch, token, user } = useAdmin();

  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showPos, setShowPos] = useState(false);
  const [posProducts, setPosProducts] = useState<ProductItem[]>([]);
  const [posLoading, setPosLoading] = useState(false);
  const [posSearch, setPosSearch] = useState("");
  const [posCategory, setPosCategory] = useState("all");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("Walk-in Guest");
  const [discounts, setDiscounts] = useState<DiscountRule[]>([]);
  const [selectedPromo, setSelectedPromo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [splitCash, setSplitCash] = useState("");
  const [splitCard, setSplitCard] = useState("");

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = activeBranch === "all"
        ? "http://localhost:5000/api/billing/invoices"
        : `http://localhost:5000/api/billing/invoices?branchId=${activeBranch}`;
        
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to load transactions.");
      }
      const data = await res.json();
      setInvoices(data);
    } catch (err: any) {
      setError(err.message || "An error occurred fetching invoices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [activeBranch]);

  const launchPOS = async () => {
    setShowPos(true);
    setPosLoading(true);
    setCheckoutError(null);
    setCart([]);
    setCustomerName("Walk-in Guest");
    setSelectedPromo("");
    setPaymentMethod("cash");
    setSplitCash("");
    setSplitCard("");

    try {
      const targetBranch = activeBranch === "all" ? (user?.branchId || "b1") : activeBranch;
      const invRes = await fetch(`http://localhost:5000/api/inventory?branchId=${targetBranch}`);
      if (!invRes.ok) throw new Error("Failed to load inventory stock for checkout.");
      const invData = await invRes.json();
      setPosProducts(invData);

      const promoRes = await fetch("http://localhost:5000/api/billing/discounts");
      if (promoRes.ok) {
        const promoData = await promoRes.json();
        setDiscounts(promoData);
      }
    } catch (err: any) {
      setCheckoutError(err.message || "Error starting cashier POS.");
    } finally {
      setPosLoading(false);
    }
  };

  const addToCart = (prod: ProductItem) => {
    setCheckoutError(null);
    const availableStock = prod.quantity - (prod.reservedQuantity || 0);
    if (availableStock <= 0) {
      setCheckoutError(`Cannot add ${prod.name} to cart. Item is out of stock.`);
      return;
    }

    const existingIdx = cart.findIndex(item => item.productId === prod.productId);
    if (existingIdx > -1) {
      const currentQty = cart[existingIdx].quantity;
      if (currentQty >= availableStock) {
        setCheckoutError(`Cannot add more ${prod.name}. Limit reached (available stock: ${availableStock} bottles).`);
        return;
      }
      const newCart = [...cart];
      newCart[existingIdx].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, {
        productId: prod.productId,
        name: prod.name,
        sku: prod.sku,
        price: prod.price,
        quantity: 1,
        maxStock: availableStock
      }]);
    }
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCheckoutError(null);
    const existingIdx = cart.findIndex(item => item.productId === productId);
    if (existingIdx === -1) return;

    const newCart = [...cart];
    const item = newCart[existingIdx];
    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      newCart.splice(existingIdx, 1);
    } else if (newQty > item.maxStock) {
      setCheckoutError(`Cannot add more. Limit reached (available stock: ${item.maxStock} bottles).`);
      return;
    } else {
      item.quantity = newQty;
    }
    setCart(newCart);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const subtotal = useMemo(() => {
    return cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (!selectedPromo) return 0;
    const rule = discounts.find(d => d.code === selectedPromo);
    if (!rule) return 0;
    if (rule.type === "fixed") {
      return Math.min(rule.value, subtotal);
    } else {
      return (subtotal * rule.value) / 100;
    }
  }, [selectedPromo, discounts, subtotal]);

  const taxableAmount = subtotal - discountAmount;
  const taxAmount = useMemo(() => {
    return parseFloat((taxableAmount * 0.09).toFixed(2));
  }, [taxableAmount]);

  const totalAmount = useMemo(() => {
    return parseFloat((taxableAmount + taxAmount).toFixed(2));
  }, [taxableAmount, taxAmount]);

  const downloadInvoice = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/billing/invoice/${invoiceId}/pdf`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to download PDF receipt.");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Guna_Wines_Receipt_${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download error:", err);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setCheckoutError("Your shopping cart is empty.");
      return;
    }

    if (paymentMethod === "split") {
      const cash = parseFloat(splitCash) || 0;
      const card = parseFloat(splitCard) || 0;
      if (Math.abs((cash + card) - totalAmount) > 0.01) {
        setCheckoutError(`Split totals (RM ${cash.toFixed(2)} + RM ${card.toFixed(2)}) must equal Total Payable (RM ${totalAmount.toFixed(2)}).`);
        return;
      }
    }

    setCheckoutSubmitting(true);
    setCheckoutError(null);

    try {
      const res = await fetch("http://localhost:5000/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          customerName,
          promoCode: selectedPromo || null,
          paymentMethod,
          items: cart.map(i => ({ productId: i.productId, quantity: i.quantity }))
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to process checkout transaction.");
      }

      setSuccessMessage(`Checkout completed for ${data.invoiceNumber}! Downloading receipt PDF...`);
      setShowPos(false);
      
      fetchInvoices();
      await downloadInvoice(data.id, data.invoiceNumber);

      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setCheckoutError(err.message || "Checkout server error.");
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const filteredPosProducts = useMemo(() => {
    return posProducts.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(posSearch.toLowerCase()) || p.sku.toLowerCase().includes(posSearch.toLowerCase());
      const matchesCat = posCategory === "all" || p.category === posCategory;
      return matchesSearch && matchesCat;
    });
  }, [posProducts, posSearch, posCategory]);

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
          <h2 className="font-serif text-3xl font-bold text-white">Billing & POS</h2>
          <p className="text-xs text-luxury-text-dark font-sans mt-1">
            Track cashier transactions, daily sales reports, and receipt details.
          </p>
        </div>
        <button 
          onClick={launchPOS}
          className="flex items-center gap-1.5 px-4 py-2 bg-gold-500 text-luxury-black hover:bg-gold-400 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Launch POS Checkout
        </button>
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
        ) : invoices.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-xs">
            No transaction records found matching filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-400">
              <thead>
                <tr className="border-b border-luxury-border text-zinc-500 uppercase tracking-widest text-[9px] font-bold">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Cashier</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Subtotal</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((row) => (
                  <tr key={row.id} className="border-b border-luxury-border/20 hover:bg-wine-950/10 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{row.invoiceNumber}</td>
                    <td className="py-3.5 px-4 font-semibold">{row.branchName}</td>
                    <td className="py-3.5 px-4">{row.cashierName}</td>
                    <td className="py-3.5 px-4">{row.customerName}</td>
                    <td className="py-3.5 px-4 font-mono">RM {row.subtotal.toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-mono text-rose-400">-RM {row.discountAmount.toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">RM {row.totalAmount.toFixed(2)}</td>
                    <td className="py-3.5 px-4 uppercase tracking-wider text-[10px] font-semibold text-gold-500/80">{row.paymentMethod}</td>
                    <td className="py-3.5 px-4">
                      {row.status === "paid" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-medium text-emerald-400 bg-emerald-950/30 border-emerald-500/25">
                          <CheckCircle2 className="w-3 h-3" /> Settled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-medium text-rose-400 bg-rose-950/30 border-rose-500/25">
                          Refunded
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => downloadInvoice(row.id, row.invoiceNumber)}
                        className="p-1.5 hover:bg-wine-950/40 rounded border border-luxury-border text-gold-500 hover:text-gold-400 transition-colors cursor-pointer"
                        title="Download Receipt PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showPos && (
        <div className="fixed inset-0 bg-luxury-black z-50 flex flex-col font-sans animate-fade-in">
          <header className="h-16 bg-luxury-dark border-b border-luxury-border px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-wine-800 border border-gold-500/30 flex items-center justify-center">
                <Wine className="w-5 h-5 text-gold-500" />
              </div>
              <div>
                <h1 className="font-serif text-sm font-bold text-white tracking-wider">CASHIER POS TERMINAL</h1>
                <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest leading-none mt-0.5">
                  Branch: {activeBranch === "all" ? `${user?.branchId === "b2" ? "Mid Valley" : "KSL City"} (Default)` : activeBranch === "b1" ? "KSL City" : activeBranch === "b2" ? "Mid Valley" : "Puteri Harbour"} Cellar
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowPos(false)}
              className="p-2 hover:bg-wine-950/30 border border-luxury-border text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          <div className="flex-1 flex min-h-0">
            <div className="flex-1 flex flex-col p-6 min-w-0 border-r border-luxury-border bg-luxury-black/30">
              <div className="flex flex-col sm:flex-row gap-4 mb-6 shrink-0">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-3 text-zinc-500"><Search className="w-4 h-4" /></span>
                  <input
                    type="text"
                    value={posSearch}
                    onChange={(e) => setPosSearch(e.target.value)}
                    placeholder="Search by SKU, product name..."
                    className="w-full pl-10 pr-4 py-2.5 bg-luxury-dark/60 border border-luxury-border rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {["all", "red", "white", "sparkling", "rose"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setPosCategory(cat)}
                      className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer shrink-0 ${
                        posCategory === cat
                          ? "bg-gold-500 text-luxury-black border-gold-500"
                          : "border-luxury-border text-zinc-400 hover:text-white hover:border-zinc-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0">
                {posLoading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                  </div>
                ) : filteredPosProducts.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs italic">
                    No products matching search criteria.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPosProducts.map((p) => {
                      const avail = p.quantity - (p.reservedQuantity || 0);
                      const isOutOfStock = avail <= 0;
                      return (
                        <div
                          key={p.id}
                          onClick={() => !isOutOfStock && addToCart(p)}
                          className={`glass-panel border p-4 rounded-xl flex flex-col justify-between transition-all duration-200 ${
                            isOutOfStock 
                              ? "opacity-50 border-rose-500/20 cursor-not-allowed" 
                              : "hover:border-gold-500/40 border-luxury-border hover:bg-wine-950/5 cursor-pointer"
                          }`}
                        >
                          <div>
                            <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">{p.sku}</span>
                            <h4 className="font-serif text-sm font-bold text-white mt-1 line-clamp-1">{p.name}</h4>
                            <p className="text-[10px] text-zinc-400 font-sans mt-0.5 line-clamp-1">{p.variant}</p>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-gold-500 font-mono font-bold">RM {p.price.toFixed(2)}</span>
                            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded ${
                              isOutOfStock 
                                ? "bg-rose-950/40 text-rose-400 border border-rose-500/20" 
                                : avail <= 5 
                                  ? "bg-amber-950/40 text-amber-400 border border-amber-500/20" 
                                  : "bg-zinc-900 text-zinc-400"
                            }`}>
                              {isOutOfStock ? "Out of Stock" : `${avail} left`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="w-96 flex flex-col p-6 bg-luxury-dark shrink-0 overflow-y-auto">
              <h3 className="font-serif text-base font-bold text-white mb-4">Checkout Cart</h3>

              {checkoutError && (
                <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 animate-shake">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{checkoutError}</span>
                </div>
              )}

              <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-1">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-zinc-500 text-xs italic flex flex-col items-center gap-2">
                    <Wine className="w-8 h-8 text-zinc-600" />
                    <span>Shopping cart is empty.<br/>Select wine cards to add.</span>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.productId} className="glass-panel border border-luxury-border/50 p-3 rounded-xl flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h5 className="text-xs font-serif font-bold text-white truncate">{item.name}</h5>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">RM {item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center bg-luxury-black border border-luxury-border rounded-lg">
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.productId, -1)}
                            className="px-2 py-1 text-zinc-400 hover:text-white text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="px-1 text-xs font-mono font-bold text-white text-center min-w-[20px]">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.productId, 1)}
                            className="px-2 py-1 text-zinc-400 hover:text-white text-xs font-bold"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                          className="p-1.5 hover:bg-rose-950/30 text-rose-400 hover:text-rose-300 rounded border border-transparent transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleCheckoutSubmit} className="mt-6 pt-4 border-t border-luxury-border/60 space-y-4 shrink-0 text-xs">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">
                    Customer Details
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-zinc-600"><User className="w-3.5 h-3.5" /></span>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Guest Customer"
                      className="w-full pl-9 pr-3 py-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">
                    Coupon / Discount Code
                  </label>
                  <select
                    value={selectedPromo}
                    onChange={(e) => setSelectedPromo(e.target.value)}
                    className="w-full bg-luxury-black border border-luxury-border text-zinc-300 rounded-lg p-2 focus:border-gold-500 focus:outline-none"
                  >
                    <option value="">None (No promo code)</option>
                    {discounts.map((d) => (
                      <option key={d.id} value={d.code}>
                        {d.code} ({d.description})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold mb-1.5 uppercase tracking-wider text-[9px]">
                    Payment Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cash")}
                      className={`py-2 px-3 border rounded-lg flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider text-[9px] transition-all cursor-pointer ${
                        paymentMethod === "cash"
                          ? "bg-wine-900/60 border-gold-500 text-gold-500"
                          : "border-luxury-border text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" /> Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`py-2 px-3 border rounded-lg flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider text-[9px] transition-all cursor-pointer ${
                        paymentMethod === "card"
                          ? "bg-wine-900/60 border-gold-500 text-gold-500"
                          : "border-luxury-border text-zinc-400 hover:text-white"
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("digital")}
                      className={`py-2 px-3 border rounded-lg flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider text-[9px] transition-all cursor-pointer ${
                        paymentMethod === "digital"
                          ? "bg-wine-900/60 border-gold-500 text-gold-500"
                          : "border-luxury-border text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Wine className="w-3.5 h-3.5" /> Transfer
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("split")}
                      className={`py-2 px-3 border rounded-lg flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider text-[9px] transition-all cursor-pointer ${
                        paymentMethod === "split"
                          ? "bg-wine-900/60 border-gold-500 text-gold-500"
                          : "border-luxury-border text-zinc-400 hover:text-white"
                      }`}
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" /> Split
                    </button>
                  </div>
                </div>

                {paymentMethod === "split" && (
                  <div className="grid grid-cols-2 gap-4 p-2.5 rounded-lg bg-luxury-black border border-luxury-border/60">
                    <div>
                      <label className="block text-[8px] text-zinc-500 font-bold uppercase mb-1">Cash Amount</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={splitCash}
                        onChange={(e) => setSplitCash(e.target.value)}
                        className="w-full bg-luxury-dark border border-luxury-border text-white text-xs rounded p-1.5 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] text-zinc-500 font-bold uppercase mb-1">Card Amount</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={splitCard}
                        onChange={(e) => setSplitCard(e.target.value)}
                        className="w-full bg-luxury-dark border border-luxury-border text-white text-xs rounded p-1.5 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 py-3 border-t border-b border-luxury-border/60 text-xs">
                  <div className="flex justify-between text-zinc-500">
                    <span>Subtotal</span>
                    <span className="font-mono">RM {subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-rose-400">
                      <span>Promo Discount</span>
                      <span className="font-mono">-RM {discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-500">
                    <span>SST Tax (9%)</span>
                    <span className="font-mono">RM {taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-serif font-bold text-white pt-1">
                    <span>Total Payable</span>
                    <span className="font-mono text-gold-500">RM {totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={checkoutSubmitting || cart.length === 0}
                  className="w-full py-3 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-luxury-black font-bold uppercase tracking-wider text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  {checkoutSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Authorize POS Checkout"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

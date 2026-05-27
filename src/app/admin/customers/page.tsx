"use client";
import { API_BASE_URL } from "@/config";


import React, { useMemo, useState, useEffect } from "react";
import { useAdmin } from "../../../context/AdminContext";
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  MessageSquare, 
  Phone, 
  Award, 
  Trash2, 
  Edit, 
  Loader2, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Bell, 
  Clock, 
  Send
} from "lucide-react";

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  loyalty_points: number;
  segment_tags: string;
  registration_date: string;
}

interface NotificationLog {
  id: string;
  customer_id: string;
  channel: string;
  message: string;
  status: string;
  timestamp: string;
}

const templates = [
  {
    label: "VIP Invitation (Grand Cru Tasting)",
    channel: "email",
    text: "Dear [Name],\n\nWe are pleased to invite you to our exclusive Grand Cru Wine Tasting Session at our KSL Cellar on the 15th of next month.\n\nReserve your seat today!\n\nBest regards,\nGuna Wines"
  },
  {
    label: "Loyalty Voucher Reward",
    channel: "sms",
    text: "Guna Wines: Dear [Name], thank you for your loyal support! A voucher of RM50 has been credited to your profile. Use Code: LOYAL50 during checkout."
  },
  {
    label: "New Restock Alert (Margaux / Penfolds)",
    channel: "whatsapp",
    text: "Hi [Name]! Great news from Guna Wines. We have just restocked our premium Château Margaux and Penfolds Bin 389 vintages. Reserve yours via WhatsApp today!"
  }
];

export default function AdminCustomersPage() {
  const { token, user } = useAdmin();

  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // CRUD modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCust, setEditingCust] = useState<CustomerRow | null>(null);

  // Form states
  const [custName, setCustName] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [custPoints, setCustPoints] = useState("0");
  const [custSegment, setCustSegment] = useState("new");
  const [crudSubmitting, setCrudSubmitting] = useState(false);
  const [crudError, setCrudError] = useState<string | null>(null);

  // Notification Modals
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [selectedCust, setSelectedCust] = useState<CustomerRow | null>(null);
  const [notifyChannel, setNotifyChannel] = useState("email");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifySubmitting, setNotifySubmitting] = useState(false);
  const [notifyError, setNotifyError] = useState<string | null>(null);
  const [notifySuccess, setNotifySuccess] = useState(false);

  // Notification Log History Drawer
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);
  const [logsList, setLogsList] = useState<NotificationLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const fetchCustomers = async (search = "") => {
    setLoading(true);
    setError(null);
    try {
      const url = search 
        ? `${API_BASE_URL}/api/customers?q=${encodeURIComponent(search)}`
        : API_BASE_URL + "/api/customers";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to retrieve customers directory.");
      const data = await res.json();
      setCustomers(data);
    } catch (err: any) {
      setError(err.message || "Error fetching customer directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(searchQuery);
  }, [searchQuery]);

  const handleOpenEdit = (c: CustomerRow) => {
    setEditingCust(c);
    setCustName(c.name);
    setCustEmail(c.email);
    setCustPhone(c.phone);
    setCustAddress(c.address || "");
    setCustPoints(String(c.loyalty_points));
    setCustSegment(c.segment_tags);
    setCrudError(null);
    setShowEditModal(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCrudSubmitting(true);
    setCrudError(null);

    try {
      const res = await fetch(API_BASE_URL + "/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: custName,
          email: custEmail,
          phone: custPhone,
          address: custAddress,
          loyaltyPoints: parseInt(custPoints) || 0,
          segmentTags: custSegment
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create customer.");

      setShowAddModal(false);
      resetForm();
      fetchCustomers();
    } catch (err: any) {
      setCrudError(err.message || "Error creating customer.");
    } finally {
      setCrudSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCust) return;
    setCrudSubmitting(true);
    setCrudError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/customers/${editingCust.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: custName,
          email: custEmail,
          phone: custPhone,
          address: custAddress,
          loyaltyPoints: parseInt(custPoints) || 0,
          segmentTags: custSegment
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update customer.");

      setShowEditModal(false);
      setEditingCust(null);
      resetForm();
      fetchCustomers();
    } catch (err: any) {
      setCrudError(err.message || "Error updating customer.");
    } finally {
      setCrudSubmitting(false);
    }
  };

  const handleDeleteCust = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer record?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/customers/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchCustomers();
      } else {
        const data = await res.json();
        alert(data.message || "Could not delete customer.");
      }
    } catch (err) {
      console.error("Error deleting customer:", err);
    }
  };

  const resetForm = () => {
    setCustName("");
    setCustEmail("");
    setCustPhone("");
    setCustAddress("");
    setCustPoints("0");
    setCustSegment("new");
  };

  const handleOpenNotify = (c: CustomerRow) => {
    setSelectedCust(c);
    setNotifyChannel("email");
    setNotifyMessage(`Dear ${c.name},\n\n`);
    setNotifyError(null);
    setNotifySuccess(false);
    setShowNotifyModal(true);
  };

  const applyTemplate = (text: string, channel: string) => {
    if (!selectedCust) return;
    const replaced = text.replace(/\[Name\]/g, selectedCust.name);
    setNotifyMessage(replaced);
    setNotifyChannel(channel);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCust) return;
    setNotifySubmitting(true);
    setNotifyError(null);
    setNotifySuccess(false);

    try {
      const res = await fetch(`${API_BASE_URL}/api/customers/${selectedCust.id}/notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          channel: notifyChannel,
          message: notifyMessage
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to dispatch message.");

      setNotifySuccess(true);
      setTimeout(() => {
        setShowNotifyModal(false);
        setSelectedCust(null);
      }, 1500);
    } catch (err: any) {
      setNotifyError(err.message || "Error sending message.");
    } finally {
      setNotifySubmitting(false);
    }
  };

  const handleViewLogs = async (c: CustomerRow) => {
    setSelectedCust(c);
    setShowLogsDrawer(true);
    setLogsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/customers/${c.id}/notifications`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLogsList(data);
      }
    } catch (err) {
      console.error("Error retrieving logs:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  // KPI calculations
  const stats = useMemo(() => {
    const total = customers.length;
    const vip = customers.filter(c => c.loyalty_points >= 1000).length;
    const frequent = customers.filter(c => c.loyalty_points >= 300 && c.loyalty_points < 1000).length;
    const dormant = customers.filter(c => c.segment_tags === "dormant").length;
    return { total, vip, frequent, dormant };
  }, [customers]);

  return (
    <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto font-sans">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-luxury-border/30 pb-6">
        <div>
          <h2 className="font-serif text-3xl font-bold text-white">Customer CRM Directory</h2>
          <p className="text-xs text-luxury-text-dark mt-1">
            Maintain client directories, review loyalty points tiers, classify customer segment tags, and send templated Email/SMS/WhatsApp notifications.
          </p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gold-500 text-luxury-black hover:bg-gold-400 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Customer
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-5 border border-luxury-border rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Total Directory</p>
            <h3 className="font-mono text-2xl font-bold text-white mt-2">{stats.total}</h3>
          </div>
          <span className="p-3 bg-wine-900/30 border border-gold-500/10 text-gold-500 rounded-xl">
            <Users className="w-5 h-5" />
          </span>
        </div>

        <div className="glass-panel p-5 border border-luxury-border rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">VIP Members</p>
            <h3 className="font-mono text-2xl font-bold text-emerald-400 mt-2">{stats.vip}</h3>
          </div>
          <span className="p-3 bg-emerald-950/20 border border-emerald-500/10 text-emerald-400 rounded-xl">
            <Award className="w-5 h-5" />
          </span>
        </div>

        <div className="glass-panel p-5 border border-luxury-border rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Frequent Buyers</p>
            <h3 className="font-mono text-2xl font-bold text-sky-400 mt-2">{stats.frequent}</h3>
          </div>
          <span className="p-3 bg-sky-950/20 border border-sky-500/10 text-sky-400 rounded-xl">
            <Award className="w-5 h-5" />
          </span>
        </div>

        <div className="glass-panel p-5 border border-luxury-border rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Dormant Clients</p>
            <h3 className="font-mono text-2xl font-bold text-amber-500 mt-2">{stats.dormant}</h3>
          </div>
          <span className="p-3 bg-amber-950/20 border border-amber-500/10 text-amber-500 rounded-xl">
            <Clock className="w-5 h-5" />
          </span>
        </div>
      </div>

      {/* Main Panel Search & Table */}
      <div className="glass-panel rounded-2xl p-6 border border-luxury-border space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute left-3 top-2.5 text-zinc-500"><Search className="w-4 h-4" /></span>
            <input 
              type="text" 
              placeholder="Search by name, email, phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-luxury-black/50 border border-luxury-border rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-gold-500 w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
            <p className="text-xs text-luxury-text-dark uppercase tracking-widest font-semibold">Retrieving CRM database...</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center text-rose-400 text-xs">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-400">
              <thead>
                <tr className="border-b border-luxury-border text-zinc-500 uppercase tracking-widest text-[9px] font-bold">
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Home Address</th>
                  <th className="py-3 px-4">Loyalty Balance</th>
                  <th className="py-3 px-4">Segment Tier</th>
                  <th className="py-3 px-4">Reg Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-luxury-border/20 hover:bg-wine-950/10 transition-colors">
                    <td className="py-3.5 px-4 font-serif text-white font-semibold text-sm">{c.name}</td>
                    <td className="py-3.5 px-4 font-mono font-medium">
                      <p>{c.email}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{c.phone}</p>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-zinc-300" title={c.address}>{c.address || "None"}</td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <Award className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                        <span>{c.loyalty_points} pts</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${
                        c.segment_tags === "vip" 
                          ? "text-emerald-400 bg-emerald-950/30 border-emerald-500/25"
                          : c.segment_tags === "frequent"
                          ? "text-sky-400 bg-sky-950/30 border-sky-500/25"
                          : c.segment_tags === "dormant"
                          ? "text-amber-500 bg-amber-950/20 border-amber-500/25"
                          : "text-zinc-400 bg-zinc-950/30 border-zinc-500/25"
                      }`}>
                        {c.segment_tags === "vip" ? "VIP" : c.segment_tags}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">{c.registration_date}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleViewLogs(c)}
                          className="p-1.5 hover:text-gold-500 text-zinc-500 hover:bg-wine-900/20 border border-transparent hover:border-gold-500/10 rounded-lg transition-all cursor-pointer"
                          title="Message Logs History"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenNotify(c)}
                          className="px-2.5 py-1.5 bg-wine-900/30 border border-gold-500/20 hover:border-gold-500 text-gold-500 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Notify
                        </button>
                        <button 
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 hover:text-white text-zinc-500 rounded transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCust(c.id)}
                          className="p-1.5 hover:text-rose-400 text-zinc-500 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 1. Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-luxury-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel border border-luxury-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-fade-in text-left">
            <div className="flex justify-between items-center p-6 border-b border-luxury-border/30 bg-luxury-black/40">
              <h3 className="font-serif text-lg font-bold text-white">Register New Customer</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-zinc-500 hover:text-white hover:bg-wine-900/20 border border-transparent hover:border-luxury-border rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="E.g. Robert Parker"
                  className="w-full px-3 py-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  placeholder="E.g. robert@parker.com"
                  className="w-full px-3 py-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  required
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  placeholder="E.g. +60 11-222 3333"
                  className="w-full px-3 py-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5">Home / Delivery Address</label>
                <textarea
                  rows={2}
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  placeholder="Street details..."
                  className="w-full px-3 py-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5">Starting Points</label>
                  <input
                    type="number"
                    min="0"
                    value={custPoints}
                    onChange={(e) => setCustPoints(e.target.value)}
                    className="w-full px-3 py-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5">Status Tier</label>
                  <select
                    value={custSegment}
                    onChange={(e) => setCustSegment(e.target.value)}
                    className="w-full px-3 py-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500"
                  >
                    <option value="new">New / Active</option>
                    <option value="dormant">Dormant</option>
                  </select>
                </div>
              </div>

              {crudError && (
                <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {crudError}
                </p>
              )}

              <div className="border-t border-luxury-border/30 pt-4 flex justify-end gap-2.5">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-luxury-border hover:bg-wine-900/20 text-zinc-400 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={crudSubmitting} className="flex items-center gap-1 px-4 py-2 bg-gold-500 text-luxury-black hover:bg-gold-400 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer">
                  {crudSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Customer Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-luxury-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel border border-luxury-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-fade-in text-left">
            <div className="flex justify-between items-center p-6 border-b border-luxury-border/30 bg-luxury-black/40">
              <h3 className="font-serif text-lg font-bold text-white">Edit Customer Profile</h3>
              <button onClick={() => {
                setShowEditModal(false);
                setEditingCust(null);
              }} className="p-1 text-zinc-500 hover:text-white hover:bg-wine-900/20 border border-transparent hover:border-luxury-border rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full px-3 py-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  required
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5">Home / Delivery Address</label>
                <textarea
                  rows={2}
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5">Loyalty Points</label>
                  <input
                    type="number"
                    min="0"
                    value={custPoints}
                    onChange={(e) => setCustPoints(e.target.value)}
                    className="w-full px-3 py-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5">Status Tier</label>
                  <select
                    value={custSegment}
                    onChange={(e) => setCustSegment(e.target.value)}
                    className="w-full px-3 py-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500"
                  >
                    <option value="new">New</option>
                    <option value="frequent">Frequent</option>
                    <option value="vip">VIP</option>
                    <option value="dormant">Dormant</option>
                  </select>
                </div>
              </div>

              {crudError && (
                <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {crudError}
                </p>
              )}

              <div className="border-t border-luxury-border/30 pt-4 flex justify-end gap-2.5">
                <button type="button" onClick={() => {
                  setShowEditModal(false);
                  setEditingCust(null);
                }} className="px-4 py-2 border border-luxury-border hover:bg-wine-900/20 text-zinc-400 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={crudSubmitting} className="flex items-center gap-1 px-4 py-2 bg-gold-500 text-luxury-black hover:bg-gold-400 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer">
                  {crudSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Send Notification Modal */}
      {showNotifyModal && selectedCust && (
        <div className="fixed inset-0 bg-luxury-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel border border-luxury-border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col animate-fade-in text-left">
            <div className="flex justify-between items-center p-6 border-b border-luxury-border/30 bg-luxury-black/40">
              <div>
                <span className="text-[10px] text-gold-500 font-bold uppercase tracking-widest font-mono">
                  Dispatch Broadcast Gateway
                </span>
                <h3 className="font-serif text-lg font-bold text-white mt-1">
                  Send Notification to {selectedCust.name}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setShowNotifyModal(false);
                  setSelectedCust(null);
                }} 
                className="p-1 text-zinc-500 hover:text-white hover:bg-wine-900/20 border border-transparent hover:border-luxury-border rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {notifySuccess ? (
              <div className="p-12 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="font-serif text-lg font-bold text-white">Notification Logged</h4>
                <p className="text-xs text-luxury-text-dark">Dispatch statement printed to backend debug console.</p>
              </div>
            ) : (
              <form onSubmit={handleSendNotification} className="p-6 space-y-4">
                {/* Template triggers */}
                <div className="space-y-2">
                  <label className="block text-[9px] font-bold uppercase text-zinc-500">Insert Template Short-cuts</label>
                  <div className="flex flex-wrap gap-2">
                    {templates.map((t, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => applyTemplate(t.text, t.channel)}
                        className="px-2.5 py-1.5 bg-wine-900/30 border border-gold-500/10 hover:border-gold-500 text-gold-500 rounded-lg text-[9px] font-semibold transition-colors cursor-pointer"
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5">Dispatch Channel</label>
                    <select
                      value={notifyChannel}
                      onChange={(e) => setNotifyChannel(e.target.value)}
                      className="w-full px-3 py-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500"
                    >
                      <option value="email">Email Address</option>
                      <option value="sms">SMS Number</option>
                      <option value="whatsapp">WhatsApp API</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5">Recipient Target Address</label>
                    <input
                      type="text"
                      disabled
                      value={notifyChannel === "email" ? selectedCust.email : selectedCust.phone}
                      className="w-full px-3 py-2 bg-luxury-black border border-luxury-border/30 rounded-lg text-xs text-zinc-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5">Notification Message Body</label>
                  <textarea
                    rows={6}
                    required
                    value={notifyMessage}
                    onChange={(e) => setNotifyMessage(e.target.value)}
                    placeholder="Type message body here..."
                    className="w-full px-3 py-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-gold-500 resize-none font-sans"
                  />
                </div>

                {notifyError && (
                  <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {notifyError}
                  </p>
                )}

                <div className="border-t border-luxury-border/30 pt-4 flex justify-end gap-2.5">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowNotifyModal(false);
                      setSelectedCust(null);
                    }} 
                    className="px-4 py-2 border border-luxury-border hover:bg-wine-900/20 text-zinc-400 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={notifySubmitting} 
                    className="flex items-center gap-1.5 px-4 py-2 bg-gold-500 text-luxury-black hover:bg-gold-400 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    {notifySubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Dispatch Alert
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 4. Logs History Drawer (Right sidebar slide-in drawer) */}
      {showLogsDrawer && selectedCust && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay background */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
            onClick={() => {
              setShowLogsDrawer(false);
              setSelectedCust(null);
            }}
          />

          <div className="relative w-full max-w-md bg-luxury-dark/95 border-l border-luxury-border p-6 flex flex-col h-full shadow-2xl animate-slide-in text-left">
            <div className="flex justify-between items-center border-b border-luxury-border/30 pb-4 mb-6">
              <div>
                <span className="text-[10px] text-gold-500 font-bold uppercase tracking-widest font-mono">
                  Historical Records
                </span>
                <h3 className="font-serif text-lg font-bold text-white mt-1">
                  Message Log: {selectedCust.name}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setShowLogsDrawer(false);
                  setSelectedCust(null);
                }} 
                className="p-1 text-zinc-500 hover:text-white hover:bg-wine-900/20 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List logs */}
            {logsLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                <p className="text-xs text-luxury-text-dark uppercase tracking-widest font-semibold">Scanning broadcast registers...</p>
              </div>
            ) : logsList.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-zinc-600 text-xs text-center font-sans">
                No notification history found for this client.
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-none">
                {logsList.map(log => (
                  <div key={log.id} className="p-4 bg-luxury-black/50 border border-luxury-border/40 rounded-xl space-y-2.5 text-xs text-left">
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border ${
                        log.channel === "email"
                          ? "text-sky-400 bg-sky-950/30 border-sky-500/20"
                          : log.channel === "whatsapp"
                          ? "text-emerald-400 bg-emerald-950/30 border-emerald-500/20"
                          : "text-purple-400 bg-purple-950/30 border-purple-500/20"
                      }`}>
                        {log.channel}
                      </span>
                      <span className="font-mono text-[9px] text-zinc-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed font-sans">{log.message}</p>
                    <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase text-emerald-400 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{log.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

"use client";
import { API_BASE_URL } from "@/config";


import React, { useMemo, useState, useEffect } from "react";
import { useAdmin } from "../../../context/AdminContext";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Users, 
  Sparkles, 
  Check, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Download, 
  Clock, 
  ShieldAlert, 
  X,
  PlusCircle,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface EventRow {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  date: string;
  event_type: string;
  guest_count: number;
  budget: number;
  status: string;
  notes: string;
  branch_id: string;
  branchName?: string;
}

interface ReservedWine {
  id: string;
  event_id: string;
  product_id: string;
  quantity: number;
  productName: string;
  productPrice: number;
  productVariant: string;
  productSku: string;
}

interface AssignedStaff {
  userId: string;
  userName: string;
  userRole: string;
  userContact: string;
}

interface InventoryProduct {
  productId: string;
  productName: string;
  productVariant: string;
  productPrice: number;
  quantity: number;
  reserved_quantity: number;
}

interface Employee {
  id: string;
  name: string;
  role: string;
}

const eventTypeMinBudgets: Record<string, number> = {
  corporate: 5000,
  wedding: 8000,
  private_tasting: 15000,
  birthday: 2000
};

export default function AdminEventsPage() {
  const { activeBranch, token } = useAdmin();

  const [viewMode, setViewMode] = useState<"ledger" | "calendar">("ledger");
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected event details modal
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventDetails, setEventDetails] = useState<(EventRow & { reservedWines: ReservedWine[]; staffAssigned: AssignedStaff[] }) | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Modals status
  const [showManageModal, setShowManageModal] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);

  // Form states for wine pairing allocation
  const [inventory, setInventory] = useState<InventoryProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [reserveQty, setReserveQty] = useState("5");
  const [wineSubmitting, setWineSubmitting] = useState(false);
  const [wineError, setWineError] = useState<string | null>(null);

  // Form states for staff assignment
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [staffSubmitting, setStaffSubmitting] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);

  // Status transition state
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Public enquiry form states (to submit new bookings directly from admin panel)
  const [enqName, setEnqName] = useState("");
  const [enqEmail, setEnqEmail] = useState("");
  const [enqPhone, setEnqPhone] = useState("");
  const [enqDate, setEnqDate] = useState("");
  const [enqType, setEnqType] = useState("corporate");
  const [enqGuests, setEnqGuests] = useState("30");
  const [enqBudget, setEnqBudget] = useState("5000");
  const [enqNotes, setEnqNotes] = useState("");
  const [enqSubmitting, setEnqSubmitting] = useState(false);
  const [enqError, setEnqError] = useState<string | null>(null);

  // Calendar states
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 27)); // Seeded centered around May 2026

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = activeBranch === "all"
        ? API_BASE_URL + "/api/events"
        : `${API_BASE_URL}/api/events?branchId=${activeBranch}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load events.");
      const data = await res.json();
      setEvents(data);
    } catch (err: any) {
      setError(err.message || "Error loading events.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      // Fetch catalog products and their branch stocks
      const branchId = eventDetails?.branch_id || activeBranch || "b1";
      const res = await fetch(`${API_BASE_URL}/api/inventory?branchId=${branchId === "all" ? "b1" : branchId}`);
      if (res.ok) {
        const data = await res.json();
        // Mapped structure
        const mapped = data.map((item: any) => ({
          productId: item.productId,
          productName: item.productName,
          productVariant: item.productVariant,
          productPrice: item.price,
          quantity: item.quantity,
          reserved_quantity: item.reserved_quantity || 0
        }));
        setInventory(mapped);
        if (mapped.length > 0) setSelectedProduct(mapped[0].productId);
      }
    } catch (err) {
      console.error("Error loading inventory catalog:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch(API_BASE_URL + "/api/employees");
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
        if (data.length > 0) setSelectedEmployee(data[0].id);
      }
    } catch (err) {
      console.error("Error loading staff list:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [activeBranch]);

  const handleOpenManage = async (eventId: string) => {
    setSelectedEventId(eventId);
    setDetailsLoading(true);
    setDetailsError(null);
    setWineError(null);
    setStaffError(null);
    setStatusError(null);
    setShowManageModal(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${eventId}/details`);
      if (!res.ok) throw new Error("Failed to load event details.");
      const data = await res.json();
      setEventDetails(data);
    } catch (err: any) {
      setDetailsError(err.message || "Error retrieving details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    if (showManageModal && selectedEventId) {
      fetchInventory();
      fetchEmployees();
    }
  }, [showManageModal, selectedEventId, eventDetails?.branch_id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedEventId || !eventDetails) return;
    setStatusSubmitting(true);
    setStatusError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${selectedEventId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status.");

      // Refresh details
      setEventDetails((prev: any) => prev ? { ...prev, status: newStatus } : null);
      fetchEvents();
    } catch (err: any) {
      setStatusError(err.message || "Error updating event status.");
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleReserveWine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !eventDetails || !selectedProduct) return;
    setWineSubmitting(true);
    setWineError(null);

    const qty = parseInt(reserveQty);
    if (isNaN(qty) || qty <= 0) {
      setWineError("Quantity must be a positive integer.");
      setWineSubmitting(false);
      return;
    }

    try {
      // Build updated list
      const existing = eventDetails.reservedWines.find(w => w.product_id === selectedProduct);
      let updatedWines = [];

      if (existing) {
        updatedWines = eventDetails.reservedWines.map(w => 
          w.product_id === selectedProduct ? { productId: w.product_id, quantity: qty } : { productId: w.product_id, quantity: w.quantity }
        );
      } else {
        updatedWines = [
          ...eventDetails.reservedWines.map(w => ({ productId: w.product_id, quantity: w.quantity })),
          { productId: selectedProduct, quantity: qty }
        ];
      }

      const res = await fetch(`${API_BASE_URL}/api/events/${selectedEventId}/wines`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ wines: updatedWines })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reserve wines.");

      // Re-fetch details to sync lists and inventories
      const detailsRes = await fetch(`${API_BASE_URL}/api/events/${selectedEventId}/details`);
      const updatedDetails = await detailsRes.json();
      setEventDetails(updatedDetails);
      fetchInventory();
    } catch (err: any) {
      setWineError(err.message || "Error updating wine reservations.");
    } finally {
      setWineSubmitting(false);
    }
  };

  const handleDeleteWine = async (prodId: string) => {
    if (!selectedEventId || !eventDetails) return;
    setWineSubmitting(true);
    setWineError(null);

    try {
      const updatedWines = eventDetails.reservedWines
        .filter(w => w.product_id !== prodId)
        .map(w => ({ productId: w.product_id, quantity: w.quantity }));

      const res = await fetch(`${API_BASE_URL}/api/events/${selectedEventId}/wines`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ wines: updatedWines })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update wine reservations.");

      // Re-fetch details
      const detailsRes = await fetch(`${API_BASE_URL}/api/events/${selectedEventId}/details`);
      const updatedDetails = await detailsRes.json();
      setEventDetails(updatedDetails);
      fetchInventory();
    } catch (err: any) {
      setWineError(err.message || "Error updating wine reservations.");
    } finally {
      setWineSubmitting(false);
    }
  };

  const handleAssignStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !eventDetails || !selectedEmployee) return;
    setStaffSubmitting(true);
    setStaffError(null);

    try {
      const alreadyAssigned = eventDetails.staffAssigned.some(s => s.userId === selectedEmployee);
      if (alreadyAssigned) {
        setStaffError("Employee is already assigned to this event.");
        setStaffSubmitting(false);
        return;
      }

      const updatedStaff = [
        ...eventDetails.staffAssigned.map(s => s.userId),
        selectedEmployee
      ];

      const res = await fetch(`${API_BASE_URL}/api/events/${selectedEventId}/staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ staffIds: updatedStaff })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to assign staff.");

      // Re-fetch details
      const detailsRes = await fetch(`${API_BASE_URL}/api/events/${selectedEventId}/details`);
      const updatedDetails = await detailsRes.json();
      setEventDetails(updatedDetails);
    } catch (err: any) {
      setStaffError(err.message || "Error assigning staff.");
    } finally {
      setStaffSubmitting(false);
    }
  };

  const handleUnassignStaff = async (staffId: string) => {
    if (!selectedEventId || !eventDetails) return;
    setStaffSubmitting(true);
    setStaffError(null);

    try {
      const updatedStaff = eventDetails.staffAssigned
        .filter(s => s.userId !== staffId)
        .map(s => s.userId);

      const res = await fetch(`${API_BASE_URL}/api/events/${selectedEventId}/staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ staffIds: updatedStaff })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to unassign staff.");

      // Re-fetch details
      const detailsRes = await fetch(`${API_BASE_URL}/api/events/${selectedEventId}/details`);
      const updatedDetails = await detailsRes.json();
      setEventDetails(updatedDetails);
    } catch (err: any) {
      setStaffError(err.message || "Error unassigning staff.");
    } finally {
      setStaffSubmitting(false);
    }
  };

  const handleDownloadQuotation = async (eventId: string, clientName: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${eventId}/quotation/pdf`);
      if (!res.ok) throw new Error("Could not stream quotation PDF.");
      const blob = await res.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.setAttribute("download", `Event_Quotation_${clientName.replace(/\s+/g, "_")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Failed to stream quotation PDF. Please check backend connection.");
    }
  };

  const handleCreateEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnqSubmitting(true);
    setEnqError(null);

    const minReq = eventTypeMinBudgets[enqType] || 0;
    const proposed = parseFloat(enqBudget) || 0;
    if (proposed < minReq) {
      setEnqError(`Proposed budget is too low for the selected event type. Minimum required is RM ${minReq.toLocaleString()}.`);
      setEnqSubmitting(false);
      return;
    }

    try {
      const res = await fetch(API_BASE_URL + "/api/events/enquire", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: enqName,
          email: enqEmail,
          phone: enqPhone,
          date: enqDate,
          eventType: enqType,
          guestCount: parseInt(enqGuests) || 0,
          budget: proposed,
          notes: enqNotes,
          branchId: activeBranch === "all" ? "b1" : activeBranch
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit enquiry.");

      setShowEnquiryModal(false);
      // Reset form
      setEnqName("");
      setEnqEmail("");
      setEnqPhone("");
      setEnqDate("");
      setEnqNotes("");
      fetchEvents();
    } catch (err: any) {
      setEnqError(err.message || "Error submitting enquiry.");
    } finally {
      setEnqSubmitting(false);
    }
  };

  // Calendar Helpers
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    // Pad days from previous month
    const startDay = date.getDay();
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentDate]);

  const calendarEvents = useMemo(() => {
    return events;
  }, [events]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const getEventsForDay = (day: Date) => {
    const dateStr = day.toISOString().split("T")[0];
    return calendarEvents.filter(e => e.date === dateStr);
  };

  // Validation flag for budget in Modal details
  const isBudgetValid = useMemo(() => {
    if (!eventDetails) return true;
    const limit = eventTypeMinBudgets[eventDetails.event_type] || 0;
    return eventDetails.budget >= limit;
  }, [eventDetails]);

  return (
    <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto font-sans">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-luxury-border/30 pb-6">
        <div>
          <h2 className="font-serif text-3xl font-bold text-white">Event Management</h2>
          <p className="text-xs text-luxury-text-dark mt-1">
            Review public reservations, allocate wine portfolios, manage staff assignments, and generate official quotation PDFs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Toggle Tab */}
          <div className="bg-luxury-black/60 border border-luxury-border p-1 rounded-xl flex items-center gap-1">
            <button 
              onClick={() => setViewMode("ledger")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === "ledger" ? "bg-wine-900/40 border border-gold-500/25 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Enquiries List
            </button>
            <button 
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === "calendar" ? "bg-wine-900/40 border border-gold-500/25 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Calendar
            </button>
          </div>

          <button 
            onClick={() => setShowEnquiryModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gold-500 text-luxury-black hover:bg-gold-400 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Book Event
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
          <p className="text-xs text-luxury-text-dark uppercase tracking-widest font-semibold">Loading bookings directory...</p>
        </div>
      ) : error ? (
        <div className="glass-panel border border-rose-500/25 p-6 rounded-2xl text-center max-w-md mx-auto space-y-3">
          <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
          <h4 className="font-bold text-white text-sm">Failed to retrieve data</h4>
          <p className="text-xs text-rose-400">{error}</p>
          <button onClick={fetchEvents} className="px-4 py-2 bg-rose-900/30 border border-rose-500/25 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-rose-900/40 transition-colors">
            Try Again
          </button>
        </div>
      ) : (
        <>
          {viewMode === "ledger" ? (
            /* Ledger View */
            <div className="glass-panel rounded-2xl p-6 border border-luxury-border">
              {events.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 text-xs">
                  No event bookings found matching this criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-400">
                    <thead>
                      <tr className="border-b border-luxury-border text-zinc-500 uppercase tracking-widest text-[9px] font-bold">
                        <th className="py-3 px-4">Event Client</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Event Class</th>
                        <th className="py-3 px-4">Guests Count</th>
                        <th className="py-3 px-4">Proposed Budget</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Assigned Branch</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((row) => {
                        const minReq = eventTypeMinBudgets[row.event_type] || 0;
                        const isLow = row.budget < minReq;
                        return (
                          <tr key={row.id} className="border-b border-luxury-border/20 hover:bg-wine-950/10 transition-colors">
                            <td className="py-3.5 px-4 font-serif text-white font-semibold text-sm">
                              <p>{row.customer_name}</p>
                              <p className="text-[10px] text-zinc-500 font-sans mt-0.5">{row.customer_phone} | {row.customer_email}</p>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-[11px]">{row.date}</td>
                            <td className="py-3.5 px-4 uppercase tracking-widest text-[9px] font-bold text-gold-500">
                              {row.event_type.replace("_", " ")}
                            </td>
                            <td className="py-3.5 px-4 font-mono">{row.guest_count} guests</td>
                            <td className="py-3.5 px-4 font-mono">
                              <div className="flex items-center gap-1.5 font-bold text-white">
                                <span>RM {row.budget.toLocaleString()}</span>
                                {isLow && (
                                  <span title={`Below Minimum RM ${minReq.toLocaleString()}`}>
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-semibold uppercase tracking-wider ${
                                row.status === "booked" 
                                  ? "text-emerald-400 bg-emerald-950/30 border-emerald-500/25"
                                  : row.status === "quoted"
                                  ? "text-sky-400 bg-sky-950/30 border-sky-500/25"
                                  : row.status === "completed"
                                  ? "text-purple-400 bg-purple-950/30 border-purple-500/25"
                                  : row.status === "cancelled"
                                  ? "text-rose-400 bg-rose-950/30 border-rose-500/25"
                                  : "text-amber-400 bg-amber-950/30 border-amber-500/25"
                              }`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-zinc-300">{row.branchName || "HQ Core"}</td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2.5">
                                <button 
                                  onClick={() => handleDownloadQuotation(row.id, row.customer_name)}
                                  className="p-1.5 hover:text-gold-500 text-zinc-500 hover:bg-wine-900/20 border border-transparent hover:border-gold-500/10 rounded-lg transition-all cursor-pointer"
                                  title="Download Quote PDF"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleOpenManage(row.id)}
                                  className="px-2.5 py-1.5 hover:bg-gold-500 hover:text-luxury-black text-gold-500 border border-gold-500/20 hover:border-gold-500 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                                >
                                  Manage
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Calendar View */
            <div className="glass-panel rounded-2xl p-6 border border-luxury-border space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-white capitalize">
                  {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
                </h3>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => changeMonth(-1)} className="p-2 border border-luxury-border rounded-lg text-zinc-400 hover:text-white hover:bg-wine-900/20 cursor-pointer">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => changeMonth(1)} className="p-2 border border-luxury-border rounded-lg text-zinc-400 hover:text-white hover:bg-wine-900/20 cursor-pointer">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-luxury-border pb-2">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {daysInMonth.map((day, idx) => {
                  if (!day) return <div key={`empty_${idx}`} className="bg-luxury-black/20 aspect-video rounded-xl border border-transparent"></div>;
                  
                  const isToday = day.toDateString() === new Date().toDateString();
                  const dayEvents = getEventsForDay(day);

                  return (
                    <div 
                      key={`day_${idx}`} 
                      className={`bg-luxury-black/40 border p-2 aspect-video rounded-xl text-left flex flex-col justify-between transition-all ${
                        isToday ? "border-gold-500 bg-wine-900/10" : "border-luxury-border hover:border-gold-500/20"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`font-mono text-xs font-bold ${isToday ? "text-gold-500" : "text-zinc-500"}`}>
                          {day.getDate()}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span>
                        )}
                      </div>

                      <div className="mt-1 space-y-1 overflow-y-auto max-h-12 scrollbar-none">
                        {dayEvents.map(ev => (
                          <div 
                            key={ev.id}
                            onClick={() => handleOpenManage(ev.id)}
                            className={`px-1.5 py-0.5 rounded text-[8px] font-semibold truncate cursor-pointer uppercase ${
                              ev.status === "booked"
                                ? "bg-emerald-950/30 text-emerald-400 border border-emerald-500/10"
                                : ev.status === "quoted"
                                ? "bg-sky-950/30 text-sky-400 border border-sky-500/10"
                                : ev.status === "completed"
                                ? "bg-purple-950/30 text-purple-400 border border-purple-500/10"
                                : "bg-amber-950/30 text-amber-400 border border-amber-500/10"
                            }`}
                            title={`${ev.customer_name} (${ev.status})`}
                          >
                            {ev.customer_name}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* 1. Manage Booking Details Modal */}
      {showManageModal && (
        <div className="fixed inset-0 bg-luxury-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="glass-panel border border-luxury-border rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-fade-in">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-luxury-border/30 bg-luxury-black/40">
              <div>
                <span className="text-[10px] text-gold-500 font-bold uppercase tracking-widest font-mono">
                  Booking Reference ID: {selectedEventId}
                </span>
                <h3 className="font-serif text-xl font-bold text-white mt-1">
                  {eventDetails ? eventDetails.customer_name : "Retrieving Booking..."}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setShowManageModal(false);
                  setEventDetails(null);
                }}
                className="p-1 text-zinc-500 hover:text-white hover:bg-wine-900/20 border border-transparent hover:border-luxury-border rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            {detailsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                <p className="text-xs text-luxury-text-dark uppercase tracking-widest font-semibold">Resolving databases...</p>
              </div>
            ) : detailsError || !eventDetails ? (
              <div className="p-6 text-center text-rose-400 text-xs">
                {detailsError || "Failed to load booking details."}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 grid md:grid-cols-2 gap-6 text-left">
                
                {/* Left Side: General Info & Status */}
                <div className="space-y-6">
                  {/* Status Bar */}
                  <div className="glass-panel p-4 border border-luxury-border/50 rounded-xl space-y-3">
                    <h4 className="text-[10px] font-bold text-luxury-text-dark uppercase tracking-wider">
                      Event Process Status
                    </h4>
                    
                    <div className="grid grid-cols-5 gap-1 text-center">
                      {["enquiry", "quoted", "booked", "completed", "cancelled"].map((st) => {
                        const isActive = eventDetails.status === st;
                        return (
                          <button
                            key={st}
                            disabled={statusSubmitting}
                            onClick={() => handleStatusChange(st)}
                            className={`py-1 rounded text-[8px] font-bold uppercase tracking-wide border transition-all cursor-pointer ${
                              isActive
                                ? st === "booked"
                                  ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30 shadow shadow-emerald-500/10"
                                  : st === "quoted"
                                  ? "bg-sky-950/40 text-sky-400 border-sky-500/30 shadow shadow-sky-500/10"
                                  : st === "completed"
                                  ? "bg-purple-950/40 text-purple-400 border-purple-500/30 shadow shadow-purple-500/10"
                                  : st === "cancelled"
                                  ? "bg-rose-950/40 text-rose-400 border-rose-500/30 shadow shadow-rose-500/10"
                                  : "bg-amber-950/40 text-amber-400 border-amber-500/30 shadow shadow-amber-500/10"
                                : "bg-luxury-black/30 border-luxury-border/30 text-zinc-500 hover:text-zinc-300"
                            }`}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>

                    {statusError && (
                      <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {statusError}
                      </p>
                    )}
                  </div>

                  {/* Core Details Card */}
                  <div className="glass-panel p-5 border border-luxury-border/50 rounded-xl space-y-4">
                    <h4 className="text-[10px] font-bold text-luxury-text-dark uppercase tracking-wider border-b border-luxury-border/20 pb-2">
                      Client & Schedule Details
                    </h4>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-zinc-500 text-[10px] uppercase font-bold">Client Email</p>
                        <p className="text-white mt-0.5 font-semibold font-mono">{eventDetails.customer_email}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-[10px] uppercase font-bold">Client Contact</p>
                        <p className="text-white mt-0.5 font-semibold font-mono">{eventDetails.customer_phone}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-[10px] uppercase font-bold">Event Date</p>
                        <p className="text-white mt-0.5 font-semibold font-mono">{eventDetails.date}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-[10px] uppercase font-bold">Event Type</p>
                        <p className="text-gold-500 mt-0.5 font-bold uppercase tracking-wider text-[10px]">
                          {eventDetails.event_type.replace("_", " ")}
                        </p>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-[10px] uppercase font-bold">Guest Count</p>
                        <p className="text-white mt-0.5 font-semibold font-mono">{eventDetails.guest_count} guests</p>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-[10px] uppercase font-bold">Assigned Cellar</p>
                        <p className="text-white mt-0.5 font-semibold">{eventDetails.branchName || "HQ Core"}</p>
                      </div>
                    </div>

                    {/* Proposed Budget Rule Checks */}
                    <div className={`p-3.5 border rounded-xl space-y-1 ${
                      isBudgetValid 
                        ? "bg-emerald-950/20 border-emerald-500/20" 
                        : "bg-amber-950/20 border-amber-500/25"
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Proposed Budget</span>
                        <span className="text-xs font-mono font-bold text-white">RM {eventDetails.budget.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase mt-2">
                        {isBudgetValid ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Budget satisfies minimum package rules</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-amber-500">
                              Below minimum required: RM {(eventTypeMinBudgets[eventDetails.event_type] || 0).toLocaleString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {eventDetails.notes && (
                      <div className="bg-luxury-black/40 border border-luxury-border/30 p-3 rounded-lg text-xs space-y-1">
                        <p className="text-zinc-500 text-[9px] uppercase font-bold">Client Notes</p>
                        <p className="text-zinc-300 leading-relaxed font-sans">{eventDetails.notes}</p>
                      </div>
                    )}

                    <button 
                      onClick={() => handleDownloadQuotation(eventDetails.id, eventDetails.customer_name)}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-luxury-black border border-gold-500/30 text-gold-500 hover:bg-gold-500 hover:text-luxury-black rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Download Official Quotation
                    </button>
                  </div>
                </div>

                {/* Right Side: Wine Pairings & Sommelier Assignments */}
                <div className="space-y-6">
                  
                  {/* Wine pairing curation */}
                  <div className="glass-panel p-5 border border-luxury-border/50 rounded-xl space-y-4">
                    <h4 className="text-[10px] font-bold text-gold-500 uppercase tracking-wider border-b border-luxury-border/20 pb-2">
                      Curated Wine Pairings
                    </h4>

                    {/* Allocated wines list */}
                    {eventDetails.reservedWines.length === 0 ? (
                      <p className="text-zinc-500 text-[10px] text-center py-4">No wines allocated for this event yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-none pr-1">
                        {eventDetails.reservedWines.map(w => (
                          <div key={w.id} className="flex items-center justify-between p-2.5 bg-luxury-black/40 border border-luxury-border/30 rounded-lg text-[11px] text-left">
                            <div>
                              <p className="font-semibold text-white font-serif">{w.productName}</p>
                              <p className="text-[9px] text-zinc-500 font-sans mt-0.5">{w.productVariant} | RM {w.productPrice}/bottle</p>
                            </div>
                            <div className="flex items-center gap-3.5">
                              <span className="font-mono font-bold text-zinc-300">x{w.quantity}</span>
                              <button 
                                onClick={() => handleDeleteWine(w.product_id)}
                                className="p-1 hover:text-rose-400 text-zinc-600 rounded cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Allocations update form */}
                    <form onSubmit={handleReserveWine} className="bg-luxury-black/30 border border-luxury-border/40 p-3.5 rounded-xl space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="block text-[8px] font-bold uppercase text-zinc-500 mb-1.5">Select Wine Catalog</label>
                          <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="w-full px-2 py-1.5 bg-luxury-black border border-luxury-border rounded text-[10px] text-white focus:outline-none focus:border-gold-500"
                          >
                            {inventory.map(item => {
                              const avail = item.quantity - item.reserved_quantity;
                              return (
                                <option key={item.productId} value={item.productId}>
                                  {item.productName} (Avail: {avail})
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[8px] font-bold uppercase text-zinc-500 mb-1.5">Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={reserveQty}
                            onChange={(e) => setReserveQty(e.target.value)}
                            className="w-full px-2 py-1.5 bg-luxury-black border border-luxury-border rounded text-[10px] text-white focus:outline-none focus:border-gold-500"
                          />
                        </div>
                      </div>

                      {wineError && (
                        <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {wineError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={wineSubmitting}
                        className="w-full flex items-center justify-center gap-1 px-3 py-1.5 bg-wine-900/40 border border-gold-500/20 hover:border-gold-500 text-gold-500 rounded text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        {wineSubmitting ? (
                          <Loader2 className="w-3 animate-spin" />
                        ) : (
                          <>
                            <PlusCircle className="w-3 h-3" /> Allocate Wine
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Sommelier Assignment */}
                  <div className="glass-panel p-5 border border-luxury-border/50 rounded-xl space-y-4">
                    <h4 className="text-[10px] font-bold text-gold-500 uppercase tracking-wider border-b border-luxury-border/20 pb-2">
                      Sommeliers & Coordinators
                    </h4>

                    {/* Assigned staff list */}
                    {eventDetails.staffAssigned.length === 0 ? (
                      <p className="text-zinc-500 text-[10px] text-center py-4">No staff assigned to this event yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {eventDetails.staffAssigned.map(s => (
                          <div key={s.userId} className="flex items-center justify-between p-2.5 bg-luxury-black/40 border border-luxury-border/30 rounded-lg text-[11px] text-left">
                            <div>
                              <p className="font-semibold text-white">{s.userName}</p>
                              <p className="text-[9px] text-zinc-500 capitalize font-sans mt-0.5">{s.userRole.replace("_", " ")} | {s.userContact}</p>
                            </div>
                            <button 
                              onClick={() => handleUnassignStaff(s.userId)}
                              className="p-1 hover:text-rose-400 text-zinc-600 rounded cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Staff assignment update form */}
                    <form onSubmit={handleAssignStaff} className="bg-luxury-black/30 border border-luxury-border/40 p-3.5 rounded-xl space-y-3">
                      <div>
                        <label className="block text-[8px] font-bold uppercase text-zinc-500 mb-1.5">Select Staff Candidate</label>
                        <select
                          value={selectedEmployee}
                          onChange={(e) => setSelectedEmployee(e.target.value)}
                          className="w-full px-2 py-1.5 bg-luxury-black border border-luxury-border rounded text-[10px] text-white focus:outline-none focus:border-gold-500"
                        >
                          {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>
                              {emp.name} ({emp.role.replace("_", " ").toUpperCase()})
                            </option>
                          ))}
                        </select>
                      </div>

                      {staffError && (
                        <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {staffError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={staffSubmitting}
                        className="w-full flex items-center justify-center gap-1 px-3 py-1.5 bg-wine-900/40 border border-gold-500/20 hover:border-gold-500 text-gold-500 rounded text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        {staffSubmitting ? (
                          <Loader2 className="w-3 animate-spin" />
                        ) : (
                          <>
                            <PlusCircle className="w-3 h-3" /> Assign Staff
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Book New Event Modal */}
      {showEnquiryModal && (
        <div className="fixed inset-0 bg-luxury-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-panel border border-luxury-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col animate-fade-in text-left">
            <div className="flex justify-between items-center p-6 border-b border-luxury-border/30 bg-luxury-black/40">
              <h3 className="font-serif text-lg font-bold text-white">Book Private / Corporate Event</h3>
              <button 
                onClick={() => setShowEnquiryModal(false)}
                className="p-1 text-zinc-500 hover:text-white hover:bg-wine-900/20 border border-transparent hover:border-luxury-border rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEnquiry} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5">Client Name</label>
                  <input
                    type="text"
                    required
                    value={enqName}
                    onChange={(e) => setEnqName(e.target.value)}
                    placeholder="E.g. Robert Parker"
                    className="w-full px-3 py-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5">Client Email</label>
                  <input
                    type="email"
                    required
                    value={enqEmail}
                    onChange={(e) => setEnqEmail(e.target.value)}
                    placeholder="E.g. customer@email.com"
                    className="w-full px-3 py-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5">Client Phone</label>
                  <input
                    type="text"
                    required
                    value={enqPhone}
                    onChange={(e) => setEnqPhone(e.target.value)}
                    placeholder="E.g. +60 12-345 6789"
                    className="w-full px-3 py-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5">Event Date</label>
                  <input
                    type="date"
                    required
                    value={enqDate}
                    onChange={(e) => setEnqDate(e.target.value)}
                    className="w-full px-3 py-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5">Event Type</label>
                  <select
                    value={enqType}
                    onChange={(e) => setEnqType(e.target.value)}
                    className="w-full px-3 py-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500"
                  >
                    <option value="corporate">Corporate</option>
                    <option value="wedding">Wedding</option>
                    <option value="private_tasting">Private Tasting</option>
                    <option value="birthday">Birthday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5">Guests</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={enqGuests}
                    onChange={(e) => setEnqGuests(e.target.value)}
                    className="w-full px-3 py-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5">Proposed Budget</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={enqBudget}
                    onChange={(e) => setEnqBudget(e.target.value)}
                    className="w-full px-3 py-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1.5">Special Curation Notes</label>
                <textarea
                  rows={3}
                  value={enqNotes}
                  onChange={(e) => setEnqNotes(e.target.value)}
                  placeholder="Wine varieties, sommelier level, dietary restrictions, layout wishes..."
                  className="w-full px-3 py-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-gold-500 resize-none"
                />
              </div>

              {enqError && (
                <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {enqError}
                </p>
              )}

              <div className="border-t border-luxury-border/30 pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEnquiryModal(false)}
                  className="px-4 py-2 border border-luxury-border hover:bg-wine-900/20 text-zinc-400 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={enqSubmitting}
                  className="flex items-center gap-1 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-luxury-black rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  {enqSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Booking"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </main>
  );
}

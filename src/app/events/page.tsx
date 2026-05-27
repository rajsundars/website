"use client";
import { API_BASE_URL } from "@/config";


import React, { useState, useEffect } from "react";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import { Calendar, Users, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, Loader2 } from "lucide-react";

type EventType = "corporate" | "wedding" | "private_tasting" | "birthday";

interface Rule {
  minGuests: number;
  minBudget: number;
  label: string;
}

const eventRules: Record<EventType, Rule> = {
  corporate: { minGuests: 30, minBudget: 5000, label: "Corporate Event" },
  wedding: { minGuests: 50, minBudget: 8000, label: "Wedding Tasting Dinner" },
  private_tasting: { minGuests: 6, minBudget: 1500, label: "Private Sommelier Masterclass" },
  birthday: { minGuests: 15, minBudget: 2000, label: "Private Birthday Gathering" }
};

export default function EventsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    eventType: "corporate" as EventType,
    guestCount: 30,
    budget: 5000,
    notes: ""
  });

  const [errors, setErrors] = useState<{ guests?: string; budget?: string; date?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);


  // Form validations triggered on input changes
  useEffect(() => {
    const activeRule = eventRules[formData.eventType];
    const newErrors: typeof errors = {};

    // Validate Guest Count
    if (formData.guestCount < activeRule.minGuests) {
      newErrors.guests = `Minimum guest requirement for a ${activeRule.label} is ${activeRule.minGuests} guests.`;
    }

    // Validate Budget
    if (formData.budget < activeRule.minBudget) {
      newErrors.budget = `Minimum budget requirement for a ${activeRule.label} is RM ${activeRule.minBudget.toLocaleString()}.`;
    }

    // Validate Date (must be in future)
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate <= today) {
        newErrors.date = "Event date must be a future date.";
      }
    }

    setErrors(newErrors);
  }, [formData.eventType, formData.guestCount, formData.budget, formData.date]);

  const handleEventTypeChange = (type: EventType) => {
    const rule = eventRules[type];
    setFormData((prev) => ({
      ...prev,
      eventType: type,
      guestCount: Math.max(prev.guestCount, rule.minGuests),
      budget: Math.max(prev.budget, rule.minBudget)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(errors).length === 0 && formData.name && formData.email && formData.phone && formData.date) {
      setSubmitting(true);
      setSubmitError(null);
      try {
        const res = await fetch(API_BASE_URL + "/api/events/enquire", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            date: formData.date,
            eventType: formData.eventType,
            guestCount: formData.guestCount,
            budget: formData.budget,
            notes: formData.notes,
            branchId: "b1"
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to submit enquiry. Please try again.");
        }

        setSubmitted(true);
      } catch (err: any) {
        console.error("Enquiry submission error:", err);
        setSubmitError(err.message || "An unexpected error occurred. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setSubmitError(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      date: "",
      eventType: "corporate",
      guestCount: 30,
      budget: 5000,
      notes: ""
    });
  };


  return (
    <div className="min-h-screen bg-wine-gradient text-zinc-100 flex flex-col font-sans">
      <PublicHeader />

      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full space-y-12 animate-fade-in-up">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-gold-500 text-xs font-bold uppercase tracking-[0.2em]">Bespoke Gatherings</span>
          <h1 className="font-serif text-4xl font-bold text-white">Private & Corporate Events</h1>
          <p className="text-xs text-luxury-text-dark leading-relaxed">
            Host your next event with Guna Wines. Our sommeliers curate custom wine lists, gourmet food pairings, 
            and staffing logistics in our cellars or at your private venue.
          </p>
        </div>

        {/* Packages Grid */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(Object.keys(eventRules) as EventType[]).map((type) => {
            const rule = eventRules[type];
            return (
              <div 
                key={type} 
                onClick={() => handleEventTypeChange(type)}
                className={`glass-panel p-6 border rounded-2xl cursor-pointer text-left transition-all duration-300 ${
                  formData.eventType === type 
                    ? "border-gold-500 bg-wine-900/20 shadow-lg shadow-wine-900/35"
                    : "border-luxury-border/55 hover:border-gold-500/30"
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="p-2 bg-wine-800/40 border border-gold-500/20 text-gold-500 rounded-lg">
                    {type === "corporate" && <Users className="w-5 h-5" />}
                    {type === "wedding" && <Sparkles className="w-5 h-5" />}
                    {type === "private_tasting" && <Calendar className="w-5 h-5" />}
                    {type === "birthday" && <Calendar className="w-5 h-5" />}
                  </span>
                  {formData.eventType === type && (
                    <span className="text-[9px] uppercase tracking-widest bg-gold-500 text-luxury-black font-bold px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-md font-bold text-white mb-2">{rule.label}</h3>
                <div className="space-y-1 text-xs text-luxury-text-dark font-medium border-t border-luxury-border/20 pt-3">
                  <p>Min. Guests: <strong className="text-white">{rule.minGuests}</strong></p>
                  <p>Min. Budget: <strong className="text-white">RM {rule.minBudget.toLocaleString()}</strong></p>
                </div>
              </div>
            );
          })}
        </section>

        {/* Enquiry Form */}
        <section className="max-w-3xl mx-auto">
          <div className="glass-panel border border-luxury-border rounded-2xl p-6 md:p-8 text-left">
            {submitted ? (
              <div className="text-center py-10 space-y-6">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="font-serif text-2xl font-bold text-white">Event Inquiry Submitted</h3>
                
                <div className="bg-luxury-black/60 border border-luxury-border p-6 rounded-xl text-left text-xs max-w-md mx-auto space-y-3">
                  <h4 className="font-bold text-gold-500 border-b border-luxury-border/30 pb-2 mb-1">Booking Confirmation details</h4>
                  <p><span className="text-zinc-500">Contact:</span> {formData.name} ({formData.email})</p>
                  <p><span className="text-zinc-500">Event Date:</span> {formData.date}</p>
                  <p><span className="text-zinc-500">Event Class:</span> {eventRules[formData.eventType].label}</p>
                  <p><span className="text-zinc-500">Guests Count:</span> {formData.guestCount} guests</p>
                  <p><span className="text-zinc-500">Proposed Budget:</span> RM {formData.budget.toLocaleString()}</p>
                </div>

                <p className="text-xs text-luxury-text-dark max-w-sm mx-auto leading-relaxed">
                  Thank you! An event coordinator will reach out to you within 24 hours with a custom quotation PDF and wine suggestions.
                </p>

                <button 
                  onClick={handleReset}
                  className="px-6 py-3 bg-gold-500 text-luxury-black font-bold uppercase text-xs tracking-wider rounded-lg hover:bg-gold-400 transition-colors shadow-lg cursor-pointer"
                >
                  Create New Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="font-serif text-xl font-bold text-white border-b border-luxury-border/30 pb-4">
                  Enquiry Form — {eventRules[formData.eventType].label}
                </h3>

                {/* Form Fields */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-luxury-text-dark uppercase tracking-wide mb-2">
                      Client Contact Name
                    </label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your full name"
                      className="w-full px-4 py-3 bg-luxury-black/60 border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-luxury-text-dark uppercase tracking-wide mb-2">
                      Contact Email
                    </label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="yourname@email.com"
                      className="w-full px-4 py-3 bg-luxury-black/60 border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-luxury-text-dark uppercase tracking-wide mb-2">
                      Contact Telephone
                    </label>
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +60 12-345 6789"
                      className="w-full px-4 py-3 bg-luxury-black/60 border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-luxury-text-dark uppercase tracking-wide mb-2">
                      Event Date
                    </label>
                    <input 
                      type="date" 
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 bg-luxury-black/60 border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500 transition-colors"
                    />
                    {errors.date && (
                      <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {errors.date}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-luxury-text-dark uppercase tracking-wide mb-2">
                      Guest Count
                    </label>
                    <input 
                      type="number" 
                      required
                      min={1}
                      value={formData.guestCount}
                      onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-luxury-black/60 border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500 transition-colors"
                    />
                    {errors.guests && (
                      <p className="text-[10px] text-amber-500 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {errors.guests}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-luxury-text-dark uppercase tracking-wide mb-2">
                      Proposed Budget (RM)
                    </label>
                    <input 
                      type="number" 
                      required
                      min={0}
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-luxury-black/60 border border-luxury-border rounded-lg text-xs text-white focus:outline-none focus:border-gold-500 transition-colors"
                    />
                    {errors.budget && (
                      <p className="text-[10px] text-amber-500 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {errors.budget}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-luxury-text-dark uppercase tracking-wide mb-2">
                    Additional Notes & Cellar Curation Requirements
                  </label>
                  <textarea 
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="E.g. Specific wines requested, temperature requirements, staffing requests..."
                    className="w-full px-4 py-3 bg-luxury-black/60 border border-luxury-border rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-gold-500 transition-colors resize-none"
                  />
                </div>

                {submitError && (
                  <div className="bg-rose-950/30 border border-rose-500/25 p-4 rounded-xl flex items-center gap-2.5 text-xs text-rose-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="border-t border-luxury-border/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-semibold uppercase">
                    <ShieldCheck className="w-4 h-4 text-gold-500" />
                    <span>Rule validations are active</span>
                  </div>
                  <button 
                    type="submit"
                    disabled={Object.keys(errors).length > 0 || submitting}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gold-500 text-luxury-black font-bold uppercase text-xs tracking-wider rounded-lg hover:bg-gold-400 disabled:opacity-30 disabled:hover:bg-gold-500 transition-all duration-300 shadow-lg cursor-pointer flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Submitting...
                      </>
                    ) : "Submit Enquiry"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }
  };

  return (
    <div className="min-h-screen bg-wine-gradient text-zinc-100 flex flex-col font-sans">
      <PublicHeader />

      <main className="max-w-5xl mx-auto px-6 py-12 flex-1 w-full space-y-12 animate-fade-in-up">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-gold-500 text-xs font-bold uppercase tracking-[0.2em]">Get in touch</span>
          <h1 className="font-serif text-4xl font-bold text-white">Contact Our Team</h1>
        </div>

        <div className="grid md:grid-cols-5 gap-8 items-start">
          {/* Contact Details */}
          <div className="md:col-span-2 space-y-6 text-left">
            <h3 className="font-serif text-2xl text-white">Headquarters</h3>
            <p className="text-xs text-luxury-text-dark leading-relaxed">
              Have a general inquiry or interested in partnership opportunities? Drop us a line or visit our main office.
            </p>

            <div className="space-y-4 text-xs font-semibold">
              <div className="flex gap-4 items-start">
                <MapPin className="w-5 h-5 text-gold-500 shrink-0" />
                <div>
                  <p className="text-white">Guna Wines HQ</p>
                  <p className="text-luxury-text-dark font-medium mt-1">Suite 12-05, City Square Office Tower, 106-108 Jalan Wong Ah Fook, 80000 Johor Bahru, Johor, Malaysia</p>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <Phone className="w-5 h-5 text-gold-500 shrink-0" />
                <span className="text-luxury-text-dark">+60 7 220 8900</span>
              </div>

              <div className="flex gap-4 items-center">
                <Mail className="w-5 h-5 text-gold-500 shrink-0" />
                <span className="text-luxury-text-dark">enquiries@gunawines.my</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-3">
            <div className="glass-panel rounded-2xl p-6 md:p-8 border border-luxury-border text-left">
              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                  <h3 className="font-serif text-xl font-bold text-white">Enquiry Received</h3>
                  <p className="text-xs text-luxury-text-dark leading-relaxed max-w-sm mx-auto">
                    Thank you for contacting us. A representative from Guna Wines will review your message and reply via email within 24 business hours.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="px-5 py-2.5 bg-gold-500 text-luxury-black font-bold uppercase text-[10px] tracking-wider rounded-lg hover:bg-gold-400 transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-luxury-text-dark uppercase tracking-wide mb-2">Name</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your full name"
                        className="w-full px-4 py-3 bg-luxury-black/60 border border-luxury-border rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-gold-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-luxury-text-dark uppercase tracking-wide mb-2">Email</label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="yourname@email.com"
                        className="w-full px-4 py-3 bg-luxury-black/60 border border-luxury-border rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-gold-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-luxury-text-dark uppercase tracking-wide mb-2">Subject</label>
                    <input 
                      type="text" 
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="What is this enquiry about?"
                      className="w-full px-4 py-3 bg-luxury-black/60 border border-luxury-border rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-gold-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-luxury-text-dark uppercase tracking-wide mb-2">Message</label>
                    <textarea 
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Write your enquiry message here..."
                      className="w-full px-4 py-3 bg-luxury-black/60 border border-luxury-border rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-gold-500 transition-colors resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3.5 bg-gold-500 text-luxury-black font-bold uppercase text-xs tracking-wider rounded-lg hover:bg-gold-400 active:bg-gold-600 transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Submit Inquiry <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

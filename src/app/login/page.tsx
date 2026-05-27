"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "../../context/AdminContext";
import { Wine, Lock, Mail, AlertCircle, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading } = useAdmin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/admin");
    }
  }, [isAuthenticated, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed. Please check your credentials.");
      }

      // Save token and user details to context
      login(data.token, data.user);
      router.replace("/admin");
    } catch (err: any) {
      setError(err.message || "Unable to connect to authentication server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wine-gradient flex flex-col justify-center items-center px-6 py-12 font-sans relative overflow-hidden">
      {/* Glow decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-wine-800/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Brand logo header */}
      <div className="z-10 text-center mb-8 space-y-3">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-wine-800 border border-gold-500/30 flex items-center justify-center shadow-lg">
            <Wine className="w-7 h-7 text-gold-500" />
          </div>
          <div className="text-left">
            <h1 className="font-serif text-2xl font-bold tracking-wide text-white leading-none">GUNA WINES</h1>
            <p className="text-[10px] text-gold-500 uppercase tracking-[0.3em] font-sans mt-1">Management Portal</p>
          </div>
        </Link>
      </div>

      {/* Login Card */}
      <div className="z-10 w-full max-w-md glass-panel rounded-2xl border border-luxury-border shadow-2xl p-8 relative">
        <h2 className="font-serif text-2xl font-bold text-white text-center mb-6">Staff Access Login</h2>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-950/40 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-zinc-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guna.s@gunawines.my"
                className="w-full pl-11 pr-4 py-3 bg-luxury-black/60 border border-luxury-border rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Access Password
              </label>
              <a href="#" className="text-[10px] text-gold-500 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-zinc-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-11 pr-4 py-3 bg-luxury-black/60 border border-luxury-border rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gold-500 text-luxury-black hover:bg-gold-400 disabled:opacity-50 disabled:hover:bg-gold-500 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 shadow-xl flex items-center justify-center gap-2 cursor-pointer font-sans"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-luxury-black border-t-transparent rounded-full animate-spin" />
            ) : (
              "Sign In to Core"
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-luxury-border/30 pt-6 flex items-center justify-between text-[10px] text-zinc-500">
          <span className="flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-gold-500/80" /> Authorized personnel only
          </span>
          <Link href="/" className="hover:text-gold-500 transition-colors">
            Exit to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

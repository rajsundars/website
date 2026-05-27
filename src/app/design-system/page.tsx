"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DesignSystemRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/design-system");
  }, [router]);

  return (
    <div className="min-h-screen bg-luxury-black text-gold-500 flex items-center justify-center font-sans">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs uppercase tracking-widest font-semibold text-zinc-400">Redirecting to Admin Design Tokens...</p>
      </div>
    </div>
  );
}

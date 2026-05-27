import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Guna Wines — Premium Wine Business Management",
  description: "JB, Malaysia's most elegant multi-branch wine inventory, billing, logistics, employee, and event management platform.",
};

import { AdminProvider } from "../context/AdminContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-luxury-black text-[#F5F5F5] font-sans selection:bg-wine-600 selection:text-white">
        <AdminProvider>
          {children}
        </AdminProvider>
      </body>
    </html>
  );
}

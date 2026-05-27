"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  branchId: string;
  contact?: string;
}

interface AdminContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeBranch: string; // "all" | "b1" | "b2" | "b3"
  setActiveBranch: (branchId: string) => void;
  isAuthenticated: boolean;
  user: UserProfile | null;
  token: string | null;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeBranch, setActiveBranch] = useState("all");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("guna_wines_token");
    const savedUser = localStorage.getItem("guna_wines_user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: UserProfile) => {
    localStorage.setItem("guna_wines_token", newToken);
    localStorage.setItem("guna_wines_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("guna_wines_token");
    localStorage.removeItem("guna_wines_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AdminContext.Provider 
      value={{ 
        sidebarOpen, 
        setSidebarOpen, 
        activeBranch, 
        setActiveBranch,
        isAuthenticated: !!token,
        user,
        token,
        login,
        logout,
        loading
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}

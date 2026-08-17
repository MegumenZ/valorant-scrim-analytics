"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface AuthUser {
  id: string;
  discordId: string;
  username: string;
  globalName?: string | null;
  avatar?: string | null;
  role: "ADMIN" | "COACH" | "MEMBER";
}

interface RoleContextType {
  user: AuthUser | null;
  role: "ADMIN" | "MEMBER";
  isAdmin: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType>({
  user: null,
  role: "ADMIN",
  isAdmin: true,
  isLoading: true,
  logout: async () => {},
  refreshUser: async () => {},
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to fetch auth session:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/login";
    }
  };

  const isAdmin = user ? (user.role === "ADMIN" || user.role === "COACH") : true;
  const currentRole = user ? (isAdmin ? "ADMIN" : "MEMBER") : "ADMIN";

  return (
    <RoleContext.Provider
      value={{
        user,
        role: currentRole,
        isAdmin,
        isLoading,
        logout,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useUserRole() {
  return useContext(RoleContext);
}

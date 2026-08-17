"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "ADMIN" | "MEMBER";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isAdmin: boolean;
}

const RoleContext = createContext<RoleContextType>({
  role: "ADMIN",
  setRole: () => {},
  isAdmin: true,
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("ADMIN");

  useEffect(() => {
    const saved = localStorage.getItem("valo_user_role");
    if (saved === "ADMIN" || saved === "MEMBER") {
      setRoleState(saved);
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem("valo_user_role", newRole);
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        isAdmin: role === "ADMIN",
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useUserRole() {
  return useContext(RoleContext);
}

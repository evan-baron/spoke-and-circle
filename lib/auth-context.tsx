"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Role = "guest" | "member" | "admin";

interface AuthContextValue {
  role: Role;
  setRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "spoke-and-circle:role";

function isRole(value: unknown): value is Role {
  return value === "guest" || value === "member" || value === "admin";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>("guest");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isRole(stored)) {
        setRoleState(stored);
      }
    } catch {
      // localStorage unavailable — fall back to the guest default.
    }
  }, []);

  function setRole(next: Role) {
    setRoleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore write failures, this is a wireframe convenience only
    }
  }

  return <AuthContext.Provider value={{ role, setRole }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { apiRequest } from "../lib/api";
import type { AdminUser } from "../types/content";

type AuthContextValue = {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const data = await apiRequest<{ user: AdminUser }>("/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const data = await apiRequest<{ user: AdminUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    setUser(data.user);
  }

  async function logout() {
    await apiRequest("/auth/logout", {
      method: "POST"
    });

    setUser(null);
  }

  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      refresh
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}

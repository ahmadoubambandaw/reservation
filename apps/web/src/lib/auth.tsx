"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, setToken } from "@/lib/api";
import type { MeResponse, ModuleKey } from "@/lib/types";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  restaurant_name: string;
  plan?: string;
}

interface AuthContextValue {
  me: MeResponse | null;
  loading: boolean;
  login: (email: string, password: string, twoFactorCode?: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  hasModule: (module: ModuleKey) => boolean;
  can: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api.get<MeResponse>("/auth/me");
      setMe(data);
    } catch {
      setMe(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // Initial hydration of the session from a persisted token.
    if (typeof window !== "undefined" && window.localStorage.getItem("ndaw_token")) {
      refresh();
    } else {
      setLoading(false);
    }
  }, [refresh]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const login = useCallback(
    async (email: string, password: string, twoFactorCode?: string) => {
      const res = await api.post<{ token: string }>("/auth/login", {
        email,
        password,
        two_factor_code: twoFactorCode,
        device_name: "web",
      });
      setToken(res.token);
      await refresh();
    },
    [refresh],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const res = await api.post<{ token: string }>("/auth/register", input);
      setToken(res.token);
      await refresh();
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore */
    }
    setToken(null);
    setMe(null);
  }, []);

  const hasModule = useCallback(
    (module: ModuleKey) => !!me?.modules?.includes(module),
    [me],
  );

  const can = useCallback(
    (permission: string) =>
      me?.role === "super_admin" || !!me?.permissions?.includes(permission),
    [me],
  );

  const value = useMemo(
    () => ({ me, loading, login, register, logout, refresh, hasModule, can }),
    [me, loading, login, register, logout, refresh, hasModule, can],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}

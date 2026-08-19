import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getToken, setToken, ApiError } from "@/lib/api";

export type AppRole =
  | "super_admin" | "admin" | "ceo" | "manager" | "documentation" | "sales" | "accounts"
  | "warehouse" | "production" | "purchase" | "quality" | "viewer";

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  ceo: "CEO",
  manager: "Manager",
  documentation: "Documentation Executive",
  sales: "Sales Executive",
  accounts: "Accounts",
  warehouse: "Warehouse",
  production: "Production",
  purchase: "Purchase",
  quality: "Quality",
  viewer: "Viewer",
};

export const ANALYTICS_ROLES: AppRole[] = ["super_admin", "admin", "ceo", "manager"];
export const ADMIN_ROLES: AppRole[] = ["super_admin", "admin"];

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  countries: string[];
  roles: AppRole[];
  permissions: string[];
  department?: string;
  active?: boolean;
}

interface AuthCtx {
  user: AuthUser | null;
  roles: AppRole[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  hasRole: (r: AppRole | AppRole[]) => boolean;
  can: (permission: string | string[]) => boolean;
  isAdmin: boolean;
  homePath: string;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function homePathForRole(role?: AppRole) {
  if (role && ANALYTICS_ROLES.includes(role)) return "/";
  return "/applications";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadMe() {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api<{ user: AuthUser }>("/api/auth/me");
      setUser(data.user);
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMe();
  }, []);

  const signIn: AuthCtx["signIn"] = async (email, password) => {
    try {
      const data = await api<{ token: string; user: AuthUser }>("/api/auth/login", {
        method: "POST",
        json: { email, password },
      });
      setToken(data.token);
      setUser(data.user);
      return {};
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Unable to sign in";
      return { error: msg };
    }
  };

  const signOut = async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    setToken(null);
    setUser(null);
  };

  const roles = user?.roles?.length ? user.roles : user?.role ? [user.role] : [];
  const hasRole: AuthCtx["hasRole"] = (r) => {
    const arr = Array.isArray(r) ? r : [r];
    if (roles.includes("super_admin") || roles.includes("admin")) return true;
    return arr.some((x) => roles.includes(x));
  };
  const can: AuthCtx["can"] = (permission) => {
    const need = Array.isArray(permission) ? permission : [permission];
    const have = user?.permissions ?? [];
    if (user?.role === "super_admin") return true;
    return need.some((p) => have.includes(p));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        loading,
        signIn,
        signOut,
        hasRole,
        can,
        isAdmin: roles.some((r) => ADMIN_ROLES.includes(r)),
        homePath: homePathForRole(user?.role),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type AppRole =
  | "super_admin" | "admin" | "documentation" | "sales" | "accounts"
  | "warehouse" | "production" | "purchase" | "quality" | "viewer";

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  documentation: "Documentation Executive",
  sales: "Sales Executive",
  accounts: "Accounts",
  warehouse: "Warehouse",
  production: "Production",
  purchase: "Purchase",
  quality: "Quality",
  viewer: "Viewer",
};

interface AuthCtx {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string, role: AppRole) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  hasRole: (r: AppRole | AppRole[]) => boolean;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s); setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => { void loadRoles(s.user.id); }, 0);
      } else {
        setRoles([]);
      }
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s); setUser(s?.user ?? null);
      if (s?.user) void loadRoles(s.user.id);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadRoles(uid: string) {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
    setRoles((data ?? []).map((r: any) => r.role as AppRole));
  }

  const signIn: AuthCtx["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message };
  };
  const signUp: AuthCtx["signUp"] = async (email, password, fullName, role) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: redirectUrl, data: { full_name: fullName, role } },
    });
    return { error: error?.message };
  };
  const signOut = async () => { await supabase.auth.signOut(); };
  const hasRole: AuthCtx["hasRole"] = (r) => {
    const arr = Array.isArray(r) ? r : [r];
    if (roles.includes("super_admin") || roles.includes("admin")) return true;
    return arr.some((x) => roles.includes(x));
  };

  return (
    <AuthContext.Provider value={{ user, session, roles, loading, signIn, signUp, signOut, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

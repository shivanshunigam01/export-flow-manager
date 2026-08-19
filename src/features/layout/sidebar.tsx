import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FileText, Users, Package, Globe2, Anchor, Ship,
  Building2, FileStack, BellRing, BarChart3, Settings, ShieldCheck,
  ClipboardList, FolderOpen, Factory, ScrollText, Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/auth-context";

const NAV: {
  section: string;
  items: { to: string; label: string; icon: typeof LayoutDashboard; permission?: string }[];
}[] = [
  { section: "Overview", items: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
  ]},
  { section: "Applications", items: [
    { to: "/applications", label: "All Applications", icon: ClipboardList, permission: "applications.view" },
    { to: "/applications/new", label: "New Application", icon: FileText, permission: "applications.create" },
  ]},
  { section: "Documents", items: [
    { to: "/documents", label: "Document Library", icon: FolderOpen, permission: "documents.view" },
    { to: "/documents/templates", label: "Templates", icon: FileStack, permission: "documents.view" },
    { to: "/billing", label: "Billing / Proforma", icon: Wallet, permission: "billing.view" },
  ]},
  { section: "Masters", items: [
    { to: "/masters/customers", label: "Customers", icon: Users, permission: "masters.view" },
    { to: "/masters/suppliers", label: "Suppliers", icon: Factory, permission: "masters.view" },
    { to: "/masters/products", label: "Products", icon: Package, permission: "masters.view" },
    { to: "/masters/countries", label: "Countries", icon: Globe2, permission: "masters.view" },
    { to: "/masters/ports", label: "Ports", icon: Anchor, permission: "masters.view" },
    { to: "/masters/shipping-lines", label: "Shipping Lines", icon: Ship, permission: "masters.view" },
    { to: "/masters/banks", label: "Banks", icon: Building2, permission: "masters.view" },
  ]},
  { section: "Operations", items: [
    { to: "/reports", label: "Reports", icon: BarChart3, permission: "reports.view" },
    { to: "/notifications", label: "Notifications", icon: BellRing, permission: "notifications.view" },
  ]},
  { section: "System", items: [
    { to: "/admin/users", label: "Users & Roles", icon: ShieldCheck, permission: "users.view" },
    { to: "/admin/audit", label: "Audit Logs", icon: ScrollText, permission: "audit_logs.view" },
    { to: "/settings", label: "Settings", icon: Settings, permission: "settings.manage" },
  ]},
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { can, user } = useAuth();

  const visible = NAV.map((sec) => ({
    ...sec,
    items: sec.items.filter((it) => !it.permission || can(it.permission)),
  })).filter((sec) => sec.items.length > 0);

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r bg-sidebar text-sidebar-foreground h-[calc(100vh-96px)] sticky top-24">
      <div className="px-3 py-3 border-b">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Shreehari Export House</div>
        <div className="text-sm font-bold leading-tight mt-0.5">EAMS Portal</div>
        <div className="text-[10px] text-muted-foreground mt-1 truncate">{user?.name}</div>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {visible.map((sec) => (
          <div key={sec.section} className="px-2 pt-3 pb-1">
            <div className="gov-label px-2 mb-1">{sec.section}</div>
            <div className="space-y-0.5">
              {sec.items.map((it) => {
                const active = it.to === "/" ? pathname === "/" : pathname.startsWith(it.to);
                const Icon = it.icon;
                return (
                  <Link
                    key={it.to}
                    to={it.to}
                    className={cn(
                      "flex items-center gap-2 px-2.5 py-1.5 rounded text-sm transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-2 border-primary"
                        : "hover:bg-sidebar-accent/60"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{it.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="px-3 py-2 border-t text-[11px] text-muted-foreground">
        v2.0 · Permission-based access
      </div>
    </aside>
  );
}

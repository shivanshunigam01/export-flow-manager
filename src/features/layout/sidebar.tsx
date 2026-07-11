import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FileText, Users, Package, Globe2, Anchor, Ship,
  Building2, FileStack, BellRing, BarChart3, Settings, ShieldCheck,
  ClipboardList, FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { section: "Overview", items: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
  ]},
  { section: "Applications", items: [
    { to: "/applications", label: "All Applications", icon: ClipboardList },
    { to: "/applications/new", label: "New Application", icon: FileText },
  ]},
  { section: "Documents", items: [
    { to: "/documents", label: "Document Library", icon: FolderOpen },
    { to: "/documents/templates", label: "Templates", icon: FileStack },
  ]},
  { section: "Masters", items: [
    { to: "/masters/customers", label: "Customers", icon: Users },
    { to: "/masters/products", label: "Products", icon: Package },
    { to: "/masters/countries", label: "Countries", icon: Globe2 },
    { to: "/masters/ports", label: "Ports", icon: Anchor },
    { to: "/masters/shipping-lines", label: "Shipping Lines", icon: Ship },
    { to: "/masters/banks", label: "Banks", icon: Building2 },
  ]},
  { section: "Operations", items: [
    { to: "/reports", label: "Reports", icon: BarChart3 },
    { to: "/notifications", label: "Notifications", icon: BellRing },
  ]},
  { section: "System", items: [
    { to: "/admin/users", label: "Users & Roles", icon: ShieldCheck },
    { to: "/settings", label: "Settings", icon: Settings },
  ]},
] as const;

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r bg-sidebar text-sidebar-foreground h-[calc(100vh-96px)] sticky top-24">
      <div className="px-3 py-3 border-b">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Government of Export</div>
        <div className="text-sm font-bold leading-tight mt-0.5">EAMS Portal</div>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV.map((sec) => (
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
        v1.0 · Offline-ready build
      </div>
    </aside>
  );
}

import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FileText, Users, Package, Globe2, Anchor, Ship,
  Building2, FileStack, BellRing, BarChart3, Settings, ShieldCheck,
  ClipboardList, FolderOpen, Factory, ScrollText, Wallet, Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/auth-context";
import { BrandLogo } from "@/features/layout/brand-logo";

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
    { to: "/fx", label: "Exchange rates", icon: Banknote, permission: "fx.manage" },
    { to: "/notifications", label: "Notifications", icon: BellRing, permission: "notifications.view" },
  ]},
  { section: "System", items: [
    { to: "/admin/users", label: "Users & Roles", icon: ShieldCheck, permission: "users.view" },
    { to: "/admin/audit", label: "Audit Logs", icon: ScrollText, permission: "audit_logs.view" },
    { to: "/settings", label: "Settings", icon: Settings, permission: "settings.manage" },
  ]},
];

export function SidebarNav({ mobile = false }: Readonly<{ mobile?: boolean }>) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { can, user } = useAuth();

  const visible = NAV.map((sec) => ({
    ...sec,
    items: sec.items.filter((it) => !it.permission || can(it.permission)),
  })).filter((sec) => sec.items.length > 0);

  return (
    <div className={cn("flex flex-col h-full", mobile && "h-full")}>
      {mobile && (
        <div className="px-4 py-4 border-b border-sidebar-border bg-[#111111]">
          <BrandLogo variant="header" className="scale-90 origin-left" />
          <div className="mt-3 text-[10px] uppercase tracking-[0.18em] text-[#FF7E00] font-semibold">Staff portal</div>
          <div className="text-xs text-white/70 truncate mt-0.5">{user?.name}</div>
        </div>
      )}
      {!mobile && (
        <div className="px-4 py-3.5 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <BrandLogo variant="mark" className="h-8 w-8" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.16em] text-[#FF7E00] font-semibold">EAMS</div>
              <div className="text-xs font-medium truncate">{user?.name}</div>
            </div>
          </div>
        </div>
      )}
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
                      "flex items-center gap-2 px-2.5 py-2 rounded-md text-sm transition-colors",
                      active
                        ? "bg-[#FF7E00]/12 text-[#c45f00] font-medium border-l-[3px] border-[#FF7E00]"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/80",
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", active && "text-[#FF7E00]")} />
                    <span className="truncate">{it.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-sidebar-border text-[11px] text-muted-foreground">
        Shreehari Export House · EAMS
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-[260px] shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground h-[calc(100vh-75px)] sticky top-[75px]">
      <SidebarNav />
    </aside>
  );
}

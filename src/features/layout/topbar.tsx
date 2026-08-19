import { Menu, Search, LogOut, Bell } from "lucide-react";
import { useAuth, ROLE_LABELS } from "@/features/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BrandLogo } from "@/features/layout/brand-logo";
import { SidebarNav } from "@/features/layout/sidebar";

export function TopBar() {
  const { user, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const primaryRole = roles[0];
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api<{ items: any[]; unread: number }>("/api/notifications"),
    refetchInterval: 30000,
  });
  const unread = data?.unread ?? 0;

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-[#111111] text-white">
        <div className="flex items-center justify-between gap-3 px-3 sm:px-5 h-[72px]">
          <div className="flex items-center gap-2 min-w-0">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-white hover:bg-white/10 hover:text-white"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-sidebar [&>button]:text-white [&>button]:right-3 [&>button]:top-3">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <SidebarNav mobile />
              </SheetContent>
            </Sheet>
            <BrandLogo variant="header" />
          </div>

          <div className="hidden md:flex flex-1 max-w-xl mx-4 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/45" />
            <Input
              placeholder="Search applications…"
              className="pl-9 h-10 bg-white/8 border-white/12 text-white placeholder:text-white/40 focus-visible:ring-[#FF7E00]"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const q = (e.target as HTMLInputElement).value;
                  navigate({ to: "/applications", search: { q } as any });
                }
              }}
            />
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-white hover:bg-white/10 hover:text-white"
              onClick={() => navigate({ to: "/notifications" })}
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#FF7E00] ring-2 ring-[#111111]" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 h-10 px-2 text-white hover:bg-white/10 hover:text-white">
                  <div className="w-8 h-8 rounded-full bg-[#FF7E00] text-black grid place-items-center font-semibold text-xs">
                    {(user?.name || user?.email || "S").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="text-left leading-tight hidden sm:block">
                    <div className="text-xs font-medium">{user?.name || user?.email?.split("@")[0]}</div>
                    <div className="text-[10px] text-white/55 uppercase tracking-wide">
                      {primaryRole ? ROLE_LABELS[primaryRole] : "—"}
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="text-xs">{user?.email}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Roles: {roles.map((r) => ROLE_LABELS[r]).join(", ") || "none"}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    navigate({ to: "/auth" });
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="h-[3px] bg-gradient-to-r from-[#3C3C3B] via-[#FF7E00] to-[#3C3C3B]" />
      </div>
    </header>
  );
}

import { Search, User2, LogOut, Bell } from "lucide-react";
import { useAuth, ROLE_LABELS } from "@/features/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

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
    <header className="sticky top-0 z-40 bg-background">
      <div className="bg-gov-header text-white">
        <div className="flex items-center justify-between px-4 py-1.5 text-[11px]">
          <div className="flex items-center gap-3">
            <span className="opacity-90">🇮🇳 Shree Hari Export House · Export Documentation Wing</span>
          </div>
          <div className="flex items-center gap-4 opacity-90">
            <span>Internal staff portal</span>
            <span>English</span>
          </div>
        </div>
        <div className="h-1 bg-gov-strip" />
      </div>

      <div className="border-b bg-background">
        <div className="flex items-center gap-4 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-primary text-primary-foreground grid place-items-center font-bold text-sm shrink-0">EA</div>
            <div className="leading-tight">
              <div className="font-serif text-[15px] font-bold">Shreehari Export House</div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider">Export Application Management System</div>
            </div>
          </div>

          <div className="flex-1 max-w-xl mx-auto relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search applications…"
              className="pl-9 h-9"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const q = (e.target as HTMLInputElement).value;
                  navigate({ to: "/applications", search: { q } as any });
                }
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate({ to: "/notifications" })}>
              <Bell className="h-4 w-4" />
              {unread > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 h-9">
                  <div className="w-7 h-7 rounded-full bg-accent grid place-items-center">
                    <User2 className="h-4 w-4" />
                  </div>
                  <div className="text-left leading-tight hidden sm:block">
                    <div className="text-xs font-medium">{user?.name || user?.email?.split("@")[0]}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">{primaryRole ? ROLE_LABELS[primaryRole] : "—"}</div>
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
                <DropdownMenuItem onClick={async () => { await signOut(); navigate({ to: "/auth" }); }}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

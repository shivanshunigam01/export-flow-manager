import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api<{ items: any[]; unread: number }>("/api/notifications"),
  });
  const items = data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-xl font-serif font-bold">Notifications</h1>
          <p className="text-xs text-muted-foreground">{data?.unread ?? 0} unread</p>
        </div>
        <Button variant="outline" size="sm" onClick={async () => { await api("/api/notifications/read-all", { method: "POST" }); qc.invalidateQueries({ queryKey: ["notifications"] }); }}>Mark all as read</Button>
      </div>
      <div className="gov-panel">
        <div className="gov-panel-header"><span>Inbox</span><Bell className="h-4 w-4 text-muted-foreground" /></div>
        {isLoading && <div className="p-6 text-sm text-muted-foreground">Loading…</div>}
        {!isLoading && !items.length && <div className="p-8 text-center text-sm text-muted-foreground">No notifications yet.</div>}
        <ul className="divide-y">
          {items.map((n: any) => (
            <li key={n.id} className="px-4 py-3 cursor-pointer" onClick={() => api(`/api/notifications/${n.id}/read`, { method: "PATCH" }).then(() => qc.invalidateQueries({ queryKey: ["notifications"] }))}>
              <div className="text-sm font-medium">{n.title} {!(n.read || n.isRead) && <span className="text-[10px] text-primary">NEW</span>}</div>
              <div className="text-xs text-muted-foreground">{n.message || n.body}</div>
              {n.created_at && <div className="text-[10px] text-muted-foreground mt-1">{format(new Date(n.created_at), "dd MMM yyyy · HH:mm")}</div>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

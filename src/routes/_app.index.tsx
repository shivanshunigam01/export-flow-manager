import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ANALYTICS_ROLES, useAuth } from "@/features/auth/auth-context";
import { FileText, CheckCircle2, XCircle, Clock, Ship, FileWarning, Bell } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/_app/")({
  component: Dashboard,
});

function Stat({ label, value, icon: Icon, tone = "primary" }: any) {
  const tones: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    danger: "bg-destructive/10 text-destructive",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <div className="gov-panel p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded grid place-items-center ${tones[tone]}`}><Icon className="h-5 w-5" /></div>
      <div className="min-w-0">
        <div className="gov-label">{label}</div>
        <div className="text-2xl font-semibold tabular-nums">{value ?? "—"}</div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user, roles, can } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const role = user?.role;
    if (role && !ANALYTICS_ROLES.includes(role) && !roles.some((r) => ANALYTICS_ROLES.includes(r))) {
      navigate({ to: "/applications" });
    }
  }, [user, roles, navigate]);

  const { data: summary } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => api<any>("/api/dashboard/summary"),
    enabled: can("dashboard.view"),
  });
  const { data: recent } = useQuery({
    queryKey: ["dashboard-recent"],
    queryFn: () => api<any[]>("/api/dashboard/recent-applications"),
    enabled: can("dashboard.view"),
  });
  const { data: pending } = useQuery({
    queryKey: ["dashboard-pending"],
    queryFn: () => api<any[]>("/api/dashboard/pending-approvals"),
    enabled: can("applications.approve"),
  });
  const { data: notes } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api<{ items: any[]; unread: number }>("/api/notifications"),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-serif font-bold">Dashboard</h1>
          <p className="text-xs text-muted-foreground">Live counts from the export application database</p>
        </div>
        {can("applications.create") && (
          <Link to="/applications/new" className="inline-flex items-center gap-2 rounded bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90">
            <FileText className="h-4 w-4" /> New Application
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total Applications" value={summary?.total ?? 0} icon={FileText} />
        <Stat label="Draft" value={summary?.draft ?? 0} icon={FileWarning} tone="muted" />
        <Stat label="Pending Approval" value={summary?.pending ?? 0} icon={Clock} tone="warning" />
        <Stat label="Changes Required" value={summary?.changesRequired ?? 0} icon={FileWarning} tone="warning" />
        <Stat label="Approved" value={summary?.approved ?? 0} icon={CheckCircle2} tone="success" />
        <Stat label="In Progress" value={summary?.inProgress ?? 0} icon={Ship} />
        <Stat label="Dispatched" value={summary?.dispatched ?? 0} icon={Ship} />
        <Stat label="Rejected" value={summary?.rejected ?? 0} icon={XCircle} tone="danger" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 gov-panel">
          <div className="gov-panel-header">
            <span>Recent Applications</span>
            <Link to="/applications" className="text-primary text-xs font-medium hover:underline">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>App No</th>
                  <th>Invoice</th>
                  <th>Consignee</th>
                  <th>Destination</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(recent ?? []).map((a: any) => (
                  <tr key={a.id}>
                    <td className="font-mono text-primary"><Link to="/applications/$id" params={{ id: a.id }} className="hover:underline">{a.app_no}</Link></td>
                    <td>{a.invoice_no ?? "—"}</td>
                    <td>{a.consignee_name ?? "—"}</td>
                    <td>{a.final_destination_text ?? "—"}</td>
                    <td><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
                {!recent?.length && <tr><td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">No applications yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-4">
          <div className="gov-panel">
            <div className="gov-panel-header"><span>Pending Approvals</span></div>
            <div className="p-3 text-sm">
              {(pending ?? []).slice(0, 6).map((a: any) => (
                <Link key={a.id} to="/applications/$id" params={{ id: a.id }} className="flex justify-between py-1.5 border-b last:border-0 hover:text-primary">
                  <span className="font-mono text-xs">{a.app_no}</span>
                  <span className="text-xs">{a.consignee_name}</span>
                </Link>
              ))}
              {!pending?.length && <div className="text-muted-foreground">Nothing waiting</div>}
            </div>
          </div>
          <div className="gov-panel">
            <div className="gov-panel-header"><span>Notifications</span><Bell className="h-4 w-4 text-muted-foreground" /></div>
            <div className="p-3 text-sm">
              {(notes?.items ?? []).slice(0, 5).map((n: any) => (
                <div key={n.id} className="py-1.5 border-b last:border-0">
                  <div className="text-xs font-medium">{n.title}</div>
                  <div className="text-[11px] text-muted-foreground">{n.message || n.body}</div>
                </div>
              ))}
              {!notes?.items?.length && <div className="text-muted-foreground">No notifications</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const key = String(status || "").toLowerCase();
  const map: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    submitted: "bg-primary/10 text-primary",
    under_review: "bg-warning/15 text-warning-foreground",
    changes_required: "bg-warning/15 text-warning-foreground",
    approved: "bg-success/10 text-success",
    in_progress: "bg-primary/10 text-primary",
    ready_for_dispatch: "bg-primary/15 text-primary",
    dispatched: "bg-primary/15 text-primary",
    completed: "bg-success/10 text-success",
    rejected: "bg-destructive/10 text-destructive",
    cancelled: "bg-muted text-muted-foreground",
  };
  return <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${map[key] ?? "bg-muted"}`}>{String(status || "").replaceAll("_", " ")}</span>;
}

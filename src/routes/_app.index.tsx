import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, CheckCircle2, XCircle, Clock, Ship, FileWarning, DollarSign, Container, Bell } from "lucide-react";
import { format } from "date-fns";

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
  const { data: apps } = useQuery({
    queryKey: ["dashboard-apps"],
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("id,app_no,status,current_stage,invoice_no,invoice_date,consignee_name,final_destination_text,total_amount,created_at").order("created_at", { ascending: false }).limit(10);
      if (error) throw error;
      return data;
    },
  });

  const counts = {
    total: apps?.length ?? 0,
    pending: apps?.filter((a: any) => a.status === "pending_approval").length ?? 0,
    approved: apps?.filter((a: any) => a.status === "approved").length ?? 0,
    rejected: apps?.filter((a: any) => a.status === "rejected").length ?? 0,
    shipped: apps?.filter((a: any) => a.status === "shipped").length ?? 0,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-serif font-bold">Dashboard</h1>
          <p className="text-xs text-muted-foreground">Overview of export applications and workflow status</p>
        </div>
        <Link to="/applications/new" className="inline-flex items-center gap-2 rounded bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90">
          <FileText className="h-4 w-4" /> New Application
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-3">
        <Stat label="Total Applications" value={counts.total} icon={FileText} tone="primary" />
        <Stat label="Pending Approval" value={counts.pending} icon={Clock} tone="warning" />
        <Stat label="Approved" value={counts.approved} icon={CheckCircle2} tone="success" />
        <Stat label="Rejected" value={counts.rejected} icon={XCircle} tone="danger" />
        <Stat label="Shipment Ready" value={counts.shipped} icon={Ship} tone="primary" />
        <Stat label="Documents Pending" value={0} icon={FileWarning} tone="warning" />
        <Stat label="Payments Pending" value={0} icon={DollarSign} tone="warning" />
        <Stat label="Containers Ready" value={0} icon={Container} tone="muted" />
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
                  <th>Stage</th>
                  <th>Status</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(apps ?? []).map((a: any) => (
                  <tr key={a.id}>
                    <td className="font-mono text-primary"><Link to="/applications/$id" params={{ id: a.id }} className="hover:underline">{a.app_no}</Link></td>
                    <td>{a.invoice_no ?? "—"}</td>
                    <td className="truncate max-w-[180px]">{a.consignee_name ?? "—"}</td>
                    <td>{a.final_destination_text ?? "—"}</td>
                    <td><span className="text-xs">{a.current_stage}</span></td>
                    <td><StatusBadge status={a.status} /></td>
                    <td className="text-right tabular-nums">{a.total_amount ? Number(a.total_amount).toLocaleString() : "—"}</td>
                  </tr>
                ))}
                {!apps?.length && (
                  <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">No applications yet. Create your first one.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="gov-panel">
            <div className="gov-panel-header"><span>Notifications</span><Bell className="h-4 w-4 text-muted-foreground" /></div>
            <div className="p-3 text-sm text-muted-foreground">No notifications</div>
          </div>
          <div className="gov-panel">
            <div className="gov-panel-header"><span>Today's Tasks</span></div>
            <div className="p-3 text-sm text-muted-foreground">No pending tasks</div>
          </div>
          <div className="gov-panel">
            <div className="gov-panel-header"><span>Upcoming Shipments</span></div>
            <div className="p-3 text-sm">
              {apps?.filter((a: any) => a.status !== "shipped" && a.status !== "closed").slice(0, 4).map((a: any) => (
                <div key={a.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                  <span className="font-mono text-xs">{a.app_no}</span>
                  <span className="text-xs text-muted-foreground">{a.invoice_date ? format(new Date(a.invoice_date), "dd MMM yyyy") : "—"}</span>
                </div>
              )) ?? null}
              {!apps?.length && <div className="text-muted-foreground">Nothing scheduled</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    in_progress: "bg-primary/10 text-primary",
    pending_approval: "bg-warning/15 text-warning-foreground",
    approved: "bg-success/10 text-success",
    rejected: "bg-destructive/10 text-destructive",
    shipped: "bg-primary/15 text-primary",
    closed: "bg-muted text-muted-foreground",
  };
  return <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${map[status] ?? "bg-muted"}`}>{status?.replace("_", " ")}</span>;
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { StatusBadge } from "./_app.index";
import { useAuth } from "@/features/auth/auth-context";

export const Route = createFileRoute("/_app/applications/")({
  component: ApplicationsList,
});

function ApplicationsList() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [view, setView] = useState<"all" | "mine" | "pending" | "drafts">("all");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { can } = useAuth();

  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (q) params.set("search", q);
  if (status) params.set("status", status);
  if (view === "mine") params.set("mine", "1");
  if (view === "pending") params.set("pending", "1");
  if (view === "drafts") params.set("drafts", "1");

  const { data, isLoading } = useQuery({
    queryKey: ["applications-list", q, status, view, page],
    queryFn: () => api<{ items: any[]; total: number; page: number }>(`/api/applications?${params.toString()}`),
  });

  const rows = data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-serif font-bold">Applications</h1>
          <p className="text-xs text-muted-foreground">Every export shipment is treated as an application</p>
        </div>
        {can("applications.create") && (
          <Button onClick={() => navigate({ to: "/applications/new" })}>
            <Plus className="h-4 w-4 mr-2" /> New Application
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "mine", "drafts", "pending"] as const).map((v) => (
          <Button key={v} size="sm" variant={view === v ? "default" : "outline"} onClick={() => { setView(v); setPage(1); }}>
            {v === "all" ? "All" : v === "mine" ? "My Applications" : v === "drafts" ? "Drafts" : "Pending Approval"}
          </Button>
        ))}
      </div>

      <div className="gov-panel">
        <div className="gov-panel-header gap-2">
          <span>Applications ({data?.total ?? 0})</span>
          <div className="flex gap-2">
            <select className="h-8 text-xs border rounded px-2" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All statuses</option>
              {["DRAFT","SUBMITTED","UNDER_REVIEW","CHANGES_REQUIRED","APPROVED","IN_PROGRESS","DISPATCHED","COMPLETED","REJECTED"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div className="relative w-64">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="pl-8 h-8 text-sm" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th>App No</th>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Country</th>
                <th>Created By</th>
                <th>Stage</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">Loading…</td></tr>}
              {!isLoading && rows.map((a: any) => (
                <tr key={a.id} className="cursor-pointer" onClick={() => navigate({ to: "/applications/$id", params: { id: a.id } })}>
                  <td className="font-mono text-primary">{a.app_no}</td>
                  <td>{a.invoice_no ?? "—"}</td>
                  <td>{a.consignee_name ?? "—"}</td>
                  <td>{a.final_destination_text ?? "—"}</td>
                  <td className="text-xs">{a.created_by_name ?? "—"}</td>
                  <td className="text-xs">{a.current_stage}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td className="text-xs">{a.updated_at ? format(new Date(a.updated_at), "dd MMM yyyy") : "—"}</td>
                </tr>
              ))}
              {!isLoading && !rows.length && (
                <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">No applications</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-2 flex justify-end gap-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <Button size="sm" variant="outline" onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}

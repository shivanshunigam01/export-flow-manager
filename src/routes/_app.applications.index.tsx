import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { StatusBadge } from "./_app.index";

export const Route = createFileRoute("/_app/applications/")({
  component: ApplicationsList,
});

function ApplicationsList() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["applications-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("id,app_no,status,current_stage,invoice_no,invoice_date,consignee_name,final_destination_text,total_amount,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = (data ?? []).filter((a: any) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      a.app_no?.toLowerCase().includes(s) ||
      a.invoice_no?.toLowerCase().includes(s) ||
      a.consignee_name?.toLowerCase().includes(s) ||
      a.final_destination_text?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-serif font-bold">Applications</h1>
          <p className="text-xs text-muted-foreground">Every export shipment is treated as an application</p>
        </div>
        <Button onClick={() => navigate({ to: "/applications/new" })}>
          <Plus className="h-4 w-4 mr-2" /> New Application
        </Button>
      </div>

      <div className="gov-panel">
        <div className="gov-panel-header">
          <span>All Applications ({filtered.length})</span>
          <div className="relative w-72">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by app no, invoice, consignee…" className="pl-8 h-8 text-sm" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th>App No</th>
                <th>Invoice No</th>
                <th>Date</th>
                <th>Consignee</th>
                <th>Destination</th>
                <th>Current Stage</th>
                <th>Status</th>
                <th className="text-right">Amount</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={9} className="text-center py-10 text-muted-foreground">Loading…</td></tr>}
              {!isLoading && filtered.map((a: any) => (
                <tr key={a.id} className="cursor-pointer" onClick={() => navigate({ to: "/applications/$id", params: { id: a.id } })}>
                  <td className="font-mono text-primary">{a.app_no}</td>
                  <td>{a.invoice_no ?? "—"}</td>
                  <td>{a.invoice_date ? format(new Date(a.invoice_date), "dd MMM yyyy") : "—"}</td>
                  <td className="max-w-[220px] truncate">{a.consignee_name ?? "—"}</td>
                  <td>{a.final_destination_text ?? "—"}</td>
                  <td className="text-xs">{a.current_stage}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td className="text-right tabular-nums">{a.total_amount ? Number(a.total_amount).toLocaleString() : "—"}</td>
                  <td className="text-xs text-muted-foreground">{format(new Date(a.created_at), "dd MMM")}</td>
                </tr>
              ))}
              {!isLoading && !filtered.length && (
                <tr><td colSpan={9} className="text-center py-12 text-muted-foreground text-sm">
                  No applications found. <Link to="/applications/new" className="text-primary underline">Create the first one →</Link>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

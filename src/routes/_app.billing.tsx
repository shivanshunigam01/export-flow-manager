import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, downloadBilling } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/auth-context";
import { Download } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app/billing")({
  component: BillingPage,
});

function BillingPage() {
  const { can } = useAuth();
  const qc = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["billing"],
    queryFn: () => api<any[]>("/api/billing"),
    enabled: can("billing.view"),
  });

  async function create() {
    try {
      await api("/api/billing", { method: "POST", json: { document_type: "proforma", status: "DRAFT", currency: "USD" } });
      toast.success("Proforma record created");
      qc.invalidateQueries({ queryKey: ["billing"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function download(row: any) {
    setBusyId(row.id);
    try {
      await downloadBilling(row.id, `${row.billing_no || "bill"}.pdf`);
    } catch (e: any) {
      toast.error(e.message ?? "Download failed");
    } finally {
      setBusyId(null);
    }
  }

  if (!can("billing.view")) return <div className="p-8 text-sm">No access.</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div>
          <h1 className="text-xl font-serif font-bold">Billing / Proforma</h1>
          <p className="text-xs text-muted-foreground">Download the official PI or invoice PDF for each bill. Generate from the application if a file is not ready yet.</p>
        </div>
        {can("billing.create") && <Button onClick={create}>New record</Button>}
      </div>
      <div className="gov-panel overflow-x-auto">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Number</th>
              <th>Type</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Application</th>
              <th className="text-right">PDF</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="text-center py-8">Loading…</td></tr>}
            {(data ?? []).map((b) => (
              <tr key={b.id}>
                <td className="font-mono">{b.billing_no}</td>
                <td>{b.document_type}</td>
                <td>{b.status}</td>
                <td>{b.amount} {b.currency}</td>
                <td>
                  {b.application_id ? (
                    <Link to="/applications/$id" params={{ id: b.application_id }} className="text-primary text-xs underline">
                      Open
                    </Link>
                  ) : "—"}
                </td>
                <td className="text-right">
                  <Button size="sm" variant="outline" disabled={busyId === b.id} onClick={() => void download(b)}>
                    <Download className="h-3.5 w-3.5 mr-1" />
                    {busyId === b.id ? "…" : "Download"}
                  </Button>
                </td>
              </tr>
            ))}
            {!isLoading && !data?.length && <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No billing records</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

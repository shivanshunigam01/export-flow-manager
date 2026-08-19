import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/auth-context";

export const Route = createFileRoute("/_app/billing")({
  component: BillingPage,
});

function BillingPage() {
  const { can } = useAuth();
  const qc = useQueryClient();
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

  if (!can("billing.view")) return <div className="p-8 text-sm">No access.</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div>
          <h1 className="text-xl font-serif font-bold">Billing / Proforma</h1>
          <p className="text-xs text-muted-foreground">Internal billing records. Official PI PDFs are generated from the application screen.</p>
        </div>
        {can("billing.create") && <Button onClick={create}>New record</Button>}
      </div>
      <div className="gov-panel overflow-x-auto">
        <table className="gov-table">
          <thead><tr><th>Number</th><th>Type</th><th>Status</th><th>Amount</th><th>Application</th></tr></thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="text-center py-8">Loading…</td></tr>}
            {(data ?? []).map((b) => (
              <tr key={b.id}>
                <td className="font-mono">{b.billing_no}</td>
                <td>{b.document_type}</td>
                <td>{b.status}</td>
                <td>{b.amount} {b.currency}</td>
                <td>{b.application_id || "—"}</td>
              </tr>
            ))}
            {!isLoading && !data?.length && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No billing records</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

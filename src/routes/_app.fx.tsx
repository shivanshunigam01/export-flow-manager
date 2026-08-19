import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/features/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/fx")({
  component: FxPage,
});

function mondayOf(d = new Date()) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  return x.toISOString().slice(0, 10);
}

function FxPage() {
  const { can } = useAuth();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["fx-rates"],
    queryFn: () => api<{ items: any[]; latest?: any }>("/api/fx-rates"),
  });
  const [week, setWeek] = useState(mondayOf());
  const [rate, setRate] = useState("");
  const [note, setNote] = useState("");

  if (!can("fx.manage") && !can("applications.view")) return <div className="p-8 text-sm">No access.</div>;

  async function save() {
    try {
      await api("/api/fx-rates", { method: "POST", json: { week_start: week, usd_inr: Number(rate), note } });
      toast.success("Weekly USD→INR rate saved — applies to all new PI / invoices");
      setRate("");
      qc.invalidateQueries({ queryKey: ["fx-rates"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-serif font-bold">Exchange rates</h1>
        <p className="text-xs text-muted-foreground">Set the weekly USD → INR rate. Applications pick up the latest rate; INR invoice total must match FX × rate within ₹1.</p>
      </div>
      {data?.latest && (
        <div className="gov-panel p-4 text-sm">
          Current rate: <b>1 USD = ₹ {data.latest.usd_inr}</b> (week of {data.latest.week_start})
        </div>
      )}
      {can("fx.manage") && (
        <div className="gov-panel p-4 grid md:grid-cols-4 gap-3">
          <div>
            <Label className="gov-label">Week start</Label>
            <Input className="mt-1" type="date" value={week} onChange={(e) => setWeek(e.target.value)} />
          </div>
          <div>
            <Label className="gov-label">USD → INR</Label>
            <Input className="mt-1" type="number" step="0.0001" value={rate} onChange={(e) => setRate(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label className="gov-label">Note</Label>
            <Input className="mt-1" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="md:col-span-4">
            <Button onClick={save} disabled={!rate}>Save this week’s rate</Button>
          </div>
        </div>
      )}
      <div className="gov-panel overflow-x-auto">
        <table className="gov-table">
          <thead><tr><th>Week</th><th>USD→INR</th><th>Set by</th><th>Note</th></tr></thead>
          <tbody>
            {(data?.items ?? []).map((r: any) => (
              <tr key={r.id}>
                <td>{r.week_start}</td>
                <td className="tabular-nums">{r.usd_inr}</td>
                <td className="text-xs">{r.created_by_name || "—"}</td>
                <td className="text-xs">{r.note || "—"}</td>
              </tr>
            ))}
            {!data?.items?.length && <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">No rates yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

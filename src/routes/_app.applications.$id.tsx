import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ApplicationForm } from "@/features/applications/application-form";
import { StatusBadge } from "./_app.index";
import { format } from "date-fns";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ApplicationForm as AppFormType } from "@/features/applications/schema";

export const Route = createFileRoute("/_app/applications/$id")({
  component: AppDetail,
});

function AppDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["app", id],
    queryFn: async () => {
      const [appRes, contRes, itemRes, stagesRes] = await Promise.all([
        supabase.from("applications").select("*").eq("id", id).single(),
        supabase.from("application_containers").select("*").eq("application_id", id).order("seq"),
        supabase.from("application_items").select("*").eq("application_id", id).order("seq"),
        supabase.from("application_stages").select("*").eq("application_id", id).order("seq"),
      ]);
      if (appRes.error) throw appRes.error;
      return {
        app: appRes.data,
        containers: contRes.data ?? [],
        items: itemRes.data ?? [],
        stages: stagesRes.data ?? [],
      };
    },
  });

  if (isLoading || !data) return <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>;
  const { app, containers, items, stages } = data;
  const meta: any = app.meta ?? {};

  const initial: Partial<AppFormType> = {
    ...(app as any),
    invoice_date: app.invoice_date ?? "",
    loading_charge: Number(app.loading_charge ?? 0),
    bank_name: meta.bank_name ?? "",
    bank_account: meta.bank_account ?? "",
    bank_swift: meta.bank_swift ?? "",
    bank_ifsc: meta.bank_ifsc ?? "",
    containers: containers.map((c: any) => ({
      container_no: c.container_no ?? "", line_seal_no: c.line_seal_no ?? "",
      electronic_seal_no: c.electronic_seal_no ?? "", size: c.size ?? "20 FT", quantity: c.quantity ?? "1x20 FT",
    })),
    items: items.map((it: any) => ({
      packages: it.packages, description: it.description ?? "", quantity: it.quantity,
      unit: it.unit ?? "SQM", rate: it.rate, amount: it.amount, net_weight: it.net_weight, gross_weight: it.gross_weight,
    })),
  };

  async function save(form: AppFormType) {
    const totalAmount = (form.items ?? []).reduce((s, it) => s + (Number(it.amount) || 0), 0) + (Number(form.loading_charge) || 0);
    const totalPackages = (form.items ?? []).reduce((s, it) => s + (Number(it.packages) || 0), 0);
    const { error } = await supabase.from("applications").update({
      exporter_name: form.exporter_name, exporter_address: form.exporter_address,
      iec_no: form.iec_no, gst_no: form.gst_no, bin_no: form.bin_no,
      state_of_origin: form.state_of_origin, lut_no: form.lut_no,
      invoice_no: form.invoice_no, invoice_date: form.invoice_date || null, invoice_currency: form.invoice_currency,
      consignee_name: form.consignee_name, consignee_address: form.consignee_address,
      notify_party: form.notify_party, second_notify: form.second_notify, third_party: form.third_party,
      port_loading_text: form.port_loading_text, port_discharge_text: form.port_discharge_text,
      country_origin: form.country_origin, final_destination_text: form.final_destination_text,
      payment_terms: form.payment_terms, export_terms: form.export_terms,
      hsn_codes: form.hsn_codes, products_desc: form.products_desc,
      loading_charge: form.loading_charge, amount_in_words: form.amount_in_words, declaration: form.declaration,
      total_packages: totalPackages, total_amount: totalAmount,
      meta: { bank_name: form.bank_name, bank_account: form.bank_account, bank_swift: form.bank_swift, bank_ifsc: form.bank_ifsc },
    }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    // replace containers & items
    await supabase.from("application_containers").delete().eq("application_id", id);
    if (form.containers?.length) await supabase.from("application_containers").insert(form.containers.map((c, i) => ({ ...c, application_id: id, seq: i })));
    await supabase.from("application_items").delete().eq("application_id", id);
    if (form.items?.length) await supabase.from("application_items").insert(form.items.map((it, i) => ({ ...it, application_id: id, seq: i })));
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["app", id] });
  }

  async function approveStage(stageId: string) {
    const comment = window.prompt("Approval comment (required):") ?? "";
    if (!comment.trim()) { toast.error("Comment mandatory"); return; }
    const { error } = await supabase.from("application_stages")
      .update({ status: "completed", comment, acted_at: new Date().toISOString() })
      .eq("id", stageId);
    if (error) { toast.error(error.message); return; }
    toast.success("Stage approved");
    qc.invalidateQueries({ queryKey: ["app", id] });
  }

  return (
    <div className="space-y-4">
      <div className="gov-panel">
        <div className="p-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-xl font-bold">{app.app_no}</h1>
              <StatusBadge status={app.status} />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Created {format(new Date(app.created_at), "dd MMM yyyy · HH:mm")} · Stage: <span className="font-medium">{app.current_stage}</span>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate({ to: "/applications" })}>← Back to list</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="xl:col-span-3">
          <ApplicationForm appNo={app.app_no} initialValues={initial} onSubmit={save} />
        </div>

        <aside className="gov-panel h-fit sticky top-[120px]">
          <div className="gov-panel-header"><span>Application Timeline</span></div>
          <ol className="p-3 space-y-2">
            {stages.map((s: any) => {
              const Icon = s.status === "completed" ? CheckCircle2 : s.status === "in_progress" ? Clock : Circle;
              const color = s.status === "completed" ? "text-success" : s.status === "in_progress" ? "text-primary" : "text-muted-foreground";
              return (
                <li key={s.id} className="flex items-start gap-2 group">
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium">{s.stage_label}</div>
                    {s.comment && <div className="text-[10px] text-muted-foreground truncate">{s.comment}</div>}
                    {s.acted_at && <div className="text-[10px] text-muted-foreground">{format(new Date(s.acted_at), "dd MMM · HH:mm")}</div>}
                    {s.status === "pending" && (
                      <button onClick={() => approveStage(s.id)} className="text-[10px] text-primary hover:underline mt-0.5">Approve →</button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </aside>
      </div>
    </div>
  );
}

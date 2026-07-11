import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ApplicationForm } from "@/features/applications/application-form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth/auth-context";
import { toast } from "sonner";
import { useState } from "react";
import type { ApplicationForm as AppFormType } from "@/features/applications/schema";

export const Route = createFileRoute("/_app/applications/new")({
  component: NewApp,
});

function NewApp() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  async function submit(data: AppFormType) {
    if (!user) { toast.error("Not authenticated"); return; }
    setBusy(true);
    try {
      const { data: appNoRow } = await supabase.rpc("generate_app_no");
      const appNo = appNoRow ?? `EXP-${new Date().getFullYear()}-${Math.floor(Math.random() * 9999).toString().padStart(4, "0")}`;

      const totalAmount = (data.items ?? []).reduce((s, it) => s + (Number(it.amount) || 0), 0) + (Number(data.loading_charge) || 0);
      const totalPackages = (data.items ?? []).reduce((s, it) => s + (Number(it.packages) || 0), 0);

      const { data: inserted, error } = await supabase.from("applications").insert({
        app_no: appNo,
        status: "in_progress",
        current_stage: "commercial_invoice",
        exporter_name: data.exporter_name,
        exporter_address: data.exporter_address,
        iec_no: data.iec_no,
        gst_no: data.gst_no,
        bin_no: data.bin_no,
        state_of_origin: data.state_of_origin,
        lut_no: data.lut_no,
        invoice_no: data.invoice_no,
        invoice_date: data.invoice_date || null,
        invoice_currency: data.invoice_currency,
        consignee_name: data.consignee_name,
        consignee_address: data.consignee_address,
        notify_party: data.notify_party,
        second_notify: data.second_notify,
        third_party: data.third_party,
        port_loading_text: data.port_loading_text,
        port_discharge_text: data.port_discharge_text,
        country_origin: data.country_origin,
        final_destination_text: data.final_destination_text,
        payment_terms: data.payment_terms,
        export_terms: data.export_terms,
        hsn_codes: data.hsn_codes,
        products_desc: data.products_desc,
        loading_charge: data.loading_charge,
        amount_in_words: data.amount_in_words,
        declaration: data.declaration,
        total_packages: totalPackages,
        total_amount: totalAmount,
        created_by: user.id,
        meta: {
          bank_name: data.bank_name,
          bank_account: data.bank_account,
          bank_swift: data.bank_swift,
          bank_ifsc: data.bank_ifsc,
        },
      }).select("id, app_no").single();

      if (error) throw error;

      // Insert containers & items
      if (data.containers?.length) {
        await supabase.from("application_containers").insert(
          data.containers.map((c, i) => ({ ...c, application_id: inserted.id, seq: i }))
        );
      }
      if (data.items?.length) {
        await supabase.from("application_items").insert(
          data.items.map((it, i) => ({
            application_id: inserted.id,
            packages: it.packages,
            description: it.description,
            quantity: it.quantity,
            unit: it.unit,
            rate: it.rate,
            amount: it.amount,
            net_weight: it.net_weight,
            gross_weight: it.gross_weight,
            seq: i,
          }))
        );
      }

      toast.success(`Application ${inserted.app_no} created`);
      navigate({ to: "/applications/$id", params: { id: inserted.id } });
    } catch (e: any) {
      console.error(e);
      toast.error(e.message ?? "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-serif font-bold">New Export Application</h1>
        <p className="text-xs text-muted-foreground">Fill in every section — the same data drives the printable Invoice, Packing List and Annexure.</p>
      </div>
      <ApplicationForm onSubmit={submit} submitting={busy} />
    </div>
  );
}

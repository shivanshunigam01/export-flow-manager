import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, downloadDocument } from "@/lib/api";
import { ApplicationForm } from "@/features/applications/application-form";
import { applicationPayload, emptyApplication, type ApplicationForm as AppFormType } from "@/features/applications/schema";
import { StatusBadge } from "./_app.index";
import { format } from "date-fns";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-context";
import { ApplicationStepper } from "@/features/applications/application-stepper";

export const Route = createFileRoute("/_app/applications/$id")({
  component: AppDetail,
});

function AppDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { can, user } = useAuth();
  const [focusStep, setFocusStep] = useState<number | undefined>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["app", id],
    queryFn: () =>
      api<{ app: any; containers: any[]; items: any[]; stages: any[]; packing_lines: any[]; history: any[]; documents: any[] }>(`/api/applications/${id}`),
  });

  if (isLoading) return <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>;
  if (error || !data) return <div className="p-8 text-center text-sm text-destructive">Unable to load this application.</div>;
  const { app, containers, items, stages, packing_lines, history, documents } = data;

  const initial: Partial<AppFormType> = {
    ...emptyApplication(),
    ...(app as any),
    invoice_date: app.invoice_date ?? "",
    loading_charge: Number(app.loading_charge ?? 0),
    bank_name: app.bank_name || app.meta?.bank_name || "",
    bank_account: app.bank_account || app.meta?.bank_account || "",
    bank_swift: app.bank_swift || app.meta?.bank_swift || "",
    bank_ifsc: app.bank_ifsc || app.meta?.bank_ifsc || "",
    containers: (containers ?? []).length ? containers : emptyApplication().containers,
    items: (items ?? []).length ? items : emptyApplication().items,
    packing_lines: packing_lines ?? [],
    gst_bills: app.gst_bills ?? [],
  };

  async function save(form: AppFormType) {
    try {
      await api(`/api/applications/${id}`, { method: "PATCH", json: applicationPayload(form, { version: app.version }) });
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["app", id] });
    } catch (e: any) {
      toast.error(e.message ?? "Save failed");
    }
  }

  async function action(path: string, body?: any, okMsg?: string) {
    try {
      await api(`/api/applications/${id}${path}`, { method: "POST", json: body ?? {} });
      toast.success(okMsg || "Done");
      qc.invalidateQueries({ queryKey: ["app", id] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    }
  }

  async function generate(type: string) {
    if (type === "proforma" || type === "invoice" || type === "inr_invoice") {
      const missing = (items ?? []).filter((it: any) => String(it.description || "").trim() && !String(it.image_url || "").trim());
      if (missing.length) {
        setFocusStep(3);
        toast.error("Upload a product image on every PI / invoice line, then Save, then generate.");
        return;
      }
    }
    try {
      const doc = await api<any>(`/api/applications/${id}/documents/generate`, {
        method: "POST",
        json: { type },
      });
      const files = doc.items?.length ? doc.items : [doc];
      toast.success(`${type} generated${files.length > 1 ? ` (${files.length} files)` : ""}`);
      for (const f of files) {
        if (f?.id) await downloadDocument(f.id, f.file_name);
      }
      qc.invalidateQueries({ queryKey: ["app", id] });
      qc.invalidateQueries({ queryKey: ["billing"] });
    } catch (e: any) {
      toast.error(e.message ?? "PDF failed");
      if (e.status === 422 || /product image/i.test(String(e.message || ""))) setFocusStep(3);
    }
  }

  const status = String(app.status || "").toUpperCase();
  const canSubmit = can("applications.submit") && ["DRAFT", "CHANGES_REQUIRED"].includes(status);
  const canReview = can("applications.approve") && status === "UNDER_REVIEW";
  const title = app.consignee_name || app.created_by_name || app.app_no;

  return (
    <div className="space-y-4">
      <article className="overflow-hidden rounded-[2px] border border-[#d9d9d9] bg-white">
        <header className="flex flex-wrap items-start justify-between gap-2 border-b border-[#ececec] bg-[#f7f7f7] px-4 py-2.5">
          <div>
            <h1 className="text-[15px] font-bold tracking-tight">{title}</h1>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono text-primary">{app.app_no}</span>
              <StatusBadge status={app.status} />
            </div>
          </div>
          <div className="text-right text-[11px] leading-5 text-[#6f6f6f]">
            <div>Created: {app.created_at ? format(new Date(app.created_at), "dd-MMM-yyyy, h:mm a") : "-"}</div>
            <div>Modified: {app.updated_at ? format(new Date(app.updated_at), "dd-MMM-yyyy, h:mm a") : "-"}</div>
            <div>Created by {app.created_by_name || user?.name}</div>
          </div>
        </header>
        <div className="px-4 py-4">
          {app.meta?.training && (
            <p className="mb-3 text-xs rounded border border-amber-300 bg-amber-50 text-amber-950 px-2 py-1.5 max-w-xl">{app.meta.training}</p>
          )}
          <ApplicationStepper app={{ ...app, stages }} />
        </div>
      </article>

      <div className="gov-panel">
        <div className="p-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground">
              {app.final_destination_text || "—"} · FY {app.financial_year || "—"} · PI {app.proforma_no || "—"} · EXP {app.invoice_no || "—"} · INR {app.inr_invoice_no || "—"} · Stage {app.current_stage}{app.payment_received ? " · Paid" : ""}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {canSubmit && <Button onClick={() => action(status === "CHANGES_REQUIRED" ? "/resubmit" : "/submit", {}, "Submitted")}>Submit</Button>}
            {canReview && (
              <>
                <Button onClick={() => { const comment = window.prompt("Approval comment"); if (comment?.trim()) action("/approve", { comment }, "Approved"); }}>Approve</Button>
                <Button variant="outline" onClick={() => { const comment = window.prompt("Changes required — reason"); if (comment?.trim()) action("/request-changes", { comment }, "Changes requested"); }}>Request Changes</Button>
                <Button variant="destructive" onClick={() => { const comment = window.prompt("Rejection reason (required)"); if (comment?.trim()) action("/reject", { comment }, "Rejected"); }}>Reject</Button>
              </>
            )}
            {can("documents.generate") && (
              <>
                <Button variant="outline" size="sm" onClick={() => generate("proforma")}>Proforma</Button>
                <Button variant="outline" size="sm" onClick={() => generate("invoice")}>Commercial invoice</Button>
                <Button variant="outline" size="sm" onClick={() => generate("inr_invoice")}>INR invoice</Button>
                <Button variant="outline" size="sm" onClick={() => generate("packing_list")}>Packing list</Button>
                <Button variant="outline" size="sm" onClick={() => generate("annexure")}>Annexure</Button>
                <Button variant="outline" size="sm" onClick={() => generate("vgm")}>VGM{containers.length > 1 ? ` (${containers.length})` : ""}</Button>
              </>
            )}
            {can("applications.edit") && !app.payment_received && (
              <Button variant="secondary" size="sm" onClick={() => action("/payment-received", {}, "Payment marked received")}>Payment received</Button>
            )}
            <Button variant="outline" onClick={() => navigate({ to: "/applications" })}>← Back</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="xl:col-span-3 space-y-4">
          <ApplicationForm appNo={app.app_no} initialValues={initial} onSubmit={save} focusStep={focusStep} />

          <section className="gov-panel">
            <div className="gov-panel-header"><span>Documents</span></div>
            <ul className="divide-y text-sm">
              {(documents ?? []).map((d: any) => (
                <li key={d.id} className="px-4 py-2 flex justify-between">
                  <span>{d.document_type} · {d.file_name} · v{d.version}</span>
                  <a className="text-primary text-xs" href="#" onClick={(e) => { e.preventDefault(); void downloadDocument(d.id, d.file_name); }}>Download</a>
                </li>
              ))}
              {!documents?.length && <li className="px-4 py-6 text-muted-foreground text-xs">No generated documents yet.</li>}
            </ul>
          </section>

          <section className="gov-panel">
            <div className="gov-panel-header"><span>Approval History</span></div>
            <ul className="divide-y text-sm">
              {(history ?? []).map((h: any) => (
                <li key={h.id} className="px-4 py-2">
                  <div className="font-medium">{h.action} · {h.previous_status} → {h.new_status}</div>
                  <div className="text-xs text-muted-foreground">{h.performed_by_name} · {h.comment}</div>
                </li>
              ))}
              {!history?.length && <li className="px-4 py-6 text-muted-foreground text-xs">No approval actions yet.</li>}
            </ul>
          </section>
        </div>

        <aside className="gov-panel h-fit sticky top-[120px]">
          <div className="gov-panel-header"><span>Stage notes</span></div>
          <ol className="p-3 space-y-2">
            {(stages ?? []).map((s: any) => {
              const Icon = s.status === "completed" ? CheckCircle2 : s.status === "in_progress" ? Clock : Circle;
              const color = s.status === "completed" ? "text-success" : s.status === "in_progress" ? "text-primary" : "text-muted-foreground";
              return (
                <li key={s.id} className="flex items-start gap-2">
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium">{s.stage_label}</div>
                    {s.comment && <div className="text-[10px] text-muted-foreground truncate">{s.comment}</div>}
                    {s.acted_at && <div className="text-[10px] text-muted-foreground">{format(new Date(s.acted_at), "dd MMM · HH:mm")}</div>}
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

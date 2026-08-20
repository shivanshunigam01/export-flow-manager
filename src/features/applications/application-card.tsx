import { format } from "date-fns";
import { ChevronDown, Copy, Eye, FileText, Send } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApplicationStepper } from "@/features/applications/application-stepper";
import { useAuth } from "@/features/auth/auth-context";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

function dash(value: unknown) {
  const s = String(value ?? "").trim();
  return s || "-";
}

function stamp(value?: string | Date | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return format(d, "dd-MMM-yyyy, h:mm a");
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-[148px_minmax(0,1fr)] gap-x-2 text-[13px] leading-relaxed", className)}>
      <dt className="font-semibold text-foreground">{label} :</dt>
      <dd className="min-w-0 break-words text-foreground/90">{children}</dd>
    </div>
  );
}

export function ApplicationCard({
  app,
  index = 0,
  onChanged,
}: {
  app: any;
  index?: number;
  onChanged?: () => void;
}) {
  const navigate = useNavigate();
  const { can } = useAuth();
  const status = String(app.status || "").toUpperCase();
  const canSubmit = can("applications.submit") && ["DRAFT", "CHANGES_REQUIRED"].includes(status);
  const title = app.consignee_name || app.created_by_name || app.app_no || "Application";
  const location = [app.port_loading_text, app.port_loading_address || app.exporter_address].filter(Boolean).join(", ");
  const periodFrom = app.etd || app.invoice_date || app.proforma_date || app.created_at;
  const periodTo = app.eta || app.latest_shipment_date || app.vgm_date || app.updated_at;

  function open() {
    navigate({ to: "/applications/$id", params: { id: app.id } });
  }

  async function submit() {
    try {
      await api(`/api/applications/${app.id}${status === "CHANGES_REQUIRED" ? "/resubmit" : "/submit"}`, {
        method: "POST",
        json: {},
      });
      toast.success("Application submitted");
      onChanged?.();
    } catch (e: any) {
      toast.error(e.message ?? "Submit failed");
    }
  }

  return (
    <article
      className="app-record-card overflow-hidden rounded-[2px] border border-[#d9d9d9] bg-white shadow-[0_1px_0_rgba(0,0,0,0.02)]"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <header className="flex flex-wrap items-start justify-between gap-2 border-b border-[#ececec] bg-[#f7f7f7] px-4 py-2.5">
        <h2 className="text-[15px] font-bold tracking-tight text-[#1a1a1a]">{title}</h2>
        <div className="text-right text-[11px] leading-5 text-[#6f6f6f]">
          <div>Created: {stamp(app.created_at || app.createdAt)}</div>
          <div>Modified: {stamp(app.updated_at || app.updatedAt)}</div>
        </div>
      </header>

      <div className="px-4 pt-3 pb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              className="h-8 rounded-[2px] bg-primary px-3 text-[13px] font-semibold text-primary-foreground shadow-none hover:bg-primary/90"
              onClick={(e) => e.stopPropagation()}
            >
              Actions
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={open}>
              <Eye className="h-4 w-4 mr-2" /> View application
            </DropdownMenuItem>
            {can("applications.edit") && (
              <DropdownMenuItem onClick={open}>
                <FileText className="h-4 w-4 mr-2" /> Open & edit
              </DropdownMenuItem>
            )}
            {canSubmit && (
              <DropdownMenuItem onClick={() => void submit()}>
                <Send className="h-4 w-4 mr-2" /> Submit
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                void navigator.clipboard.writeText(String(app.app_no || ""));
                toast.success("Application number copied");
              }}
            >
              <Copy className="h-4 w-4 mr-2" /> Copy application no.
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <dl className="mt-3 grid grid-cols-1 gap-x-10 gap-y-1.5 md:grid-cols-2">
          <div className="space-y-1.5">
            <Field label="Application No.">
              <button type="button" className="font-medium text-primary hover:underline" onClick={open}>
                {dash(app.app_no)}
              </button>
            </Field>
            <Field label="Status">{dash(String(app.status || "").replaceAll("_", " "))}</Field>
            <Field label="Mobile No.">{dash(app.consignee_phone || app.notify_phone)}</Field>
            <Field label="Email">{dash(app.consignee_email || app.customer_snapshot?.email)}</Field>
            <Field label="Location">{dash(location)}</Field>
          </div>
          <div className="space-y-1.5">
            <Field label="Goods">{dash(app.products_desc || app.items?.[0]?.description)}</Field>
            <Field label="Export / Payment">
              {[app.export_terms, app.payment_terms].filter(Boolean).join(" · ") || "-"}
            </Field>
            <Field label="Consignee">{dash(app.consignee_name)}</Field>
            <Field label="Destination">{dash(app.final_destination_text)}</Field>
            <Field label="Consignee Address">{dash(app.consignee_address)}</Field>
            <Field label="Period Time">
              <span className="inline-flex flex-wrap gap-x-4 gap-y-0.5">
                <span>
                  <span className="font-semibold">From :</span> {stamp(periodFrom)}
                </span>
                <span>
                  <span className="font-semibold">To :</span> {stamp(periodTo)}
                </span>
              </span>
            </Field>
          </div>
        </dl>

        <div className="mt-5 border-t border-[#ececec] pt-4">
          <ApplicationStepper app={app} />
        </div>
      </div>
    </article>
  );
}

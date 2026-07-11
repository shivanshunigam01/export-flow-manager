import { useForm, useFieldArray } from "react-hook-form";
import { applicationSchema, emptyApplication, type ApplicationForm } from "./schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, FileDown, Printer, Save } from "lucide-react";
import { downloadInvoicePDF, printInvoicePDF } from "@/features/documents/invoice-pdf";
import { useMemo } from "react";

interface Props {
  initialValues?: Partial<ApplicationForm>;
  appNo?: string;
  onSubmit: (data: ApplicationForm) => Promise<void> | void;
  submitting?: boolean;
}

export function ApplicationForm({ initialValues, appNo, onSubmit, submitting }: Props) {
  const form = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { ...emptyApplication(), ...initialValues },
  });
  const { register, control, handleSubmit, watch } = form;
  const items = useFieldArray({ control, name: "items" });
  const containers = useFieldArray({ control, name: "containers" });

  const watched = watch();
  const totalAmount = useMemo(() => {
    const sum = (watched.items ?? []).reduce((s, it) => s + (Number(it.amount) || 0), 0);
    return sum + (Number(watched.loading_charge) || 0);
  }, [watched.items, watched.loading_charge]);
  const totalPkgs = useMemo(() => (watched.items ?? []).reduce((s, it) => s + (Number(it.packages) || 0), 0), [watched.items]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Sticky action bar */}
      <div className="sticky top-[96px] z-30 -mx-4 md:-mx-6 px-4 md:px-6 py-2 bg-background/95 backdrop-blur border-b flex items-center justify-between gap-2">
        <div className="text-sm">
          <span className="gov-label">App No</span>
          <span className="ml-2 font-mono font-semibold text-primary">{appNo ?? "— will be assigned —"}</span>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => downloadInvoicePDF({ ...watched, app_no: appNo }, undefined, "invoice")}>
            <FileDown className="h-4 w-4 mr-1" /> Invoice PDF
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => downloadInvoicePDF({ ...watched, app_no: appNo }, undefined, "packing")}>
            <FileDown className="h-4 w-4 mr-1" /> Packing List
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => printInvoicePDF({ ...watched, app_no: appNo }, "invoice")}>
            <Printer className="h-4 w-4 mr-1" /> Print
          </Button>
          <Button type="submit" size="sm" disabled={submitting}>
            <Save className="h-4 w-4 mr-1" /> {submitting ? "Saving…" : "Save Application"}
          </Button>
        </div>
      </div>

      <Section title="Exporter Details">
        <Grid cols={2}>
          <Field label="Exporter Name" {...register("exporter_name")} />
          <Field label="IEC No" {...register("iec_no")} />
          <Field label="GST No" {...register("gst_no")} />
          <Field label="BIN No" {...register("bin_no")} />
          <Field label="State of Origin" {...register("state_of_origin")} />
          <Field label="LUT No" {...register("lut_no")} />
        </Grid>
        <TextField label="Exporter Address" {...register("exporter_address")} />
      </Section>

      <Section title="Invoice Details">
        <Grid cols={3}>
          <Field label="Invoice No" {...register("invoice_no")} />
          <Field label="Invoice Date" type="date" {...register("invoice_date")} />
          <Field label="Currency" {...register("invoice_currency")} />
        </Grid>
      </Section>

      <Section title="Consignee & Notify">
        <Grid cols={2}>
          <div>
            <Field label="Consignee Name" {...register("consignee_name")} />
            <TextField label="Consignee Address" rows={3} {...register("consignee_address")} />
          </div>
          <div>
            <TextField label="Notify Party" rows={3} {...register("notify_party")} />
            <Field label="Second Notify" {...register("second_notify")} />
            <Field label="Third Party" {...register("third_party")} />
          </div>
        </Grid>
      </Section>

      <Section title="Ports, Terms & Products">
        <Grid cols={2}>
          <Field label="Port of Loading" {...register("port_loading_text")} />
          <Field label="Port of Discharge" {...register("port_discharge_text")} />
          <Field label="Country of Origin" {...register("country_origin")} />
          <Field label="Final Destination" {...register("final_destination_text")} />
          <Field label="Payment Terms" {...register("payment_terms")} />
          <Field label="Export Terms (INCOTERM)" {...register("export_terms")} />
          <Field label="H.S.N Code(s)" {...register("hsn_codes")} />
          <Field label="Products" {...register("products_desc")} />
        </Grid>
      </Section>

      <Section title="Bank Details">
        <Grid cols={2}>
          <Field label="Bank Name" {...register("bank_name")} />
          <Field label="A/C No" {...register("bank_account")} />
          <Field label="SWIFT Code" {...register("bank_swift")} />
          <Field label="IFSC Code" {...register("bank_ifsc")} />
        </Grid>
      </Section>

      <Section title="Containers" action={<Button type="button" variant="outline" size="sm" onClick={() => containers.append({ container_no: "", line_seal_no: "", electronic_seal_no: "", size: "20 FT", quantity: "1x20 FT" })}><Plus className="h-3 w-3 mr-1" /> Add Container</Button>}>
        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead><tr><th>Container No.</th><th>Line Seal No.</th><th>Electronic Seal No.</th><th>Size</th><th>Quantity</th><th className="w-8"></th></tr></thead>
            <tbody>
              {containers.fields.map((f, i) => (
                <tr key={f.id}>
                  <td><Input {...register(`containers.${i}.container_no`)} className="h-8" /></td>
                  <td><Input {...register(`containers.${i}.line_seal_no`)} className="h-8" /></td>
                  <td><Input {...register(`containers.${i}.electronic_seal_no`)} className="h-8" /></td>
                  <td><Input {...register(`containers.${i}.size`)} className="h-8 w-24" /></td>
                  <td><Input {...register(`containers.${i}.quantity`)} className="h-8 w-24" /></td>
                  <td><Button type="button" variant="ghost" size="icon" onClick={() => containers.remove(i)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Line Items" action={<Button type="button" variant="outline" size="sm" onClick={() => items.append({ packages: null, description: "", quantity: null, unit: "SQM", rate: null, amount: null, net_weight: null, gross_weight: null })}><Plus className="h-3 w-3 mr-1" /> Add Row</Button>}>
        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th className="w-20">Packages</th>
                <th>Description of Goods</th>
                <th className="w-24">Qty</th>
                <th className="w-20">Unit</th>
                <th className="w-24">Rate</th>
                <th className="w-28">Amount</th>
                <th className="w-24">Net Wt (Kg)</th>
                <th className="w-24">Gross Wt (Kg)</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {items.fields.map((f, i) => {
                const qty = Number(watched.items?.[i]?.quantity) || 0;
                const rate = Number(watched.items?.[i]?.rate) || 0;
                const suggested = (qty * rate).toFixed(2);
                return (
                  <tr key={f.id}>
                    <td><Input type="number" step="any" {...register(`items.${i}.packages`)} className="h-8" /></td>
                    <td><Input {...register(`items.${i}.description`)} className="h-8" /></td>
                    <td><Input type="number" step="any" {...register(`items.${i}.quantity`)} className="h-8" /></td>
                    <td><Input {...register(`items.${i}.unit`)} className="h-8" /></td>
                    <td><Input type="number" step="any" {...register(`items.${i}.rate`)} className="h-8" /></td>
                    <td>
                      <Input type="number" step="any" placeholder={suggested} {...register(`items.${i}.amount`)} className="h-8" />
                    </td>
                    <td><Input type="number" step="any" {...register(`items.${i}.net_weight`)} className="h-8" /></td>
                    <td><Input type="number" step="any" {...register(`items.${i}.gross_weight`)} className="h-8" /></td>
                    <td><Button type="button" variant="ghost" size="icon" onClick={() => items.remove(i)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="font-semibold bg-muted">
                <td>{totalPkgs}</td>
                <td>TOTAL</td>
                <td colSpan={3}></td>
                <td className="text-right tabular-nums">{totalAmount.toFixed(2)}</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Section>

      <Section title="Totals & Declaration">
        <Grid cols={3}>
          <Field label="Loading Charge" type="number" step="any" {...register("loading_charge")} />
          <div className="col-span-2">
            <Field label="Amount in Words" {...register("amount_in_words")} />
          </div>
        </Grid>
        <TextField label="Declaration" rows={2} {...register("declaration")} />
      </Section>
    </form>
  );
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="gov-panel">
      <div className="gov-panel-header"><span>{title}</span>{action}</div>
      <div className="p-4 space-y-3">{children}</div>
    </section>
  );
}

function Grid({ cols, children }: { cols: 2 | 3; children: React.ReactNode }) {
  return <div className={`grid gap-3 ${cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>{children}</div>;
}

const Field = ({ label, ...rest }: any) => (
  <div>
    <Label className="gov-label">{label}</Label>
    <Input className="h-9 mt-1" {...rest} />
  </div>
);
const TextField = ({ label, rows = 2, ...rest }: any) => (
  <div>
    <Label className="gov-label">{label}</Label>
    <Textarea rows={rows} className="mt-1" {...rest} />
  </div>
);

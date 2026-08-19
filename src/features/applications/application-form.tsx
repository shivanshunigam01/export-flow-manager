import { useForm, useFieldArray } from "react-hook-form";
import { emptyApplication, FORM_STEPS, type ApplicationForm } from "./schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, apiUpload, fileUrl } from "@/lib/api";

interface Props {
  initialValues?: Partial<ApplicationForm>;
  appNo?: string;
  onSubmit: (data: ApplicationForm) => Promise<void> | void;
  submitting?: boolean;
  saveLabel?: string;
}

export function ApplicationForm({ initialValues, appNo, onSubmit, submitting, saveLabel }: Props) {
  const [step, setStep] = useState(0);
  const form = useForm<ApplicationForm>({
    defaultValues: { ...emptyApplication(), ...initialValues } as ApplicationForm,
  });
  const { register, control, handleSubmit, watch, setValue, reset } = form;
  const items = useFieldArray({ control, name: "items" });
  const containers = useFieldArray({ control, name: "containers" });
  const packing = useFieldArray({ control, name: "packing_lines" });
  const bills = useFieldArray({ control, name: "gst_bills" });
  const others = useFieldArray({ control, name: "other_consignees" });

  useEffect(() => {
    if (initialValues) reset({ ...emptyApplication(), ...initialValues } as ApplicationForm);
  }, [appNo]); // eslint-disable-line

  const watched = watch();

  const { data: customers } = useQuery({ queryKey: ["master", "customers"], queryFn: () => api<any[]>("/api/masters/customers") });
  const { data: products } = useQuery({ queryKey: ["master", "products"], queryFn: () => api<any[]>("/api/masters/products") });
  const { data: countries } = useQuery({ queryKey: ["master", "countries"], queryFn: () => api<any[]>("/api/masters/countries") });
  const { data: ports } = useQuery({ queryKey: ["master", "ports"], queryFn: () => api<any[]>("/api/masters/ports") });
  const { data: banks } = useQuery({ queryKey: ["master", "banks"], queryFn: () => api<any[]>("/api/masters/banks") });
  const { data: suppliers } = useQuery({ queryKey: ["master", "suppliers"], queryFn: () => api<any[]>("/api/masters/suppliers") });
  const { data: lines } = useQuery({ queryKey: ["master", "shipping_lines"], queryFn: () => api<any[]>("/api/masters/shipping_lines") });
  const { data: fx } = useQuery({ queryKey: ["fx-rates"], queryFn: () => api<{ latest?: { usd_inr: number } }>("/api/fx-rates") });

  useEffect(() => {
    if (!watched.exchange_rate && fx?.latest?.usd_inr) setValue("exchange_rate", fx.latest.usd_inr);
  }, [fx?.latest?.usd_inr]); // eslint-disable-line

  const nepal = String(watched.final_destination_text || watched.country_id || "").toLowerCase().includes("nepal")
    || String(watched.final_destination_text || "").toLowerCase().includes("bhutan");
  const goods = (watched.items ?? []).reduce((s, it) => s + (Number(it.amount) || 0), 0);
  const extras = Number(watched.loading_charge || 0) + (nepal ? Number(watched.price_increase || 0) + Number(watched.freight || 0) : 0);
  const totalAmount = goods + extras;
  const rate = Number(watched.exchange_rate) || 0;
  const inrPreview = rate ? Number((totalAmount * rate).toFixed(2)) : 0;
  const totalNet = (watched.items ?? []).reduce((s, it) => s + (Number(it.net_weight) || 0), 0);
  const totalGross = (watched.items ?? []).reduce((s, it) => s + (Number(it.gross_weight) || 0), 0);
  const totalPkgs = (watched.items ?? []).reduce((s, it) => s + (Number(it.packages) || 0), 0);

  function pickCustomer(id: string) {
    const c = (customers ?? []).find((x) => x.id === id);
    if (!c) return;
    setValue("customer_id", id);
    setValue("consignee_name", c.name || "");
    setValue("consignee_address", c.address || "");
    setValue("consignee_phone", c.phone || "");
    setValue("consignee_email", c.email || "");
    setValue("consignee_tax_id", c.tax_id || "");
    if (c.country) {
      setValue("final_destination_text", c.country);
      setValue("country_id", c.country);
    }
  }

  function pickSupplier(id: string) {
    const s = (suppliers ?? []).find((x) => x.id === id);
    if (!s) return;
    setValue("supplier_id", id);
    setValue("supplier_name", s.name || "");
    setValue("supplier_address", s.address || "");
    setValue("supplier_gst", s.gst_no || "");
    setValue("factory_address", s.factory_address || s.address || "");
  }

  function pickBank(id: string) {
    const b = (banks ?? []).find((x) => x.id === id);
    if (!b) return;
    setValue("bank_name", b.bank_name || "");
    setValue("bank_account", b.account_no || "");
    setValue("bank_swift", b.swift_code || "");
    setValue("bank_ifsc", b.ifsc_code || "");
    setValue("bank_branch", b.branch || "");
  }

  function pickProduct(i: number, id: string) {
    const p = (products ?? []).find((x) => x.id === id);
    if (!p) return;
    setValue(`items.${i}.product_id`, id);
    setValue(`items.${i}.description`, p.name || "");
    setValue(`items.${i}.hsn_code`, p.hsn_code || "");
    setValue(`items.${i}.unit`, p.unit || "PCS");
    setValue(`items.${i}.rate`, p.default_rate ?? null);
    setValue(`items.${i}.dimensions`, p.dimensions || "");
    setValue(`items.${i}.image_url`, p.image_url || "");
    setValue(`items.${i}.brand_name`, p.brand_name || "");
    if (p.hsn_code) setValue("hsn_codes", p.hsn_code);
    if (p.name && !watched.products_desc) setValue("products_desc", "CERAMIC SANITARY WARE");
  }

  async function uploadLineImage(i: number, file: File) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "products");
    const stored = await apiUpload<{ url: string }>("/api/uploads/image", fd);
    setValue(`items.${i}.image_url`, stored.url);
  }

  async function uploadSeal(i: number, field: "line_seal_photo_url" | "electronic_seal_photo_url", file: File) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "seals");
    const stored = await apiUpload<{ url: string }>("/api/uploads/image", fd);
    setValue(`containers.${i}.${field}`, stored.url);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="sticky top-[96px] z-30 -mx-4 md:-mx-6 px-4 md:px-6 py-2 bg-background/95 backdrop-blur border-b flex items-center justify-between gap-2">
        <div className="text-sm">
          <span className="gov-label">App No</span>
          <span className="ml-2 font-mono font-semibold text-primary">{appNo ?? "— will be assigned —"}</span>
        </div>
        <Button type="submit" size="sm" disabled={submitting}>
          <Save className="h-4 w-4 mr-1" /> {submitting ? "Saving…" : saveLabel || "Save Draft"}
        </Button>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {FORM_STEPS.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setStep(i)}
            className={`text-[11px] px-2 py-1 rounded border shrink-0 ${i === step ? "bg-primary text-primary-foreground border-primary" : "bg-background"}`}
          >
            {i + 1}. {s.label}
          </button>
        ))}
      </div>

      {step === 0 && (
        <Section title="Application Information">
          <Grid cols={2}>
            <Field label="Exporter Name" {...register("exporter_name")} />
            <SelectField label="Destination country" value={watched.country_id} onChange={(v) => { setValue("country_id", v); setValue("final_destination_text", v); }} options={(countries ?? []).map((c) => ({ value: c.name, label: `${c.name} (${c.code || ""})` }))} />
            <Field label="IEC No" {...register("iec_no")} />
            <Field label="GST No" {...register("gst_no")} />
            <Field label="BIN No" {...register("bin_no")} />
            <Field label="AEO No" {...register("aeo_no")} />
            <Field label="State of Origin" {...register("state_of_origin")} />
            <Field label="LUT No" {...register("lut_no")} />
          </Grid>
          <TextField label="Exporter Address" {...register("exporter_address")} />
        </Section>
      )}

      {step === 1 && (
        <Section title="Customer / Consignee">
          <SelectField label="Select from Customers master" value={watched.customer_id} onChange={pickCustomer} options={(customers ?? []).map((c) => ({ value: c.id, label: c.name }))} />
          <Grid cols={2}>
            <Field label="Consignee Name" {...register("consignee_name")} />
            <Field label="Phone" {...register("consignee_phone")} />
            <Field label="Email" {...register("consignee_email")} />
            <Field label="Tax ID" {...register("consignee_tax_id")} />
          </Grid>
          <TextField label="Consignee Address" rows={3} {...register("consignee_address")} />
          <Grid cols={2}>
            <Field label="Notify name" {...register("notify_name")} />
            <Field label="Notify phone" {...register("notify_phone")} />
          </Grid>
          <TextField label="Notify address" rows={2} {...register("notify_address")} />
          <TextField label="Notify (combined / extra)" rows={2} {...register("notify_party")} />
          <div className="flex justify-between items-center">
            <p className="text-xs font-medium">Other consignees</p>
            <Button type="button" variant="outline" size="sm" onClick={() => others.append({ name: "", address: "", phone: "" })}><Plus className="h-3 w-3 mr-1" /> Add</Button>
          </div>
          {others.fields.map((f, i) => (
            <Grid cols={2} key={f.id}>
              <Field label="Name" {...register(`other_consignees.${i}.name`)} />
              <Field label="Phone" {...register(`other_consignees.${i}.phone`)} />
              <div className="md:col-span-2"><TextField label="Address" {...register(`other_consignees.${i}.address`)} /></div>
            </Grid>
          ))}
        </Section>
      )}

      {step === 2 && (
        <Section title="Supplier / Manufacturer">
          <SelectField label="Select from Suppliers master" value={watched.supplier_id} onChange={pickSupplier} options={(suppliers ?? []).map((s) => ({ value: s.id, label: s.name }))} />
          <Grid cols={2}>
            <Field label="Supplier Name" {...register("supplier_name")} />
            <Field label="Supplier GST" {...register("supplier_gst")} />
          </Grid>
          <TextField label="Supplier Address" {...register("supplier_address")} />
          <TextField label="Factory Address" {...register("factory_address")} />
        </Section>
      )}

      {step === 3 && (
        <Section title="Products" action={<Button type="button" variant="outline" size="sm" onClick={() => items.append({ description: "", unit: "PCS" } as any)}><Plus className="h-3 w-3 mr-1" /> Add Row</Button>}>
          <div className="overflow-x-auto">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Master</th>
                  <th>Description</th>
                  <th>Brand</th>
                  <th>Image</th>
                  <th>Pkgs</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Rate</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.fields.map((f, i) => {
                  const qty = Number(watched.items?.[i]?.quantity) || 0;
                  const rate = Number(watched.items?.[i]?.rate) || 0;
                  return (
                    <tr key={f.id}>
                      <td>
                        <select className="h-8 text-xs border rounded px-1 w-36" value={watched.items?.[i]?.product_id || ""} onChange={(e) => pickProduct(i, e.target.value)}>
                          <option value="">Custom</option>
                          {(products ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </td>
                      <td>
                        <Input {...register(`items.${i}.description`)} className="h-8 min-w-40" />
                        <Input placeholder="Dimensions" {...register(`items.${i}.dimensions`)} className="h-7 mt-1 text-xs" />
                      </td>
                      <td><Input placeholder="Brand" {...register(`items.${i}.brand_name`)} className="h-8 w-24" /></td>
                      <td>
                        {watched.items?.[i]?.image_url ? <img src={fileUrl(watched.items[i].image_url)} alt="" className="h-10 w-10 object-cover rounded border" /> : null}
                        <input type="file" accept="image/*" className="text-[10px] w-28" onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadLineImage(i, file); }} />
                      </td>
                      <td><Input type="number" {...register(`items.${i}.packages`)} className="h-8 w-16" /></td>
                      <td><Input type="number" {...register(`items.${i}.quantity`)} className="h-8 w-16" onBlur={() => setValue(`items.${i}.amount`, Number((qty * rate).toFixed(2)))} /></td>
                      <td><Input {...register(`items.${i}.unit`)} className="h-8 w-16" /></td>
                      <td><Input type="number" step="any" {...register(`items.${i}.rate`)} className="h-8 w-20" /></td>
                      <td><Input type="number" step="any" {...register(`items.${i}.amount`)} className="h-8 w-24" /></td>
                      <td><Button type="button" variant="ghost" size="icon" onClick={() => items.remove(i)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Grid cols={2}>
            <Field label="HSN Code(s)" {...register("hsn_codes")} />
            <Field label="Products (header)" {...register("products_desc")} />
          </Grid>
        </Section>
      )}

      {step === 4 && (
        <Section title="Invoice / LC / Terms">
          <Grid cols={3}>
            <Field label="Proforma No" {...register("proforma_no")} />
            <Field label="Proforma Date" {...register("proforma_date")} />
            <Field label="Invoice No" {...register("invoice_no")} />
            <Field label="Invoice Date" {...register("invoice_date")} />
            <Field label="INR Invoice No" {...register("inr_invoice_no")} />
            <Field label="INR Invoice Date" {...register("inr_invoice_date")} />
            <Field label="Currency" {...register("invoice_currency")} />
            <Field label="USD→INR week rate" type="number" step="any" {...register("exchange_rate")} />
            <Field label="Payment Terms" {...register("payment_terms")} />
            <Field label="Export Terms" {...register("export_terms")} />
            <Field label="Loading Charge" type="number" {...register("loading_charge")} />
            {nepal && (
              <>
                <Field label="Price increase" type="number" step="any" {...register("price_increase")} />
                <Field label="Freight" type="number" step="any" {...register("freight")} />
              </>
            )}
            <Field label="LC No" {...register("lc_no")} />
            <Field label="LC Issue Date" {...register("lc_issue_date")} />
            <Field label="LC Expiry Date" {...register("lc_expiry_date")} />
            <Field label="Latest Shipment" {...register("latest_shipment_date")} />
          </Grid>
          <SelectField label="Bank from master" value="" onChange={pickBank} options={(banks ?? []).map((b) => ({ value: b.id, label: b.bank_name }))} />
          <Grid cols={2}>
            <Field label="Bank Name" {...register("bank_name")} />
            <Field label="A/C No" {...register("bank_account")} />
            <Field label="SWIFT" {...register("bank_swift")} />
            <Field label="IFSC" {...register("bank_ifsc")} />
          </Grid>
          <Field label="Amount in Words" {...register("amount_in_words")} />
          {nepal && <TextField label="Transit note (Nepal/Bhutan)" {...register("transit_note")} />}
          <div className="text-xs rounded border bg-muted/40 p-2 space-y-0.5">
            <div>FX total: <b>{totalAmount.toFixed(2)} {watched.invoice_currency}</b></div>
            <div>INR at week rate {rate || "—"}: <b>₹ {inrPreview.toFixed(2)}</b> (must match INR invoice within ₹1)</div>
            <div>Weights: {totalPkgs} pkgs · net {totalNet} kg · gross {totalGross} kg</div>
          </div>
        </Section>
      )}

      {step === 5 && (
        <Section title="Packing breakdown" action={<Button type="button" variant="outline" size="sm" onClick={() => packing.append({ description: "", serial_no: "" } as any)}><Plus className="h-3 w-3 mr-1" /> Add</Button>}>
          <p className="text-xs text-muted-foreground">Used on the Packing List right-hand table (per-piece weights).</p>
          <div className="overflow-x-auto">
            <table className="gov-table">
              <thead><tr><th>Sr</th><th>Description</th><th>PCS</th><th>Net/pc</th><th>Gross/pc</th><th>Net</th><th>Gross</th><th></th></tr></thead>
              <tbody>
                {packing.fields.map((f, i) => (
                  <tr key={f.id}>
                    <td><Input {...register(`packing_lines.${i}.serial_no`)} className="h-8 w-14" /></td>
                    <td><Input {...register(`packing_lines.${i}.description`)} className="h-8" /></td>
                    <td><Input type="number" {...register(`packing_lines.${i}.pcs`)} className="h-8 w-16" /></td>
                    <td><Input type="number" step="any" {...register(`packing_lines.${i}.per_pcs_net`)} className="h-8 w-16" /></td>
                    <td><Input type="number" step="any" {...register(`packing_lines.${i}.per_pcs_gross`)} className="h-8 w-16" /></td>
                    <td><Input type="number" step="any" {...register(`packing_lines.${i}.net_weight`)} className="h-8 w-16" /></td>
                    <td><Input type="number" step="any" {...register(`packing_lines.${i}.gross_weight`)} className="h-8 w-16" /></td>
                    <td><Button type="button" variant="ghost" size="icon" onClick={() => packing.remove(i)}><Trash2 className="h-3.5 w-3.5" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="overflow-x-auto mt-4">
            <p className="text-xs font-medium mb-1">Line item weights</p>
            <table className="gov-table">
              <thead><tr><th>Item</th><th>Net Kg</th><th>Gross Kg</th></tr></thead>
              <tbody>
                {items.fields.map((f, i) => (
                  <tr key={f.id}>
                    <td className="text-xs">{watched.items?.[i]?.description}</td>
                    <td><Input type="number" step="any" {...register(`items.${i}.net_weight`)} className="h-8" /></td>
                    <td><Input type="number" step="any" {...register(`items.${i}.gross_weight`)} className="h-8" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {step === 6 && (
        <Section title="Containers / VGM" action={<Button type="button" variant="outline" size="sm" onClick={() => containers.append({ size: "40 FT", quantity: "1x40 FT" } as any)}><Plus className="h-3 w-3 mr-1" /> Add</Button>}>
          {containers.fields.map((f, i) => (
            <div key={f.id} className="grid md:grid-cols-4 gap-2 border rounded p-3 mb-2">
              <Field label="Container No." {...register(`containers.${i}.container_no`)} />
              <Field label="Line Seal" {...register(`containers.${i}.line_seal_no`)} />
              <Field label="E-Seal" {...register(`containers.${i}.electronic_seal_no`)} />
              <div>
                <Label className="gov-label">Line seal photo</Label>
                {watched.containers?.[i]?.line_seal_photo_url ? <img src={fileUrl(watched.containers[i].line_seal_photo_url)} alt="" className="h-10 w-10 object-cover rounded border mt-1" /> : null}
                <input type="file" accept="image/*" className="text-[10px] mt-1" onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadSeal(i, "line_seal_photo_url", file); }} />
              </div>
              <div>
                <Label className="gov-label">E-seal photo</Label>
                {watched.containers?.[i]?.electronic_seal_photo_url ? <img src={fileUrl(watched.containers[i].electronic_seal_photo_url)} alt="" className="h-10 w-10 object-cover rounded border mt-1" /> : null}
                <input type="file" accept="image/*" className="text-[10px] mt-1" onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadSeal(i, "electronic_seal_photo_url", file); }} />
              </div>
              <p className="md:col-span-4 text-[11px] text-muted-foreground">
                Verified: {watched.containers?.[i]?.line_seal_photo_url && watched.containers?.[i]?.electronic_seal_photo_url ? "Yes — both photos uploaded" : "No — upload both seal photos"}
              </p>
              <Field label="Quantity" {...register(`containers.${i}.quantity`)} />
              <Field label="Size" {...register(`containers.${i}.size`)} />
              <Field label="Tare Kg" type="number" {...register(`containers.${i}.tare_weight`)} />
              <Field label="CSC Max Kg" type="number" {...register(`containers.${i}.csc_max_weight`)} />
              <Field label="Type" {...register(`containers.${i}.container_type`)} />
            </div>
          ))}
        </Section>
      )}

      {step === 7 && (
        <Section title="Shipping">
          <Grid cols={2}>
            <SelectField label="Port of Loading" value={watched.port_loading_text} onChange={(v) => {
              setValue("port_loading_text", v);
              const p = (ports ?? []).find((x) => x.name === v);
              setValue("port_loading_address", p?.address || "");
            }} options={(ports ?? []).map((p) => ({ value: p.name, label: `${p.name}${p.country ? ` (${p.country})` : ""}` }))} />
            <SelectField label="Port of Discharge" value={watched.port_discharge_text} onChange={(v) => {
              setValue("port_discharge_text", v);
              const p = (ports ?? []).find((x) => x.name === v);
              setValue("port_discharge_address", p?.address || "");
            }} options={(ports ?? []).map((p) => ({ value: p.name, label: `${p.name}${p.country ? ` (${p.country})` : ""}` }))} />
            <SelectField label="Shipping Line" value={watched.shipping_line} onChange={(v) => setValue("shipping_line", v)} options={(lines ?? []).map((p) => ({ value: p.name, label: p.name }))} />
            <Field label="Vessel" {...register("vessel_name")} />
            <Field label="Voyage" {...register("voyage_number")} />
            <Field label="Booking No" {...register("booking_number")} />
            <Field label="B/L No" {...register("bl_number")} />
            <Field label="ETD" {...register("etd")} />
            <Field label="ETA" {...register("eta")} />
          </Grid>
        </Section>
      )}

      {step === 8 && (
        <Section title="Certificates / Annexure extras">
          <Grid cols={2}>
            <Field label="Permission No" {...register("permission_no")} />
            <Field label="Commissionerate" {...register("commissionerate")} />
            <Field label="VGM / DOE date (same date)" {...register("vgm_date")} onBlur={(e: any) => setValue("examination_date", e.target.value)} />
            <Field label="Examination Date (DOE)" {...register("examination_date")} onBlur={(e: any) => setValue("vgm_date", e.target.value)} />
            <Field label="Examining Officer" {...register("examining_officer")} />
          </Grid>
          <div className="flex justify-between items-center">
            <p className="text-xs font-medium">Manufacturer GST bills</p>
            <Button type="button" variant="outline" size="sm" onClick={() => bills.append({} as any)}><Plus className="h-3 w-3 mr-1" /> Add bill</Button>
          </div>
          {bills.fields.map((f, i) => (
            <Grid cols={2} key={f.id}>
              <Field label="Bill No" {...register(`gst_bills.${i}.bill_no`)} />
              <Field label="Date" {...register(`gst_bills.${i}.bill_date`)} />
              <Field label="Company" {...register(`gst_bills.${i}.company_name`)} />
              <Field label="GSTIN" {...register(`gst_bills.${i}.gst_no`)} />
            </Grid>
          ))}
          <TextField label="Declaration" rows={2} {...register("declaration")} />
        </Section>
      )}

      {step === 9 && (
        <Section title="Review">
          <dl className="grid md:grid-cols-2 gap-2 text-sm">
            <div><span className="gov-label">Consignee</span><div>{watched.consignee_name || "—"}</div></div>
            <div><span className="gov-label">Destination</span><div>{watched.final_destination_text || "—"}</div></div>
            <div><span className="gov-label">Invoice</span><div>{watched.invoice_no || "(auto)"} / {watched.invoice_date}</div></div>
            <div><span className="gov-label">Total</span><div className="font-semibold tabular-nums">{totalAmount.toFixed(2)} {watched.invoice_currency} / ₹ {inrPreview.toFixed(2)}</div></div>
            <div><span className="gov-label">Weights</span><div>{totalPkgs} pkgs · {totalNet} / {totalGross} kg</div></div>
            <div><span className="gov-label">Items</span><div>{watched.items?.length || 0}</div></div>
            <div><span className="gov-label">Containers</span><div>{watched.containers?.[0]?.container_no || "—"}</div></div>
          </dl>
          <p className="text-xs text-muted-foreground">Save the draft, then Submit from the application header. Official PDFs are generated on the server after save.</p>
        </Section>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}><ChevronLeft className="h-4 w-4 mr-1" /> Previous</Button>
        <Button type="button" disabled={step === FORM_STEPS.length - 1} onClick={() => setStep((s) => s + 1)}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
      </div>
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
function SelectField({ label, value, onChange, options }: { label: string; value?: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <Label className="gov-label">{label}</Label>
      <select className="mt-1 h-9 w-full rounded border border-input bg-background px-2 text-sm" value={value || ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select…</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

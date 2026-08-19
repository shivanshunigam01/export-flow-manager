import { z } from "zod";

export const containerSchema = z.object({
  container_no: z.string().default(""),
  line_seal_no: z.string().default(""),
  electronic_seal_no: z.string().default(""),
  size: z.string().default("40 FT"),
  quantity: z.string().default("1x40 FT"),
  packages: z.coerce.number().optional().nullable(),
  net_weight: z.coerce.number().optional().nullable(),
  gross_weight: z.coerce.number().optional().nullable(),
  tare_weight: z.coerce.number().optional().nullable(),
  csc_max_weight: z.coerce.number().optional().nullable(),
  vgm_weight: z.coerce.number().optional().nullable(),
  vgm_method: z.string().default("method-2"),
  container_type: z.string().default("NORMAL"),
});

export const itemSchema = z.object({
  product_id: z.string().optional().default(""),
  packages: z.coerce.number().optional().nullable(),
  description: z.string().default(""),
  dimensions: z.string().default(""),
  hsn_code: z.string().default(""),
  quantity: z.coerce.number().optional().nullable(),
  unit: z.string().default("PCS"),
  rate: z.coerce.number().optional().nullable(),
  amount: z.coerce.number().optional().nullable(),
  net_weight: z.coerce.number().optional().nullable(),
  gross_weight: z.coerce.number().optional().nullable(),
  image_url: z.string().optional().default(""),
});

export const packingLineSchema = z.object({
  serial_no: z.string().default(""),
  description: z.string().default(""),
  pcs: z.coerce.number().optional().nullable(),
  per_pcs_net: z.coerce.number().optional().nullable(),
  per_pcs_gross: z.coerce.number().optional().nullable(),
  net_weight: z.coerce.number().optional().nullable(),
  gross_weight: z.coerce.number().optional().nullable(),
});

export const gstBillSchema = z.object({
  bill_no: z.string().default(""),
  bill_date: z.string().default(""),
  company_name: z.string().default(""),
  gst_no: z.string().default(""),
});

export const applicationSchema = z.object({
  exporter_name: z.string().default("SHREE HARI EXPORT HOUSE"),
  exporter_address: z.string().default(
    "SHOP NO. 1, SECOND FLOOR, SURVEY NO. 95 P2, PLOT NO. 2, NEAR NILKANTH PARK SOCIETY, MAHENDRANAGAR BUS STAND, MORBI HALVAD ROAD, MAHENDRANAGAR, MORBI-363642, GUJARAT, INDIA",
  ),
  iec_no: z.string().default("ADSFS7838P1ZX"),
  gst_no: z.string().default("24ADSFS7838P1ZX"),
  bin_no: z.string().default("ADSFS7838P1ZX FT 001"),
  aeo_no: z.string().default("IN ADSFS7838P1F214"),
  state_of_origin: z.string().default("GUJARAT"),
  lut_no: z.string().default(""),
  invoice_no: z.string().default(""),
  invoice_date: z.string().default(""),
  invoice_currency: z.string().default("USD"),
  exchange_rate: z.coerce.number().optional().nullable(),
  consignee_name: z.string().default(""),
  consignee_address: z.string().default(""),
  consignee_phone: z.string().default(""),
  consignee_email: z.string().default(""),
  consignee_tax_id: z.string().default(""),
  customer_id: z.string().default(""),
  notify_party: z.string().default(""),
  second_notify: z.string().default(""),
  third_party: z.string().default(""),
  supplier_id: z.string().default(""),
  supplier_name: z.string().default(""),
  supplier_address: z.string().default(""),
  supplier_gst: z.string().default(""),
  factory_address: z.string().default(""),
  port_loading_text: z.string().default(""),
  port_discharge_text: z.string().default(""),
  country_origin: z.string().default("INDIA"),
  final_destination_text: z.string().default(""),
  country_id: z.string().default(""),
  payment_terms: z.string().default("100% AGAINST BL"),
  export_terms: z.string().default("FOB"),
  hsn_codes: z.string().default(""),
  products_desc: z.string().default(""),
  lc_no: z.string().default(""),
  lc_issue_date: z.string().default(""),
  lc_expiry_date: z.string().default(""),
  proforma_no: z.string().default(""),
  proforma_date: z.string().default(""),
  latest_shipment_date: z.string().default(""),
  shipping_line: z.string().default(""),
  vessel_name: z.string().default(""),
  voyage_number: z.string().default(""),
  booking_number: z.string().default(""),
  bl_number: z.string().default(""),
  etd: z.string().default(""),
  eta: z.string().default(""),
  bank_name: z.string().default(""),
  bank_account: z.string().default(""),
  bank_swift: z.string().default(""),
  bank_ifsc: z.string().default(""),
  bank_branch: z.string().default(""),
  loading_charge: z.coerce.number().default(0),
  amount_in_words: z.string().default(""),
  declaration: z.string().default(
    "We declare that this Invoice show the actual price of the goods described and that all the particulars are true and correct",
  ),
  permission_no: z.string().default(""),
  commissionerate: z.string().default(""),
  examination_date: z.string().default(""),
  examining_officer: z.string().default("SELF SEALING"),
  containers: z.array(containerSchema).default([]),
  items: z.array(itemSchema).default([]),
  packing_lines: z.array(packingLineSchema).default([]),
  gst_bills: z.array(gstBillSchema).default([]),
});

export type ApplicationForm = z.infer<typeof applicationSchema>;

export const FORM_STEPS = [
  { key: "info", label: "Application" },
  { key: "customer", label: "Customer" },
  { key: "supplier", label: "Supplier" },
  { key: "products", label: "Products" },
  { key: "invoice", label: "Invoice" },
  { key: "packing", label: "Packing" },
  { key: "containers", label: "Containers" },
  { key: "shipping", label: "Shipping" },
  { key: "docs", label: "Certificates" },
  { key: "review", label: "Review" },
] as const;

export function emptyApplication(): ApplicationForm {
  return applicationSchema.parse({
    containers: [{ container_no: "", line_seal_no: "", electronic_seal_no: "", size: "40 FT", quantity: "1x40 FT" }],
    items: [{ description: "", quantity: null, unit: "PCS", rate: null, amount: null, net_weight: null, gross_weight: null, packages: null, dimensions: "", hsn_code: "", image_url: "" }],
    packing_lines: [],
    gst_bills: [{ bill_no: "", bill_date: "", company_name: "", gst_no: "" }],
  });
}

export function applicationPayload(form: ApplicationForm, extra: Record<string, unknown> = {}) {
  const total_amount = (form.items ?? []).reduce((s, it) => s + (Number(it.amount) || 0), 0) + (Number(form.loading_charge) || 0);
  const total_packages = (form.items ?? []).reduce((s, it) => s + (Number(it.packages) || 0), 0);
  return {
    ...form,
    total_amount,
    total_packages,
    meta: {
      bank_name: form.bank_name,
      bank_account: form.bank_account,
      bank_swift: form.bank_swift,
      bank_ifsc: form.bank_ifsc,
    },
    ...extra,
  };
}

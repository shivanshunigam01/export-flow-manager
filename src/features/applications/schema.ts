/**
 * Reusable Zod schema + TS type for a full Export Application, mirroring the
 * fields extracted from EXPORT_041_2X20FT_CONAKARY.xls (INVOICE / PACKING LIST
 * / ANNEXURE / VGM / COST tabs) and the EXP_82 invoice PDF template.
 */
import { z } from "zod";

export const containerSchema = z.object({
  container_no: z.string().default(""),
  line_seal_no: z.string().default(""),
  electronic_seal_no: z.string().default(""),
  size: z.string().default("20 FT"),
  quantity: z.string().default("1x20 FT"),
});

export const itemSchema = z.object({
  packages: z.coerce.number().optional().nullable(),
  description: z.string().default(""),
  quantity: z.coerce.number().optional().nullable(),
  unit: z.string().default("SQM"),
  rate: z.coerce.number().optional().nullable(),
  amount: z.coerce.number().optional().nullable(),
  net_weight: z.coerce.number().optional().nullable(),
  gross_weight: z.coerce.number().optional().nullable(),
});

export const applicationSchema = z.object({
  // Exporter
  exporter_name: z.string().default("SHREE HARI EXPORT HOUSE"),
  exporter_address: z.string().default("F-124, SHAKTI CHAMBER-1, 8-A NATIONAL HIGHWAY, MORBI, GUJARAT, INDIA"),
  iec_no: z.string().default(""),
  gst_no: z.string().default(""),
  bin_no: z.string().default(""),
  state_of_origin: z.string().default("GUJARAT"),
  lut_no: z.string().default(""),

  // Invoice
  invoice_no: z.string().default(""),
  invoice_date: z.string().default(""),
  invoice_currency: z.string().default("USD"),

  // Consignee etc
  consignee_name: z.string().default(""),
  consignee_address: z.string().default(""),
  notify_party: z.string().default(""),
  second_notify: z.string().default(""),
  third_party: z.string().default(""),

  // Ports / terms
  port_loading_text: z.string().default(""),
  port_discharge_text: z.string().default(""),
  country_origin: z.string().default("INDIA"),
  final_destination_text: z.string().default(""),
  payment_terms: z.string().default("100% AGAINST BL"),
  export_terms: z.string().default("FOB"),
  hsn_codes: z.string().default(""),
  products_desc: z.string().default(""),

  // Bank (denormalised freetext for quick print)
  bank_name: z.string().default(""),
  bank_account: z.string().default(""),
  bank_swift: z.string().default(""),
  bank_ifsc: z.string().default(""),

  // Totals
  loading_charge: z.coerce.number().default(0),
  amount_in_words: z.string().default(""),

  declaration: z.string().default("We declare that this Invoice show the actual price of the goods described and that all the particulars are true and correct"),

  containers: z.array(containerSchema).default([]),
  items: z.array(itemSchema).default([]),
});

export type ApplicationForm = z.infer<typeof applicationSchema>;

export function emptyApplication(): ApplicationForm {
  return applicationSchema.parse({
    containers: [
      { container_no: "", line_seal_no: "", electronic_seal_no: "", size: "20 FT", quantity: "1x20 FT" },
    ],
    items: [
      { packages: null, description: "", quantity: null, unit: "SQM", rate: null, amount: null, net_weight: null, gross_weight: null },
    ],
  });
}

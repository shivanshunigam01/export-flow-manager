/**
 * Commercial Invoice PDF generator — matches the "Shree Hari Export House"
 * EXP_82 template layout: exporter/details header block, consignee + bank
 * block, ports+terms band, container band, line items grid, totals, amount in
 * words, declaration + signature.
 */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ApplicationForm } from "@/features/applications/schema";

const line = (doc: jsPDF, x1: number, y1: number, x2: number, y2: number) => doc.line(x1, y1, x2, y2);

function drawBox(doc: jsPDF, x: number, y: number, w: number, h: number) {
  doc.rect(x, y, w, h);
}

function kv(doc: jsPDF, x: number, y: number, label: string, value: string, labelW = 22) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`${label} :-`, x, y);
  doc.setFont("helvetica", "bold");
  doc.text(value || "", x + labelW, y);
}

export function generateInvoicePDF(app: ApplicationForm & { app_no?: string }, mode: "invoice" | "packing" = "invoice") {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const M = 8;
  const innerW = W - M * 2;
  let y = M;

  // ===== Title band =====
  doc.setFillColor(240, 244, 252);
  doc.rect(M, y, innerW, 8, "F");
  doc.setDrawColor(30, 60, 130);
  doc.rect(M, y, innerW, 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 60, 130);
  doc.text(mode === "invoice" ? "INVOICE" : "PACKING LIST", W / 2, y + 5.6, { align: "center" });
  doc.setTextColor(0, 0, 0);
  y += 8;

  // ===== Exporter block (left) + Details (right) =====
  const blockH = 30;
  const half = innerW / 2;
  drawBox(doc, M, y, half, blockH);
  drawBox(doc, M + half, y, half, blockH);
  // Sub-header rows
  doc.setFillColor(248, 250, 253);
  doc.rect(M, y, half, 5, "F");
  doc.rect(M + half, y, half, 5, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8);
  doc.text("Exporter", M + 2, y + 3.5);
  doc.text("Details :-", M + half + 2, y + 3.5);
  line(doc, M, y + 5, M + innerW, y + 5);
  // Exporter body
  doc.setFont("helvetica", "bold"); doc.setFontSize(9.5);
  doc.text(app.exporter_name || "", M + 2, y + 10);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  const exLines = (app.exporter_address || "").split(",").map((s) => s.trim()).filter(Boolean);
  exLines.slice(0, 4).forEach((ln, i) => doc.text(ln, M + 2, y + 14 + i * 3.8));
  // Details body
  const dx = M + half + 2;
  kv(doc, dx, y + 10, "Invoice No", app.invoice_no || app.app_no || "");
  kv(doc, dx, y + 14, "Date", app.invoice_date || "");
  kv(doc, dx, y + 18, "IEC No", app.iec_no || "");
  kv(doc, dx, y + 22, "GST No", app.gst_no || "");
  kv(doc, dx, y + 26, "BIN No", app.bin_no || "");
  y += blockH;

  // ===== Consignee + Bank Details =====
  const consH = 30;
  drawBox(doc, M, y, half, consH);
  drawBox(doc, M + half, y, half, consH);
  doc.setFillColor(248, 250, 253);
  doc.rect(M, y, half, 5, "F"); doc.rect(M + half, y, half, 5, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8);
  doc.text("Consignee", M + 2, y + 3.5);
  doc.text(mode === "invoice" ? "BANK DETAILS :-" : "NOTIFY PARTY :-", M + half + 2, y + 3.5);
  doc.setFont("helvetica", "bold"); doc.setFontSize(9);
  doc.text(app.consignee_name || "", M + 2, y + 10);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  const csLines = (app.consignee_address || "").split("\n").flatMap((s) => s.split(",")).map((s) => s.trim()).filter(Boolean);
  csLines.slice(0, 4).forEach((ln, i) => doc.text(ln, M + 2, y + 14 + i * 3.8));
  // Bank / Notify
  doc.setFont("helvetica", "bold"); doc.setFontSize(9);
  if (mode === "invoice") {
    doc.text(app.bank_name || "", M + half + 2, y + 10);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
    doc.text(`A/C NO :- ${app.bank_account || ""}`, M + half + 2, y + 14);
    doc.text(`SWIFT CODE :- ${app.bank_swift || ""}`, M + half + 2, y + 18);
    doc.text(`IFSC CODE :- ${app.bank_ifsc || ""}`, M + half + 2, y + 22);
  } else {
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
    (app.notify_party || "").split("\n").slice(0, 4).forEach((ln, i) => doc.text(ln, M + half + 2, y + 10 + i * 3.8));
  }
  y += consH;

  // ===== Ports / terms band (4 col x 2 rows) =====
  const bandH = 22;
  drawBox(doc, M, y, innerW, bandH);
  const colW = innerW / 4;
  for (let i = 1; i < 4; i++) line(doc, M + colW * i, y, M + colW * i, y + bandH);
  line(doc, M, y + 5, M + innerW, y + 5);
  line(doc, M, y + bandH / 2, M + innerW, y + bandH / 2);
  line(doc, M, y + bandH / 2 + 5, M + innerW, y + bandH / 2 + 5);
  doc.setFillColor(248, 250, 253);
  doc.rect(M, y, innerW, 5, "F");
  doc.rect(M, y + bandH / 2, innerW, 5, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8);
  ["Port of Loading", "Port of Discharge", "Payment Terms", ""].forEach((t, i) => doc.text(t, M + colW * i + 2, y + 3.5));
  ["Country of Origin", "Final Destination", "H.S.N Code", ""].forEach((t, i) => doc.text(t, M + colW * i + 2, y + bandH / 2 + 3.5));
  doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  [app.port_loading_text, app.port_discharge_text, app.payment_terms, app.export_terms].forEach((v, i) => doc.text(String(v || ""), M + colW * i + 2, y + 9));
  [app.country_origin, app.final_destination_text, app.hsn_codes, app.products_desc].forEach((v, i) => doc.text(String(v || ""), M + colW * i + 2, y + bandH / 2 + 9));
  // right column upper: Export Terms label sits on right side header — draw
  doc.setFont("helvetica", "bold"); doc.setFontSize(8);
  doc.text("Export Terms", M + colW * 3 + 2, y + 3.5);
  doc.text("Products", M + colW * 3 + 2, y + bandH / 2 + 3.5);
  y += bandH;

  // ===== Containers table =====
  const containers = app.containers?.length ? app.containers : [{ container_no: "", line_seal_no: "", electronic_seal_no: "", size: "", quantity: "" }];
  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head: [["Container No.", "Line Seal No.", "Electronic Seal No.", "Container Quantity"]],
    body: containers.map((c) => [c.container_no, c.line_seal_no, c.electronic_seal_no, c.quantity]),
    theme: "grid",
    headStyles: { fillColor: [240, 244, 252], textColor: 20, fontSize: 8, fontStyle: "bold", halign: "left" },
    styles: { fontSize: 9, cellPadding: 1.5, lineColor: [80, 80, 80], lineWidth: 0.15 },
  });
  y = (doc as any).lastAutoTable.finalY;

  // ===== Line items =====
  const items = app.items ?? [];
  const totalAmount = items.reduce((s, it) => s + (Number(it.amount) || 0), 0) + (Number(app.loading_charge) || 0);
  const totalPkgs = items.reduce((s, it) => s + (Number(it.packages) || 0), 0);

  const head =
    mode === "invoice"
      ? [["No & Kind of Packages", "Description of Goods", "Quantity (Sets/Pcs)", "Unit", `Rate (in ${app.invoice_currency})`, `Amount (in ${app.invoice_currency})`]]
      : [["No & Packages", "Description of Goods", "Quantity", "Unit", "Net Weight (Kg)", "Gross Weight (Kg)"]];

  const body =
    mode === "invoice"
      ? items.map((it) => [it.packages ?? "", it.description, it.quantity ?? "", it.unit, it.rate ?? "", it.amount ?? ""])
      : items.map((it) => [it.packages ?? "", it.description, it.quantity ?? "", it.unit, it.net_weight ?? "", it.gross_weight ?? ""]);

  if (mode === "invoice" && app.loading_charge) {
    body.push(["", "LOADING CHARGE", "", "", "", app.loading_charge]);
  }
  body.push(["TOTAL", "", totalPkgs || "", "", "", mode === "invoice" ? totalAmount.toFixed(2) : ""]);

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head,
    body,
    theme: "grid",
    headStyles: { fillColor: [240, 244, 252], textColor: 20, fontSize: 8, fontStyle: "bold" },
    styles: { fontSize: 8.5, cellPadding: 1.5, lineColor: [80, 80, 80], lineWidth: 0.15 },
    columnStyles: { 4: { halign: "right" }, 5: { halign: "right" } },
  });
  y = (doc as any).lastAutoTable.finalY;

  // ===== Amount in words / Total row =====
  if (mode === "invoice") {
    drawBox(doc, M, y, innerW, 8);
    doc.setFont("helvetica", "bold"); doc.setFontSize(9);
    doc.text(`US $ :   ${app.amount_in_words || ""}`, M + 2, y + 5.4);
    doc.text(`Total (in ${app.invoice_currency}) $  ${totalAmount.toFixed(2)}`, M + innerW - 2, y + 5.4, { align: "right" });
    y += 8;
  }

  // ===== Declaration + signature block =====
  const declH = 28;
  drawBox(doc, M, y, half, declH);
  drawBox(doc, M + half, y, half, declH);
  doc.setFont("helvetica", "bold"); doc.setFontSize(8);
  doc.text("Declaration", M + 2, y + 4);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8);
  const declLines = doc.splitTextToSize(app.declaration || "", half - 4);
  doc.text(declLines, M + 2, y + 8);
  if (app.lut_no) doc.text(`LUT NO: ${app.lut_no}`, M + 2, y + declH - 3);
  // Right: exporter signature
  doc.setFont("helvetica", "bold"); doc.setFontSize(9);
  doc.text(app.exporter_name || "", M + half + 2, y + 6);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8);
  doc.text("For & on behalf of", M + half + 2, y + 11);
  doc.setFont("helvetica", "bold"); doc.setFontSize(8);
  doc.text("AUTHORISED SIGNATORY", M + half + 2, y + declH - 3);
  y += declH;

  // ===== Footer =====
  doc.setFontSize(7); doc.setTextColor(120);
  doc.text(`Generated by EAMS · ${new Date().toLocaleString()}`, W / 2, 290, { align: "center" });

  return doc;
}

export function downloadInvoicePDF(app: ApplicationForm & { app_no?: string }, filename?: string, mode: "invoice" | "packing" = "invoice") {
  const doc = generateInvoicePDF(app, mode);
  doc.save(filename || `${app.app_no || app.invoice_no || "invoice"}-${mode}.pdf`);
}

export function printInvoicePDF(app: ApplicationForm & { app_no?: string }, mode: "invoice" | "packing" = "invoice") {
  const doc = generateInvoicePDF(app, mode);
  doc.autoPrint();
  const url = doc.output("bloburl");
  window.open(url as unknown as string, "_blank");
}

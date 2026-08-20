export const APPLICATION_PIPELINE = [
  { stage_key: "created", stage_label: "Application Created" },
  { stage_key: "pi", stage_label: "Proforma Invoice" },
  { stage_key: "commercial_invoice", stage_label: "Commercial Invoice (FX)" },
  { stage_key: "payment_received", stage_label: "Payment Received" },
  { stage_key: "inr_invoice", stage_label: "INR Invoice" },
  { stage_key: "packing_stuffing", stage_label: "Packing & Stuffing" },
  { stage_key: "vgm_annexure", stage_label: "VGM / Annexure" },
  { stage_key: "dispatch", stage_label: "Dispatch" },
  { stage_key: "completed", stage_label: "Shipment Completed" },
] as const;

const STATUS_INDEX: Record<string, number> = {
  DRAFT: 0,
  SUBMITTED: 1,
  UNDER_REVIEW: 1,
  CHANGES_REQUIRED: 1,
  APPROVED: 2,
  IN_PROGRESS: 4,
  READY_FOR_DISPATCH: 6,
  DISPATCHED: 7,
  COMPLETED: 8,
  REJECTED: 1,
  CANCELLED: 0,
};

export type PipelineStage = {
  stage_key: string;
  stage_label: string;
  status: "completed" | "in_progress" | "pending";
};

function statusOf(raw: unknown): PipelineStage["status"] {
  const s = String(raw || "").toLowerCase();
  if (s === "completed" || s === "done") return "completed";
  if (s === "in_progress" || s === "current" || s === "active") return "in_progress";
  return "pending";
}

export function resolvePipeline(app: any): PipelineStage[] {
  const stored = Array.isArray(app?.stages) ? [...app.stages] : [];
  stored.sort((a, b) => Number(a?.seq ?? 0) - Number(b?.seq ?? 0));

  if (stored.length >= 6) {
    return stored.map((s, i, arr) => {
      const st = statusOf(s.status);
      const current = arr.findIndex((x) => statusOf(x.status) === "in_progress");
      if (st !== "pending") return { stage_key: s.stage_key || String(i), stage_label: s.stage_label || `Step ${i + 1}`, status: st };
      if (current < 0 && i === 0) return { stage_key: s.stage_key || String(i), stage_label: s.stage_label || `Step ${i + 1}`, status: "in_progress" };
      return { stage_key: s.stage_key || String(i), stage_label: s.stage_label || `Step ${i + 1}`, status: "pending" };
    });
  }

  const byKey = new Map(stored.map((s) => [String(s.stage_key), s]));
  let idx = APPLICATION_PIPELINE.findIndex((s) => s.stage_key === app?.current_stage);
  if (idx < 0) idx = STATUS_INDEX[String(app?.status || "DRAFT").toUpperCase()] ?? 0;
  if (app?.payment_received && idx < 3) idx = 3;
  if (app?.inr_invoice_no && idx < 4) idx = 4;
  if (String(app?.status).toUpperCase() === "COMPLETED") idx = 8;

  return APPLICATION_PIPELINE.map((s, i) => {
    const hit = byKey.get(s.stage_key);
    if (hit?.status) {
      return { stage_key: s.stage_key, stage_label: hit.stage_label || s.stage_label, status: statusOf(hit.status) };
    }
    return {
      stage_key: s.stage_key,
      stage_label: s.stage_label,
      status: i < idx ? "completed" : i === idx ? "in_progress" : "pending",
    };
  });
}

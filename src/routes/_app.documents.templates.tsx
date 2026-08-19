import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/documents/templates")({
  component: () => (
    <div className="space-y-4">
      <h1 className="text-xl font-serif font-bold">Document Templates</h1>
      <p className="text-xs text-muted-foreground">Official PDFs use the Shree Hari letterhead, partner seal and destination flags. Exact Excel cell art can be refined when additional formats are supplied.</p>
      <div className="gov-panel p-6 text-sm space-y-2">
        <div>Commercial Invoice — EXP 136 layout</div>
        <div>Proforma Invoice — YOSEOH PI layout</div>
        <div>Packing List — with per-piece breakdown</div>
        <div>CGST Annexure</div>
        <div>VGM Annexure-1</div>
      </div>
    </div>
  ),
});

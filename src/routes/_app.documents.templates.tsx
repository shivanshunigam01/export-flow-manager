import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "./_app.documents.index";

export const Route = createFileRoute("/_app/documents/templates")({
  component: () => <StubPage title="Document Templates" note="Templates for Quotation, PI, Commercial Invoice, Packing List, BL, Shipping Bill, Certificates and more." />,
});

import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "./_app.documents.index";

export const Route = createFileRoute("/_app/reports")({
  component: () => <StubPage title="Reports" note="Pending applications, country-wise exports, monthly/yearly analysis, payment tracking." />,
});

import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "./_app.documents.index";

export const Route = createFileRoute("/_app/notifications")({
  component: () => <StubPage title="Notifications" note="Pending approvals, certificate expiries, shipment due, payment due alerts." />,
});

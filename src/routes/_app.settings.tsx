import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "./_app.documents.index";

export const Route = createFileRoute("/_app/settings")({
  component: () => <StubPage title="Settings" note="Company details, defaults, backup & restore, offline configuration." />,
});

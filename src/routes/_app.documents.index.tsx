import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";

function StubPage({ title, note }: { title: string; note: string }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-serif font-bold">{title}</h1>
        <p className="text-xs text-muted-foreground">{note}</p>
      </div>
      <div className="gov-panel p-10 text-center">
        <Construction className="h-10 w-10 mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground mt-3">This module is scaffolded and will be built in the next phase.</p>
      </div>
    </div>
  );
}

export { StubPage };
export const Route = createFileRoute("/_app/documents/")({
  component: () => <StubPage title="Document Library" note="Every application auto-generates its documents. Manage, version, download and print here." />,
});

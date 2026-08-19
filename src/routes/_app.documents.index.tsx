import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api, downloadDocument } from "@/lib/api";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/documents/")({
  component: DocumentsPage,
});

function DocumentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["documents-lib"],
    queryFn: () => api<any[]>("/api/documents"),
  });
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-serif font-bold">Document Library</h1>
        <p className="text-xs text-muted-foreground">Generated invoices, packing lists, annexures, VGM and uploads.</p>
      </div>
      <div className="gov-panel">
        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead><tr><th>Type</th><th>File</th><th>Status</th><th>Version</th><th></th></tr></thead>
            <tbody>
              {isLoading && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Loading…</td></tr>}
              {(data ?? []).map((d) => (
                <tr key={d.id}>
                  <td>{d.document_type}</td>
                  <td>{d.file_name}</td>
                  <td>{d.status}</td>
                  <td>v{d.version}</td>
                  <td><Button size="sm" variant="outline" onClick={() => downloadDocument(d.id, d.file_name)}>Download</Button></td>
                </tr>
              ))}
              {!isLoading && !data?.length && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No documents yet. Generate them from an application.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

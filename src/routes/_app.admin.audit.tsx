import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/features/auth/auth-context";
import { format } from "date-fns";

export const Route = createFileRoute("/_app/admin/audit")({
  component: AuditPage,
});

function AuditPage() {
  const { can } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["audit"],
    queryFn: () => api<any[]>("/api/audit-logs"),
    enabled: can("audit_logs.view"),
  });
  if (!can("audit_logs.view")) return <div className="p-8 text-sm">No access.</div>;
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-serif font-bold">Audit Logs</h1>
      <div className="gov-panel overflow-x-auto">
        <table className="gov-table">
          <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Entity</th><th>Description</th></tr></thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="text-center py-8">Loading…</td></tr>}
            {(data ?? []).map((r) => (
              <tr key={r.id}>
                <td className="text-xs">{r.created_at ? format(new Date(r.created_at), "dd MMM yyyy HH:mm") : "—"}</td>
                <td className="text-xs">{r.user_name || r.user_id}</td>
                <td className="font-mono text-xs">{r.action}</td>
                <td className="text-xs">{r.entity_type}</td>
                <td className="text-xs">{r.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

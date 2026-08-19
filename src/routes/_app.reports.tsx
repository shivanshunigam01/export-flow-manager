import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/features/auth/auth-context";
import { StatusBadge } from "./_app.index";

export const Route = createFileRoute("/_app/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const { can } = useAuth();
  const { data: apps } = useQuery({
    queryKey: ["report-apps"],
    queryFn: () => api<any[]>("/api/reports/applications"),
    enabled: can("reports.view"),
  });
  const { data: countries } = useQuery({
    queryKey: ["report-countries"],
    queryFn: () => api<{ country: string; count: number }[]>("/api/reports/countries"),
    enabled: can("reports.view"),
  });

  if (!can("reports.view")) return <div className="p-8 text-sm">You do not have access to reports.</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-serif font-bold">Reports</h1>
      <div className="gov-panel">
        <div className="gov-panel-header"><span>Applications by country</span></div>
        <table className="gov-table">
          <thead><tr><th>Country</th><th>Count</th></tr></thead>
          <tbody>
            {(countries ?? []).map((c) => <tr key={c.country}><td>{c.country}</td><td>{c.count}</td></tr>)}
          </tbody>
        </table>
      </div>
      <div className="gov-panel">
        <div className="gov-panel-header"><span>Applications ({apps?.length ?? 0})</span></div>
        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead><tr><th>App</th><th>Customer</th><th>Country</th><th>Status</th><th>Amount</th></tr></thead>
            <tbody>
              {(apps ?? []).map((a) => (
                <tr key={a.id}>
                  <td className="font-mono">{a.app_no}</td>
                  <td>{a.consignee_name}</td>
                  <td>{a.final_destination_text}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>{a.total_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

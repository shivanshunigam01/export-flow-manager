import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_LABELS } from "@/features/auth/auth-context";

export const Route = createFileRoute("/_app/admin/users")({
  component: UsersPage,
});

function UsersPage() {
  const { data } = useQuery({
    queryKey: ["all-profiles"],
    queryFn: async () => {
      const { data: profiles } = await supabase.from("profiles").select("id,email,full_name,created_at");
      const { data: roles } = await supabase.from("user_roles").select("user_id,role");
      const byUser: Record<string, string[]> = {};
      (roles ?? []).forEach((r: any) => {
        byUser[r.user_id] = [...(byUser[r.user_id] ?? []), r.role];
      });
      return (profiles ?? []).map((p: any) => ({ ...p, roles: byUser[p.id] ?? [] }));
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-serif font-bold">Users & Roles</h1>
        <p className="text-xs text-muted-foreground">All portal users and their assigned roles.</p>
      </div>
      <div className="gov-panel">
        <div className="gov-panel-header"><span>Users ({data?.length ?? 0})</span></div>
        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead><tr><th>Name</th><th>Email</th><th>Roles</th></tr></thead>
            <tbody>
              {(data ?? []).map((u: any) => (
                <tr key={u.id}>
                  <td>{u.full_name ?? "—"}</td>
                  <td>{u.email}</td>
                  <td>{u.roles.map((r: any) => ROLE_LABELS[r as keyof typeof ROLE_LABELS] ?? r).join(", ") || "—"}</td>
                </tr>
              ))}
              {!data?.length && <tr><td colSpan={3} className="text-center py-8 text-muted-foreground">No users</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

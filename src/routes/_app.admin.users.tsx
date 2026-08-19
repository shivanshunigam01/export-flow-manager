import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ROLE_LABELS, type AppRole, useAuth } from "@/features/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Plus, Pencil, UserX } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/users")({
  component: UsersPage,
});

interface Staff {
  id: string;
  name: string;
  full_name?: string;
  email: string;
  role: AppRole;
  roles: AppRole[];
  countries: string[];
  active: boolean;
}

const EMPTY = {
  name: "",
  email: "",
  password: "",
  role: "documentation" as AppRole,
  countries: "",
  active: true,
};

function UsersPage() {
  const { isAdmin, can } = useAuth();
  if (!can("users.view")) return <div className="p-8 text-sm">You do not have access to Users & Roles.</div>;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: () => api<Staff[]>("/api/users"),
  });

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }

  function openEdit(row: Staff) {
    setEditing(row);
    setForm({
      name: row.name || row.full_name || "",
      email: row.email,
      password: "",
      role: row.role,
      countries: (row.countries ?? []).join(", "),
      active: row.active,
    });
    setOpen(true);
  }

  async function save() {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    if (!editing && form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setBusy(true);
    try {
      const countries = form.countries
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      if (editing) {
        const payload: Record<string, unknown> = {
          name: form.name,
          email: form.email,
          role: form.role,
          countries,
          active: form.active,
        };
        if (form.password) payload.password = form.password;
        await api(`/api/users/${editing.id}`, { method: "PATCH", json: payload });
        toast.success("Staff updated — they can sign in with these details");
      } else {
        await api("/api/users", {
          method: "POST",
          json: {
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role,
            countries,
            active: form.active,
          },
        });
        toast.success("Staff created — they can sign in now");
      }
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["staff"] });
    } catch (e: any) {
      toast.error(e.message ?? "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function deactivate(row: Staff) {
    if (!window.confirm(`Deactivate ${row.email}? They will not be able to sign in.`)) return;
    try {
      await api(`/api/users/${row.id}`, { method: "DELETE" });
      toast.success("Staff deactivated");
      qc.invalidateQueries({ queryKey: ["staff"] });
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-serif font-bold">Users & Roles</h1>
          <p className="text-xs text-muted-foreground">
            Create staff accounts here. Each person signs in on the login page with their own email and password. Access follows their role and assigned countries.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openNew}>
            <Plus className="h-4 w-4 mr-2" /> New Staff
          </Button>
        )}
      </div>

      <div className="gov-panel">
        <div className="gov-panel-header"><span>Staff ({data?.length ?? 0})</span></div>
        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Countries</th>
                <th>Status</th>
                <th>Last Login</th>
                {isAdmin && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Loading…</td></tr>
              )}
              {(data ?? []).map((u) => (
                <tr key={u.id}>
                  <td className="font-medium">{u.name || u.full_name || "—"}</td>
                  <td>{u.email}</td>
                  <td>{ROLE_LABELS[u.role] ?? u.role}</td>
                  <td className="text-xs">{(u.countries ?? []).join(", ") || "—"}</td>
                  <td>
                    <Badge variant={u.active ? "secondary" : "outline"} className={u.active ? "bg-success/10 text-success border-0" : ""}>
                      {u.active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="text-xs">{(u as any).lastLoginAt ? String((u as any).lastLoginAt).slice(0, 16) : "—"}</td>
                  {isAdmin && (
                    <td className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(u)}><Pencil className="h-3.5 w-3.5" /></Button>
                      {u.active && (
                        <Button variant="ghost" size="icon" onClick={() => deactivate(u)}><UserX className="h-3.5 w-3.5 text-destructive" /></Button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {!isLoading && !data?.length && (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No staff yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit staff" : "Create staff account"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <Label>Full name</Label>
              <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Email (login)</Label>
              <Input className="mt-1" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>{editing ? "New password (leave blank to keep)" : "Password"}</Label>
              <Input className="mt-1" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as AppRole })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROLE_LABELS) as AppRole[]).map((r) => (
                    <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.active ? "active" : "inactive"} onValueChange={(v) => setForm({ ...form, active: v === "active" })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Assigned countries</Label>
              <Input
                className="mt-1"
                placeholder="Sri Lanka, Nigeria — or ALL"
                value={form.countries}
                onChange={(e) => setForm({ ...form, countries: e.target.value })}
              />
              <p className="text-[11px] text-muted-foreground mt-1">Comma-separated. Use ALL for unrestricted country access.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={busy}>{busy ? "Saving…" : editing ? "Update" : "Create staff"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PRIMARY_ADMIN_EMAIL, PRIMARY_ADMIN_NAME, ROLE_HELP, ROLE_LABELS, type AppRole, useAuth } from "@/features/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Plus, Pencil, UserX, Copy } from "lucide-react";
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

const STAFF_ROLES: AppRole[] = [
  "documentation",
  "sales",
  "accounts",
  "manager",
  "warehouse",
  "production",
  "purchase",
  "quality",
  "viewer",
  "ceo",
  "admin",
  "super_admin",
];

const EMPTY = {
  name: "",
  email: "",
  password: "",
  role: "documentation" as AppRole,
  countries: "ALL",
  active: true,
};

function isPrimaryAdmin(row: { email?: string }) {
  return String(row.email || "").toLowerCase() === PRIMARY_ADMIN_EMAIL;
}

function UsersPage() {
  const { isAdmin, can } = useAuth();
  const canManage = isAdmin || can("users.create");
  if (!can("users.view") && !canManage) {
    return <div className="p-8 text-sm">You do not have access to Users & Roles.</div>;
  }
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: () => api<Staff[]>("/api/users"),
  });

  function openNew() {
    setEditing(null);
    setCreated(null);
    setForm(EMPTY);
    setOpen(true);
  }

  function openEdit(row: Staff) {
    setEditing(row);
    setCreated(null);
    setForm({
      name: isPrimaryAdmin(row) ? PRIMARY_ADMIN_NAME : row.name || row.full_name || "",
      email: row.email,
      password: "",
      role: row.role,
      countries: (row.countries ?? []).join(", ") || "ALL",
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
      const scoped = countries.length ? countries : ["ALL"];
      if (editing) {
        const payload: Record<string, unknown> = {
          name: form.name,
          email: form.email,
          role: form.role,
          countries: scoped,
          active: form.active,
        };
        if (form.password) payload.password = form.password;
        await api(`/api/users/${editing.id}`, { method: "PATCH", json: payload });
        toast.success("Staff updated — they can sign in with these details");
        setOpen(false);
      } else {
        await api("/api/users", {
          method: "POST",
          json: {
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role,
            countries: scoped,
            active: form.active,
          },
        });
        setCreated({ email: form.email, password: form.password });
        toast.success("Staff created — they can sign in now");
      }
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-serif font-bold">Users & Roles</h1>
          <p className="text-xs text-muted-foreground max-w-2xl">
            Administrator <strong>{PRIMARY_ADMIN_NAME}</strong> can add as many staff members as needed.
            Each person signs in with the email and password you set. Use <strong>Staff — Documentation</strong> or <strong>Staff — Sales</strong> so they can create applications, PI, and invoices.
          </p>
        </div>
        {canManage && (
          <Button onClick={openNew}>
            <Plus className="h-4 w-4 mr-2" /> Add staff
          </Button>
        )}
      </div>

      <div className="rounded-[2px] border border-[#d9d9d9] bg-white px-4 py-3 text-sm">
        <div className="font-semibold">{PRIMARY_ADMIN_NAME} · Administrator</div>
        <p className="text-xs text-muted-foreground mt-1">
          Signed in as the portal admin. Add multiple staff accounts below — documentation, sales, accounts, warehouse, and more. Each staff member gets their own login.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {[
          ["1", "Add staff", "Name, email, password, role"],
          ["2", "They sign in", "Same login page as admin"],
          ["3", "They work", "Create PI, applications, invoices"],
        ].map(([n, t, d]) => (
          <div key={n} className="gov-panel p-3">
            <div className="text-[10px] font-mono text-primary">{n}</div>
            <div className="text-sm font-semibold mt-0.5">{t}</div>
            <div className="text-[11px] text-muted-foreground">{d}</div>
          </div>
        ))}
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
                {canManage && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Loading…</td></tr>
              )}
              {(data ?? []).map((u) => (
                <tr key={u.id}>
                  <td className="font-medium">
                    {isPrimaryAdmin(u) ? PRIMARY_ADMIN_NAME : u.name || u.full_name || "—"}
                    {isPrimaryAdmin(u) && (
                      <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-0">Admin</Badge>
                    )}
                  </td>
                  <td>{u.email}</td>
                  <td>{ROLE_LABELS[u.role] ?? u.role}</td>
                  <td className="text-xs">{(u.countries ?? []).join(", ") || "—"}</td>
                  <td>
                    <Badge variant={u.active ? "secondary" : "outline"} className={u.active ? "bg-success/10 text-success border-0" : ""}>
                      {u.active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="text-xs">{(u as any).lastLoginAt ? String((u as any).lastLoginAt).slice(0, 16) : "—"}</td>
                  {canManage && (
                    <td className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(u)}><Pencil className="h-3.5 w-3.5" /></Button>
                      {u.active && !isPrimaryAdmin(u) && (
                        <Button variant="ghost" size="icon" onClick={() => deactivate(u)}><UserX className="h-3.5 w-3.5 text-destructive" /></Button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {!isLoading && !data?.length && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    No staff yet. Click <button type="button" className="underline text-primary" onClick={openNew}>Add staff</button>.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? (isPrimaryAdmin(editing) ? `Edit ${PRIMARY_ADMIN_NAME}` : "Edit staff") : "Add staff account"}</DialogTitle>
            <DialogDescription>
              {created
                ? "Share these details with the staff member. They use the same staff sign-in page."
                : editing && isPrimaryAdmin(editing)
                  ? `${PRIMARY_ADMIN_NAME} is the fixed administrator. Staff accounts are added separately.`
                  : "Give them Documentation or Sales so they can create applications, PI, and invoices. You can add as many staff as you need."}
            </DialogDescription>
          </DialogHeader>

          {created ? (
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-1">
                <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{created.email}</span></div>
                <div><span className="text-muted-foreground">Password:</span> <span className="font-medium">{created.password}</span></div>
                <div className="text-[11px] text-muted-foreground pt-1">Login: the same Staff sign-in screen.</div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  void navigator.clipboard.writeText(`${created.email} / ${created.password}`);
                  toast.success("Copied login details");
                }}
              >
                <Copy className="h-4 w-4 mr-2" /> Copy details
              </Button>
              <DialogFooter>
                <Button
                  onClick={() => {
                    setCreated(null);
                    setForm(EMPTY);
                  }}
                >
                  Add another
                </Button>
                <Button variant="outline" onClick={() => setOpen(false)}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <Label>Full name</Label>
                  <Input
                    className="mt-1"
                    value={editing && isPrimaryAdmin(editing) ? PRIMARY_ADMIN_NAME : form.name}
                    disabled={Boolean(editing && isPrimaryAdmin(editing))}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Email (login)</Label>
                  <Input
                    className="mt-1"
                    type="email"
                    value={form.email}
                    disabled={Boolean(editing && isPrimaryAdmin(editing))}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>{editing ? "New password (leave blank to keep)" : "Password"}</Label>
                  <Input className="mt-1" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Label>Role</Label>
                  <Select
                    value={form.role}
                    onValueChange={(v) => setForm({ ...form, role: v as AppRole })}
                    disabled={Boolean(editing && isPrimaryAdmin(editing))}
                  >
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STAFF_ROLES.map((r) => (
                        <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground mt-1">{ROLE_HELP[form.role]}</p>
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
                <div>
                  <Label>Assigned countries</Label>
                  <Input
                    className="mt-1"
                    placeholder="ALL"
                    value={form.countries}
                    onChange={(e) => setForm({ ...form, countries: e.target.value })}
                  />
                </div>
                <p className="md:col-span-2 text-[11px] text-muted-foreground">
                  Use <span className="font-medium">ALL</span> so they can work on every destination. Or comma-separated countries, e.g. Sri Lanka, Nigeria.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={save} disabled={busy}>{busy ? "Saving…" : editing ? "Update" : "Create staff"}</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

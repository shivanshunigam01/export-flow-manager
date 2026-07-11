import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export interface MasterField {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea";
  required?: boolean;
}

interface Props {
  title: string;
  description?: string;
  table: string;
  fields: MasterField[];
  displayColumns: string[];
  columnLabels?: Record<string, string>;
}

export function MasterCrud({ title, description, table, fields, displayColumns, columnLabels = {} }: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["master", table],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from(table).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  function openNew() { setEditing(null); setForm({}); setOpen(true); }
  function openEdit(row: any) { setEditing(row); setForm({ ...row }); setOpen(true); }

  async function save() {
    const payload: any = {};
    for (const f of fields) payload[f.name] = form[f.name] ?? null;
    if (editing) {
      const { error } = await (supabase as any).from(table).update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Updated");
    } else {
      const { error } = await (supabase as any).from(table).insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Created");
    }
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["master", table] });
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this record?")) return;
    const { error } = await (supabase as any).from(table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["master", table] });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-serif font-bold">{title}</h1>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> New</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? `Edit ${title.slice(0, -1)}` : `New ${title.slice(0, -1)}`}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fields.map((f) => (
                <div key={f.name} className={f.type === "textarea" ? "md:col-span-2" : ""}>
                  <Label className="gov-label">{f.label}{f.required && " *"}</Label>
                  {f.type === "textarea" ? (
                    <textarea rows={3} value={form[f.name] ?? ""} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm" />
                  ) : (
                    <Input type={f.type ?? "text"} value={form[f.name] ?? ""} onChange={(e) => setForm({ ...form, [f.name]: f.type === "number" ? Number(e.target.value) || null : e.target.value })} className="mt-1" />
                  )}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>{editing ? "Update" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="gov-panel">
        <div className="gov-panel-header"><span>{title} ({data?.length ?? 0})</span></div>
        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                {displayColumns.map((c) => <th key={c}>{columnLabels[c] ?? c}</th>)}
                <th className="w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={displayColumns.length + 1} className="text-center py-8 text-muted-foreground">Loading…</td></tr>}
              {(data ?? []).map((row) => (
                <tr key={row.id}>
                  {displayColumns.map((c) => <td key={c}>{row[c] ?? "—"}</td>)}
                  <td className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(row)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(row.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
              {!isLoading && !data?.length && <tr><td colSpan={displayColumns.length + 1} className="text-center py-8 text-muted-foreground">No records yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

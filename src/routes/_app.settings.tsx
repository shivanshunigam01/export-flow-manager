import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/features/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { can } = useAuth();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["settings"], queryFn: () => api<any>("/api/settings") });
  const [form, setForm] = useState<any>(null);
  const value = form ?? data ?? {};

  if (!can("settings.manage")) return <div className="p-8 text-sm">Only administrators can change company settings.</div>;

  async function save() {
    try {
      await api("/api/settings", { method: "PATCH", json: value });
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["settings"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  function set(k: string, v: string) {
    setForm({ ...value, [k]: v });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-serif font-bold">Company Settings</h1>
      <div className="gov-panel p-4 grid md:grid-cols-2 gap-3">
        {[
          ["companyName", "Company name"],
          ["letterheadAddress", "Letterhead address"],
          ["exporterAddress", "Invoice exporter address"],
          ["iec", "IEC"],
          ["gstin", "GSTIN"],
          ["aeo", "AEO"],
          ["bin", "BIN"],
          ["lutNo", "LUT No"],
          ["documentYear", "Document year (e.g. 2025-26 or 2028)"],
          ["phone", "Phone"],
          ["website", "Website"],
        ].map(([k, label]) => (
          <div key={k}>
            <Label className="gov-label">{label}</Label>
            <Input className="mt-1" value={value[k] ?? ""} onChange={(e) => set(k, e.target.value)} />
          </div>
        ))}
        <div className="md:col-span-2">
          <Button onClick={save}>Save settings</Button>
        </div>
      </div>
    </div>
  );
}

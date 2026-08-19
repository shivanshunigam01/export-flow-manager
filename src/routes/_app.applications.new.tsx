import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ApplicationForm } from "@/features/applications/application-form";
import { applicationPayload, type ApplicationForm as AppFormType } from "@/features/applications/schema";
import { api } from "@/lib/api";
import { useAuth } from "@/features/auth/auth-context";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_app/applications/new")({
  component: NewApp,
});

function NewApp() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [busy, setBusy] = useState(false);

  async function submit(data: AppFormType) {
    if (!can("applications.create")) { toast.error("You cannot create applications"); return; }
    setBusy(true);
    try {
      const inserted = await api<{ id: string; app_no: string }>("/api/applications", {
        method: "POST",
        json: applicationPayload(data),
      });
      toast.success(`Application ${inserted.app_no} created`);
      navigate({ to: "/applications/$id", params: { id: inserted.id } });
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-serif font-bold">New Export Application</h1>
        <p className="text-xs text-muted-foreground">Save a draft, then submit for admin approval. PDFs match the company Invoice / Packing List / Annexure / VGM formats.</p>
      </div>
      <ApplicationForm onSubmit={submit} submitting={busy} />
    </div>
  );
}

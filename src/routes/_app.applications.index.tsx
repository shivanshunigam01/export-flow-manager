import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useAuth } from "@/features/auth/auth-context";
import { ApplicationCard } from "@/features/applications/application-card";
import { ListPagination } from "@/features/applications/list-pagination";

export const Route = createFileRoute("/_app/applications/")({
  component: ApplicationsList,
});

function ApplicationsList() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [view, setView] = useState<"all" | "mine" | "pending" | "drafts">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { can } = useAuth();

  const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
  if (q) params.set("search", q);
  if (status) params.set("status", status);
  if (view === "mine") params.set("mine", "1");
  if (view === "pending") params.set("pending", "1");
  if (view === "drafts") params.set("drafts", "1");

  const { data, isLoading } = useQuery({
    queryKey: ["applications-list", q, status, view, page, pageSize],
    queryFn: () => api<{ items: any[]; total: number; page: number }>(`/api/applications?${params.toString()}`),
  });

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-serif font-bold">Applications</h1>
          <p className="text-xs text-muted-foreground">Every export shipment is shown as a full record, with its current stage</p>
        </div>
        {can("applications.create") && (
          <Button onClick={() => navigate({ to: "/applications/new" })}>
            <Plus className="h-4 w-4 mr-2" /> New Application
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "mine", "drafts", "pending"] as const).map((v) => (
          <Button key={v} size="sm" variant={view === v ? "default" : "outline"} onClick={() => { setView(v); setPage(1); }}>
            {v === "all" ? "All" : v === "mine" ? "My Applications" : v === "drafts" ? "Drafts" : "Pending Approval"}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-[2px] border border-[#d9d9d9] bg-white px-3 py-2">
        <span className="text-sm font-medium">Applications ({total})</span>
        <div className="flex gap-2">
          <select className="h-8 text-xs border rounded-[2px] px-2 bg-white" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            {["DRAFT","SUBMITTED","UNDER_REVIEW","CHANGES_REQUIRED","APPROVED","IN_PROGRESS","DISPATCHED","COMPLETED","REJECTED"].map((s) => (
              <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
            ))}
          </select>
          <div className="relative w-64">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search…" className="pl-8 h-8 text-sm rounded-[2px]" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading && (
          <div className="rounded-[2px] border border-[#d9d9d9] bg-white py-16 text-center text-sm text-muted-foreground">
            Loading applications…
          </div>
        )}
        {!isLoading && rows.map((a: any, i: number) => (
          <ApplicationCard
            key={a.id}
            app={a}
            index={i}
            onChanged={() => {
              void qc.invalidateQueries({ queryKey: ["applications-list"] });
              void qc.invalidateQueries({ queryKey: ["notifications"] });
            }}
          />
        ))}
        {!isLoading && !rows.length && (
          <div className="rounded-[2px] border border-[#d9d9d9] bg-white py-16 text-center text-sm text-muted-foreground">
            No applications
          </div>
        )}
      </div>

      <ListPagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPage={setPage}
        onPageSize={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </div>
  );
}

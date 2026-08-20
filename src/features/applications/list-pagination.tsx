import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const PAGE_SIZES = [10, 25, 50, 100];

export function ListPagination({
  page,
  pageSize,
  total,
  onPage,
  onPageSize,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const [goto, setGoto] = useState(String(page));

  useEffect(() => {
    setGoto(String(page));
  }, [page]);

  function jump(next: number) {
    const clamped = Math.min(pages, Math.max(1, next));
    onPage(clamped);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
      <div className="flex flex-wrap items-center gap-4 text-[13px] text-[#555]">
        <label className="flex items-center gap-2">
          <span>Rows Per Page</span>
          <select
            className="h-8 min-w-[64px] rounded-[2px] border border-[#cfcfcf] bg-white px-2 text-sm"
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span>Go To</span>
          <input
            className="h-8 w-14 rounded-[2px] border border-[#cfcfcf] bg-white px-2 text-center text-sm"
            value={goto}
            onChange={(e) => setGoto(e.target.value.replace(/\D/g, ""))}
            onBlur={() => jump(Number(goto) || 1)}
            onKeyDown={(e) => {
              if (e.key === "Enter") jump(Number(goto) || 1);
            }}
            inputMode="numeric"
          />
        </label>
        <span className="text-[12px] text-muted-foreground">
          {total} application{total === 1 ? "" : "s"}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-[2px]" disabled={page <= 1} onClick={() => jump(1)} aria-label="First page">
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-[2px]" disabled={page <= 1} onClick={() => jump(page - 1)} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="grid h-8 min-w-8 place-items-center rounded-[2px] bg-primary px-2.5 text-sm font-semibold text-primary-foreground">
          {page}
        </span>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-[2px]" disabled={page >= pages} onClick={() => jump(page + 1)} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-[2px]" disabled={page >= pages} onClick={() => jump(pages)} aria-label="Last page">
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

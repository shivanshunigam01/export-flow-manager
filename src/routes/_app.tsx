import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Sidebar } from "@/features/layout/sidebar";
import { TopBar } from "@/features/layout/topbar";
import { useAuth } from "@/features/auth/auth-context";
import { useEffect } from "react";
import mark from "@/assets/shreehari-mark.png";

export const Route = createFileRoute("/_app")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#111111] text-white">
        <div className="flex flex-col items-center gap-4">
          <img src={mark} alt="Shreehari" className="h-16 w-16 rounded-2xl object-cover ring-1 ring-white/10" />
          <div className="h-1 w-28 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-pulse bg-[#FF7E00]" />
          </div>
          <p className="text-xs text-white/55 tracking-wide">Loading staff portal…</p>
        </div>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f6f4f1]">
      <TopBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

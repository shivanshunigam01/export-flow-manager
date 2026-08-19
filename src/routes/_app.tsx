import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Sidebar } from "@/features/layout/sidebar";
import { TopBar } from "@/features/layout/topbar";
import { useAuth } from "@/features/auth/auth-context";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

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
      <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">
        Loading portal…
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/30">
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

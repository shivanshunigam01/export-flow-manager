import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth, ROLE_LABELS, type AppRole } from "@/features/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
});

function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("signin");

  useEffect(() => { if (!loading && user) navigate({ to: "/" }); }, [loading, user, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<AppRole>("documentation");
  const [busy, setBusy] = useState(false);

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) toast.error(error); else toast.success("Signed in");
  }
  async function onSignUp(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    const { error } = await signUp(email, password, fullName, role);
    setBusy(false);
    if (error) toast.error(error);
    else toast.success("Account created — check your email if confirmation is required, or sign in.");
  }

  return (
    <div className="min-h-screen bg-muted/30 grid place-items-center p-4">
      <div className="w-full max-w-md">
        {/* Gov banner */}
        <div className="rounded-t-lg overflow-hidden border border-b-0">
          <div className="bg-gov-header text-white px-4 py-2 text-[11px]">Ministry of Commerce · Export Documentation Wing</div>
          <div className="h-1 bg-gov-strip" />
        </div>
        <div className="bg-card border rounded-b-lg p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded bg-primary text-primary-foreground grid place-items-center font-bold">EA</div>
            <div>
              <div className="font-serif font-bold text-lg leading-tight">EAMS Portal</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Sign in to continue</div>
            </div>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-4">
              <form onSubmit={onSignIn} className="space-y-3">
                <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                <Button className="w-full" disabled={busy}><Shield className="h-4 w-4 mr-2" />{busy ? "Signing in…" : "Sign in"}</Button>
              </form>
            </TabsContent>
            <TabsContent value="signup" className="mt-4">
              <form onSubmit={onSignUp} className="space-y-3">
                <div><Label>Full name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
                <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
                <div>
                  <Label>Role</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ROLE_LABELS) as AppRole[]).map((r) => (
                        <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" disabled={busy}>{busy ? "Creating…" : "Create account"}</Button>
                <p className="text-[11px] text-muted-foreground">First user should register as Super Admin.</p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
        <p className="text-center text-[11px] text-muted-foreground mt-4">© EAMS · Secured with role-based access control</p>
      </div>
    </div>
  );
}

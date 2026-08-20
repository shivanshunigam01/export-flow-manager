import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { homePathForRole, useAuth } from "@/features/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Shield } from "lucide-react";
import loginArt from "@/assets/export-import-login.png";
import logo from "@/assets/shreehari-logo.png";
import mark from "@/assets/shreehari-mark.png";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
});

function AuthPage() {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@srihari.co");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: homePathForRole(user.role) });
  }, [loading, user, navigate]);

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) toast.error(error);
    else toast.success("Signed in");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <img
        src={loginArt}
        alt=""
        className="absolute inset-0 h-full w-full object-cover scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black/82 to-[#2a1404]/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
      <img
        src={mark}
        alt=""
        className="pointer-events-none absolute -right-24 top-1/2 h-[70vh] w-[70vh] -translate-y-1/2 opacity-[0.18] blur-[1px]"
      />
      <div className="pointer-events-none absolute left-1/3 top-1/4 h-72 w-72 rounded-full bg-[#FF7E00]/20 blur-[120px]" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-2 lg:px-8">
        <div className="hidden lg:flex flex-col justify-between min-h-[70vh]">
          <img src={logo} alt="Shreehari Export House" className="h-16 w-auto object-contain object-left drop-shadow-[0_8px_30px_rgba(255,126,0,0.25)]" />
          <div className="max-w-lg space-y-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#FF7E00] font-medium">Staff portal</p>
            <h1 className="font-serif text-5xl font-bold leading-[1.1]">
              Export. Import.<br />Documented.
            </h1>
            <p className="text-white/70 text-sm leading-relaxed max-w-md">
              Sign in with the account issued by administrator Kishore Patel. Access follows your role and assigned countries.
            </p>
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                ["01", "Staff login"],
                ["02", "Role access"],
                ["03", "Country scope"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-3 py-3">
                  <div className="text-[10px] font-mono text-[#FF7E00]">{k}</div>
                  <div className="text-sm font-medium mt-1">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md">
            <div className="mb-8 flex justify-center lg:hidden">
              <img src={logo} alt="Shreehari Export House" className="h-14 w-auto object-contain" />
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/55 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
              <div className="h-1 bg-gradient-to-r from-[#3C3C3B] via-[#FF7E00] to-[#3C3C3B]" />
              <div className="p-7 sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <img src={mark} alt="" className="h-11 w-11 rounded-xl object-cover ring-1 ring-white/10" />
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">Staff sign in</h2>
                    <p className="text-xs text-white/55 mt-0.5">Use your issued work email</p>
                  </div>
                </div>

                <form onSubmit={onSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-white/80">Work email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="username"
                      className="mt-1.5 h-11 border-white/15 bg-white/5 text-white placeholder:text-white/35 focus-visible:ring-[#FF7E00]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-white/80">Password</Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="password"
                        type={show ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        className="h-11 border-white/15 bg-white/5 text-white pr-10 focus-visible:ring-[#FF7E00]"
                      />
                      <button
                        type="button"
                        onClick={() => setShow((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                        aria-label="Toggle password"
                      >
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    className="w-full h-11 bg-[#FF7E00] text-black font-semibold hover:bg-[#ff8f24] shadow-[0_10px_30px_rgba(255,126,0,0.28)]"
                    disabled={busy}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {busy ? "Signing in…" : "Sign in"}
                  </Button>
                </form>

                <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3 text-[11px] text-white/55 space-y-1">
                  <div className="font-medium text-white/80">Administrator — Kishore Patel</div>
                  <div>admin@srihari.co · Admin@1234</div>
                  <div>Kishore can add multiple staff under Users &amp; Roles. Staff sign in here with their own credentials.</div>
                </div>
              </div>
            </div>
            <p className="text-center text-[11px] text-white/40 mt-5">© Shreehari Export House · Role-based access</p>
          </div>
        </div>
      </div>
    </div>
  );
}

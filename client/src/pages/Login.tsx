import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Database, LogIn, Eye, EyeOff } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const testLoginMutation = trpc.auth.testLogin.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Login erfolgreich!");
        setLocation("/");
        // Force reload to update auth state
        window.location.reload();
      } else {
        toast.error(result.message || "Login fehlgeschlagen");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Login fehlgeschlagen");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await testLoginMutation.mutateAsync({ username, password });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: "color-mix(in oklch, var(--color-primary) 20%, transparent)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl"
          style={{ background: "color-mix(in oklch, var(--color-secondary) 15%, transparent)" }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Login Card */}
        <div
          className="bg-gradient-to-br backdrop-blur-xl border-2 rounded-2xl p-8 shadow-[0_0_60px_color-mix(in_oklch,_var(--color-primary)_15%,_transparent)]"
          style={{
            backgroundImage:
              "linear-gradient(to bottom right, color-mix(in oklch, var(--color-card) 80%, transparent), color-mix(in oklch, var(--color-card) 70%, transparent))",
            borderColor: "color-mix(in oklch, var(--color-primary) 50%, transparent)",
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border mb-4"
              style={{
                background: "color-mix(in oklch, var(--color-primary) 20%, transparent)",
                borderColor: "color-mix(in oklch, var(--color-primary) 40%, transparent)",
              }}
            >
              <Database className="w-8 h-8" strokeWidth={1.5} style={{ color: "var(--color-primary)" }} />
            </div>
            <h1 className="text-2xl font-bold text-white">Multi-DB Manager</h1>
            <p className="text-white/50 mt-2">Melden Sie sich an, um fortzufahren</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white/70">Benutzername</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="text-white placeholder:text-white/30"
                style={{
                  background: "color-mix(in oklch, var(--color-card) 70%, transparent)",
                  borderColor: "color-mix(in oklch, var(--color-border) 70%, transparent)",
                  boxShadow: "0 0 0 1px color-mix(in oklch, var(--color-border) 70%, transparent)",
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/70">Passwort</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="text-white placeholder:text-white/30 pr-10"
                  style={{
                    background: "color-mix(in oklch, var(--color-card) 70%, transparent)",
                    borderColor: "color-mix(in oklch, var(--color-border) 70%, transparent)",
                    boxShadow: "0 0 0 1px color-mix(in oklch, var(--color-border) 70%, transparent)",
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full text-white border-0 h-11"
              style={{ background: "var(--color-primary)" }}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Anmelden...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Anmelden
                </span>
              )}
            </Button>
          </form>

          {/* Test Credentials Info */}
          <div
            className="mt-6 p-4 rounded-lg border"
            style={{
              background: "color-mix(in oklch, var(--color-card) 70%, transparent)",
              borderColor: "color-mix(in oklch, var(--color-border) 60%, transparent)",
            }}
          >
            <p className="text-xs text-white/50 text-center">
              <span className="font-medium text-white/70">Test-Zugangsdaten:</span><br />
              Benutzer: <code className="text-[color:var(--color-primary)]">admin</code> / 
              Passwort: <code className="text-[color:var(--color-primary)]">admin</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

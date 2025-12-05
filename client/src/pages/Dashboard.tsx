import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Database, CheckCircle2, XCircle, AlertCircle, Activity, Zap } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import KPICard, { MultiKPICard } from "@/components/KPICard";
import ModuleCard from "@/components/ModuleCard";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: connections } = trpc.connections.list.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  const stats = {
    total: connections?.length || 0,
    active: connections?.filter((c) => c.status === "active").length || 0,
    error: connections?.filter((c) => c.status === "error").length || 0,
    unknown: connections?.filter((c) => c.status === "unknown" || c.status === "inactive").length || 0,
  };

  if (user?.role !== "admin") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Willkommen, {user?.name}</h1>
          <p className="text-white/60">
            Sie sind als normaler Benutzer angemeldet.
          </p>
        </div>
        <ModuleCard title="Eingeschränkter Zugriff" icon={AlertCircle}>
          <p className="text-white/60">
            Die Verwaltung von Datenbankverbindungen erfordert Admin-Rechte.
            Kontaktieren Sie einen Administrator, um Zugriff zu erhalten.
          </p>
        </ModuleCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="text-white/60">
          Übersicht über Ihre Datenbankverbindungen
        </p>
      </div>

      {/* KPI Cards Row - Style from reference image */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KPICard
          value={stats.total}
          label="Datenbankverbindungen"
          icon={Database}
        />
        <MultiKPICard
          items={[
            { value: stats.active, label: "Aktiv", unit: "" },
            { value: stats.error, label: "Fehler", unit: "" },
          ]}
        />
        <KPICard
          value={stats.unknown}
          label="Status unbekannt"
          icon={AlertCircle}
        />
        <KPICard
          value={stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}
          unit="%"
          label="Verfügbarkeit"
          icon={Zap}
        />
      </div>

      {/* Content Modules */}
      <div className="grid gap-4 md:grid-cols-2">
        <ModuleCard title="Schnellzugriff" icon={Activity}>
          <div className="space-y-2">
            <Link href="/connections">
              <Button 
                variant="outline" 
                className="w-full justify-start bg-transparent border-[oklch(0.5_0.12_45/30%)] hover:bg-[oklch(0.5_0.12_45/15%)] hover:border-[oklch(0.55_0.14_45/50%)] text-white/80"
              >
                <Database className="mr-2 h-4 w-4 opacity-50" />
                Verbindungen verwalten
              </Button>
            </Link>
            <Link href="/modular">
              <Button 
                variant="outline" 
                className="w-full justify-start bg-transparent border-[oklch(0.5_0.12_45/30%)] hover:bg-[oklch(0.5_0.12_45/15%)] hover:border-[oklch(0.55_0.14_45/50%)] text-white/80"
              >
                <Zap className="mr-2 h-4 w-4 opacity-50" />
                Modulares Dashboard
              </Button>
            </Link>
          </div>
        </ModuleCard>

        <ModuleCard title="Letzte Verbindungen" icon={Database}>
          {connections && connections.length > 0 ? (
            <div className="space-y-3">
              {connections.slice(0, 5).map((conn) => (
                <div 
                  key={conn.id} 
                  className="flex items-center justify-between p-2 rounded-lg bg-[oklch(0.2_0.03_50/30%)] border border-[oklch(0.5_0.12_45/20%)]"
                >
                  <div className="flex items-center gap-2">
                    {conn.status === "active" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500/70" />
                    ) : conn.status === "error" ? (
                      <XCircle className="h-4 w-4 text-red-500/70" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-white/40" />
                    )}
                    <span className="text-sm font-medium text-white/80">{conn.name}</span>
                  </div>
                  <span className="text-xs text-white/50 bg-[oklch(0.3_0.04_50/40%)] px-2 py-0.5 rounded">
                    {conn.dbType}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/50">
              Noch keine Verbindungen vorhanden.
            </p>
          )}
        </ModuleCard>
      </div>
    </div>
  );
}

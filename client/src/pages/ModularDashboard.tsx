import { useAuth } from "@/_core/hooks/useAuth";
import DraggableModule, { GridBackground } from "@/components/DraggableModule";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Database, CheckCircle2, XCircle, AlertCircle, Activity, RefreshCw, Plus, LayoutGrid, Grid3X3 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import KPICard from "@/components/KPICard";
import ModuleCard from "@/components/ModuleCard";

export default function ModularDashboard() {
  const { user } = useAuth();
  const [isGridMode, setIsGridMode] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  
  const { data: connections, refetch } = trpc.connections.list.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  const testMutation = trpc.connections.test.useMutation({
    onSuccess: (result) => {
      refetch();
      if (result.success) {
        toast.success(`Verbindung erfolgreich (${result.durationMs}ms)`);
      } else {
        toast.error(`Verbindungsfehler: ${result.error}`);
      }
    },
  });

  const stats = {
    total: connections?.length || 0,
    active: connections?.filter((c) => c.status === "active").length || 0,
    error: connections?.filter((c) => c.status === "error").length || 0,
    unknown: connections?.filter((c) => c.status === "unknown" || c.status === "inactive").length || 0,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="w-4 h-4 text-green-500/70" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500/70" />;
      default:
        return <AlertCircle className="w-4 h-4 opacity-40" />;
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <ModuleCard title="Zugriff verweigert" icon={AlertCircle} className="max-w-md">
          <p className="text-white/60">
            Sie benötigen Admin-Rechte, um auf diese Seite zuzugreifen.
          </p>
        </ModuleCard>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Modulares Dashboard</h1>
          <p className="text-white/60">
            Ziehen Sie Module per Drag & Drop an die gewünschte Position
          </p>
        </div>
        <div className="flex gap-2">
          {!isGridMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              className="bg-transparent border-[oklch(0.5_0.12_45/30%)] hover:bg-[oklch(0.5_0.12_45/15%)] text-white/70"
            >
              <Grid3X3 className="w-4 h-4 mr-2 opacity-50" />
              {showGrid ? "Raster aus" : "Raster an"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGridMode(!isGridMode)}
            className="bg-transparent border-[oklch(0.5_0.12_45/30%)] hover:bg-[oklch(0.5_0.12_45/15%)] text-white/70"
          >
            <LayoutGrid className="w-4 h-4 mr-2 opacity-50" />
            {isGridMode ? "Frei" : "Statisch"}
          </Button>
          <Link href="/connections">
            <Button 
              size="sm" 
              className="bg-[oklch(0.55_0.15_45)] hover:bg-[oklch(0.6_0.17_45)] text-white border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Neue Verbindung
            </Button>
          </Link>
        </div>
      </div>

      {isGridMode ? (
        /* Static Grid Mode */
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {/* KPI Cards */}
          <KPICard
            value={stats.total}
            label="Datenbankverbindungen"
            icon={Database}
          />
          <KPICard
            value={stats.active}
            label="Verbindungen online"
            icon={CheckCircle2}
          />
          <KPICard
            value={stats.error}
            label="Verbindungen fehlerhaft"
            icon={XCircle}
          />
          <KPICard
            value={stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}
            unit="%"
            label="Verfügbarkeit"
            icon={Activity}
          />

          {/* Connections List */}
          <ModuleCard 
            title="Verbindungsübersicht" 
            icon={Activity}
            className="col-span-2 lg:col-span-4"
          >
            {connections && connections.length > 0 ? (
              <div className="space-y-2">
                {connections.map((conn) => (
                  <div
                    key={conn.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[oklch(0.2_0.03_50/30%)] border border-[oklch(0.5_0.12_45/20%)]"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(conn.status)}
                      <div>
                        <span className="font-medium text-white/80">{conn.name}</span>
                        <span className="text-xs text-white/40 ml-2">
                          {conn.host}:{conn.port}
                        </span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="text-xs bg-[oklch(0.3_0.04_50/40%)] border-[oklch(0.5_0.12_45/30%)] text-white/60"
                      >
                        {conn.dbType}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => testMutation.mutate({ id: conn.id })}
                      disabled={testMutation.isPending}
                      className="text-white/50 hover:text-white/80 hover:bg-[oklch(0.5_0.12_45/15%)]"
                    >
                      <RefreshCw className={`w-4 h-4 ${testMutation.isPending ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/50 text-center py-8">
                Keine Verbindungen vorhanden
              </p>
            )}
          </ModuleCard>
        </div>
      ) : (
        /* Free Drag Mode with Grid */
        <div className="relative" style={{ minHeight: "700px" }}>
          {/* Grid Background */}
          <GridBackground show={showGrid} />
          
          {/* Stats Module */}
          <DraggableModule
            id="stats-module"
            title="Statistiken"
            defaultPosition={{ x: 0, y: 0 }}
            defaultSize={{ width: 360, height: 220 }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[oklch(0.25_0.04_50/40%)] border border-[oklch(0.5_0.12_45/25%)]">
                <div className="text-3xl font-bold text-white">{stats.total}</div>
                <div className="text-xs text-white/50">Gesamt</div>
              </div>
              <div className="p-3 rounded-lg bg-[oklch(0.25_0.04_50/40%)] border border-[oklch(0.5_0.12_45/25%)]">
                <div className="text-3xl font-bold text-green-500/80">{stats.active}</div>
                <div className="text-xs text-white/50">Aktiv</div>
              </div>
              <div className="p-3 rounded-lg bg-[oklch(0.25_0.04_50/40%)] border border-[oklch(0.5_0.12_45/25%)]">
                <div className="text-3xl font-bold text-red-500/80">{stats.error}</div>
                <div className="text-xs text-white/50">Fehler</div>
              </div>
              <div className="p-3 rounded-lg bg-[oklch(0.25_0.04_50/40%)] border border-[oklch(0.5_0.12_45/25%)]">
                <div className="text-3xl font-bold text-white/60">{stats.unknown}</div>
                <div className="text-xs text-white/50">Unbekannt</div>
              </div>
            </div>
          </DraggableModule>

          {/* Connections Module */}
          <DraggableModule
            id="connections-module"
            title="Verbindungen"
            defaultPosition={{ x: 380, y: 0 }}
            defaultSize={{ width: 480, height: 400 }}
            minWidth={360}
            minHeight={260}
          >
            {connections && connections.length > 0 ? (
              <div className="space-y-2">
                {connections.map((conn) => (
                  <div
                    key={conn.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[oklch(0.2_0.03_50/30%)] border border-[oklch(0.5_0.12_45/20%)]"
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(conn.status)}
                      <span className="text-sm font-medium">{conn.name}</span>
                      <Badge 
                        variant="outline" 
                        className="text-xs bg-[oklch(0.3_0.04_50/40%)] border-[oklch(0.5_0.12_45/30%)] text-white/60"
                      >
                        {conn.dbType}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => testMutation.mutate({ id: conn.id })}
                      disabled={testMutation.isPending}
                      className="text-white/50 hover:text-white/80"
                    >
                      <RefreshCw className={`w-3 h-3 ${testMutation.isPending ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white/40">
                <Database className="w-12 h-12 mb-2 opacity-30" strokeWidth={1} />
                <p>Keine Verbindungen</p>
              </div>
            )}
          </DraggableModule>

          {/* Quick Actions Module */}
          <DraggableModule
            id="actions-module"
            title="Schnellzugriff"
            defaultPosition={{ x: 0, y: 240 }}
            defaultSize={{ width: 360, height: 200 }}
          >
            <div className="space-y-2">
              <Link href="/connections">
                <Button 
                  variant="outline" 
                  className="w-full justify-start bg-transparent border-[oklch(0.5_0.12_45/30%)] hover:bg-[oklch(0.5_0.12_45/15%)] text-white/70"
                >
                  <Database className="mr-2 h-4 w-4 opacity-40" />
                  Verbindungen verwalten
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent border-[oklch(0.5_0.12_45/30%)] hover:bg-[oklch(0.5_0.12_45/15%)] text-white/70"
                onClick={() => refetch()}
              >
                <RefreshCw className="mr-2 h-4 w-4 opacity-40" />
                Status aktualisieren
              </Button>
            </div>
          </DraggableModule>
        </div>
      )}
    </div>
  );
}

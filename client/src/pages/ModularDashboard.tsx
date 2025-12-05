import { useAuth } from "@/_core/hooks/useAuth";
import DraggableModule from "@/components/DraggableModule";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Database, CheckCircle2, XCircle, AlertCircle, Activity, RefreshCw, Plus, LayoutGrid } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function ModularDashboard() {
  const { user } = useAuth();
  const [isGridMode, setIsGridMode] = useState(false);
  
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
        return <CheckCircle2 className="w-4 h-4 status-active" />;
      case "error":
        return <XCircle className="w-4 h-4 status-error" />;
      default:
        return <AlertCircle className="w-4 h-4 status-unknown" />;
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="glass-module max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Zugriff verweigert</CardTitle>
            <CardDescription>
              Sie benötigen Admin-Rechte, um auf diese Seite zuzugreifen.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Modulares Dashboard</h1>
          <p className="text-muted-foreground">
            Ziehen Sie Module per Drag & Drop an die gewünschte Position
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGridMode(!isGridMode)}
            className="glass-module border-primary/30"
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            {isGridMode ? "Frei" : "Raster"}
          </Button>
          <Link href="/connections">
            <Button size="sm" className="glow-orange">
              <Plus className="w-4 h-4 mr-2" />
              Neue Verbindung
            </Button>
          </Link>
        </div>
      </div>

      {isGridMode ? (
        /* Grid Mode */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Stats Cards */}
          <Card className="glass-module">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Gesamt
                <Database className="h-4 w-4 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Datenbankverbindungen</p>
            </CardContent>
          </Card>

          <Card className="glass-module">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Aktiv
                <CheckCircle2 className="h-4 w-4 status-active" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold status-active">{stats.active}</div>
              <p className="text-xs text-muted-foreground mt-1">Verbindungen online</p>
            </CardContent>
          </Card>

          <Card className="glass-module">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Fehler
                <XCircle className="h-4 w-4 status-error" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold status-error">{stats.error}</div>
              <p className="text-xs text-muted-foreground mt-1">Verbindungen fehlerhaft</p>
            </CardContent>
          </Card>

          {/* Connections List */}
          <Card className="glass-module md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Verbindungsübersicht
              </CardTitle>
            </CardHeader>
            <CardContent>
              {connections && connections.length > 0 ? (
                <div className="space-y-3">
                  {connections.map((conn) => (
                    <div
                      key={conn.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(conn.status)}
                        <div>
                          <span className="font-medium">{conn.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {conn.host}:{conn.port}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {conn.dbType}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => testMutation.mutate({ id: conn.id })}
                        disabled={testMutation.isPending}
                      >
                        <RefreshCw className={`w-4 h-4 ${testMutation.isPending ? "animate-spin" : ""}`} />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Keine Verbindungen vorhanden
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Free Drag Mode */
        <div className="relative" style={{ minHeight: "600px" }}>
          {/* Stats Module */}
          <DraggableModule
            id="stats-module"
            title="Statistiken"
            defaultPosition={{ x: 20, y: 20 }}
            defaultSize={{ width: 350, height: 200 }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-secondary/30">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Gesamt</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <div className="text-2xl font-bold status-active">{stats.active}</div>
                <div className="text-xs text-muted-foreground">Aktiv</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <div className="text-2xl font-bold status-error">{stats.error}</div>
                <div className="text-xs text-muted-foreground">Fehler</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <div className="text-2xl font-bold status-unknown">{stats.unknown}</div>
                <div className="text-xs text-muted-foreground">Unbekannt</div>
              </div>
            </div>
          </DraggableModule>

          {/* Connections Module */}
          <DraggableModule
            id="connections-module"
            title="Verbindungen"
            defaultPosition={{ x: 400, y: 20 }}
            defaultSize={{ width: 500, height: 400 }}
            minWidth={350}
            minHeight={250}
          >
            {connections && connections.length > 0 ? (
              <div className="space-y-2">
                {connections.map((conn) => (
                  <div
                    key={conn.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-secondary/20 border border-border/30"
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(conn.status)}
                      <span className="text-sm font-medium">{conn.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {conn.dbType}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => testMutation.mutate({ id: conn.id })}
                      disabled={testMutation.isPending}
                    >
                      <RefreshCw className={`w-3 h-3 ${testMutation.isPending ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Database className="w-12 h-12 mb-2 opacity-50" />
                <p>Keine Verbindungen</p>
              </div>
            )}
          </DraggableModule>

          {/* Quick Actions Module */}
          <DraggableModule
            id="actions-module"
            title="Schnellzugriff"
            defaultPosition={{ x: 20, y: 250 }}
            defaultSize={{ width: 350, height: 180 }}
          >
            <div className="space-y-2">
              <Link href="/connections">
                <Button variant="outline" className="w-full justify-start glass-module">
                  <Database className="mr-2 h-4 w-4" />
                  Verbindungen verwalten
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full justify-start glass-module"
                onClick={() => refetch()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Status aktualisieren
              </Button>
            </div>
          </DraggableModule>
        </div>
      )}
    </div>
  );
}

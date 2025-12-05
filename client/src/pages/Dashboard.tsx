import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Database, CheckCircle2, XCircle, AlertCircle, Activity } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

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
          <h1 className="text-2xl font-bold tracking-tight">Willkommen, {user?.name}</h1>
          <p className="text-muted-foreground">
            Sie sind als normaler Benutzer angemeldet.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Eingeschränkter Zugriff</CardTitle>
            <CardDescription>
              Die Verwaltung von Datenbankverbindungen erfordert Admin-Rechte.
              Kontaktieren Sie einen Administrator, um Zugriff zu erhalten.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Übersicht über Ihre Datenbankverbindungen
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Datenbankverbindungen
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktiv</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Verbindungen online
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fehler</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.error}</div>
            <p className="text-xs text-muted-foreground">
              Verbindungen fehlerhaft
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unbekannt</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.unknown}</div>
            <p className="text-xs text-muted-foreground">
              Status unbekannt
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Schnellzugriff
            </CardTitle>
            <CardDescription>
              Häufig verwendete Aktionen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/connections">
              <Button variant="outline" className="w-full justify-start">
                <Database className="mr-2 h-4 w-4" />
                Verbindungen verwalten
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Letzte Verbindungen</CardTitle>
            <CardDescription>
              Kürzlich hinzugefügte Datenbankverbindungen
            </CardDescription>
          </CardHeader>
          <CardContent>
            {connections && connections.length > 0 ? (
              <div className="space-y-3">
                {connections.slice(0, 5).map((conn) => (
                  <div key={conn.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{conn.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {conn.dbType}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Noch keine Verbindungen vorhanden.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

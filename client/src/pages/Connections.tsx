import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { Database, Plus, RefreshCw, Trash2, Edit, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type DbType = "mysql" | "postgres" | "mongodb" | "redis" | "sqlite";

const dbTypeLabels: Record<DbType, string> = {
  mysql: "MySQL",
  postgres: "PostgreSQL",
  mongodb: "MongoDB",
  redis: "Redis",
  sqlite: "SQLite",
};

const defaultPorts: Record<DbType, number> = {
  mysql: 3306,
  postgres: 5432,
  mongodb: 27017,
  redis: 6379,
  sqlite: 0,
};

interface ConnectionFormData {
  name: string;
  dbType: DbType;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  sslEnabled: boolean;
}

const initialFormData: ConnectionFormData = {
  name: "",
  dbType: "mysql",
  host: "localhost",
  port: 3306,
  database: "",
  username: "",
  password: "",
  sslEnabled: false,
};

export default function Connections() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ConnectionFormData>(initialFormData);
  const [testingId, setTestingId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: connections, isLoading } = trpc.connections.list.useQuery();
  
  const createMutation = trpc.connections.create.useMutation({
    onSuccess: () => {
      utils.connections.list.invalidate();
      setIsDialogOpen(false);
      setFormData(initialFormData);
      toast.success("Verbindung erfolgreich erstellt");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const updateMutation = trpc.connections.update.useMutation({
    onSuccess: () => {
      utils.connections.list.invalidate();
      setIsDialogOpen(false);
      setEditingId(null);
      setFormData(initialFormData);
      toast.success("Verbindung erfolgreich aktualisiert");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const deleteMutation = trpc.connections.delete.useMutation({
    onSuccess: () => {
      utils.connections.list.invalidate();
      setDeleteId(null);
      toast.success("Verbindung erfolgreich gelöscht");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const testMutation = trpc.connections.test.useMutation({
    onSuccess: (result) => {
      utils.connections.list.invalidate();
      if (result.success) {
        toast.success(`Verbindung erfolgreich (${result.durationMs}ms)`);
      } else {
        toast.error(`Verbindungsfehler: ${result.error}`);
      }
      setTestingId(null);
    },
    onError: (error) => {
      toast.error(`Test fehlgeschlagen: ${error.message}`);
      setTestingId(null);
    },
  });

  const handleDbTypeChange = (value: DbType) => {
    setFormData({
      ...formData,
      dbType: value,
      port: defaultPorts[value],
    });
  };

  const handleSubmit = () => {
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (connection: NonNullable<typeof connections>[number]) => {
    setEditingId(connection.id);
    setFormData({
      name: connection.name,
      dbType: connection.dbType as DbType,
      host: connection.host,
      port: connection.port,
      database: connection.database || "",
      username: connection.username || "",
      password: "",
      sslEnabled: connection.sslEnabled === 1,
    });
    setIsDialogOpen(true);
  };

  const handleTest = (id: number) => {
    setTestingId(id);
    testMutation.mutate({ id });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Aktiv
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            Fehler
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-500/10 text-gray-600 border-gray-500/20">
            <AlertCircle className="w-3 h-3 mr-1" />
            Unbekannt
          </Badge>
        );
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Datenbankverbindungen</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Datenbankverbindungen im Netzwerk
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingId(null);
            setFormData(initialFormData);
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Neue Verbindung
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Verbindung bearbeiten" : "Neue Datenbankverbindung"}
              </DialogTitle>
              <DialogDescription>
                Geben Sie die Verbindungsdaten für die Datenbank ein.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Produktions-DB"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dbType">Datenbanktyp</Label>
                <Select value={formData.dbType} onValueChange={handleDbTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(dbTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 grid gap-2">
                  <Label htmlFor="host">Host</Label>
                  <Input
                    id="host"
                    placeholder="localhost"
                    value={formData.host}
                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="database">Datenbankname</Label>
                <Input
                  id="database"
                  placeholder="mydb"
                  value={formData.database}
                  onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Benutzername</Label>
                  <Input
                    id="username"
                    placeholder="admin"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Passwort</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={editingId ? "Leer lassen für unverändert" : "••••••••"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="ssl" className="cursor-pointer">SSL aktivieren</Label>
                <Switch
                  id="ssl"
                  checked={formData.sslEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, sslEnabled: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingId(null);
                  setFormData(initialFormData);
                }}
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.name || !formData.host || createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingId ? "Speichern" : "Erstellen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : connections?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Database className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Verbindungen</h3>
            <p className="text-muted-foreground text-center mb-4">
              Erstellen Sie Ihre erste Datenbankverbindung, um loszulegen.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Verbindung hinzufügen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {connections?.map((connection) => (
            <Card key={connection.id} className="relative group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Database className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{connection.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {dbTypeLabels[connection.dbType as DbType]}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(connection.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Host:</span>
                    <span className="font-mono text-xs">{connection.host}:{connection.port}</span>
                  </div>
                  {connection.database && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Datenbank:</span>
                      <span className="font-mono text-xs">{connection.database}</span>
                    </div>
                  )}
                  {connection.username && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Benutzer:</span>
                      <span className="font-mono text-xs">{connection.username}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SSL:</span>
                    <span>{connection.sslEnabled ? "Ja" : "Nein"}</span>
                  </div>
                </div>
                {connection.lastError && (
                  <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                    {connection.lastError}
                  </p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleTest(connection.id)}
                    disabled={testingId === connection.id}
                  >
                    {testingId === connection.id ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-1" />
                    )}
                    Testen
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(connection)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(connection.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verbindung löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Verbindung wird dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import DashboardLayout, { useEditMode } from "@/components/DashboardLayout";
import ModuleCard from "@/components/ModuleCard";
import { trpc } from "@/lib/trpc";
import { Monitor, Plus, Wifi, WifiOff, Settings } from "lucide-react";

export default function Arbeitsplaetze() {
  const { isEditMode } = useEditMode();
  
  const { data: workspaces = [] } = trpc.workspaces.list.useQuery();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-gray-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Arbeitsplätze</h1>
            <p className="text-white/50 mt-1">Installationen und Verbindungen</p>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[oklch(0.55_0.15_45)] text-white hover:bg-[oklch(0.6_0.17_45)] transition-colors">
            <Plus className="w-4 h-4" />
            Arbeitsplatz hinzufügen
          </button>
        </div>

        {/* Workspaces Grid */}
        <div className="grid grid-cols-3 gap-4">
          {workspaces.length === 0 ? (
            <ModuleCard 
              className="col-span-3" 
              icon={<Monitor className="w-4 h-4" />}
              isEditable={isEditMode}
            >
              <div className="text-center py-12">
                <Monitor className="w-16 h-16 mx-auto mb-4 opacity-20 text-white" />
                <h3 className="text-lg font-medium text-white/80 mb-2">Keine Arbeitsplätze</h3>
                <p className="text-white/50 mb-4">Verbinden Sie Ihren ersten Arbeitsplatz</p>
                <button className="px-4 py-2 rounded-lg bg-[oklch(0.55_0.15_45/30%)] text-white/70 hover:bg-[oklch(0.55_0.15_45/50%)] transition-colors">
                  Arbeitsplatz verbinden
                </button>
              </div>
            </ModuleCard>
          ) : (
            workspaces.map((workspace) => (
              <ModuleCard 
                key={workspace.id}
                isEditable={isEditMode}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-[oklch(0.25_0.04_50/50%)]">
                        <Monitor className="w-6 h-6 text-[oklch(0.7_0.18_50)]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{workspace.name}</h3>
                        <p className="text-sm text-white/50">{workspace.type}</p>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(workspace.status)}`} />
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-white/50">Status</span>
                      <span className="text-white/80 flex items-center gap-1">
                        {workspace.status === 'online' ? (
                          <><Wifi className="w-3 h-3" /> Online</>
                        ) : (
                          <><WifiOff className="w-3 h-3" /> Offline</>
                        )}
                      </span>
                    </div>
                    {workspace.ipAddress && (
                      <div className="flex items-center justify-between">
                        <span className="text-white/50">IP</span>
                        <span className="text-white/80 font-mono text-xs">{workspace.ipAddress}</span>
                      </div>
                    )}
                    {workspace.lastActiveAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-white/50">Zuletzt gesehen</span>
                        <span className="text-white/80">
                          {new Date(workspace.lastActiveAt).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-[oklch(0.5_0.12_45/20%)]">
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[oklch(0.25_0.04_50/50%)] text-white/70 hover:bg-[oklch(0.3_0.05_50/60%)] transition-colors">
                      <Settings className="w-4 h-4" />
                      Konfigurieren
                    </button>
                  </div>
                </div>
              </ModuleCard>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

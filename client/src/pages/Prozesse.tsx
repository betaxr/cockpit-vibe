import DashboardLayout, { useEditMode } from "@/components/DashboardLayout";
import ModuleCard from "@/components/ModuleCard";
import { trpc } from "@/lib/trpc";
import { Workflow, Plus, Play, Pause, CheckCircle, XCircle, Clock } from "lucide-react";

export default function Prozesse() {
  const { isEditMode } = useEditMode();
  
  const { data: processes = [] } = trpc.processes.list.useQuery();
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="w-4 h-4 text-[oklch(0.7_0.18_50)]" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-white/40" />;
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'running': return 'Läuft';
      case 'completed': return 'Abgeschlossen';
      case 'failed': return 'Fehlgeschlagen';
      case 'paused': return 'Pausiert';
      default: return 'Wartend';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Prozesse</h1>
            <p className="text-white/50 mt-1">Automatisierte Workflows und Aufgaben</p>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[oklch(0.55_0.15_45)] text-white hover:bg-[oklch(0.6_0.17_45)] transition-colors">
            <Plus className="w-4 h-4" />
            Neuer Prozess
          </button>
        </div>

        {/* Process List */}
        <ModuleCard 
          title="Alle Prozesse" 
          icon={<Workflow className="w-4 h-4" />}
          isEditable={isEditMode}
        >
          {processes.length === 0 ? (
            <div className="text-center py-12">
              <Workflow className="w-16 h-16 mx-auto mb-4 opacity-20 text-white" />
              <h3 className="text-lg font-medium text-white/80 mb-2">Keine Prozesse</h3>
              <p className="text-white/50 mb-4">Erstellen Sie Ihren ersten automatisierten Prozess</p>
              <button className="px-4 py-2 rounded-lg bg-[oklch(0.55_0.15_45/30%)] text-white/70 hover:bg-[oklch(0.55_0.15_45/50%)] transition-colors">
                Prozess erstellen
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {processes.map((process) => (
                <div 
                  key={process.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-[oklch(0.2_0.03_50/40%)] hover:bg-[oklch(0.25_0.04_50/50%)] transition-all"
                >
                  {/* Status Icon */}
                  <div className="shrink-0">
                    {getStatusIcon(process.status)}
                  </div>
                  
                  {/* Process Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{process.name}</h3>
                    <p className="text-sm text-white/50 truncate">{process.description || 'Keine Beschreibung'}</p>
                  </div>
                  
                  {/* Priority Badge */}
                  <span className={`px-2 py-1 text-xs rounded-lg border ${getPriorityColor(process.priority)}`}>
                    {process.priority}
                  </span>
                  
                  {/* Status */}
                  <span className="text-sm text-white/60 w-24 text-right">
                    {getStatusLabel(process.status)}
                  </span>
                  
                  {/* Value Generated */}
                  {(process.valueGenerated ?? 0) > 0 && (
                    <span className="text-sm text-[oklch(0.7_0.18_50)] w-20 text-right">
                      +{((process.valueGenerated ?? 0) / 100).toFixed(0)}€
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </ModuleCard>
      </div>
    </DashboardLayout>
  );
}

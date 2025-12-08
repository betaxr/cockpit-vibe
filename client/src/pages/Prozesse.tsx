import DashboardLayout, { useEditMode } from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import ModuleCard from "@/components/ModuleCard";
import PageContainer from "@/components/PageContainer";
import { trpc } from "@/lib/trpc";
import { Workflow, Play, CheckCircle, XCircle, Clock, TrendingUp, Users, Zap } from "lucide-react";

export default function Prozesse() {
  const { isEditMode } = useEditMode();
  
  const { data: processes = [] } = trpc.processes.list.useQuery();
  const { data: runningProcesses = [] } = trpc.processes.running.useQuery();
  const { data: stats } = trpc.stats.global.useQuery();
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="w-4 h-4 text-[color:var(--color-primary)]" />;
      case 'idle': return <Clock className="w-4 h-4 text-white/40" />;
      default: return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };
  
  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 95) return 'text-green-400';
    if (reliability >= 80) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Marketing': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Verkauf': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Logistik': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Support': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };
  
  // Calculate totals
  const totalValue = processes.reduce((sum, p) => sum + (p.totalValue || 0), 0);
  const totalTimeSaved = processes.reduce((sum, p) => sum + (p.totalTimeSaved || 0), 0);
  const avgReliability = processes.length > 0 
    ? Math.round(processes.reduce((sum, p) => sum + (p.reliability || 0), 0) / processes.length)
    : 0;

  return (
    <DashboardLayout>
      <PageContainer className="space-y-6">
        {/* Header with KPIs */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Prozesse</h1>
            <p className="text-white/50 mt-1.5">Automatisierte Workflows und deren Performance</p>
          </div>
          
          <div className="flex gap-4">
            <KPICard 
              value={processes.length} 
              label="Prozesse" 
              icon={<Workflow className="w-5 h-5" />} 
            />
            <KPICard 
              value={`${Math.round(totalValue / 100)}€`} 
              label="Wertschöpfung" 
              suffix="" 
              icon={<TrendingUp className="w-5 h-5" />} 
            />
            <KPICard 
              value={Math.round(totalTimeSaved / 60)} 
              label="Stunden gespart" 
              suffix="h" 
              icon={<Clock className="w-5 h-5" />} 
            />
            <KPICard 
              value={avgReliability} 
              label="Zuverlässigkeit" 
              suffix="%" 
              icon={<Zap className="w-5 h-5" />} 
            />
          </div>
        </div>

        {/* Currently Running */}
        {runningProcesses.length > 0 && (
          <ModuleCard 
            title="Aktuell laufend" 
            icon={<Play className="w-4 h-4 text-[color:var(--color-primary)]" />}
            isEditable={isEditMode}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {runningProcesses.map((entry, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-xl border"
                  style={{
                    background: "color-mix(in oklch, var(--color-card) 60%, transparent)",
                    borderColor: "color-mix(in oklch, var(--color-border) 70%, transparent)",
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: entry.agentColor + '30' }}
                  >
                    <Users className="w-5 h-5" style={{ color: entry.agentColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">{entry.processName}</h4>
                    <p className="text-sm text-white/50">{entry.agentName}</p>
                  </div>
                  <div className="text-right text-sm text-white/40">
                    {entry.startHour}:00 - {entry.endHour}:00
                  </div>
                </div>
              ))}
            </div>
          </ModuleCard>
        )}

        {/* Process List with Statistics */}
        <ModuleCard 
          title="Alle Prozesse" 
          icon={<Workflow className="w-4 h-4" />}
          isEditable={isEditMode}
        >
          <div className="space-y-3">
            {processes.map((process) => (
              <div 
                key={process.id}
                className="p-4 rounded-xl transition-all"
                style={{
                  background: "color-mix(in oklch, var(--color-card) 50%, transparent)",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "color-mix(in oklch, var(--color-card) 60%, transparent)")}
                onMouseLeave={e => (e.currentTarget.style.background = "color-mix(in oklch, var(--color-card) 50%, transparent)")}
              >
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className="shrink-0 mt-1">
                    {getStatusIcon(process.status)}
                  </div>
                  
                  {/* Process Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium text-white">{process.name}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-lg border ${getCategoryColor(process.category)}`}>
                        {process.category}
                      </span>
                    </div>
                    <p className="text-sm text-white/50 mb-3">{process.description}</p>
                    
                    {/* Stats Row */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-white/40">Ausführungen:</span>
                        <span className="text-white/80">{process.scheduleCount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/40">Erfolgreich:</span>
                        <span className="text-green-400">{process.successCount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/40">Fehlgeschlagen:</span>
                        <span className={process.failCount > 0 ? 'text-red-400' : 'text-white/60'}>{process.failCount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/40">Zuverlässigkeit:</span>
                        <span className={getReliabilityColor(process.reliability)}>{process.reliability}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Agent */}
                  {process.agent && (
                    <div className="flex items-center gap-2 shrink-0">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: process.agent.avatarColor }}
                      >
                        {process.agent.name.charAt(0)}
                      </div>
                      <span className="text-sm text-white/60">{process.agent.name}</span>
                    </div>
                  )}
                  
                  {/* Value */}
                  <div className="text-right shrink-0">
                    <div className="text-lg font-semibold text-[color:var(--color-primary)]">
                      {Math.round((process.totalValue || 0) / 100)}€
                    </div>
                    <div className="text-xs text-white/40">
                      {Math.round((process.totalTimeSaved || 0) / 60)}h gespart
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ModuleCard>
      </PageContainer>
    </DashboardLayout>
  );
}

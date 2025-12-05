import DashboardLayout, { useEditMode } from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import ModuleCard from "@/components/ModuleCard";
import { trpc } from "@/lib/trpc";
import { Bot, Zap, Clock, TrendingUp, Plus, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

export default function Agents() {
  const [, setLocation] = useLocation();
  const { isEditMode } = useEditMode();
  
  const { data: stats } = trpc.stats.global.useQuery();
  const { data: agents = [] } = trpc.agents.list.useQuery();
  const { data: processes = [] } = trpc.processes.list.useQuery();

  // Calculate active agents
  const activeAgents = agents.filter(a => a.status === 'active' || a.status === 'busy').length;
  
  // Get recent processes
  const recentProcesses = processes.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with title and date */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Einhorn Apotheke</h1>
            <p className="text-white/50 mt-1">
              {new Date().toLocaleDateString('de-DE', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
          
          {/* KPI Cards Row */}
          <div className="flex gap-3">
            <KPICard
              value={stats?.processCount || 0}
              label="Prozesse"
              icon={<Zap className="w-6 h-6" />}
            />
            <KPICard
              value={stats?.valueGenerated || 0}
              suffix="€"
              label="Wertschöpfung"
            />
            <KPICard
              value={stats?.timeSaved || 0}
              suffix="h"
              label="Zeitersparnis"
              variant="secondary"
            />
            <KPICard
              value={stats?.utilization || 0}
              suffix="%"
              label="Auslastung"
              icon={<TrendingUp className="w-6 h-6" />}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className={`grid gap-4 ${isEditMode ? 'grid-cols-3' : 'grid-cols-3'}`}>
          {/* Agents List */}
          <ModuleCard 
            title="Agenten" 
            icon={<Bot className="w-4 h-4" />}
            className="col-span-2 row-span-2"
            isEditable={isEditMode}
          >
            <div className="space-y-3">
              {agents.length === 0 ? (
                <div className="text-center py-8 text-white/40">
                  <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Keine Agenten vorhanden</p>
                  <button className="mt-4 px-4 py-2 rounded-lg bg-[oklch(0.55_0.15_45/30%)] text-white/70 hover:bg-[oklch(0.55_0.15_45/50%)] transition-colors flex items-center gap-2 mx-auto">
                    <Plus className="w-4 h-4" />
                    Agent hinzufügen
                  </button>
                </div>
              ) : (
                agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => setLocation(`/agent/${agent.id}`)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl bg-[oklch(0.2_0.03_50/40%)] hover:bg-[oklch(0.25_0.04_50/50%)] transition-all group"
                  >
                    {/* Agent Avatar */}
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: agent.avatarColor || '#f97316' }}
                    >
                      <Bot className="w-6 h-6 text-white/80" />
                    </div>
                    
                    {/* Agent Info */}
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-white">{agent.name}</h3>
                      <p className="text-sm text-white/50">
                        {agent.hoursPerDay}h/Tag • {agent.status === 'active' ? 'Aktiv' : agent.status === 'busy' ? 'Beschäftigt' : 'Inaktiv'}
                      </p>
                    </div>
                    
                    {/* Status Indicator */}
                    <div className={`w-2 h-2 rounded-full ${
                      agent.status === 'active' ? 'bg-green-500' :
                      agent.status === 'busy' ? 'bg-[oklch(0.7_0.18_50)]' :
                      'bg-gray-500'
                    }`} />
                    
                    <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                  </button>
                ))
              )}
            </div>
          </ModuleCard>

          {/* Quick Stats */}
          <ModuleCard 
            title="Übersicht" 
            icon={<TrendingUp className="w-4 h-4" />}
            isEditable={isEditMode}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-[oklch(0.5_0.12_45/20%)]">
                <span className="text-white/60">Aktive Agenten</span>
                <span className="text-xl font-semibold text-white">{activeAgents}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[oklch(0.5_0.12_45/20%)]">
                <span className="text-white/60">Gesamt Agenten</span>
                <span className="text-xl font-semibold text-white">{agents.length}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-white/60">Laufende Prozesse</span>
                <span className="text-xl font-semibold text-white">
                  {processes.filter(p => p.status === 'running').length}
                </span>
              </div>
            </div>
          </ModuleCard>

          {/* Recent Processes */}
          <ModuleCard 
            title="Letzte Prozesse" 
            icon={<Clock className="w-4 h-4" />}
            isEditable={isEditMode}
          >
            <div className="space-y-2">
              {recentProcesses.length === 0 ? (
                <p className="text-white/40 text-center py-4">Keine Prozesse</p>
              ) : (
                recentProcesses.map((process) => (
                  <div 
                    key={process.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-[oklch(0.2_0.03_50/30%)]"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      process.status === 'completed' ? 'bg-green-500' :
                      process.status === 'running' ? 'bg-[oklch(0.7_0.18_50)]' :
                      process.status === 'failed' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`} />
                    <span className="text-sm text-white/70 truncate flex-1">{process.name}</span>
                    <span className="text-xs text-white/40">
                      {process.status === 'completed' ? 'Fertig' :
                       process.status === 'running' ? 'Läuft' :
                       process.status === 'failed' ? 'Fehler' : 'Wartend'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </ModuleCard>
        </div>
      </div>
    </DashboardLayout>
  );
}

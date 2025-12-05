import DashboardLayout, { useEditMode } from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import ModuleCard from "@/components/ModuleCard";
import { TeamAgentsPreview } from "@/components/TeamAgentsDisplay";
import { trpc } from "@/lib/trpc";
import { Zap, Clock, TrendingUp, ChevronRight, Users } from "lucide-react";
import { useLocation } from "wouter";

export default function Agents() {
  const [, setLocation] = useLocation();
  const { isEditMode } = useEditMode();
  
  const { data: stats } = trpc.stats.global.useQuery();
  const { data: agents = [] } = trpc.agents.list.useQuery();

  return (
    <DashboardLayout>
      {/* MaxWidth Container with Apple HIG spacing */}
      <div className="max-w-5xl mx-auto px-4">
        {/* Header with title and date */}
        <header className="flex items-start justify-between py-8">
          <div>
            <h1 className="text-3xl font-semibold text-white tracking-tight">Einhorn Apotheke</h1>
            <p className="text-white/40 mt-1 text-sm">
              {new Date().toLocaleDateString('de-DE', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
          
          {/* KPI Cards Row - Bundled Wertschöpfung + Zeitersparnis */}
          <div className="flex gap-3">
            <KPICard
              value={stats?.totalProcesses || 0}
              label="Prozesse"
              icon={<Zap className="w-4 h-4" />}
              size="sm"
            />
            {/* Bundled KPI: Wertschöpfung + Zeitersparnis */}
            <KPICard
              value={stats?.totalValue || 0}
              suffix="€"
              label="Wertschöpfung"
              secondaryValue={stats?.totalTimeSaved || 0}
              secondarySuffix="h"
              secondaryLabel="Zeitersparnis"
            />
            <KPICard
              value={stats?.avgReliability || 0}
              suffix="%"
              label="Auslastung"
              icon={<TrendingUp className="w-4 h-4" />}
              size="sm"
            />
          </div>
        </header>

        <div className="space-y-6 pb-8">
          {/* Teams Grid */}
          <ModuleCard 
            title="Teams" 
            icon={<Users className="w-4 h-4" />}
            isEditable={isEditMode}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map((agent) => {
                // Calculate utilization based on status
                const utilization = agent.status === 'active' ? 85 : 
                                    agent.status === 'busy' ? 95 : 30;
                
                return (
                  <button
                    key={agent.id}
                    onClick={() => setLocation(`/agent/${agent.id}`)}
                    className="flex items-center gap-5 p-4 rounded-2xl bg-[oklch(0.16_0.02_45/50%)] hover:bg-[oklch(0.20_0.03_45/60%)] border border-[oklch(0.55_0.15_45/15%)] transition-all group text-left"
                  >
                    {/* Team Agents Preview - Multiple Silhouettes */}
                    <div className="shrink-0 w-20">
                      <TeamAgentsPreview 
                        agentCount={agent.agentCount || 1}
                        utilization={utilization}
                        size="sm"
                      />
                    </div>
                    
                    {/* Team Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-white">{agent.name}</h3>
                      <p className="text-xs text-white/40 mt-0.5">
                        {agent.agentCount || 1} {(agent.agentCount || 1) === 1 ? 'Agent' : 'Agenten'}
                      </p>
                      
                      <div className="flex items-center gap-3 text-xs mt-2">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-white/30" />
                          <span className="text-white/50">{agent.hoursPerDay}h/Tag</span>
                        </div>
                        <div className={`flex items-center gap-1 ${
                          agent.status === 'active' ? 'text-green-400' :
                          agent.status === 'busy' ? 'text-[oklch(0.7_0.18_50)]' :
                          'text-white/40'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            agent.status === 'active' ? 'bg-green-500' :
                            agent.status === 'busy' ? 'bg-[oklch(0.7_0.18_50)]' :
                            'bg-gray-500'
                          }`} />
                          <span>{agent.status === 'active' ? 'Aktiv' : agent.status === 'busy' ? 'Beschäftigt' : 'Inaktiv'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <ChevronRight className="w-4 h-4 text-white/15 group-hover:text-white/40 transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          </ModuleCard>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <ModuleCard isEditable={isEditMode}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/40 text-xs">Aktive Teams</p>
                  <p className="text-xl font-semibold text-white mt-0.5">{stats?.activeAgents || 0}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-green-500/10">
                  <Users className="w-5 h-5 text-green-400/70" />
                </div>
              </div>
            </ModuleCard>
            
            <ModuleCard isEditable={isEditMode}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/40 text-xs">Gesamt Agenten</p>
                  <p className="text-xl font-semibold text-white mt-0.5">{stats?.totalAgents || 0}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[oklch(0.55_0.15_45/10%)]">
                  <Users className="w-5 h-5 text-[oklch(0.7_0.18_50/70%)]" />
                </div>
              </div>
            </ModuleCard>
            
            <ModuleCard isEditable={isEditMode}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/40 text-xs">Laufende Prozesse</p>
                  <p className="text-xl font-semibold text-white mt-0.5">{stats?.runningProcesses || 0}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-500/10">
                  <Zap className="w-5 h-5 text-blue-400/70" />
                </div>
              </div>
            </ModuleCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import DashboardLayout, { useEditMode } from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import ModuleCard from "@/components/ModuleCard";
import AgentSilhouette from "@/components/AgentSilhouette";
import { trpc } from "@/lib/trpc";
import { Bot, Zap, Clock, TrendingUp, ChevronRight, Users } from "lucide-react";
import { useLocation } from "wouter";

export default function Agents() {
  const [, setLocation] = useLocation();
  const { isEditMode } = useEditMode();
  
  const { data: stats } = trpc.stats.global.useQuery();
  const { data: agents = [] } = trpc.agents.list.useQuery();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with title and date */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Einhorn Apotheke</h1>
            <p className="text-white/50 mt-1.5">
              {new Date().toLocaleDateString('de-DE', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
          
          {/* KPI Cards Row */}
          <div className="flex gap-4">
            <KPICard
              value={stats?.totalProcesses || 0}
              label="Prozesse"
              icon={<Zap className="w-5 h-5" />}
            />
            <KPICard
              value={stats?.totalValue || 0}
              suffix="€"
              label="Wertschöpfung"
            />
            <KPICard
              value={stats?.totalTimeSaved || 0}
              suffix="h"
              label="Zeitersparnis"
              variant="secondary"
            />
            <KPICard
              value={stats?.avgReliability || 0}
              suffix="%"
              label="Auslastung"
              icon={<TrendingUp className="w-5 h-5" />}
            />
          </div>
        </div>

        {/* Agents Grid */}
        <ModuleCard 
          title="Agenten" 
          icon={<Users className="w-4 h-4" />}
          isEditable={isEditMode}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => {
              // Calculate utilization based on status
              const utilization = agent.status === 'active' ? 85 : 
                                  agent.status === 'busy' ? 95 : 30;
              
              return (
                <button
                  key={agent.id}
                  onClick={() => setLocation(`/agent/${agent.id}`)}
                  className="flex items-center gap-6 p-4 rounded-2xl bg-[oklch(0.18_0.02_45/60%)] hover:bg-[oklch(0.22_0.03_45/70%)] border border-[oklch(0.55_0.15_45/20%)] transition-all group text-left"
                >
                  {/* Agent Silhouette */}
                  <div className="shrink-0">
                    <AgentSilhouette 
                      utilization={utilization} 
                      fillColor={agent.avatarColor || '#f97316'}
                      height={80}
                    />
                  </div>
                  
                  {/* Agent Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-1">{agent.name}</h3>
                    <p className="text-sm text-white/50 mb-2">{agent.team?.name}</p>
                    
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-white/40" />
                        <span className="text-white/60">{agent.hoursPerDay}h/Tag</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${
                        agent.status === 'active' ? 'text-green-400' :
                        agent.status === 'busy' ? 'text-[oklch(0.7_0.18_50)]' :
                        'text-white/40'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          agent.status === 'active' ? 'bg-green-500' :
                          agent.status === 'busy' ? 'bg-[oklch(0.7_0.18_50)]' :
                          'bg-gray-500'
                        }`} />
                        <span>{agent.status === 'active' ? 'Aktiv' : agent.status === 'busy' ? 'Beschäftigt' : 'Inaktiv'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
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
                <p className="text-white/50 text-sm">Aktive Agenten</p>
                <p className="text-2xl font-bold text-white mt-1">{stats?.activeAgents || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/20">
                <Bot className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </ModuleCard>
          
          <ModuleCard isEditable={isEditMode}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-sm">Gesamt Agenten</p>
                <p className="text-2xl font-bold text-white mt-1">{stats?.totalAgents || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-[oklch(0.55_0.15_45/20%)]">
                <Users className="w-6 h-6 text-[oklch(0.7_0.18_50)]" />
              </div>
            </div>
          </ModuleCard>
          
          <ModuleCard isEditable={isEditMode}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-sm">Laufende Prozesse</p>
                <p className="text-2xl font-bold text-white mt-1">{stats?.runningProcesses || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </ModuleCard>
        </div>
      </div>
    </DashboardLayout>
  );
}

import DashboardLayout, { useEditMode } from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import ModuleCard from "@/components/ModuleCard";
import PageContainer from "@/components/PageContainer";
import { TeamPortrait } from "@/components/TeamPortrait";
import { trpc } from "@/lib/trpc";
import { Zap, Clock, TrendingUp, ChevronRight, Users, Search } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Agents() {
  const [, setLocation] = useLocation();
  const { isEditMode } = useEditMode();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: stats } = trpc.stats.global.useQuery({ range: "day" });
  const { data: agents = [] } = trpc.agents.list.useQuery();
  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PageContainer className="space-y-6">
        <header className="flex items-start justify-between">
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
              value={stats?.runningProcesses || 0}
              label="Prozesse"
              size="sm"
            />
            <KPICard
              value={stats?.activeAgents || 0}
              label="Aktive Agenten"
              secondaryValue={agents.length}
              secondarySuffix="Gesamt"
              secondaryLabel="Agenten"
              tooltip="Aktive = active/busy/idle/planned; Gesamt = alle Agenten"
            />
            <KPICard
              value={Math.round((stats?.utilizationAgents ?? 0) * 100)}
              suffix="%"
              label="Auslastung"
              size="sm"
              tooltip="Auslastung = busyAgents / totalAgents"
            />
          </div>
        </header>

<div className="mb-4 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Suche in Teams..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl text-white placeholder:text-white/40 focus:outline-none"
                style={{
                  background: "color-mix(in oklch, var(--color-card) 85%, transparent)",
                  border: "1px solid color-mix(in oklch, var(--color-border) 80%, transparent)",
                }}
              />
            </div>
            
        <div className="space-y-6">
          {/* Teams Grid */}
          <ModuleCard 
            title="Teams" 
            icon={<Users className="w-4 h-4" />}
            isEditable={isEditMode}
          >
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAgents.map((agent) => {
                const agentCount = (agent as { agentCount?: number }).agentCount ?? 1;
                // Calculate utilization based on status
                const utilization = agent.status === 'active' ? 85 : 
                                    agent.status === 'busy' ? 95 : 30;
                
                const statusColor =
                  agent.status === 'active'
                    ? 'var(--success)'
                    : agent.status === 'busy'
                      ? 'var(--color-secondary)'
                      : 'var(--muted)';
                return (
                  <button
                    key={agent.id}
                    onClick={() => setLocation(`/agent/${agent.id}`)}
                    className="flex items-center gap-5 p-4 rounded-2xl transition-all group text-left border"
                    style={{
                      background: "color-mix(in oklch, var(--color-card) 90%, transparent)",
                      borderColor: "color-mix(in oklch, var(--color-border) 100%, transparent)",
                    }}
                  >
                    {/* Team Portrait */}
                    <div className="shrink-0">
                      <TeamPortrait 
                        color={'var(--color-primary)'}
                        agentCount={agentCount}
                        size="md"
                      />
                    </div>
                    
                    {/* Team Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-white">{agent.name}</h3>
                      <p className="text-xs text-white/40 mt-0.5">
                        {agentCount} {agentCount === 1 ? 'Agent' : 'Agenten'}
                      </p>
                      <p className="text-xs text-white/55 mt-1" title="Tageskapazität = Agenten * 24h">
                        Tageskapazität: {agentCount * 24}h
                      </p>
                      
                      <div className="flex items-center gap-3 text-xs mt-2">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-white/30" />
                          <span className="text-white/50">{agent.hoursPerDay}h/Tag</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs" style={{ color: statusColor }}>
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: statusColor }}
                          />
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
                    <p className="text-xl font-semibold text-white mt-0.5">{agents.length}</p>
                </div>
                <div
                  className="p-2.5 rounded-xl"
                  style={{ background: "color-mix(in oklch, var(--color-primary) 10%, transparent)" }}
                >
                  <Users className="w-5 h-5" style={{ color: "color-mix(in oklch, var(--color-primary) 70%, transparent)" }} />
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
      </PageContainer>
    </DashboardLayout>
  );
}

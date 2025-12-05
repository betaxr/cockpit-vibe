import DashboardLayout, { useEditMode } from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import ModuleCard from "@/components/ModuleCard";
import { FullBodyAgent, ProcessSegment } from "@/components/FullBodyAgent";
import { ProcessLegend } from "@/components/ProcessLegend";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Monitor, ChevronLeft, ChevronRight, Zap, TrendingUp } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useState, useMemo } from "react";

// Calendar Component
function MiniCalendar({ selectedDate, onDateChange }: { selectedDate: Date; onDateChange: (date: Date) => void }) {
  const [viewDate, setViewDate] = useState(selectedDate);
  
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  
  const days = [];
  const prevMonthDays = new Date(viewDate.getFullYear(), viewDate.getMonth(), 0).getDate();
  
  for (let i = adjustedFirstDay - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, isCurrentMonth: false });
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true });
  }
  
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({ day: i, isCurrentMonth: false });
  }

  const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
          className="p-1.5 rounded-lg hover:bg-[oklch(0.5_0.12_45/20%)] text-white/50 hover:text-white/80 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-white/90 tracking-wide">
          {viewDate.getDate().toString().padStart(2, '0')}. {monthNames[viewDate.getMonth()].toUpperCase()} {viewDate.getFullYear()}
        </span>
        <button 
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
          className="p-1.5 rounded-lg hover:bg-[oklch(0.5_0.12_45/20%)] text-white/50 hover:text-white/80 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center">
        {dayNames.map(day => (
          <div key={day} className="text-xs text-white/40 py-1.5 font-medium">{day}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const isSelected = d.isCurrentMonth && 
            d.day === selectedDate.getDate() && 
            viewDate.getMonth() === selectedDate.getMonth() &&
            viewDate.getFullYear() === selectedDate.getFullYear();
          const isToday = d.isCurrentMonth &&
            d.day === new Date().getDate() &&
            viewDate.getMonth() === new Date().getMonth() &&
            viewDate.getFullYear() === new Date().getFullYear();
            
          return (
            <button
              key={i}
              onClick={() => {
                if (d.isCurrentMonth) {
                  onDateChange(new Date(viewDate.getFullYear(), viewDate.getMonth(), d.day));
                }
              }}
              className={`
                text-sm py-2 rounded-lg transition-all duration-200
                ${d.isCurrentMonth ? 'text-white/70 hover:bg-[oklch(0.5_0.12_45/20%)]' : 'text-white/20'}
                ${isSelected ? 'bg-[oklch(0.55_0.15_45)] text-white font-medium' : ''}
                ${isToday && !isSelected ? 'ring-1 ring-[oklch(0.55_0.15_45)]' : ''}
              `}
            >
              {d.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Schedule Timeline Component with Process Status Colors
function ScheduleTimeline({ entries }: { entries: Array<{ title: string; startHour: number; endHour: number; lifecycleStatus?: string }> }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Get color based on lifecycle status
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'idle': return '#1a1a1a';
      case 'scheduled': return '#4a4a4a';
      case 'testing': return '#ffffff';
      case 'semi_automated': return '#f59e0b';
      case 'automated': 
      default: return '#f97316';
    }
  };
  
  return (
    <div className="flex gap-6">
      <div className="flex flex-col text-right text-xs text-white/40 w-14 shrink-0">
        {hours.map(hour => (
          <div key={hour} className="h-7 flex items-center justify-end pr-3 font-mono">
            {hour.toString().padStart(2, '0')}:00
          </div>
        ))}
      </div>
      
      <div className="flex-1 relative">
        {hours.map(hour => (
          <div key={hour} className="h-7 border-t border-[oklch(0.5_0.12_45/10%)]" />
        ))}
        
        {entries.map((entry, i) => {
          const top = entry.startHour * 28;
          const height = (entry.endHour - entry.startHour) * 28;
          const bgColor = getStatusColor(entry.lifecycleStatus);
          const isLight = entry.lifecycleStatus === 'testing';
          
          return (
            <div
              key={i}
              className={`absolute left-0 right-4 rounded-xl px-3 py-1.5 text-sm overflow-hidden shadow-lg ${isLight ? 'text-gray-800' : 'text-white/90'}`}
              style={{
                top: `${top}px`,
                height: `${height}px`,
                backgroundColor: bgColor,
              }}
            >
              <span className="font-medium">{entry.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AgentDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { isEditMode } = useEditMode();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const agentId = parseInt(params.id || "0");
  
  const { data: agent, isLoading } = trpc.agents.getById.useQuery({ id: agentId }, { enabled: agentId > 0 });
  const { data: workspaces = [] } = trpc.agents.workspaces.useQuery({ agentId }, { enabled: agentId > 0 });
  const { data: schedule = [] } = trpc.agents.schedule.useQuery({ 
    agentId, 
    date: selectedDate.toISOString().split('T')[0] 
  }, { enabled: agentId > 0 });
  const { data: processes = [] } = trpc.agents.processes.useQuery({ agentId }, { enabled: agentId > 0 });

  // Calculate agent stats and process segments for silhouette
  const { agentStats, processSegments } = useMemo(() => {
    const completedProcesses = processes.filter(p => p.status === 'completed');
    const totalValue = completedProcesses.reduce((sum, p) => sum + (p.valueGenerated || 0), 0) / 100;
    const totalTimeSaved = completedProcesses.reduce((sum, p) => sum + (p.timeSavedMinutes || 0), 0) / 60;
    
    // Calculate process segments for silhouette visualization
    const segments: ProcessSegment[] = [];
    const totalProcesses = processes.length || 1;
    
    // Count processes by lifecycle status
    const statusCounts: Record<string, number> = {
      idle: 0,
      scheduled: 0,
      testing: 0,
      semi_automated: 0,
      automated: 0,
    };
    
    processes.forEach(p => {
      const status = (p as any).lifecycleStatus || 'automated';
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      }
    });
    
    // Convert to percentages (bottom to top: idle -> automated)
    const order: Array<'idle' | 'scheduled' | 'testing' | 'semi_automated' | 'automated'> = 
      ['idle', 'scheduled', 'testing', 'semi_automated', 'automated'];
    
    order.forEach(status => {
      const percentage = (statusCounts[status] / totalProcesses) * 100;
      if (percentage > 0) {
        segments.push({ status, percentage });
      }
    });
    
    // Default if no segments
    if (segments.length === 0) {
      segments.push({ status: 'automated', percentage: 60 });
      segments.push({ status: 'semi_automated', percentage: 20 });
      segments.push({ status: 'scheduled', percentage: 10 });
      segments.push({ status: 'idle', percentage: 10 });
    }
    
    return {
      agentStats: {
        processCount: processes.length || 8,
        valueGenerated: Math.round(totalValue) || 45833,
        timeSaved: Math.round(totalTimeSaved) || 699,
        utilization: agent?.status === 'active' || agent?.status === 'busy' ? 98 : 0,
      },
      processSegments: segments,
    };
  }, [processes, agent]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-white/50">Laden...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!agent) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <p className="text-white/50">Agent nicht gefunden</p>
          <button 
            onClick={() => setLocation("/")}
            className="mt-4 text-[oklch(0.7_0.18_50)] hover:underline"
          >
            Zurück zur Übersicht
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* MaxWidth Container */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Header with KPIs */}
        <header className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => setLocation("/")}
              className="p-2.5 rounded-xl hover:bg-[oklch(0.5_0.12_45/20%)] text-white/50 hover:text-white/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-semibold text-white tracking-tight">Einhorn Apotheke</h1>
              <p className="text-white/40 mt-1 text-sm">
                {selectedDate.toLocaleDateString('de-DE', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
          
          {/* KPI Cards - Bundled */}
          <div className="flex gap-3">
            <KPICard 
              value={agentStats.processCount} 
              label="Prozesse" 
              icon={<Zap className="w-4 h-4" />}
              size="sm"
            />
            {/* Bundled KPI: Wertschöpfung + Zeitersparnis */}
            <KPICard
              value={agentStats.valueGenerated}
              suffix="€"
              label="Wertschöpfung"
              secondaryValue={agentStats.timeSaved}
              secondarySuffix="h"
              secondaryLabel="Zeitersparnis"
            />
            <KPICard 
              value={agentStats.utilization} 
              suffix="%" 
              label="Auslastung" 
              icon={<TrendingUp className="w-4 h-4" />}
              size="sm"
            />
          </div>
        </header>

        {/* Main Content - 3 Column Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Agent Profile Card with Silhouette and Legend */}
          <ModuleCard className="col-span-4" isEditable={isEditMode}>
            <div className="flex gap-6">
              {/* Silhouette - Multi-color based on process status */}
              <div className="shrink-0">
                <FullBodyAgent 
                  segments={processSegments}
                  size="lg"
                  showHead={true}
                />
              </div>
              
              {/* Info + Legend */}
              <div className="flex-1 space-y-5 py-2">
                <div>
                  <h2 className="text-xl font-semibold text-white">{agent.team?.name || "Team Sales"}</h2>
                  <p className="text-xs text-white/40 mt-1 font-mono">Team-ID: {agent.team?.teamId || agent.agentId}</p>
                </div>
                
                {/* Process Legend */}
                <ProcessLegend compact className="mt-4" />
                
                <div className="space-y-1 pt-2">
                  <p className="text-[oklch(0.7_0.18_50)] text-sm font-medium">1 Agent /</p>
                  <p className="text-[oklch(0.7_0.18_50)] text-sm font-medium">{agent.hoursPerDay} Stunden pro Tag</p>
                </div>
                
                <div className="space-y-2 text-xs pt-2">
                  <p className="text-white/40 font-medium">Group / Context</p>
                  <div className="space-y-1">
                    <p className="text-white/70">Region: <span className="text-white/50">{agent.team?.region || "Marketing EUW"}</span></p>
                    <p className="text-white/70">Customer type: <span className="text-white/50">{agent.team?.customerType || "Sales, Marketing"}</span></p>
                    <p className="text-white/70">Project: <span className="text-white/50">{agent.team?.project || "Social Media Management"}</span></p>
                  </div>
                </div>
                
                {/* Workspaces */}
                <div className="pt-4 border-t border-[oklch(0.5_0.12_45/15%)]">
                  <p className="text-xs text-white/40 font-medium mb-2">Workspaces:</p>
                  <div className="space-y-1.5">
                    {workspaces.length === 0 ? (
                      <>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[oklch(0.25_0.04_50/50%)] border border-[oklch(0.5_0.12_45/25%)]">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <Monitor className="w-3 h-3 text-white/30" />
                          <span className="text-xs text-white/70">Apotheken PC</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[oklch(0.2_0.03_50/40%)]">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                          <Monitor className="w-3 h-3 text-white/30" />
                          <span className="text-xs text-white/60">Marketing VM</span>
                        </div>
                      </>
                    ) : (
                      workspaces.map(ws => (
                        <div 
                          key={ws.id}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                            ws.status === 'online' 
                              ? 'bg-[oklch(0.25_0.04_50/50%)] border border-[oklch(0.5_0.12_45/25%)]' 
                              : 'bg-[oklch(0.2_0.03_50/40%)]'
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${ws.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`} />
                          <Monitor className="w-3 h-3 text-white/30" />
                          <span className="text-xs text-white/70">{ws.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ModuleCard>

          {/* Schedule Timeline */}
          <ModuleCard 
            className="col-span-4 max-h-[650px] overflow-auto"
            isEditable={isEditMode}
          >
            <ScheduleTimeline 
              entries={schedule.length > 0 ? schedule.map(s => ({
                title: s.title,
                startHour: s.startHour,
                endHour: s.endHour,
                lifecycleStatus: 'automated',
              })) : [
                { title: "Processplan X", startHour: 1, endHour: 2, lifecycleStatus: "automated" },
                { title: "Processplan X", startHour: 3, endHour: 4, lifecycleStatus: "automated" },
                { title: "Processplan X", startHour: 6, endHour: 8, lifecycleStatus: "semi_automated" },
                { title: "Processplan X", startHour: 8, endHour: 9, lifecycleStatus: "semi_automated" },
                { title: "Processplan X", startHour: 10, endHour: 11, lifecycleStatus: "automated" },
                { title: "Test Process X", startHour: 12, endHour: 13, lifecycleStatus: "testing" },
                { title: "Process Building", startHour: 14, endHour: 19, lifecycleStatus: "scheduled" },
                { title: "Processplan X", startHour: 20, endHour: 21, lifecycleStatus: "automated" },
                { title: "Processplan X", startHour: 22, endHour: 23, lifecycleStatus: "automated" },
              ]}
            />
          </ModuleCard>

          {/* Right Column - Calendar & Skills */}
          <div className="col-span-4 space-y-6">
            {/* Calendar */}
            <ModuleCard isEditable={isEditMode}>
              <MiniCalendar selectedDate={selectedDate} onDateChange={setSelectedDate} />
              
              <button 
                onClick={() => setLocation("/wochenplan")}
                className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[oklch(0.5_0.12_45/30%)] text-white/70 hover:bg-[oklch(0.5_0.12_45/15%)] transition-all duration-200"
              >
                <span className="font-medium">Weekly View</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </ModuleCard>

            {/* TOP Skills */}
            <ModuleCard isEditable={isEditMode}>
              <div className="text-center py-10">
                <h3 className="text-lg font-semibold text-white mb-3">TOP Skills of the Month</h3>
                <p className="text-[oklch(0.7_0.18_50)] text-sm">coming soon</p>
              </div>
            </ModuleCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

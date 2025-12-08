import DashboardLayout, { useEditMode } from "@/components/DashboardLayout";
import KPICard, { MultiKPICard } from "@/components/KPICard";
import ModuleCard from "@/components/ModuleCard";
import AgentSilhouette from "@/components/AgentSilhouette";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Monitor, ChevronLeft, ChevronRight, Zap, TrendingUp } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useState, useMemo } from "react";

// Calendar Component
function MiniCalendar({ selectedDate, onDateChange }: { selectedDate: Date; onDateChange: (date: Date) => void }) {
  const [viewDate, setViewDate] = useState(selectedDate);
  
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Monday start
  
  const days = [];
  const prevMonthDays = new Date(viewDate.getFullYear(), viewDate.getMonth(), 0).getDate();
  
  // Previous month days
  for (let i = adjustedFirstDay - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, isCurrentMonth: false });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true });
  }
  
  // Next month days
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({ day: i, isCurrentMonth: false });
  }

  const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
          className="p-1.5 rounded-lg text-white/50 hover:text-white/80 transition-colors"
          style={{ background: "color-mix(in oklch, var(--color-border) 20%, transparent)" }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-white/90 tracking-wide">
          {viewDate.getDate().toString().padStart(2, '0')}. {monthNames[viewDate.getMonth()].toUpperCase()} {viewDate.getFullYear()}
        </span>
        <button
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
          className="p-1.5 rounded-lg text-white/50 hover:text-white/80 transition-colors"
          style={{ background: "color-mix(in oklch, var(--color-border) 20%, transparent)" }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {dayNames.map(day => (
          <div key={day} className="text-xs text-white/40 py-1.5 font-medium">{day}</div>
        ))}
      </div>
      
      {/* Days Grid */}
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
                ${d.isCurrentMonth ? 'text-white/70 hover:bg-[color:color-mix(in_oklch,_var(--color-border)_20%,_transparent)]' : 'text-white/20'}
                ${isSelected ? 'bg-[color:var(--color-primary)] text-white font-medium' : ''}
                ${isToday && !isSelected ? 'ring-1 ring-[var(--color-primary)]' : ''}
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

// Schedule Timeline Component
function ScheduleTimeline({ entries }: { entries: Array<{ title: string; startHour: number; endHour: number; color?: string }> }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  return (
    <div className="flex gap-6">
      {/* Time Labels */}
      <div className="flex flex-col text-right text-xs text-white/40 w-14 shrink-0">
        {hours.map(hour => (
          <div key={hour} className="h-7 flex items-center justify-end pr-3 font-mono">
            {hour.toString().padStart(2, '0')}:00
          </div>
        ))}
      </div>
      
      {/* Timeline */}
      <div className="flex-1 relative">
        {/* Hour lines */}
        {hours.map(hour => (
          <div 
            key={hour} 
            className="h-7 border-t"
            style={{ borderColor: "color-mix(in oklch, var(--color-border) 15%, transparent)" }}
          />
        ))}
        
        {/* Entries */}
        {entries.map((entry, i) => {
          const top = entry.startHour * 28; // 28px per hour
          const height = (entry.endHour - entry.startHour) * 28;
          
          return (
            <div
              key={i}
              className="absolute left-0 right-4 rounded-xl px-3 py-1.5 text-sm text-white/90 overflow-hidden shadow-lg"
              style={{
                top: `${top}px`,
                height: `${height}px`,
                backgroundColor: entry.color || 'var(--color-primary)',
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

  // Calculate agent stats
  const agentStats = useMemo(() => {
    const completedProcesses = processes.filter(p => p.status === 'completed');
    const totalValue = completedProcesses.reduce((sum, p) => sum + (p.valueGenerated || 0), 0) / 100;
    const totalTimeSaved = completedProcesses.reduce((sum, p) => sum + (p.timeSavedMinutes || 0), 0) / 60;
    
    return {
      processCount: processes.length,
      valueGenerated: Math.round(totalValue),
      timeSaved: Math.round(totalTimeSaved),
      utilization: agent?.status === 'active' || agent?.status === 'busy' ? 92 : 0,
    };
  }, [processes, agent]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageContainer className="flex items-center justify-center h-64">
          <div className="animate-pulse text-white/50">Laden...</div>
        </PageContainer>
      </DashboardLayout>
    );
  }

  if (!agent) {
    return (
      <DashboardLayout>
        <PageContainer className="text-center py-12">
          <p className="text-white/50">Agent nicht gefunden</p>
          <button 
            onClick={() => setLocation("/")}
            className="mt-4 text-[color:var(--color-primary)] hover:underline"
          >
            Zurück zur Übersicht
          </button>
        </PageContainer>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageContainer className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => setLocation("/")}
              className="p-2.5 rounded-xl text-white/50 hover:text-white/80 transition-colors"
              style={{ background: "color-mix(in oklch, var(--color-border) 20%, transparent)" }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Einhorn Apotheke</h1>
              <p className="text-white/50 mt-1.5 text-lg">
                {selectedDate.toLocaleDateString('de-DE', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
          
          {/* KPI Cards */}
          <div className="flex gap-4">
            <KPICard value={agentStats.processCount} label="Prozesse" icon={<Zap className="w-5 h-5" />} />
            <KPICard value={agentStats.valueGenerated} suffix="€" label="Wertschöpfung" />
            <MultiKPICard items={[
              { value: agentStats.timeSaved, suffix: "h", label: "Zeitersparnis" },
            ]} />
            <KPICard value={agentStats.utilization} suffix="%" label="Auslastung" icon={<TrendingUp className="w-5 h-5" />} />
          </div>
        </div>

        {/* Main Content - 3 Column Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Agent Profile Card */}
          <ModuleCard className="col-span-4" isEditable={isEditMode}>
            <div className="flex gap-8">
              {/* Silhouette - Bar Chart Style */}
              <div className="shrink-0">
                <AgentSilhouette 
                  utilization={agentStats.utilization} 
                  height={360}
                  fillColor="var(--color-primary)"
                  bgColor="color-mix(in oklch, var(--color-primary) 20%, transparent)"
                />
              </div>
              
              {/* Info */}
              <div className="flex-1 space-y-6 py-2">
                <div>
                  <h2 className="text-xl font-semibold text-white">{agent.team?.name || "Team Sales"}</h2>
                  <p className="text-sm text-white/50 mt-1 font-mono">Team-ID: {agent.team?.teamId || agent.agentId}</p>
                </div>
                
                <div className="space-y-1">
          <p className="font-medium" style={{ color: "var(--color-primary)" }}>1 Agent /</p>
          <p className="font-medium" style={{ color: "var(--color-primary)" }}>{agent.hoursPerDay} Stunden pro Tag</p>
                </div>
                
                <div className="space-y-3 text-sm pt-2">
                  <p className="text-white/50 font-medium">Group / Context</p>
                  <div className="space-y-1.5">
                    <p className="text-white/80">Region: <span className="text-white/60">{agent.team?.region || "Marketing EUW"}</span></p>
                    <p className="text-white/80">Customer type: <span className="text-white/60">{agent.team?.customerType || "Sales, Marketing"}</span></p>
                    <p className="text-white/80">Project: <span className="text-white/60">{agent.team?.project || "Social Media Management"}</span></p>
                  </div>
                </div>
                
                {/* Workspaces */}
                <div
                  className="pt-5 border-t"
                  style={{ borderColor: "color-mix(in oklch, var(--color-border) 40%, transparent)" }}
                >
                  <p className="text-sm text-white/50 font-medium mb-3">Workspaces:</p>
                  <div className="space-y-2">
                    {workspaces.length === 0 ? (
                      <>
                        <div
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl border"
                          style={{
                            background: "color-mix(in oklch, var(--color-card) 60%, transparent)",
                            borderColor: "color-mix(in oklch, var(--color-border) 60%, transparent)",
                          }}
                        >
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <Monitor className="w-4 h-4 text-white/40" />
                          <span className="text-sm text-white/80">Apotheken PC</span>
                        </div>
                        <div
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                          style={{ background: "color-mix(in oklch, var(--color-card) 50%, transparent)" }}
                        >
                          <div className="w-2 h-2 rounded-full bg-gray-500" />
                          <Monitor className="w-4 h-4 text-white/40" />
                          <span className="text-sm text-white/70">Marketing VM</span>
                        </div>
                      </>
                    ) : (
                      workspaces.map(ws => (
                        <div 
                          key={ws.id}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl border"
                          style={
                            ws.status === 'online'
                              ? {
                                  background: "color-mix(in oklch, var(--color-card) 60%, transparent)",
                                  borderColor: "color-mix(in oklch, var(--color-border) 60%, transparent)",
                                }
                              : { background: "color-mix(in oklch, var(--color-card) 50%, transparent)", borderColor: "color-mix(in oklch, var(--color-border) 50%, transparent)" }
                          }
                        >
                          <div className={`w-2 h-2 rounded-full ${ws.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`} />
                          <Monitor className="w-4 h-4 text-white/40" />
                          <span className="text-sm text-white/80">{ws.name}</span>
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
                color: s.color || undefined,
              })) : [
                { title: "Processplan X", startHour: 1, endHour: 2, color: "var(--color-primary)" },
                { title: "Processplan X", startHour: 3, endHour: 4, color: "var(--color-primary)" },
                { title: "Processplan X", startHour: 6, endHour: 8, color: "var(--color-primary)" },
                { title: "Processplan X", startHour: 8, endHour: 9, color: "var(--color-accent)" },
                { title: "Processplan X", startHour: 10, endHour: 11, color: "var(--color-accent)" },
                { title: "Test Process X", startHour: 12, endHour: 13, color: "var(--color-muted)" },
                { title: "Process Building", startHour: 14, endHour: 19, color: "var(--color-muted)" },
                { title: "Processplan X", startHour: 20, endHour: 21, color: "var(--color-primary)" },
                { title: "Processplan X", startHour: 22, endHour: 23, color: "var(--color-primary)" },
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
                className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-white/70 transition-all duration-200"
                style={{
                  borderColor: "color-mix(in oklch, var(--color-border) 60%, transparent)",
                  background: "color-mix(in oklch, var(--color-card) 40%, transparent)",
                }}
              >
                <span className="font-medium">Weekly View</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </ModuleCard>

            {/* TOP Skills */}
            <ModuleCard isEditable={isEditMode}>
              <div className="text-center py-10">
                <h3 className="text-lg font-semibold text-white mb-3">TOP Skills of the Month</h3>
                <p className="text-sm" style={{ color: "var(--color-primary)" }}>coming soon</p>
              </div>
            </ModuleCard>
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}

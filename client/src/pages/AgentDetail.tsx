import DashboardLayout, { useEditMode } from "@/components/DashboardLayout";
import KPICard, { MultiKPICard } from "@/components/KPICard";
import ModuleCard from "@/components/ModuleCard";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Monitor, ChevronLeft, ChevronRight, Zap, TrendingUp, Clock } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useState, useMemo } from "react";

// Agent Silhouette SVG Component
function AgentSilhouette({ color = "#f97316" }: { color?: string }) {
  return (
    <svg viewBox="0 0 120 280" className="w-full h-full max-h-[400px]">
      {/* Head */}
      <ellipse cx="60" cy="35" rx="25" ry="30" fill={color} opacity="0.9" />
      {/* Face placeholder */}
      <ellipse cx="60" cy="28" rx="18" ry="15" fill="rgba(255,255,255,0.15)" />
      
      {/* Neck */}
      <rect x="50" y="60" width="20" height="15" fill={color} opacity="0.85" />
      
      {/* Body/Torso */}
      <path 
        d="M30 75 L90 75 L95 180 L25 180 Z" 
        fill={color} 
        opacity="0.8"
      />
      
      {/* Arms */}
      <path 
        d="M30 75 L15 140 L20 145 L40 90" 
        fill={color} 
        opacity="0.75"
      />
      <path 
        d="M90 75 L105 140 L100 145 L80 90" 
        fill={color} 
        opacity="0.75"
      />
      
      {/* Legs */}
      <path 
        d="M35 180 L30 260 L45 260 L50 180" 
        fill={color} 
        opacity="0.7"
      />
      <path 
        d="M70 180 L75 260 L90 260 L85 180" 
        fill={color} 
        opacity="0.7"
      />
      
      {/* Feet */}
      <ellipse cx="37" cy="268" rx="12" ry="8" fill="#c2410c" />
      <ellipse cx="82" cy="268" rx="12" ry="8" fill="#c2410c" />
    </svg>
  );
}

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
    <div className="space-y-3">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
          className="p-1 rounded hover:bg-[oklch(0.5_0.12_45/20%)] text-white/50 hover:text-white/80"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-white/80">
          {viewDate.getDate().toString().padStart(2, '0')}. {monthNames[viewDate.getMonth()].toUpperCase()} {viewDate.getFullYear()}
        </span>
        <button 
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
          className="p-1 rounded hover:bg-[oklch(0.5_0.12_45/20%)] text-white/50 hover:text-white/80"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {dayNames.map(day => (
          <div key={day} className="text-xs text-white/40 py-1">{day}</div>
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
                text-xs py-1.5 rounded-lg transition-colors
                ${d.isCurrentMonth ? 'text-white/70 hover:bg-[oklch(0.5_0.12_45/20%)]' : 'text-white/20'}
                ${isSelected ? 'bg-[oklch(0.55_0.15_45)] text-white' : ''}
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

// Schedule Timeline Component
function ScheduleTimeline({ entries }: { entries: Array<{ title: string; startHour: number; endHour: number; color?: string }> }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  return (
    <div className="flex gap-4">
      {/* Time Labels */}
      <div className="flex flex-col text-right text-xs text-white/40 w-12 shrink-0">
        {hours.map(hour => (
          <div key={hour} className="h-6 flex items-center justify-end pr-2">
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
            className="h-6 border-t border-[oklch(0.5_0.12_45/15%)]"
          />
        ))}
        
        {/* Entries */}
        {entries.map((entry, i) => {
          const top = entry.startHour * 24; // 24px per hour
          const height = (entry.endHour - entry.startHour) * 24;
          
          return (
            <div
              key={i}
              className="absolute left-0 right-0 rounded-lg px-2 py-1 text-xs text-white/90 overflow-hidden"
              style={{
                top: `${top}px`,
                height: `${height}px`,
                backgroundColor: entry.color || 'oklch(0.55 0.15 45)',
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
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-white/50">Laden...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!agent) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLocation("/")}
              className="p-2 rounded-lg hover:bg-[oklch(0.5_0.12_45/20%)] text-white/50 hover:text-white/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Einhorn Apotheke</h1>
              <p className="text-white/50 mt-1">
                {selectedDate.toLocaleDateString('de-DE', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
          
          {/* KPI Cards */}
          <div className="flex gap-3">
            <KPICard value={agentStats.processCount} label="Prozesse" icon={<Zap className="w-6 h-6" />} />
            <KPICard value={agentStats.valueGenerated} suffix="€" label="Wertschöpfung" />
            <MultiKPICard items={[
              { value: agentStats.timeSaved, suffix: "h", label: "Zeitersparnis" },
            ]} />
            <KPICard value={agentStats.utilization} suffix="%" label="Auslastung" icon={<TrendingUp className="w-6 h-6" />} />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-4">
          {/* Agent Profile Card */}
          <ModuleCard className="col-span-4 row-span-2" isEditable={isEditMode}>
            <div className="flex gap-6">
              {/* Silhouette */}
              <div className="w-32 shrink-0">
                <AgentSilhouette color={agent.avatarColor || "#f97316"} />
              </div>
              
              {/* Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">{agent.team?.name || "Team Sales"}</h2>
                  <p className="text-sm text-white/50">Team-ID: {agent.team?.teamId || agent.agentId}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-white/80">
                    <span className="text-[oklch(0.7_0.18_50)]">1 Agent /</span>
                  </p>
                  <p className="text-white/80">
                    <span className="text-[oklch(0.7_0.18_50)]">{agent.hoursPerDay} Stunden pro Tag</span>
                  </p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p className="text-white/60">Group / Context</p>
                  <p className="text-white/80">Region: {agent.team?.region || "Marketing EUW"}</p>
                  <p className="text-white/80">Customer type: {agent.team?.customerType || "Sales, Marketing"}</p>
                  <p className="text-white/80">Project: {agent.team?.project || "Social Media Management"}</p>
                </div>
                
                {/* Workspaces */}
                <div className="pt-4 border-t border-[oklch(0.5_0.12_45/20%)]">
                  <p className="text-sm text-white/60 mb-2">Workspaces:</p>
                  <div className="space-y-2">
                    {workspaces.length === 0 ? (
                      <>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[oklch(0.25_0.04_50/50%)] border border-[oklch(0.5_0.12_45/30%)]">
                          <Monitor className="w-4 h-4 text-white/40" />
                          <span className="text-sm text-white/70">Apotheken PC</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[oklch(0.2_0.03_50/40%)]">
                          <Monitor className="w-4 h-4 text-white/40" />
                          <span className="text-sm text-white/70">Marketing VM</span>
                        </div>
                      </>
                    ) : (
                      workspaces.map(ws => (
                        <div 
                          key={ws.id}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                            ws.status === 'online' 
                              ? 'bg-[oklch(0.25_0.04_50/50%)] border border-[oklch(0.5_0.12_45/30%)]' 
                              : 'bg-[oklch(0.2_0.03_50/40%)]'
                          }`}
                        >
                          <Monitor className="w-4 h-4 text-white/40" />
                          <span className="text-sm text-white/70">{ws.name}</span>
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
            title="" 
            className="col-span-4 row-span-2 max-h-[600px] overflow-auto"
            isEditable={isEditMode}
            noPadding
          >
            <div className="p-4">
              <ScheduleTimeline 
                entries={schedule.length > 0 ? schedule.map(s => ({
                  title: s.title,
                  startHour: s.startHour,
                  endHour: s.endHour,
                  color: s.color || undefined,
                })) : [
                  { title: "Processplan X", startHour: 1, endHour: 2, color: "#c2410c" },
                  { title: "Processplan X", startHour: 3, endHour: 4, color: "#c2410c" },
                  { title: "Processplan X", startHour: 6, endHour: 8, color: "#c2410c" },
                  { title: "Processplan X", startHour: 8, endHour: 9, color: "#a16207" },
                  { title: "Processplan X", startHour: 10, endHour: 11, color: "#a16207" },
                  { title: "Test Process X", startHour: 12, endHour: 13, color: "#78716c" },
                  { title: "Process Building", startHour: 14, endHour: 19, color: "#78716c" },
                  { title: "Processplan X", startHour: 20, endHour: 21, color: "#c2410c" },
                  { title: "Processplan X", startHour: 22, endHour: 23, color: "#c2410c" },
                ]}
              />
            </div>
          </ModuleCard>

          {/* Calendar */}
          <ModuleCard className="col-span-4" isEditable={isEditMode}>
            <MiniCalendar selectedDate={selectedDate} onDateChange={setSelectedDate} />
            
            <button 
              onClick={() => setLocation("/wochenplan")}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[oklch(0.5_0.12_45/40%)] text-white/70 hover:bg-[oklch(0.5_0.12_45/20%)] transition-colors"
            >
              Weekly View
              <ChevronRight className="w-4 h-4" />
            </button>
          </ModuleCard>

          {/* TOP Skills */}
          <ModuleCard className="col-span-4" isEditable={isEditMode}>
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold text-white mb-2">TOP Skills of the Month</h3>
              <p className="text-[oklch(0.7_0.18_50)]">coming soon</p>
            </div>
          </ModuleCard>
        </div>
      </div>
    </DashboardLayout>
  );
}

import DashboardLayout, { useEditMode } from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import ModuleCard from "@/components/ModuleCard";
import { trpc } from "@/lib/trpc";
import { Calendar, Clock, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";

type ViewMode = 'day' | 'week';

// Schedule Entry Component
function ScheduleEntry({ 
  title, 
  startHour, 
  endHour, 
  color,
  agentName,
  showAgent = false,
}: { 
  title: string; 
  startHour: number; 
  endHour: number; 
  color?: string;
  agentName?: string;
  showAgent?: boolean;
}) {
  const height = (endHour - startHour) * 48; // 48px per hour
  
  return (
    <div
      className="absolute left-0 right-2 rounded-xl px-3 py-2 text-sm text-white/90 overflow-hidden shadow-lg transition-transform hover:scale-[1.02]"
      style={{
        top: `${startHour * 48}px`,
        height: `${height}px`,
        backgroundColor: color || 'oklch(0.55 0.15 45)',
        minHeight: '40px',
      }}
    >
      <div className="font-medium truncate">{title}</div>
      {showAgent && agentName && (
        <div className="text-xs text-white/60 mt-0.5">{agentName}</div>
      )}
      <div className="text-xs text-white/50 mt-0.5">
        {startHour.toString().padStart(2, '0')}:00 - {endHour.toString().padStart(2, '0')}:00
      </div>
    </div>
  );
}

// Day View Component (24h)
function DayView({ 
  entries, 
  showAgentNames = false 
}: { 
  entries: Array<{ title: string; startHour: number; endHour: number; color?: string; agentName?: string }>;
  showAgentNames?: boolean;
}) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const currentHour = new Date().getHours();
  
  return (
    <div className="flex gap-6">
      {/* Time Labels */}
      <div className="flex flex-col text-right text-xs text-white/40 w-16 shrink-0">
        {hours.map(hour => (
          <div 
            key={hour} 
            className={`h-12 flex items-start justify-end pr-3 font-mono ${
              hour === currentHour ? 'text-[oklch(0.7_0.18_50)]' : ''
            }`}
          >
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
            className={`h-12 border-t ${
              hour === currentHour 
                ? 'border-[oklch(0.7_0.18_50/50%)]' 
                : 'border-[oklch(0.5_0.12_45/10%)]'
            }`}
          />
        ))}
        
        {/* Current time indicator */}
        <div 
          className="absolute left-0 right-0 h-0.5 bg-[oklch(0.7_0.18_50)] z-10"
          style={{ top: `${currentHour * 48 + (new Date().getMinutes() / 60) * 48}px` }}
        >
          <div className="absolute -left-2 -top-1.5 w-3 h-3 rounded-full bg-[oklch(0.7_0.18_50)]" />
        </div>
        
        {/* Entries */}
        {entries.map((entry, i) => (
          <ScheduleEntry 
            key={i} 
            {...entry} 
            showAgent={showAgentNames}
          />
        ))}
      </div>
    </div>
  );
}

// Week View Component
function WeekView({ 
  weekData,
  selectedAgent,
}: { 
  weekData: Array<{ day: string; dayIndex: number; entries: Array<any> }>;
  selectedAgent: number | null;
}) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const currentDay = new Date().getDay();
  const adjustedCurrentDay = currentDay === 0 ? 6 : currentDay - 1; // Monday = 0
  
  return (
    <div className="flex gap-4">
      {/* Time Labels */}
      <div className="flex flex-col text-right text-xs text-white/40 w-14 shrink-0 pt-10">
        {hours.map(hour => (
          <div key={hour} className="h-6 flex items-start justify-end pr-2 font-mono">
            {hour.toString().padStart(2, '0')}:00
          </div>
        ))}
      </div>
      
      {/* Days */}
      <div className="flex-1 grid grid-cols-7 gap-2">
        {weekData.map((dayData, dayIndex) => (
          <div key={dayData.day} className="flex flex-col">
            {/* Day Header */}
            <div className={`text-center py-2 mb-2 rounded-lg ${
              dayIndex === adjustedCurrentDay 
                ? 'bg-[oklch(0.55_0.15_45)] text-white' 
                : 'text-white/60'
            }`}>
              <div className="text-xs font-medium">{dayData.day.slice(0, 2)}</div>
            </div>
            
            {/* Day Timeline */}
            <div className="relative flex-1 bg-[oklch(0.15_0.02_45/30%)] rounded-lg">
              {/* Hour lines */}
              {hours.map(hour => (
                <div key={hour} className="h-6 border-t border-[oklch(0.5_0.12_45/5%)]" />
              ))}
              
              {/* Entries */}
              {dayData.entries
                .filter(e => selectedAgent === null || e.agentId === selectedAgent)
                .map((entry, i) => {
                  const top = entry.startHour * 24;
                  const height = (entry.endHour - entry.startHour) * 24;
                  
                  return (
                    <div
                      key={i}
                      className="absolute left-0.5 right-0.5 rounded px-1 text-[10px] text-white/90 overflow-hidden"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        backgroundColor: entry.color || 'oklch(0.55 0.15 45)',
                        minHeight: '20px',
                      }}
                    >
                      <div className="truncate font-medium">{entry.title}</div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Wochenplan() {
  const { isEditMode } = useEditMode();
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const { data: agents = [] } = trpc.agents.list.useQuery();
  const { data: stats } = trpc.stats.global.useQuery();
  
  // Get schedule for selected agent or all agents
  const { data: daySchedule = [] } = trpc.schedule.byAgent.useQuery(
    { agentId: selectedAgentId || 1 },
    { enabled: selectedAgentId !== null }
  );
  
  const { data: weekSchedule = [] } = trpc.schedule.week.useQuery({
    agentId: selectedAgentId || undefined,
    weekStart: selectedDate.toISOString().split('T')[0],
  });
  
  // Get all schedules for "all agents" view
  const allAgentSchedules = useMemo(() => {
    if (selectedAgentId !== null) return daySchedule;
    
    // Combine all agent schedules
    const combined: Array<{ title: string; startHour: number; endHour: number; color?: string; agentName: string }> = [];
    agents.forEach(agent => {
      // Use seed data pattern - each agent has their schedule
      const agentEntries = weekSchedule.flatMap(day => 
        day.entries.filter((e: any) => e.agentId === agent.id)
      );
      agentEntries.forEach((entry: any) => {
        if (!combined.some(c => c.startHour === entry.startHour && c.title === entry.title)) {
          combined.push({
            title: entry.title,
            startHour: entry.startHour,
            endHour: entry.endHour,
            color: entry.color,
            agentName: agent.name,
          });
        }
      });
    });
    return combined;
  }, [selectedAgentId, daySchedule, weekSchedule, agents]);
  
  const selectedAgent = agents.find(a => a.id === selectedAgentId);
  
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setSelectedDate(newDate);
  };
  
  const formatDateRange = () => {
    if (viewMode === 'day') {
      return selectedDate.toLocaleDateString('de-DE', { 
        weekday: 'long',
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      });
    } else {
      const weekStart = new Date(selectedDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      return `${weekStart.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })} - ${weekEnd.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    }
  };

  return (
    <DashboardLayout>
      {/* MaxWidth Container with Apple HIG spacing */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Wochenplan</h1>
            <p className="text-white/50 mt-1.5">
              {selectedAgent ? `${selectedAgent.name} - ${selectedAgent.team?.name}` : 'Alle Agenten'}
            </p>
          </div>
          
          {/* KPI Cards */}
          <div className="flex gap-4">
            <KPICard 
              value={stats?.activeAgents || 0} 
              label="Aktive Agenten" 
              icon={<Users className="w-5 h-5" />} 
            />
            <KPICard 
              value={stats?.runningProcesses || 0} 
              label="Laufende Prozesse" 
              icon={<Clock className="w-5 h-5" />} 
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Agent Selector */}
          <ModuleCard className="flex-1" isEditable={isEditMode}>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/60">Agent:</span>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedAgentId(null)}
                  className={`px-4 py-2 rounded-xl text-sm transition-all ${
                    selectedAgentId === null
                      ? 'bg-[oklch(0.55_0.15_45)] text-white'
                      : 'bg-[oklch(0.2_0.03_45/50%)] text-white/60 hover:text-white/80'
                  }`}
                >
                  Alle
                </button>
                {agents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2 ${
                      selectedAgentId === agent.id
                        ? 'bg-[oklch(0.55_0.15_45)] text-white'
                        : 'bg-[oklch(0.2_0.03_45/50%)] text-white/60 hover:text-white/80'
                    }`}
                  >
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: agent.avatarColor }}
                    />
                    {agent.name}
                  </button>
                ))}
              </div>
            </div>
          </ModuleCard>
          
          {/* View Mode Toggle */}
          <ModuleCard isEditable={isEditMode}>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2 ${
                  viewMode === 'day'
                    ? 'bg-[oklch(0.55_0.15_45)] text-white'
                    : 'bg-[oklch(0.2_0.03_45/50%)] text-white/60 hover:text-white/80'
                }`}
              >
                <Clock className="w-4 h-4" />
                24h
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2 ${
                  viewMode === 'week'
                    ? 'bg-[oklch(0.55_0.15_45)] text-white'
                    : 'bg-[oklch(0.2_0.03_45/50%)] text-white/60 hover:text-white/80'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Woche
              </button>
            </div>
          </ModuleCard>
        </div>

        {/* Date Navigation */}
        <ModuleCard isEditable={isEditMode}>
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigateDate('prev')}
              className="p-2 rounded-lg hover:bg-[oklch(0.5_0.12_45/20%)] text-white/50 hover:text-white/80 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-lg font-medium text-white/90">
              {formatDateRange()}
            </span>
            <button 
              onClick={() => navigateDate('next')}
              className="p-2 rounded-lg hover:bg-[oklch(0.5_0.12_45/20%)] text-white/50 hover:text-white/80 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </ModuleCard>

        {/* Schedule View */}
        <ModuleCard 
          className={viewMode === 'day' ? 'max-h-[700px] overflow-auto' : ''}
          isEditable={isEditMode}
        >
          {viewMode === 'day' ? (
            <DayView 
              entries={selectedAgentId !== null ? daySchedule : allAgentSchedules}
              showAgentNames={selectedAgentId === null}
            />
          ) : (
            <WeekView 
              weekData={weekSchedule}
              selectedAgent={selectedAgentId}
            />
          )}
        </ModuleCard>
        
        {/* Quick Actions */}
        {selectedAgentId && (
          <ModuleCard isEditable={isEditMode}>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Schnellzugriff</span>
              <button
                onClick={() => setLocation(`/agent/${selectedAgentId}`)}
                className="px-4 py-2 rounded-xl bg-[oklch(0.55_0.15_45)] text-white text-sm hover:bg-[oklch(0.6_0.15_45)] transition-colors"
              >
                Agent-Details öffnen
              </button>
            </div>
          </ModuleCard>
        )}
      </div>
    </DashboardLayout>
  );
}

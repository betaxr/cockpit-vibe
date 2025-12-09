import DashboardLayout from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import ModuleCard from "@/components/ModuleCard";
import PageContainer from "@/components/PageContainer";
import { trpc } from "@/lib/trpc";
import { Calendar, Users, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";

type WeekEntry = {
  id: string;
  title: string;
  startHour: number;
  endHour: number;
  color?: string;
  agentId?: string | number;
  agentName?: string;
};

function WeekView({ weekData }: { weekData: Array<{ day: string; dayIndex: number; entries: WeekEntry[] }> }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {weekData.map(day => (
        <div key={day.day} className="rounded-xl border border-[color:color-mix(in_oklch,_var(--color-border)_30%,_transparent)] p-4 bg-[color:color-mix(in_oklch,_var(--color-card)_40%,_transparent)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-white/80">{day.day}</span>
            <span className="text-xs text-white/50">{day.entries.length} Einträge</span>
          </div>
          <div className="flex flex-col gap-2">
            {day.entries.length === 0 && <span className="text-xs text-white/50">Keine Einträge</span>}
            {day.entries.map((entry, idx) => (
              <div
                key={`${entry.id}-${idx}`}
                className="rounded-lg px-3 py-2 text-sm text-white/90"
                style={{ backgroundColor: entry.color || 'var(--color-primary)' }}
              >
                <div className="font-medium truncate">{entry.title}</div>
                <div className="text-xs text-white/80 mt-1">
                  {entry.startHour.toString().padStart(2, '0')}:00 - {entry.endHour.toString().padStart(2, '0')}:00
                  {entry.agentName ? ` • ${entry.agentName}` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Wochenplan() {
  const [groupMode, setGroupMode] = useState<'team' | 'workplace'>('team');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stats } = trpc.stats.global.useQuery({ range: 'week' });
  const { data: weekSchedule = [] } = trpc.schedule.week.useQuery({
    scope: groupMode === 'workplace' ? 'workplace' : 'team',
    range: 'week',
  });

  const filteredWeek = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return weekSchedule;
    return weekSchedule.map(day => ({
      ...day,
      entries: day.entries.filter(entry =>
        entry.title.toLowerCase().includes(q) ||
        (entry.agentName || "").toLowerCase().includes(q)
      ),
    }));
  }, [searchQuery, weekSchedule]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
  };

  const formatDateRange = () => {
    const weekStart = new Date(selectedDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return `${weekStart.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })} - ${weekEnd.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  };

  return (
    <DashboardLayout>
      <PageContainer className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Wochenplan</h1>
            <p className="text-white/50 mt-1.5">Zeitfenster: Woche</p>
          </div>
          <div className="flex gap-4">
            <KPICard value={stats?.activeAgents || 0} label="Aktive Agenten" icon={<Users className="w-5 h-5" />} />
            <KPICard value={stats?.runningProcesses || 0} label="Laufende Prozesse" icon={<Calendar className="w-5 h-5" />} />
          </div>
        </div>

        <ModuleCard>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-white/60">Ansicht:</span>
            <button
              onClick={() => setGroupMode('team')}
              className={`px-4 py-2 rounded-xl text-sm transition-all ${
                groupMode === 'team'
                  ? 'bg-[color:var(--color-primary)] text-white'
                  : 'bg-[color:color-mix(in_oklch,_var(--color-card)_60%,_transparent)] text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)]'
              }`}
            >
              Teams/Agenten
            </button>
            <button
              onClick={() => setGroupMode('workplace')}
              className={`px-4 py-2 rounded-xl text-sm transition-all ${
                groupMode === 'workplace'
                  ? 'bg-[color:var(--color-primary)] text-white'
                  : 'bg-[color:color-mix(in_oklch,_var(--color-card)_60%,_transparent)] text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)]'
              }`}
            >
              Arbeitsplätze
            </button>
          </div>
        </ModuleCard>

        <ModuleCard>
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigateDate('prev')}
              className="p-2 rounded-lg hover:bg-[color:color-mix(in_oklch,_var(--color-border)_20%,_transparent)] text-white/50 hover:text-white/80 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-lg font-medium text-white/90">
              {formatDateRange()}
            </span>
            <button 
              onClick={() => navigateDate('next')}
              className="p-2 rounded-lg hover:bg-[color:color-mix(in_oklch,_var(--color-border)_20%,_transparent)] text-white/50 hover:text-white/80 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </ModuleCard>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Suche in Wochenplan (Titel oder Agent)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl text-white placeholder:text-white/40 focus:outline-none"
            style={{
              background: "color-mix(in oklch, var(--color-card) 85%, transparent)",
              border: "1px solid color-mix(in oklch, var(--color-border) 80%, transparent)",
            }}
          />
        </div>

        <WeekView weekData={filteredWeek as any} />
      </PageContainer>
    </DashboardLayout>
  );
}

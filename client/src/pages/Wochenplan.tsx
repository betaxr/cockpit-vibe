import DashboardLayout, { useEditMode } from "@/components/DashboardLayout";
import ModuleCard from "@/components/ModuleCard";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function Wochenplan() {
  const { isEditMode } = useEditMode();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  // Get week dates
  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };
  
  const weekDates = getWeekDates(currentWeek);
  const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentWeek(newDate);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Wochenplan</h1>
            <p className="text-white/50 mt-1">
              KW {Math.ceil((weekDates[0].getDate() - weekDates[0].getDay() + 1) / 7)} • {weekDates[0].toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigateWeek(-1)}
              className="p-2 rounded-lg hover:bg-[oklch(0.5_0.12_45/20%)] text-white/50 hover:text-white/80 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setCurrentWeek(new Date())}
              className="px-4 py-2 rounded-lg bg-[oklch(0.55_0.15_45/30%)] text-white/70 hover:bg-[oklch(0.55_0.15_45/50%)] transition-colors"
            >
              Heute
            </button>
            <button 
              onClick={() => navigateWeek(1)}
              className="p-2 rounded-lg hover:bg-[oklch(0.5_0.12_45/20%)] text-white/50 hover:text-white/80 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <ModuleCard 
          title="Wochenübersicht" 
          icon={<Calendar className="w-4 h-4" />}
          isEditable={isEditMode}
          noPadding
        >
          <div className="overflow-auto">
            <div className="min-w-[800px]">
              {/* Day Headers */}
              <div className="grid grid-cols-8 border-b border-[oklch(0.5_0.12_45/20%)]">
                <div className="p-3 text-sm text-white/40">Zeit</div>
                {weekDates.map((date, i) => {
                  const isToday = date.toDateString() === new Date().toDateString();
                  return (
                    <div 
                      key={i} 
                      className={`p-3 text-center ${isToday ? 'bg-[oklch(0.55_0.15_45/20%)]' : ''}`}
                    >
                      <div className="text-xs text-white/40">{dayNames[i]}</div>
                      <div className={`text-lg font-semibold ${isToday ? 'text-[oklch(0.7_0.18_50)]' : 'text-white/80'}`}>
                        {date.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Time Grid */}
              <div className="max-h-[600px] overflow-auto">
                {hours.map(hour => (
                  <div key={hour} className="grid grid-cols-8 border-b border-[oklch(0.5_0.12_45/10%)]">
                    <div className="p-2 text-xs text-white/40 text-right pr-3">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    {weekDates.map((date, i) => {
                      const isToday = date.toDateString() === new Date().toDateString();
                      return (
                        <div 
                          key={i} 
                          className={`h-10 border-l border-[oklch(0.5_0.12_45/10%)] hover:bg-[oklch(0.5_0.12_45/10%)] transition-colors ${isToday ? 'bg-[oklch(0.55_0.15_45/5%)]' : ''}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ModuleCard>
      </div>
    </DashboardLayout>
  );
}

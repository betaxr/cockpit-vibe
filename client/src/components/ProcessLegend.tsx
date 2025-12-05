import { cn } from "@/lib/utils";

// Process Lifecycle Status Colors matching the design
const LEGEND_ITEMS = [
  { 
    status: 'idle',
    label: 'Restkapazitäten', 
    dotClass: 'bg-[oklch(0.25_0.02_45)]',
    description: 'Ungenutzte Kapazität des Agenten'
  },
  { 
    status: 'scheduled',
    label: 'Geplante Prozesse', 
    dotClass: 'bg-[oklch(0.45_0.03_45)]',
    description: 'Prozesse die für später geplant sind'
  },
  { 
    status: 'testing',
    label: 'Neue Test Prozesse', 
    dotClass: 'bg-white border border-white/20',
    description: 'Prozesse in der Testphase'
  },
  { 
    status: 'semi_automated',
    label: 'Teilautomatisierte Prozesse', 
    dotClass: 'bg-[oklch(0.7_0.16_55)]',
    description: 'Prozesse mit manuellen Schritten'
  },
  { 
    status: 'automated',
    label: 'Reguläre Auslastung', 
    dotClass: 'bg-[oklch(0.6_0.2_45)]',
    description: 'Vollautomatisierte Prozesse'
  }
];

interface ProcessLegendProps {
  className?: string;
  showDescriptions?: boolean;
  compact?: boolean;
}

export function ProcessLegend({ 
  className, 
  showDescriptions = false,
  compact = false 
}: ProcessLegendProps) {
  return (
    <div className={cn(
      "rounded-xl border border-[oklch(0.5_0.12_45/20%)] bg-[oklch(0.16_0.02_45/60%)] backdrop-blur-sm",
      compact ? "p-3" : "p-4",
      className
    )}>
      <div className={cn("space-y-2", compact && "space-y-1.5")}>
        {LEGEND_ITEMS.map((item) => (
          <div 
            key={item.status}
            className="flex items-center gap-3 group cursor-default"
            title={item.description}
          >
            {/* Color Dot */}
            <div className={cn(
              "shrink-0 rounded-full",
              compact ? "w-3 h-3" : "w-4 h-4",
              item.dotClass
            )} />
            
            {/* Label */}
            <span className={cn(
              "text-white/80 transition-colors group-hover:text-white",
              compact ? "text-xs" : "text-sm"
            )}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
      
      {showDescriptions && (
        <p className="mt-3 pt-3 border-t border-white/10 text-xs text-white/40">
          Hover über einen Status für mehr Details
        </p>
      )}
    </div>
  );
}

// Inline legend for use in headers or compact spaces
export function ProcessLegendInline({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      {LEGEND_ITEMS.map((item) => (
        <div 
          key={item.status}
          className="flex items-center gap-2"
          title={item.description}
        >
          <div className={cn("w-2.5 h-2.5 rounded-full", item.dotClass)} />
          <span className="text-xs text-white/60">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

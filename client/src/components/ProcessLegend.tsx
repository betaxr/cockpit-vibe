/**
 * @fileoverview Process Legend Component
 * 
 * This component displays a color-coded legend explaining the 5-color
 * process status system used throughout the application. It appears
 * as a hover popup next to agent silhouettes and in other contexts
 * where process status visualization needs explanation.
 * 
 * **Process Status Color System:**
 * 1. Restkapazitäten (Idle): Transparent gray-black - unused capacity
 * 2. Geplante Prozesse (Scheduled): Gray - planned for later
 * 3. Neue Test Prozesse (Testing): White - in testing phase
 * 4. Teilautomatisierte (Semi-automated): Light orange - has manual steps
 * 5. Reguläre Auslastung (Automated): Neon orange - fully automated
 * 
 * @module components/ProcessLegend
 * @author Cockpit Vibe Team
 * @version 1.0.0
 */

import { cn } from "@/lib/utils";

/**
 * Legend item interface for process status display
 */
interface LegendItem {
  /** Internal status identifier */
  status: string;
  /** Display label in German */
  label: string;
  /** Tailwind CSS classes for the color dot */
  dotClass: string;
  /** Tooltip description explaining the status */
  description: string;
}

/**
 * Process lifecycle status colors matching the design system.
 * Colors use OKLCH color space for consistent appearance.
 */
const LEGEND_ITEMS: LegendItem[] = [
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

/**
 * Props for the ProcessLegend component
 */
interface ProcessLegendProps {
  /** Additional CSS classes */
  className?: string;
  /** Whether to show description text at bottom */
  showDescriptions?: boolean;
  /** Use compact layout with smaller spacing */
  compact?: boolean;
}

/**
 * ProcessLegend Component
 * 
 * Displays a glassmorphism-styled legend box explaining the process
 * status color coding system. Each status is shown with its color
 * dot and German label.
 * 
 * @param props - Component properties
 * @returns JSX element containing the legend
 * 
 * @example
 * // Standard legend
 * <ProcessLegend />
 * 
 * @example
 * // Compact legend with descriptions
 * <ProcessLegend compact showDescriptions />
 */
export function ProcessLegend({ 
  className, 
  showDescriptions = false,
  compact = false 
}: ProcessLegendProps) {
  return (
    <div className={cn(
      // Glassmorphism styling with orange-tinted border
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
            {/* Color indicator dot */}
            <div className={cn(
              "shrink-0 rounded-full",
              compact ? "w-3 h-3" : "w-4 h-4",
              item.dotClass
            )} />
            
            {/* Status label */}
            <span className={cn(
              "text-white/80 transition-colors group-hover:text-white",
              compact ? "text-xs" : "text-sm"
            )}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
      
      {/* Optional description footer */}
      {showDescriptions && (
        <p className="mt-3 pt-3 border-t border-white/10 text-xs text-white/40">
          Hover über einen Status für mehr Details
        </p>
      )}
    </div>
  );
}

/**
 * Props for the ProcessLegendInline component
 */
interface ProcessLegendInlineProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * ProcessLegendInline Component
 * 
 * Compact inline version of the legend for use in headers or
 * other space-constrained areas. Displays all statuses in a
 * horizontal flex layout.
 * 
 * @param props - Component properties
 * @returns JSX element containing the inline legend
 * 
 * @example
 * <ProcessLegendInline className="mb-4" />
 */
export function ProcessLegendInline({ className }: ProcessLegendInlineProps) {
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

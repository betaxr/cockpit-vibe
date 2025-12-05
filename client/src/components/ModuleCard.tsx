import { GripVertical, Move } from "lucide-react";
import { ReactNode } from "react";

interface ModuleCardProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  isEditable?: boolean;
}

export default function ModuleCard({
  title,
  icon,
  children,
  className = "",
  noPadding = false,
  isEditable = false,
}: ModuleCardProps) {
  return (
    <div
      className={`
        relative overflow-hidden group
        bg-gradient-to-br from-[oklch(0.16_0.02_50/60%)] to-[oklch(0.11_0.015_50/50%)]
        backdrop-blur-xl
        border ${isEditable ? "border-[oklch(0.55_0.15_45/40%)]" : "border-[oklch(0.45_0.10_45/25%)]"}
        rounded-xl
        transition-all duration-200
        ${isEditable ? "cursor-grab active:cursor-grabbing hover:border-[oklch(0.65_0.16_50/50%)] hover:shadow-[0_0_20px_oklch(0.5_0.15_45/15%)]" : "hover:border-[oklch(0.50_0.12_45/35%)]"}
        ${className}
      `}
    >
      {/* Subtle inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.35_0.1_45/5%)] to-transparent pointer-events-none" />
      
      {/* Edit Mode Grip Handles - visible when editable */}
      {isEditable && (
        <>
          {/* Top-left grip */}
          <div className="absolute top-0 left-0 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <div className="p-1 rounded bg-[oklch(0.25_0.05_45/80%)] border border-[oklch(0.55_0.15_45/40%)]">
              <Move className="w-3 h-3 text-white/50" />
            </div>
          </div>
          
          {/* Corner resize handles */}
          <div className="absolute bottom-0 right-0 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-se-resize">
            <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-[oklch(0.55_0.15_45/60%)] rounded-br" />
          </div>
        </>
      )}
      
      {/* Header */}
      {title && (
        <div className="relative z-10 px-4 py-2.5 border-b border-[oklch(0.45_0.10_45/20%)] flex items-center gap-2 bg-[oklch(0.18_0.025_50/40%)]">
          {isEditable && (
            <GripVertical className="w-3.5 h-3.5 text-white/25 hover:text-white/50 transition-colors cursor-grab" strokeWidth={1.5} />
          )}
          {icon && <span className="text-white/30">{icon}</span>}
          <span className="text-xs font-medium text-white/70 tracking-wide">{title}</span>
        </div>
      )}

      {/* Content */}
      <div className={`relative z-10 ${noPadding ? "" : "p-4"}`}>
        {children}
      </div>
      
      {/* Edit mode indicator dot */}
      {isEditable && !title && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <div className="p-1 rounded bg-[oklch(0.25_0.05_45/80%)] border border-[oklch(0.55_0.15_45/40%)]">
            <GripVertical className="w-3 h-3 text-white/40" />
          </div>
        </div>
      )}
    </div>
  );
}

// Header bar component for top navigation/status
interface HeaderBarProps {
  children: ReactNode;
  className?: string;
}

export function HeaderBar({ children, className = "" }: HeaderBarProps) {
  return (
    <div
      className={`
        relative overflow-hidden
        bg-gradient-to-r from-[oklch(0.16_0.02_50/50%)] to-[oklch(0.13_0.02_50/40%)]
        backdrop-blur-xl
        border border-[oklch(0.45_0.10_45/25%)]
        rounded-xl
        px-4 py-2
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.35_0.1_45/3%)] to-transparent pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

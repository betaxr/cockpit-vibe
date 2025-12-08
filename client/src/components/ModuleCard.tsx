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
        bg-gradient-to-br from-[color:color-mix(in_oklch,_var(--color-card)_70%,_transparent)] to-[color:color-mix(in_oklch,_var(--color-card)_55%,_transparent)]
        backdrop-blur-xl
        border ${isEditable ? "border-[color:color-mix(in_oklch,_var(--color-primary)_50%,_var(--color-border)_50%)]" : "border-[color:color-mix(in_oklch,_var(--color-border)_70%,_transparent)]"}
        rounded-xl
        transition-all duration-200
        ${isEditable ? "cursor-grab active:cursor-grabbing hover:shadow-[0_0_20px_color-mix(in_oklch,_var(--color-primary)_15%,_transparent)]" : ""}
        ${className}
      `}
      style={{
        borderColor: "color-mix(in oklch, var(--color-border) 80%, transparent)",
        background: "color-mix(in oklch, var(--color-card) 90%, transparent)",
      }}
    >
      {/* Subtle inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[color:color-mix(in_oklch,_var(--color-accent)_5%,_transparent)] to-transparent pointer-events-none" />
      
      {/* Edit Mode Grip Handles - visible when editable */}
      {isEditable && (
        <>
          {/* Top-left grip */}
          <div className="absolute top-0 left-0 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <div
              className="p-1 rounded border"
              style={{
                background: "color-mix(in oklch, var(--color-card) 80%, transparent)",
                borderColor: "color-mix(in oklch, var(--color-border) 70%, transparent)",
              }}
            >
              <Move className="w-3 h-3 text-white/50" />
            </div>
          </div>
          
          {/* Corner resize handles */}
          <div className="absolute bottom-0 right-0 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-se-resize">
            <div
              className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 rounded-br"
              style={{ borderColor: "color-mix(in oklch, var(--color-primary) 60%, transparent)" }}
            />
          </div>
        </>
      )}
      
      {/* Header */}
      {title && (
        <div
          className="relative z-10 px-4 py-2.5 border-b flex items-center gap-2"
          style={{
            borderColor: "color-mix(in oklch, var(--color-border) 70%, transparent)",
            background: "color-mix(in oklch, var(--color-card) 70%, transparent)",
          }}
        >
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
          <div
            className="p-1 rounded border"
            style={{
              background: "color-mix(in oklch, var(--color-card) 80%, transparent)",
              borderColor: "color-mix(in oklch, var(--color-border) 70%, transparent)",
            }}
          >
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
        bg-gradient-to-r from-[color:color-mix(in_oklch,_var(--color-card)_60%,_transparent)] to-[color:color-mix(in_oklch,_var(--color-card)_50%,_transparent)]
        backdrop-blur-xl
        border
        rounded-xl
        px-4 py-2
        ${className}
      `}
      style={{ borderColor: "color-mix(in oklch, var(--color-border) 70%, transparent)" }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[color:color-mix(in_oklch,_var(--color-accent)_3%,_transparent)] to-transparent pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

import { GripVertical } from "lucide-react";
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
        relative overflow-hidden
        bg-gradient-to-br from-[oklch(0.18_0.03_50/70%)] to-[oklch(0.12_0.02_50/60%)]
        backdrop-blur-xl
        border-2 ${isEditable ? "border-[oklch(0.55_0.15_45/50%)]" : "border-[oklch(0.5_0.12_45/35%)]"}
        rounded-xl
        transition-all duration-300
        ${isEditable ? "cursor-grab active:cursor-grabbing hover:border-[oklch(0.7_0.18_50/60%)]" : "hover:border-[oklch(0.55_0.14_45/50%)]"}
        ${className}
      `}
    >
      {/* Subtle inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.35_0.1_45/8%)] to-transparent pointer-events-none" />
      
      {/* Header */}
      {title && (
        <div className="relative z-10 px-4 py-3 border-b border-[oklch(0.5_0.12_45/25%)] flex items-center gap-2 bg-[oklch(0.2_0.035_50/50%)]">
          {isEditable && <GripVertical className="w-4 h-4 opacity-30" strokeWidth={1.5} />}
          {icon && <span className="opacity-40">{icon}</span>}
          <span className="text-sm font-medium text-white/80">{title}</span>
        </div>
      )}

      {/* Content */}
      <div className={`relative z-10 ${noPadding ? "" : "p-4"}`}>
        {children}
      </div>
      
      {/* Edit mode indicator */}
      {isEditable && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[oklch(0.7_0.18_50)] animate-pulse" />
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
        bg-gradient-to-r from-[oklch(0.18_0.03_50/60%)] to-[oklch(0.15_0.025_50/50%)]
        backdrop-blur-xl
        border border-[oklch(0.5_0.12_45/30%)]
        rounded-xl
        px-4 py-2
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.35_0.1_45/5%)] to-transparent pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

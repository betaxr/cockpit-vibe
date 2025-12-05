import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface KPICardProps {
  value: string | number;
  label: string;
  unit?: string;
  icon?: LucideIcon;
  variant?: "default" | "compact";
  className?: string;
}

export default function KPICard({
  value,
  label,
  unit,
  icon: Icon,
  variant = "default",
  className = "",
}: KPICardProps) {
  return (
    <div
      className={`
        relative overflow-hidden
        bg-gradient-to-br from-[oklch(0.22_0.04_45)] to-[oklch(0.15_0.03_50)]
        border-2 border-[oklch(0.55_0.15_45/60%)]
        rounded-2xl
        ${variant === "compact" ? "p-4" : "p-6"}
        transition-all duration-300
        hover:border-[oklch(0.65_0.18_45/80%)]
        hover:shadow-[0_0_30px_oklch(0.5_0.15_45/20%)]
        ${className}
      `}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.4_0.12_45/10%)] to-transparent pointer-events-none" />
      
      {/* Icon - minimalistic with low opacity */}
      {Icon && (
        <div className="absolute top-3 right-3 opacity-15">
          <Icon className={variant === "compact" ? "w-8 h-8" : "w-12 h-12"} strokeWidth={1} />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-baseline gap-1">
          <span
            className={`
              font-bold tracking-tight text-white
              ${variant === "compact" ? "text-3xl" : "text-5xl"}
            `}
          >
            {value}
          </span>
          {unit && (
            <span className={`text-white/70 font-medium ${variant === "compact" ? "text-lg" : "text-2xl"}`}>
              {unit}
            </span>
          )}
        </div>
        <p className={`text-white/60 mt-1 ${variant === "compact" ? "text-sm" : "text-base"}`}>
          {label}
        </p>
      </div>
    </div>
  );
}

// Multi-KPI Card for side-by-side display
interface MultiKPICardProps {
  items: Array<{
    value: string | number;
    label: string;
    unit?: string;
  }>;
  className?: string;
}

export function MultiKPICard({ items, className = "" }: MultiKPICardProps) {
  return (
    <div
      className={`
        relative overflow-hidden
        bg-gradient-to-br from-[oklch(0.22_0.04_45)] to-[oklch(0.15_0.03_50)]
        border-2 border-[oklch(0.55_0.15_45/60%)]
        rounded-2xl p-6
        transition-all duration-300
        hover:border-[oklch(0.65_0.18_45/80%)]
        hover:shadow-[0_0_30px_oklch(0.5_0.15_45/20%)]
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.4_0.12_45/10%)] to-transparent pointer-events-none" />
      
      <div className="relative z-10 flex divide-x divide-[oklch(0.5_0.12_45/30%)]">
        {items.map((item, index) => (
          <div key={index} className={`flex-1 ${index > 0 ? "pl-6" : ""} ${index < items.length - 1 ? "pr-6" : ""}`}>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight text-white">
                {item.value}
              </span>
              {item.unit && (
                <span className="text-xl text-white/70 font-medium">
                  {item.unit}
                </span>
              )}
            </div>
            <p className="text-white/60 mt-1 text-sm">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

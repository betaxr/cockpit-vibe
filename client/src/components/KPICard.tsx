import { ReactNode } from "react";

interface KPICardProps {
  value: string | number;
  label: string;
  suffix?: string;
  icon?: ReactNode;
  variant?: "default" | "compact" | "secondary";
  className?: string;
}

export default function KPICard({
  value,
  label,
  suffix,
  icon,
  variant = "default",
  className = "",
}: KPICardProps) {
  const isSecondary = variant === "secondary";
  
  return (
    <div
      className={`
        relative overflow-hidden
        ${isSecondary 
          ? "bg-transparent border-0" 
          : "bg-gradient-to-br from-[oklch(0.22_0.04_45)] to-[oklch(0.15_0.03_50)] border-2 border-[oklch(0.55_0.15_45/60%)]"
        }
        rounded-2xl
        ${variant === "compact" ? "p-4" : "p-5 min-w-[120px]"}
        transition-all duration-300
        ${!isSecondary && "hover:border-[oklch(0.65_0.18_45/80%)] hover:shadow-[0_0_30px_oklch(0.5_0.15_45/20%)]"}
        ${className}
      `}
    >
      {/* Background glow effect */}
      {!isSecondary && (
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.4_0.12_45/10%)] to-transparent pointer-events-none" />
      )}
      
      {/* Icon - minimalistic with low opacity */}
      {icon && (
        <div className="absolute top-3 right-3 opacity-20 text-white">
          {icon}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-baseline gap-0.5">
          <span
            className={`
              font-bold tracking-tight text-white
              ${variant === "compact" ? "text-3xl" : "text-4xl"}
            `}
          >
            {value}
          </span>
          {suffix && (
            <span className={`text-white/70 font-medium ${variant === "compact" ? "text-lg" : "text-xl"}`}>
              {suffix}
            </span>
          )}
        </div>
        <p className={`text-white/60 mt-0.5 ${variant === "compact" ? "text-xs" : "text-sm"}`}>
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
    suffix?: string;
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
        rounded-2xl p-5
        transition-all duration-300
        hover:border-[oklch(0.65_0.18_45/80%)]
        hover:shadow-[0_0_30px_oklch(0.5_0.15_45/20%)]
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.4_0.12_45/10%)] to-transparent pointer-events-none" />
      
      <div className="relative z-10 flex divide-x divide-[oklch(0.5_0.12_45/30%)]">
        {items.map((item, index) => (
          <div key={index} className={`flex-1 ${index > 0 ? "pl-5" : ""} ${index < items.length - 1 ? "pr-5" : ""}`}>
            <div className="flex items-baseline gap-0.5">
              <span className="text-3xl font-bold tracking-tight text-white">
                {item.value}
              </span>
              {item.suffix && (
                <span className="text-lg text-white/70 font-medium">
                  {item.suffix}
                </span>
              )}
            </div>
            <p className="text-white/60 mt-0.5 text-xs">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

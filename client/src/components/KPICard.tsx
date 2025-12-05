import { ReactNode } from "react";

interface KPICardProps {
  value: string | number;
  label: string;
  suffix?: string;
  icon?: ReactNode;
  variant?: "default" | "compact" | "secondary";
  size?: "sm" | "md" | "lg";
  // For bundled KPIs (e.g., Wertschöpfung + Zeitersparnis)
  secondaryValue?: string | number;
  secondarySuffix?: string;
  secondaryLabel?: string;
  className?: string;
}

export default function KPICard({
  value,
  label,
  suffix,
  icon,
  variant = "default",
  size = "md",
  secondaryValue,
  secondarySuffix,
  secondaryLabel,
  className = "",
}: KPICardProps) {
  const isSecondary = variant === "secondary";
  const hasBundledKPI = secondaryValue !== undefined;
  
  // Size-based classes
  const sizeClasses = {
    sm: {
      padding: "p-3",
      value: "text-2xl",
      suffix: "text-sm",
      label: "text-xs",
      minWidth: "min-w-[90px]",
    },
    md: {
      padding: "p-4",
      value: "text-3xl",
      suffix: "text-lg",
      label: "text-xs",
      minWidth: "min-w-[110px]",
    },
    lg: {
      padding: "p-5",
      value: "text-4xl",
      suffix: "text-xl",
      label: "text-sm",
      minWidth: "min-w-[130px]",
    },
  };

  const s = sizeClasses[size];
  
  return (
    <div
      className={`
        relative overflow-hidden
        ${isSecondary 
          ? "bg-transparent border-0" 
          : "bg-gradient-to-br from-[oklch(0.20_0.03_45)] to-[oklch(0.14_0.02_50)] border border-[oklch(0.55_0.15_45/40%)]"
        }
        rounded-xl
        ${s.padding} ${s.minWidth}
        transition-all duration-200
        ${!isSecondary && "hover:border-[oklch(0.60_0.16_45/60%)]"}
        ${className}
      `}
    >
      {/* Background glow effect - subtle */}
      {!isSecondary && (
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.4_0.12_45/5%)] to-transparent pointer-events-none" />
      )}
      
      {/* Icon - minimalistic with low opacity */}
      {icon && (
        <div className="absolute top-2.5 right-2.5 opacity-15 text-white">
          {icon}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {hasBundledKPI ? (
          // Bundled KPI layout (side by side)
          <div className="flex items-start gap-4">
            {/* Primary value */}
            <div>
              <div className="flex items-baseline gap-0.5">
                <span className={`font-semibold tracking-tight text-white ${s.value}`}>
                  {value}
                </span>
                {suffix && (
                  <span className={`text-white/60 font-medium ${s.suffix}`}>
                    {suffix}
                  </span>
                )}
              </div>
              <p className={`text-white/50 mt-0.5 ${s.label}`}>
                {label}
              </p>
            </div>
            
            {/* Secondary value */}
            <div className="border-l border-[oklch(0.5_0.12_45/20%)] pl-4">
              <div className="flex items-baseline gap-0.5">
                <span className={`font-semibold tracking-tight text-white/80 ${sizeClasses.sm.value}`}>
                  {secondaryValue}
                </span>
                {secondarySuffix && (
                  <span className={`text-white/50 font-medium ${sizeClasses.sm.suffix}`}>
                    {secondarySuffix}
                  </span>
                )}
              </div>
              <p className={`text-white/40 mt-0.5 ${sizeClasses.sm.label}`}>
                {secondaryLabel}
              </p>
            </div>
          </div>
        ) : (
          // Single KPI layout
          <>
            <div className="flex items-baseline gap-0.5">
              <span className={`font-semibold tracking-tight text-white ${s.value}`}>
                {value}
              </span>
              {suffix && (
                <span className={`text-white/60 font-medium ${s.suffix}`}>
                  {suffix}
                </span>
              )}
            </div>
            <p className={`text-white/50 mt-0.5 ${s.label}`}>
              {label}
            </p>
          </>
        )}
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
        bg-gradient-to-br from-[oklch(0.20_0.03_45)] to-[oklch(0.14_0.02_50)]
        border border-[oklch(0.55_0.15_45/40%)]
        rounded-xl p-4
        transition-all duration-200
        hover:border-[oklch(0.60_0.16_45/60%)]
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.4_0.12_45/5%)] to-transparent pointer-events-none" />
      
      <div className="relative z-10 flex divide-x divide-[oklch(0.5_0.12_45/20%)]">
        {items.map((item, index) => (
          <div key={index} className={`flex-1 ${index > 0 ? "pl-4" : ""} ${index < items.length - 1 ? "pr-4" : ""}`}>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-semibold tracking-tight text-white">
                {item.value}
              </span>
              {item.suffix && (
                <span className="text-sm text-white/60 font-medium">
                  {item.suffix}
                </span>
              )}
            </div>
            <p className="text-white/50 mt-0.5 text-xs">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

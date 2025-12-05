/**
 * @fileoverview KPI Card Components
 * 
 * This module provides card components for displaying Key Performance Indicators
 * (KPIs) in the dashboard. Cards feature glassmorphism styling with orange accents
 * and support both single and bundled KPI displays.
 * 
 * **Design Features:**
 * - Glassmorphism background with gradient
 * - Orange-tinted borders with hover effects
 * - Support for bundled KPIs (e.g., Wertschöpfung + Zeitersparnis)
 * - Responsive sizing (sm, md, lg)
 * - Optional icon display with low opacity
 * 
 * @module components/KPICard
 * @author Cockpit Vibe Team
 * @version 1.0.0
 */

import { ReactNode } from "react";

/**
 * Props for the KPICard component
 */
interface KPICardProps {
  /** Primary value to display (number or formatted string) */
  value: string | number;
  /** Label describing the KPI */
  label: string;
  /** Unit suffix (e.g., "€", "h", "%") */
  suffix?: string;
  /** Optional icon element */
  icon?: ReactNode;
  /** Visual variant: default (with border), compact, or secondary (no border) */
  variant?: "default" | "compact" | "secondary";
  /** Size preset affecting padding and font sizes */
  size?: "sm" | "md" | "lg";
  /** Secondary value for bundled KPIs */
  secondaryValue?: string | number;
  /** Unit suffix for secondary value */
  secondarySuffix?: string;
  /** Label for secondary value */
  secondaryLabel?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * KPICard Component
 * 
 * Displays a single KPI or bundled KPIs in a glassmorphism-styled card.
 * Supports multiple sizes and variants for different use cases.
 * 
 * @param props - Component properties
 * @returns JSX element containing the KPI card
 * 
 * @example
 * // Single KPI
 * <KPICard value={45833} suffix="€" label="Wertschöpfung" size="lg" />
 * 
 * @example
 * // Bundled KPIs (Wertschöpfung + Zeitersparnis)
 * <KPICard
 *   value={45833}
 *   suffix="€"
 *   label="Wertschöpfung"
 *   secondaryValue={699}
 *   secondarySuffix="h"
 *   secondaryLabel="Zeitersparnis"
 * />
 */
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
  
  // Size-based styling classes
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
      {/* Background glow effect (subtle gradient overlay) */}
      {!isSecondary && (
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.4_0.12_45/5%)] to-transparent pointer-events-none" />
      )}
      
      {/* Icon positioned in top-right with low opacity */}
      {icon && (
        <div className="absolute top-2.5 right-2.5 opacity-15 text-white">
          {icon}
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10">
        {hasBundledKPI ? (
          // Bundled KPI layout: two values side by side with divider
          <div className="flex items-start gap-4">
            {/* Primary KPI */}
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
            
            {/* Secondary KPI with left border divider */}
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

/**
 * Props for the MultiKPICard component
 */
interface MultiKPICardProps {
  /** Array of KPI items to display */
  items: Array<{
    /** Value to display */
    value: string | number;
    /** Label describing the KPI */
    label: string;
    /** Unit suffix */
    suffix?: string;
  }>;
  /** Additional CSS classes */
  className?: string;
}

/**
 * MultiKPICard Component
 * 
 * Displays multiple KPIs in a single card with dividers between them.
 * Useful for showing related metrics together.
 * 
 * @param props - Component properties
 * @returns JSX element containing multiple KPIs
 * 
 * @example
 * <MultiKPICard
 *   items={[
 *     { value: 8, label: "Prozesse" },
 *     { value: 45833, suffix: "€", label: "Wertschöpfung" },
 *     { value: 699, suffix: "h", label: "Zeitersparnis" }
 *   ]}
 * />
 */
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
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.4_0.12_45/5%)] to-transparent pointer-events-none" />
      
      {/* KPI items with dividers */}
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

import { cn } from "@/lib/utils";
import { useMemo } from "react";

// Process status segments for the body fill
export interface ProcessSegment {
  status: 'idle' | 'scheduled' | 'testing' | 'semi_automated' | 'automated';
  percentage: number; // How much of the body this takes (0-100)
}

// Color mapping for each status
const STATUS_COLORS: Record<string, string> = {
  idle: '#1a1a1a', // Transparent Grau-Schwarz
  scheduled: '#4a4a4a', // Grauer Ton
  testing: '#ffffff', // Weiß
  semi_automated: '#f59e0b', // Hell-Orange (Secondary)
  automated: '#f97316', // Neon-Orange (Primary)
};

interface FullBodyAgentProps {
  className?: string;
  outlineColor?: string;
  segments?: ProcessSegment[];
  size?: "sm" | "md" | "lg" | "xl";
  showHead?: boolean;
}

export function FullBodyAgent({ 
  className, 
  outlineColor = "#f97316",
  segments = [{ status: 'automated', percentage: 100 }],
  size = "md",
  showHead = true
}: FullBodyAgentProps) {
  const sizeClasses = {
    sm: "h-40",
    md: "h-56",
    lg: "h-72",
    xl: "h-96"
  };

  // Generate unique ID for this instance
  const instanceId = useMemo(() => Math.random().toString(36).substr(2, 9), []);

  // Calculate gradient stops from segments (bottom to top)
  const gradientStops = useMemo(() => {
    let currentY = 100; // Start from bottom (100%)
    const stops: { color: string; y: number }[] = [];
    
    // Sort segments and create gradient stops
    segments.forEach((segment, index) => {
      const color = STATUS_COLORS[segment.status] || STATUS_COLORS.idle;
      stops.push({ color, y: currentY });
      currentY -= segment.percentage;
      if (currentY < 0) currentY = 0;
      stops.push({ color, y: currentY });
    });
    
    return stops;
  }, [segments]);

  // SVG path for the body
  const bodyPath = "M230.692,463.694,224.9,341.831a8.06,8.06,0,0,0-.457-2.19,9.619,9.619,0,0,0,.085-2.839L207.8,176.172c-.722-5.876-6.673-10.025-13.224-9.22,0,0-56.1-9.942-62.551-12.179l.253-19.631A50.7,50.7,0,0,0,166.069,89h.038V50.5A50.648,50.648,0,0,0,115.608,0h0a50.649,50.649,0,0,0-50.5,50.5V89h.039a50.7,50.7,0,0,0,33.788,46.142l.253,19.631c-6.453,2.237-63.058,12.179-63.058,12.179-6.55-.8-12.5,3.344-13.223,9.22L6.179,336.8a9.652,9.652,0,0,0,.086,2.839,8.061,8.061,0,0,0-.458,2.19L.016,463.694a8.157,8.157,0,0,0,7.6,8.637l4.057.26A8.155,8.155,0,0,0,20.305,465l14.5-120.44c.013-.2.01-.4.008-.6.587-1.066,16.8-113.838,16.8-113.838v18.319c0,8.753,19.893,106.913,19.893,106.913-10.06,9.247-32.711,57.227-32.711,73.47v28.362c0,.686.026,1.366.065,2.042a9.294,9.294,0,0,0-.062,1.262L49.814,677.268c.02.842-.044,5.424.079,6.972L72.051,912.889a15.526,15.526,0,0,0,16.727,14.064l7.754-.6a15.433,15.433,0,0,0,14.29-16.462L105.54,681.815a9.921,9.921,0,0,0,1.649-5.606L107.574,492h14.512l.384,184.209a9.914,9.914,0,0,0,1.65,5.606l-5.283,228.076a15.433,15.433,0,0,0,14.29,16.462l7.754.6a15.528,15.528,0,0,0,16.728-14.064L179.766,684.24c.124-1.548.059-6.13.08-6.972l10.773-211.9a34.6,34.6,0,0,0,.988-8.192V428.819c0-15.953-22.832-64.223-32.892-73.47,0,0,20.892-98.16,20.892-106.913V233.688s15.706,109.2,16.293,110.267c0,.2,0,.4.008.6L210.4,465a8.156,8.156,0,0,0,8.637,7.594l4.058-.26a8.156,8.156,0,0,0,7.594-8.637";

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      {/* Outline/Background */}
      <svg 
        viewBox="0 0 230.709 927" 
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.15 }}
      >
        <path fill={outlineColor} d={bodyPath} />
      </svg>
      
      {/* Filled portion with gradient */}
      <svg 
        viewBox="0 0 230.709 927" 
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <linearGradient id={`body-gradient-${instanceId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            {gradientStops.map((stop, index) => (
              <stop 
                key={index}
                offset={`${stop.y}%`} 
                stopColor={stop.color}
              />
            ))}
          </linearGradient>
        </defs>
        <path 
          fill={`url(#body-gradient-${instanceId})`}
          d={bodyPath}
        />
      </svg>

      {/* Head overlay (grey/white area) */}
      {showHead && (
        <svg 
          viewBox="0 0 230.709 927" 
          className="absolute inset-0 w-full h-full"
        >
          <defs>
            <clipPath id={`head-clip-${instanceId}`}>
              <ellipse cx="115" cy="50" rx="52" ry="52" />
            </clipPath>
            <linearGradient id={`head-gradient-${instanceId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#9ca3af" />
              <stop offset="50%" stopColor="#f5f5f5" />
              <stop offset="100%" stopColor="#f5f5f5" />
            </linearGradient>
          </defs>
          <g clipPath={`url(#head-clip-${instanceId})`}>
            <rect x="63" y="0" width="104" height="102" fill={`url(#head-gradient-${instanceId})`} />
          </g>
        </svg>
      )}
    </div>
  );
}

// Simplified version for quick display
export function FullBodyAgentSimple({ 
  className, 
  fillColor = "#f97316",
  fillLevel = 100,
  size = "md" 
}: {
  className?: string;
  fillColor?: string;
  fillLevel?: number;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  // Convert single fill level to segments
  const segments: ProcessSegment[] = [];
  
  if (100 - fillLevel > 0) {
    segments.push({ status: 'idle' as const, percentage: 100 - fillLevel });
  }
  if (fillLevel > 0) {
    segments.push({ status: 'automated' as const, percentage: fillLevel });
  }

  return (
    <FullBodyAgent 
      className={className}
      segments={segments.length > 0 ? segments : [{ status: 'automated' as const, percentage: 100 }]}
      size={size}
    />
  );
}

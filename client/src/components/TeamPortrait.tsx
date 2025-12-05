import { cn } from "@/lib/utils";

interface TeamPortraitProps {
  className?: string;
  color?: string;
  agentCount?: number; // 1-5 agents
  size?: "sm" | "md" | "lg";
}

export function TeamPortrait({ 
  className, 
  color = "currentColor",
  agentCount = 1,
  size = "md" 
}: TeamPortraitProps) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20"
  };

  // Single agent portrait
  if (agentCount <= 1) {
    return (
      <svg 
        viewBox="0 0 192.15 211" 
        className={cn(sizeClasses[size], className)}
        fill={color}
      >
        <path d="M192.15,211H0l3.63-34.83c.72-5.87,6.67-10.02,13.22-9.22,0,0,56.6-9.94,63.06-12.18l-.26-19.63A50.691,50.691,0,0,1,45.87,89h-.04V50.5a50.5,50.5,0,0,1,101,0V89h-.04A50.686,50.686,0,0,1,113,135.14l-.25,19.63c6.45,2.24,62.55,12.18,62.55,12.18,6.55-.8,12.5,3.35,13.22,9.22Z"/>
      </svg>
    );
  }

  // Team portrait with multiple agents (shows layered effect)
  return (
    <svg 
      viewBox="0 0 231.18 226.51" 
      className={cn(sizeClasses[size], className)}
      fill={color}
    >
      <defs>
        <clipPath id={`clip-team-${agentCount}`}>
          <rect width="231.18" height="226.51" fill="none"/>
        </clipPath>
      </defs>
      <g clipPath={`url(#clip-team-${agentCount})`}>
        {/* Back layer - third agent (if 3+) */}
        {agentCount >= 3 && (
          <g opacity="0.3">
            <path d="M231.18,226.51h-10.2l-4.81-46.14c-.87-7.14-7.84-12.2-15.62-11.44-14.64-2.6-50.77-9.17-60.11-11.54l.21-16a53.525,53.525,0,0,0,9.47-4.86l-.22,17.51,1.7.59c6.56,2.28,60.63,11.88,62.93,12.28l.37.07.37-.05c5.2-.63,9.88,2.53,10.43,7Z"/>
            <path d="M184,48V85.13l-.04,1.3a48.323,48.323,0,0,1-20.64,37.95A53.017,53.017,0,0,0,174.33,96h.17V55A53.059,53.059,0,0,0,122.28,2.01,47.551,47.551,0,0,1,136,0a48.051,48.051,0,0,1,48,48"/>
          </g>
        )}
        
        {/* Middle layer - second agent (if 2+) */}
        {agentCount >= 2 && (
          <g opacity="0.5">
            <path d="M211.34,226.51h-10.2l-3.97-38.14c-.87-7.14-7.84-12.2-15.62-11.44-14.64-2.6-50.77-9.17-60.11-11.54l.21-16a53.526,53.526,0,0,0,9.47-4.86l-.22,17.51,1.7.59c6.56,2.28,60.63,11.88,62.93,12.28l.37.07.37-.05c5.2-.63,9.88,2.53,10.43,7Z"/>
            <path d="M165,56V93.13l-.04,1.3a48.323,48.323,0,0,1-20.64,37.95A53.017,53.017,0,0,0,155.33,104h.17V63a53.059,53.059,0,0,0-52.22-52.99A47.551,47.551,0,0,1,117,8a48.051,48.051,0,0,1,48,48"/>
          </g>
        )}
        
        {/* Front layer - main agent */}
        <path d="M192.15,226.51H0l3.63-34.83c.72-5.87,6.67-10.02,13.22-9.22,0,0,56.6-9.94,63.06-12.18l-.26-19.63a50.691,50.691,0,0,1-33.78-46.14h-.04V66.01a50.5,50.5,0,1,1,101,0v38.5h-.04A50.686,50.686,0,0,1,113,150.65l-.25,19.63c6.45,2.24,62.55,12.18,62.55,12.18,6.55-.8,12.5,3.35,13.22,9.22Z"/>
      </g>
      
      {/* Agent count badge for 4+ */}
      {agentCount >= 4 && (
        <g>
          <circle cx="200" cy="30" r="20" fill="currentColor" opacity="0.8"/>
          <text x="200" y="36" textAnchor="middle" fontSize="16" fill="var(--background)" fontWeight="bold">
            {agentCount}
          </text>
        </g>
      )}
    </svg>
  );
}

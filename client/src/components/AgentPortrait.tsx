import { cn } from "@/lib/utils";

interface AgentPortraitProps {
  className?: string;
  color?: string;
  size?: "sm" | "md" | "lg";
}

export function AgentPortrait({ 
  className, 
  color = "currentColor",
  size = "md" 
}: AgentPortraitProps) {
  const sizeClasses = {
    sm: "w-8 h-9",
    md: "w-12 h-14",
    lg: "w-16 h-18"
  };

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

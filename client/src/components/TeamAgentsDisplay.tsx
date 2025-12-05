import { useState, useRef } from "react";
import { FullBodyAgent, ProcessSegment } from "./FullBodyAgent";

// Hover popup for legend
interface LegendPopupProps {
  x: number;
  y: number;
  visible: boolean;
}

function LegendPopup({ x, y, visible }: LegendPopupProps) {
  if (!visible) return null;
  
  const legendItems = [
    { color: '#1a1a1a', label: 'Restkapazitäten', description: 'Ungenutzte Kapazität' },
    { color: '#4a4a4a', label: 'Geplante Prozesse', description: 'Für später geplant' },
    { color: '#ffffff', label: 'Neue Test Prozesse', description: 'In der Testphase' },
    { color: '#f59e0b', label: 'Teilautomatisierte Prozesse', description: 'Mit manuellen Schritten' },
    { color: '#f97316', label: 'Reguläre Auslastung', description: 'Vollautomatisiert' },
  ];

  return (
    <div 
      className="fixed z-50 pointer-events-none"
      style={{ 
        left: x + 16, 
        top: y - 80,
        transform: 'translateY(-50%)'
      }}
    >
      <div className="bg-[oklch(0.12_0.02_45/95%)] backdrop-blur-md border border-[oklch(0.5_0.12_45/30%)] rounded-xl p-4 shadow-2xl">
        <div className="space-y-2.5">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full shrink-0"
                style={{ 
                  backgroundColor: item.color,
                  border: item.color === '#ffffff' ? '1px solid rgba(255,255,255,0.3)' : 'none'
                }}
              />
              <div>
                <span className="text-sm text-white/90 font-medium">{item.label}</span>
                <p className="text-xs text-white/40">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface AgentData {
  id: number;
  name?: string;
  utilization: number;
  segments?: ProcessSegment[];
}

interface TeamAgentsDisplayProps {
  teamName: string;
  agents: AgentData[];
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TeamAgentsDisplay({ 
  teamName, 
  agents, 
  size = "md",
  className = ""
}: TeamAgentsDisplayProps) {
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    setPopupPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseEnter = () => {
    setPopupVisible(true);
  };

  const handleMouseLeave = () => {
    setPopupVisible(false);
  };

  // Default segments if not provided
  const getDefaultSegments = (utilization: number): ProcessSegment[] => {
    // Distribute utilization across different statuses
    const automated = Math.min(utilization, 60);
    const semiAutomated = Math.min(Math.max(utilization - 60, 0), 20);
    const scheduled = Math.min(Math.max(utilization - 80, 0), 10);
    const idle = 100 - utilization;
    
    const segments: ProcessSegment[] = [];
    if (idle > 0) segments.push({ status: 'idle' as const, percentage: idle });
    if (scheduled > 0) segments.push({ status: 'scheduled' as const, percentage: scheduled });
    if (semiAutomated > 0) segments.push({ status: 'semi_automated' as const, percentage: semiAutomated });
    if (automated > 0) segments.push({ status: 'automated' as const, percentage: automated });
    
    return segments.length > 0 ? segments : [{ status: 'idle' as const, percentage: 100 }];
  };

  // Size mapping for silhouettes
  const sizeMap = {
    sm: "h-32",
    md: "h-48",
    lg: "h-64"
  };

  return (
    <>
      <div 
        ref={containerRef}
        className={`flex items-end justify-center gap-1 ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {agents.map((agent, index) => (
          <div 
            key={agent.id || index} 
            className={`${sizeMap[size]} transition-transform hover:scale-105`}
            style={{ 
              // Slightly offset each agent for visual depth
              transform: `translateX(${index * -4}px)`,
              zIndex: agents.length - index
            }}
          >
            <FullBodyAgent
              segments={agent.segments || getDefaultSegments(agent.utilization)}
              size={size}
              showHead={true}
              className="w-full h-full"
            />
          </div>
        ))}
      </div>
      
      {/* Hover Popup */}
      <LegendPopup 
        x={popupPosition.x} 
        y={popupPosition.y} 
        visible={popupVisible} 
      />
    </>
  );
}

// Simplified version for team cards in list view
export function TeamAgentsPreview({ 
  agentCount, 
  utilization,
  size = "sm"
}: { 
  agentCount: number; 
  utilization: number;
  size?: "sm" | "md";
}) {
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setPopupPosition({ x: e.clientX, y: e.clientY });
  };

  // Create agent data based on count
  const agents: AgentData[] = Array.from({ length: Math.min(agentCount, 5) }, (_, i) => ({
    id: i,
    utilization: utilization + (Math.random() * 20 - 10), // Slight variation
  }));

  const sizeMap = {
    sm: "h-16",
    md: "h-24"
  };

  return (
    <>
      <div 
        className="flex items-end justify-center -space-x-2"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setPopupVisible(true)}
        onMouseLeave={() => setPopupVisible(false)}
      >
        {agents.map((agent, index) => {
          const segments: ProcessSegment[] = [
            { status: 'idle' as const, percentage: 100 - agent.utilization },
            { status: 'automated' as const, percentage: Math.min(agent.utilization, 60) },
            { status: 'semi_automated' as const, percentage: Math.max(agent.utilization - 60, 0) },
          ].filter(s => s.percentage > 0);

          return (
            <div 
              key={index} 
              className={`${sizeMap[size]}`}
              style={{ zIndex: agents.length - index }}
            >
              <FullBodyAgent
                segments={segments.length > 0 ? segments : [{ status: 'automated' as const, percentage: 100 }]}
                size="sm"
                showHead={true}
                className="w-full h-full"
              />
            </div>
          );
        })}
      </div>
      
      <LegendPopup 
        x={popupPosition.x} 
        y={popupPosition.y} 
        visible={popupVisible} 
      />
    </>
  );
}

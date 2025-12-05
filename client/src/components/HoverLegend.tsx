import { useState, useRef, ReactNode } from "react";

interface LegendItem {
  color: string;
  label: string;
  description: string;
}

const legendItems: LegendItem[] = [
  { color: '#1a1a1a', label: 'Restkapazitäten', description: 'Ungenutzte Kapazität' },
  { color: '#4a4a4a', label: 'Geplante Prozesse', description: 'Für später geplant' },
  { color: '#ffffff', label: 'Neue Test Prozesse', description: 'In der Testphase' },
  { color: '#f59e0b', label: 'Teilautomatisierte Prozesse', description: 'Mit manuellen Schritten' },
  { color: '#f97316', label: 'Reguläre Auslastung', description: 'Vollautomatisiert' },
];

interface HoverLegendProps {
  children: ReactNode;
  className?: string;
}

export function HoverLegend({ children, className = "" }: HoverLegendProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <div
        ref={containerRef}
        className={className}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      
      {/* Popup positioned at mouse cursor */}
      {isVisible && (
        <div 
          className="fixed z-[9999] pointer-events-none"
          style={{ 
            left: position.x + 20, 
            top: position.y,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="bg-[oklch(0.10_0.02_45/98%)] backdrop-blur-xl border border-[oklch(0.5_0.12_45/40%)] rounded-xl p-4 shadow-2xl min-w-[240px]">
            <div className="space-y-2.5">
              {legendItems.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                    style={{ 
                      backgroundColor: item.color,
                      border: item.color === '#ffffff' ? '1px solid rgba(255,255,255,0.5)' : 
                              item.color === '#1a1a1a' ? '1px solid rgba(255,255,255,0.15)' : 'none'
                    }}
                  />
                  <div className="flex-1">
                    <span className="text-sm text-white/90 font-medium block">{item.label}</span>
                    <p className="text-[10px] text-white/40 leading-tight">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

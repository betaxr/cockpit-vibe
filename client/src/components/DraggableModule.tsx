import { GripVertical } from "lucide-react";
import { useState, useRef, useEffect, ReactNode } from "react";

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

// Grid configuration
const GRID_SIZE = 20; // 20px grid
const SNAP_THRESHOLD = 10; // Snap when within 10px of grid line

const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

interface DraggableModuleProps {
  id: string;
  title: string;
  children: ReactNode;
  defaultPosition?: Position;
  defaultSize?: Size;
  minWidth?: number;
  minHeight?: number;
  onPositionChange?: (id: string, position: Position) => void;
  onSizeChange?: (id: string, size: Size) => void;
  className?: string;
  snapToGrid?: boolean;
}

export default function DraggableModule({
  id,
  title,
  children,
  defaultPosition = { x: 0, y: 0 },
  defaultSize = { width: 400, height: 300 },
  minWidth = 250,
  minHeight = 150,
  onPositionChange,
  onSizeChange,
  className = "",
  snapToGrid: enableSnap = true,
}: DraggableModuleProps) {
  const [position, setPosition] = useState<Position>(defaultPosition);
  const [size, setSize] = useState<Size>(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const moduleRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number }>({ x: 0, y: 0, posX: 0, posY: 0 });
  const resizeStartRef = useRef<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 0, height: 0 });

  // Load saved position/size from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem(`module-pos-${id}`);
    const savedSize = localStorage.getItem(`module-size-${id}`);
    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition));
      } catch {}
    }
    if (savedSize) {
      try {
        setSize(JSON.parse(savedSize));
      } catch {}
    }
  }, [id]);

  // Save position to localStorage
  useEffect(() => {
    if (!isDragging) {
      localStorage.setItem(`module-pos-${id}`, JSON.stringify(position));
      onPositionChange?.(id, position);
    }
  }, [position, isDragging, id, onPositionChange]);

  // Save size to localStorage
  useEffect(() => {
    if (!isResizing) {
      localStorage.setItem(`module-size-${id}`, JSON.stringify(size));
      onSizeChange?.(id, size);
    }
  }, [size, isResizing, id, onSizeChange]);

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;
        let newX = dragStartRef.current.posX + deltaX;
        let newY = dragStartRef.current.posY + deltaY;
        
        // Snap to grid if enabled
        if (enableSnap) {
          newX = snapToGrid(newX);
          newY = snapToGrid(newY);
        }
        
        // Ensure position is not negative
        newX = Math.max(0, newX);
        newY = Math.max(0, newY);
        
        setPosition({ x: newX, y: newY });
      }
      if (isResizing) {
        const deltaX = e.clientX - resizeStartRef.current.x;
        const deltaY = e.clientY - resizeStartRef.current.y;
        let newWidth = resizeStartRef.current.width + deltaX;
        let newHeight = resizeStartRef.current.height + deltaY;
        
        // Snap to grid if enabled
        if (enableSnap) {
          newWidth = snapToGrid(newWidth);
          newHeight = snapToGrid(newHeight);
        }
        
        setSize({
          width: Math.max(minWidth, newWidth),
          height: Math.max(minHeight, newHeight),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
    };
  }, [isDragging, isResizing, minWidth, minHeight, enableSnap]);

  return (
    <div
      ref={moduleRef}
      className={cn(
        "absolute backdrop-blur-xl border-2 rounded-xl transition-shadow duration-300",
        className
      )}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: isDragging ? 100 : 10,
        transform: isDragging ? "scale(1.01)" : "scale(1)",
        backgroundImage:
          "linear-gradient(to bottom right, color-mix(in oklch, var(--color-card) 70%, transparent), color-mix(in oklch, var(--color-card) 60%, transparent))",
        borderColor: isDragging
          ? "color-mix(in oklch, var(--color-primary) 60%, transparent)"
          : "color-mix(in oklch, var(--color-border) 40%, transparent)",
        boxShadow: isDragging
          ? "0 12px 50px color-mix(in oklch, var(--color-primary) 25%, transparent)"
          : undefined,
      }}
    >
      {/* Subtle inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[color:color-mix(in_oklch,_var(--color-primary)_8%,_transparent)] to-transparent pointer-events-none rounded-xl" />
      
      {/* Header with drag handle */}
      <div 
        className="relative z-10 px-4 py-3 border-b flex items-center justify-between rounded-t-xl"
        style={{
          borderColor: "color-mix(in oklch, var(--color-border) 70%, transparent)",
          background: "color-mix(in oklch, var(--color-card) 70%, transparent)",
        }}
      >
        <div
          className="flex items-center gap-2 cursor-grab active:cursor-grabbing flex-1"
          onMouseDown={handleDragStart}
        >
          <GripVertical className="w-4 h-4 opacity-30" strokeWidth={1.5} />
          <span className="text-sm font-medium text-white/80">{title}</span>
        </div>
        {/* Grid indicator */}
        {enableSnap && (
          <div className="text-[10px] text-white/30 font-mono">
            {Math.round(position.x / GRID_SIZE)},{Math.round(position.y / GRID_SIZE)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 overflow-auto text-white/80" style={{ height: `calc(100% - 48px)` }}>
        {children}
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize opacity-0 hover:opacity-100 transition-opacity"
        onMouseDown={handleResizeStart}
      >
        <div
          className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 rounded-br"
          style={{ borderColor: "color-mix(in oklch, var(--color-primary) 60%, transparent)" }}
        />
      </div>
    </div>
  );
}

// Grid background component for visual reference
export function GridBackground({ show = true }: { show?: boolean }) {
  if (!show) return null;
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none opacity-10"
      style={{
        backgroundImage: `
          linear-gradient(to right, color-mix(in oklch, var(--color-border) 20%, transparent) 1px, transparent 1px),
          linear-gradient(to bottom, color-mix(in oklch, var(--color-border) 20%, transparent) 1px, transparent 1px)
        `,
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
      }}
    />
  );
}

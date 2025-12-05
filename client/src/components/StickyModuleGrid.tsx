import { GripVertical, Maximize2, Minimize2 } from "lucide-react";
import { useState, useRef, useEffect, ReactNode, createContext, useContext } from "react";

// Grid configuration
const GRID_SIZE = 20;
const GAP_SIZE = 16;
const MIN_MODULE_WIDTH = 280;
const MIN_MODULE_HEIGHT = 160;

interface ModulePosition {
  id: string;
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
}

interface ModuleGridContextType {
  isEditMode: boolean;
  setEditMode: (mode: boolean) => void;
  positions: ModulePosition[];
  updatePosition: (id: string, position: Partial<ModulePosition>) => void;
  registerModule: (id: string, defaultSpan?: { col: number; row: number }) => void;
}

const ModuleGridContext = createContext<ModuleGridContextType | null>(null);

export function useModuleGrid() {
  const context = useContext(ModuleGridContext);
  if (!context) {
    throw new Error("useModuleGrid must be used within a ModuleGridProvider");
  }
  return context;
}

interface ModuleGridProviderProps {
  children: ReactNode;
  storageKey?: string;
  defaultEditMode?: boolean;
}

export function ModuleGridProvider({ 
  children, 
  storageKey = "module-grid",
  defaultEditMode = false 
}: ModuleGridProviderProps) {
  const [isEditMode, setEditMode] = useState(defaultEditMode);
  const [positions, setPositions] = useState<ModulePosition[]>([]);

  // Load positions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`${storageKey}-positions`);
    if (saved) {
      try {
        setPositions(JSON.parse(saved));
      } catch {}
    }
  }, [storageKey]);

  // Save positions to localStorage
  useEffect(() => {
    if (positions.length > 0) {
      localStorage.setItem(`${storageKey}-positions`, JSON.stringify(positions));
    }
  }, [positions, storageKey]);

  const registerModule = (id: string, defaultSpan = { col: 1, row: 1 }) => {
    setPositions(prev => {
      if (prev.find(p => p.id === id)) return prev;
      
      // Find next available position
      const maxRow = prev.reduce((max, p) => Math.max(max, p.row + p.rowSpan), 0);
      const maxCol = prev.reduce((max, p) => Math.max(max, p.col + p.colSpan), 0);
      
      // Try to fit in existing rows first
      let newCol = 0;
      let newRow = 0;
      
      for (let r = 0; r <= maxRow; r++) {
        for (let c = 0; c < 4; c++) {
          const occupied = prev.some(p => 
            c >= p.col && c < p.col + p.colSpan &&
            r >= p.row && r < p.row + p.rowSpan
          );
          if (!occupied && c + defaultSpan.col <= 4) {
            newCol = c;
            newRow = r;
            break;
          }
        }
      }
      
      // If no space found, add to new row
      if (prev.length > 0 && newCol === 0 && newRow === 0) {
        newRow = maxRow;
      }
      
      return [...prev, { 
        id, 
        col: newCol, 
        row: newRow, 
        colSpan: defaultSpan.col, 
        rowSpan: defaultSpan.row 
      }];
    });
  };

  const updatePosition = (id: string, update: Partial<ModulePosition>) => {
    setPositions(prev => prev.map(p => 
      p.id === id ? { ...p, ...update } : p
    ));
  };

  return (
    <ModuleGridContext.Provider value={{ 
      isEditMode, 
      setEditMode, 
      positions, 
      updatePosition,
      registerModule 
    }}>
      {children}
    </ModuleGridContext.Provider>
  );
}

interface StickyModuleProps {
  id: string;
  title: string;
  children: ReactNode;
  defaultColSpan?: number;
  defaultRowSpan?: number;
  className?: string;
  icon?: ReactNode;
}

export function StickyModule({
  id,
  title,
  children,
  defaultColSpan = 1,
  defaultRowSpan = 1,
  className = "",
  icon,
}: StickyModuleProps) {
  const { isEditMode, positions, updatePosition, registerModule } = useModuleGrid();
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const moduleRef = useRef<HTMLDivElement>(null);

  // Register module on mount
  useEffect(() => {
    registerModule(id, { col: defaultColSpan, row: defaultRowSpan });
  }, [id, defaultColSpan, defaultRowSpan, registerModule]);

  const position = positions.find(p => p.id === id);
  
  if (!position) return null;

  const handleDragStart = (e: React.DragEvent) => {
    if (!isEditMode) return;
    e.dataTransfer.setData("moduleId", id);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const gridStyle = {
    gridColumn: `span ${position.colSpan}`,
    gridRow: isMinimized ? "span 1" : `span ${position.rowSpan}`,
  };

  return (
    <div
      ref={moduleRef}
      draggable={isEditMode}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`
        relative overflow-hidden
        bg-gradient-to-br from-[oklch(0.18_0.03_50/70%)] to-[oklch(0.12_0.02_50/60%)]
        backdrop-blur-xl
        border-2 ${isEditMode ? "border-[oklch(0.55_0.15_45/50%)]" : "border-[oklch(0.5_0.12_45/35%)]"}
        rounded-xl
        transition-all duration-300
        ${isDragging ? "opacity-50 scale-95" : ""}
        ${isEditMode ? "cursor-grab active:cursor-grabbing hover:border-[oklch(0.7_0.18_50/60%)]" : ""}
        ${className}
      `}
      style={gridStyle}
    >
      {/* Inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.35_0.1_45/8%)] to-transparent pointer-events-none rounded-xl" />
      
      {/* Header */}
      <div className="relative z-10 px-4 py-3 border-b border-[oklch(0.5_0.12_45/25%)] flex items-center justify-between bg-[oklch(0.2_0.035_50/50%)] rounded-t-xl">
        <div className="flex items-center gap-2">
          {isEditMode && (
            <GripVertical className="w-4 h-4 opacity-40" strokeWidth={1.5} />
          )}
          {icon && <span className="opacity-40">{icon}</span>}
          <span className="text-sm font-medium text-white/80">{title}</span>
        </div>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-1 rounded hover:bg-[oklch(0.5_0.12_45/20%)] text-white/40 hover:text-white/70 transition-colors"
        >
          {isMinimized ? (
            <Maximize2 className="w-3.5 h-3.5" />
          ) : (
            <Minimize2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="relative z-10 p-4 overflow-auto text-white/80" style={{ height: "calc(100% - 48px)" }}>
          {children}
        </div>
      )}

      {/* Edit mode indicator */}
      {isEditMode && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[oklch(0.7_0.18_50)] animate-pulse" />
      )}
    </div>
  );
}

interface ModuleGridContainerProps {
  children: ReactNode;
  columns?: number;
  className?: string;
}

export function ModuleGridContainer({ 
  children, 
  columns = 4,
  className = "" 
}: ModuleGridContainerProps) {
  const { isEditMode, positions, updatePosition } = useModuleGrid();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    
    const moduleId = e.dataTransfer.getData("moduleId");
    if (!moduleId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const colWidth = rect.width / columns;
    const rowHeight = 200; // Approximate row height
    
    const newCol = Math.min(Math.max(0, Math.floor(x / colWidth)), columns - 1);
    const newRow = Math.max(0, Math.floor(y / rowHeight));
    
    // Check for collisions and adjust
    const currentPos = positions.find(p => p.id === moduleId);
    if (!currentPos) return;
    
    // Find if new position would overlap
    const wouldOverlap = positions.some(p => {
      if (p.id === moduleId) return false;
      return (
        newCol < p.col + p.colSpan &&
        newCol + currentPos.colSpan > p.col &&
        newRow < p.row + p.rowSpan &&
        newRow + currentPos.rowSpan > p.row
      );
    });
    
    if (!wouldOverlap) {
      updatePosition(moduleId, { col: newCol, row: newRow });
    }
  };

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        grid gap-4
        ${className}
      `}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gridAutoRows: "minmax(180px, auto)",
      }}
    >
      {children}
    </div>
  );
}

// Edit mode toggle button
interface EditModeToggleProps {
  className?: string;
}

export function EditModeToggle({ className = "" }: EditModeToggleProps) {
  const { isEditMode, setEditMode } = useModuleGrid();
  
  return (
    <button
      onClick={() => setEditMode(!isEditMode)}
      className={`
        px-4 py-2 rounded-lg
        flex items-center gap-2
        transition-all duration-200
        ${isEditMode 
          ? "bg-[oklch(0.55_0.15_45)] text-white" 
          : "bg-[oklch(0.2_0.03_50/60%)] text-white/70 border border-[oklch(0.5_0.12_45/30%)]"
        }
        hover:bg-[oklch(0.6_0.17_45)]
        ${className}
      `}
    >
      <GripVertical className="w-4 h-4" />
      {isEditMode ? "Bearbeitung beenden" : "Layout bearbeiten"}
    </button>
  );
}

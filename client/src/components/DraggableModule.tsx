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
        setPosition({
          x: dragStartRef.current.posX + deltaX,
          y: dragStartRef.current.posY + deltaY,
        });
      }
      if (isResizing) {
        const deltaX = e.clientX - resizeStartRef.current.x;
        const deltaY = e.clientY - resizeStartRef.current.y;
        setSize({
          width: Math.max(minWidth, resizeStartRef.current.width + deltaX),
          height: Math.max(minHeight, resizeStartRef.current.height + deltaY),
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
  }, [isDragging, isResizing, minWidth, minHeight]);

  return (
    <div
      ref={moduleRef}
      className={`glass-module absolute ${isDragging ? "dragging" : ""} ${className}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: isDragging ? 100 : 10,
      }}
    >
      {/* Header with drag handle */}
      <div className="module-header flex items-center justify-between">
        <div
          className="drag-handle flex items-center gap-2"
          onMouseDown={handleDragStart}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-auto" style={{ height: `calc(100% - 48px)` }}>
        {children}
      </div>

      {/* Resize handle */}
      <div
        className="resize-handle"
        onMouseDown={handleResizeStart}
      />
    </div>
  );
}

import Icon from "@/components/ui/icon";
import React from "react";
import { CanvasElement } from "./CanvasElement";

interface CanvasElementData {
  id: string;
  type: 'text' | 'image' | 'cross' | 'flower' | 'epitaph' | 'fio' | 'dates' | 'photo';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  src?: string;
  fontSize?: number;
  color?: string;
  rotation?: number;
  fontFamily?: string;
  screenMode?: boolean;
  processedSrc?: string;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right';
  flipHorizontal?: boolean;
  autoSize?: boolean;
  italic?: boolean;
  initialScale?: number;
}

interface CanvasContainerProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  monumentImage: string;
  elements: CanvasElementData[];
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;
  rotateMode: boolean;
  handleMouseDown: (e: React.MouseEvent, elementId: string) => void;
  handleTouchStart: (e: React.TouchEvent, elementId: string) => void;
  handleDoubleClick: (elementId: string) => void;
  handleSingleClick: (elementId: string) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  handleResizeMouseDown: (e: React.MouseEvent, elementId: string) => void;
  handleResizeTouchStart: (e: React.TouchEvent, elementId: string) => void;
  inlineEditingId: string | null;
  handleInlineTextChange: (elementId: string, newContent: string, textareaElement?: HTMLTextAreaElement) => void;
  handleInlineEditBlur: () => void;
  canvasZoom: number;
  onCanvasDoubleClick: () => void;
  onCanvasTouchStart: (e: React.TouchEvent) => void;
  canvasPan: { x: number; y: number };
  onCanvasMouseDown: (e: React.MouseEvent) => void;
}

export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  canvasRef,
  monumentImage,
  elements,
  selectedElement,
  setSelectedElement,
  rotateMode,
  handleMouseDown,
  handleTouchStart,
  handleDoubleClick,
  handleSingleClick,
  handleMouseMove,
  handleMouseUp,
  handleTouchMove,
  handleTouchEnd,
  handleResizeMouseDown,
  handleResizeTouchStart,
  inlineEditingId,
  handleInlineTextChange,
  handleInlineEditBlur,
  canvasZoom,
  onCanvasDoubleClick,
  onCanvasTouchStart,
  canvasPan,
  onCanvasMouseDown,
}) => {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 md:hidden text-xs text-muted-foreground text-center">
        <Icon name="Hand" size={12} className="inline mr-1" />
        Два пальца для масштабирования макета
      </div>
      
      <div 
        ref={canvasRef}
        className="relative w-full max-w-lg aspect-[3/4] bg-secondary rounded-lg overflow-hidden shadow-2xl ring-4 ring-border touch-none select-none"
        style={{ 
          transform: `scale(${canvasZoom}) translate(${canvasPan.x / canvasZoom}px, ${canvasPan.y / canvasZoom}px)`,
          transformOrigin: 'center center',
          cursor: canvasZoom > 1 ? 'move' : 'default',
          transition: 'none'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchStart={onCanvasTouchStart}
        onDoubleClick={onCanvasDoubleClick}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'IMG') {
            setSelectedElement(null);
            onCanvasMouseDown(e);
          }
        }}
      >
        <img 
          src={monumentImage} 
          alt="Памятник" 
          className="w-full h-full object-contain"
          draggable={false}
        />
        
        {elements.map(element => (
          <CanvasElement
            key={element.id}
            element={element}
            isSelected={selectedElement === element.id}
            isInlineEditing={inlineEditingId === element.id}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onSingleClick={handleSingleClick}
            onDoubleClick={handleDoubleClick}
            onResizeMouseDown={handleResizeMouseDown}
            onResizeTouchStart={handleResizeTouchStart}
            onInlineTextChange={handleInlineTextChange}
            onInlineEditBlur={handleInlineEditBlur}
            rotateMode={rotateMode}
          />
        ))}
      </div>
    </div>
  );
};

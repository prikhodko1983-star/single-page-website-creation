import React from "react";
import { CanvasContainer } from "./canvas/CanvasContainer";
import { CanvasToolbar } from "./canvas/CanvasToolbar";

interface CanvasElement {
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

interface ConstructorCanvasProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  monumentImage: string;
  elements: CanvasElement[];
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
  toggleRotateMode: () => void;
  setElements: (elements: CanvasElement[]) => void;
  saveDesign: () => void;
  sendForCalculation: () => void;
  exportDesign: () => void;
  exportDesignAsPNG: () => void;
  importDesign: (e: React.ChangeEvent<HTMLInputElement>) => void;
  importInputRef: React.RefObject<HTMLInputElement>;
  inlineEditingId: string | null;
  handleInlineTextChange: (elementId: string, newContent: string, textareaElement?: HTMLTextAreaElement) => void;
  handleInlineEditBlur: () => void;
  canvasZoom: number;
  onCanvasDoubleClick: () => void;
  onCanvasTouchStart: (e: React.TouchEvent) => void;
  canvasPan: { x: number; y: number };
  onCanvasMouseDown: (e: React.MouseEvent) => void;
}

export const ConstructorCanvas = ({
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
  toggleRotateMode,
  saveDesign,
  sendForCalculation,
  exportDesign,
  exportDesignAsPNG,
  importDesign,
  importInputRef,
  inlineEditingId,
  handleInlineTextChange,
  handleInlineEditBlur,
  canvasZoom,
  onCanvasDoubleClick,
  onCanvasTouchStart,
  canvasPan,
  onCanvasMouseDown,
}: ConstructorCanvasProps) => {
  return (
    <div className="lg:col-span-2">
      <CanvasToolbar
        rotateMode={rotateMode}
        toggleRotateMode={toggleRotateMode}
        saveDesign={saveDesign}
        sendForCalculation={sendForCalculation}
        exportDesign={exportDesign}
        exportDesignAsPNG={exportDesignAsPNG}
        importDesign={importDesign}
        importInputRef={importInputRef}
      />

      <CanvasContainer
        canvasRef={canvasRef}
        monumentImage={monumentImage}
        elements={elements}
        selectedElement={selectedElement}
        setSelectedElement={setSelectedElement}
        rotateMode={rotateMode}
        handleMouseDown={handleMouseDown}
        handleTouchStart={handleTouchStart}
        handleDoubleClick={handleDoubleClick}
        handleSingleClick={handleSingleClick}
        handleMouseMove={handleMouseMove}
        handleMouseUp={handleMouseUp}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
        handleResizeMouseDown={handleResizeMouseDown}
        handleResizeTouchStart={handleResizeTouchStart}
        inlineEditingId={inlineEditingId}
        handleInlineTextChange={handleInlineTextChange}
        handleInlineEditBlur={handleInlineEditBlur}
        canvasZoom={canvasZoom}
        onCanvasDoubleClick={onCanvasDoubleClick}
        onCanvasTouchStart={onCanvasTouchStart}
        canvasPan={canvasPan}
        onCanvasMouseDown={onCanvasMouseDown}
      />
    </div>
  );
};

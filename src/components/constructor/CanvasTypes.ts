import React from "react";

export interface CanvasElement {
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

export interface ConstructorCanvasProps {
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
  isSaving?: boolean;
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
  updateElement?: (id: string, updates: Partial<CanvasElement>) => Promise<void>;
  onPrintOrder?: () => void;
  topOffset?: number;
}

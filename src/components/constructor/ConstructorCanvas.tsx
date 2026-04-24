import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import React, { useState, useRef, useEffect } from "react";

interface ImageWithBorderProps {
  src: string;
  alt: string;
  flipHorizontal?: boolean;
  isSelected: boolean;
  containerWidth: number;
  containerHeight: number;
  rotateMode: boolean;
  onResizeMouseDown: (e: React.MouseEvent) => void;
  onResizeTouchStart: (e: React.TouchEvent) => void;
  onToggleRotate: (e: React.MouseEvent) => void;
}

const calcImgRect = (natW: number, natH: number, cW: number, cH: number) => {
  const scale = Math.min(cW / natW, cH / natH);
  const rW = natW * scale;
  const rH = natH * scale;
  return { w: rW, h: rH, x: (cW - rW) / 2, y: (cH - rH) / 2 };
};

const ImageWithBorder: React.FC<ImageWithBorderProps> = ({
  src, alt, flipHorizontal, isSelected, containerWidth, containerHeight,
  rotateMode, onResizeMouseDown, onResizeTouchStart, onToggleRotate
}) => {
  const natRef = useRef<{ w: number; h: number } | null>(null);
  const [imgRect, setImgRect] = useState<{ w: number; h: number; x: number; y: number } | null>(null);

  const onLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    natRef.current = { w: img.naturalWidth, h: img.naturalHeight };
    setImgRect(calcImgRect(img.naturalWidth, img.naturalHeight, containerWidth, containerHeight));
  };

  useEffect(() => {
    if (natRef.current) {
      setImgRect(calcImgRect(natRef.current.w, natRef.current.h, containerWidth, containerHeight));
    }
  }, [containerWidth, containerHeight]);

  return (
    <div className="relative w-full h-full">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain select-none"
        style={{ transform: flipHorizontal ? 'scaleX(-1)' : 'none', pointerEvents: 'none' }}
        draggable={false}
        onLoad={onLoad}
      />
      {isSelected && imgRect && (
        <>
          <div
            className="absolute pointer-events-none"
            style={{
              left: imgRect.x,
              top: imgRect.y,
              width: imgRect.w,
              height: imgRect.h,
              outline: '2px solid hsl(var(--primary))',
            }}
          />
          <div
            className={`absolute w-4 h-4 bg-primary rounded-full hover:scale-125 transition-transform touch-none flex items-center justify-center shadow-lg border-2 border-background ${
              rotateMode ? 'cursor-grab' : 'cursor-nwse-resize'
            }`}
            style={{
              left: imgRect.x + imgRect.w,
              top: imgRect.y + imgRect.h,
              transform: 'translate(50%, 50%)',
            }}
            onMouseDown={onResizeMouseDown}
            onTouchStart={onResizeTouchStart}
            onDoubleClick={onToggleRotate}
            title={rotateMode ? 'Режим вращения' : 'Режим масштабирования'}
          >
            {rotateMode && <Icon name="RotateCw" size={8} className="text-primary-foreground" />}
          </div>
        </>
      )}
    </div>
  );
};

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
  initialScale?: number; // Размер первой буквы (1.0 = обычный, 1.5 = в 1.5 раза больше)
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
  setElements,
  saveDesign,
  sendForCalculation,
  exportDesign,
  exportDesignAsPNG,
  isSaving,
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
  updateElement,
  onPrintOrder,
  topOffset = 48,
}: ConstructorCanvasProps) => {
  // Функция для рендеринга текста с увеличенными первыми буквами
  const renderTextWithInitials = (text: string, initialScale?: number) => {
    if (!initialScale || initialScale === 1) return text;
    
    // Разбиваем текст на строки, затем каждую строку на слова
    const lines = text.split('\n');
    
    return lines.map((line, lineIdx) => {
      const words = line.split(/\s+/);
      
      return (
        <React.Fragment key={lineIdx}>
          {lineIdx > 0 && <br />}
          {words.map((word, wordIdx) => {
            if (!word) return null;
            const firstChar = word[0];
            const rest = word.slice(1);
            
            return (
              <React.Fragment key={wordIdx}>
                {wordIdx > 0 && ' '}
                <span style={{ fontSize: `${initialScale}em`, lineHeight: 1 }}>{firstChar}</span>
                {rest}
              </React.Fragment>
            );
          })}
        </React.Fragment>
      );
    });
  };

  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 1024;
  const canvasHeight = isMobileView
    ? `calc(95vw / 0.75)`
    : `calc(100vh - ${topOffset}px)`;
  const canvasWidth = isMobileView
    ? `95vw`
    : `calc((100vh - ${topOffset}px) * 0.75)`;

  return (
    <div className="flex flex-col items-center justify-start w-full relative" style={{ paddingBottom: isMobileView ? '16px' : '0px' }}>
      <div 
        ref={canvasRef}
        className="relative bg-[#0a0a0a] overflow-hidden touch-none select-none"
        style={{ 
          transform: `scale(${canvasZoom}) translate(${canvasPan.x / canvasZoom}px, ${canvasPan.y / canvasZoom}px)`,
          transformOrigin: 'top center',
          cursor: canvasZoom > 1 ? 'move' : 'default',
          transition: 'none',
          height: canvasHeight,
          width: canvasWidth,
          zIndex: 10
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchStart={onCanvasTouchStart}
        onDoubleClick={onCanvasDoubleClick}
        onContextMenu={(e) => e.preventDefault()}
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
        
        {elements.map(element => {
          const isImageElement = ['image', 'cross', 'flower'].includes(element.type);
          return (
          <div
            key={element.id}
            className={`absolute cursor-move touch-none ${selectedElement === element.id && !isImageElement ? 'ring-2 ring-inset ring-primary' : ''}`}
            style={{
              left: element.x,
              top: element.y,
              width: element.autoSize ? 'auto' : element.width,
              height: element.autoSize ? 'auto' : element.height,
              transform: `rotate(${element.rotation || 0}deg)`,
              minWidth: element.autoSize ? '50px' : undefined,
              minHeight: element.autoSize ? '30px' : undefined,
            }}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            onTouchStart={(e) => handleTouchStart(e, element.id)}
            onClick={() => handleSingleClick(element.id)}
            onDoubleClick={(e) => { e.stopPropagation(); handleDoubleClick(element.id); }}
          >
            {element.type === 'text' && (
              <div 
                className="w-full h-full flex items-start justify-center overflow-hidden p-1"
              >
                {inlineEditingId === element.id ? (
                  <textarea
                    autoFocus
                    value={element.content || ''}
                    onChange={(e) => handleInlineTextChange(element.id, e.target.value, e.target)}
                    onBlur={handleInlineEditBlur}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full h-full resize-none bg-transparent border-none outline-none"
                    style={{
                      fontSize: `${element.fontSize}px`,
                      color: element.color,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      fontFamily: element.fontFamily?.includes('|custom|') ? element.fontFamily?.split('|')[0] : (element.fontFamily?.split('|')[0] || 'serif'),
                      fontWeight: element.fontFamily?.includes('|custom|') ? 'normal' : (element.fontFamily?.split('|')[1] || 'bold'),
                      fontStyle: element.italic ? 'italic' : 'normal',
                      lineHeight: element.lineHeight || 1.2,
                      letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
                      textAlign: element.textAlign || 'center',
                      overflow: 'auto',
                    }}
                  />
                ) : (
                  <div
                    className="select-none"
                    style={{ 
                      fontSize: `${element.fontSize}px`, 
                      color: element.color,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      fontFamily: element.fontFamily?.includes('|custom|') ? element.fontFamily?.split('|')[0] : (element.fontFamily?.split('|')[0] || 'serif'),
                      fontWeight: element.fontFamily?.includes('|custom|') ? 'normal' : (element.fontFamily?.split('|')[1] || 'bold'),
                      fontStyle: element.italic ? 'italic' : 'normal',
                      lineHeight: element.lineHeight || 1.2,
                      letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
                      textAlign: element.textAlign || 'center',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      overflow: 'visible',
                      width: '100%',
                      display: 'block',
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    {element.content}
                  </div>
                )}
              </div>
            )}
            
            {element.type === 'epitaph' && (
              <div 
                className="w-full h-full flex items-start justify-center overflow-hidden p-1"
              >
                {inlineEditingId === element.id ? (
                  <textarea
                    autoFocus
                    value={element.content || ''}
                    onChange={(e) => handleInlineTextChange(element.id, e.target.value, e.target)}
                    onBlur={handleInlineEditBlur}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full h-full resize-none bg-transparent border-none outline-none italic"
                    style={{
                      fontSize: `${element.fontSize}px`,
                      color: element.color,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      fontFamily: element.fontFamily?.split('|')[0] || 'serif',
                      fontWeight: element.fontFamily?.split('|')[1] || '400',
                      fontStyle: element.italic ? 'italic' : 'normal',
                      lineHeight: element.lineHeight || 1.4,
                      letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
                      textAlign: element.textAlign || 'center',
                      overflow: 'auto',
                    }}
                  />
                ) : (
                  <div
                    className="select-none italic"
                    style={{ 
                      fontSize: `${element.fontSize}px`, 
                      color: element.color,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      fontFamily: element.fontFamily?.split('|')[0] || 'serif',
                      fontWeight: element.fontFamily?.split('|')[1] || '400',
                      fontStyle: element.italic ? 'italic' : 'normal',
                      lineHeight: element.lineHeight || 1.4,
                      letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
                      textAlign: element.textAlign || 'center',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      overflow: 'visible',
                      width: '100%',
                      display: 'block',
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    {element.content}
                  </div>
                )}
              </div>
            )}
            
            {element.type === 'fio' && (
              <div 
                className="w-full h-full flex items-start justify-center"
              >
                {inlineEditingId === element.id ? (
                  <textarea
                    autoFocus
                    value={element.content || ''}
                    onChange={(e) => handleInlineTextChange(element.id, e.target.value, e.target)}
                    onBlur={handleInlineEditBlur}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full h-full resize-none bg-transparent border-none outline-none overflow-hidden"
                    style={{
                      fontSize: `${element.fontSize}px`,
                      color: element.color,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      fontFamily: element.fontFamily?.split('|')[0] || 'serif',
                      fontWeight: element.fontFamily?.includes('|custom|') ? 'normal' : (element.fontFamily?.split('|')[1] || '400'),
                      fontStyle: element.italic ? 'italic' : 'normal',
                      lineHeight: element.fontFamily?.includes('|custom|') ? 1.6 : (element.lineHeight || 1.05),
                      letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
                      textAlign: element.textAlign || 'center',
                      fontFeatureSettings: element.fontFamily?.includes('|custom|') ? "'ss01', 'calt', 'swsh', 'liga', 'dlig'" : 'normal',
                      fontVariantLigatures: element.fontFamily?.includes('|custom|') ? 'common-ligatures discretionary-ligatures' : 'normal',
                    }}
                  />
                ) : (
                  <div
                    className="select-none"
                    style={{ 
                      fontSize: `${element.fontSize}px`, 
                      color: element.color,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      fontFamily: element.fontFamily?.split('|')[0] || 'serif',
                      fontWeight: element.fontFamily?.includes('|custom|') ? 'normal' : (element.fontFamily?.split('|')[1] || '400'),
                      fontStyle: element.italic ? 'italic' : 'normal',
                      lineHeight: element.lineHeight || 1.05,
                      letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
                      textAlign: element.textAlign || 'center',
                      whiteSpace: 'pre-wrap',
                      overflow: 'visible',
                      width: '100%',
                      display: 'block',
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    {renderTextWithInitials(element.content || '', element.initialScale)}
                  </div>
                )}
              </div>
            )}
            
            {element.type === 'dates' && (
              <div 
                className="w-full h-full flex items-start justify-center"
              >
                {inlineEditingId === element.id ? (
                  <textarea
                    autoFocus
                    value={element.content || ''}
                    onChange={(e) => handleInlineTextChange(element.id, e.target.value, e.target)}
                    onBlur={handleInlineEditBlur}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full h-full resize-none bg-transparent border-none outline-none overflow-hidden"
                    style={{
                      fontSize: `${element.fontSize}px`,
                      color: element.color,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      fontFamily: element.fontFamily?.split('|')[0] || 'serif',
                      fontWeight: element.fontFamily?.split('|')[1] || '400',
                      fontStyle: element.italic ? 'italic' : 'normal',
                      lineHeight: element.lineHeight || 1.2,
                      letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : '0.05em',
                      textAlign: element.textAlign || 'center',
                    }}
                  />
                ) : (
                  <div
                    className="select-none"
                    style={{ 
                      fontSize: `${element.fontSize}px`, 
                      color: element.color,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      fontFamily: element.fontFamily?.split('|')[0] || 'serif',
                      fontWeight: element.fontFamily?.split('|')[1] || '400',
                      fontStyle: element.italic ? 'italic' : 'normal',
                      lineHeight: element.lineHeight || 1.2,
                      letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : '0.05em',
                      textAlign: element.textAlign || 'center',
                      whiteSpace: 'pre-wrap',
                      overflow: 'visible',
                      width: '100%',
                      display: 'block',
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    {element.content}
                  </div>
                )}
              </div>
            )}
            
            {element.type === 'photo' && element.src && (
              <img 
                src={element.screenMode && element.processedSrc ? element.processedSrc : element.src} 
                alt="Фотография"
                className="w-full h-full object-cover select-none"
                draggable={false}
              />
            )}
            
            {(element.type === 'image' || element.type === 'cross' || element.type === 'flower') && element.src && (
              <ImageWithBorder
                src={element.screenMode && element.processedSrc ? element.processedSrc : element.src}
                alt={element.type}
                flipHorizontal={element.flipHorizontal}
                isSelected={selectedElement === element.id}
                containerWidth={element.width}
                containerHeight={element.height}
                rotateMode={rotateMode}
                onResizeMouseDown={(e) => handleResizeMouseDown(e, element.id)}
                onResizeTouchStart={(e) => handleResizeTouchStart(e, element.id)}
                onToggleRotate={(e) => { e.stopPropagation(); toggleRotateMode(); }}
              />
            )}
            


            {selectedElement === element.id && !isImageElement && (
              <div 
                className={`absolute bottom-0 right-0 w-4 h-4 bg-primary rounded-full hover:scale-125 transition-transform touch-none flex items-center justify-center shadow-lg border-2 border-background ${
                  rotateMode ? 'cursor-grab' : 'cursor-nwse-resize'
                }`}
                style={{ transform: 'translate(50%, 50%)' }}
                onMouseDown={(e) => handleResizeMouseDown(e, element.id)}
                onTouchStart={(e) => handleResizeTouchStart(e, element.id)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  toggleRotateMode();
                }}
                title={rotateMode ? 'Режим вращения (двойной клик для масштабирования)' : 'Режим масштабирования (двойной клик для вращения)'}
              >
                {rotateMode && (
                  <Icon name="RotateCw" size={8} className="text-primary-foreground" />
                )}
              </div>
            )}
          </div>
          );
        })}
      </div>
      
      {/* Zoom controls - overlay bottom center */}
      <div className="absolute bottom-3 right-3 flex gap-1 z-20">
        <button
          onClick={onCanvasDoubleClick}
          className="h-7 w-7 rounded bg-black/60 hover:bg-black/80 text-white/70 hover:text-white flex items-center justify-center transition-colors"
          title={canvasZoom === 1 ? "Увеличить" : "Уменьшить"}
        >
          <Icon name={canvasZoom === 1 ? "ZoomIn" : "ZoomOut"} size={14} />
        </button>
        <button
          onClick={() => setElements([])}
          className="h-7 w-7 rounded bg-black/60 hover:bg-red-900/80 text-white/70 hover:text-white flex items-center justify-center transition-colors"
          title="Очистить холст"
        >
          <Icon name="Trash2" size={14} />
        </button>
      </div>
    </div>
  );
};
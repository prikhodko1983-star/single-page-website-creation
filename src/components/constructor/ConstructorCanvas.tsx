import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import React from "react";

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

  return (
    <div className="flex flex-col items-center relative">
      {/* Подсказки */}
      <div className="mb-2 text-xs text-muted-foreground text-center">
        <div className="hidden md:block">
          <Icon name="MousePointerClick" size={12} className="inline mr-1" />
          Двойной клик для увеличения макета
        </div>
        <div className="md:hidden">
          <Icon name="Hand" size={12} className="inline mr-1" />
          Два пальца для масштабирования макета
        </div>
      </div>
      
      <div 
        ref={canvasRef}
        className="relative w-full aspect-[3/4] bg-secondary rounded-lg overflow-hidden shadow-2xl ring-4 ring-border touch-none select-none"
        style={{ 
          transform: `scale(${canvasZoom}) translate(${canvasPan.x / canvasZoom}px, ${canvasPan.y / canvasZoom}px)`,
          transformOrigin: 'center top',
          cursor: canvasZoom > 1 ? 'move' : 'default',
          transition: 'none',
          maxHeight: 'calc(100vh - 200px)',
          maxWidth: 'min(32rem, calc((100vh - 200px) * 0.75))',
          zIndex: 10
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
          <div
            key={element.id}
            className={`absolute cursor-move touch-none ${selectedElement === element.id ? 'ring-2 ring-inset ring-primary' : ''}`}
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
            onDoubleClick={() => handleDoubleClick(element.id)}
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
              <img 
                src={element.screenMode && element.processedSrc ? element.processedSrc : element.src} 
                alt={element.type}
                className="w-full h-full object-contain select-none"
                style={{
                  transform: element.flipHorizontal ? 'scaleX(-1)' : 'none'
                }}
                draggable={false}
              />
            )}
            
            {selectedElement === element.id && ['text', 'epitaph', 'fio', 'dates'].includes(element.type) && updateElement && (
              <div
                className="absolute -top-9 left-1/2 flex gap-0.5 bg-background/90 backdrop-blur-sm rounded-md border border-border shadow-lg p-0.5"
                style={{ transform: 'translateX(-50%)' }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateElement(element.id, { textAlign: align });
                    }}
                    className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
                      (element.textAlign || 'center') === align
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon name={align === 'left' ? 'AlignLeft' : align === 'center' ? 'AlignCenter' : 'AlignRight'} size={14} />
                  </button>
                ))}
              </div>
            )}

            {selectedElement === element.id && (
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
        ))}
      </div>
      
      <div className="mt-4 flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onCanvasDoubleClick}
          className="hidden md:flex flex-1 sm:flex-none"
        >
          <Icon name={canvasZoom === 1 ? "ZoomIn" : "ZoomOut"} size={16} className="mr-2" />
          {canvasZoom === 1 ? "Увеличить" : "Уменьшить"}
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setElements([])}
          className="flex-1 sm:flex-none"
        >
          <Icon name="Trash2" size={16} className="mr-2" />
          Очистить
        </Button>
        <Button 
          size="sm"
          onClick={sendForCalculation}
          disabled={elements.length === 0 || isSaving}
          className="flex-1 sm:flex-none"
        >
          <Icon name="Download" size={16} className="mr-2" />
          {isSaving ? 'Сохранение...' : 'Скачать'}
        </Button>
        {onPrintOrder && (
          <Button 
            variant="outline"
            size="sm"
            onClick={onPrintOrder}
            disabled={elements.length === 0 || isSaving}
            className="flex-1 sm:flex-none"
          >
            <Icon name="Printer" size={16} className="mr-2" />
            Печать заказа
          </Button>
        )}
      </div>
      
      <div className="mt-4 w-full max-w-lg space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            ref={importInputRef}
            type="file"
            accept=".json,.png,application/json,image/png"
            onChange={importDesign}
            className="hidden"
            id="import-design"
          />
          <Button 
            variant="secondary" 
            onClick={exportDesignAsPNG}
            disabled={elements.length === 0 || isSaving}
            className="flex-1"
          >
            <Icon name="Image" size={18} className="mr-2" />
            {isSaving ? 'Сохранение...' : 'Сохранить проект'}
          </Button>
          <label 
            htmlFor="import-design"
            className="flex-1"
          >
            <Button 
              variant="secondary" 
              className="w-full"
              type="button"
              asChild
            >
              <span>
                <Icon name="Upload" size={18} className="mr-2" />
                Загрузить
              </span>
            </Button>
          </label>
        </div>
        <p className="text-xs text-muted-foreground text-center px-2">
          💡 Сохраните проект на устройство и загрузите позже, чтобы продолжить работу
        </p>
      </div>
    </div>
  );
};
import React from "react";

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

interface CanvasElementProps {
  element: CanvasElementData;
  isSelected: boolean;
  isInlineEditing: boolean;
  onMouseDown: (e: React.MouseEvent, elementId: string) => void;
  onTouchStart: (e: React.TouchEvent, elementId: string) => void;
  onSingleClick: (elementId: string) => void;
  onDoubleClick: (elementId: string) => void;
  onResizeMouseDown: (e: React.MouseEvent, elementId: string) => void;
  onResizeTouchStart: (e: React.TouchEvent, elementId: string) => void;
  onInlineTextChange: (elementId: string, newContent: string, textareaElement?: HTMLTextAreaElement) => void;
  onInlineEditBlur: () => void;
  rotateMode: boolean;
}

const renderTextWithInitials = (text: string, initialScale?: number) => {
  if (!initialScale || initialScale === 1) return text;
  
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

export const CanvasElement: React.FC<CanvasElementProps> = ({
  element,
  isSelected,
  isInlineEditing,
  onMouseDown,
  onTouchStart,
  onSingleClick,
  onDoubleClick,
  onResizeMouseDown,
  onResizeTouchStart,
  onInlineTextChange,
  onInlineEditBlur,
  rotateMode,
}) => {
  return (
    <div
      key={element.id}
      className={`absolute cursor-move touch-none ${isSelected ? 'ring-2 ring-primary' : ''}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.autoSize ? 'auto' : element.width,
        height: element.autoSize ? 'auto' : element.height,
        transform: `rotate(${element.rotation || 0}deg)`,
        minWidth: element.autoSize ? '50px' : undefined,
        minHeight: element.autoSize ? '30px' : undefined,
      }}
      onMouseDown={(e) => onMouseDown(e, element.id)}
      onTouchStart={(e) => onTouchStart(e, element.id)}
      onClick={() => onSingleClick(element.id)}
      onDoubleClick={() => onDoubleClick(element.id)}
    >
      {element.type === 'text' && (
        <div className="w-full h-full flex items-start justify-center overflow-hidden p-1">
          {isInlineEditing ? (
            <textarea
              autoFocus
              value={element.content || ''}
              onChange={(e) => onInlineTextChange(element.id, e.target.value, e.target)}
              onBlur={onInlineEditBlur}
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
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: element.textAlign === 'left' ? 'flex-start' : element.textAlign === 'right' ? 'flex-end' : 'center',
              }}
            >
              {element.content}
            </div>
          )}
        </div>
      )}

      {(element.type === 'epitaph' || element.type === 'fio' || element.type === 'dates') && (
        <div className="w-full h-full flex items-start justify-center overflow-hidden p-1">
          <div
            className="select-none fio-custom"
            style={{
              fontSize: `${element.fontSize}px`,
              color: element.color,
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              fontFamily: element.fontFamily?.includes('|custom|') ? element.fontFamily?.split('|')[0] : (element.fontFamily?.split('|')[0] || 'serif'),
              fontWeight: element.fontFamily?.includes('|custom|') ? 'normal' : (element.fontFamily?.split('|')[1] || 'bold'),
              fontStyle: element.italic ? 'italic' : 'normal',
              lineHeight: element.lineHeight || 1.6,
              letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
              textAlign: element.textAlign || 'center',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: element.textAlign === 'left' ? 'flex-start' : element.textAlign === 'right' ? 'flex-end' : 'center',
            }}
          >
            {element.type === 'fio' && element.initialScale && element.initialScale > 1.0 
              ? renderTextWithInitials(element.content || '', element.initialScale)
              : element.content
            }
          </div>
        </div>
      )}

      {(element.type === 'image' || element.type === 'cross' || element.type === 'flower') && element.src && (
        <img 
          src={element.screenMode && element.processedSrc ? element.processedSrc : element.src}
          alt="Элемент" 
          className="w-full h-full object-contain select-none"
          style={{
            transform: element.flipHorizontal ? 'scaleX(-1)' : 'none',
            pointerEvents: 'none'
          }}
          draggable={false}
        />
      )}

      {element.type === 'photo' && element.src && (
        <div className="w-full h-full overflow-hidden select-none">
          <img 
            src={element.screenMode && element.processedSrc ? element.processedSrc : element.src}
            alt="Фото" 
            className="w-full h-full object-cover select-none"
            style={{
              transform: element.flipHorizontal ? 'scaleX(-1)' : 'none',
              pointerEvents: 'none'
            }}
            draggable={false}
          />
        </div>
      )}

      {isSelected && !rotateMode && (
        <>
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 bg-primary rounded-full cursor-se-resize touch-none"
            onMouseDown={(e) => onResizeMouseDown(e, element.id)}
            onTouchStart={(e) => onResizeTouchStart(e, element.id)}
            style={{ transform: 'translate(50%, 50%)' }}
          />
          
          <div 
            className="absolute -bottom-1 left-1/2 w-6 h-1 bg-primary/30 rounded-full"
            style={{ transform: 'translateX(-50%)' }}
          />
        </>
      )}
    </div>
  );
};

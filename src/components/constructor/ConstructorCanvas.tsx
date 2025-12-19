import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

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
  importDesign: (e: React.ChangeEvent<HTMLInputElement>) => void;
  importInputRef: React.RefObject<HTMLInputElement>;
  inlineEditingId: string | null;
  handleInlineTextChange: (elementId: string, newContent: string, textareaElement?: HTMLTextAreaElement) => void;
  handleInlineEditBlur: () => void;
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
  importDesign,
  importInputRef,
  inlineEditingId,
  handleInlineTextChange,
  handleInlineEditBlur,
}: ConstructorCanvasProps) => {
  return (
    <div className="flex flex-col items-center">
      <div 
        ref={canvasRef}
        className="relative w-full max-w-lg aspect-[3/4] bg-secondary rounded-lg overflow-hidden shadow-2xl border-4 border-border touch-none select-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'IMG') {
            setSelectedElement(null);
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
            className={`absolute cursor-move touch-none ${selectedElement === element.id ? 'ring-2 ring-primary' : ''}`}
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              transform: `rotate(${element.rotation || 0}deg)`,
            }}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            onTouchStart={(e) => handleTouchStart(e, element.id)}
            onClick={() => handleSingleClick(element.id)}
            onDoubleClick={() => handleDoubleClick(element.id)}
          >
            {element.type === 'text' && (
              <div 
                className="w-full h-full flex items-center justify-center overflow-hidden p-1"
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
                      fontWeight: element.fontFamily?.split('|')[1] || 'bold',
                      lineHeight: element.lineHeight || 1.2,
                      letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
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
                      fontWeight: element.fontFamily?.split('|')[1] || 'bold',
                      lineHeight: element.lineHeight || 1.2,
                      letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
                      textAlign: element.textAlign || 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      width: '100%',
                    }}
                  >
                    {element.content}
                  </div>
                )}
              </div>
            )}
            
            {element.type === 'epitaph' && (
              <div 
                className="w-full h-full flex items-center justify-center overflow-hidden p-1"
              >
                {inlineEditingId === element.id ? (
                  <textarea
                    autoFocus
                    value={element.content || ''}
                    onChange={(e) => handleInlineTextChange(element.id, e.target.value, e.target)}
                    onBlur={handleInlineEditBlur}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full h-full resize-none bg-transparent border-none outline-none italic overflow-hidden"
                    style={{
                      fontSize: `${element.fontSize}px`,
                      color: element.color,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      fontFamily: element.fontFamily?.split('|')[0] || 'serif',
                      fontWeight: element.fontFamily?.split('|')[1] || '400',
                      lineHeight: element.lineHeight || 1.4,
                      letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
                      textAlign: element.textAlign || 'center',
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
                      lineHeight: element.lineHeight || 1.4,
                      letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
                      textAlign: element.textAlign || 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      width: '100%',
                    }}
                  >
                    {element.content}
                  </div>
                )}
              </div>
            )}
            
            {element.type === 'fio' && (
              <div 
                className="w-full h-full flex items-center justify-center overflow-hidden p-1"
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
                      lineHeight: element.lineHeight || 1.3,
                      letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
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
                      lineHeight: element.lineHeight || 1.3,
                      letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
                      textAlign: element.textAlign || 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      width: '100%',
                    }}
                  >
                    {element.content}
                  </div>
                )}
              </div>
            )}
            
            {element.type === 'dates' && (
              <div 
                className="w-full h-full flex items-center justify-center overflow-hidden p-1"
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
                      lineHeight: element.lineHeight || 1.2,
                      letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : '0.05em',
                      textAlign: element.textAlign || 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      width: '100%',
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
            
            {selectedElement === element.id && (
              <div 
                className={`absolute -bottom-2 -right-2 w-7 h-7 bg-primary rounded-full hover:scale-110 transition-all touch-none flex items-center justify-center ${
                  rotateMode ? 'cursor-grab' : 'cursor-nwse-resize'
                }`}
                onMouseDown={(e) => handleResizeMouseDown(e, element.id)}
                onTouchStart={(e) => handleResizeTouchStart(e, element.id)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  toggleRotateMode();
                }}
                title={rotateMode ? 'Режим вращения (двойной клик для масштабирования)' : 'Режим масштабирования (двойной клик для вращения)'}
              >
                {rotateMode && (
                  <Icon name="RotateCw" size={14} className="text-primary-foreground" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <Button variant="outline" onClick={() => setElements([])}>
          <Icon name="Trash2" size={18} className="mr-2" />
          Очистить всё
        </Button>
        <Button 
          variant="outline" 
          onClick={saveDesign}
          disabled={elements.length === 0}
        >
          <Icon name="Save" size={18} className="mr-2" />
          Сохранить дизайн
        </Button>
        <Button 
          onClick={sendForCalculation}
          disabled={elements.length === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          <Icon name="Image" size={18} className="mr-2" />
          Скачать PNG (1200x1600)
        </Button>
      </div>
      
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <input
          ref={importInputRef}
          type="file"
          accept=".json,application/json"
          onChange={importDesign}
          className="hidden"
          id="import-design"
        />
        <Button 
          variant="secondary" 
          onClick={exportDesign}
          disabled={elements.length === 0}
        >
          <Icon name="Download" size={18} className="mr-2" />
          Экспортировать шаблон
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => importInputRef.current?.click()}
        >
          <Icon name="Upload" size={18} className="mr-2" />
          Загрузить шаблон
        </Button>
      </div>
    </div>
  );
};
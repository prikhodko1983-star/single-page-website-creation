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
}

interface ConstructorCanvasProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  monumentImage: string;
  elements: CanvasElement[];
  selectedElement: string | null;
  handleMouseDown: (e: React.MouseEvent, elementId: string) => void;
  handleTouchStart: (e: React.TouchEvent, elementId: string) => void;
  handleDoubleClick: (elementId: string) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  handleResizeMouseDown: (e: React.MouseEvent, elementId: string) => void;
  handleResizeTouchStart: (e: React.TouchEvent, elementId: string) => void;
  setElements: (elements: CanvasElement[]) => void;
  saveDesign: () => void;
  sendForCalculation: () => void;
  exportDesign: () => void;
  importDesign: (e: React.ChangeEvent<HTMLInputElement>) => void;
  importInputRef: React.RefObject<HTMLInputElement>;
}

export const ConstructorCanvas = ({
  canvasRef,
  monumentImage,
  elements,
  selectedElement,
  handleMouseDown,
  handleTouchStart,
  handleDoubleClick,
  handleMouseMove,
  handleMouseUp,
  handleTouchMove,
  handleTouchEnd,
  handleResizeMouseDown,
  handleResizeTouchStart,
  setElements,
  saveDesign,
  sendForCalculation,
  exportDesign,
  importDesign,
  importInputRef,
}: ConstructorCanvasProps) => {
  return (
    <div className="flex flex-col items-center">
      <div 
        ref={canvasRef}
        className="relative w-full max-w-2xl aspect-[3/4] bg-secondary rounded-lg overflow-hidden shadow-2xl border-4 border-border touch-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img 
          src={monumentImage} 
          alt="Памятник" 
          className="w-full h-full object-cover"
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
            onDoubleClick={() => handleDoubleClick(element.id)}
          >
            {element.type === 'text' && (
              <div 
                className="w-full h-full flex items-center select-none overflow-hidden"
                style={{ 
                  fontSize: `${element.fontSize}px`, 
                  color: element.color,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  fontFamily: element.fontFamily?.split('|')[0] || 'serif',
                  fontWeight: element.fontFamily?.split('|')[1] || 'bold',
                  lineHeight: element.lineHeight || 1.2,
                  letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
                  textAlign: element.textAlign || 'center',
                  justifyContent: element.textAlign === 'left' ? 'flex-start' : element.textAlign === 'right' ? 'flex-end' : 'center',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                }}
              >
                {element.content}
              </div>
            )}
            
            {element.type === 'epitaph' && (
              <div 
                className="w-full h-full flex items-center select-none italic overflow-hidden"
                style={{ 
                  fontSize: `${element.fontSize}px`, 
                  color: element.color,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  fontFamily: element.fontFamily?.split('|')[0] || 'serif',
                  fontWeight: element.fontFamily?.split('|')[1] || '400',
                  lineHeight: element.lineHeight || 1.4,
                  letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
                  textAlign: element.textAlign || 'center',
                  justifyContent: element.textAlign === 'left' ? 'flex-start' : element.textAlign === 'right' ? 'flex-end' : 'center',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                }}
              >
                {element.content}
              </div>
            ))
            
            {element.type === 'fio' && (
              <div 
                className="w-full h-full flex items-center select-none overflow-hidden"
                style={{ 
                  fontSize: `${element.fontSize}px`, 
                  color: element.color,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  fontFamily: element.fontFamily?.split('|')[0] || 'serif',
                  fontWeight: element.fontFamily?.split('|')[1] || '400',
                  lineHeight: element.lineHeight || 1.3,
                  letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
                  textAlign: element.textAlign || 'center',
                  justifyContent: element.textAlign === 'left' ? 'flex-start' : element.textAlign === 'right' ? 'flex-end' : 'center',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                }}
              >
                {element.content}
              </div>
            )}
            
            {element.type === 'dates' && (
              <div 
                className="w-full h-full flex items-center select-none overflow-hidden"
                style={{ 
                  fontSize: `${element.fontSize}px`, 
                  color: element.color,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  fontFamily: element.fontFamily?.split('|')[0] || 'serif',
                  fontWeight: element.fontFamily?.split('|')[1] || '400',
                  letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : '0.05em',
                  textAlign: element.textAlign || 'center',
                  justifyContent: element.textAlign === 'left' ? 'flex-start' : element.textAlign === 'right' ? 'flex-end' : 'center',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                }}
              >
                {element.content}
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
                draggable={false}
              />
            )}
            
            {selectedElement === element.id && (
              <div 
                className="absolute -bottom-2 -right-2 w-6 h-6 bg-primary rounded-full cursor-nwse-resize hover:scale-110 transition-transform touch-none"
                onMouseDown={(e) => handleResizeMouseDown(e, element.id)}
                onTouchStart={(e) => handleResizeTouchStart(e, element.id)}
              ></div>
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
          Скачать JPG и отправить
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
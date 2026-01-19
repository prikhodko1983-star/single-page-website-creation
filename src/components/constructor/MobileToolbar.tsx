import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useState } from "react";

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
}

interface MobileToolbarProps {
  selectedEl: CanvasElement | undefined;
  updateElement: (id: string, updates: Partial<CanvasElement>) => Promise<void>;
  deleteElement: (id: string) => void;
  fonts: Array<{id: string, name: string, style: string, weight: string, example: string, fullStyle: string}>;
  onEditImage?: (id: string) => void;
}

export const MobileToolbar = ({
  selectedEl,
  updateElement,
  deleteElement,
  fonts,
  onEditImage,
}: MobileToolbarProps) => {
  const [activePanel, setActivePanel] = useState<'fonts' | 'size' | 'color' | 'align' | 'rotate' | 'imageSize' | null>(null);
  const [rotationInput, setRotationInput] = useState<string>('');

  if (!selectedEl) {
    console.log('⚠️ MobileToolbar: selectedEl пустой');
    return null;
  }

  console.log('✅ MobileToolbar: selectedEl =', selectedEl);
  
  const isTextElement = ['text', 'epitaph', 'fio', 'dates'].includes(selectedEl.type);
  const isImageElement = ['image', 'cross', 'flower', 'photo'].includes(selectedEl.type);
  
  console.log('isImageElement:', isImageElement, 'type:', selectedEl.type);

  const togglePanel = (panel: 'fonts' | 'size' | 'color' | 'align' | 'rotate' | 'imageSize') => {
    if (panel === 'rotate' && activePanel !== 'rotate') {
      setRotationInput((selectedEl.rotation || 0).toString());
    }
    setActivePanel(activePanel === panel ? null : panel);
  };

  const handleRotationInputChange = (value: string) => {
    setRotationInput(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(-180, Math.min(180, numValue));
      updateElement(selectedEl.id, { rotation: clampedValue });
    }
  };

  const handleRotationInputBlur = () => {
    const numValue = parseInt(rotationInput);
    if (isNaN(numValue)) {
      setRotationInput((selectedEl.rotation || 0).toString());
    } else {
      const clampedValue = Math.max(-180, Math.min(180, numValue));
      setRotationInput(clampedValue.toString());
      updateElement(selectedEl.id, { rotation: clampedValue });
    }
  };

  return (
    <>
      {/* Выдвижные панели */}
      {isTextElement && activePanel === 'fonts' && (
        <div className="fixed inset-x-0 bottom-16 bg-background border-t border-border p-3 z-40 max-h-56 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-xs">Выберите шрифт</h3>
            <Button variant="ghost" size="sm" onClick={() => setActivePanel(null)}>
              <Icon name="X" size={14} />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {fonts.map((font) => (
              <button
                key={font.id}
                onClick={() => {
                  updateElement(selectedEl.id, { fontFamily: font.fullStyle });
                }}
                className={`p-2 rounded-lg border-2 transition-all ${
                  selectedEl.fontFamily === font.fullStyle
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-[10px] text-muted-foreground mb-0.5">{font.name}</div>
                <div
                  className="text-sm truncate"
                  style={{
                    fontFamily: font.style,
                    fontWeight: font.weight,
                  }}
                >
                  {font.example}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isTextElement && activePanel === 'size' && (
        <div className="fixed inset-x-0 bottom-16 bg-background border-t border-border p-3 z-40 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-xs">Размер текста: {selectedEl.fontSize}px</h3>
            <Button variant="ghost" size="sm" onClick={() => setActivePanel(null)}>
              <Icon name="X" size={14} />
            </Button>
          </div>
          <input
            type="range"
            min="8"
            max="30"
            value={selectedEl.fontSize || 24}
            onChange={(e) => updateElement(selectedEl.id, { fontSize: parseInt(e.target.value) })}
            className="w-full mb-4"
          />
          
          <div className="border-t border-border pt-3">
            <h3 className="font-semibold text-xs mb-2">Межстрочное расстояние: {selectedEl.lineHeight || 1.2}</h3>
            <input
              type="range"
              min="0.4"
              max="3"
              step="0.1"
              value={selectedEl.lineHeight || 1.2}
              onChange={(e) => updateElement(selectedEl.id, { lineHeight: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      )}

      {isTextElement && activePanel === 'color' && (
        <div className="fixed inset-x-0 bottom-16 bg-background border-t border-border p-3 z-40">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-xs">Цвет текста</h3>
            <Button variant="ghost" size="sm" onClick={() => setActivePanel(null)}>
              <Icon name="X" size={14} />
            </Button>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {['#FFFFFF', '#000000', '#FFD700', '#C0C0C0', '#8B4513', '#4A4A4A'].map(color => (
              <button
                key={color}
                onClick={() => {
                  updateElement(selectedEl.id, { color });
                  setActivePanel(null);
                }}
                className={`w-full aspect-square rounded-lg border-2 ${
                  selectedEl.color === color ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <input
            type="color"
            value={selectedEl.color || '#FFFFFF'}
            onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
            className="w-full h-10 mt-2 rounded border"
          />
        </div>
      )}

      {isTextElement && activePanel === 'align' && (
        <div className="fixed inset-x-0 bottom-16 bg-background border-t border-border p-3 z-40">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-xs">Выравнивание</h3>
            <Button variant="ghost" size="sm" onClick={() => setActivePanel(null)}>
              <Icon name="X" size={14} />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedEl.textAlign === 'left' ? 'default' : 'outline'}
              onClick={() => {
                updateElement(selectedEl.id, { textAlign: 'left' });
                setActivePanel(null);
              }}
              className="flex-1 h-10"
            >
              <Icon name="AlignLeft" size={16} />
            </Button>
            <Button
              variant={selectedEl.textAlign === 'center' || !selectedEl.textAlign ? 'default' : 'outline'}
              onClick={() => {
                updateElement(selectedEl.id, { textAlign: 'center' });
                setActivePanel(null);
              }}
              className="flex-1 h-10"
            >
              <Icon name="AlignCenter" size={16} />
            </Button>
            <Button
              variant={selectedEl.textAlign === 'right' ? 'default' : 'outline'}
              onClick={() => {
                updateElement(selectedEl.id, { textAlign: 'right' });
                setActivePanel(null);
              }}
              className="flex-1 h-10"
            >
              <Icon name="AlignRight" size={16} />
            </Button>
          </div>
        </div>
      )}

      {activePanel === 'rotate' && (
        <div className="fixed inset-x-0 bottom-16 bg-background border-t border-border p-3 z-40">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-xs">Поворот</h3>
            <Button variant="ghost" size="sm" onClick={() => setActivePanel(null)}>
              <Icon name="X" size={14} />
            </Button>
          </div>
          
          <div className="slider-wrapper-mobile">
            <div className="text-2xl font-bold text-center mb-2">
              {selectedEl.rotation || 0}°
            </div>
            <div className="track-mobile">
              <input 
                type="range" 
                min="-180" 
                max="180" 
                value={selectedEl.rotation || 0}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  updateElement(selectedEl.id, { rotation: value });
                  setRotationInput(value.toString());
                }}
                className="rotation-slider-mobile"
              />
              <div 
                className="ticks-mobile"
                style={{
                  transform: `translateX(calc(-50% - ${(selectedEl.rotation || 0) * 1.333}px))`
                }}
              >
                {Array.from({ length: 361 }, (_, i) => {
                  const degree = i - 180;
                  const isBig = degree % 45 === 0;
                  return (
                    <div 
                      key={i} 
                      className={`tick-mobile ${isBig ? 'big' : ''}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {isImageElement && activePanel === 'imageSize' && (
        <div className="fixed inset-x-0 bottom-16 bg-background border-t border-border p-3 z-40">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-xs">Размер изображения</h3>
            <Button variant="ghost" size="sm" onClick={() => setActivePanel(null)}>
              <Icon name="X" size={14} />
            </Button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Ширина: {selectedEl.width}px</label>
              <input
                type="range"
                min="50"
                max="400"
                value={selectedEl.width}
                onChange={(e) => {
                  const newWidth = parseInt(e.target.value);
                  const aspectRatio = selectedEl.height / selectedEl.width;
                  updateElement(selectedEl.id, { 
                    width: newWidth,
                    height: Math.round(newWidth * aspectRatio)
                  });
                }}
                className="w-full mt-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Нижняя панель инструментов */}
      <div className="fixed inset-x-0 bottom-0 bg-background border-t border-border p-1.5 z-50 md:hidden">
        <div className="flex items-center justify-around gap-1">
          {isTextElement && (
            <>
              <button
                onClick={() => togglePanel('fonts')}
                className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-colors ${
                  activePanel === 'fonts' ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
                }`}
              >
                <Icon name="Type" size={18} />
                <span className="text-[10px]">Шрифт</span>
              </button>

              <button
                onClick={() => togglePanel('size')}
                className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-colors ${
                  activePanel === 'size' ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
                }`}
              >
                <span className="text-base font-bold">Aa</span>
                <span className="text-[10px]">Размер</span>
              </button>

              <button
                onClick={() => togglePanel('color')}
                className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-colors ${
                  activePanel === 'color' ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
                }`}
              >
                <div className="w-5 h-5 rounded-full border-2 border-current" style={{ backgroundColor: selectedEl.color || '#FFFFFF' }} />
                <span className="text-[10px]">Цвет</span>
              </button>

              <button
                onClick={() => togglePanel('align')}
                className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-colors ${
                  activePanel === 'align' ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
                }`}
              >
                <Icon name="AlignCenter" size={18} />
                <span className="text-[10px]">Выравн.</span>
              </button>
            </>
          )}

          {isImageElement && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🖱️🖱️🖱️ КЛИК НА ЛАСТИК!!! 🖱️🖱️🖱️');
                  console.log('selectedEl:', selectedEl);
                  console.log('selectedEl.id:', selectedEl.id);
                  console.log('selectedEl.src:', selectedEl.src);
                  console.log('onEditImage функция:', typeof onEditImage);
                  if (onEditImage) {
                    console.log('✅ Вызываем onEditImage с ID:', selectedEl.id);
                    onEditImage(selectedEl.id);
                  } else {
                    console.error('❌ onEditImage отсутствует!');
                  }
                }}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-colors hover:bg-primary/10 hover:text-primary bg-red-500"
              >
                <Icon name="Eraser" size={18} />
                <span className="text-[10px]">Ластик</span>
              </button>

              <button
                onClick={() => updateElement(selectedEl.id, { flipHorizontal: !selectedEl.flipHorizontal })}
                className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-colors ${
                  selectedEl.flipHorizontal ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
                }`}
              >
                <Icon name="FlipHorizontal" size={18} />
                <span className="text-[10px]">Отзеркалить</span>
              </button>

              <button
                onClick={() => togglePanel('imageSize')}
                className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-colors ${
                  activePanel === 'imageSize' ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
                }`}
              >
                <Icon name="Maximize2" size={18} />
                <span className="text-[10px]">Размер</span>
              </button>
            </>
          )}

          <button
            onClick={() => togglePanel('rotate')}
            className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-colors ${
              activePanel === 'rotate' ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
            }`}
          >
            <Icon name="RotateCw" size={18} />
            <span className="text-[10px]">Поворот</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Удалить этот элемент?')) {
                deleteElement(selectedEl.id);
                setActivePanel(null);
              }
            }}
            className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Icon name="Trash2" size={18} />
            <span className="text-[10px]">Удалить</span>
          </button>
        </div>
      </div>
    </>
  );
};
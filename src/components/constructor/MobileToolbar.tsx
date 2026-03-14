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
  onAddText?: () => void;
  onAddImage?: () => void;
  onDelete?: () => void;
  onRotateToggle?: () => void;
  rotateMode?: boolean;
  hasSelection?: boolean;
  onOpenEraser?: () => void;
  canErase?: boolean;
  selectedEl?: CanvasElement | undefined;
  updateElement?: (id: string, updates: Partial<CanvasElement>) => Promise<void>;
  deleteElement?: (id: string) => void;
  fonts?: Array<{id: string, name: string, style: string, weight: string, example: string, fullStyle: string}>;
}

export const MobileToolbar = ({
  onAddText,
  onAddImage,
  onDelete,
  onRotateToggle,
  rotateMode,
  hasSelection,
  onOpenEraser,
  canErase,
  selectedEl,
  updateElement,
  deleteElement,
  fonts,
}: MobileToolbarProps) => {
  const [activePanel, setActivePanel] = useState<'fonts' | 'size' | 'color' | 'align' | 'rotate' | 'imageSize' | null>(null);
  const [rotationInput, setRotationInput] = useState<string>('');

  if (!selectedEl || window.innerWidth >= 1024) {
    return null;
  }

  const isTextElement = ['text', 'epitaph', 'fio', 'dates'].includes(selectedEl.type);
  const isImageElement = ['image', 'cross', 'flower', 'photo'].includes(selectedEl.type);

  const togglePanel = (panel: 'fonts' | 'size' | 'color' | 'align' | 'rotate' | 'imageSize') => {
    if (panel === 'rotate' && activePanel !== 'rotate') {
      setRotationInput((selectedEl.rotation || 0).toString());
    }
    setActivePanel(activePanel === panel ? null : panel);
  };

  const handleRotationInputChange = (value: string) => {
    setRotationInput(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && selectedEl && updateElement) {
      const clampedValue = Math.max(-180, Math.min(180, numValue));
      updateElement(selectedEl.id, { rotation: clampedValue });
    }
  };

  const handleRotationInputBlur = () => {
    const numValue = parseInt(rotationInput);
    if (isNaN(numValue)) {
      setRotationInput((selectedEl?.rotation || 0).toString());
    } else if (selectedEl && updateElement) {
      const clampedValue = Math.max(-180, Math.min(180, numValue));
      setRotationInput(clampedValue.toString());
      updateElement(selectedEl.id, { rotation: clampedValue });
    }
  };

  return (
    <>
      {/* Выдвижные панели */}
      {isTextElement && activePanel === 'fonts' && (
        <div className="fixed inset-x-0 bottom-10 bg-black/40 backdrop-blur-sm border-t border-white/10 px-3 py-2 z-40 max-h-52 overflow-y-auto">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-white/60">Шрифт</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setActivePanel(null)}>
              <Icon name="X" size={12} />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {fonts.map((font) => (
              <button
                key={font.id}
                onClick={() => {
                  if (selectedEl && updateElement) {
                    updateElement(selectedEl.id, { fontFamily: font.fullStyle });
                  }
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
        <div className="fixed inset-x-0 bottom-10 bg-black/40 backdrop-blur-sm border-t border-white/10 px-3 py-2 z-40 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/60">Размер текста: {selectedEl.fontSize}px</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setActivePanel(null)}>
              <Icon name="X" size={12} />
            </Button>
          </div>
          <input
            type="range"
            min="8"
            max="30"
            value={selectedEl?.fontSize || 24}
            onChange={(e) => {
              if (selectedEl && updateElement) {
                updateElement(selectedEl.id, { fontSize: parseInt(e.target.value) });
              }
            }}
            className="w-full mb-2"
          />
          
          <div className="border-t border-white/10 pt-2 mt-1">
            <span className="text-xs text-white/60">Межстрочное: {selectedEl.lineHeight || 1.2}</span>
            <input
              type="range"
              min="0.4"
              max="3"
              step="0.1"
              value={selectedEl?.lineHeight || 1.2}
              onChange={(e) => {
                if (selectedEl && updateElement) {
                  updateElement(selectedEl.id, { lineHeight: parseFloat(e.target.value) });
                }
              }}
              className="w-full mt-1"
            />
          </div>
        </div>
      )}

      {isTextElement && activePanel === 'color' && (
        <div className="fixed inset-x-0 bottom-10 bg-black/40 backdrop-blur-sm border-t border-white/10 px-3 py-2 z-40">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-white/60">Цвет текста</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setActivePanel(null)}>
              <Icon name="X" size={12} />
            </Button>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {['#FFFFFF', '#000000', '#FFD700', '#C0C0C0', '#8B4513', '#4A4A4A'].map(color => (
              <button
                key={color}
                onClick={() => {
                  if (selectedEl && updateElement) {
                    updateElement(selectedEl.id, { color });
                    setActivePanel(null);
                  }
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
            value={selectedEl?.color || '#FFFFFF'}
            onChange={(e) => {
              if (selectedEl && updateElement) {
                updateElement(selectedEl.id, { color: e.target.value });
              }
            }}
            className="w-full h-8 mt-2 rounded border"
          />
        </div>
      )}

      {isTextElement && activePanel === 'align' && (
        <div className="fixed inset-x-0 bottom-10 bg-black/40 backdrop-blur-sm border-t border-white/10 px-3 py-2 z-40">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-white/60">Выравнивание</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setActivePanel(null)}>
              <Icon name="X" size={12} />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedEl?.textAlign === 'left' ? 'default' : 'outline'}
              onClick={() => {
                if (selectedEl && updateElement) {
                  updateElement(selectedEl.id, { textAlign: 'left' });
                  setActivePanel(null);
                }
              }}
              className="flex-1 h-8"
            >
              <Icon name="AlignLeft" size={16} />
            </Button>
            <Button
              variant={selectedEl?.textAlign === 'center' || !selectedEl?.textAlign ? 'default' : 'outline'}
              onClick={() => {
                if (selectedEl && updateElement) {
                  updateElement(selectedEl.id, { textAlign: 'center' });
                  setActivePanel(null);
                }
              }}
              className="flex-1 h-8"
            >
              <Icon name="AlignCenter" size={16} />
            </Button>
            <Button
              variant={selectedEl?.textAlign === 'right' ? 'default' : 'outline'}
              onClick={() => {
                if (selectedEl && updateElement) {
                  updateElement(selectedEl.id, { textAlign: 'right' });
                  setActivePanel(null);
                }
              }}
              className="flex-1 h-8"
            >
              <Icon name="AlignRight" size={16} />
            </Button>
          </div>
        </div>
      )}

      {activePanel === 'rotate' && (
        <div className="fixed inset-x-0 bottom-10 bg-black/40 backdrop-blur-sm border-t border-white/10 px-3 py-2 z-40">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-white/60">Поворот</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">{selectedEl.rotation || 0}°</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setActivePanel(null)}>
                <Icon name="X" size={12} />
              </Button>
            </div>
          </div>
          
          <div className="slider-wrapper-mobile">
            <div className="track-mobile">
              <input 
                type="range" 
                min="-180" 
                max="180" 
                value={selectedEl?.rotation || 0}
                onChange={(e) => {
                  if (selectedEl && updateElement) {
                    const value = parseInt(e.target.value);
                    updateElement(selectedEl.id, { rotation: value });
                    setRotationInput(value.toString());
                  }
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
        <div className="fixed inset-x-0 bottom-10 bg-black/40 backdrop-blur-sm border-t border-white/10 px-3 py-2 z-40">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-white/60">Размер изображения</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setActivePanel(null)}>
              <Icon name="X" size={12} />
            </Button>
          </div>
          
          <div className="space-y-2">
            <div>
              <label className="text-xs text-muted-foreground">Ширина: {selectedEl?.width || 100}px</label>
              <input
                type="range"
                min="50"
                max="400"
                value={selectedEl?.width || 100}
                onChange={(e) => {
                  if (selectedEl && updateElement) {
                    const newWidth = parseInt(e.target.value);
                    const aspectRatio = selectedEl.height / selectedEl.width;
                    updateElement(selectedEl.id, { 
                      width: newWidth,
                      height: Math.round(newWidth * aspectRatio)
                    });
                  }
                }}
                className="w-full mt-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Нижняя панель инструментов */}
      <div className="fixed inset-x-0 bottom-0 bg-black/30 backdrop-blur-sm border-t border-white/10 px-2 py-0.5 z-50 lg:hidden">
        <div className="flex items-center justify-around gap-0.5">
          {isTextElement && (
            <>
              <button
                onClick={() => togglePanel('fonts')}
                className={`flex flex-col items-center gap-0 px-2 py-1 rounded-lg transition-colors ${
                  activePanel === 'fonts' ? 'text-primary' : 'text-white/70'
                }`}
              >
                <Icon name="Type" size={16} />
                <span className="text-[9px]">Шрифт</span>
              </button>

              <button
                onClick={() => togglePanel('size')}
                className={`flex flex-col items-center gap-0 px-2 py-1 rounded-lg transition-colors ${
                  activePanel === 'size' ? 'text-primary' : 'text-white/70'
                }`}
              >
                <span className="text-sm font-bold leading-4">Aa</span>
                <span className="text-[9px]">Размер</span>
              </button>

              <button
                onClick={() => togglePanel('color')}
                className={`flex flex-col items-center gap-0 px-2 py-1 rounded-lg transition-colors ${
                  activePanel === 'color' ? 'text-primary' : 'text-white/70'
                }`}
              >
                <div className="w-4 h-4 rounded-full border-2 border-current" style={{ backgroundColor: selectedEl.color || '#FFFFFF' }} />
                <span className="text-[9px]">Цвет</span>
              </button>

              <button
                onClick={() => togglePanel('align')}
                className={`flex flex-col items-center gap-0 px-2 py-1 rounded-lg transition-colors ${
                  activePanel === 'align' ? 'text-primary' : 'text-white/70'
                }`}
              >
                <Icon name="AlignCenter" size={16} />
                <span className="text-[9px]">Выравн.</span>
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
                  console.log('selectedEl?.id:', selectedEl?.id);
                  console.log('selectedEl?.src:', selectedEl?.src);
                  console.log('onOpenEraser функция:', typeof onOpenEraser);
                  if (onOpenEraser) {
                    console.log('✅ Вызываем onOpenEraser');
                    onOpenEraser();
                  } else {
                    console.error('❌ onOpenEraser отсутствует!');
                  }
                }}
                className="flex flex-col items-center gap-0 px-2 py-1 rounded-lg transition-colors text-red-400"
              >
                <Icon name="Eraser" size={16} />
                <span className="text-[9px]">Ластик</span>
              </button>

              <button
                onClick={() => updateElement?.(selectedEl.id, { flipHorizontal: !selectedEl.flipHorizontal })}
                className={`flex flex-col items-center gap-0 px-2 py-1 rounded-lg transition-colors ${
                  selectedEl.flipHorizontal ? 'text-primary' : 'text-white/70'
                }`}
              >
                <Icon name="FlipHorizontal" size={16} />
                <span className="text-[9px]">Зеркало</span>
              </button>

              <button
                onClick={() => togglePanel('imageSize')}
                className={`flex flex-col items-center gap-0 px-2 py-1 rounded-lg transition-colors ${
                  activePanel === 'imageSize' ? 'text-primary' : 'text-white/70'
                }`}
              >
                <Icon name="Maximize2" size={16} />
                <span className="text-[9px]">Размер</span>
              </button>
            </>
          )}

          <button
            onClick={() => togglePanel('rotate')}
            className={`flex flex-col items-center gap-0 px-2 py-1 rounded-lg transition-colors ${
              activePanel === 'rotate' ? 'text-primary' : 'text-white/70'
            }`}
          >
            <Icon name="RotateCw" size={16} />
            <span className="text-[9px]">Поворот</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Удалить этот элемент?')) {
                deleteElement(selectedEl.id);
                setActivePanel(null);
              }
            }}
            className="flex flex-col items-center gap-0 px-2 py-1 rounded-lg transition-colors text-white/70 hover:text-red-400"
          >
            <Icon name="Trash2" size={16} />
            <span className="text-[9px]">Удалить</span>
          </button>
        </div>
      </div>
    </>
  );
};
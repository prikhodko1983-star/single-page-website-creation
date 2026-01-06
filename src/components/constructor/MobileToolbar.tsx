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
  fonts: Array<{id: string, name: string, style: string, weight: string, example: string, fullStyle: string}>;
}

export const MobileToolbar = ({
  selectedEl,
  updateElement,
  fonts,
}: MobileToolbarProps) => {
  const [activePanel, setActivePanel] = useState<'fonts' | 'size' | 'color' | 'align' | 'rotate' | null>(null);
  const [rotationInput, setRotationInput] = useState<string>('');

  if (!selectedEl || !['text', 'epitaph', 'fio', 'dates'].includes(selectedEl.type)) {
    return null;
  }

  const togglePanel = (panel: 'fonts' | 'size' | 'color' | 'align' | 'rotate') => {
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
      {activePanel === 'fonts' && (
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

      {activePanel === 'size' && (
        <div className="fixed inset-x-0 bottom-16 bg-background border-t border-border p-3 z-40 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-xs">Размер текста: {selectedEl.fontSize}px</h3>
            <Button variant="ghost" size="sm" onClick={() => setActivePanel(null)}>
              <Icon name="X" size={14} />
            </Button>
          </div>
          <input
            type="range"
            min="12"
            max="72"
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

      {activePanel === 'color' && (
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

      {activePanel === 'align' && (
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
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-xs">Поворот: {selectedEl.rotation || 0}°</h3>
            <Button variant="ghost" size="sm" onClick={() => setActivePanel(null)}>
              <Icon name="X" size={14} />
            </Button>
          </div>
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
            className="w-full mb-2"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="-180"
              max="180"
              value={rotationInput}
              onChange={(e) => handleRotationInputChange(e.target.value)}
              onBlur={handleRotationInputBlur}
              className="flex-1 h-8 px-2 rounded border border-border bg-background text-center text-sm"
              placeholder="Угол"
            />
            <span className="text-xs text-muted-foreground">град</span>
          </div>
        </div>
      )}

      {/* Нижняя панель инструментов */}
      <div className="fixed inset-x-0 bottom-0 bg-background border-t border-border p-1.5 z-50 md:hidden">
        <div className="flex items-center justify-around gap-1">
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

          <button
            onClick={() => togglePanel('rotate')}
            className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-colors ${
              activePanel === 'rotate' ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
            }`}
          >
            <Icon name="RotateCw" size={18} />
            <span className="text-[10px]">Поворот</span>
          </button>
        </div>
      </div>
    </>
  );
};
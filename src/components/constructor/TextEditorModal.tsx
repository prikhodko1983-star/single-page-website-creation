import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { useEffect, useCallback } from "react";

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
  autoSize?: boolean;
  italic?: boolean;
}

interface FontOption {
  id: string;
  name: string;
  style: string;
  weight: string;
  example: string;
  fullStyle: string;
}

interface TextEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingElement: CanvasElement | null;
  setEditingElement: (element: CanvasElement | null) => void;
  onApply: (updates: Partial<CanvasElement>) => void;
  fonts?: FontOption[];
}

export const TextEditorModal = ({
  isOpen,
  onClose,
  editingElement,
  setEditingElement,
  onApply,
  fonts = [],
}: TextEditorModalProps) => {
  // Блокировка скролла body при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      return () => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      };
    }
  }, [isOpen]);

  // Мемоизированные обработчики для избежания лишних рендеров
  const handleApply = useCallback(() => {
    if (!editingElement) return;
    onApply({
      content: editingElement.content,
      fontSize: editingElement.fontSize,
      color: editingElement.color,
      lineHeight: editingElement.lineHeight,
      letterSpacing: editingElement.letterSpacing,
      textAlign: editingElement.textAlign,
      italic: editingElement.italic,
      fontFamily: editingElement.fontFamily,
    });
  }, [editingElement, onApply]);

  const handleCancel = useCallback(() => {
    if (editingElement) {
      onApply({
        content: editingElement.content,
        fontSize: editingElement.fontSize,
        color: editingElement.color,
        lineHeight: editingElement.lineHeight,
        letterSpacing: editingElement.letterSpacing,
        textAlign: editingElement.textAlign,
        italic: editingElement.italic,
        fontFamily: editingElement.fontFamily,
      });
    }
    onClose();
    setEditingElement(null);
  }, [editingElement, onApply, onClose, setEditingElement]);

  if (!isOpen || !editingElement) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCancel();
      }}
    >
      <Card className="w-full max-w-lg sm:my-4 rounded-b-none sm:rounded-b-lg flex flex-col" style={{ maxHeight: 'calc(100vh - 40px)' }}>
        <CardContent className="p-3 flex flex-col min-h-0 flex-1">
          {/* Шапка */}
          <div className="flex justify-between items-center pb-2 border-b mb-2 flex-shrink-0">
            <h2 className="text-base font-bold">Редактор текста</h2>
            <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground">
              <Icon name="X" size={20} />
            </button>
          </div>

          {/* Превью */}
          <div className="relative bg-black/90 rounded-lg border border-border p-2 min-h-[90px] mb-2 flex-shrink-0">
            <textarea
              autoFocus
              value={editingElement.content || ''}
              onChange={(e) => setEditingElement({ ...editingElement, content: e.target.value })}
              className="w-full min-h-[70px] resize-none bg-transparent border-none outline-none"
              placeholder="Введите текст..."
              style={{
                fontSize: `${Math.min(editingElement.fontSize || 24, 36)}px`,
                color: editingElement.color || '#FFFFFF',
                fontFamily: editingElement.fontFamily?.split('|')[0] || 'serif',
                fontWeight: editingElement.fontFamily?.split('|')[1] || '400',
                fontStyle: editingElement.italic ? 'italic' : 'normal',
                lineHeight: editingElement.lineHeight || 1.2,
                letterSpacing: editingElement.letterSpacing ? `${editingElement.letterSpacing}px` : 'normal',
                textAlign: editingElement.textAlign || 'center',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'keep-all',
                overflowWrap: 'normal',
                touchAction: 'manipulation',
              }}
            />
          </div>

          {/* Инструменты — скроллятся */}
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0">

            {/* Размер + Межстрочный + Межбуквенный в 2 колонки */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Размер: <span className="text-primary">{editingElement.fontSize || 24}px</span></Label>
                <input type="range" min="12" max="72" value={editingElement.fontSize || 24}
                  onChange={(e) => setEditingElement({ ...editingElement, fontSize: parseInt(e.target.value) })}
                  className="w-full h-1.5 mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Между строк: <span className="text-primary">{editingElement.lineHeight?.toFixed(1) || '1.2'}</span></Label>
                <input type="range" min="0.8" max="2.5" step="0.1" value={editingElement.lineHeight || 1.2}
                  onChange={(e) => setEditingElement({ ...editingElement, lineHeight: parseFloat(e.target.value) })}
                  className="w-full h-1.5 mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Между букв: <span className="text-primary">{editingElement.letterSpacing?.toFixed(1) || '0'}px</span></Label>
                <input type="range" min="-2" max="10" step="0.5" value={editingElement.letterSpacing || 0}
                  onChange={(e) => setEditingElement({ ...editingElement, letterSpacing: parseFloat(e.target.value) })}
                  className="w-full h-1.5 mt-1" />
              </div>
              <div className="flex flex-col justify-end">
                <Label className="text-xs text-muted-foreground mb-1">Курсив и выравнивание</Label>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingElement({ ...editingElement, italic: !editingElement.italic })}
                    className={`flex-1 h-7 rounded border text-xs flex items-center justify-center transition-all ${editingElement.italic ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}
                  >
                    <Icon name="Italic" size={13} />
                  </button>
                  {(['left', 'center', 'right'] as const).map((a) => (
                    <button key={a}
                      onClick={() => setEditingElement({ ...editingElement, textAlign: a })}
                      className={`flex-1 h-7 rounded border text-xs flex items-center justify-center transition-all ${(editingElement.textAlign || 'center') === a ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}
                    >
                      <Icon name={a === 'left' ? 'AlignLeft' : a === 'center' ? 'AlignCenter' : 'AlignRight'} size={13} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Цвет */}
            <div>
              <Label className="text-xs text-muted-foreground">Цвет текста</Label>
              <div className="flex gap-1.5 mt-1">
                {[{ name: 'Золото', value: '#C9A84C' }, { name: 'Серебро', value: '#C0C0C0' }, { name: 'Белый', value: '#FFFFFF' }].map((c) => (
                  <button key={c.value} title={c.name}
                    onClick={() => setEditingElement({ ...editingElement, color: c.value })}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${editingElement.color === c.value ? 'border-primary scale-110' : 'border-muted-foreground/30'}`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
                <input type="color" value={editingElement.color || '#FFFFFF'}
                  onChange={(e) => setEditingElement({ ...editingElement, color: e.target.value })}
                  className="w-8 h-8 rounded-lg border-2 cursor-pointer" title="Свой цвет" />
              </div>
            </div>

            {/* Шрифты */}
            {fonts.length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground">Шрифт</Label>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {fonts.map(font => (
                    <button key={font.id}
                      onClick={() => setEditingElement({ ...editingElement, fontFamily: font.fullStyle })}
                      className={`text-left px-2 py-1 rounded transition-all border ${editingElement.fontFamily === font.fullStyle ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'}`}
                    >
                      <div className="text-[9px] text-muted-foreground leading-tight truncate">{font.name}</div>
                      <div className="text-sm text-foreground truncate" style={{ fontFamily: font.style, fontWeight: font.weight }}>
                        {font.example}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Кнопки */}
          <div className="flex gap-2 pt-2 flex-shrink-0">
            <Button className="flex-1 h-10 font-semibold" onClick={handleApply}>
              <Icon name="Check" size={16} className="mr-1.5" />
              Применить
            </Button>
            <Button variant="outline" onClick={handleCancel} className="h-10 px-4">
              Отмена
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
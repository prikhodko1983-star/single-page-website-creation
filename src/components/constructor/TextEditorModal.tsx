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

interface TextEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingElement: CanvasElement | null;
  setEditingElement: (element: CanvasElement | null) => void;
  onApply: (updates: Partial<CanvasElement>) => void;
}

export const TextEditorModal = ({
  isOpen,
  onClose,
  editingElement,
  setEditingElement,
  onApply,
}: TextEditorModalProps) => {
  // Блокировка скролла body при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
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
    });
  }, [editingElement, onApply]);

  const handleCancel = useCallback(() => {
    // Автоматически применяем изменения перед закрытием
    if (editingElement) {
      onApply({
        content: editingElement.content,
        fontSize: editingElement.fontSize,
        color: editingElement.color,
        lineHeight: editingElement.lineHeight,
        letterSpacing: editingElement.letterSpacing,
        textAlign: editingElement.textAlign,
        italic: editingElement.italic,
      });
    }
    onClose();
    setEditingElement(null);
  }, [editingElement, onApply, onClose, setEditingElement]);

  if (!isOpen || !editingElement) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCancel();
      }}
    >
      <Card className="w-full max-w-3xl my-auto">
        <CardContent className="p-3 sm:p-4 max-h-[90vh] overflow-y-auto overscroll-contain">
          <div className="flex justify-between items-center mb-4 sm:mb-6 sticky top-0 bg-card z-10 -mx-3 sm:-mx-4 px-3 sm:px-4 pb-3 border-b">
            <h2 className="text-lg sm:text-xl font-bold">Редактор текста</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-10 w-10"
            >
              <Icon name="X" size={24} />
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="relative bg-black/90 rounded-lg border-2 border-border p-3 sm:p-4 min-h-[200px] sm:min-h-[280px]">
                <textarea
                  autoFocus
                  value={editingElement.content || ''}
                  onChange={(e) => setEditingElement({ ...editingElement, content: e.target.value })}
                  className="w-full h-full min-h-[170px] sm:min-h-[250px] resize-none bg-transparent border-none outline-none"
                  placeholder="Введите текст..."
                  style={{
                    fontSize: `${editingElement.fontSize || 24}px`,
                    color: editingElement.color || '#FFFFFF',
                    fontFamily: editingElement.fontFamily?.split('|')[0] || 'serif',
                    fontWeight: editingElement.fontFamily?.split('|')[1] || '400',
                    fontStyle: editingElement.italic ? 'italic' : 'normal',
                    lineHeight: editingElement.lineHeight || 1.2,
                    letterSpacing: editingElement.letterSpacing ? `${editingElement.letterSpacing}px` : 'normal',
                    textAlign: editingElement.textAlign || 'center',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    touchAction: 'manipulation',
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-4 pb-4">
            
              <div>
                <Label className="text-sm sm:text-base font-semibold">Размер шрифта: <span className="text-primary">{editingElement.fontSize || 24}px</span></Label>
                <div className="flex gap-2 items-center mt-2">
                  <input
                    type="range"
                    min="12"
                    max="72"
                    value={editingElement.fontSize || 24}
                    onChange={(e) => setEditingElement({ ...editingElement, fontSize: parseInt(e.target.value) })}
                    className="flex-1 h-2"
                  />
                  <Input
                    type="number"
                    min="12"
                    max="120"
                    value={editingElement.fontSize || 24}
                    onChange={(e) => setEditingElement({ ...editingElement, fontSize: parseInt(e.target.value) || 24 })}
                    className="w-16 sm:w-20 text-center text-base sm:text-lg font-semibold"
                  />
                </div>
              </div>
            
              <div>
                <Label className="text-sm sm:text-base font-semibold">Цвет текста</Label>
                <div className="mt-2">
                  <input
                    type="color"
                    value={editingElement.color || '#FFFFFF'}
                    onChange={(e) => setEditingElement({ ...editingElement, color: e.target.value })}
                    className="w-full h-10 sm:h-12 rounded-lg border-2 cursor-pointer"
                  />
                </div>
              </div>
            
              <div>
                <Label className="text-sm sm:text-base font-semibold">Между строк: <span className="text-primary">{editingElement.lineHeight?.toFixed(1) || '1.2'}</span></Label>
                <input
                  type="range"
                  min="0.8"
                  max="2.5"
                  step="0.1"
                  value={editingElement.lineHeight || 1.2}
                  onChange={(e) => setEditingElement({ ...editingElement, lineHeight: parseFloat(e.target.value) })}
                  className="w-full mt-2 h-2"
                />
              </div>
            
              <div>
                <Label className="text-sm sm:text-base font-semibold">Между букв: <span className="text-primary">{editingElement.letterSpacing?.toFixed(1) || '0'}px</span></Label>
                <input
                  type="range"
                  min="-2"
                  max="10"
                  step="0.5"
                  value={editingElement.letterSpacing || 0}
                  onChange={(e) => setEditingElement({ ...editingElement, letterSpacing: parseFloat(e.target.value) })}
                  className="w-full mt-2 h-2"
                />
              </div>
            
              <div>
                <Label className="text-sm sm:text-base font-semibold">Курсив</Label>
                <Button
                  variant={editingElement.italic ? "default" : "outline"}
                  onClick={() => setEditingElement({ ...editingElement, italic: !editingElement.italic })}
                  className="w-full mt-2 h-10 sm:h-12 font-italic"
                >
                  <Icon name={editingElement.italic ? "Check" : "Italic"} size={18} className="mr-2" />
                  {editingElement.italic ? 'Включен' : 'Выключен'}
                </Button>
              </div>
            
              <div>
                <Label className="text-sm sm:text-base font-semibold">Выравнивание</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={editingElement.textAlign === 'left' ? 'default' : 'outline'}
                    onClick={() => setEditingElement({ ...editingElement, textAlign: 'left' })}
                    className="flex-1 h-10 sm:h-12"
                  >
                    <Icon name="AlignLeft" size={18} />
                  </Button>
                  <Button
                    variant={editingElement.textAlign === 'center' || !editingElement.textAlign ? 'default' : 'outline'}
                    onClick={() => setEditingElement({ ...editingElement, textAlign: 'center' })}
                    className="flex-1 h-10 sm:h-12"
                  >
                    <Icon name="AlignCenter" size={18} />
                  </Button>
                  <Button
                    variant={editingElement.textAlign === 'right' ? 'default' : 'outline'}
                    onClick={() => setEditingElement({ ...editingElement, textAlign: 'right' })}
                    className="flex-1 h-10 sm:h-12"
                  >
                    <Icon name="AlignRight" size={18} />
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4 pb-2">
                <Button
                  className="flex-1 h-12 sm:h-14 text-base sm:text-lg font-semibold"
                  onClick={handleApply}
                >
                  <Icon name="Check" size={20} className="mr-2" />
                  Применить
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="h-12 sm:h-14 px-4 sm:px-6 text-base sm:text-lg"
                >
                  Отмена
                </Button>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};
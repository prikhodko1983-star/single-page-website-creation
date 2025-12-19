import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  autoSize?: boolean;
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
  if (!isOpen || !editingElement) return null;

  const handleApply = () => {
    onApply({
      content: editingElement.content,
      fontSize: editingElement.fontSize,
      color: editingElement.color,
      lineHeight: editingElement.lineHeight,
      letterSpacing: editingElement.letterSpacing,
      textAlign: editingElement.textAlign,
    });
    onClose();
    setEditingElement(null);
  };

  const handleCancel = () => {
    onClose();
    setEditingElement(null);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <Card className="w-full max-w-3xl my-auto">
        <CardContent className="p-3 sm:p-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4 sm:mb-6 sticky top-0 bg-card z-10 -mx-3 sm:-mx-4 px-3 sm:px-4 pb-3 border-b">
            <h2 className="text-lg sm:text-xl font-bold">Редактор текста</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-10 w-10"
            >
              <Icon name="X" size={24} />
            </Button>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-5 sm:space-y-6 pb-4">
              <div>
                <Label className="text-base font-semibold">Текст</Label>
                <textarea
                  autoFocus
                  value={editingElement.content || ''}
                  onChange={(e) => setEditingElement({ ...editingElement, content: e.target.value })}
                  className="w-full min-h-40 p-4 mt-2 rounded-lg border-2 bg-background text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Введите текст..."
                  style={{
                    fontFamily: editingElement.fontFamily?.split('|')[0] || 'inherit',
                    fontWeight: editingElement.fontFamily?.split('|')[1] || '400',
                    fontSize: '16px',
                    touchAction: 'manipulation',
                  }}
                />
              </div>
            
              <div>
                <Label className="text-base font-semibold">Размер шрифта: <span className="text-primary">{editingElement.fontSize || 24}px</span></Label>
                <div className="flex gap-3 items-center mt-3">
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
                    className="w-20 text-center text-lg font-semibold"
                  />
                </div>
              </div>
            
              <div>
                <Label className="text-base font-semibold">Цвет текста</Label>
                <div className="mt-3">
                  <input
                    type="color"
                    value={editingElement.color || '#FFFFFF'}
                    onChange={(e) => setEditingElement({ ...editingElement, color: e.target.value })}
                    className="w-full h-14 rounded-lg border-2 cursor-pointer"
                  />
                </div>
              </div>
            
              <div>
                <Label className="text-base font-semibold">Между строк: <span className="text-primary">{editingElement.lineHeight?.toFixed(1) || '1.2'}</span></Label>
                <input
                  type="range"
                  min="0.8"
                  max="2.5"
                  step="0.1"
                  value={editingElement.lineHeight || 1.2}
                  onChange={(e) => setEditingElement({ ...editingElement, lineHeight: parseFloat(e.target.value) })}
                  className="w-full mt-3 h-2"
                />
              </div>
            
              <div>
                <Label className="text-base font-semibold">Между букв: <span className="text-primary">{editingElement.letterSpacing?.toFixed(1) || '0'}px</span></Label>
                <input
                  type="range"
                  min="-2"
                  max="10"
                  step="0.5"
                  value={editingElement.letterSpacing || 0}
                  onChange={(e) => setEditingElement({ ...editingElement, letterSpacing: parseFloat(e.target.value) })}
                  className="w-full mt-3 h-2"
                />
              </div>
            
              <div>
                <Label className="text-base font-semibold">Выравнивание</Label>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant={editingElement.textAlign === 'left' ? 'default' : 'outline'}
                    onClick={() => setEditingElement({ ...editingElement, textAlign: 'left' })}
                    className="flex-1 h-12"
                  >
                    <Icon name="AlignLeft" size={20} />
                  </Button>
                  <Button
                    variant={editingElement.textAlign === 'center' || !editingElement.textAlign ? 'default' : 'outline'}
                    onClick={() => setEditingElement({ ...editingElement, textAlign: 'center' })}
                    className="flex-1 h-12"
                  >
                    <Icon name="AlignCenter" size={20} />
                  </Button>
                  <Button
                    variant={editingElement.textAlign === 'right' ? 'default' : 'outline'}
                    onClick={() => setEditingElement({ ...editingElement, textAlign: 'right' })}
                    className="flex-1 h-12"
                  >
                    <Icon name="AlignRight" size={20} />
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-3 pt-6 pb-2">
                <Button
                  className="flex-1 h-14 text-lg font-semibold"
                  onClick={handleApply}
                >
                  <Icon name="Check" size={22} className="mr-2" />
                  Применить
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="h-14 px-6 text-lg"
                >
                  Отмена
                </Button>
              </div>
            </div>
            
            <div className="hidden lg:block lg:sticky lg:top-0">
              <Label className="mb-2 block">Предпросмотр</Label>
              <div className="relative aspect-[3/4] bg-secondary rounded-lg overflow-hidden border-2 border-border flex items-center justify-center p-4">
                <div 
                  className="w-full flex items-center justify-center"
                  style={{
                    transform: `rotate(${editingElement.rotation || 0}deg)`,
                  }}
                >
                  <div
                    className="max-w-full"
                    style={{
                      fontSize: `${editingElement.fontSize}px`,
                      color: editingElement.color || '#FFFFFF',
                      fontFamily: editingElement.fontFamily?.split('|')[0] || 'serif',
                      fontWeight: editingElement.fontFamily?.split('|')[1] || '400',
                      lineHeight: editingElement.lineHeight || 1.2,
                      letterSpacing: editingElement.letterSpacing ? `${editingElement.letterSpacing}px` : 'normal',
                      textAlign: editingElement.textAlign || 'center',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {editingElement.content || 'Введите текст...'}
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Предпросмотр показывает текст с текущими настройками.
              </p>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};
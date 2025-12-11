import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Редактор текста</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <Icon name="X" size={20} />
            </Button>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Текст</Label>
                <textarea
                  value={editingElement.content || ''}
                  onChange={(e) => setEditingElement({ ...editingElement, content: e.target.value })}
                  className="w-full min-h-32 p-3 mt-2 rounded border bg-background text-foreground"
                  placeholder="Введите текст..."
                  style={{
                    fontFamily: editingElement.fontFamily?.split('|')[0] || 'inherit',
                    fontWeight: editingElement.fontFamily?.split('|')[1] || '400',
                    fontSize: '16px',
                  }}
                />
              </div>
            
              <div>
                <Label>Размер шрифта: {editingElement.fontSize}px</Label>
                <input
                  type="range"
                  min="12"
                  max="72"
                  value={editingElement.fontSize || 24}
                  onChange={(e) => setEditingElement({ ...editingElement, fontSize: parseInt(e.target.value) })}
                  className="w-full mt-2"
                />
              </div>
            
              <div>
                <Label>Цвет текста</Label>
                <div className="mt-2">
                  <input
                    type="color"
                    value={editingElement.color || '#FFFFFF'}
                    onChange={(e) => setEditingElement({ ...editingElement, color: e.target.value })}
                    className="w-12 h-12 rounded border cursor-pointer"
                  />
                </div>
              </div>
            
              <div>
                <Label>Межстрочное расстояние: {editingElement.lineHeight?.toFixed(1) || '1.2'}</Label>
                <input
                  type="range"
                  min="0.8"
                  max="2.5"
                  step="0.1"
                  value={editingElement.lineHeight || 1.2}
                  onChange={(e) => setEditingElement({ ...editingElement, lineHeight: parseFloat(e.target.value) })}
                  className="w-full mt-2"
                />
              </div>
            
              <div>
                <Label>Межбуквенное расстояние: {editingElement.letterSpacing?.toFixed(1) || '0'}px</Label>
                <input
                  type="range"
                  min="-2"
                  max="10"
                  step="0.5"
                  value={editingElement.letterSpacing || 0}
                  onChange={(e) => setEditingElement({ ...editingElement, letterSpacing: parseFloat(e.target.value) })}
                  className="w-full mt-2"
                />
              </div>
            
              <div>
                <Label>Выравнивание текста</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={editingElement.textAlign === 'left' ? 'default' : 'outline'}
                    onClick={() => setEditingElement({ ...editingElement, textAlign: 'left' })}
                    size="sm"
                  >
                    <Icon name="AlignLeft" size={16} />
                  </Button>
                  <Button
                    variant={editingElement.textAlign === 'center' || !editingElement.textAlign ? 'default' : 'outline'}
                    onClick={() => setEditingElement({ ...editingElement, textAlign: 'center' })}
                    size="sm"
                  >
                    <Icon name="AlignCenter" size={16} />
                  </Button>
                  <Button
                    variant={editingElement.textAlign === 'right' ? 'default' : 'outline'}
                    onClick={() => setEditingElement({ ...editingElement, textAlign: 'right' })}
                    size="sm"
                  >
                    <Icon name="AlignRight" size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1"
                  onClick={handleApply}
                >
                  <Icon name="Check" size={18} className="mr-2" />
                  Применить
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                >
                  Отмена
                </Button>
              </div>
            </div>
            
            <div className="lg:sticky lg:top-0">
              <Label className="mb-2 block">Предпросмотр</Label>
              <div className="relative aspect-[3/4] bg-secondary rounded-lg overflow-hidden border-2 border-border">
                <div 
                  className="absolute inset-0 flex items-center whitespace-pre-line p-4"
                  style={{
                    fontSize: `${editingElement.fontSize}px`,
                    color: editingElement.color || '#FFFFFF',
                    fontFamily: editingElement.fontFamily?.split('|')[0] || 'serif',
                    fontWeight: editingElement.fontFamily?.split('|')[1] || '400',
                    lineHeight: editingElement.lineHeight || 1.2,
                    letterSpacing: editingElement.letterSpacing ? `${editingElement.letterSpacing}px` : 'normal',
                    textAlign: editingElement.textAlign || 'center',
                    justifyContent: editingElement.textAlign === 'left' ? 'flex-start' : editingElement.textAlign === 'right' ? 'flex-end' : 'center',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  }}
                >
                  {editingElement.content || 'Введите текст...'}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Все изменения видны в реальном времени
              </p>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};
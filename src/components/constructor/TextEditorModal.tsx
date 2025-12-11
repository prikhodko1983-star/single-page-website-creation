import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { useState, useRef } from "react";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [selectedFontSize, setSelectedFontSize] = useState(24);
  
  if (!isOpen || !editingElement) return null;

  const handleTextSelect = () => {
    if (textareaRef.current) {
      setSelectionStart(textareaRef.current.selectionStart);
      setSelectionEnd(textareaRef.current.selectionEnd);
    }
  };

  const applyFontSizeToSelection = () => {
    if (!textareaRef.current || selectionStart === selectionEnd) return;
    
    const text = editingElement.content || '';
    const before = text.substring(0, selectionStart);
    const selected = text.substring(selectionStart, selectionEnd);
    const after = text.substring(selectionEnd);
    
    const formatted = `${before}<span style="font-size:${selectedFontSize}px">${selected}</span>${after}`;
    setEditingElement({ ...editingElement, content: formatted });
  };

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
                  ref={textareaRef}
                  value={editingElement.content || ''}
                  onChange={(e) => setEditingElement({ ...editingElement, content: e.target.value })}
                  onSelect={handleTextSelect}
                  className="w-full min-h-32 p-3 mt-2 rounded border bg-background text-foreground"
                  placeholder="Введите текст..."
                  style={{
                    fontFamily: editingElement.fontFamily?.split('|')[0] || 'inherit',
                    fontWeight: editingElement.fontFamily?.split('|')[1] || '400',
                    fontSize: '16px',
                  }}
                />
                {selectionStart !== selectionEnd && (
                  <div className="mt-2 p-3 bg-primary/10 rounded border border-primary/30">
                    <Label className="text-xs mb-2 block">Форматирование выделенного текста</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        min="12"
                        max="120"
                        value={selectedFontSize}
                        onChange={(e) => setSelectedFontSize(parseInt(e.target.value) || 24)}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">px</span>
                      <Button
                        size="sm"
                        onClick={applyFontSizeToSelection}
                      >
                        <Icon name="Type" size={16} className="mr-1" />
                        Применить
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            
              <div>
                <Label>Размер шрифта (базовый)</Label>
                <div className="flex gap-2 items-center mt-2">
                  <input
                    type="range"
                    min="12"
                    max="72"
                    value={editingElement.fontSize || 24}
                    onChange={(e) => setEditingElement({ ...editingElement, fontSize: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min="12"
                    max="120"
                    value={editingElement.fontSize || 24}
                    onChange={(e) => setEditingElement({ ...editingElement, fontSize: parseInt(e.target.value) || 24 })}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">px</span>
                </div>
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
                  className="absolute inset-0 flex items-center p-4"
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
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                  }}
                  dangerouslySetInnerHTML={{ __html: editingElement.content || 'Введите текст...' }}
                />
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
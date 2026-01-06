import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  flipHorizontal?: boolean;
  autoSize?: boolean;
  italic?: boolean;
  initialScale?: number;
}

interface ConstructorPropertiesProps {
  selectedEl: CanvasElement | undefined;
  updateElement: (id: string, updates: Partial<CanvasElement>) => Promise<void>;
  deleteElement: (id: string) => void;
  fonts: Array<{id: string, name: string, style: string, weight: string, example: string, fullStyle: string}>;
}

export const ConstructorProperties = ({
  selectedEl,
  updateElement,
  deleteElement,
  fonts,
}: ConstructorPropertiesProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const lastRotationRef = useRef<number>(0);
  
  const handleRotationChange = (elementId: string, newRotation: number) => {
    if (Math.abs(newRotation - lastRotationRef.current) >= 1) {
      try {
        if (navigator.vibrate) {
          navigator.vibrate(20);
        }
      } catch (e) {
        console.log('Vibration not supported');
      }
      lastRotationRef.current = newRotation;
    }
    updateElement(elementId, { rotation: newRotation });
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="font-oswald font-bold text-lg mb-4">Свойства элемента</h2>
        
        {!selectedEl && (
          <p className="text-sm text-muted-foreground">Выберите элемент для редактирования</p>
        )}
        
        {selectedEl && (
          <div className="space-y-4">
            <div>
              <Label>Тип: {selectedEl.type === 'text' ? 'Текст' : selectedEl.type === 'epitaph' ? 'Эпитафия' : selectedEl.type === 'fio' ? 'ФИО' : selectedEl.type === 'dates' ? 'Даты' : selectedEl.type === 'photo' ? 'Фотография' : selectedEl.type === 'cross' ? 'Крест' : selectedEl.type === 'flower' ? 'Цветок' : 'Изображение'}</Label>
            </div>
            
            {(selectedEl.type === 'text' || selectedEl.type === 'epitaph' || selectedEl.type === 'fio' || selectedEl.type === 'dates') && (
              <>
                <div>
                  <Label>Текст</Label>
                  <Input 
                    value={selectedEl.content || ''} 
                    onChange={(e) => updateElement(selectedEl.id, { content: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Размер шрифта: {selectedEl.fontSize}px</Label>
                  <input 
                    type="range" 
                    min="12" 
                    max="72" 
                    value={selectedEl.fontSize || 24}
                    onChange={(e) => updateElement(selectedEl.id, { fontSize: parseInt(e.target.value) })}
                    className="w-full mt-1"
                  />
                </div>
                
                <div>
                  <Label>Цвет</Label>
                  <input 
                    type="color" 
                    value={selectedEl.color || '#FFFFFF'}
                    onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                    className="w-full h-10 mt-1 rounded border"
                  />
                </div>
                
                <div>
                  <Label>Шрифт</Label>
                  <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                    {fonts.map(font => (
                      <button
                        key={font.id}
                        onClick={() => updateElement(selectedEl.id, { fontFamily: font.fullStyle })}
                        className={`w-full text-left p-2 rounded border transition-all ${
                          selectedEl.fontFamily === font.fullStyle ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="text-xs text-muted-foreground">{font.name}</div>
                        <div 
                          className="text-sm"
                          style={{ fontFamily: font.style, fontWeight: font.weight }}
                        >
                          {font.example}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>Между строками (Фамилия↔Имя): {selectedEl.lineHeight?.toFixed(1) || '1.2'}</Label>
                  <input 
                    type="range" 
                    min="0.8" 
                    max="2.5" 
                    step="0.1"
                    value={selectedEl.lineHeight || 1.2}
                    onChange={(e) => updateElement(selectedEl.id, { lineHeight: parseFloat(e.target.value) })}
                    className="w-full mt-1"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Узко</span>
                    <span>Широко</span>
                  </div>
                </div>
                
                <div>
                  <Label>Между буквами: {selectedEl.letterSpacing?.toFixed(1) || '0'}px</Label>
                  <input 
                    type="range" 
                    min="-2" 
                    max="10" 
                    step="0.5"
                    value={selectedEl.letterSpacing || 0}
                    onChange={(e) => updateElement(selectedEl.id, { letterSpacing: parseFloat(e.target.value) })}
                    className="w-full mt-1"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Сжато</span>
                    <span>Разрежено</span>
                  </div>
                </div>
                
                <div>
                  <Label>Курсив</Label>
                  <Button
                    onClick={() => updateElement(selectedEl.id, { italic: !selectedEl.italic })}
                    variant={selectedEl.italic ? "default" : "outline"}
                    className="w-full mt-2"
                  >
                    <Icon name={selectedEl.italic ? "Check" : "Italic"} size={18} className="mr-2" />
                    {selectedEl.italic ? 'Включен' : 'Выключен'}
                  </Button>
                </div>
              </>
            )}
            
            <div>
              <Label>Ширина: {selectedEl.width}px</Label>
              <input 
                type="range" 
                min="50" 
                max="500" 
                value={selectedEl.width}
                onChange={(e) => updateElement(selectedEl.id, { width: parseInt(e.target.value) })}
                className="w-full mt-1"
              />
            </div>
            
            <div>
              <Label>Высота: {selectedEl.height}px</Label>
              <input 
                type="range" 
                min="30" 
                max="400" 
                value={selectedEl.height}
                onChange={(e) => updateElement(selectedEl.id, { height: parseInt(e.target.value) })}
                className="w-full mt-1"
              />
            </div>
            
            <div>
              <Label>Поворот: {selectedEl.rotation || 0}°</Label>
              <input 
                type="range" 
                min="-180" 
                max="180" 
                value={selectedEl.rotation || 0}
                onChange={(e) => handleRotationChange(selectedEl.id, parseInt(e.target.value))}
                className="w-full mt-1"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>← Влево</span>
                <span>Вправо →</span>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  if (navigator.vibrate) {
                    navigator.vibrate(200);
                    alert('Вибрация работает! ✓');
                  } else {
                    alert('Вибрация НЕ поддерживается в этом браузере ✗');
                  }
                }}
                className="w-full mt-2"
              >
                🧪 Тест вибрации
              </Button>
            </div>
            
            {selectedEl.type === 'fio' && (
              <div>
                <Label>Размер первой буквы: {selectedEl.initialScale?.toFixed(1) || '1.0'}x</Label>
                <input 
                  type="range" 
                  min="1.0" 
                  max="2.0" 
                  step="0.1"
                  value={selectedEl.initialScale || 1.0}
                  onChange={(e) => updateElement(selectedEl.id, { initialScale: parseFloat(e.target.value) })}
                  className="w-full mt-1"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Обычный</span>
                  <span>Увеличенный</span>
                </div>
              </div>
            )}
            
            {(selectedEl.type === 'image' || selectedEl.type === 'cross' || selectedEl.type === 'flower') && (
              <div>
                <Label>Отзеркалить по горизонтали</Label>
                <Button
                  onClick={() => updateElement(selectedEl.id, { flipHorizontal: !selectedEl.flipHorizontal })}
                  variant={selectedEl.flipHorizontal ? "default" : "outline"}
                  className="w-full mt-2"
                >
                  <Icon name={selectedEl.flipHorizontal ? "Check" : "FlipHorizontal"} size={18} className="mr-2" />
                  {selectedEl.flipHorizontal ? 'Отзеркалено' : 'Отзеркалить'}
                </Button>
              </div>
            )}
            
            {(selectedEl.type === 'photo' || selectedEl.type === 'image' || selectedEl.type === 'cross' || selectedEl.type === 'flower') && selectedEl.src && (
              <div className="space-y-2">
                <Label>Режим "Экран"</Label>
                <Button
                  onClick={async () => {
                    setIsProcessing(true);
                    await updateElement(selectedEl.id, { screenMode: !selectedEl.screenMode });
                    setIsProcessing(false);
                  }}
                  variant={selectedEl.screenMode ? "default" : "outline"}
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                      Обработка...
                    </>
                  ) : (
                    <>
                      <Icon name={selectedEl.screenMode ? "Check" : "Circle"} size={18} className="mr-2" />
                      {selectedEl.screenMode ? 'Включен' : 'Выключен'}
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Убирает черный цвет с фотографии
                </p>
              </div>
            )}
            
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={() => deleteElement(selectedEl.id)}
            >
              <Icon name="Trash2" size={18} className="mr-2" />
              Удалить элемент
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
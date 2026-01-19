import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface ImageEraserProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
}

export function ImageEraser({ isOpen, onClose, imageUrl, onSave }: ImageEraserProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [brushSize, setBrushSize] = useState(20);
  const [isErasing, setIsErasing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    console.log('🔄 ImageEraser useEffect:', { isOpen, hasCanvas: !!canvasRef.current, imageUrl });
    
    if (!isOpen) {
      console.log('⏸️ Модальное окно закрыто');
      return;
    }
    
    if (!imageUrl) {
      console.log('❌ imageUrl отсутствует');
      return;
    }
    
    if (!canvasRef.current) {
      console.log('❌ canvasRef.current отсутствует, ждём...');
      // Даём React время отрисовать Dialog
      const timer = setTimeout(() => {
        if (canvasRef.current) {
          console.log('✅ Canvas появился, повторяем попытку...');
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) return;
          
          ctxRef.current = ctx;
          loadImage(imageUrl, canvas, ctx);
        }
      }, 100);
      return () => clearTimeout(timer);
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      console.error('❌ Не удалось получить 2d context');
      return;
    }

    ctxRef.current = ctx;
    loadImage(imageUrl, canvas, ctx);
  }, [isOpen, imageUrl]);

  const loadImage = (url: string, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    console.log('📥 Загружаем изображение:', url);
    
    // Используем прокси для обхода CORS
    const PROXY_URL = 'https://functions.poehali.dev/a333157a-6afc-488c-a133-697f8cff0e15';
    const proxiedUrl = `${PROXY_URL}?url=${encodeURIComponent(url)}`;
    
    console.log('🔄 Используем прокси:', proxiedUrl);
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      console.log('✅ Изображение загружено, размеры:', img.width, 'x', img.height);
      
      const maxWidth = 800;
      const maxHeight = 600;
      let scale = 1;

      if (img.width > maxWidth || img.height > maxHeight) {
        scale = Math.min(maxWidth / img.width, maxHeight / img.height);
      }

      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      console.log('🎨 Рисуем на canvas, размеры:', canvas.width, 'x', canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      console.log('✅ Изображение отрисовано на canvas');
    };

    img.onerror = (e) => {
      console.error('❌ Ошибка загрузки изображения:', e);
      console.error('Оригинальный URL:', url);
      console.error('Прокси URL:', proxiedUrl);
    };

    img.src = proxiedUrl;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isErasing) return;
    setIsDrawing(true);
    erase(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isErasing) return;
    erase(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const erase = (x: number, y: number) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  const handleReset = () => {
    console.log('🔄 Сброс изображения');
    if (!canvasRef.current || !imageUrl) {
      console.error('❌ Нет canvas или imageUrl для сброса');
      return;
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ Нет 2d context для сброса');
      return;
    }

    loadImage(imageUrl, canvas, ctx);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Редактор изображения — Ластик</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 p-4 bg-secondary rounded-lg">
            <Button
              variant={isErasing ? "default" : "outline"}
              size="sm"
              onClick={() => setIsErasing(!isErasing)}
            >
              <Icon name="Eraser" size={18} className="mr-2" />
              Ластик {isErasing ? 'ВКЛ' : 'ВЫКЛ'}
            </Button>

            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <span className="text-sm whitespace-nowrap">Размер: {brushSize}px</span>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="flex-1"
              />
            </div>

            <Button variant="outline" size="sm" onClick={handleReset}>
              <Icon name="RotateCcw" size={18} className="mr-2" />
              Сбросить
            </Button>
          </div>

          <div className="relative overflow-auto bg-muted/20 rounded-lg p-4 max-h-[60vh] flex items-center justify-center">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: isErasing ? 'crosshair' : 'default', maxWidth: '100%', maxHeight: '100%' }}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={handleSave}>
              <Icon name="Check" size={18} className="mr-2" />
              Сохранить изменения
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
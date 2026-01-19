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
  const cursorRef = useRef<HTMLDivElement>(null);
  const [brushSize, setBrushSize] = useState(20);
  const [brushHardness, setBrushHardness] = useState(0.3);
  const [isErasing, setIsErasing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

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
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    lastPosRef.current = { x, y };
    erase(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    // Обновляем позицию кастомного курсора
    if (cursorRef.current) {
      cursorRef.current.style.left = `${e.clientX}px`;
      cursorRef.current.style.top = `${e.clientY}px`;
      cursorRef.current.style.display = 'block';
    }

    if (!isDrawing || !isErasing) return;

    // Интерполяция для плавного стирания
    if (lastPosRef.current) {
      const lastX = lastPosRef.current.x;
      const lastY = lastPosRef.current.y;
      const dist = Math.sqrt((x - lastX) ** 2 + (y - lastY) ** 2);
      const steps = Math.max(Math.ceil(dist / 2), 1);

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const interpX = lastX + (x - lastX) * t;
        const interpY = lastY + (y - lastY) * t;
        erase(interpX, interpY);
      }
    }

    lastPosRef.current = { x, y };
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    lastPosRef.current = null;
  };

  const handleMouseLeave = () => {
    setIsDrawing(false);
    lastPosRef.current = null;
    if (cursorRef.current) {
      cursorRef.current.style.display = 'none';
    }
  };

  const handleMouseEnter = () => {
    if (cursorRef.current && isErasing) {
      cursorRef.current.style.display = 'block';
    }
  };

  // Touch events для мобильных устройств
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isErasing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    setIsDrawing(true);
    lastPosRef.current = { x, y };
    erase(x, y);

    // Показываем курсор в месте касания
    if (cursorRef.current) {
      cursorRef.current.style.left = `${touch.clientX}px`;
      cursorRef.current.style.top = `${touch.clientY}px`;
      cursorRef.current.style.display = 'block';
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isErasing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Обновляем позицию курсора
    if (cursorRef.current) {
      cursorRef.current.style.left = `${touch.clientX}px`;
      cursorRef.current.style.top = `${touch.clientY}px`;
    }

    // Интерполяция для плавного стирания
    if (lastPosRef.current) {
      const lastX = lastPosRef.current.x;
      const lastY = lastPosRef.current.y;
      const dist = Math.sqrt((x - lastX) ** 2 + (y - lastY) ** 2);
      const steps = Math.max(Math.ceil(dist / 2), 1);

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const interpX = lastX + (x - lastX) * t;
        const interpY = lastY + (y - lastY) * t;
        erase(interpX, interpY);
      }
    }

    lastPosRef.current = { x, y };
  };

  const handleTouchEnd = () => {
    setIsDrawing(false);
    lastPosRef.current = null;
    if (cursorRef.current) {
      cursorRef.current.style.display = 'none';
    }
  };

  const erase = (x: number, y: number) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    const radius = brushSize / 2;
    
    // Создаём радиальный градиент для мягких краёв
    const gradient = ctx.createRadialGradient(x, y, radius * brushHardness, x, y, radius);
    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
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

            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <span className="text-sm whitespace-nowrap">Жёсткость: {Math.round(brushHardness * 100)}%</span>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={brushHardness * 100}
                onChange={(e) => setBrushHardness(parseInt(e.target.value) / 100)}
                className="flex-1"
              />
            </div>

            <Button variant="outline" size="sm" onClick={handleReset}>
              <Icon name="RotateCcw" size={18} className="mr-2" />
              Сбросить
            </Button>
          </div>

          <div className="relative bg-muted/20 rounded-lg p-4 flex items-center justify-center" style={{ minHeight: '400px' }}>
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onMouseEnter={handleMouseEnter}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ cursor: isErasing ? 'none' : 'default', maxWidth: '100%', maxHeight: '60vh', touchAction: 'none', display: 'block' }}
            />
          </div>
          {isErasing && (
            <div
              ref={cursorRef}
              style={{
                position: 'fixed',
                pointerEvents: 'none',
                border: '2px solid #fff',
                borderRadius: '50%',
                width: `${brushSize}px`,
                height: `${brushSize}px`,
                transform: 'translate(-50%, -50%)',
                display: 'none',
                zIndex: 999999,
                boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
              }}
            />
          )}

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
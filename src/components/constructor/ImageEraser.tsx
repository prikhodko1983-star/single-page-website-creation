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
  const [brushHardness, setBrushHardness] = useState(0.1);
  const [isErasing, setIsErasing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Управление видимостью курсора
  useEffect(() => {
    if (cursorRef.current) {
      cursorRef.current.style.display = isErasing ? 'block' : 'none';
    }
  }, [isErasing]);

  // Глобальный обработчик mouseup для остановки рисования при отпускании кнопки мыши
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDrawing) {
        setIsDrawing(false);
        lastPosRef.current = null;
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [isDrawing]);

  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    // Сбрасываем состояние при каждом открытии
    setIsErasing(false);
    setIsDrawing(false);
    lastPosRef.current = null;

    const tryLoad = () => {
      const canvas = canvasRef.current;
      if (!canvas) return false;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return false;

      ctxRef.current = ctx;
      loadImage(imageUrl, canvas, ctx);
      return true;
    };

    if (!tryLoad()) {
      const timer = setTimeout(tryLoad, 150);
      return () => clearTimeout(timer);
    }
   
  }, [isOpen, imageUrl]);

  const loadImage = (url: string, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const PROXY_URL = 'https://functions.poehali.dev/a333157a-6afc-488c-a133-697f8cff0e15';
    const proxiedUrl = `${PROXY_URL}?url=${encodeURIComponent(url)}`;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const maxWidth = 1000;
      const maxHeight = 700;
      const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
      
      canvas.width = Math.floor(img.width * scale);
      canvas.height = Math.floor(img.height * scale);
      canvas.style.width = `${canvas.width}px`;
      canvas.style.height = `${canvas.height}px`;

      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };

    img.src = proxiedUrl;
  };

  // Функция для пересчёта координат с учётом масштаба canvas
  const getCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    // Вычисляем реальное положение клика относительно canvas
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isErasing) return;
    const { x, y } = getCoords(e);

    setIsDrawing(true);
    lastPosRef.current = { x, y };
    erase(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Получаем координаты canvas на странице
    const rect = canvas.getBoundingClientRect();
    
    // Вычисляем координаты на canvas (в пикселях canvas)
    const canvasX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const canvasY = ((e.clientY - rect.top) / rect.height) * canvas.height;
    
    // Обновляем позицию курсора — позиционируем его относительно canvas, а не окна
    if (cursorRef.current && isErasing) {
      // Пересчитываем обратно в экранные координаты с учетом масштаба
      const screenX = rect.left + (canvasX / canvas.width) * rect.width;
      const screenY = rect.top + (canvasY / canvas.height) * rect.height;
      
      cursorRef.current.style.left = `${screenX}px`;
      cursorRef.current.style.top = `${screenY}px`;
      cursorRef.current.style.display = 'block';
    }

    // Стираем только если нажата кнопка мыши
    if (!isDrawing) return;

    // Интерполяция для плавного стирания
    if (lastPosRef.current) {
      const lastX = lastPosRef.current.x;
      const lastY = lastPosRef.current.y;
      const dist = Math.sqrt((canvasX - lastX) ** 2 + (canvasY - lastY) ** 2);
      const steps = Math.max(Math.ceil(dist / 2), 1);

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const interpX = lastX + (canvasX - lastX) * t;
        const interpY = lastY + (canvasY - lastY) * t;
        erase(interpX, interpY);
      }
    }

    lastPosRef.current = { x: canvasX, y: canvasY };
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    lastPosRef.current = null;
  };

  const handleMouseLeave = () => {
    setIsDrawing(false);
    if (cursorRef.current) {
      cursorRef.current.style.display = 'none';
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !cursorRef.current || !isErasing) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const canvasY = ((e.clientY - rect.top) / rect.height) * canvas.height;
    
    const screenX = rect.left + (canvasX / canvas.width) * rect.width;
    const screenY = rect.top + (canvasY / canvas.height) * rect.height;
    
    cursorRef.current.style.left = `${screenX}px`;
    cursorRef.current.style.top = `${screenY}px`;
    cursorRef.current.style.display = 'block';
  };

  // Touch events для мобильных устройств
  const getTouchCoords = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    
    const x = ((touch.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((touch.clientY - rect.top) / rect.height) * canvas.height;
    
    return { x, y };
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isErasing) return;
    e.preventDefault();

    const { x, y } = getTouchCoords(e);
    const touch = e.touches[0];

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

    const { x, y } = getTouchCoords(e);
    const touch = e.touches[0];

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
    
    // Создаём очень мягкий радиальный градиент с несколькими ступенями прозрачности
    const innerRadius = radius * brushHardness;
    const gradient = ctx.createRadialGradient(x, y, innerRadius, x, y, radius);
    
    // Многоступенчатый градиент для максимальной мягкости
    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(0.3, 'rgba(0,0,0,0.8)');
    gradient.addColorStop(0.5, 'rgba(0,0,0,0.5)');
    gradient.addColorStop(0.7, 'rgba(0,0,0,0.2)');
    gradient.addColorStop(0.85, 'rgba(0,0,0,0.05)');
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
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx || !imageUrl) return;
    loadImage(imageUrl, canvas, ctx);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-5xl max-h-[90vh] overflow-hidden p-3 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-sm sm:text-base">Редактор — Ластик</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex flex-col gap-2 p-3 bg-secondary rounded-lg">
            <div className="flex items-center gap-2">
              <Button
                variant={isErasing ? "default" : "outline"}
                size="sm"
                onClick={() => setIsErasing(!isErasing)}
                className="shrink-0"
              >
                <Icon name="Eraser" size={16} className="mr-1" />
                Ластик {isErasing ? 'ВКЛ' : 'ВЫКЛ'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset} className="shrink-0 ml-auto">
                <Icon name="RotateCcw" size={16} />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs whitespace-nowrap w-24 shrink-0">Размер: {brushSize}px</span>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="flex-1 min-w-0"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs whitespace-nowrap w-24 shrink-0">Жёсткость: {Math.round(brushHardness * 100)}%</span>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={brushHardness * 100}
                onChange={(e) => setBrushHardness(parseInt(e.target.value) / 100)}
                className="flex-1 min-w-0"
              />
            </div>
          </div>

          <div 
            className="relative bg-muted/20 rounded-lg p-1 sm:p-4 flex items-center justify-center overflow-hidden" 
            style={{ minHeight: '200px', maxHeight: '60vh' }}
          >
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
              style={{ 
                cursor: isErasing ? 'none' : 'default',
                touchAction: 'none', 
                display: 'block',
                border: '2px solid rgba(255,255,255,0.1)',
                borderRadius: '4px'
              }}
            />
          </div>
          <div
            ref={cursorRef}
            style={{
              position: 'fixed',
              pointerEvents: 'none',
              border: '2px solid rgba(255,255,255,0.9)',
              borderRadius: '50%',
              width: `${brushSize}px`,
              height: `${brushSize}px`,
              transform: 'translate(-50%, -50%)',
              display: 'none',
              zIndex: 999999,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.05)',
            }}
          />

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
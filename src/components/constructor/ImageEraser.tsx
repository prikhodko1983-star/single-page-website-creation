import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import Icon from "@/components/ui/icon";

interface ImageEraserProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
}

export function ImageEraser({ isOpen, onClose, imageUrl, onSave }: ImageEraserProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isErasing, setIsErasing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  useEffect(() => {
    if (isOpen && canvasRef.current && imageUrl) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      console.log('🖼️ Загружаем изображение в редактор:', imageUrl);

      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        console.log('✅ Изображение загружено:', img.width, 'x', img.height);
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        // Сохраняем начальное состояние
        saveToHistory();
      };
      
      img.onerror = (error) => {
        console.error('❌ Ошибка загрузки изображения:', error);
        console.error('URL изображения:', imageUrl);
      };
      
      img.src = imageUrl;
    } else {
      console.warn('⚠️ Редактор открыт, но imageUrl пустой:', imageUrl);
    }
  }, [isOpen, imageUrl]);

  const saveToHistory = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL();
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(dataUrl);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const prevStep = historyStep - 1;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = history[prevStep];
      setHistoryStep(prevStep);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const nextStep = historyStep + 1;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = history[nextStep];
      setHistoryStep(nextStep);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isErasing) return;
    setIsDrawing(true);
    erase(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isErasing) return;
    erase(e);
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const erase = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isErasing || e.touches.length !== 1) return;
    e.preventDefault();
    setIsDrawing(true);
    eraseTouchPoint(e.touches[0]);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isErasing || e.touches.length !== 1) return;
    e.preventDefault();
    eraseTouchPoint(e.touches[0]);
  };

  const handleTouchEnd = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const eraseTouchPoint = (touch: React.Touch) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    const editedUrl = canvasRef.current.toDataURL('image/png');
    onSave(editedUrl);
    onClose();
  };

  const resetImage = () => {
    if (history.length > 0 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setHistory([history[0]]);
        setHistoryStep(0);
      };
      img.src = history[0];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Редактор изображения — Ластик</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Панель инструментов */}
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
              <Slider
                value={[brushSize]}
                onValueChange={(v) => setBrushSize(v[0])}
                min={5}
                max={100}
                step={5}
                className="flex-1"
              />
            </div>

            <Button variant="outline" size="sm" onClick={undo} disabled={historyStep <= 0}>
              <Icon name="Undo" size={18} className="mr-2" />
              Отменить
            </Button>

            <Button variant="outline" size="sm" onClick={redo} disabled={historyStep >= history.length - 1}>
              <Icon name="Redo" size={18} className="mr-2" />
              Вернуть
            </Button>

            <Button variant="outline" size="sm" onClick={resetImage}>
              <Icon name="RotateCcw" size={18} className="mr-2" />
              Сбросить
            </Button>
          </div>

          {/* Canvas */}
          <div className="relative overflow-auto bg-muted/20 rounded-lg p-4 max-h-[60vh]">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto border border-border rounded cursor-crosshair"
              style={{ 
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                imageRendering: 'crisp-edges'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          </div>

          {/* Масштаб */}
          <div className="flex items-center gap-2">
            <span className="text-sm">Масштаб:</span>
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}>
              <Icon name="ZoomOut" size={16} />
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(3, zoom + 0.25))}>
              <Icon name="ZoomIn" size={16} />
            </Button>
          </div>

          {/* Кнопки действий */}
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
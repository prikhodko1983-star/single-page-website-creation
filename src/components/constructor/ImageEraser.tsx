import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { fabric } from "fabric";

interface ImageEraserProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
}

export function ImageEraser({ isOpen, onClose, imageUrl, onSave }: ImageEraserProps) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [brushSize, setBrushSize] = useState(20);
  const [isErasing, setIsErasing] = useState(true);

  useEffect(() => {
    if (!isOpen || !canvasContainerRef.current || !imageUrl) {
      console.warn('⚠️ Редактор: isOpen =', isOpen, 'imageUrl =', imageUrl);
      return;
    }

    console.log('🖼️ Инициализируем Fabric.js для:', imageUrl);

    // Создаем canvas элемент
    const canvasEl = document.createElement('canvas');
    canvasEl.id = 'fabric-canvas';
    canvasContainerRef.current.appendChild(canvasEl);

    // Инициализируем Fabric.js
    const fabricCanvas = new fabric.Canvas(canvasEl, {
      isDrawingMode: true,
      backgroundColor: '#000000'
    });

    fabricCanvasRef.current = fabricCanvas;

    // Загружаем изображение
    fabric.Image.fromURL(imageUrl, (img) => {
      if (!img || !fabricCanvas) return;

      console.log('✅ Изображение загружено:', img.width, 'x', img.height);

      // Устанавливаем размеры canvas
      const maxWidth = 800;
      const maxHeight = 600;
      let scale = 1;

      if (img.width! > maxWidth || img.height! > maxHeight) {
        scale = Math.min(maxWidth / img.width!, maxHeight / img.height!);
      }

      const scaledWidth = img.width! * scale;
      const scaledHeight = img.height! * scale;

      fabricCanvas.setWidth(scaledWidth);
      fabricCanvas.setHeight(scaledHeight);

      img.scale(scale);
      img.selectable = false;
      img.evented = false;

      fabricCanvas.add(img);
      fabricCanvas.sendToBack(img);

      // Настраиваем кисть для стирания
      fabricCanvas.freeDrawingBrush = new fabric.EraserBrush(fabricCanvas);
      fabricCanvas.freeDrawingBrush.width = brushSize;
    }, { crossOrigin: 'anonymous' });

    return () => {
      fabricCanvas.dispose();
      if (canvasContainerRef.current) {
        canvasContainerRef.current.innerHTML = '';
      }
    };
  }, [isOpen, imageUrl]);

  // Обновление размера кисти
  useEffect(() => {
    if (fabricCanvasRef.current && fabricCanvasRef.current.freeDrawingBrush) {
      fabricCanvasRef.current.freeDrawingBrush.width = brushSize;
    }
  }, [brushSize]);

  // Переключение режима рисования
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = isErasing;
    }
  }, [isErasing]);

  const handleSave = () => {
    if (!fabricCanvasRef.current) return;

    const dataUrl = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1
    });

    onSave(dataUrl);
    onClose();
  };

  const handleUndo = () => {
    if (!fabricCanvasRef.current) return;
    
    const objects = fabricCanvasRef.current.getObjects();
    if (objects.length > 1) {
      fabricCanvasRef.current.remove(objects[objects.length - 1]);
      fabricCanvasRef.current.renderAll();
    }
  };

  const handleReset = () => {
    if (!fabricCanvasRef.current || !imageUrl) return;

    const fabricCanvas = fabricCanvasRef.current;
    fabricCanvas.clear();

    fabric.Image.fromURL(imageUrl, (img) => {
      if (!img || !fabricCanvas) return;

      const scale = fabricCanvas.width! / img.width!;
      img.scale(scale);
      img.selectable = false;
      img.evented = false;

      fabricCanvas.add(img);
      fabricCanvas.sendToBack(img);
      fabricCanvas.renderAll();
    }, { crossOrigin: 'anonymous' });
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

            <Button variant="outline" size="sm" onClick={handleUndo}>
              <Icon name="Undo" size={18} className="mr-2" />
              Отменить
            </Button>

            <Button variant="outline" size="sm" onClick={handleReset}>
              <Icon name="RotateCcw" size={18} className="mr-2" />
              Сбросить
            </Button>
          </div>

          {/* Canvas */}
          <div className="relative overflow-auto bg-muted/20 rounded-lg p-4 max-h-[60vh] flex items-center justify-center">
            <div ref={canvasContainerRef} />
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

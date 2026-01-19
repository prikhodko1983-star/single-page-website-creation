import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import * as fabric from "fabric";

interface ImageEraserProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
}

export function ImageEraser({ isOpen, onClose, imageUrl, onSave }: ImageEraserProps) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<any>(null);
  const [brushSize, setBrushSize] = useState(20);
  const [isErasing, setIsErasing] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Проверяем, когда ref станет доступен (используем таймер для гарантии)
  useEffect(() => {
    if (isOpen) {
      // Проверяем сразу
      if (canvasContainerRef.current) {
        console.log('✅ Ref готов сразу');
        setIsReady(true);
      } else {
        // Если ref ещё не готов, ждём немного и проверяем снова
        console.log('⏳ Ref не готов, ждём...');
        const timer = setTimeout(() => {
          if (canvasContainerRef.current) {
            console.log('✅ Ref готов после задержки');
            setIsReady(true);
          } else {
            console.error('❌ Ref так и не появился');
          }
        }, 50); // Минимальная задержка для рендера DOM
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsReady(false);
    }
  }, [isOpen]);

  useEffect(() => {
    console.log('🔄 ImageEraser useEffect вызван');
    console.log('  isOpen:', isOpen);
    console.log('  isReady:', isReady);
    console.log('  canvasContainerRef.current:', !!canvasContainerRef.current);
    console.log('  imageUrl:', imageUrl?.substring(0, 100) + '...');
    
    if (!isOpen || !isReady || !canvasContainerRef.current || !imageUrl) {
      console.warn('⚠️ Редактор: isOpen =', isOpen, 'isReady =', isReady, 'imageUrl =', imageUrl?.substring(0, 50));
      return;
    }

    console.log('🖼️ Инициализируем Fabric.js для:', imageUrl.substring(0, 100) + '...');

    const canvasEl = document.createElement('canvas');
    canvasEl.id = 'fabric-canvas';
    canvasContainerRef.current.appendChild(canvasEl);
    console.log('✅ Canvas элемент создан');

    const Canvas = (fabric as any).Canvas;
    const fabricCanvas = new Canvas(canvasEl, {
      isDrawingMode: true,
      backgroundColor: '#000000'
    });
    console.log('✅ Fabric Canvas инициализирован');

    fabricCanvasRef.current = fabricCanvas;

    const FabricImage = (fabric as any).Image;
    console.log('📥 Начинаем загрузку изображения...');
    FabricImage.fromURL(imageUrl, (img: any) => {
      console.log('📥 FabricImage.fromURL callback вызван');
      console.log('  img:', !!img);
      console.log('  fabricCanvas:', !!fabricCanvas);
      
      if (!img || !fabricCanvas) {
        console.error('❌ img или fabricCanvas отсутствует');
        return;
      }

      console.log('✅ Изображение загружено:', img.width, 'x', img.height);

      const maxWidth = 800;
      const maxHeight = 600;
      let scale = 1;

      if (img.width > maxWidth || img.height > maxHeight) {
        scale = Math.min(maxWidth / img.width, maxHeight / img.height);
      }

      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;

      fabricCanvas.setWidth(scaledWidth);
      fabricCanvas.setHeight(scaledHeight);

      img.scale(scale);
      img.selectable = false;
      img.evented = false;

      fabricCanvas.add(img);
      fabricCanvas.sendToBack(img);

      const EraserBrush = (fabric as any).EraserBrush;
      fabricCanvas.freeDrawingBrush = new EraserBrush(fabricCanvas);
      fabricCanvas.freeDrawingBrush.width = brushSize;
    }, { crossOrigin: 'anonymous' });

    return () => {
      fabricCanvas.dispose();
      if (canvasContainerRef.current) {
        canvasContainerRef.current.innerHTML = '';
      }
    };
  }, [isOpen, isReady, imageUrl]);

  useEffect(() => {
    if (fabricCanvasRef.current?.freeDrawingBrush) {
      fabricCanvasRef.current.freeDrawingBrush.width = brushSize;
    }
  }, [brushSize]);

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

    const FabricImage = (fabric as any).Image;
    FabricImage.fromURL(imageUrl, (img: any) => {
      if (!img || !fabricCanvas) return;

      const scale = fabricCanvas.width / img.width;
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

          <div className="relative overflow-auto bg-muted/20 rounded-lg p-4 max-h-[60vh] flex items-center justify-center">
            <div ref={canvasContainerRef} />
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
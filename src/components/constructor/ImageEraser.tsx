import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import ImageEditor from 'tui-image-editor';
import 'tui-image-editor/dist/tui-image-editor.css';

interface ImageEraserProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
}

export function ImageEraser({ isOpen, onClose, imageUrl, onSave }: ImageEraserProps) {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<ImageEditor | null>(null);
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
    console.log('  editorContainerRef.current:', !!editorContainerRef.current);
    console.log('  imageUrl:', imageUrl?.substring(0, 100) + '...');
    
    if (!isOpen || !isReady || !editorContainerRef.current || !imageUrl) {
      console.warn('⚠️ Редактор: isOpen =', isOpen, 'isReady =', isReady, 'imageUrl =', imageUrl?.substring(0, 50));
      return;
    }

    console.log('🖼️ Инициализируем TUI Image Editor для:', imageUrl.substring(0, 100) + '...');

    const editor = new ImageEditor(editorContainerRef.current, {
      includeUI: {
        loadImage: {
          path: imageUrl,
          name: 'image'
        },
        menu: ['draw', 'crop', 'filter', 'shape', 'text'],
        initMenu: 'draw',
        uiSize: {
          width: '100%',
          height: '600px'
        },
        menuBarPosition: 'bottom'
      },
      cssMaxWidth: 900,
      cssMaxHeight: 600,
      usageStatistics: false
    });

    editorInstanceRef.current = editor;
    console.log('✅ TUI Image Editor инициализирован');

    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy();
        editorInstanceRef.current = null;
        console.log('🧹 TUI Image Editor уничтожен');
      }
    };
  }, [isOpen, isReady, imageUrl]);



  const handleSave = () => {
    if (!editorInstanceRef.current) return;

    const dataUrl = editorInstanceRef.current.toDataURL();
    onSave(dataUrl);
    onClose();
  };

  const handleUndo = () => {
    if (!editorInstanceRef.current) return;
    editorInstanceRef.current.undo();
  };

  const handleReset = () => {
    if (!editorInstanceRef.current || !imageUrl) return;
    editorInstanceRef.current.loadImageFromURL(imageUrl, 'reset').then(() => {
      console.log('✅ Изображение сброшено');
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Редактор изображения — Ластик</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 p-4 bg-secondary rounded-lg">
            <Button variant="outline" size="sm" onClick={handleUndo}>
              <Icon name="Undo" size={18} className="mr-2" />
              Отменить
            </Button>

            <Button variant="outline" size="sm" onClick={handleReset}>
              <Icon name="RotateCcw" size={18} className="mr-2" />
              Сбросить
            </Button>
          </div>

          <div className="relative overflow-auto bg-muted/20 rounded-lg p-4">
            <div ref={editorContainerRef} style={{ width: '100%', height: '600px' }} />
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
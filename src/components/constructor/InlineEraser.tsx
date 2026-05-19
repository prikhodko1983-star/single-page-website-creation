import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface InlineEraserProps {
  imageUrl: string;
  elementRect: { x: number; y: number; width: number; height: number };
  zoom: number;
  brushSize: number;
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}

const PROXY_URL = 'https://functions.poehali.dev/a333157a-6afc-488c-a133-697f8cff0e15';

export function InlineEraser({
  imageUrl,
  brushSize,
  onSave,
  onCancel,
}: InlineEraserProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorCanvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Загрузка изображения в canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctxRef.current = ctx;

    const isDataUrl = imageUrl.startsWith('data:');
    const src = isDataUrl ? imageUrl : `${PROXY_URL}?url=${encodeURIComponent(imageUrl)}`;

    const img = new Image();
    if (!isDataUrl) img.crossOrigin = 'anonymous';

    const drawNatural = (image: HTMLImageElement) => {
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(image, 0, 0);
      setIsLoaded(true);
    };

    img.onload = () => drawNatural(img);
    img.onerror = () => {
      const img2 = new Image();
      img2.crossOrigin = 'anonymous';
      img2.onload = () => drawNatural(img2);
      img2.src = imageUrl;
    };
    img.src = src;
  }, [imageUrl]);

  // Синхронизация размера cursor canvas с основным
  useEffect(() => {
    const canvas = canvasRef.current;
    const cursorCanvas = cursorCanvasRef.current;
    if (!canvas || !cursorCanvas) return;
    const observer = new ResizeObserver(() => {
      cursorCanvas.width = canvas.offsetWidth;
      cursorCanvas.height = canvas.offsetHeight;
    });
    observer.observe(canvas);
    cursorCanvas.width = canvas.offsetWidth;
    cursorCanvas.height = canvas.offsetHeight;
    return () => observer.disconnect();
  }, []);

  // Рисуем курсор-круг на cursor canvas
  const drawCursor = useCallback((x: number, y: number) => {
    const cursorCanvas = cursorCanvasRef.current;
    if (!cursorCanvas) return;
    const ctx = cursorCanvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Тёмная обводка для контраста
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([]);
    ctx.stroke();
  }, [brushSize]);

  const clearCursor = useCallback(() => {
    const cursorCanvas = cursorCanvasRef.current;
    if (!cursorCanvas) return;
    const ctx = cursorCanvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
  }, []);

  // Координаты мыши в пространстве cursor canvas (CSS пиксели)
  const getCursorCanvasPos = useCallback((clientX: number, clientY: number) => {
    const cursorCanvas = cursorCanvasRef.current;
    if (!cursorCanvas) return { x: 0, y: 0 };
    const rect = cursorCanvas.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  // Координаты в пространстве основного canvas (натуральные пиксели)
  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  }, []);

  // Радиус кисти в натуральных пикселях
  const getScaledRadius = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return brushSize / 2;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    return (brushSize / 2) * scaleX;
  }, [brushSize]);

  const erase = useCallback((x: number, y: number) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const radius = getScaledRadius();
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(0.5, 'rgba(0,0,0,0.8)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }, [getScaledRadius]);

  const interpolateAndErase = useCallback((x: number, y: number) => {
    if (!lastPosRef.current) { erase(x, y); return; }
    const { x: lx, y: ly } = lastPosRef.current;
    const dist = Math.sqrt((x - lx) ** 2 + (y - ly) ** 2);
    const steps = Math.max(Math.ceil(dist / 2), 1);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      erase(lx + (x - lx) * t, ly + (y - ly) * t);
    }
  }, [erase]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDrawingRef.current = true;
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    lastPosRef.current = { x, y };
    erase(x, y);
  }, [getCanvasCoords, erase]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const pos = getCursorCanvasPos(e.clientX, e.clientY);
    drawCursor(pos.x, pos.y);
    if (!isDrawingRef.current) return;
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    interpolateAndErase(x, y);
    lastPosRef.current = { x, y };
  }, [getCursorCanvasPos, drawCursor, getCanvasCoords, interpolateAndErase]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDrawingRef.current = false;
    lastPosRef.current = null;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
    clearCursor();
  }, [clearCursor]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    isDrawingRef.current = true;
    const { x, y } = getCanvasCoords(touch.clientX, touch.clientY);
    lastPosRef.current = { x, y };
    erase(x, y);
  }, [getCanvasCoords, erase]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const touch = e.touches[0];
    const { x, y } = getCanvasCoords(touch.clientX, touch.clientY);
    interpolateAndErase(x, y);
    lastPosRef.current = { x, y };
  }, [getCanvasCoords, interpolateAndErase]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    isDrawingRef.current = false;
    lastPosRef.current = null;
  }, []);

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL('image/png'));
  }, [onSave]);

  return (
    <>
      {/* Основной canvas с изображением */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          left: 0, top: 0,
          width: '100%', height: '100%',
          touchAction: 'none',
          zIndex: 50,
          opacity: isLoaded ? 1 : 0,
          borderRadius: 'inherit',
        }}
      />

      {/* Cursor canvas — поверх, перехватывает события мыши */}
      <canvas
        ref={cursorCanvasRef}
        style={{
          position: 'absolute',
          left: 0, top: 0,
          width: '100%', height: '100%',
          cursor: 'none',
          touchAction: 'none',
          zIndex: 51,
          borderRadius: 'inherit',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Кнопки */}
      <div
        style={{
          position: 'absolute',
          bottom: -44,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          zIndex: 100,
          whiteSpace: 'nowrap',
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
          className="bg-black/80 border-white/20 text-white hover:bg-black/90 h-8 text-xs px-3"
        >
          <Icon name="X" size={14} className="mr-1" />
          Отмена
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          className="bg-primary h-8 text-xs px-3"
        >
          <Icon name="Check" size={14} className="mr-1" />
          Готово
        </Button>
      </div>
    </>
  );
}

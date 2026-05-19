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
  elementRect,
  zoom,
  brushSize,
  onSave,
  onCancel,
}: InlineEraserProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

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
    img.onload = () => {
      canvas.width = elementRect.width;
      canvas.height = elementRect.height;
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(img, 0, 0, elementRect.width, elementRect.height);
      setIsLoaded(true);
    };
    img.onerror = () => {
      const img2 = new Image();
      img2.crossOrigin = 'anonymous';
      img2.onload = () => {
        canvas.width = elementRect.width;
        canvas.height = elementRect.height;
        ctx.drawImage(img2, 0, 0, elementRect.width, elementRect.height);
        setIsLoaded(true);
      };
      img2.src = imageUrl;
    };
    img.src = src;
  }, [imageUrl]);

  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  }, []);

  const erase = useCallback((x: number, y: number) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const radius = brushSize / 2;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(0.5, 'rgba(0,0,0,0.8)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }, [brushSize]);

  const interpolateAndErase = useCallback((x: number, y: number) => {
    if (!lastPosRef.current) {
      erase(x, y);
      return;
    }
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
    setCursorPos({ x: e.clientX, y: e.clientY });
    if (!isDrawingRef.current) return;
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    interpolateAndErase(x, y);
    lastPosRef.current = { x, y };
  }, [getCanvasCoords, interpolateAndErase]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDrawingRef.current = false;
    lastPosRef.current = null;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
    setCursorPos(null);
  }, []);

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
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  }, [onSave]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: elementRect.width,
          height: elementRect.height,
          cursor: 'none',
          touchAction: 'none',
          zIndex: 50,
          opacity: isLoaded ? 1 : 0,
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
      {cursorPos && (
        <div
          style={{
            position: 'fixed',
            left: cursorPos.x,
            top: cursorPos.y,
            width: brushSize * zoom,
            height: brushSize * zoom,
            border: '2px solid rgba(255,255,255,0.9)',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 999999,
            boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          bottom: -44,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
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
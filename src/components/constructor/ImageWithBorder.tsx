import React, { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

interface ImageWithBorderProps {
  src: string;
  alt: string;
  flipHorizontal?: boolean;
  isSelected: boolean;
  containerWidth: number;
  containerHeight: number;
  rotateMode: boolean;
  onResizeMouseDown: (e: React.MouseEvent) => void;
  onResizeTouchStart: (e: React.TouchEvent) => void;
  onToggleRotate: (e: React.MouseEvent) => void;
}

const calcImgRect = (natW: number, natH: number, cW: number, cH: number) => {
  const scale = Math.min(cW / natW, cH / natH);
  const rW = natW * scale;
  const rH = natH * scale;
  return { w: rW, h: rH, x: (cW - rW) / 2, y: (cH - rH) / 2 };
};

const ImageWithBorder: React.FC<ImageWithBorderProps> = ({
  src, alt, flipHorizontal, isSelected, containerWidth, containerHeight,
  rotateMode, onResizeMouseDown, onResizeTouchStart, onToggleRotate
}) => {
  const natRef = useRef<{ w: number; h: number } | null>(null);
  const [imgRect, setImgRect] = useState<{ w: number; h: number; x: number; y: number } | null>(null);

  const onLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    natRef.current = { w: img.naturalWidth, h: img.naturalHeight };
    setImgRect(calcImgRect(img.naturalWidth, img.naturalHeight, containerWidth, containerHeight));
  };

  useEffect(() => {
    if (natRef.current) {
      setImgRect(calcImgRect(natRef.current.w, natRef.current.h, containerWidth, containerHeight));
    }
  }, [containerWidth, containerHeight]);

  return (
    <div className="relative w-full h-full">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain select-none"
        style={{ transform: flipHorizontal ? 'scaleX(-1)' : 'none', pointerEvents: 'none' }}
        draggable={false}
        onLoad={onLoad}
      />
      {isSelected && imgRect && (
        <>
          <div
            className="absolute pointer-events-none"
            style={{
              left: imgRect.x,
              top: imgRect.y,
              width: imgRect.w,
              height: imgRect.h,
              outline: '2px solid hsl(var(--primary))',
            }}
          />
          <div
            className={`absolute w-4 h-4 bg-primary rounded-full hover:scale-125 transition-transform touch-none flex items-center justify-center shadow-lg border-2 border-background ${
              rotateMode ? 'cursor-grab' : 'cursor-nwse-resize'
            }`}
            style={{
              left: imgRect.x + imgRect.w,
              top: imgRect.y + imgRect.h,
              transform: 'translate(50%, 50%)',
            }}
            onMouseDown={onResizeMouseDown}
            onTouchStart={onResizeTouchStart}
            onDoubleClick={onToggleRotate}
            title={rotateMode ? 'Режим вращения' : 'Режим масштабирования'}
          >
            {rotateMode && <Icon name="RotateCw" size={8} className="text-primary-foreground" />}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageWithBorder;

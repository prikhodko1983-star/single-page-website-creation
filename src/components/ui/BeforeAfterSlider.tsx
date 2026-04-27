import { useState, useRef, useCallback, useEffect } from "react";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt?: string;
  afterAlt?: string;
  aspectRatio?: string;
}

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt = "До обработки",
  afterAlt = "После обработки",
  aspectRatio = "3/4",
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getPositionFromEvent = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = Math.min(Math.max((x / rect.width) * 100, 0), 100);
      setPosition(pct);
    },
    []
  );

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const onTouchStart = () => setDragging(true);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (dragging) getPositionFromEvent(e.clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (dragging) getPositionFromEvent(e.touches[0].clientX);
    };
    const onUp = () => setDragging(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, getPositionFromEvent]);

  const handleContainerClick = (e: React.MouseEvent) => {
    getPositionFromEvent(e.clientX);
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-xl border-2 border-border bg-secondary select-none cursor-col-resize"
      style={{ aspectRatio }}
      onClick={handleContainerClick}
    >
      {/* After (full width, behind) */}
      <img
        src={afterSrc}
        alt={afterAlt}
        className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none"
        draggable={false}
      />

      {/* Before (clipped to left side) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${position}%` }}
      >
        <img
          src={beforeSrc}
          alt={beforeAlt}
          className="absolute inset-0 w-full h-full object-cover object-top"
          style={{ width: `${10000 / position}%`, maxWidth: "none" }}
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.6)] pointer-events-none z-10"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      />

      {/* Handle */}
      <div
        className="absolute top-1/2 z-20 flex items-center justify-center"
        style={{
          left: `${position}%`,
          transform: "translate(-50%, -50%)",
          cursor: "col-resize",
        }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-white/80 gap-0.5">
          <div className="flex gap-0.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M5 8L2 5m0 0l3-3M2 5h5" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11 8l3-3m0 0l-3-3M14 5H9" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <span className="bg-secondary/90 text-foreground px-3 py-1.5 rounded-lg font-oswald font-semibold text-xs border border-border">
          ДО ОБРАБОТКИ
        </span>
      </div>
      <div className="absolute top-4 right-4 z-10 pointer-events-none">
        <span className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-oswald font-semibold text-xs">
          ПОСЛЕ ОБРАБОТКИ
        </span>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import type { Crop } from "@/lib/hh-render";

type Props = {
  image: HTMLImageElement;
  crop: Crop;
  onChange: (crop: Crop) => void;
  aspect: number; // width / height
  rounded: "card" | "circle";
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

export function PhotoCropper({ image, crop, onChange, aspect, rounded }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
    slackX: number;
    slackY: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [box, setBox] = useState({ w: 320, h: 320 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [aspect]);

  const geometry = useCallback(
    (zoom: number) => {
      const baseScale = Math.max(box.w / image.width, box.h / image.height);
      const scale = baseScale * zoom;
      const dw = image.width * scale;
      const dh = image.height * scale;
      const slackX = Math.max(0, dw - box.w);
      const slackY = Math.max(0, dh - box.h);
      return { dw, dh, slackX, slackY };
    },
    [box, image],
  );

  const { dw, dh, slackX, slackY } = geometry(crop.zoom);
  const left = (box.w - dw) / 2 + crop.offsetX * (slackX / 2);
  const top = (box.h - dh) / 2 + crop.offsetY * (slackY / 2);

  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    setDragging(true);
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      startOffsetX: crop.offsetX,
      startOffsetY: crop.offsetY,
      slackX,
      slackY,
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = dragState.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    const nextX = d.slackX > 0 ? d.startOffsetX + dx / (d.slackX / 2) : 0;
    const nextY = d.slackY > 0 ? d.startOffsetY + dy / (d.slackY / 2) : 0;
    onChange({
      ...crop,
      offsetX: Math.max(-1, Math.min(1, nextX)),
      offsetY: Math.max(-1, Math.min(1, nextY)),
    });
  }

  function onPointerUp() {
    dragState.current = null;
    setDragging(false);
  }

  function onZoom(nextZoom: number) {
    const { slackX: nsx, slackY: nsy } = geometry(nextZoom);
    onChange({
      zoom: nextZoom,
      offsetX: nsx > 0 ? crop.offsetX : 0,
      offsetY: nsy > 0 ? crop.offsetY : 0,
    });
  }

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className={`relative w-full touch-none select-none overflow-hidden border-2 border-primary bg-primary/10 shadow-[6px_6px_0_0_var(--color-primary)] ${
          rounded === "circle" ? "rounded-full" : "rounded-2xl"
        } ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ aspectRatio: String(aspect) }}
      >
        <img
          src={image.src}
          alt=""
          draggable={false}
          className="pointer-events-none absolute max-w-none"
          style={{ width: dw, height: dh, left, top }}
        />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/20" />
      </div>

      <div className="flex items-center gap-3 font-mono text-[11px] tracking-widest text-primary">
        <span>DRAG TO REFRAME</span>
        <input
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.01}
          value={crop.zoom}
          onChange={(e) => onZoom(Number(e.target.value))}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-primary/30 accent-[var(--color-secondary)]"
          aria-label="Zoom"
        />
        <span className="w-10 text-right">{crop.zoom.toFixed(1)}×</span>
      </div>
    </div>
  );
}

"use client";

import { useRef, useState, useEffect, useCallback } from "react";

const OUTPUT_SIZE = 400;
const FRAME_SIZE = 240;

export function PhotoCropModal({
  file,
  onCancel,
  onSave,
}: {
  file: File;
  onCancel: () => void;
  onSave: (dataUrl: string) => void;
}) {
  // PhotoCropModal is mounted fresh each time a file is picked (the parent
  // conditionally renders it), so a lazy initializer keyed on `file` at
  // mount time is correct here — no need to react to `file` changing later.
  const [imgUrl] = useState(() => URL.createObjectURL(file));
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [naturalSize, setNaturalSize] = useState({ w: 1, h: 1 });

  useEffect(() => {
    return () => URL.revokeObjectURL(imgUrl);
  }, [imgUrl]);

  function handleImgLoad() {
    if (!imgRef.current) return;
    setNaturalSize({ w: imgRef.current.naturalWidth, h: imgRef.current.naturalHeight });
  }

  const baseScale = Math.max(FRAME_SIZE / naturalSize.w, FRAME_SIZE / naturalSize.h);

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = { startX: e.clientX, startY: e.clientY, origX: offset.x, origY: offset.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - dragging.current.startX;
    const dy = e.clientY - dragging.current.startY;
    setOffset({ x: dragging.current.origX + dx, y: dragging.current.origY + dy });
  }
  function onPointerUp() {
    dragging.current = null;
  }

  const handleSave = useCallback(() => {
    if (!imgRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Scale the same box we show in the FRAME_SIZE preview up to OUTPUT_SIZE.
    const k = OUTPUT_SIZE / FRAME_SIZE;
    const dispW = naturalSize.w * baseScale * zoom;
    const dispH = naturalSize.h * baseScale * zoom;
    const leftPreview = FRAME_SIZE / 2 + offset.x - dispW / 2;
    const topPreview = FRAME_SIZE / 2 + offset.y - dispH / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(imgRef.current, leftPreview * k, topPreview * k, dispW * k, dispH * k);
    ctx.restore();

    onSave(canvas.toDataURL("image/png"));
  }, [baseScale, zoom, offset, naturalSize, onSave]);

  return (
    <div className="fixed inset-0 bg-black/40 z-30 flex items-center justify-center p-6" onClick={onCancel}>
      <div
        className="bg-white rounded-lg p-6 flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[14px] font-semibold text-[#1B2430]">Adjust your photo</h2>
        <div
          className="relative overflow-hidden rounded-full border border-[#E4E0D8] cursor-grab touch-none"
          style={{ width: FRAME_SIZE, height: FRAME_SIZE }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {imgUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={imgUrl}
              alt=""
              onLoad={handleImgLoad}
              draggable={false}
              style={{
                position: "absolute",
                left: FRAME_SIZE / 2 + offset.x - (naturalSize.w * baseScale * zoom) / 2,
                top: FRAME_SIZE / 2 + offset.y - (naturalSize.h * baseScale * zoom) / 2,
                width: naturalSize.w * baseScale * zoom,
                height: naturalSize.h * baseScale * zoom,
                userSelect: "none",
              }}
            />
          )}
        </div>
        <div className="flex items-center gap-2 w-full">
          <span className="text-[10px] text-[#9CA3AF]">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1"
          />
        </div>
        <p className="text-[10px] text-[#9CA3AF] -mt-2">Drag the photo to reposition it.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="text-sm text-[#6B7280] px-4 py-2">
            Cancel
          </button>
          <button onClick={handleSave} className="text-sm rounded-md bg-[#1B2430] text-white px-4 py-2 font-medium">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

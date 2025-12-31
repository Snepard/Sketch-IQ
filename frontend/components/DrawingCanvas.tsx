"use client";

import { useEffect, useRef, useState, MutableRefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DrawingCanvasProps {
  onPredict: (canvas: HTMLCanvasElement) => void;
  onClear: () => void;
  onDrawStart: () => void;
  isLoading: boolean;
  hasDrawn: boolean;
  clearVersion: number;
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
}

export default function DrawingCanvas({
  onPredict,
  onClear,
  onDrawStart,
  isLoading,
  hasDrawn,
  clearVersion,
  canvasRef,
}: DrawingCanvasProps) {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  const [drawing, setDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(8);
  const [showHint, setShowHint] = useState(true);

  // Sync refs
  useEffect(() => {
    if (internalCanvasRef.current) {
      canvasRef.current = internalCanvasRef.current;
    }
  }, [canvasRef]);

  /* ---------------- Canvas Init ---------------- */
  useEffect(() => {
    const canvas = internalCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#0f172a";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  /* ---------------- Parent-triggered Clear ---------------- */
  useEffect(() => {
    if (!internalCanvasRef.current) return;
    const canvas = internalCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setShowHint(true);
  }, [clearVersion]);

  /* ---------------- LIVE GUESSING LOOP ---------------- */
  useEffect(() => {
    if (!hasDrawn) return;

    const interval = setInterval(() => {
      if (!internalCanvasRef.current) return;
      if (isLoading) return;
      onPredict(internalCanvasRef.current);
    }, 2000);

    return () => clearInterval(interval);
  }, [hasDrawn, isLoading, onPredict]);

  /* ---------------- Input Helpers ---------------- */
  const getCoordinates = (
    e: React.MouseEvent | React.TouchEvent,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      const t = e.touches[0];
      return {
        offsetX: (t.clientX - rect.left) * scaleX,
        offsetY: (t.clientY - rect.top) * scaleY,
      };
    }

    const m = e as React.MouseEvent;
    return {
      offsetX: (m.clientX - rect.left) * scaleX,
      offsetY: (m.clientY - rect.top) * scaleY,
    };
  };

  /* ---------------- Drawing Handlers ---------------- */
  const start = (e: React.MouseEvent | React.TouchEvent) => {
    setDrawing(true);
    isDrawingRef.current = true;
    setShowHint(false);
    onDrawStart();

    const canvas = internalCanvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const { offsetX, offsetY } = getCoordinates(e, canvas);

    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;

    const canvas = internalCanvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const { offsetX, offsetY } = getCoordinates(e, canvas);

    ctx.lineWidth = brushSize;
    ctx.strokeStyle = "#0f172a";

    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
  };

  const stop = () => {
    setDrawing(false);
    isDrawingRef.current = false;
    internalCanvasRef.current?.getContext("2d")?.beginPath();
  };

  const clear = () => {
    const canvas = internalCanvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setShowHint(true);
    onClear();
  };

  const brushSizes = [4, 8, 12, 18];

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Canvas Area */}
      <div className="relative bg-white rounded-xl overflow-hidden">
        <canvas
          ref={internalCanvasRef}
          width={560}
          height={360}
          className="w-full rounded-xl cursor-crosshair touch-none bg-white"
          style={{ aspectRatio: "560/360" }}
          onMouseDown={start}
          onMouseUp={stop}
          onMouseLeave={stop}
          onMouseMove={draw}
          onTouchStart={start}
          onTouchEnd={stop}
          onTouchMove={draw}
        />

        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            >
              <span className="text-4xl mb-2">✏️</span>
              <span className="text-gray-400 text-sm">
                Start sketching here
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Brush Size Selector */}
      <div className="mt-5 flex items-center justify-center gap-4">
        {brushSizes.map((size) => (
          <motion.button
            key={size}
            onClick={() => setBrushSize(size)}
            whileHover={{ scale: 1.05, rotateX: 5 }}
            whileTap={{ scale: 0.95 }}
            className={`cursor-pointer w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              brushSize === size
                ? "bg-slate-700 ring-2 ring-cyan-400"
                : "bg-slate-800/50 hover:bg-slate-700/50"
            }`}
            title={`${size}px`}
          >
            <span
              className="rounded-full bg-white"
              style={{ width: size, height: size }}
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

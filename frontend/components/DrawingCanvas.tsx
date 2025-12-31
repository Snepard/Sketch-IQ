"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DrawingCanvasProps {
  onPredict: (canvas: HTMLCanvasElement) => void;
  onDone: (canvas: HTMLCanvasElement) => void;
  onClear: () => void;
  onDrawStart: () => void;
  isLoading: boolean;
  hasDrawn: boolean;
  clearVersion: number;
}

export default function DrawingCanvas({
  onPredict,
  onDone,
  onClear,
  onDrawStart,
  isLoading,
  hasDrawn,
  clearVersion,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  const [drawing, setDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(8);
  const [showHint, setShowHint] = useState(true);

  /* ---------------- Canvas Init ---------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
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
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
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
      if (!canvasRef.current) return;
      if (isLoading) return;
      onPredict(canvasRef.current);
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

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const { offsetX, offsetY } = getCoordinates(e, canvas);

    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;

    const canvas = canvasRef.current!;
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
    canvasRef.current?.getContext("2d")?.beginPath();
  };

  const clear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setShowHint(true);
    onClear();
  };

  const brushSizes = [4, 8, 12, 18];

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl p-5 shadow-xl">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={500}
            height={260}
            className="w-full rounded-2xl cursor-crosshair touch-none bg-white ring-1 ring-gray-200 hover:ring-purple-400 transition"
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

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {brushSizes.map((size) => (
            <button
              key={size}
              onClick={() => setBrushSize(size)}
              className={`min-w-[60px] px-4 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                brushSize === size
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {size}px
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onDone(canvasRef.current!)}
          disabled={isLoading || !hasDrawn}
          className="min-w-[140px] px-8 py-3.5 rounded-xl font-bold text-base text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
        >
          {isLoading ? "Guessing..." : "✓ Done"}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={clear}
          className="min-w-[140px] px-8 py-3.5 rounded-xl font-bold text-base text-white bg-gradient-to-r from-rose-500 to-red-500 shadow-lg hover:shadow-xl transition-all"
        >
          🗑 Clear
        </motion.button>
      </div>
    </div>
  );
}

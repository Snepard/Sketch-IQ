"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import DrawingCanvas from "../components/DrawingCanvas";
import PredictionPanel from "../components/PredictionPanel";
import ParticleBackground from "../components/ParticleBackground";
import { canvasToBlob } from "../utils/canvasToBlob";

type Prediction = { label: string; confidence: number };

export default function Home() {
  const controllerRef = useRef<AbortController | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [clearVersion, setClearVersion] = useState(0);

  const [isFinalOpen, setIsFinalOpen] = useState(false);
  const [finalGuess, setFinalGuess] = useState<Prediction | null>(null);
  const [finalBlob, setFinalBlob] = useState<Blob | null>(null);
  const [finalStep, setFinalStep] = useState<"confirm" | "wrong">("confirm");
  const [correctLabel, setCorrectLabel] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const predictFromBlob = async (blob: Blob, signal?: AbortSignal) => {
    const formData = new FormData();
    formData.append("file", blob);

    const res = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      body: formData,
      signal,
    });
    const data = await res.json();
    return (data?.predictions as Prediction[]) || null;
  };

  const handlePredict = async (canvas: HTMLCanvasElement) => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    controllerRef.current = new AbortController();
    setIsLoading(true);

    try {
      const blob = await canvasToBlob(canvas);
      const preds = await predictFromBlob(blob, controllerRef.current.signal);
      setPredictions(preds);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Prediction failed:", err);
      }
    }

    setIsLoading(false);
  };

  const handleDone = async () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    controllerRef.current = new AbortController();

    setIsLoading(true);
    try {
      const blob = await canvasToBlob(canvas);
      setFinalBlob(blob);
      const preds = await predictFromBlob(blob, controllerRef.current.signal);
      setPredictions(preds);
      setFinalGuess((preds && preds[0]) || null);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Final prediction failed:", err);
      }
      setFinalGuess(null);
      setFinalBlob(null);
    } finally {
      setIsLoading(false);
    }

    setFinalStep("confirm");
    setCorrectLabel("");
    setIsFinalOpen(true);
  };

  const handlePlayAgain = () => {
    setIsFinalOpen(false);
    setFinalGuess(null);
    setFinalBlob(null);
    setPredictions(null);
    setHasDrawn(false);
    setClearVersion((v) => v + 1);
  };

  const submitFeedback = async () => {
    if (!finalBlob) return;
    if (!correctLabel.trim()) return;
    setIsSubmittingFeedback(true);
    try {
      const formData = new FormData();
      formData.append("file", finalBlob);
      formData.append("label", correctLabel.trim().toLowerCase());
      await fetch("http://127.0.0.1:8000/feedback", {
        method: "POST",
        body: formData,
      });
      handlePlayAgain();
    } catch (e) {
      console.error("Feedback failed", e);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleClear = () => {
    setPredictions(null);
    setHasDrawn(false);
    setClearVersion((v) => v + 1);
  };

  const handleDrawStart = () => {
    setHasDrawn(true);
  };

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <ParticleBackground />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center my-14"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4" style={{ fontFamily: "Fredoka, sans-serif" }}>
            <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              SketchIQ
            </span>
          </h1>

          <p className="text-base text-gray-300" style={{ fontFamily: "Nunito, sans-serif" }}>
            Draw a doodle and watch our <span className="text-purple-400 font-semibold">Neural Network</span> guess it in real-time.
          </p>
        </motion.header>

        {/* Main Glass Dashboard */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-5xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
            
            {/* Left Panel: Canvas */}
            <div className="glass-panel overflow-hidden">
              {/* Panel Header */}
              <div className="panel-header">
                <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <span className="text-white font-semibold">Canvas</span>
              </div>
              
              {/* Canvas Content */}
              <div className="p-6">
                <DrawingCanvas
                  onPredict={handlePredict}
                  onClear={handleClear}
                  onDrawStart={handleDrawStart}
                  isLoading={isLoading}
                  hasDrawn={hasDrawn}
                  clearVersion={clearVersion}
                  canvasRef={canvasRef}
                />
              </div>
            </div>

            {/* Right Panel: Analysis */}
            <div className="glass-panel overflow-hidden flex flex-col">
              {/* Panel Header */}
              <div className="panel-header">
                <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <span className="text-white font-semibold">Analysis</span>
              </div>
              
              {/* Analysis Content */}
              <div className="flex-1 grid-bg p-6">
                <PredictionPanel
                  predictions={predictions}
                  isLoading={isLoading}
                  hasDrawn={hasDrawn}
                  onDone={handleDone}
                  onClear={handleClear}
                />
              </div>
            </div>

          </div>
        </motion.div>
      </div>

      {/* Final Guess Modal */}

        {isFinalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setIsFinalOpen(false)}
            />

            <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-white/10 backdrop-blur-xl p-10 shadow-2xl overflow-hidden">
              {/* Decorative gradient orb */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative">
                <div className="text-center mb-6">
                  <span className="text-4xl mb-3 block">🎯</span>
                  <h2 className="text-white text-2xl font-bold">Final Guess</h2>
                </div>

                <div className="rounded-2xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-white/10 p-6">
                  {finalGuess ? (
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-5xl">
                        {{
                          airplane: "✈️", ambulance: "🚑", angel: "👼", ant: "🐜", anvil: "🔨",
                          camera: "📷", car: "🚗", cat: "🐱", circle: "⭕", clock: "🕐",
                          cookie: "🍪", crown: "👑", donut: "🍩", eye: "👁️", fish: "🐟",
                          guitar: "🎸", hamburger: "🍔", parachute: "🪂", popsicle: "🍦",
                          spider: "🕷️", square: "🟦", star: "⭐", tent: "⛺", tree: "🌳", triangle: "🔺"
                        }[finalGuess.label.toLowerCase()] || "🎨"}
                      </span>
                      <div className="text-white text-2xl capitalize font-bold">
                        {finalGuess.label}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-32 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-500"
                            style={{ width: `${finalGuess.confidence}%` }}
                          />
                        </div>
                        <span className="text-emerald-300 text-xl font-bold">
                          {finalGuess.confidence}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-white/70 text-center py-4">No guess available.</div>
                  )}
                </div>

              {finalStep === "confirm" && (
                <div className="mt-8">
                  <div className="text-white/80 text-base mb-5 text-center">
                    Is the guess correct?
                  </div>
                  <div className="flex gap-4">
                    <button
                      className="flex-1 min-w-[120px] px-6 py-4 rounded-2xl font-semibold text-base bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      onClick={handlePlayAgain}
                    >
                      🎉 Yes!
                    </button>
                    <button
                      className="flex-1 min-w-[120px] px-6 py-4 rounded-2xl font-semibold text-base bg-rose-500/20 text-rose-200 border border-rose-400/30 hover:bg-rose-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      onClick={() => setFinalStep("wrong")}
                    >
                      🤔 Nope
                    </button>
                  </div>
                  <div className="mt-5 text-sm text-white/40 text-center">
                    Click Yes to play again!
                  </div>
                </div>
              )}

              {finalStep === "wrong" && (
                <div className="mt-8">
                  <div className="text-white/80 text-base mb-4 text-center">
                    What was it supposed to be?
                  </div>
                  <input
                    value={correctLabel}
                    onChange={(e) => setCorrectLabel(e.target.value)}
                    placeholder="e.g. cat, tree, star..."
                    className="w-full rounded-2xl bg-white/5 border border-white/10 px-6 py-4 text-white text-base text-center outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all placeholder:text-white/30"
                  />
                  <div className="flex gap-4 mt-6">
                    <button
                      className="flex-1 min-w-[100px] px-5 py-4 rounded-2xl font-semibold text-base bg-white/10 text-white/80 border border-white/10 hover:bg-white/15 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      onClick={() => setFinalStep("confirm")}
                      disabled={isSubmittingFeedback}
                    >
                      ← Back
                    </button>
                    <button
                      className="flex-1 min-w-[100px] px-5 py-4 rounded-2xl font-semibold text-base bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-200 border border-cyan-400/30 hover:from-cyan-500/30 hover:to-purple-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all"
                      onClick={submitFeedback}
                      disabled={isSubmittingFeedback || !correctLabel.trim() || !finalBlob}
                    >
                      {isSubmittingFeedback ? "⏳ Saving..." : "💾 Submit"}
                    </button>
                  </div>
                  <div className="mt-5 text-sm text-white/40 text-center">
                    Your feedback helps improve the AI!
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        )}
    </main>
  );
}
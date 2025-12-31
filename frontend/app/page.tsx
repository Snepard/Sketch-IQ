"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import DrawingCanvas from "../components/DrawingCanvas";
import PredictionPanel from "../components/PredictionPanel";
import ParticleBackground from "../components/ParticleBackground";
import { canvasToBlob } from "../utils/canvasToBlob";
import { BrainCircuit, Palette } from "lucide-react";

type Prediction = { label: string; confidence: number };

export default function Home() {
  const controllerRef = useRef<AbortController | null>(null);
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

  const handleDone = async (canvas: HTMLCanvasElement) => {
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
  };

  const handleDrawStart = () => {
    setHasDrawn(true);
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-slate-900 selection:bg-purple-500/30">
      {/* 1. Background Layer */}
      <div className="absolute inset-0 z-0">
        <ParticleBackground />
        {/* Ambient Glow Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        
        {/* 2. Header Section */}
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center mb-10 space-y-4"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight" style={{ fontFamily: "Fredoka, sans-serif" }}>
            <span className="bg-gradient-to-r from-fuchsia-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg">
              Sketch
            </span>
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent drop-shadow-lg ml-3">
              IQ
            </span>
          </h1>

          <p className="text-lg text-slate-300 max-w-lg mx-auto leading-relaxed" style={{ fontFamily: "Nunito, sans-serif" }}>
            Draw a doodle and watch our <span className="text-indigo-300 font-semibold">Neural Network</span> guess it in real-time.
          </p>
        </motion.header>

        {/* 3. Main Glass Dashboard */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-6xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 p-8 md:p-12 lg:p-14 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] ring-1 ring-white/5">
            
            {/* Left Column: Canvas Area */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between mb-2 px-2">
                <div className="flex items-center gap-2 text-white/80">
                  <Palette className="w-5 h-5 text-fuchsia-400" />
                  <span className="font-semibold text-lg">Canvas</span>
                </div>
                {hasDrawn && !isLoading && (
                  <span className="text-xs text-emerald-400 font-medium bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20">
                    Image Ready
                  </span>
                )}
              </div>
              
              <DrawingCanvas
                onPredict={handlePredict}
                onDone={handleDone}
                onClear={handleClear}
                onDrawStart={handleDrawStart}
                isLoading={isLoading}
                hasDrawn={hasDrawn}
                clearVersion={clearVersion}
              />
            </div>

            {/* Right Column: Prediction Results */}
            <div className="flex flex-col gap-4 min-h-[400px] lg:min-h-0 h-full">
               <div className="flex items-center gap-2 text-white/80 mb-2 px-2">
                  <BrainCircuit className="w-5 h-5 text-cyan-400" />
                  <span className="font-semibold text-lg">Analysis</span>
                </div>
                
                <div className="flex-1 min-h-[350px] rounded-xl bg-black/20 border border-white/5 overflow-hidden relative">
                   <PredictionPanel
                    predictions={predictions}
                    isLoading={isLoading}
                    hasDrawn={hasDrawn}
                  />
                  {/* Decorative faint grid background for tech feel */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                </div>
            </div>

          </div>
        </motion.div>

        </div>

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
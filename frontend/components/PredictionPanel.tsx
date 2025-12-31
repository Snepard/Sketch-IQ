"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Prediction {
  label: string;
  confidence: number;
}

interface PredictionPanelProps {
  predictions: Prediction[] | null;
  isLoading: boolean;
  hasDrawn: boolean;
  onDone: () => void;
  onClear: () => void;
}

const emojiMap: { [key: string]: string } = {
  airplane: "✈️",
  ambulance: "🚑",
  angel: "👼",
  ant: "🐜",
  anvil: "🔨",
  camera: "📷",
  car: "🚗",
  cat: "🐱",
  circle: "⭕",
  clock: "🕐",
  cookie: "🍪",
  crown: "👑",
  donut: "🍩",
  eye: "👁️",
  fish: "🐟",
  guitar: "🎸",
  hamburger: "🍔",
  parachute: "🪂",
  popsicle: "🍦",
  spider: "🕷️",
  square: "🟦",
  star: "⭐",
  tent: "⛺",
  tree: "🌳",
  triangle: "🔺",
};

const getEmoji = (label: string) => {
  return emojiMap[label.toLowerCase()] || "🎨";
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 80) return "from-emerald-400 to-green-500";
  if (confidence >= 60) return "from-yellow-400 to-amber-500";
  if (confidence >= 40) return "from-orange-400 to-orange-500";
  return "from-red-400 to-red-500";
};

const getConfidenceEmoji = (confidence: number) => {
  if (confidence >= 80) return "🎉";
  if (confidence >= 60) return "🤔";
  if (confidence >= 40) return "😅";
  return "🤷";
};

export default function PredictionPanel({
  predictions,
  isLoading,
  hasDrawn,
  onDone,
  onClear,
}: PredictionPanelProps) {
  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ fontFamily: "Nunito, sans-serif" }}
    >
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {/* Loading State */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center"
            >
              <motion.div
                className="relative w-16 h-16"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 border-r-emerald-400" />
                <span className="absolute inset-0 flex items-center justify-center text-2xl">
                  🧠
                </span>
              </motion.div>
              <p className="mt-4 text-white/70 text-sm">
                Guessing...
              </p>
            </motion.div>
          )}

          {/* Empty State - Default View */}
          {!isLoading && !predictions && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center py-4"
            >
              {/* Paint Palette Icon */}
              <motion.div
                className="text-6xl mb-5"
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎨
              </motion.div>
              
              <p className="text-white/80 text-base mb-5">
                Draw something and let AI guess!
              </p>
              
              {/* Emoji Row */}
              <div className="flex gap-3 mb-8">
                {["🐱", "🌳", "🚗", "⭐", "🍞"].map((emoji, i) => (
                  <motion.span
                    key={i}
                    className="text-2xl"
                    animate={{ y: [0, -3, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  >
                    {emoji}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Predictions View */}
          {!isLoading && predictions && (
            <motion.div
              key="predictions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full space-y-2 max-h-[200px] overflow-y-auto"
            >
              {predictions.map((p: Prediction, index: number) => (
                <motion.div
                  key={p.label}
                  initial={{ opacity: 0, x: -20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.1,
                    type: "spring",
                    bounce: 0.4,
                  }}
                  className={`relative overflow-hidden rounded-xl p-3 ${
                    index === 0
                      ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30"
                      : "bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank */}
                    <motion.div
                      className={`w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-xs ${
                        index === 0
                          ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900"
                          : "bg-white/10 text-white/60"
                      }`}
                      animate={index === 0 ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {index + 1}
                    </motion.div>

                    {/* Emoji */}
                    <span className="text-xl flex-shrink-0">
                      {getEmoji(p.label)}
                    </span>

                    {/* Label and Confidence */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`font-semibold capitalize truncate text-sm ${
                            index === 0 ? "text-white" : "text-white/80"
                          }`}
                        >
                          {p.label}
                        </span>
                        <span
                          className={`font-bold whitespace-nowrap text-sm ${
                            index === 0
                              ? "text-emerald-400"
                              : "text-white/60"
                          }`}
                        >
                          {p.confidence}%
                        </span>
                      </div>

                      {/* Confidence Bar */}
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${p.confidence}%` }}
                          transition={{
                            duration: 0.8,
                            delay: index * 0.1 + 0.3,
                            ease: "easeOut",
                          }}
                          className={`h-full rounded-full bg-gradient-to-r ${getConfidenceColor(
                            p.confidence
                          )}`}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="p-4 flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02, rotateX: 2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onDone}
          className="cursor-pointer flex-1 px-5 py-2.5 rounded-lg font-semibold text-sm text-white bg-emerald-500 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Done
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, rotateX: 2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClear}
          className="cursor-pointer flex-1 px-5 py-2.5 rounded-lg font-semibold text-sm text-white bg-rose-500 hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Clear
        </motion.button>
      </div>
    </div>
  );
}

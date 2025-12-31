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
}: PredictionPanelProps) {
  return (
    <div
      className="w-full h-full min-h-[350px] p-5 overflow-y-auto"
      style={{ fontFamily: "Nunito, sans-serif" }}
    >
      <AnimatePresence mode="wait">
        {/* Loading State */}
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-64"
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

        {/* Empty State */}
            {!isLoading && !predictions && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full min-h-[280px] text-center px-4"
              >
                <motion.span
                  className="text-5xl mb-4"
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {hasDrawn ? "🎯" : "🎨"}
                </motion.span>
                <p className="text-white/60 text-base leading-relaxed max-w-[280px]">
                  {hasDrawn
                    ? "Keep drawing — updating guess every 2 seconds."
                    : "Draw something and let AI guess!"}
                </p>
                <motion.div
                  className="mt-4 flex gap-2"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {["🐱", "🌳", "🚗", "⭐", "🍩"].map((emoji, i) => (
                    <motion.span
                      key={i}
                      className="text-2xl"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    >
                      {emoji}
                    </motion.span>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Predictions */}
            {!isLoading && predictions && (
              <motion.div
                key="predictions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
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
                    whileHover={{ scale: 1.02, x: 5 }}
                    className={`relative overflow-hidden rounded-2xl p-4 ${
                      index === 0
                        ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30"
                        : "bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Rank */}
                      <motion.div
                        className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${
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
                      <motion.span
                        className="text-2xl flex-shrink-0"
                        animate={
                          index === 0 ? { rotate: [0, 10, -10, 0] } : {}
                        }
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        {getEmoji(p.label)}
                      </motion.span>

                      {/* Label and Confidence */}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span
                            className={`font-bold capitalize truncate ${
                              index === 0 ? "text-white text-lg" : "text-white/80"
                            }`}
                          >
                            {p.label}
                          </span>
                          <span className="flex items-center gap-1 flex-shrink-0">
                            <span
                              className={`font-bold whitespace-nowrap ${
                                index === 0
                                  ? "text-xl bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
                                  : "text-white/60"
                              }`}
                            >
                              {p.confidence}%
                            </span>
                            {index === 0 && (
                              <motion.span
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                              >
                                {getConfidenceEmoji(p.confidence)}
                              </motion.span>
                            )}
                          </span>
                        </div>

                        {/* Confidence Bar */}
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
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

                {/* Fun message based on confidence */}
                {predictions[0] && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-5 text-center p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10"
                  >
                    <p className="text-white/80 text-sm leading-relaxed">
                      {predictions[0].confidence >= 80
                        ? "🎉 AI is confident about this!"
                        : predictions[0].confidence >= 60
                        ? "🤔 Decent guess!"
                        : predictions[0].confidence >= 40
                        ? "😅 Taking a wild guess..."
                        : "🤷 Try drawing it differently?"}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
    </div>
  );
}

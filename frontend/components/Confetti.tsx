"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  rotation: number;
  size: number;
  shape: "square" | "circle" | "triangle";
}

const colors = [
  "#ff6b6b",
  "#feca57",
  "#48dbfb",
  "#ff9ff3",
  "#54a0ff",
  "#5f27cd",
  "#00d2d3",
  "#1dd1a1",
  "#ff9f43",
  "#ee5a5a",
  "#a55eea",
  "#26de81",
];

export default function Confetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const newPieces: ConfettiPiece[] = [];
    const shapes: ("square" | "circle" | "triangle")[] = [
      "square",
      "circle",
      "triangle",
    ];

    for (let i = 0; i < 100; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        size: Math.random() * 10 + 5,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }
    setPieces(newPieces);
  }, []);

  const renderShape = (piece: ConfettiPiece) => {
    switch (piece.shape) {
      case "circle":
        return (
          <div
            className="rounded-full"
            style={{
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
            }}
          />
        );
      case "triangle":
        return (
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: `${piece.size / 2}px solid transparent`,
              borderRight: `${piece.size / 2}px solid transparent`,
              borderBottom: `${piece.size}px solid ${piece.color}`,
            }}
          />
        );
      default:
        return (
          <div
            style={{
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
            }}
          />
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 pointer-events-none z-50"
    >
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: -20,
          }}
          initial={{
            y: 0,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: window.innerHeight + 100,
            rotate: piece.rotation + 720,
            opacity: [1, 1, 0],
            x: [0, Math.random() * 100 - 50, Math.random() * 200 - 100],
          }}
          transition={{
            duration: Math.random() * 2 + 2,
            delay: Math.random() * 0.5,
            ease: "easeOut",
          }}
        >
          {renderShape(piece)}
        </motion.div>
      ))}

      {/* Emoji burst */}
      {["🎉", "🎊", "✨", "🌟", "💫", "🎯", "🏆"].map((emoji, i) => (
        <motion.div
          key={`emoji-${i}`}
          className="absolute text-4xl"
          style={{
            left: `${10 + i * 12}%`,
            top: "30%",
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
            y: [0, -100],
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.1,
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </motion.div>
  );
}

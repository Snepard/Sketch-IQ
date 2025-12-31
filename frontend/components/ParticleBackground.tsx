"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

interface Star {
  id: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
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
];

export default function ParticleBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [stars, setStars] = useState<Star[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Generate particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * 20 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 10,
      });
    }
    setParticles(newParticles);

    // Generate stars
    const newStars: Star[] = [];
    for (let i = 0; i < 20; i++) {
      newStars.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: Math.random() * 2 + 1,
        delay: Math.random() * 3,
      });
    }
    setStars(newStars);
  }, []);

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" />;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Gradient Orbs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          top: "10%",
          left: "10%",
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-80 h-80 rounded-full blur-3xl opacity-20"
        style={{
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          top: "50%",
          right: "10%",
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, -60, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-72 h-72 rounded-full blur-3xl opacity-15"
        style={{
          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          bottom: "20%",
          left: "30%",
        }}
        animate={{
          x: [0, 60, 0],
          y: [0, -40, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            bottom: -20,
          }}
          animate={{
            y: [0, -1200],
            rotate: [0, 360],
            opacity: [0, 0.6, 0.6, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Twinkling Stars */}
      {stars.map((star) => (
        <motion.div
          key={`star-${star.id}`}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
}

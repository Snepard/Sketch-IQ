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
  "#ff6b9d",
  "#c44dff",
  "#6b5bff",
  "#00d4ff",
  "#ff4d94",
  "#9d4edd",
  "#7b68ee",
  "#00bfff",
  "#ff69b4",
  "#8a2be2",
];

export default function ParticleBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [stars, setStars] = useState<Star[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Generate particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * 6 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 10,
      });
    }
    setParticles(newParticles);

    // Generate stars
    const newStars: Star[] = [];
    for (let i = 0; i < 40; i++) {
      newStars.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: Math.random() * 3 + 1,
        delay: Math.random() * 5,
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
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-30"
        style={{
          background: "linear-gradient(135deg, #6b21a8 0%, #7c3aed 100%)",
          top: "5%",
          left: "5%",
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-80 h-80 rounded-full blur-3xl opacity-25"
        style={{
          background: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
          top: "40%",
          right: "5%",
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-72 h-72 rounded-full blur-3xl opacity-20"
        style={{
          background: "linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)",
          bottom: "10%",
          left: "25%",
        }}
        animate={{
          x: [0, 40, 0],
          y: [0, -20, 0],
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
            bottom: -10,
            filter: "blur(0.5px)",
          }}
          animate={{
            y: [0, -1200],
            opacity: [0, 0.8, 0.8, 0],
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
          className="absolute bg-white rounded-full"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: Math.random() > 0.5 ? 2 : 1,
            height: Math.random() > 0.5 ? 2 : 1,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.2, 0.8],
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

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useCollectionAnimationStore } from "@/lib/stores/collection-animation-store";

interface PlantCaptureAnimationProps {
  plantImageUrl: string;
  onComplete: () => void;
}

const PARTICLE_COUNT = 14;
const PARTICLE_COLORS = [
  "var(--color-primary)",
  "var(--color-primary-light, #6B8F61)",
  "var(--color-accent)",
  "#A8D5A2",
  "#E8C4A8",
];

interface TargetCoords {
  x: number;
  y: number;
}

export function PlantCaptureAnimation({
  plantImageUrl,
  onComplete,
}: PlantCaptureAnimationProps) {
  const triggerBounce = useCollectionAnimationStore((s) => s.triggerBounce);
  const [target, setTarget] = useState<TargetCoords | null>(null);
  const hasCompleted = useRef(false);

  useEffect(() => {
    const el = document.getElementById("collection-icon");
    if (el) {
      const rect = el.getBoundingClientRect();
      setTarget({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    } else {
      setTarget({ x: window.innerWidth / 2, y: window.innerHeight - 40 });
    }
  }, []);

  const handleFlightComplete = () => {
    if (hasCompleted.current) return;
    hasCompleted.current = true;
    triggerBounce();
    onComplete();
  };

  const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 200;
  const centerY = typeof window !== "undefined" ? window.innerHeight / 2 : 400;

  if (!target) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] pointer-events-none"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Confetti burst from center */}
      <ConfettiBurst centerX={centerX} centerY={centerY} />

      {/* Plant image animation */}
      <motion.img
        src={plantImageUrl}
        alt=""
        className="absolute h-16 w-16 rounded-full object-cover shadow-lg ring-2 ring-white"
        style={{ left: 0, top: 0, translateX: "-50%", translateY: "-50%" }}
        initial={{
          x: centerX,
          y: centerY,
          scale: 0,
          opacity: 0,
        }}
        animate={{
          x: [centerX, centerX, centerX, target.x],
          y: [centerY, centerY, centerY - 8, target.y],
          scale: [0, 1.2, 1, 0],
          opacity: [0, 1, 1, 0],
          rotate: [0, 0, -5, 0],
        }}
        transition={{
          duration: 1.6,
          times: [0, 0.18, 0.5, 1],
          ease: [0.25, 0.1, 0.25, 1],
        }}
        onAnimationComplete={handleFlightComplete}
      />
    </motion.div>
  );
}

function ConfettiBurst({ centerX, centerY }: { centerX: number; centerY: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const distance = 60 + Math.random() * 80;
        return {
          id: i,
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance,
          size: 4 + Math.random() * 4,
          color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
          delay: Math.random() * 0.1,
        };
      }),
    [],
  );

  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            left: centerX,
            top: centerY,
            translateX: "-50%",
            translateY: "-50%",
          }}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{
            x: p.dx,
            y: p.dy,
            scale: [0, 1.2, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.8,
            delay: 0.1 + p.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </>
  );
}

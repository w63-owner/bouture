"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SPLASH_DURATION_MS = 3800;
const STORAGE_KEY = "bouture-splash";

export function SplashScreen() {
  const [show, setShow] = useState(true);
  const dismiss = useCallback(() => setShow(false), []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) {
        setShow(false);
        return;
      }
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* storage unavailable */
    }
    const t = setTimeout(dismiss, SPLASH_DURATION_MS);
    return () => clearTimeout(t);
  }, [dismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none cursor-pointer"
          style={{ backgroundColor: "var(--color-secondary, #F5F0E8)" }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          onClick={dismiss}
        >
          <BoutureGrowAnimation />

          <motion.h1
            className="mt-8 text-3xl tracking-tight"
            style={{
              color: "var(--color-primary, #4A6741)",
              fontFamily: "var(--font-display, Fraunces, serif)",
              fontWeight: 600,
            }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.9, duration: 0.6, ease: "easeOut" }}
          >
            Bouture
          </motion.h1>

          <motion.p
            className="mt-3 px-10 text-sm text-center leading-relaxed"
            style={{
              color: "var(--color-neutral-600, #6B6B68)",
              fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
              maxWidth: 280,
            }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.15, duration: 0.6, ease: "easeOut" }}
          >
            Le 1<sup>er</sup> réseau social d&apos;échanges
            <br />
            de plantes entre voisins
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const leafSpring = { type: "spring" as const, stiffness: 180, damping: 14 };

function BoutureGrowAnimation() {
  return (
    <svg viewBox="0 0 120 160" className="w-40 h-auto" aria-hidden>
      <defs>
        <linearGradient id="_sg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7CC462" />
          <stop offset="100%" stopColor="#4A8F3A" />
        </linearGradient>
        <linearGradient id="_sg2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#93DB7A" />
          <stop offset="100%" stopColor="#5EAF48" />
        </linearGradient>
        <linearGradient id="_sp" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#6B7E6B" />
          <stop offset="100%" stopColor="#4A5E4A" />
        </linearGradient>
        <linearGradient id="_spr" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#7A8E7A" />
          <stop offset="100%" stopColor="#5A6E5A" />
        </linearGradient>
      </defs>

      {/* Shadow under pot */}
      <motion.ellipse
        cx="60"
        cy="142"
        rx="26"
        ry="4"
        fill="rgba(0,0,0,0.07)"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />

      {/* Pot body */}
      <motion.path
        d="M42,98 L38,132 Q38,140 46,140 L74,140 Q82,140 82,132 L78,98 Z"
        fill="url(#_sp)"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          delay: 0.1,
          duration: 0.55,
          type: "spring",
          bounce: 0.3,
        }}
      />

      {/* Pot facet lines for geometric feel */}
      <motion.line
        x1="60"
        y1="98"
        x2="59"
        y2="139"
        stroke="rgba(0,0,0,0.08)"
        strokeWidth="0.8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      />
      <motion.line
        x1="48"
        y1="98"
        x2="44"
        y2="135"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="0.8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      />
      <motion.line
        x1="72"
        y1="98"
        x2="76"
        y2="135"
        stroke="rgba(0,0,0,0.06)"
        strokeWidth="0.8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      />

      {/* Pot rim */}
      <motion.rect
        x="35"
        y="90"
        width="50"
        height="10"
        rx="3"
        fill="url(#_spr)"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          delay: 0.1,
          duration: 0.55,
          type: "spring",
          bounce: 0.3,
        }}
      />

      {/* Rim highlight */}
      <motion.rect
        x="38"
        y="91"
        width="44"
        height="2"
        rx="1"
        fill="rgba(255,255,255,0.15)"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          delay: 0.1,
          duration: 0.55,
          type: "spring",
          bounce: 0.3,
        }}
      />

      {/* Soil */}
      <motion.ellipse
        cx="60"
        cy="99"
        rx="19"
        ry="3.5"
        fill="#3D4D3D"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />

      {/* Stem growing upward */}
      <motion.path
        d="M60,98 C60,80 59,62 58,40"
        stroke="#5A9F4A"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
      />

      {/* Leaf: bottom right */}
      <motion.path
        d="M60,80 Q78,68 86,54 Q70,66 60,80Z"
        fill="url(#_sg1)"
        initial={{ scale: 0, opacity: 0, rotate: -30 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ delay: 1.0, ...leafSpring }}
        style={{ transformBox: "fill-box", transformOrigin: "0% 100%" }}
      />
      <motion.path
        d="M63,77 Q74,67 80,58"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="0.6"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 1.2, duration: 0.3 }}
      />

      {/* Leaf: bottom left */}
      <motion.path
        d="M59,74 Q41,64 34,50 Q49,60 59,74Z"
        fill="url(#_sg1)"
        initial={{ scale: 0, opacity: 0, rotate: 30 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ delay: 1.15, ...leafSpring }}
        style={{ transformBox: "fill-box", transformOrigin: "100% 100%" }}
      />
      <motion.path
        d="M57,72 Q46,63 40,54"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="0.6"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 1.35, duration: 0.3 }}
      />

      {/* Leaf: top right */}
      <motion.path
        d="M59,58 Q74,48 82,34 Q67,46 59,58Z"
        fill="url(#_sg2)"
        initial={{ scale: 0, opacity: 0, rotate: -30 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ delay: 1.3, ...leafSpring }}
        style={{ transformBox: "fill-box", transformOrigin: "0% 100%" }}
      />

      {/* Leaf: top left */}
      <motion.path
        d="M58,52 Q43,42 36,30 Q51,42 58,52Z"
        fill="url(#_sg2)"
        initial={{ scale: 0, opacity: 0, rotate: 30 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ delay: 1.45, ...leafSpring }}
        style={{ transformBox: "fill-box", transformOrigin: "100% 100%" }}
      />

      {/* Top leaf (new growth) */}
      <motion.path
        d="M58,44 Q55,26 58,16 Q63,26 60,44Z"
        fill="url(#_sg2)"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ delay: 1.6, ...leafSpring }}
        style={{ transformBox: "fill-box", transformOrigin: "center bottom" }}
      />

      {/* Water drop on pot */}
      <motion.path
        d="M76,122 Q78,115 76,111 Q74,115 76,122Z"
        fill="#8CC8D6"
        fillOpacity={0.55}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7, duration: 0.4, ease: "easeOut" }}
      />
    </svg>
  );
}

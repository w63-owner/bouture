"use client";

import { useState, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
} from "framer-motion";
import { X } from "lucide-react";

interface LightboxProps {
  images: string[];
  initialIndex: number;
  baseLayoutId: string;
  onClose: () => void;
}

const DISMISS_THRESHOLD = 100;
const VELOCITY_THRESHOLD = 500;
const SWIPE_THRESHOLD = 50;

export function Lightbox({
  images,
  initialIndex,
  baseLayoutId,
  onClose,
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const dragLinkedOpacity = useTransform(y, [-300, 0, 300], [0, 1, 0]);
  const imgScale = useTransform(y, [-300, 0, 300], [0.85, 1, 0.85]);

  const goToNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, images.length - 1));
  }, [images.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;

      if (
        Math.abs(offset.y) > DISMISS_THRESHOLD ||
        Math.abs(velocity.y) > VELOCITY_THRESHOLD
      ) {
        onClose();
        return;
      }

      if (offset.x < -SWIPE_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD) {
        goToNext();
      } else if (
        offset.x > SWIPE_THRESHOLD ||
        velocity.x > VELOCITY_THRESHOLD
      ) {
        goToPrev();
      }

      animate(y, 0, { type: "spring", stiffness: 300, damping: 30 });
      animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
    },
    [onClose, goToNext, goToPrev, x, y],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop: outer layer handles mount/exit fade */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Inner layer: opacity linked to vertical drag */}
        <motion.div
          className="absolute inset-0 bg-black/95"
          style={{ opacity: dragLinkedOpacity }}
        />
      </motion.div>

      {/* Header */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3"
        style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 12px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <span className="text-white/80 text-sm font-medium">
          {currentIndex + 1}/{images.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:text-white backdrop-blur-sm transition-colors"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>
      </motion.div>

      {/* Pagination dots */}
      {images.length > 1 && (
        <motion.div
          className="absolute bottom-6 left-0 right-0 z-10 flex justify-center gap-1.5"
          style={{
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === currentIndex
                  ? "w-4 bg-white"
                  : "w-1.5 bg-white/40"
              }`}
              aria-label={`Photo ${i + 1}`}
            />
          ))}
        </motion.div>
      )}

      {/* Image */}
      <motion.img
        src={images[currentIndex]}
        alt={`Photo ${currentIndex + 1}`}
        layoutId={`${baseLayoutId}-${initialIndex}`}
        className="relative z-[1] max-h-[85dvh] max-w-full object-contain select-none touch-none"
        drag
        dragDirectionLock
        style={{ x, y, scale: imgScale }}
        onDragEnd={handleDragEnd}
        draggable={false}
        transition={{
          layout: { type: "spring", stiffness: 350, damping: 30 },
        }}
      />
    </div>
  );
}

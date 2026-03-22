"use client";

import { useState, useCallback, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { X } from "lucide-react";
import { useMapStore } from "@/lib/stores/map-store";
import { Chip } from "@/components/ui/chip";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import type { ListingSize } from "@/lib/types/listing";

const SIZE_OPTIONS: { value: ListingSize; label: string }[] = [
  { value: "graine", label: "Graine" },
  { value: "tubercule", label: "Tubercule" },
  { value: "xs", label: "XS" },
  { value: "s", label: "S" },
  { value: "m", label: "M" },
  { value: "l", label: "L" },
  { value: "xl", label: "XL" },
  { value: "xxl", label: "XXL" },
];

const DEFAULT_RADIUS = 50;
const DISMISS_THRESHOLD = 100;

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
}

export function FilterSheet({ open, onClose }: FilterSheetProps) {
  const filters = useMapStore((s) => s.filters);
  const setFilters = useMapStore((s) => s.setFilters);
  const resetFilters = useMapStore((s) => s.resetFilters);

  const [selectedSizes, setSelectedSizes] = useState<ListingSize[]>(
    filters.sizes ?? [],
  );
  const [radius, setRadius] = useState(filters.radiusKm ?? DEFAULT_RADIUS);

  useEffect(() => {
    if (open) {
      setSelectedSizes(filters.sizes ?? []);
      setRadius(filters.radiusKm ?? DEFAULT_RADIUS);
    }
  }, [open, filters.sizes, filters.radiusKm]);

  const y = useMotionValue(0);
  const backdropOpacity = useTransform(y, [0, 400], [0.3, 0]);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (info.offset.y > DISMISS_THRESHOLD || info.velocity.y > 500) {
        onClose();
      }
    },
    [onClose],
  );

  const toggleSize = useCallback((size: ListingSize) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  }, []);

  const handleApply = useCallback(() => {
    setFilters({
      sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
      radiusKm: radius < DEFAULT_RADIUS ? radius : undefined,
    });
    onClose();
  }, [selectedSizes, radius, setFilters, onClose]);

  const handleReset = useCallback(() => {
    resetFilters();
    setSelectedSizes([]);
    setRadius(DEFAULT_RADIUS);
    onClose();
  }, [resetFilters, onClose]);

  const hasChanges =
    selectedSizes.length > 0 || radius < DEFAULT_RADIUS;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="filter-backdrop"
            className="absolute inset-0 z-20 bg-black"
            style={{ opacity: backdropOpacity }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="filter-sheet"
            className="absolute bottom-0 left-0 right-0 z-30 max-h-[80dvh] overflow-hidden rounded-t-sheet bg-white shadow-sheet"
            style={{ y }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={springTransition}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-neutral-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-2 pb-4">
              <h2 className="text-lg font-heading font-semibold text-neutral-900">
                Filtres
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto px-5 pb-6 space-y-6">
              {/* Size filter */}
              <div>
                <p className="text-sm font-semibold text-neutral-900 mb-3">
                  Taille de la bouture
                </p>
                <div className="flex flex-wrap gap-2">
                  {SIZE_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.value}
                      label={opt.label}
                      selected={selectedSizes.includes(opt.value)}
                      onToggle={() => toggleSize(opt.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Distance slider */}
              <Slider
                min={1}
                max={50}
                step={1}
                value={radius}
                onChange={setRadius}
                label="Rayon de recherche"
                formatValue={(v) => `${v} km`}
              />

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  size="default"
                  className="flex-1"
                  onClick={handleReset}
                  disabled={!hasChanges}
                >
                  Réinitialiser
                </Button>
                <Button
                  variant="secondary"
                  size="default"
                  className="flex-1"
                  onClick={handleApply}
                >
                  Appliquer
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

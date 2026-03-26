"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { X, MessageCircle, Clock, Repeat2 } from "lucide-react";
import { useMapStore } from "@/lib/stores/map-store";
import { PhotoCarousel } from "@/components/ui/carousel";
import { SizeBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { timeAgo } from "@/lib/utils/time-ago";
import { startConversation } from "@/app/messages/actions";
import { Lightbox } from "@/components/ui/lightbox";

const DISMISS_THRESHOLD = 100;

const sheetVariants = {
  hidden: { y: "100%" },
  visible: { y: 0 },
};

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

export function ListingBottomSheet() {
  const router = useRouter();
  const selectedListing = useMapStore((s) => s.selectedListing);
  const clearSelection = useMapStore((s) => s.clearSelection);
  const [isPending, startTransition] = useTransition();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    setLightboxIndex(null);
  }, [selectedListing?.id]);

  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 300], [1, 0]);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (info.offset.y > DISMISS_THRESHOLD || info.velocity.y > 500) {
        clearSelection();
      }
    },
    [clearSelection],
  );

  const handleContactClick = useCallback(() => {
    if (!selectedListing) return;
    startTransition(async () => {
      try {
        const conversationId = await startConversation(
          selectedListing.donor_id,
          selectedListing.id,
          selectedListing.species_name,
          selectedListing.size,
        );
        router.push(`/messages/${conversationId}`);
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Erreur lors de la création de la conversation",
        );
      }
    });
  }, [selectedListing, router]);

  return (
    <AnimatePresence>
      {selectedListing && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="absolute inset-0 z-20 bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={clearSelection}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            className="absolute bottom-0 left-0 right-0 z-30 max-h-[85dvh] overflow-hidden rounded-t-sheet bg-white shadow-sheet"
            style={{ y, opacity }}
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
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

            {/* Close button */}
            <button
              type="button"
              onClick={clearSelection}
              className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Photo carousel */}
            <PhotoCarousel
              photos={selectedListing.photos}
              alt={selectedListing.species_name}
              className="rounded-none"
              layoutIdPrefix={`listing-photo-${selectedListing.id}`}
              onPhotoClick={(index) => setLightboxIndex(index)}
            />

            {/* Content */}
            <div className="px-5 pt-4 pb-6 space-y-4">
              {/* Title + badges */}
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-heading font-semibold text-neutral-900 leading-tight">
                  {selectedListing.species_name}
                </h2>
                <div className="flex shrink-0 items-center gap-1.5 mt-0.5">
                  {selectedListing.transaction_type !== "don_uniquement" && (
                    <span className="inline-flex items-center gap-1 rounded-pill bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                      <Repeat2 className="h-3 w-3" />
                      {selectedListing.transaction_type === "echange_uniquement"
                        ? "Échange"
                        : "Don & Échange"}
                    </span>
                  )}
                  <SizeBadge size={selectedListing.size} />
                </div>
              </div>

              {/* Description */}
              {selectedListing.description && (
                <p className="text-sm text-neutral-600 leading-relaxed line-clamp-2">
                  {selectedListing.description}
                </p>
              )}

              {/* Donor info */}
              <div className="flex items-center gap-3">
                {selectedListing.donor_avatar ? (
                  <img
                    src={selectedListing.donor_avatar}
                    alt={selectedListing.donor_username}
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-neutral-100"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold ring-2 ring-neutral-100">
                    {selectedListing.donor_username
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {selectedListing.donor_username}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-neutral-600">
                    <Clock className="h-3 w-3" />
                    <span>{timeAgo(selectedListing.created_at)}</span>
                    {selectedListing.address_city && (
                      <>
                        <span className="mx-1">·</span>
                        <span>{selectedListing.address_city}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Button
                variant="primary"
                className="w-full"
                loading={isPending}
                onClick={handleContactClick}
              >
                <MessageCircle className="h-5 w-5" />
                Contacter le donneur
              </Button>
            </div>
          </motion.div>

          <AnimatePresence>
            {lightboxIndex !== null && (
              <Lightbox
                key="lightbox-sheet"
                images={selectedListing.photos}
                initialIndex={lightboxIndex}
                baseLayoutId={`listing-photo-${selectedListing.id}`}
                onClose={() => setLightboxIndex(null)}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { ArrowLeft, Check, Loader2, Repeat2, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { getUserActiveListings } from "@/lib/supabase/queries/transactions";
import { proposeExchange } from "@/app/messages/actions";

interface ListingItem {
  id: string;
  species_name: string;
  size: string;
  photos: string[];
  address_city: string | null;
  transaction_type: string;
}

interface ExchangeProposalModalProps {
  open: boolean;
  onClose: () => void;
  targetListing: {
    id: string;
    species_name: string;
    size: string;
    photos: string[];
    donor_id: string;
  };
  currentUserId: string;
}

const DISMISS_THRESHOLD = 100;

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

export function ExchangeProposalModal({
  open,
  onClose,
  targetListing,
  currentUserId,
}: ExchangeProposalModalProps) {
  const router = useRouter();
  const [userListings, setUserListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const y = useMotionValue(0);
  const backdropOpacity = useTransform(y, [0, 300], [1, 0]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setSelectedId(null);

    getUserActiveListings(currentUserId)
      .then(setUserListings)
      .catch(() => toast.error("Impossible de charger vos annonces"))
      .finally(() => setLoading(false));
  }, [open, currentUserId]);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (info.offset.y > DISMISS_THRESHOLD || info.velocity.y > 500) {
        onClose();
      }
    },
    [onClose],
  );

  const handlePropose = useCallback(() => {
    if (!selectedId) return;

    startTransition(async () => {
      try {
        const conversationId = await proposeExchange(
          targetListing.id,
          selectedId,
        );
        onClose();
        router.push(`/messages/${conversationId}`);
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Erreur lors de la proposition",
        );
      }
    });
  }, [selectedId, targetListing.id, onClose, router]);

  const selectedListing = userListings.find((l) => l.id === selectedId);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="exchange-backdrop"
            className="fixed inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ opacity: backdropOpacity }}
            onClick={onClose}
          />

          <motion.div
            key="exchange-sheet"
            className="fixed inset-0 z-50 flex flex-col bg-white"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={springTransition}
            style={{ y }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            {/* Header */}
            <header className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3">
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100"
                aria-label="Fermer"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-heading font-semibold text-neutral-900">
                Proposer un échange
              </h2>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 pt-5 pb-32">
              {/* Target listing */}
              <p className="text-sm font-medium text-neutral-600 mb-3">
                Vous souhaitez obtenir…
              </p>
              <div className="flex items-center gap-3 rounded-card border border-neutral-200 bg-neutral-50 p-3 mb-6">
                {targetListing.photos[0] && (
                  <img
                    src={targetListing.photos[0]}
                    alt={targetListing.species_name}
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-neutral-900 truncate">
                    {targetListing.species_name}
                  </p>
                  <p className="text-xs text-neutral-600">
                    Taille {targetListing.size.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Swap icon */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="h-px flex-1 bg-neutral-200" />
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                  <Repeat2 className="h-4 w-4 text-accent" />
                </div>
                <span className="text-xs font-medium text-neutral-600">
                  en échange de
                </span>
                <div className="h-px flex-1 bg-neutral-200" />
              </div>

              {/* User listings */}
              <p className="text-sm font-medium text-neutral-600 mb-3">
                Choisissez parmi vos annonces :
              </p>

              {loading ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-40 animate-pulse rounded-card bg-neutral-100"
                    />
                  ))}
                </div>
              ) : userListings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Sprout className="h-8 w-8 text-primary" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-medium text-neutral-900 mb-1">
                    Aucune annonce active
                  </p>
                  <p className="text-sm text-neutral-600 mb-4 max-w-xs">
                    Publiez d&apos;abord une plante pour pouvoir proposer un échange.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => {
                      onClose();
                      router.push("/donner");
                    }}
                  >
                    Publier une annonce
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {userListings.map((listing) => (
                    <button
                      key={listing.id}
                      type="button"
                      onClick={() => setSelectedId(listing.id)}
                      className={`relative overflow-hidden rounded-card border-2 transition-all ${
                        selectedId === listing.id
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      {listing.photos[0] ? (
                        <img
                          src={listing.photos[0]}
                          alt={listing.species_name}
                          className="aspect-square w-full object-cover"
                        />
                      ) : (
                        <div className="flex aspect-square w-full items-center justify-center bg-neutral-100">
                          <Sprout className="h-8 w-8 text-neutral-400" />
                        </div>
                      )}

                      <div className="p-2.5">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {listing.species_name}
                        </p>
                        <p className="text-xs text-neutral-600">
                          {listing.size.toUpperCase()}
                          {listing.address_city && ` · ${listing.address_city}`}
                        </p>
                      </div>

                      {selectedId === listing.id && (
                        <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sticky CTA */}
            {userListings.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-neutral-100 bg-white/95 backdrop-blur-sm px-5 py-4 safe-area-bottom">
                {selectedListing && (
                  <div className="flex items-center gap-3 mb-3 rounded-card bg-primary/5 p-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {targetListing.photos[0] && (
                        <img
                          src={targetListing.photos[0]}
                          alt={targetListing.species_name}
                          className="h-8 w-8 rounded-lg object-cover"
                        />
                      )}
                      <span className="text-xs font-medium text-neutral-900 truncate">
                        {targetListing.species_name}
                      </span>
                    </div>
                    <Repeat2 className="h-4 w-4 text-accent shrink-0" />
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                      <span className="text-xs font-medium text-neutral-900 truncate">
                        {selectedListing.species_name}
                      </span>
                      {selectedListing.photos[0] && (
                        <img
                          src={selectedListing.photos[0]}
                          alt={selectedListing.species_name}
                          className="h-8 w-8 rounded-lg object-cover"
                        />
                      )}
                    </div>
                  </div>
                )}
                <Button
                  variant="primary"
                  className="w-full"
                  disabled={!selectedId || isPending}
                  loading={isPending}
                  onClick={handlePropose}
                >
                  <Repeat2 className="h-5 w-5" />
                  Proposer cet échange
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

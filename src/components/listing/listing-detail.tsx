"use client";

import { useState, useCallback, useTransition } from "react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MessageCircle,
  Share2,
  Pencil,
  Trash2,
  MapPin,
  Clock,
  Calendar,
  Repeat2,
} from "lucide-react";
import { PhotoCarousel } from "@/components/ui/carousel";
import { SizeBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { timeAgo } from "@/lib/utils/time-ago";
import { deleteListing } from "@/app/carte/[listingId]/actions";
import { startConversation } from "@/app/messages/actions";
import { Lightbox } from "@/components/ui/lightbox";
import { ExchangeProposalModal } from "./exchange-proposal-modal";
import type { ListingSize, TransactionType } from "@/lib/types/listing";

interface ListingData {
  id: string;
  donor_id: string;
  species_name: string;
  size: ListingSize;
  transaction_type: TransactionType;
  description: string | null;
  photos: string[];
  address_city: string | null;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
    created_at: string;
  };
}

interface ListingDetailProps {
  listing: ListingData;
  currentUserId: string | null;
}

export function ListingDetail({ listing, currentUserId }: ListingDetailProps) {
  const router = useRouter();
  const isOwner = currentUserId === listing.donor_id;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const txType = listing.transaction_type;
  const showContact = txType === "don_uniquement" || txType === "les_deux";
  const showExchange = txType === "echange_uniquement" || txType === "les_deux";

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/carte/${listing.id}`;
    const shareData = {
      title: `${listing.species_name} — bouture.app`,
      text: `Découvre cette bouture de ${listing.species_name} sur bouture.app !`,
      url,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié dans le presse-papier !");
    }
  }, [listing.id, listing.species_name]);

  const handleContact = useCallback(() => {
    startTransition(async () => {
      try {
        const conversationId = await startConversation(
          listing.donor_id,
          listing.id,
          listing.species_name,
          listing.size,
        );
        router.push(`/messages/${conversationId}`);
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Erreur lors de la création de la conversation",
        );
      }
    });
  }, [listing.donor_id, listing.id, listing.species_name, listing.size, router]);

  const handleDelete = useCallback(() => {
    startTransition(async () => {
      try {
        await deleteListing(listing.id);
        toast.success("Annonce supprimée !");
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Erreur lors de la suppression",
        );
      }
    });
  }, [listing.id]);

  const memberSince = new Date(listing.profiles.created_at).toLocaleDateString(
    "fr-FR",
    { month: "long", year: "numeric" },
  );

  return (
    <div className="min-h-dvh bg-white">
      {/* Header with back button overlaying the carousel */}
      <div className="relative">
        <Link
          href="/carte"
          className="absolute top-4 left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          aria-label="Retour à la carte"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <PhotoCarousel
          photos={listing.photos}
          alt={listing.species_name}
          aspectRatio="4/3"
          layoutIdPrefix={`listing-photo-${listing.id}`}
          onPhotoClick={(index) => setLightboxIndex(index)}
        />
      </div>

      {/* Content */}
      <div className="px-5 pt-5 pb-32 space-y-6">
        {/* Title + badges */}
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-heading font-semibold text-neutral-900 leading-tight">
            {listing.species_name}
          </h1>
          <div className="flex shrink-0 items-center gap-1.5 mt-1">
            {showExchange && (
              <span className="inline-flex items-center gap-1 rounded-pill bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                <Repeat2 className="h-3 w-3" />
                {txType === "echange_uniquement" ? "Échange" : "Don & Échange"}
              </span>
            )}
            <SizeBadge size={listing.size} />
          </div>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {timeAgo(listing.created_at)}
          </span>
          {listing.address_city && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {listing.address_city}
            </span>
          )}
        </div>

        {/* Description */}
        {listing.description && (
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 mb-1.5">
              Description
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>
        )}

        {/* Divider */}
        <hr className="border-neutral-100" />

        {/* Donor section */}
        <div className="flex items-center gap-3">
          {listing.profiles.avatar_url ? (
            <img
              src={listing.profiles.avatar_url}
              alt={listing.profiles.username}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-neutral-100"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary text-lg font-semibold ring-2 ring-neutral-100">
              {listing.profiles.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <Link
              href={`/u/${listing.profiles.username}`}
              className="text-sm font-semibold text-neutral-900 hover:text-primary transition-colors"
            >
              {listing.profiles.username}
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-neutral-600 mt-0.5">
              <Calendar className="h-3 w-3" />
              <span>Membre depuis {memberSince}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-neutral-100 bg-white/95 backdrop-blur-sm px-5 py-4 safe-area-bottom">
        {isOwner ? (
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" asChild>
              <Link href={`/donner?edit=${listing.id}`}>
                <Pencil className="h-4 w-4" />
                Modifier
              </Link>
            </Button>
            <Button
              variant="primary"
              className="flex-1 !bg-error hover:!bg-error/90"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="default"
              className="shrink-0"
              onClick={handleShare}
              aria-label="Partager"
            >
              <Share2 className="h-5 w-5" />
            </Button>
            {showContact && (
              <Button
                variant={showExchange ? "outline" : "primary"}
                className="flex-1"
                onClick={handleContact}
              >
                <MessageCircle className="h-5 w-5" />
                Contacter
              </Button>
            )}
            {showExchange && currentUserId && (
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => setShowExchangeModal(true)}
              >
                <Repeat2 className="h-5 w-5" />
                Proposer un échange
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Supprimer cette annonce ?"
        description="Cette action est irréversible. L'annonce et toutes ses photos seront définitivement supprimées."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="destructive"
        loading={isPending}
        onConfirm={handleDelete}
      />

      {/* Exchange proposal modal */}
      {currentUserId && showExchange && (
        <ExchangeProposalModal
          open={showExchangeModal}
          onClose={() => setShowExchangeModal(false)}
          targetListing={{
            id: listing.id,
            species_name: listing.species_name,
            size: listing.size,
            photos: listing.photos,
            donor_id: listing.donor_id,
          }}
          currentUserId={currentUserId}
        />
      )}

      {/* Fullscreen lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            key="lightbox"
            images={listing.photos}
            initialIndex={lightboxIndex}
            baseLayoutId={`listing-photo-${listing.id}`}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

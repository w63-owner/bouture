"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Leaf, Clock } from "lucide-react";
import { PhotoCarousel } from "@/components/ui/carousel";
import { SizeBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ListingFormData } from "@/lib/schemas/listing";
import { createClient } from "@/lib/supabase/client";

interface ListingPreviewProps {
  data: ListingFormData;
  existingPhotoUrls?: string[];
  onBack: () => void;
  onPublish: () => void;
  publishing: boolean;
  publishLabel?: string;
  publishingLabel?: string;
}

export function ListingPreview({
  data,
  existingPhotoUrls = [],
  onBack,
  onPublish,
  publishing,
  publishLabel = "Publier",
  publishingLabel = "Publication…",
}: ListingPreviewProps) {
  const [profile, setProfile] = useState<{
    username: string;
    avatar_url: string | null;
  } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", user.id)
        .single()
        .then(({ data: p }) => {
          if (p) setProfile(p);
        });
    });
  }, []);

  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const blobUrls = data.photos.map((f) => URL.createObjectURL(f));
    const allUrls = [...existingPhotoUrls, ...blobUrls];
    setPreviewUrls(allUrls);
    return () => blobUrls.forEach((u) => URL.revokeObjectURL(u));
  }, [data.photos, existingPhotoUrls]);

  return (
    <motion.div
      className="flex flex-1 flex-col"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-neutral-300/50 bg-background/80 px-5 py-4 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            disabled={publishing}
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-display font-semibold text-neutral-900">
            Aperçu
          </h1>
        </div>
      </header>

      {/* Preview card */}
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-32">
        <p className="mb-4 text-sm text-neutral-600">
          Voici comment votre annonce apparaîtra sur la carte :
        </p>

        <div className="overflow-hidden rounded-card bg-white shadow-card">
          <PhotoCarousel
            photos={previewUrls}
            alt={data.species_name}
            className="rounded-none"
          />

          <div className="space-y-4 px-5 pt-4 pb-5">
            {/* Title + badge */}
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-heading font-semibold leading-tight text-neutral-900">
                {data.species_name}
              </h2>
              <SizeBadge size={data.size} className="mt-0.5 shrink-0" />
            </div>

            {/* Description */}
            {data.description && (
              <p className="text-sm leading-relaxed text-neutral-600 line-clamp-3">
                {data.description}
              </p>
            )}

            {/* Donor info */}
            <div className="flex items-center gap-3">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-neutral-100"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-2 ring-neutral-100">
                  {profile?.username?.charAt(0).toUpperCase() ?? (
                    <Leaf className="h-4 w-4" />
                  )}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-neutral-900">
                  {profile?.username ?? "..."}
                </p>
                <div className="flex items-center gap-1 text-xs text-neutral-600">
                  <Clock className="h-3 w-3" />
                  <span>À l&apos;instant</span>
                  {data.address_city && (
                    <>
                      <span className="mx-1">·</span>
                      <span>{data.address_city}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="sticky bottom-0 flex gap-3 border-t border-neutral-300/50 bg-background/80 px-5 py-4 backdrop-blur-md safe-area-bottom">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onBack}
          disabled={publishing}
        >
          Modifier
        </Button>
        <Button
          type="button"
          variant="primary"
          className="flex-1"
          onClick={onPublish}
          loading={publishing}
          disabled={publishing}
        >
          {publishing ? publishingLabel : publishLabel}
        </Button>
      </div>
    </motion.div>
  );
}

"use client";

import { Leaf } from "lucide-react";
import { useMapStore } from "@/lib/stores/map-store";

export function ResultsCount() {
  const listings = useMapStore((s) => s.listings);
  const isLoading = useMapStore((s) => s.isLoadingListings);

  if (isLoading || listings.length === 0) return null;

  const count = listings.length;
  const label =
    count === 1
      ? "1 bouture dans cette zone"
      : `${count} boutures dans cette zone`;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
      <div className="flex items-center gap-2 rounded-pill bg-white/95 backdrop-blur-md px-4 py-2.5 shadow-card text-sm font-medium text-neutral-900">
        <Leaf className="h-4 w-4 text-primary shrink-0" />
        <span>{label}</span>
      </div>
    </div>
  );
}

import Link from "next/link";
import { SizeBadge } from "@/components/ui/badge";
import type { ListingSize } from "@/lib/types/listing";

interface ContextCardProps {
  listingId: string;
  speciesName: string;
  size: string;
  photo: string | null;
  isActive: boolean;
}

export function ContextCard({
  listingId,
  speciesName,
  size,
  photo,
  isActive,
}: ContextCardProps) {
  return (
    <Link
      href={`/carte/${listingId}`}
      className="sticky top-[61px] z-10 flex items-center gap-3 border-b border-neutral-100 bg-neutral-100/80 backdrop-blur-sm px-4 py-2.5 transition-colors hover:bg-neutral-100"
    >
      {photo && (
        <img
          src={photo}
          alt={speciesName}
          className="h-10 w-10 rounded-card object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-neutral-900 truncate">
          {speciesName}
        </p>
        {!isActive && (
          <p className="text-xs text-neutral-600">Annonce désactivée</p>
        )}
      </div>
      <SizeBadge size={size as ListingSize} className="shrink-0" />
    </Link>
  );
}

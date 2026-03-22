"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Pencil, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { SizeBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { toggleListingStatus } from "@/app/profil/annonces/actions";
import type { ListingSize } from "@/lib/types/listing";

interface ListingCardManageProps {
  id: string;
  speciesName: string;
  size: ListingSize;
  photo: string;
  isActive: boolean;
  addressCity: string | null;
  createdAt: string;
}

export function ListingCardManage({
  id,
  speciesName,
  size,
  photo,
  isActive: initialActive,
  addressCity,
  createdAt,
}: ListingCardManageProps) {
  const [isActive, setIsActive] = useState(initialActive);
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const result = await toggleListingStatus(id);
      setIsActive(result.is_active);
      toast.success(result.is_active ? "Annonce réactivée" : "Annonce désactivée");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors du changement de statut");
    } finally {
      setToggling(false);
    }
  };

  const formattedDate = new Date(createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex gap-3 p-3">
        {/* Thumbnail */}
        <Link
          href={`/carte/${id}`}
          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo}
            alt={speciesName}
            className="h-full w-full object-cover"
          />
          <span
            className={`absolute top-1.5 left-1.5 rounded-pill px-2 py-0.5 text-[10px] font-semibold ${
              isActive
                ? "bg-emerald-500 text-white"
                : "bg-neutral-400 text-white"
            }`}
          >
            {isActive ? "Active" : "Désactivée"}
          </span>
        </Link>

        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
          <div>
            <h3 className="truncate text-sm font-semibold text-neutral-900">
              {speciesName}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <SizeBadge size={size} />
              {addressCity && (
                <span className="truncate text-xs text-neutral-600">
                  {addressCity}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-neutral-500">{formattedDate}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex border-t border-neutral-300/50">
        <Link
          href={`/carte/${id}`}
          className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
        >
          <Eye className="h-3.5 w-3.5" />
          Voir
        </Link>
        <div className="w-px bg-neutral-300/50" />
        <Link
          href={`/donner?edit=${id}`}
          className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
        >
          <Pencil className="h-3.5 w-3.5" />
          Modifier
        </Link>
        <div className="w-px bg-neutral-300/50" />
        <button
          type="button"
          onClick={handleToggle}
          disabled={toggling}
          className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors hover:bg-neutral-50 disabled:opacity-50"
        >
          {toggling ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-500" />
          ) : isActive ? (
            <>
              <ToggleRight className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-emerald-600">Active</span>
            </>
          ) : (
            <>
              <ToggleLeft className="h-3.5 w-3.5 text-neutral-400" />
              <span className="text-neutral-500">Réactiver</span>
            </>
          )}
        </button>
      </div>
    </Card>
  );
}

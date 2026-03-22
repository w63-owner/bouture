"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Gift,
  Pencil,
  Trash2,
  Sprout,
  Loader2,
  Calendar,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  getPlantById,
  deletePlant,
  type PlantLibraryItem,
} from "@/lib/supabase/queries/plant-library";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import type { Database } from "@/lib/types/database.types";

type PlantStatus = Database["public"]["Enums"]["plant_status"];

const STATUS_CONFIG: Record<PlantStatus, { label: string; className: string }> =
  {
    collection: {
      label: "Dans ma collection",
      className: "bg-blue-100 text-blue-800",
    },
    for_donation: {
      label: "En don",
      className: "bg-green-100 text-green-800",
    },
    donated: {
      label: "Donné",
      className: "bg-neutral-200 text-neutral-600",
    },
  };

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function PlantDetailPage({
  params,
}: {
  params: Promise<{ plantId: string }>;
}) {
  const { plantId } = use(params);
  const router = useRouter();
  const [plant, setPlant] = useState<PlantLibraryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);

  useEffect(() => {
    getPlantById(plantId).then((data) => {
      setPlant(data);
      setLoading(false);
    });
  }, [plantId]);

  const handleDelete = useCallback(async () => {
    if (!plant) return;
    setDeleting(true);
    try {
      await deletePlant(plant.id);
      toast.success("Plante supprimée");
      router.push("/profil/bibliotheque");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la suppression",
      );
      setDeleting(false);
    }
  }, [plant, router]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
        <Sprout className="h-12 w-12 text-neutral-300" />
        <p className="text-neutral-600">Plante introuvable.</p>
        <Button variant="outline" onClick={() => router.push("/profil/bibliotheque")}>
          Retour à la bibliothèque
        </Button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[plant.status];

  return (
    <div className="flex flex-1 flex-col">
      {/* Photo carousel */}
      <div className="relative aspect-square bg-neutral-100">
        {plant.photos.length > 0 ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={plant.photos[currentPhotoIdx]}
              alt={plant.species_name}
              className="h-full w-full object-cover"
            />
            {plant.photos.length > 1 && (
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {plant.photos.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentPhotoIdx(idx)}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      idx === currentPhotoIdx
                        ? "bg-white"
                        : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Sprout className="h-16 w-16 text-neutral-300" />
          </div>
        )}

        {/* Back button overlay */}
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute top-4 left-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Status badge */}
        <span
          className={`absolute top-4 right-4 rounded-pill px-3 py-1 text-xs font-semibold ${statusConfig.className}`}
        >
          {statusConfig.label}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-5 px-5 pt-5 pb-8">
        <div>
          <h1 className="text-xl font-display font-semibold text-neutral-900">
            {plant.species_name}
          </h1>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-neutral-600">
            <Calendar className="h-3.5 w-3.5" />
            <span>Ajoutée le {formatDate(plant.created_at)}</span>
          </div>
        </div>

        {plant.notes && (
          <div className="rounded-card bg-neutral-100 px-4 py-3">
            <p className="text-sm text-neutral-900 leading-relaxed whitespace-pre-wrap">
              {plant.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-auto">
          {plant.status === "collection" && (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() =>
                router.push(`/donner?plantId=${plant.id}`)
              }
            >
              <Gift className="h-4 w-4" />
              Proposer en don
            </Button>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                toast.error("Bientôt disponible")
              }
            >
              <Pencil className="h-4 w-4" />
              Modifier
            </Button>
            <Button
              variant="ghost"
              className="flex-1 text-error hover:bg-error/5"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer cette plante ?"
        description="Cette action est irréversible. La plante sera retirée de votre bibliothèque."
        confirmLabel="Supprimer"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Loader2 } from "lucide-react";
import type { SpeciesRow } from "@/lib/supabase/queries/species";
import { addPlant } from "@/lib/supabase/queries/plant-library";
import { uploadPlantPhotos } from "@/lib/supabase/storage";
import { PlantIllustration } from "@/components/ui/plant-illustrations";
import { PhotoUpload } from "@/components/listing/photo-upload";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

interface SpeciesPokedexCardProps {
  species: SpeciesRow;
  isOwned: boolean;
  userId: string | null;
  onAdded?: (speciesId: number) => void;
}

const addSchema = z.object({
  photos: z.array(z.instanceof(File)).min(1, "Au moins une photo"),
  notes: z.string().max(300),
});
type AddForm = z.infer<typeof addSchema>;

const NOTES_MAX = 300;

export function SpeciesPokedexCard({
  species,
  isOwned,
  userId,
  onAdded,
}: SpeciesPokedexCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AddForm>({
    resolver: standardSchemaResolver(addSchema),
    defaultValues: { photos: [], notes: "" },
  });

  const notes = watch("notes") ?? "";

  const onSubmit = useCallback(
    async (data: AddForm) => {
      if (!userId) return;
      setSubmitting(true);
      try {
        const photoUrls = await uploadPlantPhotos(userId, data.photos);
        await addPlant(userId, {
          species_name: species.common_name,
          species_id: species.id,
          photos: photoUrls,
          notes: data.notes ?? "",
        });
        toast.success(`${species.common_name} ajoutée à votre collection !`);
        setDialogOpen(false);
        reset();
        onAdded?.(species.id);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Erreur lors de l'ajout",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [userId, species, reset, onAdded],
  );

  const handleCardClick = () => {
    if (!isOwned) {
      setDialogOpen(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleCardClick}
        className={`group relative flex flex-col items-center overflow-hidden rounded-card bg-white shadow-card transition-all duration-300 ${
          isOwned
            ? "ring-2 ring-green-400/60 hover:shadow-md"
            : "grayscale opacity-40 hover:opacity-60 hover:grayscale-[50%]"
        }`}
      >
        {/* Illustration */}
        <div className="relative flex aspect-square w-full items-center justify-center bg-neutral-50 p-4">
          {species.illustration_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={species.illustration_url}
              alt={species.common_name}
              className="h-full w-full object-contain"
            />
          ) : (
            <PlantIllustration
              category={species.visual_category}
              className="h-4/5 w-4/5"
            />
          )}

          {isOwned && (
            <span className="absolute top-2 left-2 rounded-pill bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-800">
              Dans ma collection
            </span>
          )}
        </div>

        {/* Info */}
        <div className="w-full px-2 py-2 text-left">
          <p className="truncate text-xs font-semibold text-neutral-900">
            {species.common_name}
          </p>
          {species.scientific_name && (
            <p className="truncate text-[10px] italic text-neutral-500">
              {species.scientific_name}
            </p>
          )}
        </div>
      </button>

      {/* Add-to-collection dialog */}
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-5 rounded-card bg-white p-6 shadow-sheet focus:outline-none">
            <Dialog.Title className="text-lg font-heading font-semibold text-neutral-900">
              Ajouter {species.common_name}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-neutral-600 leading-relaxed">
              Ajoutez des photos de votre plante pour l&apos;enregistrer dans
              votre collection.
            </Dialog.Description>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              {/* Photos */}
              <Controller
                control={control}
                name="photos"
                render={({ field }) => (
                  <PhotoUpload
                    value={field.value}
                    onChange={(files) => field.onChange(files)}
                    error={errors.photos?.message}
                  />
                )}
              />

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between">
                  <label
                    htmlFor="pokedex-notes"
                    className="text-sm font-semibold text-neutral-900"
                  >
                    Notes
                    <span className="ml-1 font-normal text-neutral-500">
                      (optionnel)
                    </span>
                  </label>
                  <span
                    className={`text-xs tabular-nums ${notes.length > NOTES_MAX ? "text-error" : "text-neutral-500"}`}
                  >
                    {notes.length}/{NOTES_MAX}
                  </span>
                </div>
                <Controller
                  control={control}
                  name="notes"
                  render={({ field }) => (
                    <textarea
                      {...field}
                      id="pokedex-notes"
                      rows={2}
                      maxLength={NOTES_MAX}
                      placeholder="Origine, date de bouturage..."
                      className="w-full resize-none rounded-input border-[1.5px] border-neutral-300 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                    />
                  )}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Dialog.Close asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    disabled={submitting}
                  >
                    Annuler
                  </Button>
                </Dialog.Close>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  loading={submitting}
                >
                  Ajouter
                </Button>
              </div>
            </form>

            <Dialog.Close asChild>
              <button
                type="button"
                className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

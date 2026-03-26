"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { ArrowLeft, Sprout } from "lucide-react";
import { z } from "zod";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { createClient } from "@/lib/supabase/client";
import { addPlant } from "@/lib/supabase/queries/plant-library";
import { uploadPlantPhotos } from "@/lib/supabase/storage";
import { SpeciesAutocomplete } from "@/components/listing/species-autocomplete";
import { PhotoUpload } from "@/components/listing/photo-upload";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

const addPlantSchema = z.object({
  species_name: z.string().min(2, "Nom d'espèce requis"),
  species_id: z.number().nullable(),
  photos: z
    .array(z.instanceof(File))
    .min(1, "Au moins une photo est requise"),
  notes: z.string().max(300),
});

type AddPlantForm = z.infer<typeof addPlantSchema>;

const NOTES_MAX = 300;

function AjouterPlanteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledSpeciesId = searchParams.get("speciesId");
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddPlantForm>({
    resolver: standardSchemaResolver(addPlantSchema),
    mode: "onTouched",
    defaultValues: {
      species_name: "",
      species_id: prefilledSpeciesId ? Number(prefilledSpeciesId) : null,
      photos: [],
      notes: "",
    },
  });

  const notes = watch("notes") ?? "";

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  useEffect(() => {
    if (!prefilledSpeciesId) return;
    const fetchSpecies = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("species")
        .select("id, common_name")
        .eq("id", Number(prefilledSpeciesId))
        .single();
      if (data) {
        setValue("species_name", data.common_name, { shouldValidate: true });
        setValue("species_id", data.id);
      }
    };
    fetchSpecies();
  }, [prefilledSpeciesId, setValue]);

  const handleSpeciesChange = useCallback(
    (name: string, id: number | null) => {
      setValue("species_name", name, { shouldValidate: true });
      setValue("species_id", id);
    },
    [setValue],
  );

  const onSubmit = async (data: AddPlantForm) => {
    if (!userId) return;

    setSubmitting(true);
    try {
      const photoUrls = await uploadPlantPhotos(userId, data.photos);

      await addPlant(userId, {
        species_name: data.species_name,
        species_id: data.species_id,
        photos: photoUrls,
        notes: data.notes ?? "",
      });

      toast.success("Plante ajoutée à votre collection !");
      router.push("/collection");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de l'ajout",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-neutral-300/50 bg-background/80 px-5 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-neutral-900" />
          </button>
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-display font-semibold text-neutral-900">
              Ajouter une plante
            </h1>
          </div>
        </div>
      </header>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 pt-5 pb-32"
      >
        {/* Species */}
        <Controller
          control={control}
          name="species_name"
          render={({ field }) => (
            <SpeciesAutocomplete
              value={field.value}
              speciesId={watch("species_id")}
              onChange={handleSpeciesChange}
              error={errors.species_name?.message}
            />
          )}
        />

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
              htmlFor="notes"
              className="text-sm font-semibold text-neutral-900"
            >
              Notes
              <span className="ml-1 font-normal text-neutral-600">
                (optionnel)
              </span>
            </label>
            <span
              className={`text-xs tabular-nums ${
                notes.length > NOTES_MAX ? "text-error" : "text-neutral-600"
              }`}
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
                id="notes"
                rows={3}
                maxLength={NOTES_MAX}
                placeholder="Origine, date de bouturage, conseils…"
                className="w-full resize-none rounded-input border-[1.5px] border-neutral-300 bg-neutral-100 px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-300 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            )}
          />
        </div>
      </form>

      {/* Sticky submit bar */}
      <div className="sticky bottom-0 border-t border-neutral-300/50 bg-background/80 px-5 py-4 backdrop-blur-md safe-area-bottom">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={submitting}
          onClick={handleSubmit(onSubmit)}
        >
          Ajouter à ma collection
        </Button>
      </div>
    </div>
  );
}

export default function AjouterPlantePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <Sprout className="h-8 w-8 animate-pulse text-primary" />
        </div>
      }
    >
      <AjouterPlanteContent />
    </Suspense>
  );
}

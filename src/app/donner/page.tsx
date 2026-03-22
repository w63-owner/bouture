"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useRouter, useSearchParams } from "next/navigation";
import { Leaf, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import { listingFormSchema, type ListingFormData } from "@/lib/schemas/listing";
import { createClient } from "@/lib/supabase/client";
import { createListing } from "@/lib/supabase/mutations/listings";
import { updatePlant } from "@/lib/supabase/queries/plant-library";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { SpeciesAutocomplete } from "@/components/listing/species-autocomplete";
import { SizeSelector } from "@/components/listing/size-selector";
import { PhotoUpload } from "@/components/listing/photo-upload";
import { AddressPicker } from "@/components/listing/address-picker";
import { ListingPreview } from "@/components/listing/listing-preview";

interface ProfileAddress {
  city: string | null;
  lat: number | null;
  lng: number | null;
}

type PageStep = "form" | "preview";

export default function DonnerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plantId = searchParams.get("plantId");

  const [profile, setProfile] = useState<ProfileAddress | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState<PageStep>("form");
  const [publishing, setPublishing] = useState(false);
  const [pendingData, setPendingData] = useState<ListingFormData | null>(null);
  const [prefilled, setPrefilled] = useState(false);
  const [plantPhotoUrls, setPlantPhotoUrls] = useState<string[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      supabase
        .from("profiles")
        .select("address_city, address_lat, address_lng")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setProfile({
              city: data.address_city,
              lat: data.address_lat,
              lng: data.address_lng,
            });
          }
        });
    });
  }, []);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: standardSchemaResolver(listingFormSchema),
    mode: "onTouched",
    defaultValues: {
      species_name: "",
      species_id: null,
      size: undefined,
      photos: [],
      description: "",
      address_city: "",
      address_lat: 0,
      address_lng: 0,
    },
  });

  useEffect(() => {
    if (!plantId || prefilled) return;

    const supabase = createClient();
    supabase
      .from("plant_library")
      .select("species_name, species_id, photos")
      .eq("id", plantId)
      .single()
      .then(({ data }) => {
        if (data) {
          setValue("species_name", data.species_name, { shouldValidate: true });
          setValue("species_id", data.species_id);
          if (data.photos && data.photos.length > 0) {
            setPlantPhotoUrls(data.photos);
          }
          setPrefilled(true);
        }
      });
  }, [plantId, prefilled, setValue]);

  const description = watch("description") ?? "";
  const DESCRIPTION_MAX = 500;

  const removePlantPhoto = useCallback((idx: number) => {
    setPlantPhotoUrls((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleSpeciesChange = useCallback(
    (name: string, id: number | null) => {
      setValue("species_name", name, { shouldValidate: true });
      setValue("species_id", id);
    },
    [setValue],
  );

  const handleAddressChange = useCallback(
    (city: string, lat: number, lng: number) => {
      setValue("address_city", city, { shouldValidate: true });
      setValue("address_lat", lat);
      setValue("address_lng", lng);
    },
    [setValue],
  );

  const onPreview = (data: ListingFormData) => {
    if (data.photos.length === 0 && plantPhotoUrls.length === 0) {
      toast.error("Ajoute au moins 1 photo");
      return;
    }
    setPendingData(data);
    setStep("preview");
  };

  const onPublish = async () => {
    if (!pendingData || !userId) return;

    setPublishing(true);
    try {
      const result = await createListing(userId, pendingData, {
        existingPhotoUrls: plantPhotoUrls,
      });

      if (plantId) {
        await updatePlant(plantId, { status: "for_donation" }).catch(
          () => {},
        );
      }

      toast.success("Votre bouture est en ligne !");
      router.push(`/carte?highlight=${result.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la publication",
      );
      setPublishing(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {step === "preview" && pendingData ? (
        <ListingPreview
          key="preview"
          data={pendingData}
          onBack={() => setStep("form")}
          onPublish={onPublish}
          publishing={publishing}
        />
      ) : (
        <div key="form" className="flex flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 border-b border-neutral-300/50 bg-background/80 px-5 py-4 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <Leaf className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-display font-semibold text-neutral-900">
                Donner une bouture
              </h1>
            </div>
          </header>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onPreview)}
            className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 pt-5 pb-32"
          >
            {/* 1 — Species */}
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

            {/* 2 — Size */}
            <Controller
              control={control}
              name="size"
              render={({ field }) => (
                <SizeSelector
                  value={field.value}
                  onChange={(size) => field.onChange(size)}
                  error={errors.size?.message}
                />
              )}
            />

            {/* 3 — Photos */}
            {plantPhotoUrls.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-neutral-900">
                  Photos de votre plante
                </label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {plantPhotoUrls.map((url, idx) => (
                    <div
                      key={url}
                      className="relative aspect-square overflow-hidden rounded-card bg-neutral-100"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Photo ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 rounded-pill bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
                          Couverture
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removePlantPhoto(idx)}
                        className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Controller
              control={control}
              name="photos"
              render={({ field }) => (
                <PhotoUpload
                  value={field.value}
                  onChange={(files) => field.onChange(files)}
                  error={errors.photos?.message}
                  max={5 - plantPhotoUrls.length}
                />
              )}
            />

            {/* 4 — Description */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <label
                  htmlFor="description"
                  className="text-sm font-semibold text-neutral-900"
                >
                  Description
                  <span className="ml-1 font-normal text-neutral-600">
                    (optionnel)
                  </span>
                </label>
                <span
                  className={`text-xs tabular-nums ${
                    description.length > DESCRIPTION_MAX
                      ? "text-error"
                      : "text-neutral-600"
                  }`}
                >
                  {description.length}/{DESCRIPTION_MAX}
                </span>
              </div>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <textarea
                    {...field}
                    id="description"
                    rows={4}
                    maxLength={DESCRIPTION_MAX}
                    placeholder="État de la bouture, conseils d'entretien…"
                    className={`
                      w-full resize-none rounded-input
                      border-[1.5px] bg-neutral-100 px-4 py-3
                      text-base text-neutral-900 placeholder:text-neutral-300
                      transition-colors duration-150
                      focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20
                      ${errors.description ? "border-error" : "border-neutral-300"}
                    `}
                  />
                )}
              />
              {errors.description && (
                <p className="text-sm text-error" role="alert">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* 5 — Address */}
            <AddressPicker
              profileCity={profile?.city ?? null}
              profileLat={profile?.lat ?? null}
              profileLng={profile?.lng ?? null}
              value={
                watch("address_city")
                  ? {
                      city: watch("address_city"),
                      lat: watch("address_lat"),
                      lng: watch("address_lng"),
                    }
                  : null
              }
              onChange={handleAddressChange}
              error={errors.address_city?.message}
            />
          </form>

          {/* Sticky submit bar */}
          <div className="sticky bottom-0 border-t border-neutral-300/50 bg-background/80 px-5 py-4 backdrop-blur-md safe-area-bottom">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleSubmit(onPreview)}
            >
              Aperçu avant publication
            </Button>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

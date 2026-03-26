"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useRouter, useSearchParams } from "next/navigation";
import { Leaf, X, Loader2, Sprout, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { listingFormSchema, type ListingFormData } from "@/lib/schemas/listing";
import { createClient } from "@/lib/supabase/client";
import { uploadPlantPhotos } from "@/lib/supabase/storage";
import { createListing, updateListing } from "@/lib/supabase/mutations/listings";
import { getListingForEdit } from "@/lib/supabase/queries/listings";
import {
  getUserCollectionPlants,
  updatePlant,
  addPlant,
  type PlantLibraryItem,
} from "@/lib/supabase/queries/plant-library";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { SpeciesAutocomplete } from "@/components/listing/species-autocomplete";
import { SizeSelector } from "@/components/listing/size-selector";
import { TransactionTypeSelector } from "@/components/listing/transaction-type-selector";
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
  const plantIdParam = searchParams.get("plantId");
  const editId = searchParams.get("edit");
  const isEditMode = Boolean(editId);

  const [profile, setProfile] = useState<ProfileAddress | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState<PageStep>("form");
  const [publishing, setPublishing] = useState(false);
  const [pendingData, setPendingData] = useState<ListingFormData | null>(null);
  const [prefilled, setPrefilled] = useState(false);
  const [plantPhotoUrls, setPlantPhotoUrls] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(isEditMode);

  const [collectionPlants, setCollectionPlants] = useState<PlantLibraryItem[]>([]);
  const [collectionLoading, setCollectionLoading] = useState(true);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      supabase
        .from("profiles")
        .select("address_city, address_lat, address_lng")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setProfile({
              city: data.address_city,
              lat: data.address_lat,
              lng: data.address_lng,
            });
          }
        });

      getUserCollectionPlants(user.id)
        .then((plants) => {
          setCollectionPlants(plants);
          if (plantIdParam) {
            const match = plants.find((p) => p.id === plantIdParam);
            if (match) setSelectedPlantId(match.id);
          }
        })
        .catch(() => {})
        .finally(() => setCollectionLoading(false));
    });
  }, [plantIdParam]);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: standardSchemaResolver(listingFormSchema),
    mode: "onTouched",
    defaultValues: {
      species_name: "",
      species_id: null,
      size: undefined,
      transaction_type: "les_deux",
      photos: [],
      description: "",
      address_city: "",
      address_lat: 0,
      address_lng: 0,
    },
  });

  const selectPlant = useCallback(
    (plant: PlantLibraryItem) => {
      setSelectedPlantId(plant.id);
      setValue("species_name", plant.species_name, { shouldValidate: true });
      setValue("species_id", plant.species_id);
      if (plant.photos && plant.photos.length > 0) {
        setPlantPhotoUrls(plant.photos);
      } else {
        setPlantPhotoUrls([]);
      }
    },
    [setValue],
  );

  // Auto-select from ?plantId= param once collection loads
  useEffect(() => {
    if (!plantIdParam || prefilled || isEditMode || collectionLoading) return;

    const match = collectionPlants.find((p) => p.id === plantIdParam);
    if (match) {
      selectPlant(match);
      setPrefilled(true);
    }
  }, [plantIdParam, prefilled, isEditMode, collectionLoading, collectionPlants, selectPlant]);

  // Prefill from existing listing (edit mode)
  useEffect(() => {
    if (!editId || !userId || prefilled) return;

    setEditLoading(true);
    getListingForEdit(editId, userId)
      .then((listing) => {
        if (!listing) {
          toast.error("Annonce introuvable ou non autorisée");
          router.replace("/profil/annonces");
          return;
        }

        reset({
          species_name: listing.species_name,
          species_id: listing.species_id ?? null,
          size: listing.size as ListingFormData["size"],
          transaction_type: (listing.transaction_type as ListingFormData["transaction_type"]) ?? "les_deux",
          photos: [],
          description: listing.description ?? "",
          address_city: listing.address_city ?? "",
          address_lat: listing.lat,
          address_lng: listing.lng,
        });

        if (listing.photos && listing.photos.length > 0) {
          setPlantPhotoUrls(listing.photos);
        }

        if (listing.plant_library_id) {
          setSelectedPlantId(listing.plant_library_id);
        }

        setPrefilled(true);
      })
      .catch(() => {
        toast.error("Erreur lors du chargement de l'annonce");
        router.replace("/profil/annonces");
      })
      .finally(() => setEditLoading(false));
  }, [editId, userId, prefilled, reset, router]);

  const description = watch("description") ?? "";
  const DESCRIPTION_MAX = 500;

  const removePlantPhoto = useCallback((idx: number) => {
    setPlantPhotoUrls((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleSpeciesChange = useCallback(
    (name: string, id: number | null) => {
      setValue("species_name", name, { shouldValidate: true });
      setValue("species_id", id);

      if (selectedPlantId) {
        const selected = collectionPlants.find((p) => p.id === selectedPlantId);
        if (selected && selected.species_name !== name) {
          setSelectedPlantId(null);
          setPlantPhotoUrls([]);
        }
      }
    },
    [setValue, selectedPlantId, collectionPlants],
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
      if (isEditMode && editId) {
        await updateListing(userId, editId, pendingData, plantPhotoUrls);
        toast.success("Annonce mise à jour !");
        router.push("/profil/annonces");
      } else {
        let plantLibraryId = selectedPlantId;

        if (!plantLibraryId) {
          const photos = plantPhotoUrls.length > 0
            ? plantPhotoUrls
            : pendingData.photos.length > 0
              ? await uploadPlantPhotos(userId, pendingData.photos)
              : [];

          if (photos.length > 0) {
            plantLibraryId = await addPlant(userId, {
              species_name: pendingData.species_name,
              species_id: pendingData.species_id,
              photos,
              notes: "",
            });
          }
        }

        const result = await createListing(userId, pendingData, {
          existingPhotoUrls: plantPhotoUrls,
          plantLibraryId: plantLibraryId ?? undefined,
        });

        if (plantLibraryId) {
          await updatePlant(plantLibraryId, { status: "for_donation" }).catch(
            () => {},
          );
        }

        if (!selectedPlantId && plantLibraryId) {
          toast.success("Plante ajoutée à votre Collection !");
        }
        toast.success("Votre bouture est en ligne !");
        router.push(`/carte?highlight=${result.id}`);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la publication",
      );
      setPublishing(false);
    }
  };

  if (editLoading || collectionLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Empty collection state (create mode only)
  if (!isEditMode && collectionPlants.length === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-neutral-300/50 bg-background/80 px-5 py-4 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <Leaf className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-display font-semibold text-neutral-900">
              Donner une bouture
            </h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <Sprout className="h-12 w-12 text-primary" />
          </div>
          <div>
            <p className="text-lg font-display font-semibold text-neutral-900">
              Votre Collection est vide
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
              Pour proposer une bouture en don, ajoutez d&apos;abord une plante
              à votre Collection.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/collection/ajouter?redirect=/donner")}
          >
            <Sprout className="h-4 w-4" />
            Ajouter une plante à ma Collection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {step === "preview" && pendingData ? (
        <ListingPreview
          key="preview"
          data={pendingData}
          existingPhotoUrls={plantPhotoUrls}
          onBack={() => setStep("form")}
          onPublish={onPublish}
          publishing={publishing}
          publishLabel={isEditMode ? "Mettre à jour" : "Publier"}
          publishingLabel={isEditMode ? "Mise à jour…" : "Publication…"}
        />
      ) : (
        <div key="form" className="flex flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 border-b border-neutral-300/50 bg-background/80 px-5 py-4 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <Leaf className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-display font-semibold text-neutral-900">
                {isEditMode ? "Modifier l'annonce" : "Donner une bouture"}
              </h1>
            </div>
          </header>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onPreview)}
            className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 pt-5 pb-32"
          >
            {/* 0 — Plant Selector (create mode only) */}
            {!isEditMode && collectionPlants.length > 0 && (
              <div className="flex flex-col gap-1.5 -mx-5">
                <label className="px-5 text-sm font-semibold text-neutral-900">
                  Sélectionnez une plante
                </label>
                <div
                  className="flex gap-3 overflow-x-auto px-5 pb-1"
                  style={{ scrollbarWidth: "none" }}
                >
                  {collectionPlants.map((plant) => {
                    const isSelected = selectedPlantId === plant.id;
                    const photo = plant.photos?.[0];
                    return (
                      <motion.button
                        key={plant.id}
                        type="button"
                        onClick={() => selectPlant(plant)}
                        whileTap={{ scale: 0.95 }}
                        className={`relative flex shrink-0 flex-col items-center gap-1.5 rounded-card p-1.5 transition-all duration-150 ${
                          isSelected
                            ? "bg-primary/10 ring-2 ring-primary"
                            : "bg-neutral-50 ring-1 ring-neutral-200 hover:ring-primary/40"
                        }`}
                        style={{ width: 88 }}
                      >
                        <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-neutral-100">
                          {photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={photo}
                              alt={plant.species_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Sprout className="h-6 w-6 text-neutral-300" />
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-primary/30">
                              <Check className="h-5 w-5 text-white drop-shadow-sm" />
                            </div>
                          )}
                        </div>
                        <span className="w-full truncate text-center text-[11px] font-medium text-neutral-800">
                          {plant.species_name}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

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

            {/* 3 — Transaction Type */}
            <Controller
              control={control}
              name="transaction_type"
              render={({ field }) => (
                <TransactionTypeSelector
                  value={field.value}
                  onChange={(type) => field.onChange(type)}
                  error={errors.transaction_type?.message}
                />
              )}
            />

            {/* 4 — Existing photos (plant library or edit mode) */}
            {plantPhotoUrls.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-neutral-900">
                  {isEditMode ? "Photos actuelles" : "Photos de votre plante"}
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

            {/* 5 — Description */}
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

            {/* 6 — Address */}
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
              {isEditMode ? "Aperçu des modifications" : "Aperçu avant publication"}
            </Button>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Sprout,
  ArrowDownAZ,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  getUserPlants,
  type PlantLibraryItem,
} from "@/lib/supabase/queries/plant-library";
import { PlantCard } from "@/components/profile/plant-card";
import Link from "next/link";

type SortMode = "date" | "name";

export default function BibliothequePage() {
  const router = useRouter();
  const [plants, setPlants] = useState<PlantLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortMode>("date");

  const loadPlants = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const data = await getUserPlants(user.id);
      setPlants(data);
    } catch {
      // load failed
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlants();
  }, [loadPlants]);

  const sorted = [...plants].sort((a, b) => {
    if (sort === "name") return a.species_name.localeCompare(b.species_name);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
          <h1 className="flex-1 text-lg font-display font-semibold text-neutral-900">
            Ma bibliothèque
          </h1>
          <Link
            href="/profil/bibliotheque/ajouter"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-btn transition-colors hover:bg-primary-light"
          >
            <Plus className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Sort controls */}
      {plants.length > 0 && (
        <div className="flex gap-2 px-5 pt-4">
          <button
            type="button"
            onClick={() => setSort("date")}
            className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs font-semibold transition-colors ${
              sort === "date"
                ? "bg-primary text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Date
          </button>
          <button
            type="button"
            onClick={() => setSort("name")}
            className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs font-semibold transition-colors ${
              sort === "name"
                ? "bg-primary text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            <ArrowDownAZ className="h-3.5 w-3.5" />
            Nom A–Z
          </button>
        </div>
      )}

      {/* Grid */}
      {plants.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Sprout className="h-10 w-10 text-primary" />
          </div>
          <div>
            <p className="text-base font-semibold text-neutral-900">
              Votre bibliothèque est vide
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              Ajoutez vos plantes pour les retrouver facilement et les proposer
              en don.
            </p>
          </div>
          <Link
            href="/profil/bibliotheque/ajouter"
            className="inline-flex items-center gap-2 rounded-btn bg-primary px-6 py-3 font-semibold text-white shadow-btn transition-all hover:bg-primary-light active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" />
            Ajouter une plante
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-5 pt-4 pb-8 sm:grid-cols-3 lg:grid-cols-4">
          {sorted.map((plant) => (
            <PlantCard
              key={plant.id}
              id={plant.id}
              speciesName={plant.species_name}
              photo={plant.photos[0] ?? null}
              status={plant.status}
            />
          ))}

          {/* Add card */}
          <Link
            href="/profil/bibliotheque/ajouter"
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-neutral-300 bg-white text-neutral-600 transition-colors hover:border-primary hover:text-primary"
          >
            <Plus className="h-8 w-8" />
            <span className="text-xs font-medium">Ajouter</span>
          </Link>
        </div>
      )}
    </div>
  );
}

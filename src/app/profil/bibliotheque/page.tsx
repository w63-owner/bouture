"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Loader2, Sprout, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  getAllSpecies,
  type SpeciesRow,
} from "@/lib/supabase/queries/species";
import { getUserOwnedSpeciesIds } from "@/lib/supabase/queries/plant-library";
import { SpeciesPokedexCard } from "@/components/profile/species-pokedex-card";

export default function BibliothequePage() {
  const router = useRouter();
  const [species, setSpecies] = useState<SpeciesRow[]>([]);
  const [ownedIds, setOwnedIds] = useState<Set<number>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const pageRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset when search changes
  useEffect(() => {
    pageRef.current = 0;
    setSpecies([]);
    setHasMore(true);
    setLoading(true);
  }, [debouncedSearch]);

  const loadSpecies = useCallback(
    async (page: number, append: boolean) => {
      try {
        const result = await getAllSpecies(page, debouncedSearch || undefined);
        setSpecies((prev) =>
          append ? [...prev, ...result.data] : result.data,
        );
        setHasMore(result.hasMore);
      } catch {
        // load failed silently
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [debouncedSearch],
  );

  // Initial load + auth
  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        try {
          const ids = await getUserOwnedSpeciesIds(user.id);
          setOwnedIds(ids);
        } catch {
          // owned fetch failed
        }
      }
      loadSpecies(0, false);
    };
    init();
  }, [loadSpecies]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          setLoadingMore(true);
          pageRef.current += 1;
          loadSpecies(pageRef.current, true);
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, loadSpecies]);

  const handleSpeciesAdded = useCallback((speciesId: number) => {
    setOwnedIds((prev) => new Set(prev).add(speciesId));
  }, []);

  const sortedSpecies = useMemo(
    () =>
      [...species].sort((a, b) => {
        const aOwned = ownedIds.has(a.id) ? 0 : 1;
        const bOwned = ownedIds.has(b.id) ? 0 : 1;
        return aOwned - bOwned;
      }),
    [species, ownedIds],
  );

  const ownedCount = sortedSpecies.filter((s) => ownedIds.has(s.id)).length;

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
          <div className="flex flex-1 flex-col">
            <h1 className="text-lg font-display font-semibold text-neutral-900">
              Pokédex des plantes
            </h1>
            {!loading && (
              <p className="text-xs text-neutral-500">
                {ownedCount}/{sortedSpecies.length} espèces collectionnées
              </p>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une espèce..."
            className="w-full rounded-pill border-[1.5px] border-neutral-300 bg-neutral-100 py-2 pl-9 pr-9 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : sortedSpecies.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Sprout className="h-10 w-10 text-primary" />
          </div>
          <div>
            <p className="text-base font-semibold text-neutral-900">
              {debouncedSearch
                ? "Aucune espèce trouvée"
                : "Aucune espèce enregistrée"}
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              {debouncedSearch
                ? "Essayez un autre terme de recherche."
                : "Les espèces apparaîtront ici une fois ajoutées à la base."}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8">
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-5">
            {sortedSpecies.map((s) => (
              <SpeciesPokedexCard
                key={s.id}
                species={s}
                isOwned={ownedIds.has(s.id)}
                userId={userId}
                onAdded={handleSpeciesAdded}
              />
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="flex justify-center py-6">
            {loadingMore && (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Sprout, X, MapPin, Plus } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  getAllSpecies,
  type SpeciesRow,
} from "@/lib/supabase/queries/species";
import {
  getUserOwnedSpeciesIds,
  getUserPlantsBySpecies,
} from "@/lib/supabase/queries/plant-library";
import { PlantIllustration } from "@/components/ui/plant-illustrations";
import { Button } from "@/components/ui/button";

type TabValue = "all" | "owned" | "missing";

const TABS: { value: TabValue; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "owned", label: "Possédées" },
  { value: "missing", label: "Manquantes" },
];

const DISMISS_THRESHOLD = 100;

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
};

export default function CollectionPage() {
  const router = useRouter();
  const [species, setSpecies] = useState<SpeciesRow[]>([]);
  const [ownedIds, setOwnedIds] = useState<Set<number>>(new Set());
  const [speciesPlantMap, setSpeciesPlantMap] = useState<Map<number, string>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesRow | null>(
    null,
  );
  const pageRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

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
        // silent
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [debouncedSearch],
  );

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        try {
          const [ids, plantMap] = await Promise.all([
            getUserOwnedSpeciesIds(user.id),
            getUserPlantsBySpecies(user.id),
          ]);
          setOwnedIds(ids);
          setSpeciesPlantMap(plantMap);
        } catch {
          // silent
        }
      }
      loadSpecies(0, false);
    };
    init();
  }, [loadSpecies]);

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

  const filteredSpecies = useMemo(() => {
    const list = [...species];

    if (activeTab === "owned") {
      return list
        .filter((s) => ownedIds.has(s.id))
        .sort((a, b) => a.common_name.localeCompare(b.common_name));
    }

    if (activeTab === "missing") {
      return list
        .filter((s) => !ownedIds.has(s.id))
        .sort((a, b) => a.common_name.localeCompare(b.common_name));
    }

    return list.sort((a, b) => {
      const aOwned = ownedIds.has(a.id) ? 0 : 1;
      const bOwned = ownedIds.has(b.id) ? 0 : 1;
      if (aOwned !== bOwned) return aOwned - bOwned;
      return a.common_name.localeCompare(b.common_name);
    });
  }, [species, ownedIds, activeTab]);

  const ownedCount = species.filter((s) => ownedIds.has(s.id)).length;
  const totalCount = species.length;

  const handleCardClick = (s: SpeciesRow) => {
    if (ownedIds.has(s.id)) {
      const plantId = speciesPlantMap.get(s.id);
      if (plantId) {
        router.push(`/collection/${plantId}`);
      }
    } else {
      setSelectedSpecies(s);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-neutral-300/50 bg-background/80 px-5 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex flex-1 flex-col">
            <h1 className="text-lg font-display font-semibold text-neutral-900">
              Collection
            </h1>
            {!loading && (
              <p className="text-xs text-neutral-500">
                {ownedCount}/{totalCount} espèces collectionnées
              </p>
            )}
          </div>
        </div>

        {/* Search */}
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

        {/* Tabs */}
        <div className="mt-3 flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-pill px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === tab.value
                  ? "bg-primary text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredSpecies.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Sprout className="h-10 w-10 text-primary" />
          </div>
          <div>
            <p className="text-base font-semibold text-neutral-900">
              {debouncedSearch
                ? "Aucune espèce trouvée"
                : activeTab === "owned"
                  ? "Aucune plante possédée"
                  : activeTab === "missing"
                    ? "Vous les avez toutes !"
                    : "Aucune espèce enregistrée"}
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              {debouncedSearch
                ? "Essayez un autre terme de recherche."
                : activeTab === "owned"
                  ? "Ajoutez des plantes à votre collection pour les voir ici."
                  : activeTab === "missing"
                    ? "Félicitations, votre collection est complète."
                    : "Les espèces apparaîtront ici une fois ajoutées à la base."}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8">
          <motion.div
            className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-5"
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            key={`${activeTab}-${debouncedSearch}`}
          >
            {filteredSpecies.map((s) => {
              const isOwned = ownedIds.has(s.id);
              return (
                <motion.button
                  key={s.id}
                  type="button"
                  variants={cardVariants}
                  onClick={() => handleCardClick(s)}
                  className={`group relative flex flex-col items-center overflow-hidden rounded-card bg-white shadow-card transition-all duration-300 ${
                    isOwned
                      ? "ring-2 ring-green-400/60 hover:shadow-md"
                      : "hover:opacity-60"
                  }`}
                >
                  <div
                    className={`relative flex aspect-square w-full items-center justify-center p-4 ${
                      isOwned ? "bg-neutral-50" : "bg-neutral-100 grayscale opacity-40"
                    }`}
                  >
                    {s.illustration_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.illustration_url}
                        alt={s.common_name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <PlantIllustration
                        category={s.visual_category}
                        className="h-4/5 w-4/5"
                      />
                    )}

                    {isOwned && (
                      <span className="absolute top-1.5 left-1.5 rounded-pill bg-green-100 px-1.5 py-0.5 text-[9px] font-semibold text-green-800">
                        ✓
                      </span>
                    )}
                    {!isOwned && (
                      <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-300/60 text-[10px] font-bold text-neutral-500">
                        ?
                      </span>
                    )}
                  </div>

                  <div className="w-full px-2 py-2 text-left">
                    <p className="truncate text-xs font-semibold text-neutral-900">
                      {s.common_name}
                    </p>
                    {s.scientific_name && (
                      <p className="truncate text-[10px] italic text-neutral-500">
                        {s.scientific_name}
                      </p>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          <div ref={sentinelRef} className="flex justify-center py-6">
            {loadingMore && (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            )}
          </div>
        </div>
      )}

      {/* Discovery Bottom Sheet */}
      <AnimatePresence>
        {selectedSpecies && (
          <DiscoverySheet
            species={selectedSpecies}
            onClose={() => setSelectedSpecies(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DiscoverySheet({
  species,
  onClose,
}: {
  species: SpeciesRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const y = useMotionValue(0);
  const backdropOpacity = useTransform(y, [0, 300], [0.4, 0]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > DISMISS_THRESHOLD || info.velocity.y > 500) {
      onClose();
    }
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-black"
        style={{ opacity: backdropOpacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[20px] bg-white shadow-sheet safe-area-bottom"
        style={{ y }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-neutral-300" />
        </div>

        <div className="flex flex-col items-center gap-5 px-6 pb-6">
          {/* Illustration */}
          <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-neutral-50 p-4">
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
                className="h-full w-full"
              />
            )}
          </div>

          {/* Info */}
          <div className="text-center">
            <h2 className="text-lg font-display font-semibold text-neutral-900">
              {species.common_name}
            </h2>
            {species.scientific_name && (
              <p className="mt-0.5 text-sm italic text-neutral-500">
                {species.scientific_name}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex w-full flex-col gap-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => {
                onClose();
                router.push(
                  `/carte?speciesId=${species.id}&speciesName=${encodeURIComponent(species.common_name)}`,
                );
              }}
            >
              <MapPin className="h-4 w-4" />
              Chercher sur la carte
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => {
                onClose();
                router.push(`/collection/ajouter?speciesId=${species.id}`);
              }}
            >
              <Plus className="h-4 w-4" />
              Ajouter manuellement
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

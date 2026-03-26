"use client";

import { useState, useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMapStore } from "@/lib/stores/map-store";
import { GeocodingOverlay } from "./geocoding-overlay";
import { FilterSheet } from "./filter-sheet";

export function SearchBar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const searchLabel = useMapStore((s) => s.searchLabel);
  const filterCount = useMapStore((s) => s.activeFilterCount());
  const speciesName = useMapStore((s) => s.filters.speciesName);
  const setFilters = useMapStore((s) => s.setFilters);

  const clearSpeciesFilter = useCallback(() => {
    setFilters({ speciesId: undefined, speciesName: undefined });
  }, [setFilters]);

  return (
    <>
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex flex-1 items-center gap-3 rounded-pill bg-white/90 backdrop-blur-md px-4 py-3 shadow-card transition-shadow hover:shadow-md"
          >
            <Search className="h-5 w-5 text-neutral-600 shrink-0" />
            <span className="text-sm text-neutral-600 truncate">
              {searchLabel ?? "Rechercher un lieu..."}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="relative flex items-center justify-center rounded-pill bg-white/90 backdrop-blur-md p-3 shadow-card transition-shadow hover:shadow-md"
          >
            <SlidersHorizontal className="h-5 w-5 text-neutral-600" />
            {filterCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                {filterCount}
              </span>
            )}
          </button>
        </div>

        {speciesName && (
          <div className="flex">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-3 py-1.5 text-xs font-medium text-white shadow-btn">
              Filtre : {speciesName}
              <button
                type="button"
                onClick={clearSpeciesFilter}
                className="ml-0.5 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          </div>
        )}
      </div>

      <GeocodingOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} />
    </>
  );
}

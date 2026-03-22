"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { useMapStore } from "@/lib/stores/map-store";
import { getListingsInBounds } from "@/lib/supabase/queries/listings";
import type { MapBounds, ListingFilters } from "@/lib/types/listing";

const DEBOUNCE_MS = 300;

export function useListingsInBounds() {
  const bounds = useMapStore((s) => s.viewport.bounds);
  const center = useMapStore((s) => s.viewport.center);
  const filters = useMapStore((s) => s.filters);
  const setListings = useMapStore((s) => s.setListings);
  const setIsLoadingListings = useMapStore((s) => s.setIsLoadingListings);

  const resolvedFilters: ListingFilters = useMemo(() => {
    if (!filters.radiusKm) return filters;
    return {
      ...filters,
      centerLng: filters.centerLng ?? center[0],
      centerLat: filters.centerLat ?? center[1],
    };
  }, [filters, center]);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchListings = useCallback(
    async (b: MapBounds) => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setIsLoadingListings(true);
      try {
        const data = await getListingsInBounds(b, resolvedFilters);
        if (!abortRef.current.signal.aborted) {
          setListings(data);
        }
      } catch {
        // aborted or real error — ignore aborted
      } finally {
        if (!abortRef.current?.signal.aborted) {
          setIsLoadingListings(false);
        }
      }
    },
    [resolvedFilters, setListings, setIsLoadingListings],
  );

  useEffect(() => {
    if (!bounds) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchListings(bounds);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [bounds, fetchListings]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);
}

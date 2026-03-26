"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { MapView } from "@/components/map/map-view";
import { useMapStore } from "@/lib/stores/map-store";

export function CarteContent() {
  const searchParams = useSearchParams();
  const setFilters = useMapStore((s) => s.setFilters);
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current) return;

    const speciesIdRaw = searchParams.get("speciesId");
    const speciesName = searchParams.get("speciesName");

    if (speciesIdRaw && speciesName) {
      const speciesId = parseInt(speciesIdRaw, 10);
      if (!isNaN(speciesId)) {
        setFilters({ speciesId, speciesName });
        applied.current = true;
      }
    }
  }, [searchParams, setFilters]);

  return <MapView />;
}

"use client";

import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMapStore } from "@/lib/stores/map-store";
import { useListingsInBounds } from "@/lib/hooks/use-listings-in-bounds";
import { MapPins } from "./map-pins";
import { SearchBar } from "./search-bar";
import { ResultsCount } from "./results-count";
import { ListingBottomSheet } from "@/components/listing/listing-bottom-sheet";

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;
const STYLE_URL = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;

const DEFAULT_CENTER: [number, number] = [2.3522, 48.8566];
const DEFAULT_ZOOM = 13;

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const setBounds = useMapStore((s) => s.setBounds);
  const setViewport = useMapStore((s) => s.setViewport);
  const setFlyTo = useMapStore((s) => s.setFlyTo);
  const listings = useMapStore((s) => s.listings);

  useListingsInBounds();

  const updateBounds = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const b = map.getBounds();
    setBounds({
      north: b.getNorth(),
      south: b.getSouth(),
      east: b.getEast(),
      west: b.getWest(),
    });

    const center = map.getCenter();
    setViewport({
      center: [center.lng, center.lat],
      zoom: map.getZoom(),
    });
  }, [setBounds, setViewport]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: STYLE_URL,
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        attributionControl: false,
      });
    } catch {
      return;
    }

    // MapLibre overrides container position to 'relative', breaking inset-0 sizing
    containerRef.current.style.position = 'absolute';
    map.resize();

    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-left",
    );

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "bottom-right",
    );

    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
    });
    map.addControl(geolocate, "bottom-right");

    map.on("load", () => {
      geolocate.trigger();
      updateBounds();
    });

    map.on("moveend", updateBounds);

    setFlyTo(({ lng, lat, zoom }) => {
      map.flyTo({
        center: [lng, lat],
        zoom: zoom ?? 14,
        duration: 1200,
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [updateBounds, setFlyTo]);

  return (
    <div className="relative flex-1 w-full">
      <div ref={containerRef} className="absolute inset-0" />

      <SearchBar />
      <ResultsCount />

      <MapPins map={mapRef.current} listings={listings} />
      <ListingBottomSheet />
    </div>
  );
}

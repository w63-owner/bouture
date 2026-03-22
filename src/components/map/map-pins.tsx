"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";
import maplibregl from "maplibre-gl";
import type { ListingInBounds } from "@/lib/types/listing";
import { useMapStore } from "@/lib/stores/map-store";
import {
  clusterListings,
  type MapPoint,
  type ClusterPoint,
} from "@/lib/utils/clustering";

interface MapPinsProps {
  map: maplibregl.Map | null;
  listings: ListingInBounds[];
}

function createPinElement(isSelected: boolean): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "bouture-pin";
  el.style.width = "36px";
  el.style.height = "36px";
  el.style.cursor = "pointer";

  el.innerHTML = `
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="16" fill="${isSelected ? "#C67B5C" : "#4A6741"}" stroke="white" stroke-width="2.5"/>
      <path d="M18 10c-1.5 4-5 6-5 10a5 5 0 0 0 10 0c0-4-3.5-6-5-10z" fill="white" opacity="0.9"/>
      <path d="M18 14v8M16 18h4" stroke="${isSelected ? "#C67B5C" : "#4A6741"}" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `;

  return el;
}

function createClusterElement(count: number): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "bouture-cluster";
  el.style.cursor = "pointer";

  const size = count < 10 ? 44 : count < 100 ? 52 : 60;
  const bgColor = count < 10 ? "#4A6741" : count < 50 ? "#7A9E6F" : "#C67B5C";

  el.style.width = `${size}px`;
  el.style.height = `${size}px`;

  el.innerHTML = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${bgColor}" stroke="white" stroke-width="2.5" opacity="0.9"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 7}" fill="white" opacity="0.15"/>
      <text x="${size / 2}" y="${size / 2}" text-anchor="middle" dominant-baseline="central"
        fill="white" font-family="DM Sans, sans-serif" font-weight="700"
        font-size="${count < 100 ? 15 : 13}">${count}</text>
    </svg>
  `;

  return el;
}

function pointKey(p: MapPoint): string {
  return p.type === "cluster" ? `cluster-${p.id}` : `listing-${p.listing.id}`;
}

export function MapPins({ map, listings }: MapPinsProps) {
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const selectedListingId = useMapStore((s) => s.selectedListingId);
  const setSelectedListingId = useMapStore((s) => s.setSelectedListingId);
  const setSelectedListing = useMapStore((s) => s.setSelectedListing);
  const viewport = useMapStore((s) => s.viewport);

  const bounds = viewport.bounds;
  const zoom = viewport.zoom;

  const points: MapPoint[] = useMemo(() => {
    if (!bounds) return [];
    return clusterListings(listings, bounds, zoom);
  }, [listings, bounds, zoom]);

  const flyToCluster = useCallback(
    (cluster: ClusterPoint) => {
      if (!map) return;
      map.flyTo({
        center: [cluster.lng, cluster.lat],
        zoom: cluster.expansionZoom,
        duration: 500,
      });
    },
    [map],
  );

  const selectListing = useCallback(
    (listing: ListingInBounds) => {
      setSelectedListingId(listing.id);
      setSelectedListing(listing);
    },
    [setSelectedListingId, setSelectedListing],
  );

  useEffect(() => {
    if (!map) return;

    const current = markersRef.current;
    const newKeys = new Set(points.map(pointKey));

    for (const [key, marker] of current) {
      if (!newKeys.has(key)) {
        marker.remove();
        current.delete(key);
      }
    }

    for (const point of points) {
      const key = pointKey(point);
      const existing = current.get(key);

      if (point.type === "listing") {
        const isSelected = point.listing.id === selectedListingId;

        if (existing) {
          const svg = existing.getElement().querySelector("circle");
          if (svg) {
            svg.setAttribute("fill", isSelected ? "#C67B5C" : "#4A6741");
          }
          continue;
        }

        const el = createPinElement(isSelected);
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          selectListing(point.listing);
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([point.lng, point.lat])
          .addTo(map);

        current.set(key, marker);
      } else {
        if (existing) continue;

        const el = createClusterElement(point.pointCount);
        const cluster = point;
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          flyToCluster(cluster);
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([point.lng, point.lat])
          .addTo(map);

        current.set(key, marker);
      }
    }
  }, [map, points, selectedListingId, selectListing, flyToCluster]);

  useEffect(() => {
    return () => {
      for (const marker of markersRef.current.values()) {
        marker.remove();
      }
      markersRef.current.clear();
    };
  }, []);

  return null;
}

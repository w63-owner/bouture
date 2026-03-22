import { create } from "zustand";
import type {
  ListingInBounds,
  MapBounds,
  ListingFilters,
} from "@/lib/types/listing";

type FlyToFn = (coords: { lng: number; lat: number; zoom?: number }) => void;

interface MapState {
  viewport: {
    center: [number, number];
    zoom: number;
    bounds: MapBounds | null;
  };
  listings: ListingInBounds[];
  isLoadingListings: boolean;
  selectedListingId: string | null;
  selectedListing: ListingInBounds | null;
  filters: ListingFilters;

  searchLabel: string | null;
  flyTo: FlyToFn | null;

  setViewport: (viewport: Partial<MapState["viewport"]>) => void;
  setBounds: (bounds: MapBounds) => void;
  setListings: (listings: ListingInBounds[]) => void;
  setIsLoadingListings: (loading: boolean) => void;
  setSelectedListingId: (id: string | null) => void;
  setSelectedListing: (listing: ListingInBounds | null) => void;
  clearSelection: () => void;
  setFilters: (filters: Partial<ListingFilters>) => void;
  resetFilters: () => void;
  setSearchLabel: (label: string | null) => void;
  setFlyTo: (fn: FlyToFn) => void;
  activeFilterCount: () => number;
}

const DEFAULT_CENTER: [number, number] = [2.3522, 48.8566];
const DEFAULT_ZOOM = 13;

export const useMapStore = create<MapState>((set, get) => ({
  viewport: {
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    bounds: null,
  },
  listings: [],
  isLoadingListings: false,
  selectedListingId: null,
  selectedListing: null,
  filters: {},

  searchLabel: null,
  flyTo: null,

  setViewport: (viewport) =>
    set((state) => ({
      viewport: { ...state.viewport, ...viewport },
    })),

  setBounds: (bounds) =>
    set((state) => ({
      viewport: { ...state.viewport, bounds },
    })),

  setListings: (listings) => set({ listings }),
  setIsLoadingListings: (isLoadingListings) => set({ isLoadingListings }),
  setSelectedListingId: (selectedListingId) => set({ selectedListingId }),
  setSelectedListing: (selectedListing) => set({ selectedListing }),
  clearSelection: () =>
    set({ selectedListingId: null, selectedListing: null }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  resetFilters: () => set({ filters: {} }),
  setSearchLabel: (searchLabel) => set({ searchLabel }),
  setFlyTo: (fn) => set({ flyTo: fn }),

  activeFilterCount: () => {
    const f = get().filters;
    let count = 0;
    if (f.sizes && f.sizes.length > 0) count += f.sizes.length;
    if (f.radiusKm && f.radiusKm !== 50) count += 1;
    return count;
  },
}));

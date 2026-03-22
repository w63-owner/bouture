import Supercluster from "supercluster";
import type { ListingInBounds } from "@/lib/types/listing";

export interface ClusterPoint {
  type: "cluster";
  id: number;
  lng: number;
  lat: number;
  pointCount: number;
  expansionZoom: number;
}

export interface ListingPoint {
  type: "listing";
  listing: ListingInBounds;
  lng: number;
  lat: number;
}

export type MapPoint = ClusterPoint | ListingPoint;

type ListingFeatureProps = { listing: ListingInBounds };

let index: Supercluster<ListingFeatureProps> | null = null;
let prevListingIds: string | null = null;

export function clusterListings(
  listings: ListingInBounds[],
  bounds: { west: number; south: number; east: number; north: number },
  zoom: number,
): MapPoint[] {
  const listingIds = listings.map((l) => l.id).join(",");

  if (listingIds !== prevListingIds) {
    index = new Supercluster<ListingFeatureProps>({
      radius: 60,
      maxZoom: 16,
      minZoom: 0,
    });

    const features: GeoJSON.Feature<GeoJSON.Point, ListingFeatureProps>[] =
      listings.map((l) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [l.lng, l.lat] },
        properties: { listing: l },
      }));

    index.load(features);
    prevListingIds = listingIds;
  }

  if (!index) return [];

  const clusters = index.getClusters(
    [bounds.west, bounds.south, bounds.east, bounds.north],
    Math.floor(zoom),
  );

  return clusters.map((feature) => {
    const [lng, lat] = feature.geometry.coordinates;
    const props = feature.properties;

    if ("cluster" in props && props.cluster) {
      return {
        type: "cluster" as const,
        id: props.cluster_id as number,
        lng,
        lat,
        pointCount: props.point_count as number,
        expansionZoom: index!.getClusterExpansionZoom(
          props.cluster_id as number,
        ),
      };
    }

    return {
      type: "listing" as const,
      listing: (props as unknown as ListingFeatureProps).listing,
      lng,
      lat,
    };
  });
}

export function getClusterExpansionZoom(clusterId: number): number {
  if (!index) return 14;
  return index.getClusterExpansionZoom(clusterId);
}

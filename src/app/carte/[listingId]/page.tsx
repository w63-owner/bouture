import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ListingDetail } from "@/components/listing/listing-detail";

const getListing = cache(async (id: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(
      `
      *,
      profiles:donor_id (
        username,
        avatar_url,
        created_at
      )
    `,
    )
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ listingId: string }>;
}): Promise<Metadata> {
  const { listingId } = await params;
  const listing = await getListing(listingId);

  if (!listing) {
    return { title: "Annonce introuvable — bouture.app" };
  }

  const title = `${listing.species_name} — bouture.app`;
  const description = listing.description
    ? listing.description.slice(0, 160)
    : `Bouture de ${listing.species_name} disponible${listing.address_city ? ` à ${listing.address_city}` : ""}. Découvrez et échangez des boutures près de chez vous.`;

  const firstPhoto = listing.photos[0];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      ...(firstPhoto && {
        images: [
          {
            url: firstPhoto,
            width: 1200,
            height: 900,
            alt: listing.species_name,
          },
        ],
      }),
    },
    twitter: {
      card: firstPhoto ? "summary_large_image" : "summary",
      title,
      description,
      ...(firstPhoto && { images: [firstPhoto] }),
    },
  };
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;
  const listing = await getListing(listingId);

  if (!listing) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <ListingDetail
      listing={listing as Parameters<typeof ListingDetail>[0]["listing"]}
      currentUserId={user?.id ?? null}
    />
  );
}

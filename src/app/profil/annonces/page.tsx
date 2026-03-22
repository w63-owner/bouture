"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Megaphone, Plus, Loader2, Leaf } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getUserListings } from "@/lib/supabase/queries/listings";
import { ListingCardManage } from "@/components/listing/listing-card-manage";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ListingSize } from "@/lib/types/listing";

interface UserListing {
  id: string;
  species_name: string;
  size: ListingSize;
  photos: string[];
  is_active: boolean;
  address_city: string | null;
  created_at: string;
}

export default function MesAnnoncesPage() {
  const router = useRouter();
  const [listings, setListings] = useState<UserListing[]>([]);
  const [loading, setLoading] = useState(true);

  const loadListings = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    try {
      const data = await getUserListings(user.id);
      setListings(data as UserListing[]);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-neutral-300/50 bg-background/80 px-5 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Megaphone className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-display font-semibold text-neutral-900">
              Mes annonces
            </h1>
          </div>
          <Button asChild variant="primary" size="sm">
            <Link href="/donner">
              <Plus className="mr-1.5 h-4 w-4" />
              Nouvelle
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-6">
        {loading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-card bg-white shadow-card">
                <div className="flex gap-3 p-3">
                  <Skeleton className="h-24 w-24 shrink-0 rounded-lg" />
                  <div className="flex flex-1 flex-col gap-2 py-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full rounded-none" />
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 pt-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Leaf className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-neutral-900">
                Aucune annonce pour le moment
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                Publiez votre première bouture pour la partager avec la communauté.
              </p>
            </div>
            <Button asChild variant="primary">
              <Link href="/donner">
                <Plus className="mr-1.5 h-4 w-4" />
                Donner une bouture
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {listings.map((listing) => (
              <ListingCardManage
                key={listing.id}
                id={listing.id}
                speciesName={listing.species_name}
                size={listing.size}
                photo={listing.photos[0]}
                isActive={listing.is_active}
                addressCity={listing.address_city}
                createdAt={listing.created_at}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

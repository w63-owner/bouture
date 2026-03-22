import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Sprout, ExternalLink, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getPublicProfile,
  isFollowingServer,
} from "@/lib/supabase/queries/public-profile";
import { PublicPlantCard } from "@/components/profile/public-plant-card";
import { FollowButton } from "@/components/profile/follow-button";
import { StatsRow } from "@/components/profile/stats-row";

function formatJoinDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.toLocaleString("fr-FR", { month: "long" });
  const year = date.getFullYear();
  return `Membre depuis ${month} ${year}`;
}

const SIZE_LABELS: Record<string, string> = {
  graine: "Graine",
  tubercule: "Tubercule",
  xs: "XS",
  s: "S",
  m: "M",
  l: "L",
  xl: "XL",
  xxl: "XXL",
};

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);

  const profile = await getPublicProfile(decodedUsername);
  if (!profile) notFound();

  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const isOwnProfile = currentUser?.id === profile.id;
  const isFollowing =
    currentUser && !isOwnProfile
      ? await isFollowingServer(currentUser.id, profile.id)
      : false;

  return (
    <div className="flex flex-1 flex-col pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-neutral-300/50 bg-background/80 px-5 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/carte"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-neutral-900" />
          </Link>
          <h1 className="flex-1 text-lg font-display font-semibold text-neutral-900 truncate">
            {profile.username}
          </h1>
        </div>
      </header>

      {/* Profile info */}
      <div className="flex flex-col items-center gap-4 px-5 pt-6 pb-2">
        <div className="relative">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-card"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 ring-4 ring-white shadow-card">
              <User className="h-10 w-10 text-primary" />
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <h2 className="text-xl font-display font-semibold text-neutral-900">
            {profile.username}
          </h2>
          {profile.bio && (
            <p className="max-w-xs text-sm text-neutral-600 leading-relaxed">
              {profile.bio}
            </p>
          )}
          <div className="mt-1 flex items-center gap-3 text-xs text-neutral-600">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatJoinDate(profile.created_at)}
            </span>
            {profile.address_city && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {profile.address_city}
              </span>
            )}
          </div>
        </div>

        {/* Follow button or own profile edit link */}
        {isOwnProfile ? (
          <Link
            href="/profil"
            className="inline-flex items-center gap-2 rounded-btn border-[1.5px] border-primary px-5 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/5 active:scale-[0.97]"
          >
            Voir mon profil
          </Link>
        ) : currentUser ? (
          <FollowButton
            targetUserId={profile.id}
            initialIsFollowing={isFollowing}
          />
        ) : (
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 rounded-btn bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-btn transition-all hover:bg-accent-light active:scale-[0.97]"
          >
            Se connecter pour suivre
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="mt-5">
        <StatsRow
          stats={[
            { label: "Boutures données", value: profile.listings_given },
            { label: "Abonnés", value: profile.followers_count },
            { label: "Abonnements", value: profile.following_count },
          ]}
        />
      </div>

      {/* Active listings */}
      {profile.listings.length > 0 && (
        <section className="mt-8 px-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-display font-semibold text-neutral-900">
              Annonces actives
            </h3>
            <Link
              href={`/carte?donor=${profile.id}`}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Voir sur la carte
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {profile.listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/carte/${listing.id}`}
                className="flex flex-col overflow-hidden rounded-card bg-white shadow-card transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-square bg-neutral-100">
                  {listing.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={listing.photos[0]}
                      alt={listing.species_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Sprout className="h-10 w-10 text-neutral-300" />
                    </div>
                  )}
                  <span className="absolute top-2 left-2 rounded-pill bg-accent/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {SIZE_LABELS[listing.size] ?? listing.size}
                  </span>
                </div>
                <div className="px-3 py-2.5">
                  <p className="truncate text-sm font-medium text-neutral-900">
                    {listing.species_name}
                  </p>
                  {listing.address_city && (
                    <p className="truncate text-xs text-neutral-500">
                      {listing.address_city}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Plant library */}
      {profile.plants.length > 0 && (
        <section className="mt-8 px-5">
          <h3 className="mb-4 text-base font-display font-semibold text-neutral-900">
            Bibliothèque de plantes
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {profile.plants.map((plant) => (
              <PublicPlantCard
                key={plant.id}
                speciesName={plant.species_name}
                photo={plant.photos[0] ?? null}
                status={plant.status}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {profile.listings.length === 0 && profile.plants.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 pt-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Sprout className="h-10 w-10 text-primary" />
          </div>
          <div>
            <p className="text-base font-semibold text-neutral-900">
              Pas encore de contenu
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              {profile.username} n&apos;a pas encore publié de bouture ni ajouté de plante à sa bibliothèque.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

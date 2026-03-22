import { createClient } from "../server";

export interface PublicProfileData {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  address_city: string | null;
  created_at: string;
  listings_given: number;
  followers_count: number;
  following_count: number;
  plants: {
    id: string;
    species_name: string;
    photos: string[];
    status: "collection" | "for_donation" | "donated";
  }[];
  listings: {
    id: string;
    species_name: string;
    photos: string[];
    size: string;
    address_city: string | null;
  }[];
}

export async function getPublicProfile(
  username: string,
): Promise<PublicProfileData | null> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, bio, address_city, created_at")
    .eq("username", username)
    .single();

  if (error || !profile) return null;

  const [givenRes, followersRes, followingRes, plantsRes, listingsRes] =
    await Promise.all([
      supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("donor_id", profile.id),
      supabase
        .from("follows")
        .select("follower_id", { count: "exact", head: true })
        .eq("following_id", profile.id),
      supabase
        .from("follows")
        .select("following_id", { count: "exact", head: true })
        .eq("follower_id", profile.id),
      supabase
        .from("plant_library")
        .select("id, species_name, photos, status")
        .eq("user_id", profile.id)
        .in("status", ["collection", "for_donation"])
        .order("created_at", { ascending: false }),
      supabase
        .from("listings")
        .select("id, species_name, photos, size, address_city")
        .eq("donor_id", profile.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
    ]);

  return {
    ...profile,
    listings_given: givenRes.count ?? 0,
    followers_count: followersRes.count ?? 0,
    following_count: followingRes.count ?? 0,
    plants: plantsRes.data ?? [],
    listings: listingsRes.data ?? [],
  };
}

export async function isFollowingServer(
  followerId: string,
  followingId: string,
): Promise<boolean> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", followerId)
    .eq("following_id", followingId);

  return (count ?? 0) > 0;
}

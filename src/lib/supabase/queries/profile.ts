import { createClient } from "../client";

export interface ProfileWithStats {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  address_city: string | null;
  created_at: string;
  listings_given: number;
  listings_received: number;
  followers_count: number;
  following_count: number;
}

export async function getProfile(userId: string): Promise<ProfileWithStats> {
  const supabase = createClient();

  const [profileRes, givenRes, followersRes, followingRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, avatar_url, bio, address_city, created_at")
      .eq("id", userId)
      .single(),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("donor_id", userId),
    supabase
      .from("follows")
      .select("follower_id", { count: "exact", head: true })
      .eq("following_id", userId),
    supabase
      .from("follows")
      .select("following_id", { count: "exact", head: true })
      .eq("follower_id", userId),
  ]);

  if (profileRes.error || !profileRes.data) {
    throw new Error("Profile not found");
  }

  return {
    ...profileRes.data,
    listings_given: givenRes.count ?? 0,
    listings_received: 0,
    followers_count: followersRes.count ?? 0,
    following_count: followingRes.count ?? 0,
  };
}

export async function updateProfile(
  userId: string,
  data: { username?: string; bio?: string; avatar_url?: string },
): Promise<void> {
  const supabase = createClient();

  if (data.username) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", data.username)
      .neq("id", userId)
      .single();

    if (existing) {
      throw new Error("Ce nom d'utilisateur est déjà pris");
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw new Error(`Mise à jour échouée : ${error.message}`);
}

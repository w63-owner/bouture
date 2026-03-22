import { createClient } from "../client";

export interface FollowUser {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

export async function getFollowers(userId: string): Promise<FollowUser[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("follows")
    .select("follower_id, profiles!follows_follower_id_fkey(id, username, avatar_url, bio)")
    .eq("following_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch followers: ${error.message}`);

  return (data ?? []).map((row) => {
    const p = row.profiles as unknown as FollowUser;
    return { id: p.id, username: p.username, avatar_url: p.avatar_url, bio: p.bio };
  });
}

export async function getFollowing(userId: string): Promise<FollowUser[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("follows")
    .select("following_id, profiles!follows_following_id_fkey(id, username, avatar_url, bio)")
    .eq("follower_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch following: ${error.message}`);

  return (data ?? []).map((row) => {
    const p = row.profiles as unknown as FollowUser;
    return { id: p.id, username: p.username, avatar_url: p.avatar_url, bio: p.bio };
  });
}

export async function isFollowing(
  followerId: string,
  followingId: string,
): Promise<boolean> {
  const supabase = createClient();

  const { count } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", followerId)
    .eq("following_id", followingId);

  return (count ?? 0) > 0;
}

export async function getFollowerCount(userId: string): Promise<number> {
  const supabase = createClient();

  const { count } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId);

  return count ?? 0;
}

export async function getFollowingCount(userId: string): Promise<number> {
  const supabase = createClient();

  const { count } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", userId);

  return count ?? 0;
}

export async function getFollowingIds(userId: string): Promise<Set<string>> {
  const supabase = createClient();

  const { data } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);

  return new Set((data ?? []).map((r) => r.following_id));
}

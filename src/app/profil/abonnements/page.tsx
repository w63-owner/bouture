"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserCheck, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getFollowing, type FollowUser } from "@/lib/supabase/queries/follows";
import { UserRow } from "@/components/profile/user-row";

export default function AbonnementsPage() {
  const router = useRouter();
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setCurrentUserId(user.id);

    try {
      const followingList = await getFollowing(user.id);
      setFollowing(followingList);
    } catch {
      // load failed
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-neutral-300/50 bg-background/80 px-5 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-neutral-900" />
          </button>
          <h1 className="flex-1 text-lg font-display font-semibold text-neutral-900">
            Abonnements
          </h1>
          <span className="text-sm text-neutral-500">{following.length}</span>
        </div>
      </header>

      {/* List */}
      {following.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <UserCheck className="h-10 w-10 text-primary" />
          </div>
          <div>
            <p className="text-base font-semibold text-neutral-900">
              Aucun abonnement
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              Suivez d&apos;autres jardiniers pour ne rien manquer de leurs boutures.
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-neutral-300/50 pb-8">
          {following.map((user) => (
            <UserRow
              key={user.id}
              userId={user.id}
              username={user.username}
              avatarUrl={user.avatar_url}
              isFollowing={true}
              isOwnProfile={user.id === currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

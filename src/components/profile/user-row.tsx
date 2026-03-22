"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { FollowButton } from "./follow-button";

interface UserRowProps {
  userId: string;
  username: string;
  avatarUrl: string | null;
  isFollowing: boolean;
  showFollowButton?: boolean;
  isOwnProfile?: boolean;
}

export function UserRow({
  userId,
  username,
  avatarUrl,
  isFollowing,
  showFollowButton = true,
  isOwnProfile = false,
}: UserRowProps) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-neutral-50">
      <Link
        href={`/u/${username}`}
        className="flex flex-1 items-center gap-3 min-w-0"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={username}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
        )}
        <span className="truncate text-sm font-medium text-neutral-900">
          {username}
        </span>
      </Link>

      {showFollowButton && !isOwnProfile && (
        <FollowButton
          targetUserId={userId}
          initialIsFollowing={isFollowing}
          size="sm"
        />
      )}
    </div>
  );
}

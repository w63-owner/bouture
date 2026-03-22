"use client";

import { useOptimistic, useTransition } from "react";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { toggleFollow } from "@/app/u/[username]/actions";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
  size?: "default" | "sm";
  className?: string;
}

export function FollowButton({
  targetUserId,
  initialIsFollowing,
  size = "default",
  className = "",
}: FollowButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticIsFollowing, setOptimisticIsFollowing] = useOptimistic(
    initialIsFollowing,
    (_current, next: boolean) => next,
  );

  const handleClick = () => {
    startTransition(async () => {
      setOptimisticIsFollowing(!optimisticIsFollowing);
      await toggleFollow(targetUserId);
    });
  };

  const isSmall = size === "sm";

  if (optimisticIsFollowing) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`
          inline-flex items-center justify-center gap-1.5
          rounded-btn font-semibold transition-all duration-100 ease-out
          border-[1.5px] border-neutral-300 text-neutral-700 bg-white
          hover:border-red-300 hover:text-red-600 hover:bg-red-50
          active:scale-[0.97] disabled:opacity-50
          ${isSmall ? "px-3 py-1.5 text-xs" : "px-5 py-2.5 text-sm"}
          ${className}
        `}
      >
        {isPending ? (
          <Loader2 className={`animate-spin ${isSmall ? "h-3 w-3" : "h-4 w-4"}`} />
        ) : (
          <UserMinus className={isSmall ? "h-3 w-3" : "h-4 w-4"} />
        )}
        Abonné
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`
        inline-flex items-center justify-center gap-1.5
        rounded-btn font-semibold transition-all duration-100 ease-out
        bg-accent text-white shadow-btn
        hover:bg-accent-light active:scale-[0.97] disabled:opacity-50
        ${isSmall ? "px-3 py-1.5 text-xs" : "px-5 py-2.5 text-sm"}
        ${className}
      `}
    >
      {isPending ? (
        <Loader2 className={`animate-spin ${isSmall ? "h-3 w-3" : "h-4 w-4"}`} />
      ) : (
        <UserPlus className={isSmall ? "h-3 w-3" : "h-4 w-4"} />
      )}
      Suivre
    </button>
  );
}

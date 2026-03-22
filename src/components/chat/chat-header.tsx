"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface ChatHeaderProps {
  username: string;
  avatarUrl: string | null;
  isOnline?: boolean;
}

export function ChatHeader({ username, avatarUrl, isOnline }: ChatHeaderProps) {
  const router = useRouter();
  const initial = username.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-neutral-100 bg-white/95 backdrop-blur-sm px-4 py-3">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100"
        aria-label="Retour"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <Link
        href={`/u/${username}`}
        className="flex items-center gap-2.5 min-w-0"
      >
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={username}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-neutral-100"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold ring-2 ring-neutral-100">
              {initial}
            </div>
          )}
          {isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
          )}
        </div>

        <div className="min-w-0">
          <span className="block text-sm font-semibold text-neutral-900 truncate">
            {username}
          </span>
          {isOnline && (
            <span className="block text-[11px] text-emerald-600 leading-tight">
              En ligne
            </span>
          )}
        </div>
      </Link>
    </header>
  );
}

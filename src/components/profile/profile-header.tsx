"use client";

import { User, Calendar, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  onEdit: () => void;
}

function formatJoinDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.toLocaleString("fr-FR", { month: "long" });
  const year = date.getFullYear();
  return `Membre depuis ${month} ${year}`;
}

export function ProfileHeader({
  username,
  avatarUrl,
  bio,
  createdAt,
  onEdit,
}: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-4 px-5 pt-6 pb-2">
      <div className="relative">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={username}
            className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-card"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 ring-4 ring-white shadow-card">
            <User className="h-10 w-10 text-primary" />
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-xl font-display font-semibold text-neutral-900">
          {username}
        </h1>
        {bio && (
          <p className="max-w-xs text-sm text-neutral-600 leading-relaxed">
            {bio}
          </p>
        )}
        <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-600">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatJoinDate(createdAt)}</span>
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={onEdit}>
        <Pencil className="h-3.5 w-3.5" />
        Modifier le profil
      </Button>
    </div>
  );
}

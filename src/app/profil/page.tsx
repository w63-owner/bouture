"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Sprout,
  Megaphone,
  Users,
  UserCheck,
  Settings,
  Sparkles,
  ChevronRight,
  Loader2,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  getProfile,
  type ProfileWithStats,
} from "@/lib/supabase/queries/profile";
import { ProfileHeader } from "@/components/profile/profile-header";
import { StatsRow } from "@/components/profile/stats-row";
import { EditProfileSheet } from "@/components/profile/edit-profile-sheet";

const NAV_ITEMS = [
  { href: "/profil/annonces", label: "Mes annonces", icon: Megaphone },
  { href: "/profil/adresse", label: "Adresse", icon: MapPin },
  { href: "/profil/bibliotheque", label: "Bibliothèque de plantes", icon: Sprout },
  { href: "/profil/abonnes", label: "Abonnés", icon: Users },
  { href: "/profil/abonnements", label: "Abonnements", icon: UserCheck },
  { href: "/profil/parametres", label: "Paramètres", icon: Settings },
  {
    href: "https://www.forom.app/fr/pages/bouture-app",
    label: "Aidez nous à améliorer bouture.app",
    icon: Sparkles,
    external: true,
  },
] as const;

export default function ProfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileWithStats | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const loadProfile = useCallback(async (uid: string) => {
    try {
      const data = await getProfile(uid);
      setProfile(data);
    } catch {
      router.replace("/auth/onboarding");
      return;
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/auth/login");
        return;
      }
      setUserId(user.id);
      loadProfile(user.id);
    });
  }, [loadProfile, router]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile || !userId) {
    return (
      <div className="flex flex-1 items-center justify-center px-5 text-center">
        <p className="text-neutral-600">Impossible de charger le profil.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col pb-6">
      {/* Header */}
      <ProfileHeader
        username={profile.username}
        avatarUrl={profile.avatar_url}
        bio={profile.bio}
        createdAt={profile.created_at}
        onEdit={() => setEditOpen(true)}
      />

      {/* Stats */}
      <div className="mt-5">
        <StatsRow
          stats={[
            { label: "Boutures données", value: profile.listings_given },
            { label: "Boutures reçues", value: profile.listings_received },
            { label: "Abonnés", value: profile.followers_count },
          ]}
        />
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-5">
        <ul className="divide-y divide-neutral-300/50 overflow-hidden rounded-card bg-white shadow-card">
          {NAV_ITEMS.map(({ href, label, icon: Icon, ...rest }) => (
            <li key={href}>
              <Link
                href={href}
                {...("external" in rest && rest.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-neutral-100"
              >
                <Icon className="h-5 w-5 text-primary" />
                <span className="flex-1 text-sm font-medium text-neutral-900">
                  {label}
                </span>
                <ChevronRight className="h-4 w-4 text-neutral-300" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Déconnexion */}
      <div className="mt-4 px-5">
        <button
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.replace("/auth/login");
          }}
          className="flex w-full items-center gap-3.5 rounded-card bg-white px-4 py-3.5 shadow-card transition-colors hover:bg-neutral-100"
        >
          <LogOut className="h-5 w-5 text-red-500" />
          <span className="flex-1 text-left text-sm font-medium text-red-500">
            Se déconnecter
          </span>
        </button>
      </div>

      {/* Edit sheet */}
      <EditProfileSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        userId={userId}
        username={profile.username}
        avatarUrl={profile.avatar_url}
        bio={profile.bio}
        onSaved={() => loadProfile(userId)}
      />
    </div>
  );
}

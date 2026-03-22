"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, PlusCircle, MessageCircle, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/carte", label: "Carte", icon: MapPin },
  { href: "/donner", label: "Donner", icon: PlusCircle },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/profil", label: "Profil", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="shrink-0 border-t border-neutral-300/50 bg-white/95 backdrop-blur-md safe-area-bottom">
      <div className="flex items-stretch">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 pt-2.5 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <Icon
                className="h-6 w-6"
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              <span className="text-[11px] font-medium leading-tight">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

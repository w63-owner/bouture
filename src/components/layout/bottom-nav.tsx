"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useAnimationControls } from "framer-motion";
import { useEffect } from "react";
import {
  MapPin,
  BookOpen,
  PlusCircle,
  MessageCircle,
  User,
} from "lucide-react";
import { useUnreadCount } from "@/lib/hooks/use-unread-count";
import { useCollectionAnimationStore } from "@/lib/stores/collection-animation-store";

const NAV_ITEMS = [
  { href: "/carte", label: "Carte", icon: MapPin },
  { href: "/collection", label: "Collection", icon: BookOpen },
  { href: "/donner", label: "Donner", icon: PlusCircle },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/profil", label: "Profil", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const unreadCount = useUnreadCount();
  const isBouncing = useCollectionAnimationStore((s) => s.isBouncing);
  const controls = useAnimationControls();

  useEffect(() => {
    if (isBouncing) {
      controls.start({
        scale: [1, 1.4, 0.9, 1.1, 1],
        color: [
          "var(--color-primary)",
          "var(--color-accent)",
          "var(--color-accent)",
          "var(--color-primary)",
          "var(--color-primary)",
        ],
        transition: { duration: 0.6, ease: "easeOut" },
      });
    }
  }, [isBouncing, controls]);

  return (
    <nav className="shrink-0 border-t border-neutral-300/50 bg-white/95 backdrop-blur-md safe-area-bottom">
      <div className="flex items-stretch">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          const isCollection = href === "/collection";

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
              <div className="relative">
                {isCollection ? (
                  <motion.div id="collection-icon" animate={controls}>
                    <Icon
                      className="h-6 w-6"
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                  </motion.div>
                ) : (
                  <Icon
                    className="h-6 w-6"
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                )}
                {href === "/messages" && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-none text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-tight min-[361px]:text-[11px]">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./bottom-nav";

const HIDE_NAV_PREFIXES = ["/auth", "/carte/", "/messages/", "/profil/"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = !HIDE_NAV_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <>
      <main className="flex flex-1 flex-col min-h-0 overflow-y-auto">
        {children}
      </main>
      {showNav && <BottomNav />}
    </>
  );
}

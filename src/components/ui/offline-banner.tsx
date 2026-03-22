"use client";

import { WifiOff } from "lucide-react";
import { useIsOnline } from "@/components/layout/connectivity-provider";

export function OfflineBanner() {
  const isOnline = useIsOnline();

  if (isOnline) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-warning/15 px-4 py-2 text-sm font-medium text-warning">
      <WifiOff className="h-4 w-4" />
      <span>Vous êtes hors ligne</span>
    </div>
  );
}

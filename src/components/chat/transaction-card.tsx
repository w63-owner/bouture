"use client";

import { Repeat2, Clock, Check, X, Leaf } from "lucide-react";
import type { TransactionWithListings } from "@/lib/supabase/queries/transactions";

type TransactionStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "giver_confirmed"
  | "receiver_confirmed"
  | "completed";

interface TransactionCardProps {
  transaction: TransactionWithListings;
  currentUserId: string;
}

const STATUS_CONFIG: Record<
  TransactionStatus,
  { label: string; bg: string; border: string; icon: React.ReactNode }
> = {
  pending: {
    label: "En attente",
    bg: "bg-amber-50/80",
    border: "border-amber-200/50",
    icon: <Clock className="h-3.5 w-3.5 text-amber-600" />,
  },
  accepted: {
    label: "Accepté",
    bg: "bg-emerald-50/80",
    border: "border-emerald-200/50",
    icon: <Check className="h-3.5 w-3.5 text-emerald-600" />,
  },
  rejected: {
    label: "Refusé",
    bg: "bg-neutral-50/80",
    border: "border-neutral-200/50",
    icon: <X className="h-3.5 w-3.5 text-neutral-500" />,
  },
  cancelled: {
    label: "Annulé",
    bg: "bg-neutral-50/80",
    border: "border-neutral-200/50",
    icon: <X className="h-3.5 w-3.5 text-neutral-500" />,
  },
  giver_confirmed: {
    label: "Remise en cours",
    bg: "bg-emerald-50/80",
    border: "border-emerald-200/50",
    icon: <Check className="h-3.5 w-3.5 text-emerald-600" />,
  },
  receiver_confirmed: {
    label: "Confirmation en cours",
    bg: "bg-emerald-50/80",
    border: "border-emerald-200/50",
    icon: <Check className="h-3.5 w-3.5 text-emerald-600" />,
  },
  completed: {
    label: "Terminé",
    bg: "bg-emerald-50/80",
    border: "border-emerald-200/50",
    icon: <Leaf className="h-3.5 w-3.5 text-emerald-600" />,
  },
};

export function TransactionCard({
  transaction,
}: TransactionCardProps) {
  const status = transaction.status as TransactionStatus;
  const config = STATUS_CONFIG[status];

  return (
    <div
      className={`sticky top-[61px] z-10 flex items-center gap-3 border-b ${config.border} ${config.bg} backdrop-blur-sm px-4 py-2.5`}
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 shrink-0">
        <Repeat2 className="h-3.5 w-3.5 text-accent" />
      </div>

      <div className="flex items-center gap-2 min-w-0 flex-1">
        {transaction.offered_listing?.photos?.[0] && (
          <img
            src={transaction.offered_listing.photos[0]}
            alt={transaction.offered_listing.species_name}
            className="h-8 w-8 rounded-lg object-cover ring-1 ring-black/5"
          />
        )}
        <span className="text-xs text-neutral-500">⇄</span>
        {transaction.listing?.photos?.[0] && (
          <img
            src={transaction.listing.photos[0]}
            alt={transaction.listing.species_name}
            className="h-8 w-8 rounded-lg object-cover ring-1 ring-black/5"
          />
        )}
        <span className="text-xs font-medium text-neutral-700 truncate">
          Échange
        </span>
      </div>

      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium shrink-0 ${config.bg}`}
      >
        {config.icon}
        {config.label}
      </span>
    </div>
  );
}

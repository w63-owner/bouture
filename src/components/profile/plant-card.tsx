"use client";

import Link from "next/link";
import { Sprout } from "lucide-react";
import type { Database } from "@/lib/types/database.types";

type PlantStatus = Database["public"]["Enums"]["plant_status"];

interface PlantCardProps {
  id: string;
  speciesName: string;
  photo: string | null;
  status: PlantStatus;
}

const STATUS_CONFIG: Record<PlantStatus, { label: string; className: string }> =
  {
    collection: {
      label: "Dans ma collection",
      className: "bg-blue-100 text-blue-800",
    },
    for_donation: {
      label: "En don",
      className: "bg-green-100 text-green-800",
    },
    donated: {
      label: "Donné",
      className: "bg-neutral-200 text-neutral-600",
    },
  };

export function PlantCard({ id, speciesName, photo, status }: PlantCardProps) {
  const statusConfig = STATUS_CONFIG[status];

  return (
    <Link
      href={`/collection/${id}`}
      className="group flex flex-col overflow-hidden rounded-card bg-white shadow-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square bg-neutral-100">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={speciesName}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Sprout className="h-10 w-10 text-neutral-300" />
          </div>
        )}
        <span
          className={`absolute top-2 left-2 rounded-pill px-2 py-0.5 text-[10px] font-semibold ${statusConfig.className}`}
        >
          {statusConfig.label}
        </span>
      </div>
      <div className="px-3 py-2.5">
        <p className="truncate text-sm font-medium text-neutral-900">
          {speciesName}
        </p>
      </div>
    </Link>
  );
}

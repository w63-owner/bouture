import { Sprout } from "lucide-react";
import type { Database } from "@/lib/types/database.types";

type PlantStatus = Database["public"]["Enums"]["plant_status"];

interface PublicPlantCardProps {
  speciesName: string;
  photo: string | null;
  status: PlantStatus;
}

const STATUS_CONFIG: Record<
  Extract<PlantStatus, "collection" | "for_donation">,
  { label: string; className: string }
> = {
  collection: {
    label: "Collection",
    className: "bg-blue-100 text-blue-800",
  },
  for_donation: {
    label: "En don",
    className: "bg-green-100 text-green-800",
  },
};

export function PublicPlantCard({
  speciesName,
  photo,
  status,
}: PublicPlantCardProps) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];

  return (
    <div className="flex flex-col overflow-hidden rounded-card bg-white shadow-card">
      <div className="relative aspect-square bg-neutral-100">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={speciesName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Sprout className="h-10 w-10 text-neutral-300" />
          </div>
        )}
        {config && (
          <span
            className={`absolute top-2 left-2 rounded-pill px-2 py-0.5 text-[10px] font-semibold ${config.className}`}
          >
            {config.label}
          </span>
        )}
      </div>
      <div className="px-3 py-2.5">
        <p className="truncate text-sm font-medium text-neutral-900">
          {speciesName}
        </p>
      </div>
    </div>
  );
}

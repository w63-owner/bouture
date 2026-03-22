import { Skeleton } from "@/components/ui/skeleton";

export default function CarteLoading() {
  return (
    <div className="relative flex flex-1 flex-col">
      {/* Map area placeholder */}
      <Skeleton className="flex-1 !rounded-none" />

      {/* Search bar skeleton */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <Skeleton className="h-12 w-full rounded-pill" />
      </div>

      {/* Bottom sheet skeleton */}
      <div className="absolute bottom-0 left-0 right-0 rounded-t-sheet bg-white p-5 shadow-sheet">
        <Skeleton className="mx-auto mb-4 h-1 w-10 !rounded-full" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-64 shrink-0 space-y-3">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

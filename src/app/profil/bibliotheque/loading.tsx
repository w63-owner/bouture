import { Skeleton } from "@/components/ui/skeleton";

export default function BibliothequeLoading() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      {/* Header skeleton */}
      <header className="flex items-center gap-3 border-b border-neutral-100 px-5 py-4">
        <Skeleton className="h-8 w-8 !rounded-full" />
        <Skeleton className="h-6 w-44" />
      </header>

      {/* Sort bar skeleton */}
      <div className="flex gap-2 px-5 py-3">
        <Skeleton className="h-8 w-20 !rounded-pill" />
        <Skeleton className="h-8 w-20 !rounded-pill" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 gap-3 px-5 pb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

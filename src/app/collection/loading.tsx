import { Skeleton } from "@/components/ui/skeleton";

export default function CollectionLoading() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      {/* Header skeleton */}
      <header className="border-b border-neutral-100 px-5 py-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-1 h-3 w-44" />
        <Skeleton className="mt-3 h-9 w-full !rounded-pill" />
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-8 w-20 !rounded-pill" />
          <Skeleton className="h-8 w-24 !rounded-pill" />
          <Skeleton className="h-8 w-28 !rounded-pill" />
        </div>
      </header>

      {/* Grid skeleton */}
      <div className="grid grid-cols-3 gap-2.5 px-4 pt-4 pb-6 sm:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square w-full !rounded-card" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

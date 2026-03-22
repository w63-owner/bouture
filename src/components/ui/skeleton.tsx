interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer rounded-card bg-gradient-to-r from-neutral-300/40 via-neutral-300/70 to-neutral-300/40 bg-[length:200%_100%] ${className}`}
    />
  );
}

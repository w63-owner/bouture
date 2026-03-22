"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-error/10">
        <AlertTriangle className="h-12 w-12 text-error" strokeWidth={1.5} />
      </div>

      <h1 className="mb-2 font-heading text-2xl font-semibold text-neutral-900">
        Oups, une erreur est survenue
      </h1>

      <p className="mb-8 max-w-xs text-neutral-600 leading-relaxed">
        Quelque chose ne s&apos;est pas passé comme prévu. Réessayez ou
        revenez plus tard.
      </p>

      <button
        onClick={() => unstable_retry()}
        className="inline-flex items-center gap-2 rounded-btn bg-primary px-6 py-3 font-semibold text-white shadow-btn transition-all hover:bg-primary-light active:scale-[0.97]"
      >
        <RefreshCw className="h-4 w-4" />
        Réessayer
      </button>
    </div>
  );
}

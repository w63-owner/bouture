import Link from "next/link";
import { Sprout, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
        <Sprout className="h-12 w-12 text-primary" strokeWidth={1.5} />
      </div>

      <h1 className="mb-2 font-heading text-2xl font-semibold text-neutral-900">
        Page introuvable
      </h1>

      <p className="mb-8 max-w-xs text-neutral-600 leading-relaxed">
        Cette page n&apos;existe pas ou a été déplacée. Retournez sur la carte
        pour découvrir des boutures près de chez vous.
      </p>

      <Link
        href="/carte"
        className="inline-flex items-center gap-2 rounded-btn bg-primary px-6 py-3 font-semibold text-white shadow-btn transition-all hover:bg-primary-light active:scale-[0.97]"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la carte
      </Link>
    </div>
  );
}

import Link from "next/link";
import { Sprout } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col bg-secondary">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <Link
          href="/"
          className="mb-8 flex items-center gap-2 text-primary transition-opacity hover:opacity-80"
        >
          <Sprout className="h-8 w-8" strokeWidth={2} />
          <span className="font-display text-2xl font-semibold">bouture</span>
        </Link>

        <div className="w-full max-w-[420px]">{children}</div>

        <p className="mt-8 text-center text-xs text-neutral-600">
          © {new Date().getFullYear()} bouture.app — Échange de boutures entre
          particuliers
        </p>
      </div>
    </div>
  );
}

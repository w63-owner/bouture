import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
        <WifiOff className="h-12 w-12 text-primary" strokeWidth={1.5} />
      </div>

      <h1 className="mb-2 font-heading text-2xl font-semibold text-neutral-900">
        Vous êtes hors ligne
      </h1>

      <p className="mb-8 max-w-xs text-neutral-600 leading-relaxed">
        Pas de connexion internet pour le moment. Reconnectez-vous pour
        retrouver vos boutures et vos messages.
      </p>

      <div className="flex items-center gap-2 rounded-pill bg-warning/10 px-4 py-2 text-sm text-warning">
        <span className="inline-block h-2 w-2 rounded-full bg-warning animate-pulse" />
        En attente de connexion…
      </div>
    </div>
  );
}

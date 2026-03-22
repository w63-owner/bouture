import Link from "next/link";
import { Sprout, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyConversations() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
        <Sprout className="h-10 w-10 text-primary" strokeWidth={1.5} />
      </div>
      <h2 className="text-lg font-heading font-semibold text-neutral-900 mb-2">
        Pas encore de conversations
      </h2>
      <p className="text-sm text-neutral-600 leading-relaxed mb-6 max-w-xs">
        Explorez la carte pour découvrir des boutures près de chez vous et
        contacter les donneurs.
      </p>
      <Button variant="primary" asChild>
        <Link href="/carte">
          <MapPin className="h-5 w-5" />
          Explorer la carte
        </Link>
      </Button>
    </div>
  );
}

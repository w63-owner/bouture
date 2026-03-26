import { Suspense } from "react";
import { CarteContent } from "@/components/map/carte-content";

export default function CartePage() {
  return (
    <Suspense>
      <CarteContent />
    </Suspense>
  );
}

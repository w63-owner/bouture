import type { SVGProps } from "react";

export type VisualCategory =
  | "tombante"
  | "succulente"
  | "cactus"
  | "palmier"
  | "aracee"
  | "fougere"
  | "arbre"
  | "fleur"
  | "herbe_aromatique"
  | "autre";

type IllustrationProps = SVGProps<SVGSVGElement> & { className?: string };

function Tombante(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" {...props}>
      <rect x="48" y="30" width="24" height="22" rx="4" fill="#D4B896" stroke="#6B7280" strokeWidth="1.2" />
      <path d="M60 52 Q40 70 25 95" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M60 52 Q80 70 95 95" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M60 48 Q50 65 30 80" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" fill="none" />
      <ellipse cx="25" cy="96" rx="5" ry="3" fill="#86EFAC" fillOpacity="0.6" />
      <ellipse cx="95" cy="96" rx="5" ry="3" fill="#86EFAC" fillOpacity="0.6" />
      <ellipse cx="30" cy="81" rx="4" ry="2.5" fill="#BBF7D0" fillOpacity="0.5" />
    </svg>
  );
}

function Succulente(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" {...props}>
      <path d="M40 90 L44 105 L76 105 L80 90 Z" fill="#E8D5C4" stroke="#6B7280" strokeWidth="1.2" />
      <ellipse cx="60" cy="70" rx="22" ry="18" fill="#86EFAC" stroke="#22C55E" strokeWidth="1.5" />
      <ellipse cx="48" cy="58" rx="12" ry="16" fill="#4ADE80" stroke="#22C55E" strokeWidth="1.2" transform="rotate(-20 48 58)" />
      <ellipse cx="72" cy="58" rx="12" ry="16" fill="#4ADE80" stroke="#22C55E" strokeWidth="1.2" transform="rotate(20 72 58)" />
      <ellipse cx="60" cy="50" rx="10" ry="14" fill="#BBF7D0" stroke="#22C55E" strokeWidth="1.2" />
    </svg>
  );
}

function Cactus(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" {...props}>
      <path d="M44 95 L48 108 L72 108 L76 95 Z" fill="#E8D5C4" stroke="#6B7280" strokeWidth="1.2" />
      <rect x="52" y="35" width="16" height="60" rx="8" fill="#4ADE80" stroke="#22C55E" strokeWidth="1.5" />
      <path d="M52 60 Q38 58 34 48 Q34 42 42 42 Q48 42 52 50" fill="#22C55E" stroke="#16A34A" strokeWidth="1.2" />
      <path d="M68 55 Q82 52 86 42 Q86 36 78 36 Q72 36 68 45" fill="#22C55E" stroke="#16A34A" strokeWidth="1.2" />
      {/* Spines */}
      <line x1="56" y1="42" x2="54" y2="36" stroke="#6B7280" strokeWidth="0.8" />
      <line x1="64" y1="48" x2="67" y2="42" stroke="#6B7280" strokeWidth="0.8" />
      <line x1="56" y1="58" x2="53" y2="54" stroke="#6B7280" strokeWidth="0.8" />
      <line x1="64" y1="65" x2="67" y2="60" stroke="#6B7280" strokeWidth="0.8" />
      <line x1="56" y1="75" x2="53" y2="70" stroke="#6B7280" strokeWidth="0.8" />
      <line x1="64" y1="80" x2="67" y2="75" stroke="#6B7280" strokeWidth="0.8" />
    </svg>
  );
}

function Palmier(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" {...props}>
      <path d="M44 100 L48 112 L72 112 L76 100 Z" fill="#E8D5C4" stroke="#6B7280" strokeWidth="1.2" />
      <line x1="60" y1="100" x2="60" y2="50" stroke="#8B6F47" strokeWidth="4" strokeLinecap="round" />
      <path d="M60 50 Q40 30 20 35 Q40 40 55 50" fill="#4ADE80" stroke="#22C55E" strokeWidth="1.2" />
      <path d="M60 50 Q80 30 100 35 Q80 40 65 50" fill="#4ADE80" stroke="#22C55E" strokeWidth="1.2" />
      <path d="M60 48 Q45 20 30 18 Q45 25 58 45" fill="#86EFAC" stroke="#22C55E" strokeWidth="1" />
      <path d="M60 48 Q75 20 90 18 Q75 25 62 45" fill="#86EFAC" stroke="#22C55E" strokeWidth="1" />
      <path d="M60 46 Q58 22 55 10 Q62 22 61 44" fill="#BBF7D0" stroke="#22C55E" strokeWidth="0.8" />
    </svg>
  );
}

function Aracee(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" {...props}>
      <path d="M44 92 L48 108 L72 108 L76 92 Z" fill="#E8D5C4" stroke="#6B7280" strokeWidth="1.2" />
      <path d="M60 92 Q58 70 56 55" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Big split leaf (Monstera style) */}
      <path d="M56 55 Q30 40 25 20 Q40 30 56 50" fill="#4ADE80" stroke="#22C55E" strokeWidth="1.5" />
      <path d="M56 50 Q80 35 88 18 Q75 32 58 48" fill="#4ADE80" stroke="#22C55E" strokeWidth="1.5" />
      {/* Leaf holes */}
      <ellipse cx="40" cy="38" rx="3" ry="5" fill="white" fillOpacity="0.3" />
      <ellipse cx="74" cy="33" rx="3" ry="5" fill="white" fillOpacity="0.3" />
      {/* Second stem + leaf */}
      <path d="M62 92 Q65 72 67 60" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M67 60 Q85 50 90 38 Q80 48 68 58" fill="#86EFAC" stroke="#22C55E" strokeWidth="1.2" />
    </svg>
  );
}

function Fougere(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" {...props}>
      <path d="M44 95 L48 108 L72 108 L76 95 Z" fill="#E8D5C4" stroke="#6B7280" strokeWidth="1.2" />
      {/* Central frond */}
      <path d="M60 95 Q58 60 56 25" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Leaflets left */}
      <path d="M57 35 Q45 30 40 28" stroke="#4ADE80" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M57 45 Q42 38 36 36" stroke="#4ADE80" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M58 55 Q40 48 32 46" stroke="#4ADE80" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M58 65 Q42 58 34 56" stroke="#4ADE80" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M59 75 Q45 70 38 68" stroke="#4ADE80" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Leaflets right */}
      <path d="M57 35 Q68 30 74 28" stroke="#4ADE80" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M57 45 Q70 38 78 36" stroke="#4ADE80" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M58 55 Q72 48 82 46" stroke="#4ADE80" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M58 65 Q72 58 82 56" stroke="#4ADE80" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M59 75 Q72 70 80 68" stroke="#4ADE80" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Side fronds */}
      <path d="M55 90 Q35 65 28 40" stroke="#86EFAC" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M65 90 Q85 65 92 40" stroke="#86EFAC" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function Arbre(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" {...props}>
      <path d="M44 100 L48 112 L72 112 L76 100 Z" fill="#E8D5C4" stroke="#6B7280" strokeWidth="1.2" />
      <rect x="55" y="60" width="10" height="40" rx="2" fill="#8B6F47" stroke="#6B4226" strokeWidth="1" />
      {/* Canopy */}
      <ellipse cx="60" cy="42" rx="30" ry="28" fill="#4ADE80" stroke="#22C55E" strokeWidth="1.5" />
      <ellipse cx="48" cy="36" rx="16" ry="14" fill="#86EFAC" fillOpacity="0.5" />
      <ellipse cx="72" cy="38" rx="14" ry="12" fill="#BBF7D0" fillOpacity="0.4" />
    </svg>
  );
}

function Fleur(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" {...props}>
      <path d="M44 95 L48 108 L72 108 L76 95 Z" fill="#E8D5C4" stroke="#6B7280" strokeWidth="1.2" />
      <line x1="60" y1="95" x2="60" y2="52" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
      {/* Leaves on stem */}
      <path d="M60 78 Q48 72 42 68 Q50 72 58 78" fill="#86EFAC" stroke="#22C55E" strokeWidth="1" />
      <path d="M60 68 Q72 62 78 58 Q70 62 62 68" fill="#86EFAC" stroke="#22C55E" strokeWidth="1" />
      {/* Petals */}
      <ellipse cx="60" cy="35" rx="8" ry="12" fill="#F9A8D4" stroke="#EC4899" strokeWidth="1" />
      <ellipse cx="60" cy="35" rx="8" ry="12" fill="#F9A8D4" stroke="#EC4899" strokeWidth="1" transform="rotate(72 60 42)" />
      <ellipse cx="60" cy="35" rx="8" ry="12" fill="#F9A8D4" stroke="#EC4899" strokeWidth="1" transform="rotate(144 60 42)" />
      <ellipse cx="60" cy="35" rx="8" ry="12" fill="#F9A8D4" stroke="#EC4899" strokeWidth="1" transform="rotate(216 60 42)" />
      <ellipse cx="60" cy="35" rx="8" ry="12" fill="#F9A8D4" stroke="#EC4899" strokeWidth="1" transform="rotate(288 60 42)" />
      {/* Center */}
      <circle cx="60" cy="42" r="6" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" />
    </svg>
  );
}

function HerbeAromatique(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" {...props}>
      <path d="M44 95 L48 108 L72 108 L76 95 Z" fill="#E8D5C4" stroke="#6B7280" strokeWidth="1.2" />
      {/* Multiple thin stems with small leaves */}
      <line x1="50" y1="95" x2="48" y2="40" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="60" y1="95" x2="60" y2="30" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="70" y1="95" x2="72" y2="38" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" />
      {/* Small oval leaves */}
      <ellipse cx="44" cy="50" rx="5" ry="3" fill="#86EFAC" stroke="#22C55E" strokeWidth="0.8" transform="rotate(-15 44 50)" />
      <ellipse cx="52" cy="55" rx="5" ry="3" fill="#86EFAC" stroke="#22C55E" strokeWidth="0.8" transform="rotate(15 52 55)" />
      <ellipse cx="45" cy="65" rx="5" ry="3" fill="#BBF7D0" stroke="#22C55E" strokeWidth="0.8" transform="rotate(-10 45 65)" />
      <ellipse cx="55" cy="40" rx="5" ry="3" fill="#4ADE80" stroke="#22C55E" strokeWidth="0.8" transform="rotate(20 55 40)" />
      <ellipse cx="64" cy="45" rx="5" ry="3" fill="#86EFAC" stroke="#22C55E" strokeWidth="0.8" transform="rotate(-20 64 45)" />
      <ellipse cx="56" cy="32" rx="4" ry="2.5" fill="#4ADE80" stroke="#22C55E" strokeWidth="0.8" transform="rotate(10 56 32)" />
      <ellipse cx="65" cy="35" rx="4" ry="2.5" fill="#BBF7D0" stroke="#22C55E" strokeWidth="0.8" transform="rotate(-10 65 35)" />
      <ellipse cx="76" cy="48" rx="5" ry="3" fill="#86EFAC" stroke="#22C55E" strokeWidth="0.8" transform="rotate(15 76 48)" />
      <ellipse cx="68" cy="55" rx="5" ry="3" fill="#BBF7D0" stroke="#22C55E" strokeWidth="0.8" transform="rotate(-15 68 55)" />
      <ellipse cx="75" cy="60" rx="5" ry="3" fill="#4ADE80" stroke="#22C55E" strokeWidth="0.8" transform="rotate(10 75 60)" />
    </svg>
  );
}

function Autre(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" {...props}>
      <path d="M44 92 L48 108 L72 108 L76 92 Z" fill="#E8D5C4" stroke="#6B7280" strokeWidth="1.2" />
      <path d="M60 92 Q60 70 58 55" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Round leaf (Pilea-style) */}
      <circle cx="58" cy="42" r="18" fill="#4ADE80" stroke="#22C55E" strokeWidth="1.5" />
      <line x1="58" y1="42" x2="58" y2="28" stroke="#22C55E" strokeWidth="0.8" />
      <line x1="58" y1="42" x2="46" y2="35" stroke="#22C55E" strokeWidth="0.8" />
      <line x1="58" y1="42" x2="70" y2="35" stroke="#22C55E" strokeWidth="0.8" />
      <line x1="58" y1="42" x2="44" y2="46" stroke="#22C55E" strokeWidth="0.8" />
      <line x1="58" y1="42" x2="72" y2="46" stroke="#22C55E" strokeWidth="0.8" />
    </svg>
  );
}

const ILLUSTRATIONS: Record<VisualCategory, React.ComponentType<IllustrationProps>> = {
  tombante: Tombante,
  succulente: Succulente,
  cactus: Cactus,
  palmier: Palmier,
  aracee: Aracee,
  fougere: Fougere,
  arbre: Arbre,
  fleur: Fleur,
  herbe_aromatique: HerbeAromatique,
  autre: Autre,
};

interface PlantIllustrationProps extends IllustrationProps {
  category: VisualCategory | string | null | undefined;
}

export function PlantIllustration({ category, ...props }: PlantIllustrationProps) {
  const key = (category ?? "autre") as VisualCategory;
  const Component = ILLUSTRATIONS[key] ?? Autre;
  return <Component {...props} />;
}

interface PlantPlaceholderProps {
  className?: string;
}

export function PlantPlaceholder({ className = "" }: PlantPlaceholderProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Pot */}
      <path
        d="M40 85 L44 105 L76 105 L80 85 Z"
        fill="#E8D5C4"
        stroke="#6B7280"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M36 80 L84 80 L84 87 L36 87 Z"
        fill="#D4B896"
        stroke="#6B7280"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        rx="2"
      />

      {/* Main stem */}
      <path
        d="M60 80 Q60 60 58 45"
        stroke="#4ADE80"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Left leaf */}
      <path
        d="M58 55 Q40 40 35 30 Q45 35 55 50"
        stroke="#22C55E"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#86EFAC"
        fillOpacity="0.4"
      />
      {/* Left leaf vein */}
      <path
        d="M56 53 Q46 42 38 33"
        stroke="#22C55E"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Right leaf */}
      <path
        d="M59 50 Q78 38 85 28 Q76 38 62 48"
        stroke="#22C55E"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#86EFAC"
        fillOpacity="0.4"
      />
      {/* Right leaf vein */}
      <path
        d="M61 49 Q72 40 82 31"
        stroke="#22C55E"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Small top leaf */}
      <path
        d="M58 45 Q50 30 48 20 Q55 28 59 42"
        stroke="#22C55E"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#BBF7D0"
        fillOpacity="0.5"
      />

      {/* Small accent sprout right */}
      <path
        d="M65 70 Q72 58 75 52"
        stroke="#4ADE80"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M75 52 Q70 55 68 62"
        stroke="#22C55E"
        strokeWidth="1"
        strokeLinecap="round"
        fill="#BBF7D0"
        fillOpacity="0.3"
      />

      {/* Soil dots */}
      <circle cx="50" cy="82" r="1.5" fill="#8B6F47" opacity="0.5" />
      <circle cx="60" cy="83" r="1" fill="#8B6F47" opacity="0.4" />
      <circle cx="70" cy="82" r="1.5" fill="#8B6F47" opacity="0.5" />
    </svg>
  );
}

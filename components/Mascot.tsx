type Variant = "mae" | "rowan";

export function Mascot({
  variant = "mae",
  size = 200,
}: {
  variant?: Variant;
  size?: number;
}) {
  if (variant === "rowan") return <RowanMascot size={size} />;
  return <MaeMascot size={size} />;
}

function MaeMascot({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      aria-hidden
    >
      <ellipse cx="50" cy="92" rx="28" ry="4" fill="rgba(0,0,0,0.2)" />
      <path
        d="M 18 52 Q 8 84 30 88 L 70 88 Q 92 84 82 52 Z"
        fill="#B084FF"
        stroke="#1B1530"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M 30 88 L 50 80 L 70 88"
        fill="#9560FF"
        stroke="#1B1530"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M 16 36 Q 16 12 50 12 Q 84 12 84 36 L 86 80 Q 78 70 68 74 L 32 74 Q 22 70 14 80 Z"
        fill="#F2D67E"
        stroke="#1B1530"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M 28 40 Q 28 24 50 24 Q 72 24 72 40 L 72 58 Q 68 74 50 74 Q 32 74 28 58 Z"
        fill="#FFE0CC"
        stroke="#1B1530"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M 28 34 Q 36 22 50 26 Q 64 22 72 34 Q 66 38 60 36 Q 54 32 50 34 Q 46 32 40 36 Q 34 38 28 34 Z"
        fill="#F2D67E"
        stroke="#1B1530"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <g>
        <ellipse
          cx="38"
          cy="46"
          rx="13"
          ry="8"
          fill="#B084FF"
          stroke="#1B1530"
          strokeWidth="2.5"
        />
        <ellipse
          cx="62"
          cy="46"
          rx="13"
          ry="8"
          fill="#B084FF"
          stroke="#1B1530"
          strokeWidth="2.5"
        />
        <rect
          x="46"
          y="44"
          width="8"
          height="4"
          fill="#B084FF"
          stroke="#1B1530"
          strokeWidth="2.5"
        />
        <ellipse cx="38" cy="46" rx="5.5" ry="4" fill="#FFE0CC" />
        <ellipse cx="62" cy="46" rx="5.5" ry="4" fill="#FFE0CC" />
        <polygon
          points="72,40 73.5,43 77,43 74,45.5 75,49 72,47 69,49 70,45.5 67,43 70.5,43"
          fill="#FFE45C"
          stroke="#1B1530"
          strokeWidth="0.8"
        />
      </g>
      <circle cx="38" cy="46" r="2.6" fill="#1B1530" />
      <circle cx="62" cy="46" r="2.6" fill="#1B1530" />
      <circle cx="39" cy="45" r="0.9" fill="#FFF" />
      <circle cx="63" cy="45" r="0.9" fill="#FFF" />
      <g fill="#C97A4E" opacity="0.7">
        <circle cx="36" cy="60" r="0.9" />
        <circle cx="40" cy="62" r="0.9" />
        <circle cx="44" cy="60" r="0.9" />
        <circle cx="56" cy="60" r="0.9" />
        <circle cx="60" cy="62" r="0.9" />
        <circle cx="64" cy="60" r="0.9" />
      </g>
      <path
        d="M 42 68 Q 50 70 58 66"
        stroke="#1B1530"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RowanMascot({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      aria-hidden
    >
      <ellipse cx="50" cy="92" rx="28" ry="4" fill="rgba(0,0,0,0.22)" />
      <path
        d="M 20 52 Q 10 86 30 88 L 70 88 Q 90 86 80 52 Z"
        fill="#1B1530"
        stroke="#1B1530"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M 30 88 L 50 80 L 70 88"
        fill="#FFE45C"
        stroke="#1B1530"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="34" y="74" width="32" height="10" fill="#1B1530" />
      <path
        d="M 28 42 Q 28 22 50 22 Q 72 22 72 42 L 72 60 Q 68 76 50 76 Q 32 76 28 60 Z"
        fill="#FFE0CC"
        stroke="#1B1530"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M 26 32 Q 30 14 42 22 Q 48 14 56 22 Q 66 14 74 32 Q 70 26 62 28 Q 54 22 50 26 Q 46 22 38 28 Q 30 26 26 32 Z"
        fill="#7A5235"
        stroke="#1B1530"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M 38 22 Q 42 14 50 18"
        stroke="#7A5235"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 38 22 Q 42 14 50 18"
        stroke="#1B1530"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 22 44 L 78 38 L 80 52 L 20 56 Z"
        fill="#1B1530"
        stroke="#1B1530"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <polygon
        points="70,40 64,49 68,49 64,56 72,46 68,46 71,40"
        fill="#FFE45C"
        stroke="#1B1530"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <ellipse cx="38" cy="48" rx="5" ry="2.6" fill="#FFE0CC" />
      <ellipse cx="58" cy="47" rx="5" ry="2.6" fill="#FFE0CC" />
      <circle cx="38" cy="48" r="2.6" fill="#1B1530" />
      <circle cx="58" cy="47" r="2.6" fill="#1B1530" />
      <circle cx="39" cy="47" r="0.9" fill="#FFF" />
      <circle cx="59" cy="46" r="0.9" fill="#FFF" />
      <g fill="#C97A4E" opacity="0.7">
        <circle cx="36" cy="62" r="0.9" />
        <circle cx="40" cy="64" r="0.9" />
        <circle cx="44" cy="62" r="0.9" />
        <circle cx="56" cy="62" r="0.9" />
        <circle cx="60" cy="64" r="0.9" />
        <circle cx="64" cy="62" r="0.9" />
      </g>
      <path
        d="M 38 64 Q 50 74 62 64"
        stroke="#1B1530"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

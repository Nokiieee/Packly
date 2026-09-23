/**
 * The hero card's one picture: a soft, lit carry-on with travel stickers,
 * tipped slightly as if just set down. Authored SVG, so it stays crisp and
 * costs nothing to load. Decorative; the card's text carries every fact.
 */
export function SuitcaseArt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 170"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        <linearGradient id="sc-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff8ec" />
          <stop offset="0.55" stopColor="#f7e2c2" />
          <stop offset="1" stopColor="#e8c596" />
        </linearGradient>
        <linearGradient id="sc-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e2bb86" />
          <stop offset="1" stopColor="#cfa36b" />
        </linearGradient>
        <linearGradient id="sc-handle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b4a45" />
          <stop offset="1" stopColor="#1f2926" />
        </linearGradient>
        <radialGradient id="sc-shadow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#062a21" stopOpacity="0.45" />
          <stop offset="1" stopColor="#062a21" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="82" cy="156" rx="56" ry="9" fill="url(#sc-shadow)" />

      <g transform="rotate(-7 80 95)">
        {/* Telescoping handle */}
        <path
          d="M62 44V22a8 8 0 0 1 8-8h20a8 8 0 0 1 8 8v22"
          fill="none"
          stroke="url(#sc-handle)"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Wheels */}
        <circle cx="50" cy="149" r="6.5" fill="#1f2926" />
        <circle cx="110" cy="149" r="6.5" fill="#1f2926" />
        <circle cx="50" cy="149" r="2.5" fill="#56645f" />
        <circle cx="110" cy="149" r="2.5" fill="#56645f" />

        {/* Shell depth, then face */}
        <rect x="31" y="44" width="100" height="104" rx="20" fill="url(#sc-side)" />
        <rect x="29" y="40" width="98" height="104" rx="20" fill="url(#sc-body)" />

        {/* Ribs */}
        <path
          d="M56 50v84M78 50v84M100 50v84"
          stroke="#d9b280"
          strokeOpacity="0.55"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Gloss */}
        <rect x="35" y="47" width="10" height="56" rx="5" fill="#ffffff" opacity="0.7" />

        {/* Stickers */}
        <g transform="rotate(12 104 72)">
          <rect x="88" y="60" width="32" height="22" rx="6" fill="#ff8f6b" />
          <path d="M94 71h20" stroke="#fff4ec" strokeWidth="3.5" strokeLinecap="round" />
        </g>
        <circle cx="60" cy="112" r="14" fill="#7fd6b6" />
        <circle cx="60" cy="112" r="8.5" fill="none" stroke="#ffffff" strokeWidth="2.5" />
        <path d="M60 106.5v11M54.5 112h11" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="88" y="104" width="24" height="24" rx="12" fill="#ffd166" transform="rotate(-10 100 116)" />
        <path
          d="M95 116.5l3.5 3.5 7-7.5"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="rotate(-10 100 116)"
        />
      </g>
    </svg>
  );
}

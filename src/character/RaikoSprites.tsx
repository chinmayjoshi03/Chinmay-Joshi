/**
 * Raikō (original character, design sheet rev 04) — chibi 2D placeholder art as SVG symbols.
 * Each pose is a <g id="raiko-*"> drawn in a 200×140 box, feet at y≈136, facing right.
 * Final hand-drawn art can replace these symbols one-for-one (same ids + box).
 */
export function RaikoSprites() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <pattern id="rk-storm" width="30" height="30" patternUnits="userSpaceOnUse">
          <rect width="30" height="30" fill="#2c3a63" />
          <polygon points="8,2 3,12 8,11 4,20 13,8 8,9 11,2" fill="#ffd21f" stroke="#111" strokeWidth=".8" />
          <path d="M16 23 a3.5 3.5 0 1 1 6 -2 a2.6 2.6 0 1 1 4.4 2.6" fill="none" stroke="#f3eedd" strokeWidth="1.5" strokeLinecap="round" />
        </pattern>
        <radialGradient id="rk-iris" cx=".5" cy=".35" r=".7">
          <stop offset="0" stopColor="#9fe0ff" />
          <stop offset=".55" stopColor="#2f8fd8" />
          <stop offset="1" stopColor="#123a66" />
        </radialGradient>
        <linearGradient id="rk-blade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#bfe3ff" />
        </linearGradient>
        <filter id="rk-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <polygon id="rk-zap" points="0,0 10,-2 4,12 14,10 -2,36 4,16 -6,18" fill="#fff2a8" stroke="#111" strokeWidth="2.2" />

        <g id="rk-eye">
          <ellipse cx="0" cy="2" rx="6.4" ry="8.2" fill="#fff" />
          <ellipse cx=".6" cy="2.8" rx="5.4" ry="7.4" fill="url(#rk-iris)" />
          <ellipse cx=".8" cy="3.6" rx="2.4" ry="3.6" fill="#0b1a2e" />
          <circle cx="-1.8" cy="-1.4" r="2.1" fill="#fff" />
          <circle cx="2.6" cy="6.2" r="1" fill="#fff" />
          <path d="M-8.4 -5 Q0 -10.5 8.4 -5" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* head parts: face centre 0,0, chin y≈31 */}

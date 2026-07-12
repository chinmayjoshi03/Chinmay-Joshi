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
        <polygon id="rk-hair-back" points="-30,0 -40,-20 -30,-22 -38,-42 -20,-36 -18,-58 -4,-42 4,-62 14,-42 26,-56 26,-36 42,-40 32,-20 42,-18 30,0" fill="#e0b020" stroke="#111" strokeWidth="2.4" strokeLinejoin="round" />
        <g id="rk-face">
          <path d="M-25 -6 C-25 15 -12 27 0 31 C12 27 25 15 25 -6 C25 -27 -25 -27 -25 -6Z" fill="#fde3cc" stroke="#111" strokeWidth="2.4" />
          <path d="M-23 -4 C-14 4 14 4 23 -4 L23 -10 L-23 -10Z" fill="#f2c9a8" />
          <path d="M24 0 q6 2 3 10 q-2 2 -4 0" fill="#fde3cc" stroke="#111" strokeWidth="1.8" />
          <path d="M-24 0 q-6 2 -3 10 q2 2 4 0" fill="#fde3cc" stroke="#111" strokeWidth="1.8" />
        </g>
        <g id="rk-hair">
          <polygon points="-29,2 -30,-16 -24,-26 -32,-34 -16,-34 -12,-50 0,-38 8,-54 14,-38 26,-48 26,-32 34,-26 28,-14 29,2 22,-6 20,-14 10,-6 14,-16 2,-10 6,-20 -8,-12 -6,-22 -18,-8 -16,-18 -24,-4" fill="#ffd84a" stroke="#111" strokeWidth="2.4" strokeLinejoin="round" />
          <polygon points="-22,-6 -16,-18 -18,-8 -6,-22 -8,-12 6,-20 2,-10 14,-16 10,-6 20,-14 24,-18 18,-24 0,-26 -16,-24" fill="#e8b828" />
          <path d="M-14 -36 l5 -7 M0 -40 l5 -8 M14 -36 l5 -7" stroke="#fffbe0" strokeWidth="2.6" strokeLinecap="round" />
          <polygon points="-3,-30 -10,-14 -3,-16 -9,4 6,-20 -1,-18 4,-30" fill="#eaf6ff" stroke="#111" strokeWidth="1.8" filter="url(#rk-glow)" />
        </g>
        <g id="rk-phones">
          <path d="M-22 36 Q0 50 22 36" fill="none" stroke="#111" strokeWidth="5" />
          <rect x="-32" y="28" width="13" height="17" rx="5" fill="#111" />
          <rect x="19" y="28" width="13" height="17" rx="5" fill="#111" />
          <polyline points="-25,31 -28,36 -24,36 -27,42" fill="none" stroke="#ffd21f" strokeWidth="1.8" />
          <polyline points="26,31 23,36 27,36 24,42" fill="none" stroke="#ffd21f" strokeWidth="1.8" />
        </g>
        <g id="rk-face-sleep">
          <path d="M-17 6 Q-10 11 -3 6 M3 6 Q10 11 17 6" stroke="#111" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M-15 -4 L-5 -2 M15 -4 L5 -2" stroke="#b08a10" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="0" cy="20" rx="2.6" ry="2" fill="#7a2a20" stroke="#111" strokeWidth="1.2" />
        </g>
        <g id="rk-face-focus">
          <g transform="translate(-10 4)"><use href="#rk-eye" /></g>
          <g transform="translate(10 4) scale(-1 1)"><use href="#rk-eye" /></g>
          <path d="M-17 -10 L-3 -4 M17 -10 L3 -4" stroke="#111" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M-4 21 h8" stroke="#111" strokeWidth="2" />
        </g>

        {/* ── poses ── */}
        <g id="raiko-sleep">
          <path d="M60 132 C60 112 78 100 100 100 C122 100 140 112 140 132Z" fill="url(#rk-storm)" stroke="#111" strokeWidth="2.2" />
          <path d="M86 102 L114 102 L112 128 L88 128Z" fill="#23232c" stroke="#111" strokeWidth="2" />
          <line x1="50" y1="124" x2="156" y2="116" stroke="#2c2c34" strokeWidth="7" strokeLinecap="round" />
          <line x1="140" y1="117" x2="160" y2="115" stroke="#f3eedd" strokeWidth="5" strokeLinecap="round" />
          <g transform="translate(100 58)">
            <use href="#rk-hair-back" /><use href="#rk-face" /><use href="#rk-face-sleep" />
            <ellipse className="rk-drool" cx="9" cy="27" rx="3" ry="4" fill="#bfe3ff" stroke="#111" strokeWidth="1" />
            <use href="#rk-hair" /><use href="#rk-phones" />
          </g>
        </g>

        <g id="raiko-ready">
          <path d="M84 104 C70 112 62 124 60 136 L90 136 L100 120 L110 136 L140 136 C138 124 130 112 116 104Z" fill="#23232c" stroke="#111" strokeWidth="2.2" />
          <path d="M86 84 C64 90 50 104 44 122 L84 118 L92 100Z" fill="url(#rk-storm)" stroke="#111" strokeWidth="2.2" />
          <path d="M114 84 C136 90 150 104 156 122 L116 118 L108 100Z" fill="url(#rk-storm)" stroke="#111" strokeWidth="2.2" />
          <path d="M88 84 L112 84 L114 110 L86 110Z" fill="#23232c" stroke="#111" strokeWidth="2" />
          <line x1="110" y1="108" x2="160" y2="128" stroke="#2c2c34" strokeWidth="6" strokeLinecap="round" />
          <line x1="110" y1="108" x2="94" y2="98" stroke="#f3eedd" strokeWidth="5" strokeLinecap="round" />
          <path d="M92 92 q6 -4 10 2 q1 7 -6 7 q-7 -1 -4 -9Z" fill="#fde3cc" stroke="#111" strokeWidth="1.6" />
          <g transform="translate(100 46) scale(.95)">
            <use href="#rk-hair-back" /><use href="#rk-face" /><use href="#rk-face-focus" /><use href="#rk-hair" />
          </g>
        </g>

        <g id="raiko-strike">
          <g stroke="#2c3a63" strokeWidth="1.4" opacity=".5">
            <line x1="0" y1="70" x2="60" y2="70" /><line x1="8" y1="84" x2="80" y2="84" />
            <line x1="0" y1="100" x2="56" y2="100" /><line x1="16" y1="114" x2="90" y2="114" />
          </g>
          <path d="M128 88 C96 88 64 94 26 108 L52 112 L30 124 L82 116 L124 110Z" fill="url(#rk-storm)" stroke="#111" strokeWidth="2.2" />
          <path d="M110 108 C100 118 88 126 70 130 L80 138 C98 134 112 126 120 116Z" fill="#23232c" stroke="#111" strokeWidth="2" />
          <path d="M124 108 C134 118 146 126 166 128 L162 138 C142 136 130 126 118 116Z" fill="#23232c" stroke="#111" strokeWidth="2" />
          <line x1="132" y1="100" x2="198" y2="92" stroke="url(#rk-blade)" strokeWidth="4" strokeLinecap="round" filter="url(#rk-glow)" />
          <line x1="132" y1="100" x2="198" y2="92" stroke="#111" strokeWidth=".8" />
          <polyline points="150,84 160,92 166,84 178,94 186,86" fill="none" stroke="#e0b020" strokeWidth="2" />
          <g transform="translate(140 52) scale(.9) rotate(14)">
            <use href="#rk-hair-back" /><use href="#rk-face" />
            <g transform="translate(10 4) scale(-1 1)"><use href="#rk-eye" /></g>
            <path d="M-17 4 Q-10 8 -3 4" stroke="#111" strokeWidth="2.6" fill="none" />
            <path d="M3 -10 L17 -4" stroke="#111" strokeWidth="2.8" />
            <use href="#rk-hair" />
          </g>
        </g>

        <g id="raiko-land">
          <path d="M84 104 C66 114 58 126 56 136 L88 136 L100 122 L112 136 L144 136 C142 126 134 114 116 104Z" fill="#23232c" stroke="#111" strokeWidth="2.2" />
          <path d="M86 84 C66 92 56 108 54 124 L90 118Z" fill="url(#rk-storm)" stroke="#111" strokeWidth="2.2" />
          <path d="M114 84 C134 90 146 106 150 122 L112 118Z" fill="url(#rk-storm)" stroke="#111" strokeWidth="2.2" />
          <path d="M88 84 L112 84 L114 110 L86 110Z" fill="#23232c" stroke="#111" strokeWidth="2" />
          <path d="M112 90 L136 70" stroke="#2c3a63" strokeWidth="8" strokeLinecap="round" />
          <line x1="136" y1="70" x2="190" y2="20" stroke="url(#rk-blade)" strokeWidth="4" strokeLinecap="round" filter="url(#rk-glow)" />
          <line x1="136" y1="70" x2="190" y2="20" stroke="#111" strokeWidth=".8" />
          <path d="M190 20 C150 50 80 60 20 40" fill="none" stroke="#e0b020" strokeWidth="2" opacity=".7" />
          <g transform="translate(98 48) scale(.95)">
            <use href="#rk-hair-back" /><use href="#rk-face" /><use href="#rk-face-focus" /><use href="#rk-hair" />
          </g>
        </g>

        <g id="raiko-look">
          <path d="M86 108 L114 108 L118 136 L82 136Z" fill="#23232c" stroke="#111" strokeWidth="2" />
          <path d="M82 84 L118 84 L124 118 L76 118Z" fill="url(#rk-storm)" stroke="#111" strokeWidth="2.2" />
          <path d="M92 86 L108 86 L108 112 L92 112Z" fill="#23232c" stroke="#111" strokeWidth="2" />
          <path d="M118 90 L132 62" stroke="#2c3a63" strokeWidth="8" strokeLinecap="round" />
          <circle cx="132" cy="58" r="5" fill="#fde3cc" stroke="#111" strokeWidth="1.6" />
          <g transform="translate(100 46) scale(.95)">
            <use href="#rk-hair-back" /><use href="#rk-face" />
            {/* shy smile: happy closed eyes, deep blush, small smile */}
            <ellipse cx="-15" cy="14" rx="6" ry="3.4" fill="#ff7a86" opacity=".55" />
            <ellipse cx="15" cy="14" rx="6" ry="3.4" fill="#ff7a86" opacity=".55" />
            <path d="M-18 13 l2 -4 M-14 13 l2 -4 M12 13 l2 -4 M16 13 l2 -4" stroke="#d94a5c" strokeWidth="1" />
            <path d="M-16 7 Q-10 1 -4 7 M4 7 Q10 1 16 7" stroke="#111" strokeWidth="2.6" fill="none" strokeLinecap="round" />
            <path d="M-4 19 Q0 23 4 19" stroke="#111" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <use href="#rk-hair" /><use href="#rk-phones" />
          </g>
          <text x="150" y="40" fontFamily="var(--f-display), sans-serif" fontSize="15" fill="#ffd21f" stroke="#111" strokeWidth=".6">hi!</text>
        </g>

        <g id="raiko-bow">
          <path d="M84 112 L112 112 L116 136 L80 136Z" fill="#23232c" stroke="#111" strokeWidth="2" />
          <path d="M80 114 L116 114 L140 82 L104 72Z" fill="url(#rk-storm)" stroke="#111" strokeWidth="2.2" />
          <line x1="88" y1="116" x2="60" y2="134" stroke="#2c2c34" strokeWidth="6" strokeLinecap="round" />
          <g transform="translate(140 74) scale(.85) rotate(48)">
            <use href="#rk-hair-back" /><use href="#rk-face" />
            <path d="M-17 7 Q-10 0 -3 7 M3 7 Q10 0 17 7" stroke="#111" strokeWidth="2.8" fill="none" />
            <path d="M-5 18 Q0 25 5 18Z" fill="#7a2a20" stroke="#111" strokeWidth="1.4" />
            <use href="#rk-hair" />
          </g>
        </g>
      </defs>
    </svg>
  );
}

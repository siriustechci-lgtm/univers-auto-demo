/**
 * Official UNIVERS AUTO Vector Logo Assets & Branding
 * Strict corporate identity: Deep black #050505, Automotive Red #E50914, Metallic Gray #85878A, White #FFFFFF
 */

export const UNIVERS_AUTO_LOGO_SVG_RAW = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 180" width="100%" height="100%">
  <defs>
    <!-- Metallic Red Gradient -->
    <linearGradient id="uaRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF2E36" />
      <stop offset="45%" stop-color="#E50914" />
      <stop offset="100%" stop-color="#990008" />
    </linearGradient>

    <!-- Metallic Silver/Gray Gradient -->
    <linearGradient id="uaChromeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="35%" stop-color="#C5C7CA" />
      <stop offset="70%" stop-color="#85878A" />
      <stop offset="100%" stop-color="#4B4D52" />
    </linearGradient>

    <!-- Carbon Dark Background Accent -->
    <linearGradient id="uaDarkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#050505" stop-opacity="0" />
      <stop offset="50%" stop-color="#14171E" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#050505" stop-opacity="0" />
    </linearGradient>
  </defs>

  <!-- Speed Car Silhouette Top Curve -->
  <path
    d="M 40 85 C 75 50 140 40 215 38 C 300 36 385 45 440 68 C 410 64 345 52 240 52 C 160 52 100 66 52 90 Z"
    fill="url(#uaChromeGrad)"
  />

  <!-- Aerodynamic Red Swept Wing -->
  <path
    d="M 85 96 C 160 90 280 88 410 94 C 470 97 510 106 520 114 C 480 110 415 104 310 104 C 210 104 135 110 75 118 C 65 114 70 102 85 96 Z"
    fill="url(#uaRedGrad)"
  />

  <!-- Dynamic Grille Accent / Slits -->
  <rect x="52" y="102" width="14" height="4" rx="2" fill="#E50914" transform="skewX(-25)" />
  <rect x="72" y="102" width="14" height="4" rx="2" fill="#85878A" transform="skewX(-25)" />
  <rect x="92" y="102" width="14" height="4" rx="2" fill="#FFFFFF" transform="skewX(-25)" />

  <!-- Main Wordmark -->
  <g transform="skewX(-10)">
    <!-- UNIVERS -->
    <text
      x="50"
      y="155"
      font-family="'Plus Jakarta Sans', 'Arial Black', sans-serif"
      font-size="44"
      font-weight="900"
      letter-spacing="2"
      fill="#FFFFFF"
    >UNIVERS</text>

    <!-- AUTO -->
    <text
      x="275"
      y="155"
      font-family="'Plus Jakarta Sans', 'Arial Black', sans-serif"
      font-size="44"
      font-weight="900"
      letter-spacing="3"
      fill="url(#uaRedGrad)"
    >AUTO</text>
  </g>

  <!-- Subtitle -->
  <text
    x="52"
    y="175"
    font-family="'Plus Jakarta Sans', sans-serif"
    font-size="11"
    font-weight="700"
    letter-spacing="5"
    fill="#85878A"
  >ACHAT &amp; VENTE DE VÉHICULES NEUFS ET D’OCCASION</text>
</svg>`;

export const UNIVERS_AUTO_LOGO_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(
  UNIVERS_AUTO_LOGO_SVG_RAW
)}`;

export const COMPANY_NAME_OFFICIAL = 'UNIVERS AUTO';

// Backward compatibility alias
export const BANESERVICES_LOGO_SVG_RAW = UNIVERS_AUTO_LOGO_SVG_RAW;
export const BANESERVICES_LOGO_DATA_URI = UNIVERS_AUTO_LOGO_DATA_URI;


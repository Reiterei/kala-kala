// AUTO-GENERATED from tips/ SVG assets
// Usage:
//   import { TipIcon, getTipIcon } from '../assets/TipIcons';
//   <TipIcon type="brush" size={24} color="#27ad85" />
//
// getTipIcon(tipType) maps a tipType string from the data files to an icon key.
// Known tipType values from honolulu-sets.js:
//   "Brush / Chisel"          → "brush"  (standard Honolulu)
//   "Brush² / Chisel"         → "brush"  (Honolulu²)
//   "Supreme Brush / Chisel"  → "supreme-brush"
//   Add more mappings below as new series are introduced.

const PATHS = {
  brush: (
    <>
      <path d="M5 22C5 19 7.5 14 7.5 14H16.5C16.5 14 19 19 19 22" strokeLinecap="round" strokeLinejoin="round" stroke-width="1" fillOpacity="0"/>
      <path d="M7.5 14L9 12H15L16.5 14" strokeLinecap="round" strokeLinejoin="round" stroke-width=".5" fillOpacity="0"/>
      <path d="M8.5 12C8.5 8 12 2.5 12 2.5C12 2.5 15.5 8 15.5 12Z" fillOpacity=".75" strokeLinejoin="round" stroke-width=".5"/>
    </>
  ),
  chisel: (
    <>
      <path d="M5 22C5 19 7.5 14 7.5 14H16.5C16.5 14 19 19 19 22" strokeLinecap="round" strokeLinejoin="round" stroke-width="1" fillOpacity="0"/>
      <path d="M7.5 14L8.5 10H15.5L16.5 14" strokeLinecap="round" strokeLinejoin="round" stroke-width=".5" fillOpacity="0"/>
      <path d="M8.5 10L8.5 5L15.5 2.5L15.5 10Z" fillOpacity=".75" strokeLinejoin="round" stroke-width=".5"/>
    </>
  ),
  fine: (
    <>
      <path d="M5 22C5 19 7.5 15 7.5 15H16.5C16.5 15 19 19 19 22" strokeLinecap="round" strokeLinejoin="round" stroke-width="1" fillOpacity="0"/>
      <path d="M7.5 15L9.5 8H14.5L16.5 15" strokeLinecap="round" strokeLinejoin="round" stroke-width=".5" fillOpacity="0"/>
      <path d="M10.5 8C10.5 5.5 12 3 12 3C12 3 13.5 5.5 13.5 8Z" fillOpacity=".75" strokeLinejoin="round" stroke-width=".5"/>
    </>
  ),
  'supreme-brush': (
    <>
      <path d="M5 22C5 19 7.5 14 7.5 14H16.5C16.5 14 19 19 19 22" strokeLinecap="round" strokeLinejoin="round" stroke-width="1" fillOpacity="0"/>
      <path d="M7.5 14L9 12H15L16.5 14" strokeLinecap="round" strokeLinejoin="round" stroke-width=".5" fillOpacity="0"/>
      <path d="M8 12C8 7.5 12 1.5 12 1.5C12 1.5 16 7.5 16 12Z" fillOpacity=".75" strokeLinejoin="round" stroke-width=".5"/>
    </>
  ),
  'soft-chisel': (
    <>
      <path d="M5 22C5 19 8.0 14 8.0 14H16.0C16.0 14 19 19 19 22" strokeLinecap="round" strokeLinejoin="round" stroke-width="1" fillOpacity="0"/>
      <path d="M8.0 14L9.2 10H14.8L16.0 14" strokeLinecap="round" strokeLinejoin="round" stroke-width=".5" fillOpacity="0"/>
      <path d="M9.2 10L9.2 4.5Q12 3.5 14.8 1.5L14.8 10Z" fillOpacity=".75" strokeLinejoin="round" stroke-width=".5"/>
    </>
  ),
  'mini-brush': (
    <>
      <path d="M5 22C5 19 7.5 15 7.5 15H16.5C16.5 15 19 19 19 22" strokeLinecap="round" strokeLinejoin="round" stroke-width="1" fillOpacity="0"/>
      <path d="M7.5 15L9.5 8H14.5L16.5 15" strokeLinecap="round" strokeLinejoin="round" stroke-width=".5" fillOpacity="0"/>
      <path d="M11 8C11 5.5 12 3 12 3C12 3 13 5.5 13 8Z" fillOpacity=".75" strokeLinejoin="round" stroke-width=".5"/>
    </>
  ),
  'slim-broad': (
    <>
      <path d="M5 22C5 19 7.5 15 7.5 15H16.5C16.5 15 19 19 19 22" strokeLinecap="round" strokeLinejoin="round" stroke-width="1" fillOpacity="0"/>
      <path d="M7.5 15L9 9H15L16.5 15" strokeLinecap="round" strokeLinejoin="round" stroke-width=".5" fillOpacity="0"/>
      <path d="M9 9L9 3.5L14 1.5L15 4.5L15 9Z" fillOpacity=".75" strokeLinejoin="round" stroke-width=".5"/>
    </>
  ),
  'extra-wide': (
    <>
      <path d="M3 22C3 18.5 6 13 6 13H18C18 13 21 18.5 21 22" strokeLinecap="round" strokeLinejoin="round" stroke-width="1" fillOpacity="0"/>
      <path d="M6 13L7.5 9H16.5L18 13" strokeLinecap="round" strokeLinejoin="round" stroke-width=".5" fillOpacity="0"/>
      <path d="M7.5 9L7.5 3L16.5 2L16.5 9Z" fillOpacity=".75" strokeLinejoin="round" stroke-width=".5"/>
    </>
  ),
};

// Maps tipType strings (from data files) → icon key
const TIP_TYPE_MAP = {
  // Honolulu
  'Brush':           'brush',
  'Chisel':           'chisel',
  // Honolulu B
  'Fine':            'fine',
  // Honolulu S
  'Soft Chisel':           'soft-chisel',
  // Honolulu Plus
  'Supreme Brush':            'supreme-brush',
  // Honolulu²
  'Brush²':           'brush',
  'Chisel²':           'chisel',
  // Honolulu² B
  'Fine²':           'fine',
  // Kaala / Kaala B
  'Slim Broad':      'slim-broad',
  'Mini Brush':      'brush',
  // Molokai
  'Extra-Wide':      'extra-wide',
  // Add future mappings here as new series data files are introduced
};

/**
 * Returns the icon key for a tipType string.
 * Falls back to 'brush' if unknown.
 */
export function getTipIcon(tipType) {
  return TIP_TYPE_MAP[tipType] ?? 'brush';
}

// Display label overrides — internal tipType strings stay distinct (e.g. for
// Honolulu² data integrity), but render identically to their base variant.
const TIP_LABEL_MAP = {
  'Brush²': 'Brush',
  'Chisel²': 'Chisel',
  'Fine²': 'Fine',
};

/**
 * Returns the display label for a tipType string.
 * Falls back to the raw tipType if no override exists.
 */
export function getTipLabel(tipType) {
  return TIP_LABEL_MAP[tipType] ?? tipType;
}

/**
 * Renders a tip SVG icon.
 * @param {string}  type   - icon key (e.g. 'brush', 'chisel', 'fine')
 * @param {number}  size   - width & height in px (default 24)
 * @param {string}  color  - stroke/fill color (default '#27ad85')
 * @param {object}  style  - optional extra style on the <svg> element
 */
export function TipIcon({ type = 'brush', size = 24, color = '#e8590c', style }) {
  const paths = PATHS[type] ?? PATHS['brush'];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      stroke={color}
      strokeWidth="1.8"
      style={style}
    >
      {paths}
    </svg>
  );
}

import { getLegacyDisplay } from '../utils/colorUtils';
import { RADIUS, SHADOW } from '../styles/theme';

export function ColorSwatch({ color, size = 'md', settings }) {
  const legacy = getLegacyDisplay(color);
  const bg = `#${color.hex}`;

  const r = parseInt(color.hex.substring(0, 2), 16);
  const g = parseInt(color.hex.substring(2, 4), 16);
  const b = parseInt(color.hex.substring(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const textColor = lum > 0.55 ? '#3a4a4a' : '#ffffff';

  const sizes = {
    sm: { width: 44, height: 44, fontSize: 11, subSize: 8 },
    md: { width: 54, height: 54, fontSize: 13, subSize: 10 },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div style={{
      width: s.width, height: s.height,
      backgroundColor: bg, borderRadius: RADIUS.md,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, boxShadow: SHADOW.sm,
    }}>
      <span style={{ color: textColor, fontWeight: 700, fontSize: s.fontSize, lineHeight: 1.2, letterSpacing: 0.3 }}>
        {color.code}
      </span>
      {!settings?.hideLegacy && legacy?.code && (
        <span style={{ color: textColor, fontSize: s.subSize, opacity: 0.75, lineHeight: 1.2 }}>
          {legacy.code}
        </span>
      )}
    </div>
  );
}

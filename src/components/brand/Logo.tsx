import React from 'react';

type LogoVariant = 'horizontal' | 'stacked' | 'symbol' | 'wordmark';
type LogoTone = 'default' | 'reversed' | 'mono';

interface LogoProps {
  variant?: LogoVariant;
  tone?: LogoTone;
  size?: number | string;
  className?: string;
  'aria-label'?: string;
}

const SYMBOL_SVG = (
  <svg viewBox="0 0 64 64" role="img" aria-hidden="true">
    <title>Chokur System Symbol</title>
    <rect x="8" y="12" width="40" height="4" rx="2" fill="currentColor" />
    <rect x="8" y="28" width="30" height="4" rx="2" fill="currentColor" />
    <rect x="8" y="44" width="20" height="4" rx="2" fill="var(--color-brand, #C2410C)" />
  </svg>
);

const SYMBOL_MONO_SVG = (
  <svg viewBox="0 0 64 64" role="img" aria-hidden="true">
    <title>Chokur System Symbol</title>
    <rect x="8" y="12" width="40" height="4" rx="2" fill="currentColor" />
    <rect x="8" y="28" width="30" height="4" rx="2" fill="currentColor" />
    <rect x="8" y="44" width="20" height="4" rx="2" fill="currentColor" />
  </svg>
);

const WORDMARK_SVG = (
  <svg viewBox="0 0 200 56" role="img" aria-hidden="true">
    <title>Chokur</title>
    <g stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none">
      <path d="M0 8 C0 2 6 -4 12 -4 H32 C38 -4 44 2 44 8 V48 C44 54 38 60 32 60 H12 C6 60 0 54 0 48 Z M0 8 V48" />
      <path d="M12 -4 H32" />
      <path d="M12 60 H32" />
      <path d="M52 -4 V56" />
      <path d="M52 28 C52 22 58 16 64 16 H80 C86 16 92 22 92 28 V56" />
      <path d="M100 28 C100 16 110 6 122 6 C134 6 144 16 144 28 C144 40 134 50 122 50 C110 50 100 40 100 28 Z" />
      <path d="M156 -4 V56" />
      <path d="M156 28 L172 6" />
      <path d="M156 28 L172 50" />
      <path d="M184 8 V48 C184 54 190 60 196 60 H208 C214 60 220 54 220 48 V8" />
      <path d="M232 -4 V56" />
      <path d="M232 8 C232 0 238 -4 244 -4 H256 C262 -4 268 0 268 8 C268 16 262 22 256 22 H244" />
    </g>
  </svg>
);

const HORIZONTAL_SVG = (
  <svg viewBox="0 0 240 64" role="img" aria-hidden="true">
    <title>Chokur System</title>
    <g fill="currentColor">
      <rect x="8" y="12" width="40" height="4" rx="2" />
      <rect x="8" y="28" width="30" height="4" rx="2" />
      <rect x="8" y="44" width="20" height="4" rx="2" fill="var(--color-brand, #C2410C)" />
    </g>
    <g transform="translate(80, 0)" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none">
      <path d="M0 12 C0 8 4 4 8 4 H20 C24 4 28 8 28 12 V52 C28 56 24 60 20 60 H8 C4 60 0 56 0 52 Z M0 12 V52" />
      <path d="M8 4 H20" />
      <path d="M8 60 H20" />
      <path d="M30 4 V52" />
      <path d="M30 32 C30 28 34 24 38 24 H48 C52 24 56 28 56 32 V52" />
      <path d="M62 32 C62 24 68 18 76 18 C84 18 90 24 90 32 C90 40 84 46 76 46 C68 46 62 40 62 32 Z" />
      <path d="M96 4 V52" />
      <path d="M96 28 L106 14" />
      <path d="M96 28 L106 42" />
      <path d="M112 12 V48 C112 52 116 56 120 56 H128 C132 56 136 52 136 48 V12" />
      <path d="M142 4 V52" />
      <path d="M142 12 C142 8 146 4 150 4 H158 C162 4 166 8 166 12 C166 18 162 22 158 22 H150" />
    </g>
    <g transform="translate(80, 38)" stroke="var(--color-text-tertiary, #9A958A)" strokeWidth="3" strokeLinecap="round" fill="none">
      <path d="M0 10 C0 6 4 2 8 2 H16 C20 2 24 6 24 10 V18 C24 22 20 26 16 26 H8 C4 26 0 22 0 18 Z M0 10 V18" />
      <path d="M4 2 H16" />
      <path d="M4 26 H16" />
      <path d="M28 2 V26" />
      <path d="M28 26 C28 30 32 34 36 34 H40 C44 34 48 30 48 26 V2" />
      <path d="M52 10 C52 6 56 2 60 2 H68 C72 2 76 6 76 10 V18 C76 22 72 26 68 26 H60 C56 26 52 22 52 18 V10 Z M52 10 V18" />
      <path d="M56 2 H68" />
      <path d="M56 26 H68" />
      <path d="M72 2 V26" />
      <path d="M80 2 V26" />
      <path d="M86 10 C86 6 90 2 94 2 H100 C104 2 108 6 108 10 V18 C108 22 104 26 100 26 H94 C90 26 86 22 86 18 V10 Z M86 10 V18" />
      <path d="M90 2 H100" />
      <path d="M90 26 H100" />
    </g>
  </svg>
);

const STACKED_SVG = (
  <svg viewBox="0 0 128 128" role="img" aria-hidden="true">
    <title>Chokur System</title>
    <g transform="translate(32, 8)" fill="currentColor">
      <rect x="8" y="12" width="40" height="4" rx="2" />
      <rect x="8" y="28" width="30" height="4" rx="2" />
      <rect x="8" y="44" width="20" height="4" rx="2" fill="var(--color-brand, #C2410C)" />
    </g>
    <g transform="translate(16, 72)" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none">
      <path d="M0 8 C0 2 6 -4 12 -4 H32 C38 -4 44 2 44 8 V48 C44 54 38 60 32 60 H12 C6 60 0 54 0 48 Z M0 8 V48" />
      <path d="M12 -4 H32" />
      <path d="M12 60 H32" />
      <path d="M52 -4 V56" />
      <path d="M52 28 C52 22 58 16 64 16 H80 C86 16 92 22 92 28 V56" />
      <path d="M100 28 C100 16 110 6 122 6 C134 6 144 16 144 28 C144 40 134 50 122 50 C110 50 100 40 100 28 Z" />
      <path d="M156 -4 V56" />
      <path d="M156 28 L172 6" />
      <path d="M156 28 L172 50" />
      <path d="M184 8 V48 C184 54 190 60 196 60 H208 C214 60 220 54 220 48 V8" />
      <path d="M232 -4 V56" />
      <path d="M232 8 C232 0 238 -4 244 -4 H256 C262 -4 268 0 268 8 C268 16 262 22 256 22 H244" />
    </g>
    <g transform="translate(24, 108)" stroke="var(--color-text-tertiary, #9A958A)" strokeWidth="3" strokeLinecap="round" fill="none">
      <path d="M0 8 C0 4 4 0 8 0 H16 C20 0 24 4 24 8 V16 C24 20 20 24 16 24 H8 C4 24 0 20 0 16 Z M0 8 V16" />
      <path d="M4 0 H16" />
      <path d="M4 24 H16" />
      <path d="M28 0 V24" />
      <path d="M28 24 C28 28 32 32 36 32 H40 C44 32 48 28 48 24 V0" />
      <path d="M52 8 C52 4 56 0 60 0 H68 C72 0 76 4 76 8 V16 C76 20 72 24 68 24 H60 C56 24 52 20 52 16 V8 Z M52 8 V16" />
      <path d="M56 0 H68" />
      <path d="M56 24 H68" />
      <path d="M72 0 V24" />
      <path d="M80 0 V24" />
      <path d="M86 8 C86 4 90 0 94 0 H100 C104 0 108 4 108 8 V16 C108 20 104 24 100 24 H94 C90 24 86 20 86 16 V8 Z M86 8 V16" />
      <path d="M90 0 H100" />
      <path d="M90 24 H100" />
    </g>
  </svg>
);

const TONE_STYLES: Record<LogoTone, React.CSSProperties> = {
  default: { color: '#111111' },
  reversed: { color: '#F6F1E7' },
  mono: { color: '#111111' },
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  tone = 'default',
  size = 40,
  className = '',
  'aria-label': ariaLabel = 'Chokur System',
}) => {
  const style: React.CSSProperties = {
    width: size,
    height: size,
    display: 'inline-block',
    verticalAlign: 'middle',
    flexShrink: 0,
    ...TONE_STYLES[tone],
  };

  const useMonoSymbol = tone === 'mono';

  let svgContent: React.ReactNode;

  switch (variant) {
    case 'symbol':
      svgContent = useMonoSymbol ? SYMBOL_MONO_SVG : SYMBOL_SVG;
      break;
    case 'wordmark':
      svgContent = WORDMARK_SVG;
      break;
    case 'horizontal':
      svgContent = HORIZONTAL_SVG;
      break;
    case 'stacked':
      svgContent = STACKED_SVG;
      break;
    default:
      svgContent = HORIZONTAL_SVG;
  }

  return (
    <span
      className={className}
      style={style}
      role="img"
      aria-label={ariaLabel}
      aria-hidden={false}
    >
      {svgContent}
    </span>
  );
};

export default Logo;
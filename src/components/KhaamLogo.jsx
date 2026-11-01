import React from 'react';

/**
 * KHAAM POSHAK (خام پوشاک)
 * High-End Luxury Artisanal Fashion Brand Identity
 * 
 * Brand Pillars:
 * - 100% Handmade Designs & Heirloom Craftsmanship
 * - Ancestral Wooden Pit Looms (Khaddar, Raw Silk, Lawn)
 * - Authentic Hand-Embroidered Zardozi, Chikankari & Tilla
 * - Timeless South Asian Haute Couture
 */
export default function KhaamLogo({
  variant = 'navbar',
  size = 'default',
  isDark = false,
  showTagline = true,
  taglineText = 'HANDMADE DESIGNS • HEIRLOOM CRAFT',
}) {
  const isCompact = size === 'compact';
  const isLarge = size === 'large';

  // Palette
  const primaryText = isDark ? '#FFFFFF' : '#111111';
  const secondaryText = isDark ? '#E5E5E5' : '#2D2D2D';
  const accentColor = '#E35205'; // Signature artisanal terracotta
  const accentLight = '#F97316';
  const goldColor = '#D4AF37'; // Subtle antique gold highlight
  const mutedText = isDark ? '#A3A3A3' : '#6B665F';
  const hairline = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(17, 17, 17, 0.12)';

  /**
   * The Artisan Emblem:
   * Symmetrical Mughal/Ajrak Octagonal Cartouche featuring:
   * - Ancestral Loom Warp & Weft Threads
   * - Traditional Embroiderer's Golden Needle & Looping Thread
   * - Four Heritage Florets representing Master Artisans
   */
  const renderEmblem = (emblemSize = isCompact ? 32 : isLarge ? 48 : 38) => (
    <div
      style={{
        position: 'relative',
        width: `${emblemSize}px`,
        height: `${emblemSize}px`,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        viewBox="0 0 100 100"
        width={emblemSize}
        height={emblemSize}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id={`terracotta-grad-${isDark ? 'd' : 'l'}`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="50%" stopColor="#C2410C" />
            <stop offset="100%" stopColor="#9A3412" />
          </linearGradient>
          <linearGradient id={`gold-needle-${isDark ? 'd' : 'l'}`} x1="15" y1="85" x2="85" y2="15" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#CA8A04" />
            <stop offset="50%" stopColor="#FACC15" />
            <stop offset="100%" stopColor="#EAB308" />
          </linearGradient>
        </defs>

        {/* 1. Outer Octagonal Cartouche (Ancestral Mughal Jali & Handloom Frame) */}
        <rect
          x="16"
          y="16"
          width="68"
          height="68"
          rx="6"
          transform="rotate(45 50 50)"
          stroke={primaryText}
          strokeWidth="2"
          strokeLinejoin="round"
          opacity={isDark ? '0.85' : '0.9'}
        />

        {/* 2. Inner Terracotta Inset Border with Thread Dash */}
        <rect
          x="22"
          y="22"
          width="56"
          height="56"
          rx="4"
          transform="rotate(45 50 50)"
          stroke={accentColor}
          strokeWidth="1.75"
          strokeDasharray="4 2.5"
          strokeLinejoin="round"
        />

        {/* 3. Handloom Warp Threads (Vertical Hand-Spun Grid) */}
        <line x1="42" y1="28" x2="42" y2="72" stroke={primaryText} strokeWidth="1" opacity="0.35" />
        <line x1="50" y1="24" x2="50" y2="76" stroke={primaryText} strokeWidth="1.25" opacity="0.55" />
        <line x1="58" y1="28" x2="58" y2="72" stroke={primaryText} strokeWidth="1" opacity="0.35" />

        {/* 4. Handloom Weft Threads (Horizontal Hand-Spun Grid) */}
        <line x1="28" y1="42" x2="72" y2="42" stroke={primaryText} strokeWidth="1" opacity="0.35" />
        <line x1="24" y1="50" x2="76" y2="50" stroke={primaryText} strokeWidth="1.25" opacity="0.55" />
        <line x1="28" y1="58" x2="72" y2="58" stroke={primaryText} strokeWidth="1" opacity="0.35" />

        {/* 5. Master Artisan Golden Needle (Slanted across loom at 45°) */}
        <line
          x1="22"
          y1="78"
          x2="78"
          y2="22"
          stroke={`url(#gold-needle-${isDark ? 'd' : 'l'})`}
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Needle Eyelet */}
        <ellipse
          cx="72"
          cy="28"
          rx="3.5"
          ry="1.8"
          transform="rotate(-45 72 28)"
          stroke={primaryText}
          strokeWidth="1.5"
          fill={isDark ? '#111111' : '#FFFFFF'}
        />

        {/* Needle Point Tip */}
        <circle cx="23" cy="77" r="1.5" fill="#EAB308" />

        {/* 6. Hand-Embroidered Looping Thread (Zardozi Silk Curve) */}
        <path
          d="M 72 28 Q 86 16 88 32 Q 90 48 68 54 Q 48 60 46 76"
          stroke={accentColor}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="2.5 1.5"
          fill="none"
        />

        {/* 7. Cardinal Artisan Dots / Florets (4 Master Craft Regions) */}
        <circle cx="50" cy="14" r="2.5" fill={accentColor} />
        <circle cx="50" cy="86" r="2.5" fill={accentColor} />
        <circle cx="14" cy="50" r="2.5" fill={accentColor} />
        <circle cx="86" cy="50" r="2.5" fill={accentColor} />

        {/* 8. Center Diamond Jewel */}
        <rect
          x="46.5"
          y="46.5"
          width="7"
          height="7"
          transform="rotate(45 50 50)"
          fill={accentColor}
        />
      </svg>
    </div>
  );

  // STACKED / HERO / SPLASH VARIANT (Centered Royal Seal)
  if (variant === 'stacked' || variant === 'hero') {
    return (
      <div
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          userSelect: 'none',
          textDecoration: 'none',
          gap: isLarge ? '0.65rem' : '0.45rem',
        }}
      >
        {/* Emblem on top */}
        {renderEmblem(isLarge ? 58 : 46)}

        {/* Brand Name */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.2rem' }}>
          <span
            style={{
              fontFamily: "'Cinzel', 'Playfair Display', 'Plus Jakarta Sans', serif",
              fontSize: isLarge ? '1.85rem' : '1.45rem',
              fontWeight: 800,
              letterSpacing: '0.22em',
              color: primaryText,
              textTransform: 'uppercase',
              lineHeight: 1.1,
            }}
          >
            KHAAM
          </span>
          <span
            style={{
              fontFamily: "'Cinzel', 'Playfair Display', 'Plus Jakarta Sans', serif",
              fontSize: isLarge ? '1.85rem' : '1.45rem',
              fontWeight: 800,
              letterSpacing: '0.22em',
              color: accentColor,
              textTransform: 'uppercase',
              lineHeight: 1.1,
            }}
          >
            POSHAK
          </span>
        </div>

        {/* Urdu Calligraphy */}
        <div
          style={{
            fontFamily: "'Noto Nastaliq Urdu', 'Urdu Typesetting', serif",
            fontSize: isLarge ? '1.15rem' : '0.95rem',
            fontWeight: 700,
            color: accentColor,
            lineHeight: 1.2,
            direction: 'rtl',
          }}
        >
          خام پوشاک
        </div>

        {/* Handmade Tagline */}
        {showTagline && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.25rem',
              fontSize: isLarge ? '0.72rem' : '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: mutedText,
              textTransform: 'uppercase',
            }}
          >
            <span style={{ width: '16px', height: '1px', backgroundColor: hairline }} />
            <span>{taglineText}</span>
            <span style={{ width: '16px', height: '1px', backgroundColor: hairline }} />
          </div>
        )}
      </div>
    );
  }

  // STANDALONE MARK / ICON
  if (variant === 'mark' || variant === 'icon') {
    return renderEmblem(isCompact ? 28 : isLarge ? 52 : 38);
  }

  // DEFAULT / NAVBAR HORIZONTAL LOCKUP
  // (Seamlessly accommodates both default, navbar, and legacy 'khaadi' variants)
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isCompact ? '0.65rem' : '0.85rem',
        userSelect: 'none',
        textDecoration: 'none',
      }}
    >
      {/* 1. Artisan Heritage Emblem */}
      {renderEmblem(isCompact ? 32 : 38)}

      {/* 2. Brand Identity Lockup */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          lineHeight: 1,
        }}
      >
        {/* Top Row: KHAAM POSHAK + Urdu Script */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem' }}>
          <span
            style={{
              fontFamily: "'Cinzel', 'Playfair Display', 'Plus Jakarta Sans', serif",
              fontSize: isCompact ? '1.05rem' : '1.25rem',
              fontWeight: 800,
              letterSpacing: '0.18em',
              color: primaryText,
              textTransform: 'uppercase',
              lineHeight: 1,
            }}
          >
            KHAAM
          </span>
          <span
            style={{
              fontFamily: "'Cinzel', 'Playfair Display', 'Plus Jakarta Sans', serif",
              fontSize: isCompact ? '1.05rem' : '1.25rem',
              fontWeight: 800,
              letterSpacing: '0.18em',
              color: accentColor,
              textTransform: 'uppercase',
              lineHeight: 1,
            }}
          >
            POSHAK
          </span>

          {/* Urdu Nastaliq Wordmark Pill */}
          <span
            style={{
              fontFamily: "'Noto Nastaliq Urdu', 'Urdu Typesetting', serif",
              fontSize: isCompact ? '0.78rem' : '0.86rem',
              fontWeight: 700,
              color: isDark ? '#F5F5F5' : '#444444',
              marginRight: '0.15rem',
              lineHeight: 1,
              direction: 'rtl',
              display: 'inline-block',
            }}
            title="خام پوشاک - خالص دستکاری"
          >
            خام پوشاک
          </span>
        </div>

        {/* Bottom Row: Micro Handmade Heritage Tagline */}
        {showTagline && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              marginTop: '0.28rem',
              fontSize: isCompact ? '0.52rem' : '0.58rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: mutedText,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: accentColor,
                flexShrink: 0,
              }}
            />
            <span>{taglineText}</span>
          </div>
        )}
      </div>
    </div>
  );
}

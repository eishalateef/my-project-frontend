/**
 * FlexiStore Pro - Central Store Configurations
 * The Single Source of Truth for Store Niche Switching, Dynamic Filters, and Layout Directives.
 */

export const STORE_TYPES = {
  CLOTHING: 'clothing',
  JEWELRY: 'jewelry',
  GENERAL: 'general',
};

export const STORE_CONFIGS = {
  clothing: {
    key: 'clothing',
    title: 'KHAAM POSHAK',
    urduTitle: 'خام پوشاک',
    tagline: 'Handmade Designs & Heirloom Luxury Prêt',
    themeClass: 'theme-clothing',
    currency: 'PKR',
    currencySymbol: 'Rs. ',
    vibe: 'KHAAM POSHAK artisanal Pakistani luxury atelier, burnt orange, warm antique ivory, deep obsidian black, 100% handmade craftsmanship.',
    hero: {
      headline: 'Handmade Designs. Heirloom Craftsmanship.',
      subheadline: 'Pure handloom cotton, hand-spun raw silk, artisanal Multani chikankari, and intricate zardozi hand-embroidery made by master artisans across Pakistan.',
      ctaText: 'Explore Handmade Collection',
      badge: '100% HANDMADE DESIGNS • HEIRLOOM ATELIER',
      secondaryAction: 'Pakistani Size & Fit Guide',
    },
    // Dynamic Filter Definitions
    filters: [
      {
        key: 'size',
        label: 'Size / Stitching',
        type: 'buttons',
        options: ['XS', 'S', 'M', 'L', 'XL', 'Unstitched'],
      },
      {
        key: 'color',
        label: 'Color Palette',
        type: 'select',
      },
    ],
    // Store-Specific Features & Directives
    features: {
      hasSizeChart: true,
      hasLuxuryCertificate: false,
      hasFlashDeals: false,
      hasMultiCategoryIcons: false,
      showGridDensity: 'spacious', // Khaadi big visual imagery
      cardAspect: 'tall', // 3:4 aspect ratio
    },
    sizeChartData: {
      title: 'Hand-Embroidered Stitched Dress & Pishwas Measurement Guide',
      columns: ['Size', 'Chest (in)', 'Shoulder (in)', 'Dress Length (in)', 'Sleeve (in)', 'Flare / Ghera (in)', 'Trouser Length (in)'],
      rows: [
        ['XS', '36"', '14.5"', '48"', '21.0"', '110"', '37"'],
        ['S', '38"', '15.0"', '49"', '21.5"', '115"', '38"'],
        ['M', '40"', '15.5"', '50"', '22.0"', '120"', '39"'],
        ['L', '43"', '16.0"', '50"', '22.5"', '125"', '40"'],
        ['XL', '46"', '16.5"', '51"', '23.0"', '130"', '40"'],
      ],
    },
  },

  jewelry: {
    key: 'jewelry',
    title: 'Jewelry Store',
    tagline: 'Certified Pure Gold & Gemstone Masterpieces',
    themeClass: 'theme-jewelry',
    currency: 'PKR',
    currencySymbol: 'Rs. ',
    vibe: 'Luxury, black and gold, elegant, premium shadows.',
    hero: {
      headline: 'AURA ROYALE // HIGH JEWELRY ATELIER',
      subheadline: 'Handcrafted 18K & 24K solid gold creations set with certified GIA solitaire diamonds.',
      ctaText: 'EXPLORE BESPOKE CREATIONS',
      badge: 'GIA & IGI CERTIFIED',
      secondaryAction: 'PURITY GUARANTEE',
    },
    // Dynamic Filter Definitions
    filters: [
      {
        key: 'material',
        label: 'Precious Metal',
        type: 'checkboxes',
      },
      {
        key: 'purity',
        label: 'Gold Karat / Purity',
        type: 'buttons',
      },
      {
        key: 'gemstone',
        label: 'Precious Gemstones',
        type: 'checkboxes',
      },
      {
        key: 'weight',
        label: 'Weight (Grams)',
        type: 'select',
      },
    ],
    // Store-Specific Features & Directives
    features: {
      hasSizeChart: false,
      hasLuxuryCertificate: true,
      hasFlashDeals: false,
      hasMultiCategoryIcons: false,
      showGridDensity: 'luxury',
      cardAspect: 'square',
    },
    authenticityGuarantee: {
      title: 'Imperial Certificate of Authenticity',
      points: [
        'Hallmarked 18K (750) & 24K (999) Pure Gold Inspected by Dubai Central Laboratories',
        'Ethically Sourced Conflict-Free Natural Diamonds with Individual GIA Serial Laser Engravings',
        'Complimentary Lifetime Cleaning, Inspection & Ultrasonic Polish via Dedicated Online Concierge',
        'Tamper-Proof Holographic Security Seal with Every Delivery',
      ],
    },
  },

  general: {
    key: 'general',
    title: 'General Store - Daraz Marketplace',
    tagline: 'Biggest Online Deals & 24H Express Delivery',
    themeClass: 'theme-general',
    currency: 'PKR',
    currencySymbol: 'Rs. ',
    vibe: 'Marketplace, Daraz/Amazon.ae style, deals, categories grid.',
    hero: {
      headline: 'MEGA SALE 11.11 // NATIONWIDE DEALS',
      subheadline: 'Up to 70% Off on Consumer Electronics, Smart Living & Everyday Essentials.',
      ctaText: 'SHOP FLASH DEALS',
      badge: 'DARAZ MALL 100% AUTHENTIC',
      secondaryAction: 'COLLECT VOUCHER',
    },
    // Dynamic Filter Definitions
    filters: [
      {
        key: 'brand',
        label: 'Brand',
        type: 'checkboxes',
      },
      {
        key: 'warranty',
        label: 'Warranty Type',
        type: 'checkboxes',
      },
      {
        key: 'delivery',
        label: 'Delivery Option',
        type: 'buttons',
      },
    ],
    // Store-Specific Features & Directives
    features: {
      hasSizeChart: false,
      hasLuxuryCertificate: false,
      hasFlashDeals: true,
      hasMultiCategoryIcons: true,
      showGridDensity: 'compact', // Daraz high-density
      cardAspect: 'compact',
    },
    marketplaceBadges: [
      { label: 'DarazMall Official', icon: 'shield' },
      { label: '14-Day Free Returns', icon: 'rotate-ccw' },
      { label: '24-Hour Dispatch', icon: 'truck' },
      { label: 'Cash on Delivery', icon: 'banknote' },
    ],
  },
};

/**
 * Switch Theme dynamically in 1 millisecond by changing body class
 */
export function applyThemeClass(storeType) {
  const config = STORE_CONFIGS[storeType] || STORE_CONFIGS.clothing;
  document.body.className = config.themeClass;
  return config;
}

/**
 * Format Currency according to Store Rules (PKR Standard)
 */
export function formatPrice(amount, storeType = 'clothing', customSymbol = null) {
  const symbol = customSymbol || 'Rs. ';
  const num = Math.round(Number(amount || 0));
  return `${symbol}${num.toLocaleString('en-PK')}`;
}

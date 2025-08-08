// ===== CONFIGURATION AND DATA =====

// ===== PRICE CONFIGURATION =====
const PRICING_CONFIG = {
  originalPrice: 69.99,      // Main price control
  discountPercent: 12.5,     // Discount percentage  
  currency: '$'              // Currency symbol
};

// Auto calculate discount price
PRICING_CONFIG.discountPrice = PRICING_CONFIG.originalPrice * (1 - PRICING_CONFIG.discountPercent / 100);
PRICING_CONFIG.savedAmount = PRICING_CONFIG.originalPrice - PRICING_CONFIG.discountPrice;

// ===== STATS DATA =====
const STATS_DATA = {
  winRate: "87.9%",
  winRateNumber: "87.9%",
  globalUsers: "8,562",
  totalSignals: "12.263",
  userRating: "4.9/5",
  satisfiedUsers: "95%",
  price: `${PRICING_CONFIG.currency}${PRICING_CONFIG.originalPrice.toFixed(2)}`
};

// ===== REFERRAL CONFIGURATION =====
const REFERRAL_CONFIG = {
  validKolCodes: [
    '03451Lux', '02847Lux', '05632Lux', 
    '01258Lux', '09874Lux', '04569Lux',
    'KOL001Lux', 'KOL002Lux', 'KOL003Lux'
  ],
  telegramAdmin: 'luxquantadmin',
  accessCodeLength: 8
};

// ===== CAROUSEL CONFIGURATION =====
const CAROUSEL_CONFIG = {
  totalSlides: 5,
  autoSlideInterval: 5000, // 5 seconds
  swipeThreshold: 50,
  transitionDelay: 150
};

// ===== GENERAL CONFIGURATION =====
const SITE_CONFIG = {
  siteName: 'LuxQuant VIP',
  description: 'Premium AI-Powered Crypto Trading Signals',
  socialMedia: {
    instagram: 'https://instagram.com/luxquanttrade',
    tiktok: 'https://tiktok.com/@luxquant.trade',
    twitter: 'https://x.com/luxquanttrade'
  }
};

// ===== UTILITY FUNCTIONS =====
const Utils = {
  // Generate random string for access codes
  generateRandomString: (length) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Format price with currency
  formatPrice: (price) => {
    return `${PRICING_CONFIG.currency}${price.toFixed(2)}`;
  },

  // Encode message for Telegram URL
  encodeForTelegram: (message) => {
    return encodeURIComponent(message);
  },

  // Copy to clipboard with fallback
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  }
};

// ===== EXPORT FOR MODULE USAGE =====
window.LuxQuantConfig = {
  PRICING_CONFIG,
  STATS_DATA,
  REFERRAL_CONFIG,
  CAROUSEL_CONFIG,
  SITE_CONFIG,
  Utils
};
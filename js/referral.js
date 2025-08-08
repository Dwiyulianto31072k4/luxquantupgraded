// ===== REFERRAL SYSTEM MODULE =====

class ReferralSystem {
  constructor() {
    this.isValidReferral = false;
    this.generatedAccessCode = '';
    this.init();
  }

  init() {
    this.bindElements();
    this.attachEventListeners();
    this.initializeButtonState();
  }

  bindElements() {
    this.elements = {
      referralInput: document.getElementById('referralCode'),
      verifyBtn: document.getElementById('verifyBtn'),
      referralStatus: document.getElementById('referralStatus'),
      generatedCodeSection: document.getElementById('generatedCode'),
      accessCodeDisplay: document.getElementById('accessCodeDisplay'),
      copyBtn: document.getElementById('copyBtn'),
      accessBtn: document.getElementById('accessBtn'),
      priceAmount: document.getElementById('priceAmount'),
      discountInfo: document.getElementById('discountInfo'),
      originalPriceSpan: document.getElementById('originalPrice'),
      btnText: document.getElementById('btnText')
    };
  }

  attachEventListeners() {
    // Verify button click
    if (this.elements.verifyBtn) {
      this.elements.verifyBtn.addEventListener('click', () => this.verifyReferralCode());
    }

    // Copy button click
    if (this.elements.copyBtn) {
      this.elements.copyBtn.addEventListener('click', () => this.copyToClipboard());
    }

    // Access button click
    if (this.elements.accessBtn) {
      this.elements.accessBtn.addEventListener('click', () => this.handleAccess());
    }

    // Enter key to verify
    if (this.elements.referralInput) {
      this.elements.referralInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.verifyReferralCode();
        }
      });

      // Real-time input validation
      this.elements.referralInput.addEventListener('input', () => {
        this.validateInputRealtime();
      });
    }
  }

  validateInputRealtime() {
    if (this.elements.referralInput.disabled) return;
    
    const value = this.elements.referralInput.value.trim();
    const { validKolCodes } = window.LuxQuantConfig.REFERRAL_CONFIG;
    
    if (value && validKolCodes.includes(value)) {
      this.elements.referralInput.style.borderColor = '#10b981';
    } else if (value) {
      this.elements.referralInput.style.borderColor = '#ef4444';
    } else {
      this.elements.referralInput.style.borderColor = '#000';
    }
  }

  verifyReferralCode() {
    const enteredCode = this.elements.referralInput.value.trim();
    const { validKolCodes } = window.LuxQuantConfig.REFERRAL_CONFIG;
    const { discountPercent } = window.LuxQuantConfig.PRICING_CONFIG;
    
    if (!enteredCode) {
      this.showStatus('Please enter a referral code to apply discount!', 'error');
      return;
    }

    if (validKolCodes.includes(enteredCode)) {
      // Generate access code with KOL prefix
      const randomSuffix = window.LuxQuantConfig.Utils.generateRandomString(
        window.LuxQuantConfig.REFERRAL_CONFIG.accessCodeLength
      );
      this.generatedAccessCode = `${enteredCode}-${randomSuffix}`;
      
      this.showStatus(`🎉 Valid KOL code! ${discountPercent}% discount applied successfully.`, 'success');
      this.showGeneratedCode(this.generatedAccessCode);
      this.showDiscountPrice();
      this.updateButtonText();
      this.isValidReferral = true;
      
      // Disable input and button after successful application
      this.elements.referralInput.disabled = true;
      this.elements.verifyBtn.disabled = true;
      this.elements.verifyBtn.textContent = 'Applied ✅';
    } else {
      this.showStatus('❌ Invalid referral code. You can still subscribe at regular price below.', 'error');
      this.hideGeneratedCode();
      this.hideDiscountPrice();
      this.isValidReferral = false;
    }
  }

  showStatus(message, type) {
    this.elements.referralStatus.textContent = message;
    this.elements.referralStatus.className = `referral-status ${type}`;
  }

  showGeneratedCode(code) {
    this.elements.accessCodeDisplay.textContent = code;
    this.elements.generatedCodeSection.classList.add('show');
  }

  hideGeneratedCode() {
    this.elements.generatedCodeSection.classList.remove('show');
  }

  showDiscountPrice() {
    const { discountPrice, discountPercent, originalPrice } = window.LuxQuantConfig.PRICING_CONFIG;
    
    this.elements.priceAmount.textContent = window.LuxQuantConfig.Utils.formatPrice(discountPrice);
    this.elements.originalPriceSpan.style.display = 'none';
    
    this.elements.discountInfo.innerHTML = `
      <div class="original-price">Regular: <span style="text-decoration: line-through;">${window.LuxQuantConfig.Utils.formatPrice(originalPrice)}</span></div>
      <div class="discount-price">KOL Discount: <span style="color: #4ade80; font-weight: 700;">${window.LuxQuantConfig.Utils.formatPrice(discountPrice)} (${discountPercent}% OFF)</span></div>
    `;
    this.elements.discountInfo.style.display = 'block';
  }

  hideDiscountPrice() {
    const { originalPrice } = window.LuxQuantConfig.PRICING_CONFIG;
    
    this.elements.priceAmount.textContent = window.LuxQuantConfig.Utils.formatPrice(originalPrice);
    this.elements.originalPriceSpan.style.display = 'block';
    this.elements.discountInfo.style.display = 'none';
    this.resetButtonText();
  }

  updateButtonText() {
    const { discountPrice } = window.LuxQuantConfig.PRICING_CONFIG;
    
    if (this.elements.btnText) {
      this.elements.btnText.textContent = `Get Discounted Access (${window.LuxQuantConfig.Utils.formatPrice(discountPrice)})`;
    }
  }

  resetButtonText() {
    if (this.elements.btnText) {
      this.elements.btnText.textContent = 'Get Lifetime Access';
    }
  }

  async copyToClipboard() {
    try {
      await window.LuxQuantConfig.Utils.copyToClipboard(this.generatedAccessCode);
      
      const originalText = this.elements.copyBtn.textContent;
      this.elements.copyBtn.textContent = 'Copied! ✅';
      this.elements.copyBtn.style.background = '#10b981';
      
      setTimeout(() => {
        this.elements.copyBtn.textContent = originalText;
        this.elements.copyBtn.style.background = '#ffd700';
      }, 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      this.elements.copyBtn.textContent = 'Copy Failed';
    }
  }

  handleAccess() {
    const { telegramAdmin } = window.LuxQuantConfig.REFERRAL_CONFIG;
    const { discountPrice, originalPrice, discountPercent } = window.LuxQuantConfig.PRICING_CONFIG;
    
    const telegramUrl = `https://t.me/${telegramAdmin}`;
    let message;
    
    if (this.isValidReferral && this.generatedAccessCode) {
      // User has valid referral - send discounted price message
      message = `Hi! I want to subscribe to LuxQuant VIP Lifetime Access with KOL discount.\n\n💰 Price: ${window.LuxQuantConfig.Utils.formatPrice(discountPrice)} (${discountPercent}% KOL Discount)\n🎯 Generated Access Code: ${this.generatedAccessCode}\n\nPlease process my subscription with the discounted price.`;
    } else {
      // Regular subscription without discount
      message = `Hi! I want to subscribe to LuxQuant VIP Lifetime Access.\n\n💰 Price: ${window.LuxQuantConfig.Utils.formatPrice(originalPrice)} (Regular Price)\n\nPlease process my subscription.`;
    }
    
    // Open Telegram with pre-filled message
    const fullUrl = `${telegramUrl}?text=${window.LuxQuantConfig.Utils.encodeForTelegram(message)}`;
    window.open(fullUrl, '_blank');
  }

  initializeButtonState() {
    // Button is always enabled for optional referral system
    if (this.elements.accessBtn) {
      this.elements.accessBtn.style.opacity = '1';
      this.elements.accessBtn.style.pointerEvents = 'auto';
    }
  }
}

// Initialize Referral System when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if referral elements exist
  if (document.getElementById('referralCode')) {
    window.referralSystem = new ReferralSystem();
  }
});
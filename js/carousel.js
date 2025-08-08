// ===== CAROUSEL MODULE =====

class ImageCarousel {
  constructor() {
    this.currentSlide = 0;
    this.totalSlides = window.LuxQuantConfig?.CAROUSEL_CONFIG?.totalSlides || 5;
    this.autoSlideInterval = null;
    this.intervalDuration = window.LuxQuantConfig?.CAROUSEL_CONFIG?.autoSlideInterval || 5000;
    this.swipeThreshold = window.LuxQuantConfig?.CAROUSEL_CONFIG?.swipeThreshold || 50;
    this.transitionDelay = window.LuxQuantConfig?.CAROUSEL_CONFIG?.transitionDelay || 150;
    
    // Touch/swipe variables
    this.startX = 0;
    this.endX = 0;
    this.startY = 0;
    this.endY = 0;
    
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.bindElements();
      this.attachEventListeners();
      this.setupTouchEvents();
      this.startAutoSlide();
      this.updateCarousel();
    });
  }

  bindElements() {
    this.elements = {
      carouselContainer: document.getElementById('carouselContainer'),
      dots: document.querySelectorAll('.dot'),
      prevBtn: document.getElementById('prevBtn'),
      nextBtn: document.getElementById('nextBtn'),
      loadingOverlay: document.getElementById('loadingOverlay'),
      phoneElement: document.querySelector('.showcase-phone')
    };
  }

  attachEventListeners() {
    // Navigation buttons
    if (this.elements.nextBtn) {
      this.elements.nextBtn.addEventListener('click', () => this.nextSlide());
    }
    
    if (this.elements.prevBtn) {
      this.elements.prevBtn.addEventListener('click', () => this.prevSlide());
    }

    // Dots navigation
    this.elements.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToSlide(index));
    });

    // Pause auto-slide on hover (desktop only)
    if (this.elements.phoneElement && window.innerWidth > 768) {
      this.elements.phoneElement.addEventListener('mouseenter', () => {
        this.pauseAutoSlide();
      });

      this.elements.phoneElement.addEventListener('mouseleave', () => {
        this.resumeAutoSlide();
      });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.nextSlide();
      }
    });

    // Pause on window blur/focus
    window.addEventListener('blur', () => this.pauseAutoSlide());
    window.addEventListener('focus', () => this.resumeAutoSlide());
  }

  setupTouchEvents() {
    if (!this.elements.carouselContainer) return;

    this.elements.carouselContainer.addEventListener('touchstart', (e) => {
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
      this.pauseAutoSlide();
    }, { passive: true });

    this.elements.carouselContainer.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });

    this.elements.carouselContainer.addEventListener('touchend', (e) => {
      this.endX = e.changedTouches[0].clientX;
      this.endY = e.changedTouches[0].clientY;
      this.handleSwipe();
      this.resumeAutoSlideDelayed();
    }, { passive: true });
  }

  handleSwipe() {
    const diffX = this.startX - this.endX;
    const diffY = Math.abs(this.startY - this.endY);
    
    // Only trigger swipe if horizontal movement is greater than vertical
    if (Math.abs(diffX) > this.swipeThreshold && diffY < 100) {
      if (diffX > 0) {
        this.nextSlide(); // Swipe left
      } else {
        this.prevSlide(); // Swipe right
      }
    }
  }

  showLoading() {
    if (this.elements.loadingOverlay) {
      this.elements.loadingOverlay.classList.add('show');
      setTimeout(() => {
        this.elements.loadingOverlay.classList.remove('show');
      }, 300);
    }
  }

  updateCarousel() {
    if (!this.elements.carouselContainer) return;

    const translateX = -this.currentSlide * 20; // 20% per slide
    this.elements.carouselContainer.style.transform = `translateX(${translateX}%)`;
    
    // Update dots
    this.elements.dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentSlide);
    });

    // Announce slide change for accessibility
    this.announceSlideChange();
  }

  nextSlide() {
    this.showLoading();
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    setTimeout(() => {
      this.updateCarousel();
    }, this.transitionDelay);
    this.pauseAutoSlide();
    this.resumeAutoSlideDelayed();
  }

  prevSlide() {
    this.showLoading();
    this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    setTimeout(() => {
      this.updateCarousel();
    }, this.transitionDelay);
    this.pauseAutoSlide();
    this.resumeAutoSlideDelayed();
  }

  goToSlide(slideIndex) {
    if (slideIndex !== this.currentSlide && slideIndex >= 0 && slideIndex < this.totalSlides) {
      this.showLoading();
      this.currentSlide = slideIndex;
      setTimeout(() => {
        this.updateCarousel();
      }, this.transitionDelay);
      this.pauseAutoSlide();
      this.resumeAutoSlideDelayed();
    }
  }

  startAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
    
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, this.intervalDuration);
  }

  pauseAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  resumeAutoSlide() {
    if (!this.autoSlideInterval) {
      this.startAutoSlide();
    }
  }

  resumeAutoSlideDelayed(delay = 3000) {
    setTimeout(() => {
      this.resumeAutoSlide();
    }, delay);
  }

  announceSlideChange() {
    // Create or update screen reader announcement
    let announcer = document.getElementById('carousel-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'carousel-announcer';
      announcer.className = 'sr-only';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      document.body.appendChild(announcer);
    }
    
    announcer.textContent = `Slide ${this.currentSlide + 1} of ${this.totalSlides}`;
  }

  // Public methods for external control
  getCurrentSlide() {
    return this.currentSlide;
  }

  getTotalSlides() {
    return this.totalSlides;
  }

  setAutoSlideInterval(interval) {
    this.intervalDuration = interval;
    if (this.autoSlideInterval) {
      this.pauseAutoSlide();
      this.resumeAutoSlide();
    }
  }

  destroy() {
    this.pauseAutoSlide();
    
    // Remove event listeners
    window.removeEventListener('blur', this.pauseAutoSlide);
    window.removeEventListener('focus', this.resumeAutoSlide);
    
    // Remove announcer
    const announcer = document.getElementById('carousel-announcer');
    if (announcer) {
      announcer.remove();
    }
  }
}

// ===== AUTO-INITIALIZE =====
window.addEventListener('DOMContentLoaded', () => {
  // Only initialize if carousel elements exist
  if (document.getElementById('carouselContainer')) {
    window.imageCarousel = new ImageCarousel();
  }
});

// ===== EXPORT FOR EXTERNAL ACCESS =====
window.ImageCarousel = ImageCarousel;
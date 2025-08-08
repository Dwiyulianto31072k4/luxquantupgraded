// ===== MAIN APPLICATION LOGIC =====

class LuxQuantApp {
  constructor() {
    this.isScrolled = false;
    this.isMenuOpen = false;
    this.mouseFollower = null;
    this.mouseDot = null;
    this.particlesCanvas = null;
    this.particles = [];
    this.animationId = null;
    
    this.init();
  }

  init() {
    this.updateStats();
    this.setupEventListeners();
    this.setupScrollEffects();
    this.setupNavigation();
    this.setupMouseEffects();
    this.setupParticles();
    this.setupPriceTicker();
    this.setupCookieConsent();
    this.setupBackToTop();
    this.setupNotifications();
    this.setupSmoothScrolling();
    this.setupIntersectionObserver();
  }

  // ===== STATS UPDATE =====
  updateStats() {
    document.addEventListener("DOMContentLoaded", () => {
      const { STATS_DATA } = window.LuxQuantConfig;
      
      // Update elements with data-stat attributes
      document.querySelectorAll("[data-stat]").forEach(el => {
        const key = el.dataset.stat;
        if (STATS_DATA[key] !== undefined) {
          el.textContent = STATS_DATA[key];
        }
      });
      
      // Animate counters
      this.animateCounters();
    });
  }

  animateCounters() {
    const counters = document.querySelectorAll('.stat-number, .cta-stat-number');
    
    counters.forEach(counter => {
      const target = counter.textContent;
      const numericValue = parseFloat(target.replace(/[^\d.]/g, ''));
      
      if (!isNaN(numericValue)) {
        this.animateCounter(counter, 0, numericValue, target);
      }
    });
  }

  animateCounter(element, start, end, originalText) {
    const duration = 2000; // 2 seconds
    const increment = (end - start) / (duration / 16); // 60fps
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      
      if (current >= end) {
        current = end;
        clearInterval(timer);
        element.textContent = originalText;
      } else {
        // Format the number appropriately
        if (originalText.includes('%')) {
          element.textContent = `${current.toFixed(1)}%`;
        } else if (originalText.includes(',')) {
          element.textContent = Math.floor(current).toLocaleString();
        } else {
          element.textContent = Math.floor(current);
        }
      }
    }, 16);
  }

  // ===== EVENT LISTENERS =====
  setupEventListeners() {
    // Window events
    window.addEventListener('scroll', () => this.handleScroll());
    window.addEventListener('resize', () => this.handleResize());
    window.addEventListener('load', () => this.handleLoad());
    
    // Loading complete event
    window.addEventListener('loadingComplete', () => {
      this.startAnimations();
    });
  }

  handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Header scroll effect
    const header = document.getElementById('header');
    if (header) {
      if (scrollTop > 50 && !this.isScrolled) {
        header.classList.add('scrolled');
        this.isScrolled = true;
      } else if (scrollTop <= 50 && this.isScrolled) {
        header.classList.remove('scrolled');
        this.isScrolled = false;
      }
    }
    
    // Back to top button
    this.updateBackToTop(scrollTop);
    
    // Parallax effects (desktop only)
    if (window.innerWidth > 768) {
      this.updateParallaxEffects(scrollTop);
    }
  }

  handleResize() {
    // Reinitialize particles on resize
    if (this.particlesCanvas && window.innerWidth > 768) {
      this.setupParticles();
    }
    
    // Close mobile menu on resize to desktop
    if (window.innerWidth > 768 && this.isMenuOpen) {
      this.closeMobileMenu();
    }
  }

  handleLoad() {
    // Trigger any post-load animations
    this.revealElements();
  }

  // ===== NAVIGATION =====
  setupNavigation() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuBtn && navLinks) {
      mobileMenuBtn.addEventListener('click', () => {
        this.toggleMobileMenu();
      });
    }
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          this.smoothScrollTo(targetElement);
          if (this.isMenuOpen) {
            this.closeMobileMenu();
          }
        }
      });
    });
  }

  toggleMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    this.isMenuOpen = !this.isMenuOpen;
    
    if (mobileMenuBtn) {
      mobileMenuBtn.classList.toggle('active', this.isMenuOpen);
    }
    
    if (navLinks) {
      navLinks.classList.toggle('active', this.isMenuOpen);
    }
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
  }

  closeMobileMenu() {
    this.isMenuOpen = false;
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuBtn) {
      mobileMenuBtn.classList.remove('active');
    }
    
    if (navLinks) {
      navLinks.classList.remove('active');
    }
    
    document.body.style.overflow = '';
  }

  // ===== MOUSE EFFECTS (DESKTOP ONLY) =====
  setupMouseEffects() {
    if (window.innerWidth <= 768) return;
    
    this.mouseFollower = document.querySelector('.mouse-follower');
    this.mouseDot = document.querySelector('.mouse-dot');
    
    if (this.mouseFollower && this.mouseDot) {
      document.addEventListener('mousemove', (e) => {
        this.updateMousePosition(e.clientX, e.clientY);
      });
      
      // Interactive elements hover effect
      document.querySelectorAll('a, button, .btn').forEach(el => {
        el.addEventListener('mouseenter', () => {
          this.mouseFollower.classList.add('active');
          this.mouseDot.classList.add('active');
        });
        
        el.addEventListener('mouseleave', () => {
          this.mouseFollower.classList.remove('active');
          this.mouseDot.classList.remove('active');
        });
      });
    }
  }

  updateMousePosition(x, y) {
    if (this.mouseFollower) {
      this.mouseFollower.style.left = x + 'px';
      this.mouseFollower.style.top = y + 'px';
    }
    
    if (this.mouseDot) {
      this.mouseDot.style.left = x + 'px';
      this.mouseDot.style.top = y + 'px';
    }
  }

  // ===== PARTICLES SYSTEM =====
  setupParticles() {
    if (window.innerWidth <= 768) return;
    
    this.particlesCanvas = document.getElementById('particles-canvas');
    if (!this.particlesCanvas) return;
    
    const ctx = this.particlesCanvas.getContext('2d');
    this.particlesCanvas.width = window.innerWidth;
    this.particlesCanvas.height = window.innerHeight;
    
    // Initialize particles
    this.particles = [];
    const particleCount = Math.min(50, Math.floor(window.innerWidth / 20));
    
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.particlesCanvas.width,
        y: Math.random() * this.particlesCanvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.3 + 0.1
      });
    }
    
    this.animateParticles(ctx);
  }

  animateParticles(ctx) {
    ctx.clearRect(0, 0, this.particlesCanvas.width, this.particlesCanvas.height);
    
    this.particles.forEach(particle => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Wrap around edges
      if (particle.x < 0) particle.x = this.particlesCanvas.width;
      if (particle.x > this.particlesCanvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.particlesCanvas.height;
      if (particle.y > this.particlesCanvas.height) particle.y = 0;
      
      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 215, 0, ${particle.opacity})`;
      ctx.fill();
    });
    
    this.animationId = requestAnimationFrame(() => this.animateParticles(ctx));
  }

  // ===== PRICE TICKER =====
  setupPriceTicker() {
    const ticker = document.getElementById('priceTicker');
    if (!ticker) return;
    
    // Mock crypto data
    const cryptoData = [
      { symbol: 'BTC', price: '$67,234.56', change: '+2.34%', direction: 'up' },
      { symbol: 'ETH', price: '$3,456.78', change: '+1.23%', direction: 'up' },
      { symbol: 'BNB', price: '$567.89', change: '-0.56%', direction: 'down' },
      { symbol: 'SOL', price: '$234.56', change: '+5.67%', direction: 'up' },
      { symbol: 'ADA', price: '$1.23', change: '+0.89%', direction: 'up' },
      { symbol: 'DOT', price: '$12.34', change: '-1.23%', direction: 'down' },
      { symbol: 'AVAX', price: '$45.67', change: '+2.34%', direction: 'up' }
    ];
    
    const tickerContent = ticker.querySelector('.ticker-content');
    if (tickerContent) {
      tickerContent.innerHTML = cryptoData.map(crypto => `
        <div class="ticker-item">
          <span class="crypto-symbol">${crypto.symbol}</span>
          <span class="crypto-price">${crypto.price}</span>
          <span class="crypto-change ${crypto.direction}">${crypto.change}</span>
        </div>
      `).join('').repeat(3); // Repeat for continuous scroll
    }
  }

  // ===== SCROLL EFFECTS =====
  setupScrollEffects() {
    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
      if (window.innerWidth > 768) {
        const scrolled = window.pageYOffset;
        const heroGlow = document.querySelector('.hero-glow');
        
        if (heroGlow) {
          heroGlow.style.transform = `translateX(-50%) translateY(${scrolled * 0.5}px)`;
        }
      }
    });
  }

  updateParallaxEffects(scrollTop) {
    // Additional parallax effects for various elements
    const elements = document.querySelectorAll('[data-parallax]');
    
    elements.forEach(el => {
      const speed = el.dataset.parallax || 0.5;
      const yPos = -(scrollTop * speed);
      el.style.transform = `translateY(${yPos}px)`;
    });
  }

  // ===== SMOOTH SCROLLING =====
  setupSmoothScrolling() {
    // Enhanced smooth scrolling
    this.smoothScrollTo = (target) => {
      const targetPosition = target.offsetTop - 80; // Account for fixed header
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 800;
      let start = null;
      
      const animation = (currentTime) => {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        
        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      };
      
      requestAnimationFrame(animation);
    };
  }

  easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }

  // ===== INTERSECTION OBSERVER =====
  setupIntersectionObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          
          // Trigger counter animations when stats section is visible
          if (entry.target.classList.contains('live-stats') || 
              entry.target.classList.contains('testimonial-stats')) {
            this.animateCounters();
          }
        }
      });
    }, observerOptions);
    
    // Observe sections for animations
    document.querySelectorAll('section, .feature-card, .testimonial-card, .stat-card').forEach(el => {
      observer.observe(el);
    });
  }

  // ===== BACK TO TOP =====
  setupBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;
    
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  updateBackToTop(scrollTop) {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;
    
    if (scrollTop > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }

  // ===== COOKIE CONSENT =====
  setupCookieConsent() {
    const cookieConsent = document.getElementById('cookieConsent');
    const acceptBtn = document.getElementById('acceptCookies');
    const declineBtn = document.getElementById('declineCookies');
    
    // Check if user has already made a choice
    const cookieChoice = localStorage.getItem('cookieConsent');
    
    if (!cookieChoice && cookieConsent) {
      setTimeout(() => {
        cookieConsent.style.display = 'block';
      }, 2000);
    }
    
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        cookieConsent.style.display = 'none';
        this.showNotification('Cookies accepted. Thank you!', 'success');
      });
    }
    
    if (declineBtn) {
      declineBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'declined');
        cookieConsent.style.display = 'none';
        this.showNotification('Cookies declined.', 'warning');
      });
    }
  }

  // ===== NOTIFICATIONS =====
  setupNotifications() {
    this.notificationContainer = document.getElementById('notificationContainer');
  }

  showNotification(message, type = 'info', duration = 4000) {
    if (!this.notificationContainer) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button class="notification-close">&times;</button>
    `;
    
    this.notificationContainer.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      this.removeNotification(notification);
    });
    
    // Auto remove after duration
    setTimeout(() => {
      this.removeNotification(notification);
    }, duration);
  }

  removeNotification(notification) {
    if (notification && notification.parentNode) {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }

  // ===== ANIMATIONS =====
  startAnimations() {
    // Start all animations after loading is complete
    this.revealElements();
    
    // Show social proof notifications occasionally
    this.startSocialProofNotifications();
  }

  revealElements() {
    const elements = document.querySelectorAll('.hero-content, .section-header, .feature-card');
    
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('fade-in');
      }, index * 100);
    });
  }

  startSocialProofNotifications() {
    const notifications = [
      '🎉 Someone from Singapore just subscribed!',
      '💰 New member earned 15% today!',
      '🚀 Active traders: 1,247 online now',
      '⭐ Recent review: "Best signals ever!" - John M.',
      '📈 87.9% win rate maintained this month!'
    ];
    
    let index = 0;
    
    const showRandomNotification = () => {
      if (Math.random() > 0.7) { // 30% chance
        this.showNotification(notifications[index], 'success', 3000);
        index = (index + 1) % notifications.length;
      }
    };
    
    // Show first notification after 30 seconds
    setTimeout(() => {
      showRandomNotification();
      
      // Then show randomly every 45-90 seconds
      setInterval(() => {
        showRandomNotification();
      }, Math.random() * 45000 + 45000);
    }, 30000);
  }

  // ===== CLEANUP =====
  destroy() {
    // Cancel animation frame
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    // Remove event listeners
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('load', this.handleLoad);
    
    // Reset body overflow
    document.body.style.overflow = '';
  }
}

// ===== INITIALIZE APPLICATION =====
window.addEventListener('DOMContentLoaded', () => {
  window.luxQuantApp = new LuxQuantApp();
});

// ===== GLOBAL ERROR HANDLING =====
window.addEventListener('error', (e) => {
  console.warn('LuxQuant App Error:', e.error);
  
  // Show user-friendly error message for critical failures
  if (e.error.message.includes('Failed to fetch') || e.error.message.includes('NetworkError')) {
    if (window.luxQuantApp && window.luxQuantApp.showNotification) {
      window.luxQuantApp.showNotification('Connection issue detected. Please check your internet connection.', 'error');
    }
  }
});

// ===== PERFORMANCE MONITORING =====
window.addEventListener('load', () => {
  // Simple performance logging
  if (window.performance && window.performance.timing) {
    const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
    console.log(`Page loaded in ${loadTime}ms`);
    
    if (loadTime > 3000) {
      console.warn('Slow page load detected');
    }
  }
});
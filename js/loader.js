// ===== LOADING SCREEN MODULE =====

class LoadingScreen {
  constructor() {
    this.loader = document.getElementById("loader");
    this.progressBar = document.getElementById("loaderProgressBar");
    this.percentage = document.getElementById("loaderPercentage");
    this.progress = 0;
    this.increment = 20;
    this.updateInterval = null;
    
    this.init();
  }

  init() {
    document.addEventListener("DOMContentLoaded", () => {
      this.startLoading();
    });
  }

  startLoading() {
    if (!this.loader || !this.progressBar || !this.percentage) {
      console.warn('Loading elements not found');
      return;
    }

    this.updateInterval = setInterval(() => {
      this.updateProgress();
    }, 100);
  }

  updateProgress() {
    // Add random increment for more natural feel
    this.progress += this.increment + Math.random() * 15;
    
    // Cap at 100%
    if (this.progress > 100) {
      this.progress = 100;
    }

    // Update UI elements
    if (this.progressBar) {
      this.progressBar.style.width = `${this.progress}%`;
    }
    
    if (this.percentage) {
      this.percentage.textContent = `${Math.round(this.progress)}%`;
    }

    // Complete loading when 100%
    if (this.progress === 100) {
      this.completeLoading();
    }
  }

  completeLoading() {
    clearInterval(this.updateInterval);
    
    setTimeout(() => {
      this.hideLoader();
    }, 300);
  }

  hideLoader() {
    if (this.loader) {
      this.loader.classList.add("hidden");
      document.body.classList.remove("loading");
      
      // Dispatch custom event for other modules
      window.dispatchEvent(new CustomEvent('loadingComplete'));
    }
  }

  // Public method to force complete loading
  forceComplete() {
    this.progress = 100;
    this.updateProgress();
  }

  // Public method to set specific progress
  setProgress(value) {
    if (value >= 0 && value <= 100) {
      this.progress = value;
      this.updateProgress();
    }
  }
}

// ===== AUTO-INITIALIZE =====
window.loadingScreen = new LoadingScreen();

// ===== FALLBACK COMPLETION =====
// Ensure loading completes even if something goes wrong
setTimeout(() => {
  if (window.loadingScreen && window.loadingScreen.progress < 100) {
    console.log('Loading fallback triggered');
    window.loadingScreen.forceComplete();
  }
}, 5000); // 5 second fallback
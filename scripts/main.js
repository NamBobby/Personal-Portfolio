
// === Portfolio Application ===
class PortfolioApp {
  constructor() {
    this.componentLoader = null;
    this.portfolioBook = null;
    this.scrollManager = null;
    this.isInitialized = false;
    this.config = {
      enableAnalytics: false,
      enableServiceWorker: false,
      debugMode: window.location.hostname === 'localhost',
      loadingTimeout: 30000
    };

    this.init();
  }

  async init() {
    try {
      console.log('🚀 Initializing Portfolio App...');
      this.showGlobalLoader();
      await this.initializeCore();
      await this.loadComponents();
      this.initializeScrollManager();
      await this.initializePortfolio();
      this.setupAdditionalFeatures();

      setTimeout(() => {
        this.hideGlobalLoader();
        this.isInitialized = true;
        console.log('✅ Portfolio App initialized successfully!');
        document.dispatchEvent(new CustomEvent('portfolioReady'));
      }, 1000);
    } catch (error) {
      console.error('❌ Failed to initialize Portfolio App:', error);
      this.handleInitializationError(error);
    }
  }

  async initializeCore() {
    this.componentLoader = new ComponentLoader();
    this.setupErrorHandling();
    if (this.config.debugMode) {
      this.setupPerformanceMonitoring();
    }
    console.log('Core components initialized');
  }

  async loadComponents() {
    console.log('Loading portfolio components...');
    const loadTimeout = setTimeout(() => {
      throw new Error('Component loading timeout');
    }, this.config.loadingTimeout);

    try {
      const success = await this.componentLoader.loadAllComponents();
      clearTimeout(loadTimeout);
      if (!success) throw new Error('Failed to load some components');
      console.log('All components loaded successfully');
    } catch (error) {
      clearTimeout(loadTimeout);
      throw error;
    }
  }

  initializeScrollManager() {
    if (typeof ScrollManager !== 'undefined') {
      this.scrollManager = new ScrollManager();
      console.log('✅ ScrollManager initialized');
    } else {
      console.warn('⚠️ ScrollManager class not found, using fallback');
      this.createBasicScrollManager();
    }
  }

  createBasicScrollManager() {
    this.scrollManager = {
      scrollToSection: (sectionId, position = 'top') => {
        const section = document.getElementById(sectionId);
        if (!section) return;
        let scrollTarget = 0;
        switch (position) {
          case 'top': scrollTarget = 0; break;
          case 'bottom': scrollTarget = section.scrollHeight; break;
          case 'center': scrollTarget = (section.scrollHeight - section.clientHeight) / 2; break;
          default: scrollTarget = position;
        }
        section.scrollTo({ top: scrollTarget, behavior: 'smooth' });
      },
      resetScrollPosition: (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) section.scrollTop = 0;
      }
    };
  }

  async initializePortfolio() {
    await new Promise(resolve => setTimeout(resolve, 100));
    if (typeof PortfolioBook === 'undefined') throw new Error('PortfolioBook class not found');
    this.portfolioBook = new PortfolioBook();
    this.integrateScrollManager();

    if (this.config.debugMode) {
      window.portfolio = this.portfolioBook;
      window.portfolioApp = this;
      window.scrollManager = this.scrollManager;
    }

    console.log('Portfolio Book initialized');
  }

  integrateScrollManager() {
    if (!this.scrollManager || !this.portfolioBook) return;

    document.addEventListener('page:changed', (e) => {
      const { leftSection, rightSection } = e.detail;
      setTimeout(() => {
        this.scrollManager.resetScrollPosition(leftSection);
        this.scrollManager.resetScrollPosition(rightSection);
      }, 100);
    });

    this.portfolioBook.scrollToTop = (sectionId) => {
      this.scrollManager.scrollToSection(sectionId, 'top');
    };

    this.portfolioBook.scrollToBottom = (sectionId) => {
      this.scrollManager.scrollToSection(sectionId, 'bottom');
    };

    console.log('✅ ScrollManager integrated with PortfolioBook');
  }

  setupAdditionalFeatures() {
    if (this.config.enableServiceWorker && 'serviceWorker' in navigator) {
      this.registerServiceWorker();
    }
    if (this.config.enableAnalytics) {
      this.setupAnalytics();
    }
  }

  setupErrorHandling() {
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
    });
  }

  setupPerformanceMonitoring() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          console.log('Performance Metrics:', {
            loadTime: perfData.loadEventEnd - perfData.fetchStart,
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart
          });
        }, 0);
      });
    }
  }

  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.warn('Service Worker registration failed:', error);
    }
  }

  setupAnalytics() {
    console.log('Analytics setup (placeholder)');
  }

  showGlobalLoader() {
    const loaderHTML = `
      <div id="global-loader" class="global-loader">
        <div class="loader-content">
          <div class="loader-spinner"></div>
          <h2>Loading Portfolio...</h2>
          <p>Preparing your experience</p>
          <div class="loader-progress">
            <div class="progress-bar" id="loader-progress-bar"></div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', loaderHTML);
    this.animateProgressBar();
  }

  animateProgressBar() {
    const progressBar = document.getElementById('loader-progress-bar');
    if (progressBar) {
      let width = 0;
      const interval = setInterval(() => {
        width += Math.random() * 15;
        if (width >= 90) {
          width = 90;
          clearInterval(interval);
        }
        progressBar.style.width = width + '%';
      }, 100);
    }
  }

  hideGlobalLoader() {
    const loader = document.getElementById('global-loader');
    if (loader) {
      const progressBar = document.getElementById('loader-progress-bar');
      if (progressBar) progressBar.style.width = '100%';
      setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.5s ease';
        setTimeout(() => loader.remove(), 500);
      }, 200);
    }
  }
}

// === Init App ===
document.addEventListener('DOMContentLoaded', () => {
  window.portfolioApp = new PortfolioApp();

  document.querySelectorAll('.inspect-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const skills = e.currentTarget.dataset.skills;
      if (skills) {
        console.log('[Inspect] Saving filteredSkills:', skills);
        localStorage.setItem('filteredSkills', skills);
        window.portfolioApp?.portfolioBook?.goToSection('section-skills');
      }
    });
  });

  const skillsOnly = document.querySelector('#section-skills') && !window.portfolioApp?.portfolioBook;
  if (skillsOnly) {
    const storedSkills = localStorage.getItem('filteredSkills');
    if (storedSkills) {
      const filterList = storedSkills.split(',').map(s => s.trim().toLowerCase());
      document.querySelectorAll('.skill-tag').forEach(tag => {
        const skillKey = tag.dataset.skill?.trim().toLowerCase();
        tag.style.display = filterList.includes(skillKey) ? 'inline-flex' : 'none';
      });
      localStorage.removeItem('filteredSkills');
    }
  }
});

document.addEventListener('page:changed', (e) => {
  const storedSkills = localStorage.getItem('filteredSkills');
  if (storedSkills && e.detail.rightSection === 'section-skills') {
    const filterList = storedSkills.split(',').map(s => s.trim().toLowerCase());
    document.querySelectorAll('.skill-tag').forEach(tag => {
      const skillKey = tag.dataset.skill?.trim().toLowerCase();
      tag.style.display = filterList.includes(skillKey) ? 'inline-flex' : 'none';
    });
    localStorage.removeItem('filteredSkills');
  }
});

document.getElementById('reset-skills-btn')?.addEventListener('click', () => {
  document.querySelectorAll('.skill-tag').forEach(tag => {
    tag.style.display = 'inline-flex';
  });
});

// Main Application Entry Point - Updated with ScrollManager
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
            loadingTimeout: 30000 // 30 seconds
        };
        
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing Portfolio App...');
            
            // Show loading screen
            this.showGlobalLoader();
            
            // Initialize core components
            await this.initializeCore();
            
            // Load all components
            await this.loadComponents();
            
            // Initialize scroll manager
            this.initializeScrollManager();
            
            // Initialize portfolio book
            await this.initializePortfolio();
            
            // Setup additional features
            this.setupAdditionalFeatures();
            
            // Hide loading screen
            setTimeout(() => {
                this.hideGlobalLoader();
                this.isInitialized = true;
                console.log('✅ Portfolio App initialized successfully!');
                
                // Emit ready event
                document.dispatchEvent(new CustomEvent('portfolioReady'));
            }, 1000);
            
        } catch (error) {
            console.error('❌ Failed to initialize Portfolio App:', error);
            this.handleInitializationError(error);
        }
    }

    async initializeCore() {
        // Initialize component loader
        this.componentLoader = new ComponentLoader();
        
        // Setup global error handling
        this.setupErrorHandling();
        
        // Setup performance monitoring
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
            
            if (!success) {
                throw new Error('Failed to load some components');
            }
            
            console.log('All components loaded successfully');
        } catch (error) {
            clearTimeout(loadTimeout);
            throw error;
        }
    }

    // FIXED: Initialize ScrollManager after components are loaded
    initializeScrollManager() {
        if (typeof ScrollManager !== 'undefined') {
            this.scrollManager = new ScrollManager();
            console.log('✅ ScrollManager initialized');
        } else {
            console.warn('⚠️ ScrollManager class not found, loading separately...');
            // Fallback: create a basic scroll manager
            this.createBasicScrollManager();
        }
    }

    // Fallback scroll manager
    createBasicScrollManager() {
        this.scrollManager = {
            scrollToSection: (sectionId, position = 'top') => {
                const section = document.getElementById(sectionId);
                if (!section) return;
                
                let scrollTarget = 0;
                switch(position) {
                    case 'top': scrollTarget = 0; break;
                    case 'bottom': scrollTarget = section.scrollHeight; break;
                    case 'center': scrollTarget = (section.scrollHeight - section.clientHeight) / 2; break;
                    default: scrollTarget = position;
                }
                
                section.scrollTo({
                    top: scrollTarget,
                    behavior: 'smooth'
                });
            },
            
            resetScrollPosition: (sectionId) => {
                const section = document.getElementById(sectionId);
                if (section) {
                    section.scrollTop = 0;
                }
            }
        };
    }

    async initializePortfolio() {
        // Wait a bit for DOM to settle
        await this.delay(100);
        
        // Check if PortfolioBook class exists
        if (typeof PortfolioBook === 'undefined') {
            throw new Error('PortfolioBook class not found');
        }
        
        // Initialize portfolio
        this.portfolioBook = new PortfolioBook();
        
        // FIXED: Integrate ScrollManager with PortfolioBook
        this.integrateScrollManager();
        
        // Make globally accessible for debugging
        if (this.config.debugMode) {
            window.portfolio = this.portfolioBook;
            window.portfolioApp = this;
            window.scrollManager = this.scrollManager;
        }
        
        console.log('Portfolio Book initialized');
    }

    // FIXED: Integrate ScrollManager with PortfolioBook
    integrateScrollManager() {
        if (!this.scrollManager || !this.portfolioBook) return;
        
        // Listen for page changes to reset scroll positions
        document.addEventListener('page:changed', (e) => {
            const { leftSection, rightSection } = e.detail;
            
            // Reset scroll positions for new sections
            setTimeout(() => {
                this.scrollManager.resetScrollPosition(leftSection);
                this.scrollManager.resetScrollPosition(rightSection);
            }, 100);
        });
        
        // Add scroll to top functionality
        this.portfolioBook.scrollToTop = (sectionId) => {
            this.scrollManager.scrollToSection(sectionId, 'top');
        };
        
        // Add scroll to bottom functionality
        this.portfolioBook.scrollToBottom = (sectionId) => {
            this.scrollManager.scrollToSection(sectionId, 'bottom');
        };
        
        console.log('✅ ScrollManager integrated with PortfolioBook');
    }

    setupAdditionalFeatures() {
        // Setup service worker
        if (this.config.enableServiceWorker && 'serviceWorker' in navigator) {
            this.registerServiceWorker();
        }
        
        // Setup analytics
        if (this.config.enableAnalytics) {
            this.setupAnalytics();
        }
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Setup page visibility handling
        this.setupPageVisibilityHandling();
        
        // Setup resize handling
        this.setupResizeHandling();
        
        // FIXED: Setup scroll shortcuts
        this.setupScrollShortcuts();
        
        console.log('Additional features setup complete');
    }

    // FIXED: Setup scroll-related keyboard shortcuts
    setupScrollShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't interfere with form inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // Get current active section
            const activeSection = document.querySelector('.content-section.active');
            if (!activeSection) return;

            switch(e.key) {
                case 'Home':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.scrollManager.scrollToSection(activeSection.id, 'top');
                    }
                    break;
                case 'End':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.scrollManager.scrollToSection(activeSection.id, 'bottom');
                    }
                    break;
                case 'PageUp':
                    e.preventDefault();
                    activeSection.scrollBy(0, -activeSection.clientHeight * 0.8);
                    break;
                case 'PageDown':
                    e.preventDefault();
                    activeSection.scrollBy(0, activeSection.clientHeight * 0.8);
                    break;
                case 'ArrowUp':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        activeSection.scrollBy(0, -50);
                    }
                    break;
                case 'ArrowDown':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        activeSection.scrollBy(0, 50);
                    }
                    break;
            }
        });
    }

    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.logError('Global Error', event.error, {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.logError('Unhandled Promise Rejection', event.reason);
        });
    }

    setupPerformanceMonitoring() {
        // Monitor performance metrics
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    console.log('Performance Metrics:', {
                        loadTime: perfData.loadEventEnd - perfData.fetchStart,
                        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
                        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 'N/A'
                    });
                }, 0);
            });
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Don't interfere with form inputs
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }

            // Portfolio navigation shortcuts
            switch (event.key) {
                case 'h':
                case 'Home':
                    if (this.portfolioBook && !event.ctrlKey && !event.metaKey) {
                        this.portfolioBook.showSection(0);
                    }
                    break;
                case 'r':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        this.restart();
                    }
                    break;
                case 'Escape':
                    // Close any open modals or overlays
                    this.closeAllOverlays();
                    break;
            }
        });
    }

    setupPageVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('Page hidden - pausing non-essential operations');
                // Pause animations, timers, etc.
            } else {
                console.log('Page visible - resuming operations');
                // Resume operations
                if (this.portfolioBook && typeof this.portfolioBook.resume === 'function') {
                    this.portfolioBook.resume();
                }
            }
        });
    }

    setupResizeHandling() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log('Window resized - updating layout');
                
                // Emit resize event for components to handle
                document.dispatchEvent(new CustomEvent('portfolioResize', {
                    detail: {
                        width: window.innerWidth,
                        height: window.innerHeight
                    }
                }));
            }, 250);
        });
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
        // Basic analytics setup
        // In a real application, you'd integrate with Google Analytics, etc.
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
        
        // Animate progress bar
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
            // Complete progress bar
            const progressBar = document.getElementById('loader-progress-bar');
            if (progressBar) {
                progressBar.style.width = '100%';
            }
            
            setTimeout(() => {
                loader.style.opacity = '0';
                loader.style.transition = 'opacity 0.5s ease';
                
                setTimeout(() => {
                    loader.remove();
                }, 500);
            }, 200);
        }
    }

    handleInitializationError(error) {
        this.hideGlobalLoader();
        
        const errorHTML = `
            <div class="initialization-error">
                <div class="error-content">
                    <h2>⚠️ Initialization Error</h2>
                    <p>Failed to load the portfolio application.</p>
                    <details>
                        <summary>Error Details</summary>
                        <pre>${error.message}</pre>
                    </details>
                    <div class="error-actions">
                        <button onclick="location.reload()" class="btn btn-primary">
                            🔄 Reload Page
                        </button>
                        <button onclick="portfolioApp.restart()" class="btn btn-secondary">
                            🔧 Restart App
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', errorHTML);
    }

    async restart() {
        console.log('🔄 Restarting Portfolio App...');
        
        // Cleanup existing instances
        if (this.portfolioBook && typeof this.portfolioBook.destroy === 'function') {
            this.portfolioBook.destroy();
        }
        
        if (this.componentLoader && typeof this.componentLoader.destroy === 'function') {
            this.componentLoader.destroy();
        }
        
        if (this.scrollManager && typeof this.scrollManager.destroy === 'function') {
            this.scrollManager.destroy();
        }
        
        // Clear any overlays
        this.closeAllOverlays();
        
        // Reinitialize
        this.isInitialized = false;
        await this.init();
    }

    closeAllOverlays() {
        const overlays = document.querySelectorAll('.overlay, .modal, .global-error-overlay');
        overlays.forEach(overlay => overlay.remove());
    }

    logError(type, error, context = {}) {
        const errorData = {
            type,
            message: error.message || error,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            context,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.error('Error logged:', errorData);
        
        // In a real application, you'd send this to your error tracking service
    }

    // Utility methods
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public API
    getStatus() {
        return {
            initialized: this.isInitialized,
            componentsLoaded: this.componentLoader?.getLoadedComponents().length || 0,
            currentPage: this.portfolioBook?.getCurrentSection() || null,
            scrollManagerActive: !!this.scrollManager,
            config: this.config
        };
    }

    // Public scroll methods
    scrollToSection(sectionId, position = 'top') {
        if (this.scrollManager) {
            this.scrollManager.scrollToSection(sectionId, position);
        }
    }

    resetScrollPositions() {
        if (this.scrollManager) {
            this.scrollManager.resetAllScrollPositions();
        }
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioApp = new PortfolioApp();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.portfolioApp?.portfolioBook) {
        // Cleanup before page unload
        console.log('Cleaning up before page unload');
    }
});

// Add global scroll utilities
window.scrollToTop = (sectionId) => {
    if (window.portfolioApp) {
        window.portfolioApp.scrollToSection(sectionId, 'top');
    }
};

window.scrollToBottom = (sectionId) => {
    if (window.portfolioApp) {
        window.portfolioApp.scrollToSection(sectionId, 'bottom');
    }
};
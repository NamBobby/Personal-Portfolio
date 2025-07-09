// Navigation Module
class NavigationController {
    constructor(portfolioBook) {
        this.portfolioBook = portfolioBook;
        this.currentIndex = 0;
        this.isNavigating = false;
        this.keyboardEnabled = true;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.minSwipeDistance = 50;
        
        this.init();
    }

    init() {
        this.bindNavigationEvents();
        this.bindKeyboardEvents();
        this.bindTouchEvents();
        // Removed mouse wheel navigation
        this.updateNavigationState();
        
        console.log('NavigationController initialized');
    }

    bindNavigationEvents() {
        // Navigation button events
        const prevButton = document.getElementById('prev-button');
        const nextButton = document.getElementById('next-button');
        
        if (prevButton) {
            prevButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.previousPage();
            });
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextPage();
            });
        }

        // Page indicator clicks
        this.bindPageIndicatorEvents();
        
        // Listen for portfolio book events
        if (this.portfolioBook && this.portfolioBook.eventManager) {
            this.portfolioBook.eventManager.on('page:changed', (event) => {
                this.currentIndex = event.data.index;
                this.updateNavigationState();
            });
        }
    }

    bindPageIndicatorEvents() {
        // If you have clickable page dots/indicators
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-dot')) {
                const index = parseInt(e.target.dataset.page);
                if (!isNaN(index)) {
                    this.goToPage(index);
                }
            }
        });
    }

    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            if (!this.keyboardEnabled || this.isNavigating) return;
            
            // Don't interfere with form inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    this.previousPage();
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                case ' ': // Spacebar
                    e.preventDefault();
                    this.nextPage();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToFirstPage();
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToLastPage();
                    break;
                case 'Escape':
                    this.handleEscape();
                    break;
                default:
                    // Number keys for direct navigation
                    if (e.key >= '1' && e.key <= '9') {
                        const pageNum = parseInt(e.key) - 1;
                        if (pageNum < this.getTotalPages()) {
                            e.preventDefault();
                            this.goToPage(pageNum);
                        }
                    }
            }
        });
    }

    bindTouchEvents() {
        const bookContainer = document.querySelector('.book-container');
        if (!bookContainer) return;

        bookContainer.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }, { passive: true });

        bookContainer.addEventListener('touchend', (e) => {
            if (this.isNavigating) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = this.touchStartX - touchEndX;
            const deltaY = this.touchStartY - touchEndY;
            
            // Check if horizontal swipe is more significant than vertical
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > this.minSwipeDistance) {
                    if (deltaX > 0) {
                        // Swiped left - go to next page
                        this.nextPage();
                    } else {
                        // Swiped right - go to previous page
                        this.previousPage();
                    }
                }
            }
        }, { passive: true });
    }

    // REMOVED MOUSE WHEEL NAVIGATION to fix auto-scroll issue

    previousPage() {
        if (this.isNavigating || this.currentIndex <= 0) return;
        
        this.navigateTo(this.currentIndex - 1);
    }

    nextPage() {
        if (this.isNavigating || this.currentIndex >= this.getTotalPages() - 1) return;
        
        this.navigateTo(this.currentIndex + 1);
    }

    goToPage(index) {
        if (this.isNavigating || index < 0 || index >= this.getTotalPages()) return;
        
        this.navigateTo(index);
    }

    goToFirstPage() {
        this.goToPage(0);
    }

    goToLastPage() {
        this.goToPage(this.getTotalPages() - 1);
    }

    navigateTo(index) {
        if (this.isNavigating) return;
        
        this.isNavigating = true;
        this.currentIndex = index;
        
        // Use portfolio book's navigation
        if (this.portfolioBook) {
            this.portfolioBook.showSection(index);
        }
        
        // Update navigation state
        this.updateNavigationState();
        
        // Add navigation sound effect
        this.playNavigationSound();
        
        // Reset navigation lock after animation
        setTimeout(() => {
            this.isNavigating = false;
        }, 600);
    }

    updateNavigationState() {
        this.updateNavigationButtons();
        this.updatePageIndicator();
        this.updateProgressBar();
        this.updateURL();
    }

    updateNavigationButtons() {
        const prevButton = document.getElementById('prev-button');
        const nextButton = document.getElementById('next-button');
        
        if (prevButton) {
            const isDisabled = this.currentIndex <= 0;
            prevButton.disabled = isDisabled;
            prevButton.classList.toggle('disabled', isDisabled);
            prevButton.style.opacity = isDisabled ? '0.5' : '1';
            
            // Simple button text
            const span = prevButton.querySelector('span');
            if (span) {
                span.textContent = 'Previous Page';
            }
        }
        
        if (nextButton) {
            const isDisabled = this.currentIndex >= this.getTotalPages() - 1;
            nextButton.disabled = isDisabled;
            nextButton.classList.toggle('disabled', isDisabled);
            nextButton.style.opacity = isDisabled ? '0.5' : '1';
            
            // Simple button text
            const span = nextButton.querySelector('span');
            if (span) {
                span.textContent = 'Next Page';
            }
        }
    }

    updatePageIndicator() {
        const currentPageElement = document.getElementById('current-page');
        const totalPagesElement = document.getElementById('total-pages');
        
        if (currentPageElement) {
            currentPageElement.textContent = this.currentIndex + 1;
        }
        
        if (totalPagesElement) {
            totalPagesElement.textContent = this.getTotalPages();
        }

        // Update page dots if they exist
        const pageDots = document.querySelectorAll('.nav-dot');
        pageDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }

    updateProgressBar() {
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            const progress = ((this.currentIndex + 1) / this.getTotalPages()) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    updateURL() {
        // Update URL without page reload
        const pageNames = ['profile', 'education', 'skills'];
        const pageName = pageNames[this.currentIndex] || 'page';
        
        if (history.replaceState) {
            const newURL = `${window.location.pathname}#${pageName}`;
            history.replaceState({ page: this.currentIndex }, '', newURL);
        }
    }

    handleEscape() {
        // Close any open modals or overlays
        const overlays = document.querySelectorAll('.modal, .overlay, .dropdown-open');
        overlays.forEach(overlay => {
            if (overlay.classList.contains('modal') || overlay.classList.contains('overlay')) {
                overlay.remove();
            } else {
                overlay.classList.remove('dropdown-open');
            }
        });
    }

    playNavigationSound() {
        // Optional: Play navigation sound
        try {
            if (window.audioContext && window.portfolioSounds) {
                // Play a subtle page turn sound
                window.portfolioSounds.playPageTurn();
            }
        } catch (error) {
            // Silently fail if audio is not available
        }
    }

    getTotalPages() {
        return this.portfolioBook ? this.portfolioBook.leftSections.length : 3;
    }

    getCurrentPage() {
        return this.currentIndex;
    }

    // Enable/disable keyboard navigation
    enableKeyboard() {
        this.keyboardEnabled = true;
    }

    disableKeyboard() {
        this.keyboardEnabled = false;
    }

    // Auto-navigation features
    startAutoNavigation(interval = 5000) {
        this.stopAutoNavigation();
        
        this.autoNavigationInterval = setInterval(() => {
            if (!this.isNavigating) {
                if (this.currentIndex >= this.getTotalPages() - 1) {
                    this.goToFirstPage();
                } else {
                    this.nextPage();
                }
            }
        }, interval);
    }

    stopAutoNavigation() {
        if (this.autoNavigationInterval) {
            clearInterval(this.autoNavigationInterval);
            this.autoNavigationInterval = null;
        }
    }

    // Handle browser back/forward buttons
    handlePopState(event) {
        if (event.state && typeof event.state.page === 'number') {
            this.goToPage(event.state.page);
        }
    }

    // Initialize URL-based navigation
    initURLNavigation() {
        // Handle initial page load from URL hash
        const hash = window.location.hash.slice(1);
        const pageNames = ['profile', 'education', 'skills'];
        const pageIndex = pageNames.indexOf(hash);
        
        if (pageIndex !== -1) {
            this.goToPage(pageIndex);
        }

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => this.handlePopState(e));
    }

    // Cleanup
    destroy() {
        this.stopAutoNavigation();
        
        // Remove event listeners if needed
        document.removeEventListener('keydown', this.keydownHandler);
        
        console.log('NavigationController destroyed');
    }
}

// Make available globally
window.NavigationController = NavigationController;
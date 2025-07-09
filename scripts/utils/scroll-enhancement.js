// Enhanced Scroll Manager - UPDATED for non-sticky headers
class ScrollManager {
    constructor() {
        this.scrollPositions = new Map();
        this.isScrolling = false;
        this.scrollTimeout = null;
        
        this.init();
    }

    init() {
        this.setupScrollEnhancements();
        this.setupScrollIndicators();
        this.setupScrollMemory();
        this.setupSmoothScrolling();
        
        console.log('📜 ScrollManager initialized (non-sticky headers)');
    }

    setupScrollEnhancements() {
        // Add scroll listeners to all content sections
        document.querySelectorAll('.content-section').forEach(section => {
            this.enhanceSection(section);
        });

        // Listen for new sections being added
        document.addEventListener('componentLoaded', () => {
            setTimeout(() => {
                document.querySelectorAll('.content-section').forEach(section => {
                    this.enhanceSection(section);
                });
            }, 100);
        });
    }

    enhanceSection(section) {
        if (section.dataset.scrollEnhanced) return;
        
        section.dataset.scrollEnhanced = 'true';
        
        // Add scroll event listener
        section.addEventListener('scroll', (e) => {
            this.handleScroll(e, section);
        });

        // Add mouse wheel support
        section.addEventListener('wheel', (e) => {
            this.handleWheel(e, section);
        });

        // Add touch support for mobile
        this.addTouchSupport(section);
        
        // Add keyboard support
        this.addKeyboardSupport(section);
    }

    handleScroll(event, section) {
        const sectionId = section.id;
        
        // Store scroll position
        this.scrollPositions.set(sectionId, section.scrollTop);
        
        // Update scroll indicators
        this.updateScrollIndicators(section);
        
        // Handle scroll start/end
        this.handleScrollStartEnd(section);
        
        // FIXED: Remove header fade logic since headers aren't sticky
        // this.handleHeaderFade(section);
        
        // Emit custom scroll event
        document.dispatchEvent(new CustomEvent('sectionScroll', {
            detail: {
                section: sectionId,
                scrollTop: section.scrollTop,
                scrollHeight: section.scrollHeight,
                clientHeight: section.clientHeight
            }
        }));
    }

    handleWheel(event, section) {
        // Prevent page-level scrolling when scrolling within section
        if (this.canScrollInSection(section, event.deltaY)) {
            event.stopPropagation();
        }
    }

    canScrollInSection(section, deltaY) {
        const { scrollTop, scrollHeight, clientHeight } = section;
        
        // Can scroll down
        if (deltaY > 0 && scrollTop < scrollHeight - clientHeight) {
            return true;
        }
        
        // Can scroll up
        if (deltaY < 0 && scrollTop > 0) {
            return true;
        }
        
        return false;
    }

    addTouchSupport(section) {
        let startY = 0;
        let startScrollTop = 0;
        
        section.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            startScrollTop = section.scrollTop;
        }, { passive: true });
        
        section.addEventListener('touchmove', (e) => {
            const currentY = e.touches[0].clientY;
            const deltaY = startY - currentY;
            const newScrollTop = startScrollTop + deltaY;
            
            // Smooth scrolling for touch
            section.scrollTo({
                top: newScrollTop,
                behavior: 'auto'
            });
        }, { passive: true });
    }

    addKeyboardSupport(section) {
        section.addEventListener('keydown', (e) => {
            if (!section.contains(document.activeElement)) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.scrollBy(section, -50);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.scrollBy(section, 50);
                    break;
                case 'PageUp':
                    e.preventDefault();
                    this.scrollBy(section, -section.clientHeight * 0.8);
                    break;
                case 'PageDown':
                    e.preventDefault();
                    this.scrollBy(section, section.clientHeight * 0.8);
                    break;
                case 'Home':
                    e.preventDefault();
                    this.scrollToTop(section);
                    break;
                case 'End':
                    e.preventDefault();
                    this.scrollToBottom(section);
                    break;
            }
        });
    }

    scrollBy(section, delta) {
        section.scrollTo({
            top: section.scrollTop + delta,
            behavior: 'smooth'
        });
    }

    scrollToTop(section) {
        section.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    scrollToBottom(section) {
        section.scrollTo({
            top: section.scrollHeight,
            behavior: 'smooth'
        });
    }

    setupScrollIndicators() {
        // Create scroll indicators for each section
        document.querySelectorAll('.content-section').forEach(section => {
            this.createScrollIndicator(section);
        });
    }

    createScrollIndicator(section) {
        // Create scroll progress indicator
        const indicator = document.createElement('div');
        indicator.className = 'scroll-progress-indicator';
        indicator.innerHTML = `
            <div class="scroll-progress-bar"></div>
            <div class="scroll-progress-thumb"></div>
        `;
        
        // Add styles
        indicator.style.cssText = `
            position: absolute;
            top: 0;
            right: 0;
            width: 4px;
            height: 100%;
            background: rgba(0, 0, 0, 0.1);
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        const progressBar = indicator.querySelector('.scroll-progress-bar');
        progressBar.style.cssText = `
            width: 100%;
            height: 0%;
            background: var(--primary-color);
            transition: height 0.1s ease;
        `;
        
        const progressThumb = indicator.querySelector('.scroll-progress-thumb');
        progressThumb.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 20px;
            background: var(--accent-color);
            border-radius: 2px;
            transition: top 0.1s ease;
        `;
        
        section.appendChild(indicator);
        
        // Show/hide on hover
        section.addEventListener('mouseenter', () => {
            indicator.style.opacity = '1';
        });
        
        section.addEventListener('mouseleave', () => {
            indicator.style.opacity = '0';
        });
        
        // Update on scroll
        section.addEventListener('scroll', () => {
            this.updateScrollIndicator(section, indicator);
        });
    }

    updateScrollIndicator(section, indicator) {
        const { scrollTop, scrollHeight, clientHeight } = section;
        const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;
        
        const progressBar = indicator.querySelector('.scroll-progress-bar');
        const progressThumb = indicator.querySelector('.scroll-progress-thumb');
        
        progressBar.style.height = `${scrollPercent}%`;
        progressThumb.style.top = `${scrollPercent}%`;
    }

    updateScrollIndicators(section) {
        const indicator = section.querySelector('.scroll-progress-indicator');
        if (indicator) {
            this.updateScrollIndicator(section, indicator);
        }
    }

    handleScrollStartEnd(section) {
        clearTimeout(this.scrollTimeout);
        
        if (!this.isScrolling) {
            this.isScrolling = true;
            section.classList.add('scrolling');
        }
        
        this.scrollTimeout = setTimeout(() => {
            this.isScrolling = false;
            section.classList.remove('scrolling');
        }, 150);
    }

    setupScrollMemory() {
        // Save scroll positions when page changes
        document.addEventListener('page:changed', (e) => {
            this.saveAllScrollPositions();
        });
    }

    saveAllScrollPositions() {
        document.querySelectorAll('.content-section').forEach(section => {
            if (section.scrollTop > 0) {
                this.scrollPositions.set(section.id, section.scrollTop);
            }
        });
    }

    restoreScrollPosition(sectionId) {
        const section = document.getElementById(sectionId);
        const savedPosition = this.scrollPositions.get(sectionId);
        
        if (section && savedPosition) {
            section.scrollTop = savedPosition;
        }
    }

    setupSmoothScrolling() {
        // Add smooth scrolling to all internal links
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const targetId = e.target.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    this.scrollToElement(targetElement);
                }
            }
        });
    }

    scrollToElement(element) {
        const section = element.closest('.content-section');
        if (section) {
            const elementTop = element.offsetTop;
            const sectionTop = section.offsetTop;
            // FIXED: Remove sticky header offset since headers aren't sticky
            const scrollTarget = elementTop - sectionTop - 20; // Small buffer instead of 80px
            
            section.scrollTo({
                top: scrollTarget,
                behavior: 'smooth'
            });
        }
    }

    // Public API
    scrollToSection(sectionId, position = 'top') {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        let scrollTarget = 0;
        
        switch(position) {
            case 'top':
                scrollTarget = 0;
                break;
            case 'bottom':
                scrollTarget = section.scrollHeight;
                break;
            case 'center':
                scrollTarget = (section.scrollHeight - section.clientHeight) / 2;
                break;
            default:
                scrollTarget = position;
        }
        
        section.scrollTo({
            top: scrollTarget,
            behavior: 'smooth'
        });
    }

    // FIXED: Scroll to section content (below header)
    scrollToSectionContent(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        const sectionTitle = section.querySelector('.section-title');
        if (sectionTitle) {
            // Scroll to just below the title
            const titleHeight = sectionTitle.offsetHeight;
            const scrollTarget = titleHeight + 20; // Small buffer
            
            section.scrollTo({
                top: scrollTarget,
                behavior: 'smooth'
            });
        } else {
            // If no title, scroll to top
            this.scrollToSection(sectionId, 'top');
        }
    }

    // FIXED: Scroll past header for skills/portfolio sections
    scrollPastHeader(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        const sectionTitle = section.querySelector('.section-title');
        if (sectionTitle) {
            const titleHeight = sectionTitle.offsetHeight;
            const scrollTarget = titleHeight + 40; // More buffer to clear header
            
            section.scrollTo({
                top: scrollTarget,
                behavior: 'smooth'
            });
        }
    }

    getScrollPosition(sectionId) {
        return this.scrollPositions.get(sectionId) || 0;
    }

    resetScrollPosition(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollTop = 0;
            this.scrollPositions.set(sectionId, 0);
        }
    }

    resetAllScrollPositions() {
        document.querySelectorAll('.content-section').forEach(section => {
            section.scrollTop = 0;
        });
        this.scrollPositions.clear();
    }

    // FIXED: Smart scroll - detects if header is in view
    smartScroll(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        const sectionTitle = section.querySelector('.section-title');
        if (!sectionTitle) {
            this.scrollToTop(section);
            return;
        }
        
        const titleRect = sectionTitle.getBoundingClientRect();
        const sectionRect = section.getBoundingClientRect();
        
        // If title is visible, scroll to content
        if (titleRect.bottom < sectionRect.bottom) {
            this.scrollToSectionContent(sectionId);
        } else {
            // If title is not visible, scroll to top
            this.scrollToTop(section);
        }
    }

    // Debug method
    debugScrollPositions() {
        console.log('=== SCROLL POSITIONS ===');
        this.scrollPositions.forEach((position, sectionId) => {
            console.log(`${sectionId}: ${position}px`);
        });
    }

    // Cleanup
    destroy() {
        document.querySelectorAll('.content-section').forEach(section => {
            section.removeEventListener('scroll', this.handleScroll);
            section.removeEventListener('wheel', this.handleWheel);
            
            // Remove indicators
            const indicator = section.querySelector('.scroll-progress-indicator');
            if (indicator) {
                indicator.remove();
            }
        });
        
        this.scrollPositions.clear();
        console.log('ScrollManager destroyed');
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.scrollManager = new ScrollManager();
});

// Make available globally
window.ScrollManager = ScrollManager;

// FIXED: Global helper functions
window.scrollPastHeader = (sectionId) => {
    if (window.scrollManager) {
        window.scrollManager.scrollPastHeader(sectionId);
    }
};

window.scrollToContent = (sectionId) => {
    if (window.scrollManager) {
        window.scrollManager.scrollToSectionContent(sectionId);
    }
};

window.smartScroll = (sectionId) => {
    if (window.scrollManager) {
        window.scrollManager.smartScroll(sectionId);
    }
};
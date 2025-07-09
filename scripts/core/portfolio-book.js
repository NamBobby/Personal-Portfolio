// Portfolio Book Core Class
class PortfolioBook {
    constructor() {
        this.currentPageIndex = 0;
        // FIXED: Ensure all 6 sections are properly mapped
        this.leftSections = [
            'profile-page',
            'section-education', 
            'section-skills'
        ];
        this.rightSections = [
            'section-contact',
            'section-experience',
            'section-portfolio'
        ];
        this.isAnimating = false;
        this.eventManager = new EventManager();
        this.animationController = new AnimationController();
        this.navigationController = new NavigationController(this);
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateNavButtons();
        this.updatePageIndicator();
        this.showSection(0);
        
        // Initialize modules
        this.initializeModules();
        
        console.log('PortfolioBook initialized successfully');
    }

    initializeModules() {
        // Initialize skill bars
        if (typeof SkillBarsModule !== 'undefined') {
            this.skillBars = new SkillBarsModule();
        }
        
        // Initialize form handler
        if (typeof FormHandler !== 'undefined') {
            this.formHandler = new FormHandler();
        }
        
        // Initialize other modules as needed
        this.initSmoothScrolling();
        this.initLazyLoading();
    }

    bindEvents() {
        this.eventManager.on('navigation:prev', () => this.previousPage());
        this.eventManager.on('navigation:next', () => this.nextPage());
        this.eventManager.on('navigation:goto', (index) => this.showSection(index));
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.isAnimating) return;
            
            if (e.key === 'ArrowLeft') {
                this.previousPage();
            } else if (e.key === 'ArrowRight') {
                this.nextPage();
            }
        });
    }

    showSection(index) {
        if (this.isAnimating || index < 0 || index >= this.leftSections.length) {
            return;
        }
        
        this.isAnimating = true;
        
        // Hide current sections with fade out
        this.animationController.fadeOutSections(
            '.left-page .content-section.active',
            '.right-page .content-section.active'
        ).then(() => {
            this.showNewSection(index);
        });
    }

    showNewSection(index) {
        // Remove active class from current sections
        document.querySelectorAll('.content-section.active').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show new sections
        const newLeftSection = document.getElementById(this.leftSections[index]);
        const newRightSection = document.getElementById(this.rightSections[index]);
        
        if (newLeftSection) {
            this.animationController.slideInFromRight(newLeftSection);
            newLeftSection.scrollTop = 0;
        }
        
        if (newRightSection) {
            this.animationController.slideInFromLeft(newRightSection);
            newRightSection.scrollTop = 0;
        }
        
        this.currentPageIndex = index;
        this.updateNavButtons();
        this.updatePageIndicator();
        
        // Trigger section-specific animations
        this.triggerSectionAnimations(this.leftSections[index]);
        this.triggerSectionAnimations(this.rightSections[index]);
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 600);
        
        // Emit page change event
        this.eventManager.emit('page:changed', {
            index: index,
            leftSection: this.leftSections[index],
            rightSection: this.rightSections[index]
        });
    }

    triggerSectionAnimations(sectionId) {
        switch(sectionId) {
            case 'section-skills':
                setTimeout(() => {
                    if (this.skillBars) {
                        this.skillBars.animate();
                    }
                    this.animationController.animateSkillBars();
                }, 500);
                break;
            case 'section-portfolio':
                setTimeout(() => {
                    this.animationController.animatePortfolioCards();
                }, 300);
                break;
            case 'section-experience':
                setTimeout(() => {
                    this.animationController.animateTimeline();
                }, 400);
                break;
            case 'section-education':
                setTimeout(() => {
                    this.animationController.animateEducationCards();
                }, 300);
                break;
        }
    }

    previousPage() {
        if (this.currentPageIndex > 0) {
            this.showSection(this.currentPageIndex - 1);
        }
    }

    nextPage() {
        if (this.currentPageIndex < this.leftSections.length - 1) {
            this.showSection(this.currentPageIndex + 1);
        }
    }

    updateNavButtons() {
        const prevButton = document.getElementById('prev-button');
        const nextButton = document.getElementById('next-button');
        
        if (prevButton) {
            prevButton.disabled = this.currentPageIndex === 0;
            prevButton.style.opacity = this.currentPageIndex === 0 ? '0.5' : '1';
        }
        
        if (nextButton) {
            nextButton.disabled = this.currentPageIndex === this.leftSections.length - 1;
            nextButton.style.opacity = this.currentPageIndex === this.leftSections.length - 1 ? '0.5' : '1';
        }
    }

    updatePageIndicator() {
        const currentPageElement = document.getElementById('current-page');
        const totalPagesElement = document.getElementById('total-pages');
        
        if (currentPageElement) {
            currentPageElement.textContent = this.currentPageIndex + 1;
        }
        
        if (totalPagesElement) {
            totalPagesElement.textContent = this.leftSections.length;
        }
    }

    // Smooth scrolling for internal links
    initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Lazy loading for images
    initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        if (images.length === 0) return;
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }

    // Typewriter effect for text
    typeWriter(element, text, speed = 50) {
        if (!element || !text) return;
        
        element.innerHTML = '';
        let i = 0;
        
        const timer = setInterval(() => {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
            }
        }, speed);
        
        return timer;
    }

    // Public method to show specific section (for external calls)
    goToSection(sectionName) {
        const leftIndex = this.leftSections.indexOf(sectionName);
        const rightIndex = this.rightSections.indexOf(sectionName);
        const index = leftIndex !== -1 ? leftIndex : rightIndex;
        
        if (index !== -1) {
            this.showSection(index);
        }
    }

    // Get current section info
    getCurrentSection() {
        return {
            index: this.currentPageIndex,
            leftSection: this.leftSections[this.currentPageIndex],
            rightSection: this.rightSections[this.currentPageIndex]
        };
    }

    // Check if on first/last page
    isFirstPage() {
        return this.currentPageIndex === 0;
    }

    isLastPage() {
        return this.currentPageIndex === this.leftSections.length - 1;
    }

    // Progress calculation
    getProgress() {
        return ((this.currentPageIndex + 1) / this.leftSections.length) * 100;
    }

    // Destroy method for cleanup
    destroy() {
        if (this.eventManager) {
            this.eventManager.removeAllListeners();
        }
        
        if (this.animationController) {
            this.animationController.cleanup();
        }
        
        if (this.navigationController) {
            this.navigationController.destroy();
        }
        
        // Remove event listeners
        document.removeEventListener('keydown', this.keydownHandler);
        
        console.log('PortfolioBook destroyed');
    }
}
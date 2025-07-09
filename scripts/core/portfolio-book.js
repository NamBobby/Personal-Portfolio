// Portfolio Book Core Class - ENHANCED VERSION with Skills Navigation
class PortfolioBook {
    constructor() {
        this.currentPageIndex = 0;
        // FIXED: Ensure all sections are properly mapped
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

        // Wait for components to load before initializing
        this.waitForComponents();
    }

    // FIXED: Wait for all components to load before initializing
    waitForComponents() {
        // Check if components are loaded
        const checkComponents = () => {
            const allSectionsLoaded = [
                ...this.leftSections,
                ...this.rightSections
            ].every(sectionId => document.getElementById(sectionId));

            if (allSectionsLoaded) {
                console.log('✅ All components loaded, initializing...');
                this.init();
            } else {
                console.log('⏳ Waiting for components to load...');
                setTimeout(checkComponents, 100);
            }
        };

        // Listen for component loaded events
        document.addEventListener('allComponentsLoaded', () => {
            console.log('📦 All components loaded event received');
            setTimeout(checkComponents, 100);
        });

        // Start checking immediately
        checkComponents();
    }

    init() {
        this.bindEvents();
        this.updateNavButtons();
        this.updatePageIndicator();
        this.showSection(0);

        // Initialize modules
        this.initializeModules();

        console.log('✅ PortfolioBook initialized successfully');
        console.log('Left sections:', this.leftSections);
        console.log('Right sections:', this.rightSections);
        this.debugSections();
    }

    // FIXED: Debug method to check sections
    debugSections() {
        console.log('=== DEBUG SECTIONS ===');
        this.leftSections.forEach((sectionId, index) => {
            const element = document.getElementById(sectionId);
            console.log(`Left ${index}: ${sectionId} - ${element ? '✅ FOUND' : '❌ NOT FOUND'}`);
        });

        this.rightSections.forEach((sectionId, index) => {
            const element = document.getElementById(sectionId);
            console.log(`Right ${index}: ${sectionId} - ${element ? '✅ FOUND' : '❌ NOT FOUND'}`);
        });
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
        console.log(`🔄 Showing section ${index}`);

        if (this.isAnimating || index < 0 || index >= this.leftSections.length) {
            console.log('❌ Animation blocked or invalid index');
            return;
        }

        this.isAnimating = true;

        // FIXED: Properly hide current sections
        this.hideCurrentSections().then(() => {
            this.showNewSection(index);
        });
    }

    // FIXED: Properly hide current sections
    hideCurrentSections() {
        return new Promise((resolve) => {
            const activeElements = document.querySelectorAll('.content-section.active');

            activeElements.forEach(element => {
                element.classList.remove('active');
                element.classList.add('fade-out');

                // Clear any conflicting inline styles
                element.style.opacity = '';
                element.style.transform = '';
                element.style.display = '';
            });

            setTimeout(resolve, 300);
        });
    }

    showNewSection(index) {
        console.log(`✨ Showing new section ${index}`);

        // Remove all animation classes from all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active', 'fade-out', 'slide-in-left', 'slide-in-right');

            // FIXED: Clear any inline styles that might interfere
            section.style.opacity = '';
            section.style.transform = '';
            section.style.display = '';
        });

        // Show new sections
        const newLeftSection = document.getElementById(this.leftSections[index]);
        const newRightSection = document.getElementById(this.rightSections[index]);

        console.log('Left section:', this.leftSections[index], newLeftSection ? '✅ FOUND' : '❌ NOT FOUND');
        console.log('Right section:', this.rightSections[index], newRightSection ? '✅ FOUND' : '❌ NOT FOUND');

        if (newLeftSection) {
            // FIXED: Use CSS classes for animation
            newLeftSection.classList.add('active');
            newLeftSection.classList.add('slide-in-right');
            newLeftSection.scrollTop = 0;

            // Remove animation class after animation completes
            setTimeout(() => {
                newLeftSection.classList.remove('slide-in-right');
            }, 600);
        }

        if (newRightSection) {
            // FIXED: Use CSS classes for animation
            newRightSection.classList.add('active');
            newRightSection.classList.add('slide-in-left');
            newRightSection.scrollTop = 0;

            // Remove animation class after animation completes
            setTimeout(() => {
                newRightSection.classList.remove('slide-in-left');
            }, 600);
        }

        this.currentPageIndex = index;
        this.updateNavButtons();
        this.updatePageIndicator();

        // Trigger section-specific animations
        this.triggerSectionAnimations(this.leftSections[index]);
        this.triggerSectionAnimations(this.rightSections[index]);

        setTimeout(() => {
            this.isAnimating = false;
            console.log('✅ Animation completed');
        }, 600);

        // Emit page change event
        this.eventManager.emit('page:changed', {
            index: index,
            leftSection: this.leftSections[index],
            rightSection: this.rightSections[index]
        });
    }

    triggerSectionAnimations(sectionId) {
        switch (sectionId) {
            case 'section-skills':
                setTimeout(() => {
                    if (this.skillBars) {
                        this.skillBars.animate();
                    }
                    this.animateSkillBars();
                }, 500);
                break;
            case 'section-portfolio':
                setTimeout(() => {
                    this.animatePortfolioCards();
                }, 300);
                break;
            case 'section-experience':
                setTimeout(() => {
                    this.animateTimeline();
                }, 400);
                break;
            case 'section-education':
                setTimeout(() => {
                    this.animateEducationCards();
                }, 300);
                break;
        }
    }

    // FIXED: Animate skill bars using CSS
    animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-bar');
        skillBars.forEach((bar, index) => {
            const level = bar.getAttribute('data-level');
            if (level) {
                setTimeout(() => {
                    bar.style.width = level + '%';
                }, index * 100);
            }
        });
    }

    animatePortfolioCards() {
        const portfolioCards = document.querySelectorAll('.portfolio-card');
        portfolioCards.forEach((card, index) => {
            card.classList.remove('animate');
            setTimeout(() => {
                card.classList.add('animate');
            }, index * 150);
        });
    }

    animateTimeline() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach((item, index) => {
            item.classList.remove('animate');
            setTimeout(() => {
                item.classList.add('animate');
            }, index * 200);
        });
    }

    animateEducationCards() {
        const educationCards = document.querySelectorAll('.education-card');
        educationCards.forEach((card, index) => {
            card.classList.remove('animate');
            setTimeout(() => {
                card.classList.add('animate');
            }, index * 200);
        });
    }

    previousPage() {
        console.log('⬅️ Previous page clicked, current:', this.currentPageIndex);
        if (this.currentPageIndex > 0) {
            this.showSection(this.currentPageIndex - 1);
        }
    }

    nextPage() {
        console.log('➡️ Next page clicked, current:', this.currentPageIndex);
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
                const href = this.getAttribute('href');
                if (!href || href === '#') return;

                const target = document.querySelector(href);
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

    // ENHANCED: Public method to show specific section with better logic
    goToSection(sectionName) {
        console.log('🎯 Navigating to section:', sectionName);
        
        // Find the section index
        const leftIndex = this.leftSections.indexOf(sectionName);
        const rightIndex = this.rightSections.indexOf(sectionName);
        
        let targetIndex = -1;
        
        if (leftIndex !== -1) {
            targetIndex = leftIndex;
        } else if (rightIndex !== -1) {
            targetIndex = rightIndex;
        }
        
        if (targetIndex !== -1) {
            console.log('📍 Found section at index:', targetIndex);
            this.showSection(targetIndex);
            
            // ENHANCED: Scroll to top of target section after navigation
            setTimeout(() => {
                const targetElement = document.getElementById(sectionName);
                if (targetElement) {
                    targetElement.scrollTop = 0;
                }
            }, 700); // Wait for animation to complete
            
            return true;
        } else {
            console.warn('❌ Section not found:', sectionName);
            return false;
        }
    }

    // ENHANCED: Navigate to Skills section specifically
    goToSkills() {
        return this.goToSection('section-skills');
    }

    // ENHANCED: Navigate to Portfolio section specifically
    goToPortfolio() {
        return this.goToSection('section-portfolio');
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

    // ENHANCED: Get section names for easier navigation
    getSectionNames() {
        return {
            left: [...this.leftSections],
            right: [...this.rightSections],
            all: [...this.leftSections, ...this.rightSections]
        };
    }

    // ENHANCED: Check if a section exists
    sectionExists(sectionName) {
        return this.leftSections.includes(sectionName) || 
               this.rightSections.includes(sectionName);
    }

    // ENHANCED: Get section position (left/right)
    getSectionPosition(sectionName) {
        if (this.leftSections.includes(sectionName)) {
            return 'left';
        } else if (this.rightSections.includes(sectionName)) {
            return 'right';
        }
        return null;
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
// Portfolio JavaScript - Enhanced with Page Flip Animation
class PortfolioBook {
    constructor() {
        this.currentPageIndex = 0;
        this.sections = [
            'section-experience',
            'section-education', 
            'section-skills',
            'section-portfolio',
            'section-contact'
        ];
        this.isBookOpen = false;
        this.isAnimating = false;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateNavButtons();
        this.updatePageIndicator();
        this.initSkillBars();
        this.initPortfolioHovers();
        this.initFormSubmission();
        
        // Show first section
        this.showSection(0);
    }

    bindEvents() {
        // Book opening
        const openBookBtn = document.querySelector('.open-book-btn');
        const bookCover = document.querySelector('.book-cover');
        
        if (openBookBtn) {
            openBookBtn.addEventListener('click', () => this.openBook());
        }
        
        if (bookCover) {
            bookCover.addEventListener('click', () => this.openBook());
        }

        // Navigation buttons
        const prevButton = document.getElementById('prev-button');
        const nextButton = document.getElementById('next-button');
        
        if (prevButton) {
            prevButton.addEventListener('click', () => this.previousPage());
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', () => this.nextPage());
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.isBookOpen || this.isAnimating) return;
            
            if (e.key === 'ArrowLeft') {
                this.previousPage();
            } else if (e.key === 'ArrowRight') {
                this.nextPage();
            }
        });

        // Close book when clicking outside
        document.addEventListener('click', (e) => {
            const bookContainer = document.querySelector('.book-container');
            if (this.isBookOpen && !bookContainer.contains(e.target)) {
                this.closeBook();
            }
        });

        // Prevent page scroll when book is open
        document.addEventListener('wheel', (e) => {
            if (this.isBookOpen) {
                const rightPage = document.querySelector('.right-page');
                const activeSection = document.querySelector('.content-section.active');
                
                // Allow scrolling only within the active section
                if (!activeSection.contains(e.target)) {
                    e.preventDefault();
                }
            }
        });
    }

    openBook() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.isBookOpen = true;
        
        const bookContainer = document.querySelector('.book-container');
        const bookCover = document.querySelector('.book-cover');
        
        // Add CSS classes for animation
        bookContainer.classList.add('opened');
        bookCover.classList.add('opened');
        
        // Add page flip sound effect (optional)
        this.playPageFlipSound();
        
        // Reset animation flag after animation completes
        setTimeout(() => {
            this.isAnimating = false;
        }, 800);
    }

    closeBook() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.isBookOpen = false;
        
        const bookContainer = document.querySelector('.book-container');
        const bookCover = document.querySelector('.book-cover');
        
        bookContainer.classList.remove('opened');
        bookCover.classList.remove('opened');
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 800);
    }

    showSection(index) {
        if (this.isAnimating || index < 0 || index >= this.sections.length) return;
        
        this.isAnimating = true;
        
        // Hide current section with fade out
        const currentSection = document.querySelector('.content-section.active');
        if (currentSection) {
            currentSection.style.opacity = '0';
            currentSection.style.transform = 'translateX(30px)';
            
            setTimeout(() => {
                currentSection.classList.remove('active');
                this.showNewSection(index);
            }, 300);
        } else {
            this.showNewSection(index);
        }
    }

    showNewSection(index) {
        const newSection = document.getElementById(this.sections[index]);
        
        if (newSection) {
            // Reset transform and opacity
            newSection.style.opacity = '0';
            newSection.style.transform = 'translateX(-30px)';
            newSection.classList.add('active');
            
            // Animate in
            setTimeout(() => {
                newSection.style.opacity = '1';
                newSection.style.transform = 'translateX(0)';
            }, 50);
            
            // Scroll to top of new section
            newSection.scrollTop = 0;
            
            this.currentPageIndex = index;
            this.updateNavButtons();
            this.updatePageIndicator();
            
            // Trigger specific animations for certain sections
            this.triggerSectionAnimations(this.sections[index]);
        }
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 600);
        
        // Add page flip sound
        this.playPageFlipSound();
    }

    triggerSectionAnimations(sectionId) {
        switch(sectionId) {
            case 'section-skills':
                setTimeout(() => this.animateSkillBars(), 500);
                break;
            case 'section-portfolio':
                setTimeout(() => this.animatePortfolioCards(), 300);
                break;
            case 'section-experience':
                setTimeout(() => this.animateTimeline(), 400);
                break;
        }
    }

    previousPage() {
        if (this.currentPageIndex > 0) {
            this.showSection(this.currentPageIndex - 1);
        }
    }

    nextPage() {
        if (this.currentPageIndex < this.sections.length - 1) {
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
            nextButton.disabled = this.currentPageIndex === this.sections.length - 1;
            nextButton.style.opacity = this.currentPageIndex === this.sections.length - 1 ? '0.5' : '1';
        }
    }

    updatePageIndicator() {
        const currentPageElement = document.getElementById('current-page');
        const totalPagesElement = document.getElementById('total-pages');
        
        if (currentPageElement) {
            currentPageElement.textContent = this.currentPageIndex + 1;
        }
        
        if (totalPagesElement) {
            totalPagesElement.textContent = this.sections.length;
        }
    }

    // Skill bars animation
    initSkillBars() {
        const skillBars = document.querySelectorAll('.skill-bar');
        skillBars.forEach(bar => {
            bar.style.width = '0%';
        });
    }

    animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-bar');
        skillBars.forEach((bar, index) => {
            const level = bar.getAttribute('data-level');
            setTimeout(() => {
                bar.style.width = level + '%';
            }, index * 100);
        });
    }

    // Portfolio cards animation
    initPortfolioHovers() {
        const portfolioCards = document.querySelectorAll('.portfolio-card');
        portfolioCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    animatePortfolioCards() {
        const portfolioCards = document.querySelectorAll('.portfolio-card');
        portfolioCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 150);
        });
    }

    // Timeline animation
    animateTimeline() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-30px)';
            
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 200);
        });
    }

    // Form submission
    initFormSubmission() {
        const form = document.querySelector('.contact-form form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission(form);
            });
        }
    }

    handleFormSubmission(form) {
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
        submitBtn.disabled = true;
        
        // Simulate form submission
        setTimeout(() => {
            // Show success message
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Đã gửi!';
            submitBtn.style.background = '#10b981';
            
            // Reset form
            form.reset();
            
            // Reset button after 3 seconds
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
            }, 3000);
        }, 2000);
    }

    // Sound effects (optional)
    playPageFlipSound() {
        // You can add actual audio files here
        // const audio = new Audio('sounds/page-flip.mp3');
        // audio.volume = 0.3;
        // audio.play().catch(() => {}); // Ignore errors if audio fails
    }

    // Utility methods
    addParallaxEffect() {
        window.addEventListener('mousemove', (e) => {
            if (!this.isBookOpen) return;
            
            const bookContainer = document.querySelector('.book-container');
            const rect = bookContainer.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = (e.clientX - centerX) / 50;
            const deltaY = (e.clientY - centerY) / 50;
            
            bookContainer.style.transform = `rotateY(${-15 + deltaX}deg) rotateX(${deltaY}deg)`;
        });
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

    // Typewriter effect for text
    typeWriter(element, text, speed = 50) {
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
    }

    // Lazy loading for images
    initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const portfolio = new PortfolioBook();
    
    // Add some additional enhancements
    portfolio.addParallaxEffect();
    portfolio.initSmoothScrolling();
    portfolio.initLazyLoading();
    
    // Global portfolio instance for debugging
    window.portfolio = portfolio;
});

// Additional utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Performance optimizations
const optimizedResize = debounce(() => {
    // Handle resize events
    if (window.portfolio) {
        window.portfolio.updateNavButtons();
    }
}, 250);

window.addEventListener('resize', optimizedResize);

// Preload critical resources
function preloadResources() {
    const criticalImages = [
        'https://placehold.co/180x180/4F46E5/FFFFFF?text=Ảnh+Của+Bạn',
        // Add other critical images here
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Call preload when script loads
preloadResources();
// Portfolio JavaScript - Clean Version with New Page Structure
class PortfolioBook {
    constructor() {
        this.currentPageIndex = 0;
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
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateNavButtons();
        this.updatePageIndicator();
        this.initSkillBars();
        this.initPortfolioHovers();
        this.initFormSubmission();
        
        // Show first page
        this.showSection(0);
    }

    bindEvents() {
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
            if (this.isAnimating) return;
            
            if (e.key === 'ArrowLeft') {
                this.previousPage();
            } else if (e.key === 'ArrowRight') {
                this.nextPage();
            }
        });
    }

    showSection(index) {
        if (this.isAnimating || index < 0 || index >= this.leftSections.length) return;
        
        this.isAnimating = true;
        
        // Hide current sections with fade out
        const currentLeftSection = document.querySelector('.left-page .content-section.active');
        const currentRightSection = document.querySelector('.right-page .content-section.active');
        
        if (currentLeftSection) {
            currentLeftSection.style.opacity = '0';
            currentLeftSection.style.transform = 'translateX(-30px)';
        }
        
        if (currentRightSection) {
            currentRightSection.style.opacity = '0';
            currentRightSection.style.transform = 'translateX(30px)';
        }
        
        setTimeout(() => {
            // Remove active class from current sections
            if (currentLeftSection) {
                currentLeftSection.classList.remove('active');
            }
            if (currentRightSection) {
                currentRightSection.classList.remove('active');
            }
            
            this.showNewSection(index);
        }, 300);
    }

    showNewSection(index) {
        // Show new left page section
        const newLeftSection = document.getElementById(this.leftSections[index]);
        
        // Show new right page section
        const newRightSection = document.getElementById(this.rightSections[index]);
        
        if (newLeftSection) {
            // Reset transform and opacity for left page
            newLeftSection.style.opacity = '0';
            newLeftSection.style.transform = 'translateX(30px)';
            newLeftSection.classList.add('active');
            
            // Animate in left page
            setTimeout(() => {
                newLeftSection.style.opacity = '1';
                newLeftSection.style.transform = 'translateX(0)';
            }, 50);
            
            // Scroll to top of new section
            newLeftSection.scrollTop = 0;
        }
        
        if (newRightSection) {
            // Reset transform and opacity for right page
            newRightSection.style.opacity = '0';
            newRightSection.style.transform = 'translateX(-30px)';
            newRightSection.classList.add('active');
            
            // Animate in right page
            setTimeout(() => {
                newRightSection.style.opacity = '1';
                newRightSection.style.transform = 'translateX(0)';
            }, 50);
            
            // Scroll to top of new section
            newRightSection.scrollTop = 0;
        }
        
        this.currentPageIndex = index;
        this.updateNavButtons();
        this.updatePageIndicator();
        
        // Trigger specific animations for certain sections
        this.triggerSectionAnimations(this.rightSections[index]);
        
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
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        // Simulate form submission
        setTimeout(() => {
            // Show success message
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Sent!';
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

    // Public method to show specific section (for external calls)
    goToSection(sectionName) {
        const leftIndex = this.leftSections.indexOf(sectionName);
        const rightIndex = this.rightSections.indexOf(sectionName);
        const index = leftIndex !== -1 ? leftIndex : rightIndex;
        
        if (index !== -1) {
            this.showSection(index);
        }
    }
}

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
    };
}

// Preload critical resources
function preloadResources() {
    const criticalImages = [
        'https://placehold.co/180x180/4F46E5/FFFFFF?text=Nam',
        'https://placehold.co/80x80/4F46E5/FFFFFF?text=Nam'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Performance optimizations
const portfolioResize = debounce(() => {
    if (window.portfolio) {
        window.portfolio.updateNavButtons();
    }
}, 250);

window.addEventListener('resize', portfolioResize);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const portfolio = new PortfolioBook();
    
    // Add remaining enhancements
    portfolio.initSmoothScrolling();
    portfolio.initLazyLoading();
    
    // Global portfolio instance for debugging
    window.portfolio = portfolio;
    
    // Call preload
    preloadResources();
});
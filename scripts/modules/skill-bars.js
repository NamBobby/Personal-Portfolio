// Animation Controller for other elements - FIXED VERSION
class AnimationController {
    constructor() {
        this.activeAnimations = new Set();
    }

    // Fade out sections - FIXED
    fadeOutSections(...selectors) {
        return new Promise((resolve) => {
            const elements = selectors.map(selector => document.querySelector(selector)).filter(Boolean);
            
            elements.forEach(element => {
                // Remove active class instead of setting inline styles
                element.classList.remove('active');
                // Add fade-out class for animation
                element.classList.add('fade-out');
            });
            
            setTimeout(resolve, 300);
        });
    }

    // Slide in animations - FIXED
    slideInFromRight(element) {
        if (!element) return;
        
        // Clear any conflicting inline styles
        element.style.opacity = '';
        element.style.transform = '';
        element.style.display = '';
        
        // Remove fade-out class if present
        element.classList.remove('fade-out');
        
        // Add slide-in class first (before active for proper animation)
        element.classList.add('slide-in-right');
        
        // Add active class to show the element
        element.classList.add('active');
        
        // Reset scroll position
        element.scrollTop = 0;
        
        // Remove animation class after animation completes
        setTimeout(() => {
            element.classList.remove('slide-in-right');
        }, 600);
    }

    slideInFromLeft(element) {
        if (!element) return;
        
        // Clear any conflicting inline styles
        element.style.opacity = '';
        element.style.transform = '';
        element.style.display = '';
        
        // Remove fade-out class if present
        element.classList.remove('fade-out');
        
        // Add slide-in class first (before active for proper animation)
        element.classList.add('slide-in-left');
        
        // Add active class to show the element
        element.classList.add('active');
        
        // Reset scroll position
        element.scrollTop = 0;
        
        // Remove animation class after animation completes
        setTimeout(() => {
            element.classList.remove('slide-in-left');
        }, 600);
    }

    // Animate skill bars (integration with SkillBarsModule)
    animateSkillBars() {
        const skillBarsModule = window.skillBarsModule;
        if (skillBarsModule) {
            skillBarsModule.animate();
        }
    }

    // Animate portfolio cards
    animatePortfolioCards() {
        const portfolioCards = document.querySelectorAll('.portfolio-card');
        portfolioCards.forEach((card, index) => {
            // Remove inline styles and use CSS classes
            card.classList.remove('animate');
            
            setTimeout(() => {
                card.classList.add('animate');
            }, index * 150);
        });
    }

    // Animate timeline
    animateTimeline() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach((item, index) => {
            // Remove inline styles and use CSS classes
            item.classList.remove('animate');
            
            setTimeout(() => {
                item.classList.add('animate');
            }, index * 200);
        });
    }

    // Animate education cards
    animateEducationCards() {
        const educationCards = document.querySelectorAll('.education-card');
        educationCards.forEach((card, index) => {
            // Remove inline styles and use CSS classes
            card.classList.remove('animate');
            
            setTimeout(() => {
                card.classList.add('animate');
            }, index * 200);
        });
    }

    // Cleanup
    cleanup() {
        this.activeAnimations.clear();
    }
}
// Skill Bars Animation Module
class SkillBarsModule {
    constructor() {
        this.skillBars = [];
        this.animationDelay = 100;
        this.animationDuration = 1500;
        this.isAnimating = false;
        this.hasAnimated = false;
        
        this.init();
    }

    init() {
        this.findSkillBars();
        this.setupIntersectionObserver();
        this.bindEvents();
        
        console.log('SkillBarsModule initialized with', this.skillBars.length, 'skill bars');
    }

    findSkillBars() {
        this.skillBars = Array.from(document.querySelectorAll('.skill-bar'));
        
        // Initialize skill bars
        this.skillBars.forEach(bar => {
            this.initializeSkillBar(bar);
        });
    }

    initializeSkillBar(bar) {
        // Store original width
        const level = bar.getAttribute('data-level') || '0';
        bar.dataset.originalLevel = level;
        
        // Reset width to 0
        bar.style.width = '0%';
        bar.style.transition = `width ${this.animationDuration}ms ease-out`;
        
        // Add skill level text if not present
        this.addSkillLevelText(bar);
    }

    addSkillLevelText(bar) {
        const level = bar.getAttribute('data-level');
        if (!level) return;

        // Check if level text already exists
        const skillCard = bar.closest('.skill-card');
        if (skillCard && !skillCard.querySelector('.skill-level-text')) {
            const levelText = document.createElement('span');
            levelText.className = 'skill-level-text';
            levelText.textContent = `${level}%`;
            levelText.style.cssText = `
                position: absolute;
                right: 0;
                top: -25px;
                font-size: 0.75rem;
                color: var(--primary-color);
                font-weight: 600;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            const skillLevel = bar.parentElement;
            if (skillLevel) {
                skillLevel.style.position = 'relative';
                skillLevel.appendChild(levelText);
            }
        }
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.3
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasAnimated) {
                    this.animate();
                }
            });
        }, options);

        // Observe the skills section
        const skillsSection = document.getElementById('section-skills');
        if (skillsSection) {
            this.observer.observe(skillsSection);
        }
    }

    bindEvents() {
        // Listen for page changes to trigger animation
        document.addEventListener('portfolioPageChanged', (e) => {
            if (e.detail && e.detail.rightSection === 'section-skills') {
                setTimeout(() => this.animate(), 500);
            }
        });

        // Listen for manual trigger
        document.addEventListener('animateSkillBars', () => {
            this.animate(true);
        });

        // Reset animation when leaving skills page
        document.addEventListener('portfolioPageChanged', (e) => {
            if (e.detail && e.detail.rightSection !== 'section-skills') {
                this.resetAnimation();
            }
        });
    }

    animate(force = false) {
        if (this.isAnimating || (this.hasAnimated && !force)) return;
        
        this.isAnimating = true;
        this.hasAnimated = true;
        
        console.log('Animating skill bars...');
        
        // Animate each skill bar with staggered timing
        this.skillBars.forEach((bar, index) => {
            setTimeout(() => {
                this.animateSkillBar(bar, index);
            }, index * this.animationDelay);
        });
        
        // Reset animation lock after all animations complete
        setTimeout(() => {
            this.isAnimating = false;
        }, this.skillBars.length * this.animationDelay + this.animationDuration);
    }

    animateSkillBar(bar, index) {
        const level = bar.dataset.originalLevel || '0';
        
        // Animate width
        bar.style.width = `${level}%`;
        
        // Animate level text
        const skillCard = bar.closest('.skill-card');
        const levelText = skillCard?.querySelector('.skill-level-text');
        
        if (levelText) {
            // Delay showing the text until bar animation is halfway
            setTimeout(() => {
                levelText.style.opacity = '1';
                this.animateCounter(levelText, 0, parseInt(level));
            }, this.animationDuration / 2);
        }
        
        // Add completion animation
        setTimeout(() => {
            this.addCompletionEffect(bar);
        }, this.animationDuration);
    }

    animateCounter(element, start, end) {
        const duration = 800;
        const stepTime = 16; // ~60fps
        const steps = duration / stepTime;
        const increment = (end - start) / steps;
        
        let current = start;
        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = `${Math.round(current)}%`;
        }, stepTime);
    }

    addCompletionEffect(bar) {
        // Add a subtle glow effect when animation completes
        bar.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.3)';
        
        setTimeout(() => {
            bar.style.boxShadow = '';
        }, 1000);
    }

    resetAnimation() {
        this.hasAnimated = false;
        this.isAnimating = false;
        
        this.skillBars.forEach(bar => {
            bar.style.width = '0%';
            
            // Reset level text
            const skillCard = bar.closest('.skill-card');
            const levelText = skillCard?.querySelector('.skill-level-text');
            if (levelText) {
                levelText.style.opacity = '0';
                levelText.textContent = '0%';
            }
        });
    }

    // Add new skill bar dynamically
    addSkillBar(container, skillData) {
        const { name, level, icon, category } = skillData;
        
        const skillCard = document.createElement('div');
        skillCard.className = 'skill-card';
        skillCard.innerHTML = `
            ${icon ? `<i class="${icon}"></i>` : ''}
            <span>${name}</span>
            <div class="skill-level">
                <div class="skill-bar" data-level="${level}"></div>
            </div>
        `;
        
        container.appendChild(skillCard);
        
        // Initialize the new skill bar
        const newBar = skillCard.querySelector('.skill-bar');
        this.initializeSkillBar(newBar);
        this.skillBars.push(newBar);
        
        return skillCard;
    }

    // Update skill level
    updateSkillLevel(skillName, newLevel) {
        const skillCard = Array.from(document.querySelectorAll('.skill-card'))
            .find(card => card.querySelector('span')?.textContent === skillName);
        
        if (skillCard) {
            const bar = skillCard.querySelector('.skill-bar');
            const levelText = skillCard.querySelector('.skill-level-text');
            
            if (bar) {
                bar.dataset.originalLevel = newLevel;
                bar.style.width = `${newLevel}%`;
                
                if (levelText) {
                    levelText.textContent = `${newLevel}%`;
                }
            }
        }
    }

    // Animate specific skill category
    animateCategory(categoryName) {
        const categoryElement = document.querySelector(`[data-category="${categoryName}"]`);
        if (!categoryElement) return;
        
        const categoryBars = categoryElement.querySelectorAll('.skill-bar');
        
        categoryBars.forEach((bar, index) => {
            setTimeout(() => {
                this.animateSkillBar(bar, index);
            }, index * this.animationDelay);
        });
    }

    // Get skill data
    getSkillData() {
        return this.skillBars.map(bar => {
            const skillCard = bar.closest('.skill-card');
            const nameElement = skillCard?.querySelector('span');
            const iconElement = skillCard?.querySelector('i');
            
            return {
                name: nameElement?.textContent || '',
                level: parseInt(bar.dataset.originalLevel || '0'),
                icon: iconElement?.className || '',
                animated: bar.style.width !== '0%'
            };
        });
    }

    // Performance monitoring
    measurePerformance() {
        const startTime = performance.now();
        
        return new Promise((resolve) => {
            this.animate(true);
            
            setTimeout(() => {
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                resolve({
                    duration,
                    skillCount: this.skillBars.length,
                    averageTimePerSkill: duration / this.skillBars.length
                });
            }, this.skillBars.length * this.animationDelay + this.animationDuration);
        });
    }

    // Accessibility features
    enableReducedMotion() {
        this.animationDuration = 150;
        this.animationDelay = 10;
        
        this.skillBars.forEach(bar => {
            bar.style.transition = `width ${this.animationDuration}ms ease-out`;
        });
    }

    // Export skill data
    exportSkillData() {
        const data = this.getSkillData();
        const dataStr = JSON.stringify(data, null, 2);
        
        // Create download link
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'skills-data.json';
        link.click();
        
        URL.revokeObjectURL(url);
    }

    // Import skill data
    importSkillData(data) {
        try {
            const skillsData = typeof data === 'string' ? JSON.parse(data) : data;
            
            skillsData.forEach(skill => {
                this.updateSkillLevel(skill.name, skill.level);
            });
            
            return true;
        } catch (error) {
            console.error('Failed to import skill data:', error);
            return false;
        }
    }

    // Cleanup
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        
        // Remove event listeners
        document.removeEventListener('portfolioPageChanged', this.pageChangeHandler);
        document.removeEventListener('animateSkillBars', this.manualTriggerHandler);
        
        // Reset all skill bars
        this.resetAnimation();
        
        console.log('SkillBarsModule destroyed');
    }
}

// Animation Controller for other elements
class AnimationController {
    constructor() {
        this.activeAnimations = new Set();
    }

    // Fade out sections
    fadeOutSections(...selectors) {
        return new Promise((resolve) => {
            const elements = selectors.map(selector => document.querySelector(selector)).filter(Boolean);
            
            elements.forEach(element => {
                element.style.opacity = '0';
                element.style.transform = 'translateX(-30px)';
            });
            
            setTimeout(resolve, 300);
        });
    }

    // Slide in animations
    slideInFromRight(element) {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.transform = 'translateX(30px)';
        element.classList.add('active');
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateX(0)';
        }, 50);
    }

    slideInFromLeft(element) {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.transform = 'translateX(-30px)';
        element.classList.add('active');
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateX(0)';
        }, 50);
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
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
                card.classList.add('animate');
            }, index * 150);
        });
    }

    // Animate timeline
    animateTimeline() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-30px)';
            
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
                item.classList.add('animate');
            }, index * 200);
        });
    }

    // Animate education cards
    animateEducationCards() {
        const educationCards = document.querySelectorAll('.education-card');
        educationCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
                card.classList.add('animate');
            }, index * 200);
        });
    }

    // Cleanup
    cleanup() {
        this.activeAnimations.clear();
    }
}

// Make available globally
window.SkillBarsModule = SkillBarsModule;
window.AnimationController = AnimationController;
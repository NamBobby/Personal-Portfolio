// Advanced Animation Module
class AnimationsModule {
    constructor() {
        this.activeAnimations = new Map();
        this.animationQueue = [];
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.intersectionObserver = null;
        this.animationId = 0;
        
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.bindEvents();
        this.setupReducedMotionListener();
        
        console.log('AnimationsModule initialized');
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: [0.1, 0.3, 0.5, 0.7, 0.9]
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.handleElementVisible(entry.target, entry.intersectionRatio);
                } else {
                    this.handleElementHidden(entry.target);
                }
            });
        }, options);

        // Observe elements with animation attributes
        this.observeAnimatableElements();
    }

    observeAnimatableElements() {
        const animatableElements = document.querySelectorAll([
            '[data-animate]',
            '.animate-on-scroll',
            '.skill-card',
            '.portfolio-card',
            '.timeline-item',
            '.education-card',
            '.contact-item'
        ].join(', '));

        animatableElements.forEach(element => {
            this.intersectionObserver.observe(element);
        });
    }

    bindEvents() {
        // Listen for page changes
        document.addEventListener('portfolioPageChanged', (e) => {
            this.handlePageChange(e.detail);
        });

        // Listen for manual animation triggers
        document.addEventListener('triggerAnimation', (e) => {
            this.triggerAnimation(e.detail.target, e.detail.animation);
        });

        // Listen for component loaded events
        document.addEventListener('componentLoaded', () => {
            setTimeout(() => {
                this.observeAnimatableElements();
            }, 100);
        });
    }

    setupReducedMotionListener() {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        mediaQuery.addEventListener('change', (e) => {
            this.isReducedMotion = e.matches;
            
            if (this.isReducedMotion) {
                this.disableAllAnimations();
            }
        });
    }

    handleElementVisible(element, ratio) {
        if (this.isReducedMotion) return;

        const animationType = element.dataset.animate || this.getDefaultAnimation(element);
        const delay = parseInt(element.dataset.animateDelay || '0');
        const duration = parseInt(element.dataset.animateDuration || '600');

        if (ratio >= 0.3 && !element.classList.contains('animated')) {
            setTimeout(() => {
                this.animateElement(element, animationType, duration);
            }, delay);
        }
    }

    handleElementHidden(element) {
        // Optional: Reset animations when element goes out of view
        if (element.dataset.animateRepeat === 'true') {
            element.classList.remove('animated', 'animate');
        }
    }

    getDefaultAnimation(element) {
        if (element.classList.contains('skill-card')) return 'fadeInUp';
        if (element.classList.contains('portfolio-card')) return 'fadeInUp';
        if (element.classList.contains('timeline-item')) return 'slideInLeft';
        if (element.classList.contains('education-card')) return 'zoomIn';
        if (element.classList.contains('contact-item')) return 'slideInRight';
        
        return 'fadeIn';
    }

    animateElement(element, animationType, duration = 600) {
        if (this.isReducedMotion) {
            element.classList.add('animated');
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            const animationId = this.generateAnimationId();
            
            // Store animation reference
            this.activeAnimations.set(animationId, {
                element,
                type: animationType,
                duration,
                startTime: performance.now()
            });

            // Apply animation
            element.style.animationDuration = `${duration}ms`;
            element.classList.add('animate', animationType, 'animated');

            // Clean up after animation
            setTimeout(() => {
                element.classList.remove('animate', animationType);
                this.activeAnimations.delete(animationId);
                resolve();
            }, duration);
        });
    }

    // Predefined Animation Methods
    fadeIn(element, duration = 600) {
        return this.animateElement(element, 'fade-in', duration);
    }

    fadeOut(element, duration = 600) {
        return this.animateElement(element, 'fade-out', duration);
    }

    slideInLeft(element, duration = 600) {
        return this.animateElement(element, 'slide-in-left', duration);
    }

    slideInRight(element, duration = 600) {
        return this.animateElement(element, 'slide-in-right', duration);
    }

    slideInUp(element, duration = 600) {
        return this.animateElement(element, 'slide-up', duration);
    }

    slideInDown(element, duration = 600) {
        return this.animateElement(element, 'slide-down', duration);
    }

    zoomIn(element, duration = 600) {
        return this.animateElement(element, 'zoom-in', duration);
    }

    zoomOut(element, duration = 600) {
        return this.animateElement(element, 'zoom-out', duration);
    }

    bounceIn(element, duration = 800) {
        return this.animateElement(element, 'bounce-in', duration);
    }

    shake(element, duration = 500) {
        return this.animateElement(element, 'shake', duration);
    }

    pulse(element, duration = 1000) {
        return this.animateElement(element, 'pulse', duration);
    }

    glow(element, duration = 2000) {
        return this.animateElement(element, 'glow', duration);
    }

    // Complex Animation Sequences
    async staggeredFadeIn(elements, delay = 100) {
        if (this.isReducedMotion) {
            elements.forEach(el => el.classList.add('animated'));
            return;
        }

        const animations = [];
        
        elements.forEach((element, index) => {
            const animationPromise = new Promise(resolve => {
                setTimeout(() => {
                    this.fadeIn(element).then(resolve);
                }, index * delay);
            });
            
            animations.push(animationPromise);
        });

        return Promise.all(animations);
    }

    async cascadeAnimation(elements, animationType = 'fadeInUp', delay = 150) {
        if (this.isReducedMotion) {
            elements.forEach(el => el.classList.add('animated'));
            return;
        }

        for (let i = 0; i < elements.length; i++) {
            await new Promise(resolve => {
                setTimeout(() => {
                    this.animateElement(elements[i], animationType).then(resolve);
                }, i * delay);
            });
        }
    }

    // Page-specific Animations
    handlePageChange(pageData) {
        if (this.isReducedMotion) return;

        const { rightSection } = pageData;

        switch (rightSection) {
            case 'section-skills':
                this.animateSkillsPage();
                break;
            case 'section-portfolio':
                this.animatePortfolioPage();
                break;
            case 'section-experience':
                this.animateExperiencePage();
                break;
            case 'section-education':
                this.animateEducationPage();
                break;
            case 'section-contact':
                this.animateContactPage();
                break;
        }
    }

    animateSkillsPage() {
        const skillCards = document.querySelectorAll('.skill-card:not(.animated)');
        this.staggeredFadeIn(Array.from(skillCards), 100);

        // Animate skill bars after cards
        setTimeout(() => {
            if (window.skillBarsModule) {
                window.skillBarsModule.animate();
            }
        }, 500);
    }

    animatePortfolioPage() {
        const portfolioCards = document.querySelectorAll('.portfolio-card:not(.animated)');
        this.cascadeAnimation(Array.from(portfolioCards), 'fadeInUp', 150);
    }

    animateExperiencePage() {
        const timelineItems = document.querySelectorAll('.timeline-item:not(.animated)');
        this.cascadeAnimation(Array.from(timelineItems), 'slideInLeft', 200);
    }

    animateEducationPage() {
        const educationCards = document.querySelectorAll('.education-card:not(.animated)');
        this.cascadeAnimation(Array.from(educationCards), 'zoomIn', 200);
    }

    animateContactPage() {
        const contactItems = document.querySelectorAll('.contact-item:not(.animated)');
        this.staggeredFadeIn(Array.from(contactItems), 100);

        // Animate form elements
        setTimeout(() => {
            const formGroups = document.querySelectorAll('.form-group:not(.animated)');
            this.cascadeAnimation(Array.from(formGroups), 'slideInRight', 100);
        }, 300);
    }

    // Advanced Animation Effects
    typewriterEffect(element, text, speed = 50) {
        if (this.isReducedMotion) {
            element.textContent = text;
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            element.textContent = '';
            let index = 0;

            const timer = setInterval(() => {
                if (index < text.length) {
                    element.textContent += text.charAt(index);
                    index++;
                } else {
                    clearInterval(timer);
                    resolve();
                }
            }, speed);
        });
    }

    countUpAnimation(element, start, end, duration = 2000) {
        if (this.isReducedMotion) {
            element.textContent = end;
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            const startTime = performance.now();
            const startValue = parseInt(start);
            const endValue = parseInt(end);
            const difference = endValue - startValue;

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function (easeOutCubic)
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                
                const currentValue = Math.round(startValue + (difference * easeProgress));
                element.textContent = currentValue;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }

    progressBarAnimation(progressBar, targetWidth, duration = 1500) {
        if (this.isReducedMotion) {
            progressBar.style.width = targetWidth;
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            progressBar.style.width = '0%';
            progressBar.style.transition = `width ${duration}ms ease-out`;
            
            setTimeout(() => {
                progressBar.style.width = targetWidth;
            }, 50);

            setTimeout(resolve, duration);
        });
    }

    // Particle Animation System
    createParticleEffect(container, options = {}) {
        if (this.isReducedMotion) return;

        const defaultOptions = {
            count: 20,
            colors: ['#3b82f6', '#60a5fa', '#93c5fd'],
            size: { min: 2, max: 6 },
            speed: { min: 1, max: 3 },
            lifetime: 3000
        };

        const config = { ...defaultOptions, ...options };
        const particles = [];

        for (let i = 0; i < config.count; i++) {
            const particle = this.createParticle(container, config);
            particles.push(particle);
        }

        // Clean up particles after lifetime
        setTimeout(() => {
            particles.forEach(particle => {
                if (particle.parentElement) {
                    particle.parentElement.removeChild(particle);
                }
            });
        }, config.lifetime);
    }

    createParticle(container, config) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${this.randomBetween(config.size.min, config.size.max)}px;
            height: ${this.randomBetween(config.size.min, config.size.max)}px;
            background: ${config.colors[Math.floor(Math.random() * config.colors.length)]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
        `;

        const containerRect = container.getBoundingClientRect();
        const startX = Math.random() * containerRect.width;
        const startY = Math.random() * containerRect.height;
        
        particle.style.left = startX + 'px';
        particle.style.top = startY + 'px';

        container.appendChild(particle);

        // Animate particle
        this.animateParticle(particle, config);

        return particle;
    }

    animateParticle(particle, config) {
        const speed = this.randomBetween(config.speed.min, config.speed.max);
        const angle = Math.random() * Math.PI * 2;
        const distance = speed * 100;

        const endX = parseFloat(particle.style.left) + Math.cos(angle) * distance;
        const endY = parseFloat(particle.style.top) + Math.sin(angle) * distance;

        particle.style.transition = `all ${config.lifetime}ms ease-out`;
        particle.style.transform = `translate(${endX - parseFloat(particle.style.left)}px, ${endY - parseFloat(particle.style.top)}px)`;
        particle.style.opacity = '0';
    }

    // Animation Control Methods
    pauseAnimation(animationId) {
        const animation = this.activeAnimations.get(animationId);
        if (animation) {
            animation.element.style.animationPlayState = 'paused';
        }
    }

    resumeAnimation(animationId) {
        const animation = this.activeAnimations.get(animationId);
        if (animation) {
            animation.element.style.animationPlayState = 'running';
        }
    }

    stopAnimation(animationId) {
        const animation = this.activeAnimations.get(animationId);
        if (animation) {
            animation.element.classList.remove('animate', animation.type);
            this.activeAnimations.delete(animationId);
        }
    }

    stopAllAnimations() {
        this.activeAnimations.forEach((animation, id) => {
            this.stopAnimation(id);
        });
    }

    disableAllAnimations() {
        // Add class to disable animations
        document.documentElement.classList.add('no-animations');
        
        // Stop all active animations
        this.stopAllAnimations();
        
        // Mark all elements as animated to prevent future animations
        document.querySelectorAll('[data-animate], .animate-on-scroll').forEach(element => {
            element.classList.add('animated');
        });
    }

    enableAllAnimations() {
        document.documentElement.classList.remove('no-animations');
        this.isReducedMotion = false;
    }

    // Performance Monitoring
    getAnimationPerformance() {
        const animations = Array.from(this.activeAnimations.values());
        const now = performance.now();
        
        return {
            activeCount: animations.length,
            averageDuration: animations.reduce((sum, anim) => {
                return sum + (now - anim.startTime);
            }, 0) / animations.length || 0,
            totalMemoryUsage: animations.length * 1024, // Rough estimate
            frameRate: this.calculateFrameRate()
        };
    }

    calculateFrameRate() {
        // Simple frame rate calculation
        if (!this.frameRateData) {
            this.frameRateData = {
                frames: 0,
                lastTime: performance.now()
            };
        }

        this.frameRateData.frames++;
        const currentTime = performance.now();
        const deltaTime = currentTime - this.frameRateData.lastTime;

        if (deltaTime >= 1000) {
            const fps = (this.frameRateData.frames * 1000) / deltaTime;
            this.frameRateData = {
                frames: 0,
                lastTime: currentTime
            };
            return Math.round(fps);
        }

        return null;
    }

    // Utility Methods
    generateAnimationId() {
        return `anim_${++this.animationId}_${Date.now()}`;
    }

    randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    easeOut(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    easeIn(t) {
        return t * t * t;
    }

    // Animation Presets
    getAnimationPreset(name) {
        const presets = {
            subtle: {
                duration: 300,
                easing: 'ease-out',
                delay: 0
            },
            normal: {
                duration: 600,
                easing: 'ease',
                delay: 0
            },
            dramatic: {
                duration: 1000,
                easing: 'ease-in-out',
                delay: 100
            },
            playful: {
                duration: 800,
                easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                delay: 0
            }
        };

        return presets[name] || presets.normal;
    }

    // Trigger custom animations
    triggerAnimation(target, animationName, options = {}) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element) return;

        const preset = this.getAnimationPreset(options.preset || 'normal');
        const duration = options.duration || preset.duration;
        const delay = options.delay || preset.delay;

        setTimeout(() => {
            this.animateElement(element, animationName, duration);
        }, delay);
    }

    // Scroll-triggered animations
    setupScrollAnimations() {
        const elements = document.querySelectorAll('[data-scroll-animate]');
        
        elements.forEach(element => {
            const animationType = element.dataset.scrollAnimate;
            const threshold = parseFloat(element.dataset.scrollThreshold || '0.3');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
                        this.animateElement(element, animationType);
                        observer.unobserve(element);
                    }
                });
            }, { threshold });
            
            observer.observe(element);
        });
    }

    // Mouse tracking animations
    setupMouseAnimations() {
        const elements = document.querySelectorAll('[data-mouse-animate]');
        
        elements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                const animation = element.dataset.mouseAnimate;
                this.animateElement(element, animation);
            });
            
            element.addEventListener('mouseleave', () => {
                const animation = element.dataset.mouseAnimateLeave || 'fadeIn';
                this.animateElement(element, animation);
            });
        });
    }

    // Cleanup methods
    cleanup() {
        // Stop all animations
        this.stopAllAnimations();
        
        // Disconnect observers
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        // Clear animation queue
        this.animationQueue = [];
        
        // Remove event listeners
        document.removeEventListener('portfolioPageChanged', this.handlePageChange);
        document.removeEventListener('triggerAnimation', this.triggerAnimation);
        
        console.log('AnimationsModule cleaned up');
    }

    // Debug methods
    debug() {
        return {
            activeAnimations: this.activeAnimations.size,
            isReducedMotion: this.isReducedMotion,
            queuedAnimations: this.animationQueue.length,
            performance: this.getAnimationPerformance()
        };
    }

    // Export animation data
    exportAnimationData() {
        const data = {
            timestamp: Date.now(),
            activeAnimations: Array.from(this.activeAnimations.entries()),
            performance: this.getAnimationPerformance(),
            settings: {
                isReducedMotion: this.isReducedMotion
            }
        };
        
        return JSON.stringify(data, null, 2);
    }
}

// Animation Helper Functions
class AnimationHelpers {
    static createRippleEffect(element, event) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    static createShakeEffect(element) {
        element.style.animation = 'shake 0.5s ease-in-out';
        
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }

    static createGlowEffect(element, color = '#3b82f6') {
        element.style.boxShadow = `0 0 20px ${color}`;
        element.style.transition = 'box-shadow 0.3s ease';
        
        setTimeout(() => {
            element.style.boxShadow = '';
        }, 1000);
    }

    static createFloatEffect(element) {
        element.style.animation = 'float 3s ease-in-out infinite';
    }

    static removeFloatEffect(element) {
        element.style.animation = '';
    }
}

// CSS Animation Classes Builder
class AnimationClassBuilder {
    static buildFadeIn(duration = 600) {
        return `
            @keyframes fadeIn-${duration} {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .fade-in-${duration} {
                animation: fadeIn-${duration} ${duration}ms ease-out;
            }
        `;
    }

    static buildSlideIn(direction = 'left', duration = 600, distance = '30px') {
        const translateFrom = {
            left: `translateX(-${distance})`,
            right: `translateX(${distance})`,
            up: `translateY(-${distance})`,
            down: `translateY(${distance})`
        };

        return `
            @keyframes slideIn${direction.charAt(0).toUpperCase() + direction.slice(1)}-${duration} {
                from { 
                    opacity: 0; 
                    transform: ${translateFrom[direction]}; 
                }
                to { 
                    opacity: 1; 
                    transform: translate(0); 
                }
            }
            .slide-in-${direction}-${duration} {
                animation: slideIn${direction.charAt(0).toUpperCase() + direction.slice(1)}-${duration} ${duration}ms ease-out;
            }
        `;
    }

    static injectAnimationCSS(css) {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
        return style;
    }
}

// Make available globally
window.AnimationsModule = AnimationsModule;
window.AnimationHelpers = AnimationHelpers;
window.AnimationClassBuilder = AnimationClassBuilder;
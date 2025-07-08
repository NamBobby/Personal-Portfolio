// Utility Helper Functions
class PortfolioHelpers {
    /**
     * Debounce function - limits the rate at which a function can fire
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @param {boolean} immediate - Trigger on leading edge instead of trailing
     */
    static debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    }

    /**
     * Throttle function - ensures a function is only called once per specified time period
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     */
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} - Cloned object
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== "object") {
            return obj;
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }
        
        if (typeof obj === "object") {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }

    /**
     * Check if element is in viewport
     * @param {HTMLElement} element - Element to check
     * @param {number} threshold - Threshold percentage (0-1)
     * @returns {boolean} - True if element is in viewport
     */
    static isInViewport(element, threshold = 0) {
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        const vertInView = (rect.top <= windowHeight * (1 - threshold)) && 
                          ((rect.top + rect.height) >= windowHeight * threshold);
        const horInView = (rect.left <= windowWidth * (1 - threshold)) && 
                         ((rect.left + rect.width) >= windowWidth * threshold);
        
        return vertInView && horInView;
    }

    /**
     * Smooth scroll to element
     * @param {HTMLElement|string} target - Element or selector to scroll to
     * @param {Object} options - Scroll options
     */
    static smoothScrollTo(target, options = {}) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element) return;

        const defaultOptions = {
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
        };

        element.scrollIntoView({ ...defaultOptions, ...options });
    }

    /**
     * Get CSS custom property value
     * @param {string} property - CSS property name (without --)
     * @param {HTMLElement} element - Element to get property from (defaults to :root)
     * @returns {string} - Property value
     */
    static getCSSProperty(property, element = document.documentElement) {
        return getComputedStyle(element).getPropertyValue(`--${property}`).trim();
    }

    /**
     * Set CSS custom property value
     * @param {string} property - CSS property name (without --)
     * @param {string} value - Property value
     * @param {HTMLElement} element - Element to set property on (defaults to :root)
     */
    static setCSSProperty(property, value, element = document.documentElement) {
        element.style.setProperty(`--${property}`, value);
    }

    /**
     * Format date for display
     * @param {Date|string} date - Date to format
     * @param {Object} options - Formatting options
     * @returns {string} - Formatted date
     */
    static formatDate(date, options = {}) {
        const dateObj = date instanceof Date ? date : new Date(date);
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        return new Intl.DateTimeFormat('vi-VN', { ...defaultOptions, ...options }).format(dateObj);
    }

    /**
     * Generate unique ID
     * @param {string} prefix - Optional prefix for ID
     * @returns {string} - Unique ID
     */
    static generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Capitalize first letter of string
     * @param {string} str - String to capitalize
     * @returns {string} - Capitalized string
     */
    static capitalize(str) {
        if (!str || typeof str !== 'string') return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Convert string to kebab-case
     * @param {string} str - String to convert
     * @returns {string} - Kebab-case string
     */
    static toKebabCase(str) {
        if (!str || typeof str !== 'string') return '';
        return str
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/\s+/g, '-')
            .toLowerCase();
    }

    /**
     * Convert string to camelCase
     * @param {string} str - String to convert
     * @returns {string} - CamelCase string
     */
    static toCamelCase(str) {
        if (!str || typeof str !== 'string') return '';
        return str
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
                return index === 0 ? word.toLowerCase() : word.toUpperCase();
            })
            .replace(/\s+/g, '');
    }

    /**
     * Check if device is mobile
     * @returns {boolean} - True if mobile device
     */
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Check if device is touch device
     * @returns {boolean} - True if touch device
     */
    static isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    /**
     * Get browser info
     * @returns {Object} - Browser information
     */
    static getBrowserInfo() {
        const ua = navigator.userAgent;
        const browsers = {
            chrome: /Chrome/.test(ua) && /Google Inc/.test(navigator.vendor),
            firefox: /Firefox/.test(ua),
            safari: /Safari/.test(ua) && /Apple Computer/.test(navigator.vendor),
            edge: /Edg/.test(ua),
            ie: /Trident/.test(ua)
        };

        const browser = Object.keys(browsers).find(key => browsers[key]) || 'unknown';
        
        return {
            name: browser,
            version: this.getBrowserVersion(ua, browser),
            userAgent: ua
        };
    }

    static getBrowserVersion(ua, browser) {
        let version = 'unknown';
        
        switch (browser) {
            case 'chrome':
                version = ua.match(/Chrome\/(\d+)/)?.[1];
                break;
            case 'firefox':
                version = ua.match(/Firefox\/(\d+)/)?.[1];
                break;
            case 'safari':
                version = ua.match(/Version\/(\d+)/)?.[1];
                break;
            case 'edge':
                version = ua.match(/Edg\/(\d+)/)?.[1];
                break;
        }
        
        return version || 'unknown';
    }

    /**
     * Local storage with error handling
     */
    static storage = {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.warn('Failed to save to localStorage:', error);
                return false;
            }
        },

        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.warn('Failed to read from localStorage:', error);
                return defaultValue;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.warn('Failed to remove from localStorage:', error);
                return false;
            }
        },

        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.warn('Failed to clear localStorage:', error);
                return false;
            }
        }
    };

    /**
     * Cookie utilities
     */
    static cookies = {
        set(name, value, days = 7) {
            const expires = new Date();
            expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
            document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
        },

        get(name) {
            const nameEQ = name + "=";
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        },

        remove(name) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
    };

    /**
     * URL utilities
     */
    static url = {
        getParams() {
            return new URLSearchParams(window.location.search);
        },

        getParam(key) {
            return this.getParams().get(key);
        },

        setParam(key, value) {
            const url = new URL(window.location);
            url.searchParams.set(key, value);
            window.history.pushState({}, '', url);
        },

        removeParam(key) {
            const url = new URL(window.location);
            url.searchParams.delete(key);
            window.history.pushState({}, '', url);
        }
    };

    /**
     * Animation frame utilities
     */
    static animation = {
        raf(callback) {
            return requestAnimationFrame(callback);
        },

        cancelRaf(id) {
            cancelAnimationFrame(id);
        },

        nextFrame(callback) {
            return requestAnimationFrame(() => {
                requestAnimationFrame(callback);
            });
        }
    };

    /**
     * Math utilities
     */
    static math = {
        clamp(value, min, max) {
            return Math.min(Math.max(value, min), max);
        },

        lerp(start, end, factor) {
            return start + (end - start) * factor;
        },

        map(value, inMin, inMax, outMin, outMax) {
            return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
        },

        random(min = 0, max = 1) {
            return Math.random() * (max - min) + min;
        },

        randomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    };

    /**
     * Performance utilities
     */
    static performance = {
        mark(name) {
            if ('performance' in window) {
                performance.mark(name);
            }
        },

        measure(name, startMark, endMark) {
            if ('performance' in window) {
                performance.measure(name, startMark, endMark);
                const measure = performance.getEntriesByName(name)[0];
                return measure ? measure.duration : null;
            }
            return null;
        },

        now() {
            return performance.now ? performance.now() : Date.now();
        }
    };
}

// Make available globally
window.PortfolioHelpers = PortfolioHelpers;

// Common utility functions for backwards compatibility
window.debounce = PortfolioHelpers.debounce;
window.throttle = PortfolioHelpers.throttle;
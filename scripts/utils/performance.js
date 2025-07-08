// Performance Monitoring and Optimization Utilities
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.observers = new Map();
        this.isMonitoring = false;
        this.config = {
            enableConsoleLogging: false,
            enableRealTimeMetrics: false,
            sampleRate: 0.1, // 10% sampling for production
            metricsBufferSize: 100
        };
        
        this.init();
    }

    init() {
        this.setupPerformanceObservers();
        this.startMonitoring();
        
        console.log('PerformanceMonitor initialized');
    }

    setupPerformanceObservers() {
        // Performance Observer for various metrics
        if ('PerformanceObserver' in window) {
            // Navigation timing
            this.setupNavigationObserver();
            
            // Resource timing
            this.setupResourceObserver();
            
            // Paint timing
            this.setupPaintObserver();
            
            // Layout shift
            this.setupLayoutShiftObserver();
            
            // Long tasks
            this.setupLongTaskObserver();
        }

        // Memory monitoring
        this.setupMemoryMonitoring();
        
        // Frame rate monitoring
        this.setupFrameRateMonitoring();
    }

    setupNavigationObserver() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.recordMetric('navigation', {
                        type: 'navigation',
                        name: entry.name,
                        duration: entry.duration,
                        startTime: entry.startTime,
                        domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
                        loadComplete: entry.loadEventEnd - entry.loadEventStart,
                        timestamp: Date.now()
                    });
                });
            });
            
            observer.observe({ entryTypes: ['navigation'] });
            this.observers.set('navigation', observer);
        } catch (error) {
            console.warn('Navigation observer not supported:', error);
        }
    }

    setupResourceObserver() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    // Only monitor important resources
                    if (this.isImportantResource(entry.name)) {
                        this.recordMetric('resource', {
                            type: 'resource',
                            name: entry.name,
                            duration: entry.duration,
                            size: entry.transferSize || entry.decodedBodySize,
                            initiatorType: entry.initiatorType,
                            timestamp: Date.now()
                        });
                    }
                });
            });
            
            observer.observe({ entryTypes: ['resource'] });
            this.observers.set('resource', observer);
        } catch (error) {
            console.warn('Resource observer not supported:', error);
        }
    }

    setupPaintObserver() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.recordMetric('paint', {
                        type: 'paint',
                        name: entry.name,
                        startTime: entry.startTime,
                        timestamp: Date.now()
                    });
                });
            });
            
            observer.observe({ entryTypes: ['paint'] });
            this.observers.set('paint', observer);
        } catch (error) {
            console.warn('Paint observer not supported:', error);
        }
    }

    setupLayoutShiftObserver() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                let cumulativeLayoutShift = 0;
                
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        cumulativeLayoutShift += entry.value;
                    }
                });
                
                this.recordMetric('layoutShift', {
                    type: 'layoutShift',
                    value: cumulativeLayoutShift,
                    timestamp: Date.now()
                });
            });
            
            observer.observe({ entryTypes: ['layout-shift'] });
            this.observers.set('layoutShift', observer);
        } catch (error) {
            console.warn('Layout shift observer not supported:', error);
        }
    }

    setupLongTaskObserver() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.recordMetric('longTask', {
                        type: 'longTask',
                        duration: entry.duration,
                        startTime: entry.startTime,
                        timestamp: Date.now()
                    });
                });
            });
            
            observer.observe({ entryTypes: ['longtask'] });
            this.observers.set('longTask', observer);
        } catch (error) {
            console.warn('Long task observer not supported:', error);
        }
    }

    setupMemoryMonitoring() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                this.recordMetric('memory', {
                    type: 'memory',
                    used: memory.usedJSHeapSize,
                    total: memory.totalJSHeapSize,
                    limit: memory.jsHeapSizeLimit,
                    timestamp: Date.now()
                });
            }, 5000); // Every 5 seconds
        }
    }

    setupFrameRateMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const measureFrameRate = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                this.recordMetric('frameRate', {
                    type: 'frameRate',
                    fps: fps,
                    timestamp: Date.now()
                });
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            if (this.isMonitoring) {
                requestAnimationFrame(measureFrameRate);
            }
        };
        
        requestAnimationFrame(measureFrameRate);
    }

    // Core Methods
    startMonitoring() {
        this.isMonitoring = true;
        this.recordMetric('monitor', {
            type: 'monitor',
            action: 'start',
            timestamp: Date.now()
        });
    }

    stopMonitoring() {
        this.isMonitoring = false;
        
        // Disconnect all observers
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        
        this.recordMetric('monitor', {
            type: 'monitor',
            action: 'stop',
            timestamp: Date.now()
        });
    }

    recordMetric(category, data) {
        if (!this.metrics.has(category)) {
            this.metrics.set(category, []);
        }
        
        const categoryMetrics = this.metrics.get(category);
        categoryMetrics.push(data);
        
        // Keep buffer size manageable
        if (categoryMetrics.length > this.config.metricsBufferSize) {
            categoryMetrics.shift();
        }
        
        if (this.config.enableConsoleLogging) {
            console.log(`Performance [${category}]:`, data);
        }
        
        // Emit event for real-time monitoring
        if (this.config.enableRealTimeMetrics) {
            document.dispatchEvent(new CustomEvent('performanceMetric', {
                detail: { category, data }
            }));
        }
    }

    // Analysis Methods
    getMetricsSummary() {
        const summary = {};
        
        this.metrics.forEach((metrics, category) => {
            summary[category] = {
                count: metrics.length,
                latest: metrics[metrics.length - 1],
                average: this.calculateAverage(metrics),
                min: this.calculateMin(metrics),
                max: this.calculateMax(metrics)
            };
        });
        
        return summary;
    }

    getPerformanceScore() {
        const scores = {
            navigation: this.calculateNavigationScore(),
            resources: this.calculateResourceScore(),
            frameRate: this.calculateFrameRateScore(),
            memory: this.calculateMemoryScore(),
            layoutShift: this.calculateLayoutShiftScore()
        };
        
        const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;
        
        return {
            overall: Math.round(overallScore),
            breakdown: scores,
            rating: this.getPerformanceRating(overallScore)
        };
    }

    getBottlenecks() {
        const bottlenecks = [];
        
        // Check long tasks
        const longTasks = this.metrics.get('longTask') || [];
        if (longTasks.length > 0) {
            const avgDuration = this.calculateAverage(longTasks, 'duration');
            if (avgDuration > 50) {
                bottlenecks.push({
                    type: 'longTask',
                    severity: avgDuration > 100 ? 'high' : 'medium',
                    description: `Average long task duration: ${avgDuration.toFixed(2)}ms`,
                    recommendation: 'Consider breaking up long-running JavaScript tasks'
                });
            }
        }
        
        // Check memory usage
        const memoryMetrics = this.metrics.get('memory') || [];
        if (memoryMetrics.length > 0) {
            const latest = memoryMetrics[memoryMetrics.length - 1];
            const memoryUsagePercent = (latest.used / latest.limit) * 100;
            
            if (memoryUsagePercent > 80) {
                bottlenecks.push({
                    type: 'memory',
                    severity: 'high',
                    description: `Memory usage: ${memoryUsagePercent.toFixed(1)}%`,
                    recommendation: 'Consider optimizing memory usage or implementing cleanup'
                });
            }
        }
        
        // Check frame rate
        const frameRateMetrics = this.metrics.get('frameRate') || [];
        if (frameRateMetrics.length > 0) {
            const avgFPS = this.calculateAverage(frameRateMetrics, 'fps');
            if (avgFPS < 30) {
                bottlenecks.push({
                    type: 'frameRate',
                    severity: avgFPS < 20 ? 'high' : 'medium',
                    description: `Average FPS: ${avgFPS.toFixed(1)}`,
                    recommendation: 'Consider optimizing animations and reducing DOM manipulation'
                });
            }
        }
        
        return bottlenecks;
    }

    // Optimization Suggestions
    getOptimizationSuggestions() {
        const suggestions = [];
        const summary = this.getMetricsSummary();
        
        // Resource optimization
        if (summary.resource) {
            const largeResources = (this.metrics.get('resource') || [])
                .filter(r => r.size > 100000) // > 100KB
                .sort((a, b) => b.size - a.size);
                
            if (largeResources.length > 0) {
                suggestions.push({
                    type: 'resource',
                    priority: 'high',
                    description: `${largeResources.length} large resources detected`,
                    details: largeResources.slice(0, 5).map(r => ({
                        name: r.name,
                        size: this.formatBytes(r.size),
                        type: r.initiatorType
                    })),
                    recommendation: 'Consider compressing, lazy loading, or code splitting these resources'
                });
            }
        }
        
        // Layout shift optimization
        if (summary.layoutShift && summary.layoutShift.latest.value > 0.1) {
            suggestions.push({
                type: 'layoutShift',
                priority: 'medium',
                description: `Cumulative Layout Shift: ${summary.layoutShift.latest.value.toFixed(3)}`,
                recommendation: 'Add size attributes to images and reserve space for dynamic content'
            });
        }
        
        return suggestions;
    }

    // Utility Methods
    isImportantResource(url) {
        const importantExtensions = ['.js', '.css', '.woff', '.woff2', '.jpg', '.png', '.webp'];
        return importantExtensions.some(ext => url.includes(ext)) || url.includes('components/');
    }

    calculateAverage(metrics, property = 'duration') {
        if (metrics.length === 0) return 0;
        const sum = metrics.reduce((total, metric) => {
            return total + (metric[property] || 0);
        }, 0);
        return sum / metrics.length;
    }

    calculateMin(metrics, property = 'duration') {
        if (metrics.length === 0) return 0;
        return Math.min(...metrics.map(m => m[property] || 0));
    }

    calculateMax(metrics, property = 'duration') {
        if (metrics.length === 0) return 0;
        return Math.max(...metrics.map(m => m[property] || 0));
    }

    calculateNavigationScore() {
        const navMetrics = this.metrics.get('navigation') || [];
        if (navMetrics.length === 0) return 100;
        
        const latest = navMetrics[navMetrics.length - 1];
        const loadTime = latest.duration;
        
        if (loadTime < 1000) return 100;
        if (loadTime < 2000) return 80;
        if (loadTime < 3000) return 60;
        if (loadTime < 5000) return 40;
        return 20;
    }

    calculateResourceScore() {
        const resourceMetrics = this.metrics.get('resource') || [];
        if (resourceMetrics.length === 0) return 100;
        
        const avgLoadTime = this.calculateAverage(resourceMetrics);
        
        if (avgLoadTime < 200) return 100;
        if (avgLoadTime < 500) return 80;
        if (avgLoadTime < 1000) return 60;
        if (avgLoadTime < 2000) return 40;
        return 20;
    }

    calculateFrameRateScore() {
        const frameRateMetrics = this.metrics.get('frameRate') || [];
        if (frameRateMetrics.length === 0) return 100;
        
        const avgFPS = this.calculateAverage(frameRateMetrics, 'fps');
        
        if (avgFPS >= 60) return 100;
        if (avgFPS >= 45) return 80;
        if (avgFPS >= 30) return 60;
        if (avgFPS >= 20) return 40;
        return 20;
    }

    calculateMemoryScore() {
        const memoryMetrics = this.metrics.get('memory') || [];
        if (memoryMetrics.length === 0) return 100;
        
        const latest = memoryMetrics[memoryMetrics.length - 1];
        const usagePercent = (latest.used / latest.limit) * 100;
        
        if (usagePercent < 50) return 100;
        if (usagePercent < 70) return 80;
        if (usagePercent < 85) return 60;
        if (usagePercent < 95) return 40;
        return 20;
    }

    calculateLayoutShiftScore() {
        const layoutShiftMetrics = this.metrics.get('layoutShift') || [];
        if (layoutShiftMetrics.length === 0) return 100;
        
        const totalShift = layoutShiftMetrics.reduce((total, metric) => total + metric.value, 0);
        
        if (totalShift < 0.1) return 100;
        if (totalShift < 0.15) return 80;
        if (totalShift < 0.25) return 60;
        if (totalShift < 0.4) return 40;
        return 20;
    }

    getPerformanceRating(score) {
        if (score >= 90) return 'Excellent';
        if (score >= 75) return 'Good';
        if (score >= 60) return 'Fair';
        if (score >= 40) return 'Poor';
        return 'Critical';
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Export/Import Methods
    exportMetrics() {
        const data = {
            timestamp: Date.now(),
            metrics: Object.fromEntries(this.metrics),
            summary: this.getMetricsSummary(),
            score: this.getPerformanceScore(),
            bottlenecks: this.getBottlenecks(),
            suggestions: this.getOptimizationSuggestions()
        };
        
        return JSON.stringify(data, null, 2);
    }

    importMetrics(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            this.metrics = new Map(Object.entries(data.metrics));
            return true;
        } catch (error) {
            console.error('Failed to import metrics:', error);
            return false;
        }
    }

    // Real-time Dashboard Data
    getDashboardData() {
        const score = this.getPerformanceScore();
        const bottlenecks = this.getBottlenecks();
        const memoryMetrics = this.metrics.get('memory') || [];
        const frameRateMetrics = this.metrics.get('frameRate') || [];
        
        return {
            score: score.overall,
            rating: score.rating,
            memory: memoryMetrics.length > 0 ? {
                used: this.formatBytes(memoryMetrics[memoryMetrics.length - 1].used),
                percent: ((memoryMetrics[memoryMetrics.length - 1].used / memoryMetrics[memoryMetrics.length - 1].limit) * 100).toFixed(1)
            } : null,
            fps: frameRateMetrics.length > 0 ? frameRateMetrics[frameRateMetrics.length - 1].fps : null,
            bottlenecks: bottlenecks.filter(b => b.severity === 'high').length,
            lastUpdate: Date.now()
        };
    }

    // Cleanup
    destroy() {
        this.stopMonitoring();
        this.metrics.clear();
        this.observers.clear();
        
        console.log('PerformanceMonitor destroyed');
    }
}

// Performance Optimization Utilities
class PerformanceOptimizer {
    static debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

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

    static lazy(callback, threshold = 0.1) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    callback(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold });
        
        return observer;
    }

    static preloadResource(url, type = 'script') {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        link.as = type;
        document.head.appendChild(link);
        return link;
    }

    static batchDOMUpdates(updates) {
        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                updates.forEach(update => update());
                resolve();
            });
        });
    }

    static measureExecutionTime(func, name = 'function') {
        return function(...args) {
            const start = performance.now();
            const result = func.apply(this, args);
            const end = performance.now();
            
            console.log(`${name} execution time: ${end - start}ms`);
            return result;
        };
    }

    static createResourcePool(createFn, resetFn, initialSize = 5) {
        const pool = [];
        
        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            pool.push(createFn());
        }
        
        return {
            acquire() {
                return pool.pop() || createFn();
            },
            
            release(item) {
                if (resetFn) resetFn(item);
                pool.push(item);
            },
            
            size() {
                return pool.length;
            }
        };
    }

    static optimizeImages(container) {
        const images = container.querySelectorAll('img');
        
        images.forEach(img => {
            // Add loading="lazy" if not set
            if (!img.hasAttribute('loading')) {
                img.loading = 'lazy';
            }
            
            // Add decode="async" for better performance
            img.decoding = 'async';
            
            // Add error handling
            img.addEventListener('error', () => {
                console.warn('Failed to load image:', img.src);
            });
        });
    }

    static enableGPUAcceleration(element) {
        element.style.transform = 'translateZ(0)';
        element.style.willChange = 'transform';
    }

    static disableGPUAcceleration(element) {
        element.style.transform = '';
        element.style.willChange = '';
    }
}

// Memory Management Utilities
class MemoryManager {
    constructor() {
        this.references = new WeakMap();
        this.cleanupCallbacks = new Set();
        this.memoryUsage = new Map();
    }

    track(object, name, size = 0) {
        this.references.set(object, { name, size, timestamp: Date.now() });
        
        if (size > 0) {
            this.memoryUsage.set(name, (this.memoryUsage.get(name) || 0) + size);
        }
    }

    untrack(object) {
        const info = this.references.get(object);
        if (info && info.size > 0) {
            this.memoryUsage.set(info.name, this.memoryUsage.get(info.name) - info.size);
        }
        this.references.delete(object);
    }

    addCleanupCallback(callback) {
        this.cleanupCallbacks.add(callback);
    }

    removeCleanupCallback(callback) {
        this.cleanupCallbacks.delete(callback);
    }

    cleanup() {
        this.cleanupCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Cleanup callback failed:', error);
            }
        });
        
        this.cleanupCallbacks.clear();
        this.memoryUsage.clear();
    }

    getMemoryUsage() {
        return Object.fromEntries(this.memoryUsage);
    }

    forceGarbageCollection() {
        if (window.gc) {
            window.gc();
        } else {
            console.warn('Garbage collection not available');
        }
    }
}

// Performance Testing Utilities
class PerformanceTester {
    static async testFunction(func, iterations = 1000, warmupIterations = 100) {
        // Warmup
        for (let i = 0; i < warmupIterations; i++) {
            await func();
        }
        
        // Test
        const times = [];
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            await func();
            const end = performance.now();
            times.push(end - start);
        }
        
        times.sort((a, b) => a - b);
        
        return {
            iterations,
            total: times.reduce((sum, time) => sum + time, 0),
            average: times.reduce((sum, time) => sum + time, 0) / times.length,
            median: times[Math.floor(times.length / 2)],
            min: times[0],
            max: times[times.length - 1],
            p95: times[Math.floor(times.length * 0.95)],
            p99: times[Math.floor(times.length * 0.99)]
        };
    }

    static benchmarkAnimations(element, animations, duration = 1000) {
        const results = {};
        
        return animations.reduce((promise, animation) => {
            return promise.then(() => {
                return new Promise((resolve) => {
                    const startTime = performance.now();
                    let frameCount = 0;
                    
                    element.style.animation = `${animation} ${duration}ms ease-in-out`;
                    
                    const measureFrame = () => {
                        frameCount++;
                        if (performance.now() - startTime < duration) {
                            requestAnimationFrame(measureFrame);
                        } else {
                            const fps = (frameCount * 1000) / duration;
                            results[animation] = Math.round(fps);
                            element.style.animation = '';
                            resolve();
                        }
                    };
                    
                    requestAnimationFrame(measureFrame);
                });
            });
        }, Promise.resolve()).then(() => results);
    }

    static measureDOMOperations(operations) {
        const results = {};
        
        operations.forEach(({ name, operation }) => {
            const start = performance.now();
            operation();
            const end = performance.now();
            results[name] = end - start;
        });
        
        return results;
    }

    static stressTest(testFunction, duration = 5000) {
        return new Promise((resolve) => {
            const results = {
                executionCount: 0,
                errors: 0,
                averageTime: 0,
                maxTime: 0,
                minTime: Infinity
            };
            
            const startTime = performance.now();
            let totalTime = 0;
            
            const runTest = () => {
                const testStart = performance.now();
                
                try {
                    testFunction();
                    const testEnd = performance.now();
                    const executionTime = testEnd - testStart;
                    
                    results.executionCount++;
                    totalTime += executionTime;
                    results.maxTime = Math.max(results.maxTime, executionTime);
                    results.minTime = Math.min(results.minTime, executionTime);
                    
                } catch (error) {
                    results.errors++;
                }
                
                if (performance.now() - startTime < duration) {
                    setTimeout(runTest, 0);
                } else {
                    results.averageTime = totalTime / results.executionCount;
                    resolve(results);
                }
            };
            
            runTest();
        });
    }
}

// Bundle size analyzer
class BundleAnalyzer {
    static analyzeLoadedResources() {
        const resources = performance.getEntriesByType('resource');
        const analysis = {
            totalSize: 0,
            byType: {},
            largest: [],
            summary: {}
        };
        
        resources.forEach(resource => {
            const size = resource.transferSize || resource.decodedBodySize || 0;
            const type = this.getResourceType(resource.name);
            
            analysis.totalSize += size;
            
            if (!analysis.byType[type]) {
                analysis.byType[type] = { count: 0, size: 0 };
            }
            
            analysis.byType[type].count++;
            analysis.byType[type].size += size;
            
            analysis.largest.push({
                name: resource.name,
                size: size,
                type: type,
                duration: resource.duration
            });
        });
        
        analysis.largest.sort((a, b) => b.size - a.size);
        analysis.largest = analysis.largest.slice(0, 10);
        
        analysis.summary = {
            totalResources: resources.length,
            totalSizeFormatted: this.formatBytes(analysis.totalSize),
            avgResourceSize: this.formatBytes(analysis.totalSize / resources.length)
        };
        
        return analysis;
    }
    
    static getResourceType(url) {
        if (url.includes('.js')) return 'JavaScript';
        if (url.includes('.css')) return 'CSS';
        if (url.includes('.png') || url.includes('.jpg') || url.includes('.gif') || url.includes('.webp')) return 'Image';
        if (url.includes('.woff') || url.includes('.woff2') || url.includes('.ttf')) return 'Font';
        if (url.includes('.html')) return 'HTML';
        return 'Other';
    }
    
    static formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Global instances
window.PerformanceMonitor = PerformanceMonitor;
window.PerformanceOptimizer = PerformanceOptimizer;
window.MemoryManager = MemoryManager;
window.PerformanceTester = PerformanceTester;
window.BundleAnalyzer = BundleAnalyzer;

// Auto-initialize performance monitoring if enabled
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    window.portfolioPerformanceMonitor = new PerformanceMonitor();
    window.portfolioMemoryManager = new MemoryManager();
    
    // Add global performance info to console
    console.log('🔧 Portfolio Performance Tools Available:');
    console.log('📊 window.portfolioPerformanceMonitor - Performance monitoring');
    console.log('🧠 window.portfolioMemoryManager - Memory management');
    console.log('⚡ PerformanceOptimizer - Optimization utilities');
    console.log('🧪 PerformanceTester - Testing utilities');
    console.log('📦 BundleAnalyzer - Bundle analysis');
}